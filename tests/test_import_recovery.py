"""Fail-closed checks for reviewed WBS 4 recovery evidence."""
import copy
import hashlib
import json
import sqlite3
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts/data'))
from import_recovery import resolve_reviewed_alias, assess_recovery, quantity_problems
from import_audit import FIXTURES, mox_lines


def read(name):
    return json.loads((FIXTURES/name).read_text(encoding='utf-8'))


class RecoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.aliases = json.loads((ROOT/'data/curated/printing-aliases.json').read_text(encoding='utf-8'))['aliases']
        cls.v2 = read('moxfield-v2-SbEkgxN4CEqiCG5B94rkkg.json')
        cls.v3 = read('moxfield-SbEkgxN4CEqiCG5B94rkkg.json')
        cls.owner = read('moxfield-v2-zB7a13TqOUWlUZuylE905Q.json')
        cls.signet = next(x for x in mox_lines(cls.owner) if x['name']=='Arcane Signet')
        # CI does not ship the raw staging database. Build the small lookup table
        # from independently captured Scryfall data, never from provider fields.
        active = json.loads((ROOT/'public/data/active.json').read_bytes())
        base = ROOT/'public/data'/active['version']
        raw = (base/'manifest.json').read_bytes()
        assert hashlib.sha256(raw).hexdigest() == active['manifestSha256']
        manifest = json.loads(raw)
        ids = {line['id'] for line in mox_lines(cls.v3)} | {a['target']['id'] for a in cls.aliases}
        ids.add('e96d398f-7393-4b8e-9972-2d7c394d23ad')  # Deliberately wrong alias target.
        cls.db = sqlite3.connect(':memory:')
        cls.db.execute('CREATE TABLE printings (id TEXT PRIMARY KEY, set_code TEXT, collector_number TEXT, lang TEXT, finishes_json TEXT, source_json TEXT)')
        for prefix in sorted({identity[:3] for identity in ids}):
            path = f'printings/{prefix}.json'
            raw = (base/path).read_bytes()
            assert hashlib.sha256(raw).hexdigest() == manifest['files'][path]['sha256']
            for values in json.loads(raw):
                card = dict(zip(manifest['printingColumns'], values))
                if card['id'] not in ids:
                    continue
                source = dict(id=card['id'], set=card['setCode'], collector_number=card['collectorNumber'],
                              lang=card['language'], finishes=card['finishes'], artist=card['sourceArtistCredit'],
                              artist_ids=card['artistIds'], illustration_id=card['illustrationId'])
                cls.db.execute('INSERT INTO printings VALUES (?,?,?,?,?,?)',
                               (card['id'], card['setCode'], card['collectorNumber'], card['language'],
                                json.dumps(card['finishes']), json.dumps(source)))
        assert cls.db.execute('SELECT count(*) FROM printings').fetchone()[0] == len(ids)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_reviewed_alias_preserves_source_and_selects_etched_variant(self):
        original=copy.deepcopy(self.signet)
        result=resolve_reviewed_alias(self.signet,'moxfield',self.db,self.aliases)
        self.assertEqual(result['resolvedId'],'7910ce6c-5cde-436e-8d28-62723f0fd592')
        self.assertEqual(result['artist'],'Gaboleps')
        self.assertTrue(result['artistIds'])
        self.assertEqual(result['source'],original)
        self.assertEqual(self.signet,original)
        self.assertEqual(self.db.execute('SELECT count(*) FROM printings WHERE id=?',(original['id'],)).fetchone()[0],0)

    def test_alias_requires_every_source_field_and_correct_provider(self):
        for key in self.aliases[0]['source']:
            modified={**self.signet,key:'different'}
            self.assertIsNone(resolve_reviewed_alias(modified,'moxfield',self.db,self.aliases))
        self.assertIsNone(resolve_reviewed_alias(self.signet,'archidekt',self.db,self.aliases))

    def test_changed_alias_target_needs_review(self):
        aliases=copy.deepcopy(self.aliases)
        aliases[0]['target']['id']='e96d398f-7393-4b8e-9972-2d7c394d23ad'
        with self.assertRaisesRegex(ValueError,'review required'):
            resolve_reviewed_alias(self.signet,'moxfield',self.db,aliases)

    def test_valid_v2_remains_primary(self):
        self.assertEqual(assess_recovery(self.owner,None,self.db),
                         {'status':'v2-valid','selectedApi':'v2','recoveryNeeded':False})

    def test_bad_v2_without_verified_recovery_stays_unresolved(self):
        r=assess_recovery(self.v2,None,self.db)
        self.assertEqual(r['status'],'needs-provider-recovery')
        self.assertIsNone(r['selectedApi'])

    def test_whole_snapshot_recovery_preserves_three_spirits_and_languages(self):
        r=assess_recovery(self.v2,self.v3,self.db)
        self.assertEqual((r['rows'],r['copies']),(975,975))
        self.assertEqual(r['languages'],{'en':719,'ja':255,'de':1})
        self.assertEqual(len({x['id'] for x in r['spiritPrintings']}),3)
        self.assertEqual([x['quantity'] for x in r['spiritPrintings']],[1,1,1])
        self.assertEqual(self.v2['mainboard']['Spirit']['quantity'],215)
        self.assertFalse(r['runtimeFallbackEnabled'])

    def test_different_or_missing_revision_cannot_be_recovery(self):
        for key in ('publicId','version','lastUpdatedAtUtc'):
            for value in (None,'different'):
                d={**self.v3,key:value}
                with self.assertRaisesRegex(ValueError,'same deck revision'):
                    assess_recovery(self.v2,d,self.db)

    def test_recovery_must_verify_selected_child_printing_and_finish(self):
        for key,value in [('scryfall_id','unknown'),('lang','xx')]:
            d=copy.deepcopy(self.v3)
            row=next(r for r in d['boards']['mainboard']['cards'].values() if r.get('printingData'))
            row['printingData'][0]['card'][key]=value
            with self.assertRaisesRegex(ValueError,'printing is not verified'):
                assess_recovery(self.v2,d,self.db)
        d=copy.deepcopy(self.v3)
        row=next(r for r in d['boards']['mainboard']['cards'].values() if r.get('printingData'))
        row['printingData'][0]['finish']='invented'
        with self.assertRaisesRegex(ValueError,'finish is not verified'):
            assess_recovery(self.v2,d,self.db)

    def test_invalid_quantities_are_not_counts(self):
        for value in (True,0,-1,1.5,'1'):
            d=copy.deepcopy(self.owner)
            d['mainboard']['Arcane Signet']['quantity']=value
            self.assertTrue(quantity_problems(d))


if __name__ == '__main__':
    unittest.main()
