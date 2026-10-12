"""Maintenance failure boundaries; no network, bulk source or credentials needed."""
import copy
from datetime import datetime, timezone
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'scripts/data'))
import refresh
from refresh_review import (archive_event, carry_review, check_review, file_hash, make_diff,
                            promote_files, read, recover, revalidate_printing_aliases, roster_changes, tree_hash, within, write)


def attendee(ident='1'):
    return {'guest_id': ident, 'event_attendee_id': 'event-'+ident, 'display_name': 'Artist '+ident,
            'source_entries': [{'kind':'guest', 'source_id':ident, 'display_name_raw':'Artist '+ident}],
            'portrait': {'url':'https://example.com/photo.jpg'}, 'official_profile_url':'https://example.com/'+ident,
            'links': [{'platform':'instagram','usable_url':'https://instagram.com/example'}],
            'booth':'1', 'days_at_show':['Friday'], 'attendance_status':'listed'}


def catalogue():
    return {'snapshot_id':'cards-new', 'artists':[{'scryfall_artist_id':'uuid',
            'observed_single_id_credits':[{'raw_name':'Artist 1'}]}]}


class ReviewTests(unittest.TestCase):
    def setUp(self):
        self.event = {'snapshot_id':'event-new', 'attendees':[attendee()]}
        self.previous = {'card_snapshot_id':'cards-old', 'event_snapshot_id':'event-old', 'reviewed_at':'2026-10-11',
            'decisions':[{'magiccon_guest_id':'1', 'status':'verified', 'scryfall_artist_ids':['uuid'],
                'expected_event_names':['Artist 1'], 'expected_scryfall_names':{'uuid':['Artist 1']},
                'evidence_notes':'An individually reviewed identity', 'evidence_urls':['https://example.com/1']}]}
        self.profiles = {'profiles':[{'kind':'guest', 'profile_url':'https://example.com/1',
                                     'published_fields':{'id':'1', 'bio':'An illustrator'}}]}

    def carry(self, event=None, cat=None, profiles=None):
        return carry_review(self.previous, event or self.event, cat or catalogue(), self.profiles, profiles or self.profiles)

    def test_unchanged_identity_retains_original_date_and_references(self):
        reviewed, queue = self.carry()
        self.assertEqual(queue, [])
        self.assertEqual(reviewed['event_snapshot_id'], 'event-new')
        self.assertEqual(reviewed['decisions'][0]['reviewed_at'], '2026-10-11')
        self.assertNotIn('reviewed_at', self.previous['decisions'][0])

    def test_changed_name_uuid_profile_and_biography_require_review(self):
        event = copy.deepcopy(self.event); event['attendees'][0]['source_entries'][0]['display_name_raw'] = 'New Name'
        cat = catalogue(); cat['artists'][0]['scryfall_artist_id'] = 'different-uuid'
        renamed = catalogue(); renamed['artists'][0]['observed_single_id_credits'].append({'raw_name':'Alias'})
        profile = copy.deepcopy(self.profiles); profile['profiles'][0]['published_fields']['bio'] = 'Changed evidence'
        url = copy.deepcopy(self.profiles); url['profiles'][0]['profile_url'] = 'https://example.com/another'
        for kwargs in [{'event':event}, {'cat':cat}, {'cat':renamed}, {'profiles':profile}, {'profiles':url}]:
            with self.subTest(kwargs=kwargs):
                review, queue = self.carry(**kwargs)
                self.assertEqual(len(queue), 1)
                self.assertEqual(review['decisions'][0]['status'], 'needs_review')
                self.assertIsNone(review['decisions'][0]['reviewed_at'])

    def test_new_attendee_has_no_invented_artist_identity(self):
        self.event['attendees'].append(attendee('2'))
        review, queue = self.carry()
        self.assertEqual(queue[0]['guest_id'], '2')
        self.assertEqual(review['decisions'][1]['scryfall_artist_ids'], [])

    def test_removals_names_portraits_and_socials_are_visible(self):
        before = {'attendees':[attendee(),attendee('2')]}; after = {'attendees':[attendee(),attendee('3')]}
        after['attendees'][0]['portrait']['url'] = 'https://example.com/new.jpg'
        after['attendees'][0]['links'][0]['usable_url'] = 'https://instagram.com/new'
        after['attendees'][0]['source_entries'][0]['display_name_raw'] = 'Alias'
        diff = roster_changes(before, after)
        self.assertEqual(diff['removed'][0]['id'], 'event-2')
        self.assertEqual(diff['added'][0]['id'], 'event-3')
        self.assertEqual({x['field'] for x in diff['changed']}, {'portrait','links','names'})
        self.assertEqual(before['attendees'][1]['attendance_status'], 'listed')

    def diff(self, *, empty=False, queue=None, count=100):
        after = copy.deepcopy(self.event)
        if empty: after['attendees'] = []
        row = {'artist_key':'uuid', 'scryfall_artist_name':'Artist 1', 'unique_cards_total':100,
               'printing_editions_total':100, 'language_printings_total':100, 'unique_artworks_total':100}
        return make_diff(self.event, after, catalogue(), catalogue(), {'rows':[row]},
                         {'rows':[{**row,'unique_cards_total':count}]}, queue or [], 100, 90)

    def test_empty_or_unmapped_candidate_cannot_be_approved(self):
        for report in [self.diff(empty=True), self.diff(queue=[{'reason':'new identity'}])]:
            with self.assertRaisesRegex(ValueError, 'Empty|Unreviewed'):
                check_review(report, report['sha256'], 'Official-source review completed for this candidate')

    def test_drop_requires_notes_and_exact_diff_approval(self):
        report = self.diff(count=99)
        self.assertTrue(report['countChanges'][0]['material'])
        self.assertIn('Printing coverage fell by more than 2%', report['reviewReasons'])
        with self.assertRaises(ValueError): check_review(report, report['sha256'], '')
        with self.assertRaises(ValueError): check_review(report, 'old approval', 'Explained source change after review')
        check_review(report, report['sha256'], 'Explained source correction checked against the official release')
        report['coverage']['afterPrintings'] = 1
        with self.assertRaises(ValueError): check_review(report, report['sha256'], 'Explained source correction checked against the official release')


class PromotionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name); self.run = self.root/'data/staging/refresh/run'
        self.run.mkdir(parents=True); self.candidate = self.run/'workspace'
        write(self.root/'data/release.json', {'value':'old'})
        write(self.root/'public/data/active.json', {'version':'old'})
        write(self.candidate/'data/release.json', {'value':'new'})
        write(self.candidate/'public/data/active.json', {'version':'new'})
        self.files = {'data/release.json':self.candidate/'data/release.json'}
        self.expected = {'data/release.json':file_hash(self.root/'data/release.json')}
        self.old_data = tree_hash(self.root/'public/data')

    def promote(self, **kwargs):
        return promote_files(self.root, self.run, self.files, self.expected, self.candidate/'public/data', self.old_data, **kwargs)

    def assert_old(self):
        self.assertEqual(read(self.root/'data/release.json')['value'], 'old')
        self.assertEqual(tree_hash(self.root/'public/data'), self.old_data)

    def test_target_edits_block_promotion(self):
        write(self.root/'data/release.json', {'value':'independent edit'})
        with self.assertRaisesRegex(ValueError, 'changed since'): self.promote()
        self.assertFalse((self.run/'promotion.json').exists())

    def test_catalogue_edits_block_promotion(self):
        write(self.root/'public/data/extra.json', {})
        with self.assertRaisesRegex(ValueError, 'catalogue changed'): self.promote()

    def test_failure_during_preparation_does_not_touch_release(self):
        def fail(*args): raise OSError('Disk unavailable')
        with self.assertRaises(OSError): self.promote(copier=fail)
        self.assert_old()

    def test_partial_file_write_restores_old_release_and_keeps_evidence(self):
        def fail(source, target):
            if target == self.root/'data/release.json':
                target.write_bytes(b'partial'); raise OSError('Interrupted copy')
            return shutil.copy2(source, target)
        with self.assertRaises(OSError): self.promote(copier=fail)
        self.assert_old()
        self.assertEqual((self.run/'displaced/data/release.json').read_bytes(), b'partial')
        self.assertEqual(read(self.run/'promotion.json')['status'], 'recovered')

    def test_failure_between_directory_moves_restores_release(self):
        original = Path.rename
        def fail(path, target):
            if path == self.run/'prepared/catalogue': raise OSError('Interrupted directory move')
            return original(path, target)
        with patch.object(Path, 'rename', fail), self.assertRaises(OSError): self.promote()
        self.assert_old()

    def test_completed_promotion_can_be_recovered_without_deleting_versions(self):
        self.promote()
        self.assertEqual(read(self.root/'public/data/active.json')['version'], 'new')
        recover(self.root, self.run); recover(self.root, self.run)
        self.assert_old()
        self.assertEqual(read(self.run/'displaced/catalogue/active.json')['version'], 'new')

    def test_recovery_refuses_to_overwrite_subsequent_user_changes(self):
        self.promote(); write(self.root/'data/release.json', {'value':'independent edit'})
        with self.assertRaisesRegex(ValueError, 'Local edits'): recover(self.root, self.run)
        self.assertEqual(read(self.root/'data/release.json')['value'], 'independent edit')

    def test_paths_cannot_escape_or_target_root(self):
        for value in ['../outside', '.', self.root.parent]:
            with self.subTest(value=value), self.assertRaises(ValueError): within(self.root, value)


class ArchiveAndCacheTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.settings = read(ROOT/'data/pipeline.json'); event = self.settings['event']; self.event = event
        write(self.root/'data/pipeline.json', self.settings)
        revisions = {'card_snapshot_id':self.settings['cardSnapshot'], 'event_snapshot_id':event['snapshot']}
        for rel in ['data/curated/artist-match-review.json','data/curated/artist-mappings.json', f"reports/artists-{event['id']}.json"]:
            write(self.root/rel, revisions)
        write(self.root/f"data/curated/events/{event['id']}.json", {'snapshot_id':event['snapshot'],'retrieved_through':'2026-11-12T12:00:00+00:00'})
        for rel in [f"data/sources/events/{event['id']}-profiles.json", f"data/manifests/{event['snapshot']}.json",f"data/manifests/{self.settings['cardSnapshot']}.json"]:
            write(self.root/rel, {})
        write(self.root/'reports/magiccon-browser-audit.json', {'snapshot_id':event['snapshot']})

    def at(self, day): return datetime.fromisoformat(day).replace(tzinfo=timezone.utc)

    def test_archive_preserves_dated_bytes_and_is_immutable(self):
        saved = archive_event(self.root, 'as-of')
        self.assertEqual(saved, archive_event(self.root, 'as-of'))
        original = read(saved/'archive.json')
        write(self.root/'data/curated/artist-mappings.json', {**read(self.root/'data/curated/artist-mappings.json'),'edited':True})
        with self.assertRaisesRegex(ValueError, 'immutable'): archive_event(self.root, 'as-of')
        self.assertEqual(read(saved/'archive.json'), original)

    def test_date_checkpoints_do_not_claim_future_work(self):
        with self.assertRaisesRegex(ValueError, 'week before'): archive_event(self.root, 'pre-event', at=self.at('2026-10-12'))
        with self.assertRaisesRegex(ValueError, 'after the event'): archive_event(self.root, 'post-event', at=self.at('2026-11-15T23:00:00'))
        self.assertTrue(archive_event(self.root, 'pre-event', at=self.at('2026-11-12T20:00:00')).exists())
        self.assertTrue(archive_event(self.root, 'post-event', at=self.at('2026-11-16T12:01:00')).exists())

    def test_old_or_mixed_snapshot_blocks_final_archive(self):
        path = self.root/f"data/curated/events/{self.event['id']}.json"
        write(path, {**read(path),'retrieved_through':'2026-11-01T12:00:00+00:00'})
        with self.assertRaisesRegex(ValueError, '48 hours'): archive_event(self.root, 'pre-event', at=self.at('2026-11-12'))
        write(self.root/'reports/magiccon-browser-audit.json', {'snapshot_id':'different'})
        with self.assertRaisesRegex(ValueError, 'different snapshot'): archive_event(self.root, 'as-of')

    def test_verified_completed_manifest_reuses_cache_without_network(self):
        relative = 'data/manifests/test.json'; raw = 'data/raw/cards.gz'; database = 'data/staging/cards.sqlite'
        cached = self.root/'data/staging/refresh/old/workspace'; candidate = self.root/'data/staging/refresh/new/workspace'
        write(cached/raw, {'cards':1}); write(cached/database, {'database':1})
        pending = {'snapshot_id':'same', 'download':{'url':'https://data.scryfall.io/same.gz','path':raw,'expected_bytes':10},'ingestion':{'status':'pending'}}
        complete = copy.deepcopy(pending)
        complete['download'].update(status='complete', bytes=(cached/raw).stat().st_size, sha256=file_hash(cached/raw))
        complete['ingestion'] = {'status':'complete','artifacts':{'database':{'path':database, 'bytes':(cached/database).stat().st_size,'sha256':file_hash(cached/database)}}}
        write(cached/relative, complete); write(candidate/relative,pending)
        with patch.object(refresh, 'ROOT', self.root): selected = refresh.reuse_manifest(candidate, candidate/relative)
        self.assertEqual(selected['ingestion']['status'], 'complete')
        self.assertEqual(file_hash(candidate/database), file_hash(cached/database))
        self.assertEqual(file_hash(candidate/raw), file_hash(cached/raw))


class PrintingAliasTests(unittest.TestCase):
    def setUp(self):
        self.aliases = read(ROOT/'data/curated/printing-aliases.json')
        alias = self.aliases['aliases'][0]; self.target = alias['target']; self.source = alias['source']
        self.card = {'id':self.target['id'], 'name':self.source['name'], 'set':self.target['set'],
                     'collector_number':self.target['cn'], 'lang':self.target['lang'], 'artist':self.target['artist'],
                     'illustration_id':self.target['illustrationId'], 'finishes':[self.target['finish']], 'games':['paper']}

    def test_existing_exception_retains_evidence_and_original_review_date(self):
        value, report = revalidate_printing_aliases(self.aliases, 'new-snapshot', lambda ident:self.card if ident==self.target['id'] else None)
        self.assertEqual(value['reviewedOn'], self.aliases['reviewedOn'])
        self.assertEqual(value['aliases'], self.aliases['aliases'])
        self.assertEqual(value['baseline'], 'new-snapshot')
        self.assertEqual(report['checks'][0]['status'], 'pass')

    def test_changed_target_is_never_accepted_by_similar_name(self):
        for field, value in [('id','other'),('name','other'),('set','other'),('collector_number','1F'),('lang','ja'),
                             ('artist','Another Artist'),('illustration_id','other'),('finishes',['foil']),('games',['arena'])]:
            with self.subTest(field=field), self.assertRaisesRegex(ValueError, 'target changed'):
                revalidate_printing_aliases(self.aliases,'new',lambda ident:{**self.card,field:value} if ident==self.target['id'] else None)
        with self.assertRaisesRegex(ValueError, 'target changed'):
            revalidate_printing_aliases(self.aliases,'new',lambda ident:None)

    def test_returned_historical_id_requires_new_review(self):
        with self.assertRaisesRegex(ValueError, 'reappeared'):
            revalidate_printing_aliases(self.aliases,'new',lambda ident:self.card)


if __name__ == '__main__': unittest.main()
