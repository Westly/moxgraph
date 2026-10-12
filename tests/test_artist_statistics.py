import copy
import csv
import io
import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts/data"))
from artist_reconciliation import check_review, norm
from artist_statistics import Statistics, category, edition, event_row
from artist_reports import csv_bytes, csv_cell


def card(pid="p1", **overrides):
    return {"id": pid, "name": "Example", "oracle_id": "o1", "set": "tst", "collector_number": "1",
            "lang": "en", "layout": "normal", "type_line": "Creature — Test", "games": ["paper"],
            "artist_ids": ["a"], "artist": "Artist A", "illustration_id": "art1", **overrides}


def count(*cards):
    s = Statistics(["a", "b", "unused"])
    for c in cards:
        s.add(c)
    return s


class CountingTests(unittest.TestCase):
    def test_translations_share_edition_but_changed_art_does_not(self):
        s = count(card(), card("p2", lang="ja"), card("p3", lang="zhs", illustration_id="art2"))
        t = s.totals(["a"])
        self.assertEqual((t["unique_cards_total"], t["printing_editions_total"], t["language_printings_total"], t["unique_artworks_total"]), (1, 2, 3, 2))

    def test_credit_and_collector_suffix_changes_are_new_editions(self):
        s = count(card(), card("p2", artist_ids=["a", "b"]), card("p3", collector_number="1★"))
        self.assertEqual(s.totals(["a"])["printing_editions_total"], 3)
        self.assertNotEqual(edition(card())[0], edition(card(layout="modal_dfc"))[0])

    def test_finish_does_not_create_an_extra_edition(self):
        s = count(card(finishes=["nonfoil", "foil", "etched"]))
        self.assertEqual(s.totals(["a"])["printing_editions_total"], 1)

    def test_missing_artwork_never_merges_languages(self):
        s = count(card(illustration_id=None), card("p2", lang="ja", illustration_id=None))
        t = s.totals(["a"])
        self.assertEqual((t["printing_editions_total"], t["unique_artworks_total"], t["missing_illustration_id_total"], t["edition_fallback_printings_total"]), (2, 0, 2, 2))

    def test_joint_credit_names_are_never_split_or_zipped(self):
        s = count(card(artist="Artist B / Artist A & A studio, inc.", artist_ids=["a", "b"]))
        self.assertEqual(s.totals(["a"]), s.totals(["b"]))
        self.assertEqual(s.totals(["a", "b"])["unique_cards_total"], 1)

    def test_distinct_faces_do_not_share_the_other_artists_artwork(self):
        c = card(layout="transform", illustration_id=None, artist_ids=["a", "b"], card_faces=[
            {"artist_id": "a", "illustration_id": "art1"}, {"artist_id": "b", "illustration_id": "art2"}])
        s = count(c)
        self.assertEqual(s.data["a"]["unique_artworks_total"], {"art1"})
        self.assertEqual(s.data["b"]["unique_artworks_total"], {"art2"})
        self.assertEqual(s.totals(["a"])["unique_cards_total"], 1)

    def test_reversible_oracles_are_attributed_per_face(self):
        s = count(card(layout="reversible_card", oracle_id=None, illustration_id=None, artist_ids=["a", "b"], card_faces=[
            {"artist_id": "a", "illustration_id": "art1", "oracle_id": "o1", "type_line": "Creature"},
            {"artist_id": "b", "illustration_id": "art2", "oracle_id": "o2", "type_line": "Creature"}]))
        self.assertEqual(s.data["a"]["unique_cards_total"], {"o1"})
        self.assertEqual(s.data["b"]["unique_cards_total"], {"o2"})
        self.assertEqual(s.totals(["a"])["missing_oracle_id_total"], 0)

    def test_reversible_tokens_remain_supplemental(self):
        s = count(card(layout="reversible_card", oracle_id=None, type_line=None, card_faces=[
            {"artist_id": "a", "oracle_id": "token1", "type_line": "Token Creature"},
            {"artist_id": "a", "oracle_id": "token1", "type_line": "Token Creature"}]))
        self.assertEqual(s.totals(["a"])["unique_cards_total"], 0)
        self.assertEqual(s.totals(["a"])["supplemental_objects_total"], 1)

    def test_shared_image_secondary_face_without_art_is_not_a_gap(self):
        s = count(card(layout="split", card_faces=[{"artist_id": "a", "illustration_id": "art1"}, {"artist_id": "a"}]))
        t = s.totals(["a"])
        self.assertEqual(t["unique_artworks_total"], 1)
        self.assertEqual(t["missing_illustration_id_total"], 0)
        self.assertEqual(t["edition_fallback_printings_total"], 0)

    def test_unknown_face_credit_remains_unknown(self):
        s = count(card(layout="transform", illustration_id=None, artist_ids=["a", "b"], card_faces=[
            {"artist_id": "a", "illustration_id": "art1"}, {"illustration_id": "art2"}]))
        self.assertEqual(s.totals(["b"])["unique_artworks_total"], 0)
        self.assertEqual(s.totals(["b"])["artwork_attribution_gap_printings_total"], 1)

    def test_digital_and_supplemental_do_not_enter_game_counts(self):
        s = count(card(games=["arena"], digital=True), card("p2", layout="art_series"), card("p3", type_line="Dungeon"))
        t = s.totals(["a"])
        self.assertEqual((t["unique_cards_total"], t["supplemental_objects_total"], t["digital_only_printings_total"], t["all_records_total"]), (0, 2, 1, 3))

    def test_special_game_types_remain_eligible(self):
        for typ in ["Conspiracy", "Artifact — Attraction", "Artifact — Contraption", "Eaturecray — Igpay", "Summon Dragon"]:
            self.assertEqual(category(card(type_line=typ)), "game_card")
        for layout in ["planar", "scheme", "vanguard", "front_card"]:
            self.assertNotEqual(category(card(layout=layout)), "game_card")

    def test_missing_oracle_is_reported_not_invented(self):
        s = count(card(oracle_id=None))
        self.assertEqual(s.totals(["a"])["unique_cards_total"], 0)
        self.assertEqual(s.totals(["a"])["missing_oracle_id_total"], 1)

    def test_missing_credit_and_verified_zero_are_distinct(self):
        s = count(card(artist_ids=[], artist=None))
        self.assertEqual(len(s.gaps["credit_missing"]), 1)
        self.assertEqual(s.totals(["unused"])["unique_cards_total"], 0)

    def test_unresolved_attendee_is_retained_with_null_counts(self):
        root = Path(__file__).resolve().parents[1]
        a = json.loads((root / "data/curated/events/atlanta-2026.json").read_text(encoding="utf-8"))["attendees"][0]
        m = {"status": "needs_review", "scryfall_artist_ids": [], "artist_keys": [], "event_id": "atlanta-2026",
             "method": "unresolved", "reviewed_at": None, "notes": "Unknown", "evidence_urls": []}
        r = event_row(a, m, {"a": {"source_updated_at": "2026-10-11"}}, count())
        self.assertIsNone(r["unique_cards_total"])
        self.assertEqual(r["magiccon_guest_id"], a["guest_id"])

    def test_changed_names_invalidate_review(self):
        a = {"source_entries": [{"display_name_raw": "Artist A"}]}
        b = {"a": {"observed_single_id_credits": [{"raw_name": "Artist A", "observations": 1}]}}
        r = {"status": "verified", "expected_event_names": ["Artist A"], "scryfall_artist_ids": ["a"],
             "evidence_notes": "Reviewed", "evidence_urls": ["https://example.com/"], "expected_scryfall_names": {"a": ["Artist A"]}}
        self.assertEqual(check_review(a, b, r), ["a"])
        changed = copy.deepcopy(a)
        changed["source_entries"][0]["display_name_raw"] = "Artist B"
        with self.assertRaises(ValueError):
            check_review(changed, b, r)
        self.assertNotEqual(norm("Tomas"), norm("Tom"))


class RealPrintingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixture = json.loads((Path(__file__).parent / "fixtures/artist-counting.json").read_text(encoding="utf-8"))

    def test_name_only_matching_would_change_attendance(self):
        a, b = [self.fixture["cards"][k] for k in ("heliod_regular", "heliod_constellation")]
        self.assertEqual((a["name"], a["oracle_id"]), (b["name"], b["oracle_id"]))
        self.assertNotEqual(a["artist_ids"], b["artist_ids"])
        root = Path(__file__).resolve().parents[1]
        mappings = json.loads((root / "data/curated/artist-mappings.json").read_text(encoding="utf-8"))
        attending = {i for m in mappings["event_mappings"] if m["status"] == "verified" for i in m["scryfall_artist_ids"]}
        self.assertFalse(attending & set(a["artist_ids"]))
        self.assertTrue(attending & set(b["artist_ids"]))

    def test_real_translated_edition_and_reversible_token(self):
        a, b = [self.fixture["cards"][k] for k in ("heliod_regular", "heliod_regular_ja")]
        self.assertEqual(edition(a), edition(b))
        self.assertEqual(category(self.fixture["cards"]["reversible_token"]), "token")


class ExportTests(unittest.TestCase):
    def test_formula_like_source_strings_are_literal_in_csv(self):
        for value in ["=2+2", "+SUM(1)", "-1+2", "@SUM(1)", "  =2", "\ttext", "\ntext"]:
            self.assertEqual(csv_cell(value), "'" + value)
        self.assertEqual(csv_cell('Olena "Lena" Richards'), 'Olena "Lena" Richards')

    def test_csv_preserves_null_zero_unicode_and_structured_links(self):
        rows = [{"name": "Tom Wänerstrand", "unknown": None, "zero": 0, "links": [{"label": 'A, "B"', "url": "https://example.com"}]}]
        output = list(csv.DictReader(io.StringIO(csv_bytes(rows).decode("utf-8-sig"))))[0]
        self.assertEqual(output["name"], rows[0]["name"])
        self.assertEqual(output["unknown"], "")
        self.assertEqual(output["zero"], "0")
        self.assertEqual(json.loads(output["links"]), rows[0]["links"])


if __name__ == "__main__":
    unittest.main()
