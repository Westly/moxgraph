import contextlib
import gzip
import io
import json
from pathlib import Path
import sqlite3
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts/data"))
from scryfall_catalogue import build, records
from scryfall_source import checksum, make_manifest, write_json
from scryfall_lookup import lookup


def uid(number):
    return f"00000000-0000-4000-8000-{number:012d}"


def card(number=1, **overrides):
    return {
        "object": "card", "id": uid(number), "oracle_id": uid(100),
        "name": "Printing fidelity fixture", "set": "tst", "set_name": "Synthetic fixtures",
        "collector_number": str(number), "lang": "en", "layout": "normal",
        "type_line": "Creature — Test", "games": ["paper"], "finishes": ["foil", "nonfoil"],
        "artist": "Artist One", "artist_ids": [uid(1001)], "illustration_id": uid(2001),
        "future_unknown_field": {"preserve": ["every", "value"]}, **overrides,
    }


class CatalogueTests(unittest.TestCase):
    def source(self, root, cards):
        path, manifest = make_manifest({"data": [{
            "id": "fixture", "type": "all_cards", "updated_at": "2026-10-11T09:19:13Z",
            "jsonl_download_uri": "https://data.scryfall.io/all-cards/fixture.jsonl.gz",
        }]}, root)
        raw = root / manifest["download"]["path"]
        raw.parent.mkdir(parents=True)
        with gzip.open(raw, "wt", encoding="utf-8") as stream:
            for value in cards:
                stream.write(json.dumps(value, ensure_ascii=False) + "\n")
        manifest["download"].update(status="complete", bytes=raw.stat().st_size, sha256=checksum(raw))
        write_json(path, manifest)
        return path, manifest, raw

    def run_build(self, path, root):
        with contextlib.redirect_stdout(io.StringIO()):
            return build(path, root)

    def test_exact_printings_languages_faces_and_joint_credits_survive(self):
        a, b = uid(1001), uid(1002)
        cards = [
            card(1),
            card(2, artist="Artist Two", artist_ids=[b], illustration_id=uid(2002)),
            card(3, lang="ja", collector_number="1★", printed_name="テスト"),
            card(4, artist="Artist One & Artist Two", artist_ids=[b, a]),
            card(5, layout="transform", artist="Artist One & Artist Two", artist_ids=[a, b],
                 illustration_id=None, card_faces=[
                     {"name": "Front", "artist": "Artist One", "artist_id": a, "illustration_id": uid(2003)},
                     {"name": "Back", "artist": "Artist Two", "artist_id": b, "illustration_id": uid(2004)},
                 ]),
            card(6, artist=None, artist_ids=[], illustration_id=None),
            card(7, lang="de", collector_number="1"),
        ]
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            path, manifest, _ = self.source(root, cards)
            report = self.run_build(path, root)
            self.assertEqual(report["status"], "pass")
            self.assertEqual(report["counts"]["stored_printings"], 7)
            self.assertEqual(report["counts"]["missing_artist_ids"], 1)
            db_path = root / "data/staging" / (manifest["snapshot_id"] + ".sqlite")
            with contextlib.closing(sqlite3.connect(db_path)) as db:
                raw = json.loads(db.execute("SELECT source_json FROM printings WHERE id=?", (uid(3),)).fetchone()[0])
                self.assertEqual(raw, cards[2])
                artists = [row[0] for row in db.execute("SELECT artist_ids_json FROM printings WHERE id IN (?,?) ORDER BY id", (uid(1), uid(2)))]
                self.assertNotEqual(*artists)
                self.assertEqual(db.execute("SELECT COUNT(*) FROM printings WHERE set_code='tst' AND collector_number='1'").fetchone()[0], 2)
                self.assertEqual(db.execute("SELECT COUNT(DISTINCT artist_id) FROM faces WHERE printing_id=?", (uid(5),)).fetchone()[0], 2)
                self.assertEqual(db.execute("SELECT COUNT(*) FROM artist_names WHERE raw_name LIKE '% & %'").fetchone()[0], 0)
                self.assertEqual(db.execute("SELECT COUNT(*) FROM credits WHERE raw_credit='Artist One & Artist Two'").fetchone()[0], 2)
            self.assertTrue(any("printings_by_tuple" in plan for plan in report["lookup_query_plans"]["by_printing_tuple"]))

    def test_duplicate_ids_are_accounted_for_and_block_baseline(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            path, manifest, _ = self.source(root, [card(), card()])
            with self.assertRaisesRegex(ValueError, "Completeness"):
                self.run_build(path, root)
            failed = json.loads((root / "reports" / (manifest["snapshot_id"] + "-failed.json")).read_text())
            self.assertEqual(failed["counts"]["unaccounted_records"], 0)
            self.assertEqual(failed["counts"]["duplicate_printing_id_records"], 1)
            self.assertFalse((root / "reports/card-data-quality.json").exists())

    def test_ambiguous_printing_tuple_is_preserved_not_overwritten(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            path, _, _ = self.source(root, [card(1), card(2, collector_number="1")])
            report = self.run_build(path, root)
            self.assertEqual(report["counts"]["stored_printings"], 2)
            self.assertEqual(report["counts"]["ambiguous_printing_tuples"], 1)
            self.assertEqual(report["ambiguous_printing_tuples"][0]["printing_ids"], [uid(1), uid(2)])
            database = root / "data/staging" / (report["snapshot_id"] + ".sqlite")
            self.assertEqual(lookup(database, set_code="tst", collector_number="1", lang="en")["lookup_state"], "multiple_records")
            self.assertEqual(lookup(database, printing_id=uid(2))["cards"][0]["id"], uid(2))
            self.assertEqual(lookup(database, printing_id=uid(99))["lookup_state"], "not_found")
            with self.assertRaisesRegex(ValueError, "requires"):
                lookup(database, set_code="tst", collector_number="1")

    def test_truncated_gzip_cannot_become_a_completed_baseline(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            path, manifest, raw = self.source(root, [card()])
            raw.write_bytes(raw.read_bytes()[:-5])
            manifest["download"].update(bytes=raw.stat().st_size, sha256=checksum(raw))
            write_json(path, manifest)
            with self.assertRaises(EOFError):
                self.run_build(path, root)
            self.assertEqual(json.loads(path.read_text())["ingestion"]["status"], "failed")
            self.assertFalse((root / "reports/card-data-quality.json").exists())

    def test_changed_source_checksum_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            path, _, raw = self.source(root, [card()])
            raw.write_bytes(raw.read_bytes() + b"changed")
            with self.assertRaisesRegex(ValueError, "checksum"):
                self.run_build(path, root)

    def test_legacy_array_handles_unicode_and_rejects_incomplete_envelopes(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "source.json"
            path.write_text(json.dumps([card(1, name="Éowyn " + "x" * 70000), card(2)]), encoding="utf-8")
            self.assertEqual(len(list(records(path, "json-array", "none"))), 2)
            for invalid in ('[{"a":1},]', '[{"a":1}', '[{"a":1}]oops', '[{"a":1}{"b":2}]'):
                path.write_text(invalid, encoding="utf-8")
                with self.assertRaises(ValueError):
                    list(records(path, "json-array", "none"))


if __name__ == "__main__":
    unittest.main()
