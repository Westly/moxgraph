"""Failure boundaries and real-source regression cases for WBS 2."""
import copy
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts/data"))
import magiccon_catalogue as catalogue
from magiccon_source import feed, profile_url, select_guests, validate_source_url

FIXTURE = Path(__file__).parent / "fixtures/magiccon-profiles.json"


class MagicConTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.profiles = json.loads(FIXTURE.read_text(encoding="utf-8"))["profiles"]

    def profile(self, ident):
        return next(p for p in self.profiles if p["published_fields"]["id"] == ident)

    def test_public_category_selection_does_not_include_unlisted_people(self):
        art = {"id": "1", "publicly_visible": True, "global_categories": [{"name": "Art of Magic"}]}
        private = {**art, "id": "2", "publicly_visible": False}
        unrelated = {**art, "id": "3", "global_categories": [{"name": "Creator"}]}
        self.assertEqual(["1"], [r["id"] for r in select_guests([art, private, unrelated], "Art of Magic")])

    def test_feed_schema_pagination_and_duplicate_ids_fail_closed(self):
        base = {"event_name": "MagicCon: Atlanta 2026", "event_id": "21389", "event_slug": "fixture", "people": [{"id": "1"}]}
        for value in [{**base, "next": "page2"}, {**base, "people": [{"id": "1"}, {"id": "1"}]}, {**base, "event_name": "Other Event"}]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                feed(json.dumps(value), "people")

    def test_downloader_rejects_unrelated_or_credential_urls(self):
        for url in ["http://mcatlanta.mtgfestivals.com", "https://evil.example/api", "https://user:pw@conventions.leapevent.tech/api/people", "https://conventions.leapevent.tech:444/api"]:
            with self.subTest(url=url), self.assertRaises(ValueError):
                validate_source_url(url)

    def test_unsafe_and_mislabeled_links_are_never_usable(self):
        for value in ["javascript:alert(1)", "data:text/html,x", "https://user@example.com", "@teanwitch", "https://example.com "]:
            self.assertEqual("malformed_url", catalogue.link_status(value))
        self.assertEqual("platform_mismatch", catalogue.link_status("https://www.lenarichards.com", "instagram"))

    def test_real_david_profile_keeps_social_label_and_destination(self):
        p = self.profile("379894")
        links = catalogue.extract_links(p["published_fields"], "guest", p)
        self.assertEqual(1, len(links))
        self.assertEqual("Follow on Instagram", links[0]["label"])
        self.assertEqual("https://www.instagram.com/dvpalumbo/", links[0]["usable_url"])
        self.assertNotIn("PlayMTG", json.dumps(links))

    def test_real_handles_remain_unresolved_without_guessing(self):
        p = self.profile("379927")
        links = catalogue.extract_links(p["published_fields"], "guest", p)
        self.assertEqual(["@teanwitch", "@tean_witch "], [l["source_value"] for l in links])
        self.assertTrue(all(l["usable_url"] is None for l in links))

    def test_valid_overview_url_is_retained_when_profile_href_is_relative(self):
        p = self.profile("379930")
        link = catalogue.extract_links(p["published_fields"], "guest", p)[0]
        self.assertEqual("www.instagram.com/kelogsloops", link["published_href"])
        self.assertEqual("http://www.instagram.com/kelogsloops", link["usable_url"])
        self.assertEqual("overview", link["usable_url_source"])

    def test_real_source_slug_with_quotes_matches_rendered_link(self):
        p = self.profile("379934")
        url = profile_url(p["published_fields"], "guest", {"guestsPage": "/en-us/art-of-magic/artist-profile.html"})
        self.assertTrue(url.endswith("gtID=379934&guest-name=Olena-and-quotLena-and-quot-Richards"))

    def test_duplicate_event_names_require_unique_identity(self):
        g = {"id": "1", "first_name": "Same", "last_name": "Person"}
        es = [{"id": "2", "company": "Same Person"}, {"id": "3", "company": "same person"}]
        with self.assertRaisesRegex(ValueError, "Ambiguous"):
            catalogue.deduplicate([g], es, [])

    def test_similar_names_and_studios_are_not_silently_merged(self):
        g = {"id": "1", "first_name": "Cynthia", "last_name": "Sheppard"}
        es = [{"id": "2", "company": "Cynthia Shepard"}, {"id": "3", "company": "Example Studio"}]
        pairs = catalogue.deduplicate([g], es, [])
        self.assertEqual(3, len(pairs))
        self.assertEqual("exhibitor_only_identity_unreviewed", pairs[-1][2]["method"])

    def test_reviewed_pair_fails_when_biography_evidence_changes(self):
        g = self.profile("378578")["published_fields"]
        e = self.profile("668804")["published_fields"]
        review = {"guest_id": g["id"], "exhibitor_id": e["id"], "guest_name": "Cynthia Sheppard", "exhibitor_name": "Cynthia Shepard", "required_guest_bio_text": "Cynthia Sheppard is a Seattle-area artist", "required_exhibitor_bio_text": "Cynthia Sheppard is a Seattle-area artist", "evidence": "same opening bio"}
        self.assertEqual(1, len(catalogue.deduplicate([g], [e], [review])))
        changed = {**e, "description": "A different person"}
        with self.assertRaisesRegex(ValueError, "evidence changed"):
            catalogue.deduplicate([g], [changed], [review])

    def test_failed_capture_preserves_existing_curated_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            sentinel = root / "data/curated/events/atlanta-2026.json"
            sentinel.parent.mkdir(parents=True)
            sentinel.write_text("last good snapshot", encoding="utf-8")
            manifest = root / "failed.json"
            manifest.write_text('{"status":"failed"}', encoding="utf-8")
            with patch.object(catalogue, "ROOT", root), self.assertRaises(ValueError):
                catalogue.build(manifest)
            self.assertEqual("last good snapshot", sentinel.read_text(encoding="utf-8"))

    def test_changed_raw_file_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "data.json").write_bytes(b"tampered")
            with patch.object(catalogue, "ROOT", root), self.assertRaisesRegex(ValueError, "Checksum mismatch"):
                catalogue.read_verified({"path": "data.json", "bytes": 8, "sha256": "wrong"})


if __name__ == "__main__":
    unittest.main()
