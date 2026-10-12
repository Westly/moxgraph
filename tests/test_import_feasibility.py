"""Evidence regressions for WBS 4. No network access or application importer."""
import collections
import csv
import hashlib
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts/data"))
from import_audit import mox_lines, arch_lines

FIXTURES = ROOT / "tests/fixtures/import-feasibility"


def read(name):
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


class FeasibilityEvidenceTests(unittest.TestCase):
    def test_fixture_hashes_and_minimization(self):
        forbidden = {"owner", "createdByUser", "authors", "ownerUserId", "description", "prices", "notes", "media", "email"}
        def check(value):
            if isinstance(value, dict):
                self.assertFalse(forbidden.intersection(value))
                for child in value.values(): check(child)
            elif isinstance(value, list):
                for child in value: check(child)
        for source in read("sources.json")["sources"]:
            path = ROOT / source["fixture"]
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), source["fixtureSha256"])
            check(json.loads(path.read_bytes()))

    def test_owner_v2_sections_and_quantities(self):
        expected = [("3x55_3CFz060qxL2xac3NA",111,{"mainboard":100,"sideboard":8,"maybeboard":30,"commanders":1}),
                    ("zB7a13TqOUWlUZuylE905Q",126,{"mainboard":99,"maybeboard":39,"commanders":1})]
        for identity, row_count, counts in expected:
            rows = list(mox_lines(read(f"moxfield-v2-{identity}.json")))
            self.assertEqual(len(rows), row_count)
            actual = collections.Counter()
            for r in rows: actual[r["section"]] += r["quantity"]
            self.assertEqual(dict(actual), counts)

    def test_multi_printing_rows_use_child_uuid(self):
        rows = list(mox_lines(read("moxfield-SbEkgxN4CEqiCG5B94rkkg.json")))
        self.assertEqual(len(rows), 975)
        self.assertEqual(sum(r["quantity"] for r in rows), 975)
        self.assertEqual(sum(r["summaryIdDiffers"] for r in rows), 125)
        self.assertEqual(len({r["id"] for r in rows if r["name"] == "Island"}), 5)
        self.assertEqual(collections.Counter(r["lang"] for r in rows), {"en":719,"ja":255,"de":1})

    def test_v2_quantity_anomaly_must_not_be_accepted_as_complete(self):
        deck = read("moxfield-v2-SbEkgxN4CEqiCG5B94rkkg.json")
        rows = list(mox_lines(deck))
        self.assertEqual(deck["mainboardCount"], 975)
        self.assertEqual(sum(r["quantity"] for r in rows), 1187)
        self.assertEqual([r["quantity"] for r in rows if r["name"] == "Spirit"], [215])
        report = json.loads((ROOT / "reports/import-printing-audit.json").read_text(encoding="utf-8"))
        result = next(d for d in report["decks"] if d["apiVersion"] == "v2" and d["deckId"] == "SbEkgxN4CEqiCG5B94rkkg")
        self.assertEqual(result["issues"], [{"section":"mainboard","reason":"board quantity mismatch","declaredCount":975,"expandedCopies":1187}])
        earlier = read("moxfield-SbEkgxN4CEqiCG5B94rkkg.json")
        self.assertEqual(deck["version"], earlier["version"])
        self.assertEqual(deck["lastUpdatedAtUtc"], earlier["lastUpdatedAtUtc"])

    def test_missing_child_card_cannot_borrow_summary_uuid(self):
        deck = read("moxfield-SbEkgxN4CEqiCG5B94rkkg.json")
        row = next(r for r in deck["boards"]["mainboard"]["cards"].values() if r.get("printingData"))
        del row["printingData"][0]["card"]
        with self.assertRaisesRegex(ValueError, "do not borrow"):
            list(mox_lines(deck))

    def test_japanese_owner_print_and_dfc_survive(self):
        rows = list(mox_lines(read("moxfield-v2-zB7a13TqOUWlUZuylE905Q.json")))
        tutor = next(r for r in rows if r["name"] == "Vampiric Tutor")
        self.assertEqual((tutor["set"],tutor["cn"],tutor["lang"],tutor["id"]),
                         ("soa","100","ja","7a79190f-de60-4eb6-b925-594eb76ca8c3"))
        abbey = next(r for r in rows if r["name"].startswith("Westvale Abbey"))
        self.assertEqual((abbey["cn"],abbey["layout"],abbey["quantity"]),("281s","transform",1))

    def test_arch_csv_matches_actual_api_printings_and_categories(self):
        rows = list(arch_lines(read("archidekt-19780118.json")))
        with (FIXTURES / "archidekt-official.csv").open(encoding="utf-8-sig",newline="") as f:
            exported = list(csv.DictReader(f))
        self.assertEqual(len(rows), 114)
        self.assertEqual(collections.Counter((r["id"],r["quantity"],r["finish"],r["set"],r["cn"]) for r in rows),
                         collections.Counter((r["Scryfall ID"],int(r["Quantity"]),r["Finish"],r["Edition code"],r["Collector number"]) for r in exported))
        self.assertEqual(collections.Counter(r["section"] for r in rows), {"mainboard":98,"commanders":2,"sideboard":14})
        self.assertTrue(any(r["cn"] == "162★" for r in rows))
        self.assertTrue(all(r["lang"] is None for r in rows))

    def test_missing_uuid_is_reported_not_substituted(self):
        report = json.loads((ROOT / "reports/import-printing-audit.json").read_text(encoding="utf-8"))
        result = next(d for d in report["decks"] if d["apiVersion"] == "v2" and d["deckId"] == "zB7a13TqOUWlUZuylE905Q")
        self.assertEqual(result["verifiedPrintingRows"], 125)
        self.assertEqual(len(result["issues"]), 1)
        self.assertEqual(result["issues"][0]["id"], "f0deab39-dfa3-4652-a05f-b221b979009a")
        self.assertEqual(result["issues"][0]["reason"], "UUID absent from frozen snapshot")

    def test_official_text_export_limitations_remain_visible(self):
        report = json.loads((ROOT / "reports/import-export-audit.json").read_text(encoding="utf-8"))["moxfieldText"]
        self.assertTrue(report["setNumberQuantityFinishEqualApiMainAndCommander"])
        self.assertEqual(report["omittedMaybeboardCopies"], 39)
        self.assertFalse(report["explicitLanguage"])
        self.assertFalse(report["explicitScryfallId"])
        self.assertGreater(report["ambiguousLanguageRows"], 0)


if __name__ == "__main__":
    unittest.main()
