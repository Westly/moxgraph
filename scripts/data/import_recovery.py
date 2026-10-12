"""Offline WBS 4 proofs: explicit legacy aliases and whole-snapshot recovery.

Does not fetch a deck, alter the baseline, or enable a runtime v3 fallback.
"""
import collections
import json
import sqlite3
from import_audit import ROOT, FIXTURES, DB, mox_boards, mox_lines


def resolve_reviewed_alias(line, provider, db, aliases):
    for item in aliases:
        if item['status'] != 'reviewed' or item['provider'] != provider:
            continue
        if not all(line.get(key) == value for key, value in item['source'].items()):
            continue
        target = item['target']
        row = db.execute('SELECT source_json FROM printings WHERE id=?', (target['id'],)).fetchone()
        if row is None:
            raise ValueError('Reviewed alias target absent from baseline')
        card = json.loads(row[0])
        actual = (card['set'], card['collector_number'], card['lang'], card['artist'], card['illustration_id'])
        expected = (target['set'], target['cn'], target['lang'], target['artist'], target['illustrationId'])
        if actual != expected or target['finish'] not in card['finishes']:
            raise ValueError('Reviewed alias target changed; review required')
        return {'source': dict(line), 'resolvedId': card['id'], 'artist': card['artist'],
                'artistIds': card['artist_ids'], 'resolution': 'reviewed-provider-alias',
                'notice': item['displayNotice']}
    return None


def quantity_problems(deck):
    problems = []
    for name, board in mox_boards(deck).items():
        total = 0
        if type(board['count']) is not int or board['count'] < 0:
            problems.append(f'{name}: invalid declared count')
        for row in board['cards'].values():
            qty = row['quantity']
            if type(qty) is not int or qty <= 0:
                problems.append(f'{name}: invalid quantity')
                continue
            children = row.get('printingData') or [row]
            if any(type(p['quantity']) is not int or p['quantity'] <= 0 for p in children):
                problems.append(f'{name}: invalid child quantity')
                continue
            count = sum(p['quantity'] for p in children)
            total += count
            if count != qty:
                problems.append(f'{name}: child/summary quantity mismatch')
        if total != board['count']:
            problems.append(f'{name}: {total} copies vs {board["count"]} declared')
    return problems


def assess_recovery(v2, v3, db):
    """Return a labelled, independently verified *whole* alternate snapshot.

    Never repair quantities or combine rows from different API snapshots.
    The app must present the source change explicitly if later implemented.
    """
    issues = quantity_problems(v2)
    if not issues:
        return {'status':'v2-valid', 'selectedApi':'v2', 'recoveryNeeded':False}
    if v3 is None:
        return {'status':'needs-provider-recovery', 'selectedApi':None, 'issues':issues}
    for key in ('publicId', 'version', 'lastUpdatedAtUtc'):
        if v2.get(key) is None or v2.get(key) != v3.get(key):
            raise ValueError('Snapshots are not the same deck revision')
    for name, board in mox_boards(v2).items():
        if board['count'] != mox_boards(v3).get(name, {}).get('count'):
            raise ValueError('Section counts changed between snapshots')
    if quantity_problems(v3):
        raise ValueError('Recovery snapshot quantities do not reconcile')
    lines = list(mox_lines(v3))
    languages = collections.Counter()
    for line in lines:
        row = db.execute('SELECT set_code,collector_number,lang,finishes_json FROM printings WHERE id=?', (line['id'],)).fetchone()
        if row is None or tuple(row[:3]) != (line['set'],line['cn'],line['lang']):
            raise ValueError('Recovery printing is not verified')
        if {'nonFoil':'nonfoil'}.get(line['finish'],line['finish']) not in json.loads(row[3]):
            raise ValueError('Recovery printing finish is not verified')
        languages[line['lang']] += 1
    return {'status':'verified-alternate-snapshot', 'selectedApi':'v3-research-candidate',
            'runtimeFallbackEnabled':False, 'recoveryNeeded':True, 'originalV2Issues':issues,
            'version':v3['version'], 'lastUpdatedAtUtc':v3['lastUpdatedAtUtc'],
            'rows':len(lines), 'copies':sum(x['quantity'] for x in lines), 'languages':dict(languages),
            'spiritPrintings':[x for x in lines if x['name']=='Spirit'],
            'notice':'Moxfield v2 supplied inconsistent quantities. A complete v3 snapshot of the same revision was verified separately; no rows or quantities were guessed or merged.'}


def main():
    aliases = json.loads((ROOT/'data/curated/printing-aliases.json').read_text(encoding='utf-8'))['aliases']
    read = lambda name: json.loads((FIXTURES/name).read_text(encoding='utf-8'))
    db = sqlite3.connect(DB.as_uri()+'?mode=ro',uri=True)
    owner = read('moxfield-v2-zB7a13TqOUWlUZuylE905Q.json')
    signet = next(x for x in mox_lines(owner) if x['name']=='Arcane Signet')
    v2 = read('moxfield-v2-SbEkgxN4CEqiCG5B94rkkg.json')
    v3 = read('moxfield-SbEkgxN4CEqiCG5B94rkkg.json')
    result = {'schemaVersion':1,'baseline':'scryfall-all-cards-20261011091913',
              'legacyPrinting':resolve_reviewed_alias(signet,'moxfield',db,aliases),
              'quantityRecovery':assess_recovery(v2,v3,db),
              'sourceAuditRetained':True,'frozenCatalogueModified':False}
    db.close()
    (ROOT/'reports/import-recovery-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Reviewed legacy alias:', result['legacyPrinting']['resolvedId'])
    print('Supplemental recovery:', result['quantityRecovery']['status'])


if __name__ == '__main__':
    main()
