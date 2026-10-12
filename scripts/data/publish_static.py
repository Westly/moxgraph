"""WBS 5: deterministic, complete static catalogue derived from the frozen baseline.

No network calls. The staging DB is read-only. Publish active.json last; never mutate
an existing immutable version. Full source stays in the WBS 1 ingestion pipeline.
"""
from collections import defaultdict
import gzip
import hashlib
import itertools
import json
from pathlib import Path
import sqlite3
import shutil
import zlib

ROOT = Path(__file__).resolve().parents[2]
BASE = 'scryfall-all-cards-20261011091913'
GENERATOR_VERSION = '1.0.1'

def packed(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode('utf-8')

def digest(data):
    return hashlib.sha256(data).hexdigest()

def file_digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024*1024), b''):
            h.update(block)
    return h.hexdigest()

def read(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))

def image(raw):
    values = json.loads(raw) if raw else {}
    return values.get('normal') or values.get('large') or values.get('small')

def immutable(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_bytes() != data:
        raise ValueError(f'Cannot replace immutable asset: {path}')
    path.write_bytes(data)

def main():
    source = read(f'data/manifests/{BASE}.json')
    event = read('data/curated/events/atlanta-2026.json')
    mappings = read('data/curated/artist-mappings.json')
    stats = read('reports/artists-atlanta-2026.json')
    columns = read('schemas/printing-columns.json')
    assert source['ingestion']['status'] == 'complete'
    assert mappings['card_snapshot_id'] == stats['card_snapshot_id'] == BASE
    assert mappings['event_snapshot_id'] == stats['event_snapshot_id'] == event['snapshot_id']
    assert stats['mapping_revision'] == mappings['mapping_revision']
    inputs = [Path(__file__), ROOT/'schemas/printing-columns.json', ROOT/'schemas/contracts.schema.json',
              ROOT/'data/curated/artist-mappings.json', ROOT/'data/curated/events/atlanta-2026.json',
              ROOT/'reports/artists-atlanta-2026.json', ROOT/f'data/manifests/{BASE}.json']
    input_hashes = {p.relative_to(ROOT).as_posix(): digest(p.read_bytes()) for p in inputs}
    version = 'v1-' + digest(packed(input_hashes))[:16]
    out = ROOT/'public/data'/version
    files = {}
    def save(path, value, kind, records):
        data = packed(value)
        immutable(out/path, data)
        files[path] = dict(sha256=digest(data), bytes=len(data), gzipBytes=len(gzip.compress(data, mtime=0)), records=records, kind=kind)

    dbpath = ROOT/f'data/staging/{BASE}.sqlite'
    assert file_digest(dbpath) == source['ingestion']['artifacts']['database']['sha256'], 'Frozen DB checksum changed'
    db = sqlite3.connect(dbpath.as_uri() + '?mode=ro', uri=True)
    db.row_factory = sqlite3.Row
    metadata = dict(db.execute('SELECT key,value FROM metadata'))
    assert metadata['snapshot_id'] == BASE and metadata['source_sha256'] == source['download']['sha256']
    faces = defaultdict(list)
    for f in db.execute('SELECT * FROM faces ORDER BY printing_id,face_index'):
        faces[f['printing_id']].append(dict(index=f['face_index'], name=f['name'], oracleId=f['oracle_id'],
            sourceArtistCredit=f['artist_credit'], artistIds=[f['artist_id']] if f['artist_id'] else [],
            illustrationId=f['illustration_id'], imageUrl=image(f['image_uris_json'])))
    tuples = defaultdict(list)
    artist_index = {i: [] for a in mappings['artists'] for i in a['scryfall_artist_ids']}
    set_compressors = {}
    set_sizes = {}
    prefix2 = {}
    languages = set()
    total = 0
    p2_current = None
    p2_compressor = None
    p2_raw = p2_gzip = p2_count = 0
    sql = '''SELECT id,oracle_id,name,printed_name,set_code,set_name,collector_number,lang,layout,
      category,paper,digital,finishes_json,games_json,artist_credit,artist_ids_json,illustration_id,image_uris_json,scryfall_uri
      FROM printings ORDER BY id'''
    for prefix, rows in itertools.groupby(db.execute(sql), key=lambda r: r['id'][:3]):
        shard = []
        for r in rows:
            fs = faces.get(r['id'], [])
            record = dict(id=r['id'], oracleIds=sorted({i for i in [r['oracle_id'], *[f['oracleId'] for f in fs]] if i}),
                name=r['name'], printedName=r['printed_name'], setCode=r['set_code'], setName=r['set_name'],
                collectorNumber=r['collector_number'], language=r['lang'], finishes=json.loads(r['finishes_json']),
                layout=r['layout'], games=json.loads(r['games_json']), paper=bool(r['paper']), digital=bool(r['digital']), category=r['category'],
                sourceArtistCredit=r['artist_credit'], artistIds=json.loads(r['artist_ids_json']),
                illustrationId=r['illustration_id'], imageUrl=image(r['image_uris_json']), scryfallUrl=r['scryfall_uri'], faces=fs)
            compact = [record[k] for k in columns]
            raw = packed(compact)
            shard.append(compact)
            tuples[r['set_code']].append([r['collector_number'], r['lang'], r['id']])
            credited = set(record['artistIds']) | {a for f in fs for a in f['artistIds']}
            for artist in credited:
                if artist not in artist_index:
                    raise ValueError(f'Artist reference missing: {artist}')
                artist_index[artist].append(r['id'])
            s = r['set_code']
            if s not in set_compressors:
                set_compressors[s] = zlib.compressobj(wbits=31)
                set_sizes[s] = dict(bytes=1, gzipBytes=0, records=0)
                set_sizes[s]['gzipBytes'] += len(set_compressors[s].compress(b'['))
            item = (b',' if set_sizes[s]['records'] else b'') + raw
            set_sizes[s]['bytes'] += len(item)
            set_sizes[s]['gzipBytes'] += len(set_compressors[s].compress(item))
            set_sizes[s]['records'] += 1
            if r['id'][:2] != p2_current:
                if p2_compressor:
                    p2_gzip += len(p2_compressor.compress(b']')) + len(p2_compressor.flush())
                    prefix2[p2_current] = dict(bytes=p2_raw+1, gzipBytes=p2_gzip, records=p2_count)
                p2_current = r['id'][:2]
                p2_compressor = zlib.compressobj(wbits=31)
                p2_raw, p2_gzip, p2_count = 1, len(p2_compressor.compress(b'[')), 0
            item = (b',' if p2_count else b'') + raw
            p2_raw += len(item)
            p2_gzip += len(p2_compressor.compress(item))
            p2_count += 1
            total += 1
            languages.add(r['lang'])
        save(f'printings/{prefix}.json', shard, 'printings', len(shard))
    prefix2[p2_current] = dict(bytes=p2_raw+1, gzipBytes=p2_gzip+len(p2_compressor.compress(b']'))+len(p2_compressor.flush()), records=p2_count)
    for s, compressor in set_compressors.items():
        set_sizes[s]['bytes'] += 1
        set_sizes[s]['gzipBytes'] += len(compressor.compress(b']')) + len(compressor.flush())
    del set_compressors
    assert total == source['ingestion']['stored_printings'] == db.execute('SELECT count(*) FROM printings').fetchone()[0]
    for s, values in sorted(tuples.items()):
        # Prefix set codes: CON (Conflux) is a reserved Windows device name.
        save(f'tuples/set-{s}.json', sorted(values), 'tuples', len(values))
    for aid, values in sorted(artist_index.items()):
        save(f'artist-index/{aid}.json', values, 'artist-index', len(values))
    artists = [dict(key=a['artist_key'], displayName=a['scryfall_artist_name'], sourceIds=a['scryfall_artist_ids'],
                    sourceNames=a['scryfall_name_variants'], kind=a['entity_kind']) for a in mappings['artists']]
    save('artists.json', artists, 'artists', len(artists))
    directory = dict(event=dict(id=event['event_id'], name=event['name'], startsAt=event['dates']['start'],
        endsAt=event['dates']['end'], location=event['location'], directoryUrl='https://mcatlanta.mtgfestivals.com/en-us/art-of-magic/artist-directory.html',
        snapshotId=event['snapshot_id'], retrievedAt=event['retrieved_through']), attendance=[], mappings=[], statistics=[])
    for a in event['attendees']:
        directory['attendance'].append(dict(id=a['event_attendee_id'], eventId=event['event_id'], rawName=a['display_name'],
            guestId=a['guest_id'], mappingId=a['event_attendee_id'], profileUrl=a['official_profile_url'],
            portraitUrl=a['portrait']['url'], portraitAttribution=a['portrait']['attribution'], booth=a['booth'],
            days=a['days_at_show'], status=a['attendance_status'], sourceUrls=[e['profile_url'] for e in a['source_entries']],
            links=[dict(id=f"{a['event_attendee_id']}-link-{i}", type=l['source_field'], platform=l['platform'],
                label=l['label'], originalUrl=l['published_href'], displayUrl=l['usable_url'], sourceProfileUrl=l['source_profile_url'],
                retrievedAt=event['retrieved_through']) for i,l in enumerate(a['links'])]))
    for m in mappings['event_mappings']:
        directory['mappings'].append(dict(id=m['mapping_id'], eventId=m['event_id'], attendanceId=m['event_attendee_id'],
            magicconNames=m['magiccon_names'], artistKeys=m['artist_keys'], sourceArtistIds=m['scryfall_artist_ids'],
            scryfallNames=m['scryfall_names'], status=m['status'], method=m['method'], evidenceUrls=m['evidence_urls'],
            reviewedAt=m['reviewed_at'], notes=m['notes']))
    for r in stats['rows']:
        directory['statistics'].append(dict(artistKey=r['artist_key'], snapshotId=BASE, scope=stats['scope'],
            uniqueCards=r['unique_cards_total'], printingEditions=r['printing_editions_total'], languagePrintings=r['language_printings_total'],
            uniqueArtworks=r['unique_artworks_total'], supplementalObjects=r['supplemental_objects_total'],
            missingOracleIds=r['missing_oracle_id_total'], missingIllustrations=r['missing_illustration_id_total']))
    save('event.json', directory, 'event', len(directory['attendance']))
    provenance = [dict(id=BASE, source='scryfall-all_cards', url=source['download']['url'], sourceUpdatedAt=source['source']['updated_at'],
        retrievedAt=source['download']['completed_at'], sha256=source['download']['sha256'], bytes=source['download']['bytes'],
        records=total, parserVersion=source['parser_version'], status='complete'),
        dict(id=event['snapshot_id'], source='magiccon-attendance', url=event['source_urls'][0], sourceUpdatedAt=None,
        retrievedAt=event['retrieved_through'], sha256=file_digest(ROOT/'data/curated/events/atlanta-2026.json'),
        bytes=(ROOT/'data/curated/events/atlanta-2026.json').stat().st_size, records=len(event['attendees']),
        parserVersion='1', status='complete')]
    save('sources.json', provenance, 'sources', len(provenance))
    manifest = dict(schemaVersion=1, version=version, cardSnapshotId=BASE, eventSnapshotId=event['snapshot_id'],
        sourceUpdatedAt=source['source']['updated_at'], eventRetrievedAt=event['retrieved_through'], mappingRevision=mappings['mapping_revision'],
        generatorVersion=GENERATOR_VERSION, uuidPrefixLength=3, printingColumns=columns,
        coverage=dict(printings=total, languages=len(languages), sets=len(tuples), artists=len(artists),
                      attendees=len(event['attendees']), faces=sum(map(len,faces.values()))), files=files)
    manifest_bytes = packed(manifest)
    immutable(out/'manifest.json', manifest_bytes)
    active = packed(dict(schemaVersion=1, version=version, manifestSha256=digest(manifest_bytes), manifestBytes=len(manifest_bytes)))
    # Validation/build checks gate deployment; active only changes after generation finishes.
    temp = ROOT/'public/data/active.tmp'
    temp.write_bytes(active)
    temp.replace(ROOT/'public/data/active.json')
    # Retain superseded generated versions locally, outside the deployable tree.
    data_root = (ROOT/'public/data').resolve()
    archive_root = (ROOT/'data/staging/static-versions').resolve()
    archive_root.mkdir(parents=True, exist_ok=True)
    for old in data_root.glob('v1-*'):
        if old.name == version or not old.is_dir():
            continue
        destination = archive_root/old.name
        assert old.resolve().is_relative_to(data_root)
        assert destination.resolve().is_relative_to(archive_root)
        if destination.exists():
            raise ValueError(f'Archive exists; inspect before replacing: {destination}')
        shutil.move(str(old), str(destination))
    from import_audit import mox_lines, arch_lines
    scenarios = []
    for filename, provider in [('moxfield-v2-3x55_3CFz060qxL2xac3NA.json','moxfield'),
                              ('moxfield-v2-zB7a13TqOUWlUZuylE905Q.json','moxfield'),('archidekt-19780118.json','archidekt')]:
        deck = read('tests/fixtures/import-feasibility/'+filename)
        lines = list(mox_lines(deck) if provider=='moxfield' else arch_lines(deck))
        ids = {r['id'] for r in lines}
        sets = {r['set'] for r in lines}
        paths = {f'printings/{i[:3]}.json' for i in ids}
        def summed(items):
            return {k:sum(d[k] for d in items) for k in ['bytes','gzipBytes']}
        scenarios.append(dict(fixture=filename, rows=len(lines), uuid3Files=len(paths),
            uuid3=summed([files[p] for p in paths]), uuid2=summed([prefix2[p] for p in {i[:2] for i in ids}]),
            fullSet=summed([set_sizes[s] for s in sets if s in set_sizes]),
            tupleIndexes=summed([files[f'tuples/set-{s}.json'] for s in sets if f'tuples/set-{s}.json' in files]),
            mainAndCommander=summed([files[p] for p in {f"printings/{r['id'][:3]}.json" for r in lines if r['section'] in ['mainboard','commanders']}]),
            bootstrap=summed([files['event.json'],files['artists.json'],dict(bytes=len(active)+len(manifest_bytes),
                gzipBytes=len(gzip.compress(active,mtime=0))+len(gzip.compress(manifest_bytes,mtime=0)))])))
    report = dict(schemaVersion=1, version=version, inputHashes=input_hashes, coverage=manifest['coverage'],
        outputFiles=len(files)+2, totalBytes=sum(f['bytes'] for f in files.values())+len(active)+len(manifest_bytes),
        maxAssetBytes=max(len(manifest_bytes), *(f['bytes'] for f in files.values())),
        maxDataShardBytes=max(f['bytes'] for f in files.values()), manifestBytes=len(manifest_bytes),
        manifestGzipBytes=len(gzip.compress(manifest_bytes,mtime=0)), scenarios=scenarios,
        selection='Three hexadecimal UUID characters; per-set tuple-to-ID indexes; all-artist reverse indexes. No optional name index.',
        compression='gzip estimates from actual encoded JSON, not measured network transfer; UUID2/full-set prototypes use zlib level 6',
        completeSourceRecords=total, retainedSource='Read-only full SQLite baseline; all languages and categories retained in published compact records')
    (ROOT/'reports/static-data-packaging.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    db.close()
    print(json.dumps({k:report[k] for k in ['version','coverage','outputFiles','totalBytes','maxAssetBytes','scenarios']},indent=2))

if __name__ == '__main__':
    main()
