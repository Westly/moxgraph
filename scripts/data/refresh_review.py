"""Reviewable source changes and guarded, recoverable local release promotion."""
from __future__ import annotations

import copy
from datetime import datetime, timedelta, timezone
import hashlib
import json
from pathlib import Path
import shutil


def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


def file_hash(path):
    if not path.exists():
        return None
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def within(root, relative):
    root = root.resolve()
    result = (root / relative).resolve()
    if result == root or not result.is_relative_to(root):
        raise ValueError('Path must stay inside the named workspace')
    # Reject directory links as well as final-component links before any move.
    p = root / relative
    while p != root:
        if p.is_symlink() or p.is_junction():
            raise ValueError('Linked paths are not allowed in release transactions')
        p = p.parent
    return result


def tree_hash(path):
    if not path.exists():
        return None
    return digest({p.relative_to(path).as_posix(): file_hash(p) for p in sorted(path.rglob('*')) if p.is_file()})


def timestamp():
    return datetime.now(timezone.utc).isoformat()


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + '.tmp')
    temp.write_bytes((json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode())
    temp.replace(path)


def names(artist):
    return sorted({x['raw_name'] for x in artist['observed_single_id_credits']})


def revalidate_printing_aliases(previous, snapshot, lookup):
    """Carry an existing exact-print exception only while every reviewed guard holds."""
    result = copy.deepcopy(previous)
    checks = []
    for alias in result['aliases']:
        if alias['status'] != 'reviewed':
            raise ValueError('Printing alias requires an explicit review')
        source, target = alias['source'], alias['target']
        if lookup(source['id']) is not None:
            raise ValueError('Historical source ID reappeared; review the printing alias before publication')
        card = lookup(target['id'])
        expected = {'id': target['id'], 'name': source['name'], 'set': target['set'],
                    'collector_number': target['cn'], 'lang': target['lang'],
                    'artist': target['artist'], 'illustration_id': target['illustrationId']}
        if (not card or any(card.get(k) != v for k,v in expected.items())
                or target['finish'] not in card.get('finishes', []) or 'paper' not in card.get('games', [])):
            raise ValueError('Reviewed printing alias target changed or disappeared: ' + target['id'])
        checks.append({'sourceId':source['id'], 'targetId':target['id'], 'expected':expected,
                       'finish':target['finish'], 'sourceStillAbsent':True, 'paper':True, 'status':'pass'})
    result.update(baseline=snapshot, validatedOn=timestamp())
    report = {'schemaVersion':1, 'previousBaseline':previous['baseline'], 'baseline':snapshot,
              'reviewedOn':previous['reviewedOn'], 'validatedOn':result['validatedOn'], 'checks':checks,
              'meaning':'Revalidated existing explicit target guards; original evidence/review date retained. No new alias inferred.'}
    return result, report


def carry_review(previous, event, catalogue, old_profiles, new_profiles):
    """Reuse exact, still-supported decisions; never approve a new name or UUID."""
    by_id = {a['scryfall_artist_id']: a for a in catalogue['artists']}
    previous_decisions = {d['magiccon_guest_id']: d for d in previous['decisions']}
    def bios(profiles):
        return {(p['kind'], p['published_fields']['id']):
                [p['profile_url'], p['published_fields'].get('bio'), p['published_fields'].get('description')]
                for p in profiles['profiles']}
    before, after = bios(old_profiles), bios(new_profiles)
    decisions, queue = [], []
    for attendee in event['attendees']:
        ident = attendee['guest_id']
        old = previous_decisions.get(ident) if ident else None
        reason = None
        if not old or old['status'] != 'verified':
            reason = 'No previously verified individual identity'
        elif old['expected_event_names'] != [e['display_name_raw'] for e in attendee['source_entries']]:
            reason = 'MagicCon names changed'
        elif any(i not in by_id or names(by_id[i]) != sorted(old['expected_scryfall_names'][i]) for i in old['scryfall_artist_ids']):
            reason = 'Scryfall identity or name observations changed'
        elif any(before.get((e['kind'], e['source_id'])) != after.get((e['kind'], e['source_id'])) for e in attendee['source_entries']):
            reason = 'Identity profile URL or biography changed'
        if reason:
            queue.append({'attendee_id': attendee['event_attendee_id'], 'guest_id': ident,
                          'name': attendee['display_name'], 'reason': reason})
            # New identities have no claimed UUIDs. Existing decisions are kept
            # only as a visible proposal to review, never as a verified match.
            decision = copy.deepcopy(old) if old else {
                'magiccon_guest_id': ident, 'scryfall_artist_ids': [], 'expected_scryfall_names': {},
                'evidence_urls': [attendee['official_profile_url']], 'method': 'needs_primary_evidence',
                'evidence_notes': reason,
            }
            decision.update(status='needs_review', reviewed_at=None,
                            expected_event_names=[e['display_name_raw'] for e in attendee['source_entries']])
        else:
            decision = copy.deepcopy(old)
            decision.setdefault('reviewed_at', previous['reviewed_at'])
        decisions.append(decision)
    return {**copy.deepcopy(previous), 'card_snapshot_id': catalogue['snapshot_id'],
            'event_snapshot_id': event['snapshot_id'], 'decisions': decisions,
            'carried_forward_from': {'card_snapshot_id': previous['card_snapshot_id'],
                                    'event_snapshot_id': previous['event_snapshot_id'],
                                    'review_sha256': digest(previous)},
            'carry_policy': 'Exact unchanged names, UUIDs, profile URLs and biographies only; original decision dates retained.'}, queue


def roster_changes(before, after):
    old = {a['event_attendee_id']: a for a in before['attendees']}
    new = {a['event_attendee_id']: a for a in after['attendees']}
    def links(a):
        fields = ['source_field', 'platform', 'label', 'published_href', 'overview_published_href', 'usable_url', 'status']
        return [{k: x.get(k) for k in fields} for x in a['links']]
    def selected(a):
        return {'names': [e['display_name_raw'] for e in a['source_entries']],
                'portrait': a['portrait']['url'], 'profile': a['official_profile_url'],
                'links': links(a), 'booth': a['booth'], 'days': a['days_at_show'], 'status': a['attendance_status']}
    changed = []
    for ident in sorted(old.keys() & new.keys()):
        a, b = selected(old[ident]), selected(new[ident])
        for field in a:
            if a[field] != b[field]:
                changed.append({'id': ident, 'name': new[ident]['display_name'], 'field': field, 'before': a[field], 'after': b[field]})
    return {'added': [{'id': i, 'name': new[i]['display_name']} for i in sorted(new.keys() - old.keys())],
            'removed': [{'id': i, 'name': old[i]['display_name']} for i in sorted(old.keys() - new.keys())],
            'changed': changed}


def make_diff(old_event, new_event, old_catalogue, new_catalogue, old_counts, new_counts, queue, old_printings, new_printings):
    roster = roster_changes(old_event, new_event)
    old_artists = {a['scryfall_artist_id']: names(a) for a in old_catalogue['artists']}
    new_artists = {a['scryfall_artist_id']: names(a) for a in new_catalogue['artists']}
    artist_names = [{'id': i, 'before': old_artists.get(i), 'after': new_artists.get(i)}
                    for i in sorted(old_artists.keys() | new_artists.keys()) if old_artists.get(i) != new_artists.get(i)]
    old_rows = {r['artist_key']: r for r in old_counts.get('rows', [])}
    metrics = ['unique_cards_total', 'printing_editions_total', 'language_printings_total', 'unique_artworks_total']
    changes = []
    for row in new_counts.get('rows', []):
        previous = old_rows.get(row['artist_key'])
        if not previous:
            continue
        for metric in metrics:
            a, b = previous[metric], row[metric]
            if a != b:
                material = a is None or b is None or b < a or abs(b-a) >= 10 or abs(b-a) / max(a, 1) >= .05
                changes.append({'artist_key': row['artist_key'], 'name': row['scryfall_artist_name'], 'metric': metric,
                                'before': a, 'after': b, 'material': material})
    blockers = []
    if not new_event['attendees'] or new_printings <= 0:
        blockers.append('Empty source data cannot be promoted')
    if queue:
        blockers.append('Unreviewed attendee identities require primary evidence and a rebuilt candidate')
    reasons = []
    if roster['removed']:
        reasons.append('Roster removals require an explanation backed by the official source; absence is not a cancellation claim')
    if new_printings < old_printings * .98:
        reasons.append('Printing coverage fell by more than 2%')
    if len(new_artists) < len(old_artists) * .98:
        reasons.append('Source artist coverage fell by more than 2%')
    if any(x['material'] for x in changes):
        reasons.append('Material counts changed: any decrease, at least 10, or at least 5%')
    result = {'schemaVersion': 1, 'before': {'cards': old_catalogue['snapshot_id'], 'event': old_event['snapshot_id']},
              'after': {'cards': new_catalogue['snapshot_id'], 'event': new_event['snapshot_id']},
              'coverage': {'beforePrintings': old_printings, 'afterPrintings': new_printings,
                           'beforeAttendees': len(old_event['attendees']), 'afterAttendees': len(new_event['attendees'])},
              'roster': roster, 'sourceArtistNames': artist_names, 'unmappedArtists': queue,
              'countChanges': changes, 'blockingErrors': blockers, 'reviewReasons': reasons,
              'policy': 'Every promotion requires this exact diff hash and review notes. Empty or unresolved candidates cannot be promoted.'}
    return {**result, 'sha256': digest(result)}


def review_markdown(report):
    def cell(value):
        return json.dumps(value, ensure_ascii=False).replace('|', '\\|').replace('<', '&lt;').replace('>', '&gt;')
    lines = ['# Data refresh review', '', f"Review SHA-256: `{report['sha256']}`", '',
             f"From `{report['before']['cards']}` / `{report['before']['event']}`", '',
             f"To `{report['after']['cards']}` / `{report['after']['event']}`", '',
             '## Publication gates', '', *['- ' + x for x in report['blockingErrors'] + report['reviewReasons']],
             '' if report['blockingErrors'] or report['reviewReasons'] else 'No exceptional drops or unresolved identities; review still required.', '',
             '## Roster changes', '', '| Change | Identity | Details |', '| --- | --- | --- |']
    for kind in ['added', 'removed', 'changed']:
        lines += [f"| {kind} | {cell(x.get('name'))} | {cell(x)} |" for x in report['roster'][kind]]
    lines += ['', '## Source identities and unmapped attendees', '', '| Kind | Details |', '| --- | --- |']
    for kind in ['sourceArtistNames', 'unmappedArtists']:
        lines += [f'| {kind} | {cell(x)} |' for x in report[kind]]
    lines += ['', '## Count changes', '', '| Artist | Metric | Before | After | Material |', '| --- | --- | ---: | ---: | --- |']
    lines += [f"| {cell(x['name'])} | {x['metric']} | {x['before']} | {x['after']} | {x['material']} |" for x in report['countChanges']]
    lines += ['', 'No row is marked canceled merely because it disappeared from a source. Original source names, URLs and biographies remain available in the candidate.', '']
    return '\n'.join(lines)


def check_review(report, reviewed_hash, note):
    content = {k: v for k, v in report.items() if k != 'sha256'}
    if digest(content) != report['sha256'] or reviewed_hash != report['sha256']:
        raise ValueError('Review hash is missing, stale or changed')
    if report['blockingErrors']:
        raise ValueError('; '.join(report['blockingErrors']))
    if not note or len(note.strip()) < 20:
        raise ValueError('Record an actual source-review explanation of at least 20 characters')


def promote_files(root, run, files, expected, candidate_data, expected_data, *, copier=shutil.copy2):
    """Stage backups first; journal each change and keep every displaced version.

    This is a local recoverable transaction. Only a later checked Git merge
    publishes remotely; Cloudflare performs the atomic static deployment.
    """
    root, run = root.resolve(), run.resolve()
    within(root, run.relative_to(root))
    journal_path = run / 'promotion.json'
    if journal_path.exists():
        raise ValueError('This run already has a promotion transaction; inspect/recover it first')
    for rel, source in files.items():
        target = within(root, rel)
        if file_hash(target) != expected[rel]:
            raise ValueError('Working release changed since preparation: ' + rel)
        if not source.is_file():
            raise ValueError('Candidate file missing: ' + rel)
    public_data = within(root, 'public/data')
    if tree_hash(public_data) != expected_data:
        raise ValueError('Published catalogue changed since preparation')
    backup, prepared = run / 'backup', run / 'prepared'
    prepared.mkdir(exist_ok=False)
    backup.mkdir(exist_ok=False)
    for rel, source in files.items():
        target = within(root, rel)
        dest = within(prepared, rel); dest.parent.mkdir(parents=True, exist_ok=True); copier(source, dest)
        if target.exists():
            dest = within(backup, rel); dest.parent.mkdir(parents=True, exist_ok=True); copier(target, dest)
    shutil.copytree(candidate_data, prepared / 'catalogue')
    journal = {'status': 'prepared', 'files': {}, 'oldDataHash': expected_data, 'newDataHash': tree_hash(prepared/'catalogue'),
               'dataMoveStarted': False, 'dataMoved': False, 'createdAt': timestamp()}
    write(journal_path, journal)
    try:
        for rel in files:
            target = within(root, rel)
            journal['files'][rel] = {'before': expected[rel], 'after': file_hash(prepared/rel), 'started': True}
            write(journal_path, journal)
            target.parent.mkdir(parents=True, exist_ok=True)
            copier(prepared / rel, target)
        journal['dataMoveStarted'] = True; write(journal_path, journal)
        # Every recursive move is checked against the explicit workspace/run roots.
        within(root, 'public/data').rename(within(run, 'backup/catalogue'))
        within(run, 'prepared/catalogue').rename(within(root, 'public/data'))
        journal.update(dataMoved=True, status='promoted'); write(journal_path, journal)
    except BaseException:
        recover(root, run, interrupted=True)
        raise
    return journal


def recover(root, run, *, interrupted=False):
    root, run = root.resolve(), run.resolve()
    within(root, run.relative_to(root))
    path = run / 'promotion.json'; journal = read(path)
    if journal['status'] == 'recovered':
        return
    if journal['status'] not in {'prepared', 'promoted'}:
        raise ValueError('Unknown transaction state')
    # Never replace independent edits made after a completed promotion.
    if not interrupted:
        for rel, item in journal['files'].items():
            if file_hash(within(root, rel)) not in {item['before'], item['after']}:
                raise ValueError('Local edits prevent automatic recovery: ' + rel)
        if (run/'backup/catalogue').exists() and tree_hash(root/'public/data') not in {None, journal['newDataHash']}:
            raise ValueError('Local catalogue edits prevent automatic recovery')
    displaced = within(run, 'displaced'); displaced.mkdir(exist_ok=False)
    for rel, item in journal['files'].items():
        target = within(root, rel)
        if target.exists():
            dest = within(displaced, rel); dest.parent.mkdir(parents=True, exist_ok=True); target.rename(dest)
        if item['before'] is not None:
            target.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(within(run, 'backup/'+rel), target)
    if (run/'backup/catalogue').exists():
        if (root/'public/data').exists():
            within(root, 'public/data').rename(within(run, 'displaced/catalogue'))
        within(run, 'backup/catalogue').rename(within(root, 'public/data'))
    journal.update(status='recovered', recoveredAt=timestamp()); write(path, journal)


def archive_event(root, label, *, at=None):
    from pipeline_config import load
    settings = load(root); event = settings['event']; at = at or datetime.now(timezone.utc)
    if label not in {'as-of', 'pre-event', 'post-event'}:
        raise ValueError('Unknown archive checkpoint')
    start = datetime.fromisoformat(event['dates']['start']).replace(tzinfo=timezone.utc)
    end = datetime.fromisoformat(event['dates']['end']).replace(tzinfo=timezone.utc)
    if label == 'pre-event' and not start-timedelta(days=7) <= at < start:
        raise ValueError('Final pre-event checkpoint is only available in the week before the event')
    if label == 'post-event' and at < end + timedelta(days=1, hours=12):
        raise ValueError('Post-event checkpoint must wait until after the event (next day 12:00 UTC)')
    source = read(root/f"data/curated/events/{event['id']}.json")
    if source['snapshot_id'] != event['snapshot']:
        raise ValueError('Configured and curated event revisions differ')
    if label == 'pre-event' and at-datetime.fromisoformat(source['retrieved_through'].replace('Z','+00:00')) > timedelta(days=2):
        raise ValueError('Final pre-event review requires an event capture less than 48 hours old')
    for rel in ['data/curated/artist-match-review.json', 'data/curated/artist-mappings.json',
                f"reports/artists-{event['id']}.json"]:
        linked = read(root/rel)
        if linked['card_snapshot_id'] != settings['cardSnapshot'] or linked['event_snapshot_id'] != event['snapshot']:
            raise ValueError('Archive inputs mix source revisions: ' + rel)
    if read(root/'reports/magiccon-browser-audit.json')['snapshot_id'] != event['snapshot']:
        raise ValueError('Archive browser evidence is from a different snapshot')
    paths = [f"data/curated/events/{event['id']}.json", f"data/sources/events/{event['id']}-profiles.json",
             'data/curated/artist-match-review.json', 'data/curated/artist-mappings.json',
             f"reports/artists-{event['id']}.json", 'reports/magiccon-browser-audit.json',
             f"data/manifests/{event['snapshot']}.json", f"data/manifests/{settings['cardSnapshot']}.json"]
    manifest = {'schemaVersion': 1, 'eventId': event['id'], 'snapshot': event['snapshot'],
                'cardSnapshot': settings['cardSnapshot'], 'checkpoint': label,
                'sourceRetrievedAt': source['retrieved_through'], 'files': {p:file_hash(root/p) for p in paths}}
    if None in manifest['files'].values():
        raise ValueError('Archive source file missing')
    dest = within(root, f"data/history/events/{event['id']}/{event['snapshot']}-{label}")
    if dest.exists():
        previous = read(dest/'archive.json')
        if any(previous.get(k) != v for k,v in manifest.items()) or any(file_hash(dest/p) != h for p,h in manifest['files'].items()):
            raise ValueError('Historical archive is immutable; do not replace it')
        return dest
    dest.mkdir(parents=True)
    for rel in paths:
        target = within(dest, rel); target.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(root/rel, target)
    write(dest/'archive.json', {**manifest, 'archivedAt': at.isoformat(),
                              'meaning': 'Preserved dated source state, not proof of physical attendance or a new scrape.'})
    return dest
