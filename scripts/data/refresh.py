"""Manual, staged data refresh. No scheduler, automatic Git commit or deployment.

prepare -> record fresh browser evidence -> build -> inspect diff -> promote
The working release stays unchanged until an explicit reviewed promotion.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import shutil
import sqlite3
import subprocess
import sys

from pipeline_config import ROOT, load
from refresh_review import (archive_event, carry_review, check_review, digest, file_hash, make_diff,
                            promote_files, read, recover, revalidate_printing_aliases, review_markdown, timestamp, tree_hash, within, write)


def tracked_paths(root):
    result = subprocess.run(['git', 'ls-files', '-z', '--cached', '--others', '--exclude-standard'],
                            cwd=root, capture_output=True, check=True)
    return sorted(set(p for p in result.stdout.decode().split('\0') if p))


def generated_paths(settings):
    event = settings['event']; ident = event['id']; cards = settings['cardSnapshot']
    return ['data/pipeline.json', f'data/manifests/{cards}.json',
            f'data/manifests/{event["snapshot"]}.json', f'data/manifests/artist-statistics-{ident}.json',
            f'data/catalogues/{cards}-artists.json', f'data/curated/events/{ident}.json',
            f'data/curated/events/{ident}-identity-review.json', f'data/sources/events/{ident}-profiles.json',
            'data/curated/artist-match-review.json', 'data/curated/artist-mappings.json', 'data/curated/printing-aliases.json',
            'tests/fixtures/scryfall-printings.json', 'src/demo/deck.json',
            *['reports/'+p for p in ['card-data-quality.json', 'card-data-quality.md', 'magiccon-browser-audit.json',
                'attendance-coverage.json', 'attendance-coverage.md', 'artist-match-candidates.json', 'joint-credit-audit.json',
                'artists-all.json', 'artists-all.csv', f'artists-{ident}.json', f'artists-{ident}.csv',
                'artist-discrepancies.json', 'artist-statistics-audit.json', 'artist-validation.json',
                'artist-reconciliation.md', 'static-data-packaging.json', 'data-refresh-diff.json', 'data-refresh-diff.md',
                'printing-alias-validation.json']]]


def source_fingerprints(root, paths):
    # Data/demo outputs change during the candidate build; all other executable
    # source, schemas, lockfiles and tests must still be the inspected versions.
    return {p:file_hash(root/p) for p in paths if
            (p.startswith(('scripts/', 'src/', 'schemas/', 'tests/', 'tools/')) or p in {'package.json', 'package-lock.json'})
            and p not in {'src/demo/deck.json', 'tests/fixtures/scryfall-printings.json'}}


def check_run(path):
    result = within(ROOT, Path(path).resolve().relative_to(ROOT))
    if not result.is_relative_to((ROOT/'data/staging/refresh').resolve()) or not (result/'state.json').is_file():
        raise ValueError('Expected a recorded run inside data/staging/refresh')
    return result


def command(args, cwd, label, timeout=1800):
    print(f'[{label}]', flush=True)
    subprocess.run(args, cwd=cwd, check=True, timeout=timeout)


def copy_file(source, target):
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)


def seed_sources(candidate, manifest):
    """Only exact-hash local artifacts may satisfy a cached capture/ingestion."""
    locations = [ROOT, *sorted((ROOT/'data/staging/refresh').glob('*/workspace'), reverse=True)]
    descriptors = [manifest['download'], *manifest.get('ingestion', {}).get('artifacts', {}).values()]
    for item in descriptors:
        if 'sha256' not in item:
            continue
        dest = within(candidate, item['path'])
        if file_hash(dest) == item['sha256']:
            continue
        for base in locations:
            source = within(base, item['path'])
            if source == dest or not source.is_file() or source.stat().st_size != item['bytes']:
                continue
            if file_hash(source) == item['sha256']:
                copy_file(source, dest)
                print('Verified cached artifact: ' + item['path'], flush=True)
                break


def reuse_manifest(candidate, manifest_path):
    """Reuse completed metadata for the same immutable source, never by name alone."""
    selected = read(manifest_path)
    relative = manifest_path.relative_to(candidate)
    if selected.get('ingestion', {}).get('status') != 'complete':
        for base in [ROOT, *sorted((ROOT/'data/staging/refresh').glob('*/workspace'), reverse=True)]:
            cached_path = within(base, relative)
            if cached_path == manifest_path or not cached_path.is_file():
                continue
            cached = read(cached_path)
            if (cached['snapshot_id'] == selected['snapshot_id']
                    and cached['download']['url'] == selected['download']['url']
                    and cached['download'].get('expected_bytes') == selected['download'].get('expected_bytes')
                    and cached.get('ingestion', {}).get('status') == 'complete'):
                write(manifest_path, cached)
                selected = cached
                break
    seed_sources(candidate, selected)
    return selected


def prepare(offline=False):
    if shutil.disk_usage(ROOT).free < 12 * 1024**3:
        raise ValueError('A full staged refresh needs at least 12 GiB of free local disk')
    run = within(ROOT, 'data/staging/refresh/' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ'))
    candidate, baseline = run/'workspace', run/'baseline'
    candidate.mkdir(parents=True, exist_ok=False); baseline.mkdir()
    paths = tracked_paths(ROOT)
    originals = {}
    for rel in paths:
        if rel.startswith(('public/data/', 'data/history/', 'reports/screenshots/')):
            continue
        source = within(ROOT, rel)
        if not source.is_file():
            continue
        originals[rel] = file_hash(source)
        copy_file(source, within(candidate, rel))
        if rel.startswith(('data/', 'reports/')):
            copy_file(source, within(baseline, rel))
    state = {'schemaVersion': 1, 'createdAt': timestamp(), 'status': 'preparing', 'mode': 'offline-replay' if offline else 'live',
             'originalHashes': originals, 'originalDataHash': tree_hash(ROOT/'public/data'),
             'sourceHashes': source_fingerprints(ROOT, paths), 'stages': []}
    write(run/'state.json', state)
    print('Run: ' + str(run), flush=True)
    try:
        settings = load(candidate)
        if not offline:
            # Discover in the isolated candidate; a repeated source snapshot is
            # seeded from a verified local cache before fetching anything large.
            from scryfall_source import discover
            card_manifest = discover(candidate)
            settings['cardSnapshot'] = read(card_manifest)['snapshot_id']; write(candidate/'data/pipeline.json', settings)
        reuse_manifest(candidate, candidate/f"data/manifests/{settings['cardSnapshot']}.json")
        if offline:
            event_manifest = read(candidate/f"data/manifests/{settings['event']['snapshot']}.json")
            for meta in event_manifest['sources'] + [x[k] for x in event_manifest['profiles'] for k in ['page', 'data']]:
                source = within(ROOT, meta['path'])
                if file_hash(source) != meta['sha256']:
                    raise ValueError('Offline replay requires the captured event raw files')
                copy_file(source, within(candidate, meta['path']))
        command([sys.executable, str(candidate/'scripts/data/refresh.py'), '_capture', '--offline'] if offline else
                [sys.executable, str(candidate/'scripts/data/refresh.py'), '_capture'], candidate, 'cards then attendance')
    except BaseException as error:
        state = read(run/'state.json'); state.update(status='capture_failed', error=str(error)); write(run/'state.json', state)
        raise
    print('Working release unchanged. Record the new rendered roster evidence, then run build --run "' + str(run) + '".', flush=True)
    return run


def capture_worker(offline):
    # This command runs from the copied script: ROOT is the candidate workspace.
    from scryfall_source import download
    from scryfall_catalogue import build as ingest
    from magiccon_source import collect
    settings = load(); run = ROOT.parent; state = read(run/'state.json')
    card_path = ROOT/f"data/manifests/{settings['cardSnapshot']}.json"
    if not offline:
        download(card_path)
    manifest = read(card_path)
    db = manifest.get('ingestion', {}).get('artifacts', {}).get('database')
    if (not db or file_hash(within(ROOT, db['path'])) != db['sha256']
            or manifest['ingestion'].get('parser_sha256') != file_hash(ROOT/'scripts/data/scryfall_catalogue.py')):
        ingest(card_path, rebuild=bool(db and within(ROOT, db['path']).exists()))
    else:
        print('Verified completed card ingestion; reusing its exact database.', flush=True)
    state['stages'].append({'stage': 'cards', 'completedAt': timestamp(), 'snapshot': settings['cardSnapshot']})
    write(run/'state.json', state)
    event_path = ROOT/f"data/manifests/{settings['event']['snapshot']}.json" if offline else collect()
    settings['event']['snapshot'] = read(event_path)['snapshot_id']; write(ROOT/'data/pipeline.json', settings)
    state.update(status='awaiting_browser_review', cardSnapshot=settings['cardSnapshot'], eventSnapshot=settings['event']['snapshot'])
    state['stages'].append({'stage': 'attendance_capture', 'completedAt': timestamp(), 'snapshot': settings['event']['snapshot']})
    write(run/'state.json', state)
    print(json.dumps({'status': state['status'], 'eventSnapshot': state['eventSnapshot'],
                      'browserEvidence': str(ROOT/'reports/magiccon-browser-audit.json')}, indent=2), flush=True)


def diff_for(candidate, baseline, queue, with_counts):
    old, new = load(baseline), load(candidate)
    ident = new['event']['id']
    if old['event']['id'] != ident:
        raise ValueError('A different event needs its own review baseline; do not replace Atlanta silently')
    old_cm = read(baseline/f"data/manifests/{old['cardSnapshot']}.json")
    new_cm = read(candidate/f"data/manifests/{new['cardSnapshot']}.json")
    report = make_diff(read(baseline/f'data/curated/events/{ident}.json'), read(candidate/f'data/curated/events/{ident}.json'),
        read(baseline/f"data/catalogues/{old['cardSnapshot']}-artists.json"), read(candidate/f"data/catalogues/{new['cardSnapshot']}-artists.json"),
        read(baseline/'reports/artists-all.json'), read(candidate/'reports/artists-all.json') if with_counts else {}, queue,
        old_cm['ingestion']['stored_printings'], new_cm['ingestion']['stored_printings'])
    write(candidate/'reports/data-refresh-diff.json', report)
    (candidate/'reports/data-refresh-diff.md').write_bytes(review_markdown(report).encode('utf-8'))
    return report


def build_worker():
    from magiccon_catalogue import build as curate
    from artist_reconciliation import build as reconcile
    from artist_statistics import build as statistics
    from artist_reports import verify
    from publish_static import main as package
    settings = load(); run = ROOT.parent; state = read(run/'state.json'); ident = settings['event']['id']
    state.update(status='building'); write(run/'state.json', state)
    # Shrink can be represented in the isolated candidate, but promotion always
    # requires the digest of the resulting removals report and an explanation.
    curate(ROOT/f"data/manifests/{settings['event']['snapshot']}.json", allow_roster_shrink=True)
    state['stages'].append({'stage': 'attendance_validation', 'completedAt': timestamp()})
    previous = read(run/'baseline/data/curated/artist-match-review.json')
    review_path = ROOT/'data/curated/artist-match-review.json'
    current = read(review_path)
    if current['card_snapshot_id'] != settings['cardSnapshot'] or current['event_snapshot_id'] != settings['event']['snapshot']:
        review, queue = carry_review(previous, read(ROOT/f'data/curated/events/{ident}.json'),
            read(ROOT/f"data/catalogues/{settings['cardSnapshot']}-artists.json"),
            read(run/f'baseline/data/sources/events/{ident}-profiles.json'), read(ROOT/f'data/sources/events/{ident}-profiles.json'))
        write(review_path, review)
    else:
        queue = [{'guest_id': d['magiccon_guest_id'], 'reason': 'Identity review still unresolved'} for d in current['decisions'] if d['status'] != 'verified']
    if queue:
        report = diff_for(ROOT, run/'baseline', queue, False)
        state.update(status='awaiting_identity_review', reviewHash=report['sha256']); write(run/'state.json', state)
        print(json.dumps({'status': state['status'], 'unmapped': queue}, indent=2), flush=True)
        return 2
    card_manifest = read(ROOT/f"data/manifests/{settings['cardSnapshot']}.json")
    database = within(ROOT, card_manifest['ingestion']['artifacts']['database']['path'])
    with sqlite3.connect(f'file:{database.as_posix()}?mode=ro', uri=True) as db:
        def lookup(ident):
            row = db.execute('SELECT source_json FROM printings WHERE id=?', (ident,)).fetchone()
            return json.loads(row[0]) if row else None
        aliases, alias_report = revalidate_printing_aliases(read(ROOT/'data/curated/printing-aliases.json'), settings['cardSnapshot'], lookup)
    write(ROOT/'data/curated/printing-aliases.json', aliases)
    write(ROOT/'reports/printing-alias-validation.json', alias_report)
    reconcile(); statistics(); verify(write_csv=True)
    state['stages'].append({'stage': 'reconciliation_and_counts', 'completedAt': timestamp()})
    report = diff_for(ROOT, run/'baseline', [], True)
    package()
    demo_path = ROOT/'src/demo/deck.json'; demo = read(demo_path)
    demo['dataVersion'] = read(ROOT/'public/data/active.json')['version']; write(demo_path, demo)
    state.update(status='awaiting_validation', reviewHash=report['sha256']); write(run/'state.json', state)
    return 0


def build(run, browser_audit=None):
    candidate = run/'workspace'; state = read(run/'state.json')
    if state['status'] not in {'awaiting_browser_review', 'awaiting_identity_review', 'build_failed', 'awaiting_validation', 'ready_for_review'}:
        raise ValueError('Run has no complete capture ready to build')
    for rel, value in state['sourceHashes'].items():
        if file_hash(ROOT/rel) != value:
            raise ValueError('Source changed after prepare; start a new run or restore the prepared code: ' + rel)
    if browser_audit:
        copy_file(browser_audit, candidate/'reports/magiccon-browser-audit.json')
    try:
        result = subprocess.run([sys.executable, str(candidate/'scripts/data/refresh.py'), '_build'], cwd=candidate, timeout=1800)
        if result.returncode == 2:
            print('Identity review required; see the candidate diff. Working release unchanged.'); return 2
        result.check_returncode()
        command(['npm.cmd' if os.name == 'nt' else 'npm', 'run', 'verify'], candidate, 'full candidate release gate')
        state = read(run/'state.json')
        outputs = generated_paths(load(candidate))
        state.update(status='ready_for_review', validatedAt=timestamp(),
                     outputHashes={rel:file_hash(candidate/rel) for rel in outputs},
                     candidateDataHash=tree_hash(candidate/'public/data'))
        if None in state['outputHashes'].values():
            raise ValueError('Required candidate output missing')
        write(run/'state.json', state)
        print(json.dumps({'status': state['status'], 'reviewHash': state['reviewHash'],
                          'reviewFile': str(candidate/'reports/data-refresh-diff.md')}, indent=2), flush=True)
    except BaseException as error:
        state = read(run/'state.json'); state.update(status='build_failed', error=str(error)); write(run/'state.json', state)
        raise
    return 0


def promote(run, reviewed_hash, note):
    candidate = run/'workspace'; state = read(run/'state.json')
    if state['status'] != 'ready_for_review':
        raise ValueError('A complete passing candidate is required')
    report = read(candidate/'reports/data-refresh-diff.json'); check_review(report, reviewed_hash, note)
    for rel, expected in state['sourceHashes'].items():
        if file_hash(ROOT/rel) != expected:
            raise ValueError('Source changed since validation: ' + rel)
    for rel, expected in state['outputHashes'].items():
        if file_hash(candidate/rel) != expected:
            raise ValueError('Candidate changed after validation: ' + rel)
    if tree_hash(candidate/'public/data') != state['candidateDataHash']:
        raise ValueError('Candidate catalogue changed after validation')
    outputs = {rel: candidate/rel for rel in state['outputHashes']}
    receipt = {'schemaVersion': 1, 'preparedAt': state['createdAt'], 'validatedAt': state['validatedAt'],
               'promotedAt': timestamp(), 'mode': state['mode'], 'reviewHash': reviewed_hash, 'reviewNotes': note,
               'sourceRevisions': report['after'], 'dataVersion': read(candidate/'public/data/active.json')['version'],
               'stages': state['stages'], 'publication': 'Local promotion only; checked Git merge required for deployment.'}
    write(run/'receipt.json', receipt); outputs['reports/data-refresh-validation.json'] = run/'receipt.json'
    expected = {rel:state['originalHashes'].get(rel) for rel in outputs}
    promote_files(ROOT, run, outputs, expected, candidate/'public/data', state['originalDataHash'])
    state.update(status='promoted'); write(run/'state.json', state)
    print('Promoted locally with a recoverable journal. Inspect git diff, run npm run verify, then use the normal checked PR release.', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    prepare_parser = sub.add_parser('prepare'); prepare_parser.add_argument('--offline', action='store_true')
    builder = sub.add_parser('build'); builder.add_argument('--run', type=Path, required=True); builder.add_argument('--browser-audit', type=Path)
    promoter = sub.add_parser('promote'); promoter.add_argument('--run', type=Path, required=True)
    promoter.add_argument('--review', required=True); promoter.add_argument('--note', required=True)
    recovery = sub.add_parser('recover'); recovery.add_argument('--run', type=Path, required=True)
    archiver = sub.add_parser('archive'); archiver.add_argument('--checkpoint', choices=['as-of', 'pre-event', 'post-event'], default='as-of')
    capture = sub.add_parser('_capture', help=argparse.SUPPRESS); capture.add_argument('--offline', action='store_true')
    sub.add_parser('_build', help=argparse.SUPPRESS)
    args = parser.parse_args()
    if args.command in {'_capture', '_build'}:
        if ROOT.name != 'workspace' or not (ROOT.parent/'state.json').exists() or ROOT.parent.parent.name != 'refresh':
            raise ValueError('Internal stages may only run inside a prepared isolated refresh workspace')
        return capture_worker(args.offline) if args.command == '_capture' else build_worker()
    if args.command == 'prepare':
        prepare(args.offline)
    elif args.command == 'archive':
        print(archive_event(ROOT, args.checkpoint))
    else:
        run = check_run(args.run)
        if args.command == 'build':
            return build(run, args.browser_audit)
        if args.command == 'promote':
            promote(run, args.review, args.note)
        elif args.command == 'recover':
            recover(ROOT, run); state = read(run/'state.json'); state.update(status='recovered'); write(run/'state.json', state)
            print('Previous local release restored. Every displaced file remains in the run directory.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
