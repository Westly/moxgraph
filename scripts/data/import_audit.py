"""Offline WBS 4 feasibility measurements against the frozen Scryfall baseline.

This is evidence tooling, not a runtime importer or automatic conflict resolver.
"""
import collections
import csv
import json
import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FIXTURES = ROOT / "tests/fixtures/import-feasibility"
DB = ROOT / "data/staging/scryfall-all-cards-20261011091913.sqlite"


def mox_boards(deck):
    if "boards" in deck:
        return deck["boards"]
    return {k: {"count": deck[k + "Count"], "cards": deck[k]} for k in deck
            if k + "Count" in deck and isinstance(deck[k], dict)}


def mox_lines(deck):
    for section, board in mox_boards(deck).items():
        for key, row in board["cards"].items():
            for printing in row.get("printingData") or [row]:
                c = printing.get("card")
                if c is None:
                    raise ValueError("Observed printing lacks its own card; do not borrow the summary UUID")
                yield {"rowId": key, "section": section, "name": c["name"],
                       "quantity": printing["quantity"], "finish": printing["finish"],
                       "id": c.get("scryfall_id"), "set": c.get("set"), "cn": c.get("cn"),
                       "lang": c.get("lang"), "layout": c.get("layout"),
                       "summaryIdDiffers": row["card"].get("scryfall_id") != c.get("scryfall_id"),
                       "sourcePrintingId": c.get("id")}


def arch_lines(deck):
    for row in deck["cards"]:
        c = row["card"]
        yield {"rowId": str(row["id"]), "categories": row["categories"],
               "section": "sideboard" if "Sideboard" in row["categories"] else
                          "commanders" if "Commander" in row["categories"] else "mainboard",
               "name": c["oracleCard"]["name"], "quantity": row["quantity"],
               "finish": row["modifier"], "id": c["uid"], "set": c["edition"]["editioncode"],
               "cn": c["collectorNumber"], "lang": None,
               "oracleLanguageNotPrintingLanguage": c["oracleCard"].get("lang"),
               "layout": c["oracleCard"].get("layout"), "sourcePrintingId": c["id"]}


def audit(source, db):
    deck = json.loads((ROOT / source["fixture"]).read_text(encoding="utf-8"))
    is_mox = source["provider"] == "moxfield"
    lines = list(mox_lines(deck) if is_mox else arch_lines(deck))
    sections = collections.Counter()
    langs = collections.Counter()
    finishes = collections.Counter()
    issues = []
    verified = []
    by_name = collections.defaultdict(set)
    if is_mox:
        for section, board in mox_boards(deck).items():
            expanded_count = sum(x["quantity"] for x in lines if x["section"] == section)
            if expanded_count != board["count"]:
                issues.append({"section": section, "reason": "board quantity mismatch", "declaredCount": board["count"], "expandedCopies": expanded_count})
            for key, row in board["cards"].items():
                if row.get("printingData") and sum(x["quantity"] for x in row["printingData"]) != row["quantity"]:
                    issues.append({"rowId": key, "reason": "printing quantities disagree with summary"})
    for line in lines:
        sections[line["section"]] += line["quantity"]
        finishes[line["finish"]] += 1
        row = db.execute("SELECT id,set_code,collector_number,lang,artist_credit,layout,source_json FROM printings WHERE id=?", (line["id"],)).fetchone()
        if row is None:
            issues.append({**line, "reason": "UUID absent from frozen snapshot"})
            continue
        if (row["set_code"], row["collector_number"]) != (line["set"], line["cn"]) or (line["lang"] and row["lang"] != line["lang"]):
            issues.append({**line, "reason": "UUID/tuple disagreement", "catalogueTuple": [row["set_code"], row["collector_number"], row["lang"]]})
            continue
        langs[row["lang"]] += 1
        by_name[line["name"]].add(line["id"])
        raw = json.loads(row["source_json"])
        verified.append({**line, "resolvedLanguage": row["lang"], "artist": row["artist_credit"],
                         "faces": [{"name": f.get("name"), "artist": f.get("artist")} for f in raw.get("card_faces", [])]})
    examples = []
    for predicate in [lambda r:r["section"] == "commanders", lambda r:r["resolvedLanguage"] != "en",
                      lambda r:bool(r["faces"]), lambda r:r.get("summaryIdDiffers"),
                      lambda r:not r["cn"].isdigit(), lambda r:r["section"] == "sideboard"]:
        match = next((r for r in verified if predicate(r) and r not in examples), None)
        if match: examples.append(match)
    return {"provider": source["provider"], "apiVersion": source["apiVersion"], "deckId": source["deckId"],
            "title": deck["name"], "fixture": source["fixture"], "expandedRows": len(lines),
            "copiesBySection": dict(sections), "verifiedPrintingRows": len(verified), "languages": dict(langs),
            "finishes": dict(finishes), "rowsWithSummaryUuidDifferentFromSelected": sum(bool(x.get("summaryIdDiffers")) for x in lines),
            "namesWithMultiplePrintings": {k:len(v) for k,v in by_name.items() if len(v)>1},
            "doubleFacedOrMultifaceRows": sum(bool(x["faces"]) for x in verified), "issues": issues, "examples": examples,
            "generatedTokenCandidatesNotDeckQuantities": len(deck.get("tokens", []))}


def main():
    db = sqlite3.connect(DB.as_uri() + "?mode=ro", uri=True)
    db.row_factory = sqlite3.Row
    sources = json.loads((FIXTURES / "sources.json").read_text())["sources"]
    report = {"schemaVersion": 1, "baseline": "scryfall-all-cards-20261011091913", "decks": [audit(s, db) for s in sources]}
    (ROOT / "reports/import-printing-audit.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    export_report = export_audit(db)
    (ROOT / "reports/import-export-audit.json").write_text(json.dumps(export_report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    db.close()
    for d in report["decks"]:
        print(d["provider"], d["apiVersion"], d["deckId"], "rows", d["expandedRows"], "verified", d["verifiedPrintingRows"], "issues", len(d["issues"]))
    print("Export audit:", json.dumps(export_report, ensure_ascii=False))


def export_audit(db):
    with (FIXTURES / "archidekt-official.csv").open(encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))
    api = json.loads((FIXTURES / "archidekt-19780118.json").read_text(encoding="utf-8"))
    expected = collections.Counter((r["card"]["uid"], r["quantity"], r["modifier"], r["card"]["edition"]["editioncode"], r["card"]["collectorNumber"]) for r in api["cards"])
    actual = collections.Counter((r["Scryfall ID"], int(r["Quantity"]), r["Finish"], r["Edition code"], r["Collector number"]) for r in rows)
    exported = (FIXTURES / "moxfield-official-orzhov.txt").read_text(encoding="utf-8").splitlines()
    unknown, ambiguous, unique = [], [], []
    tuples = []
    for text in exported:
        match = re.fullmatch(r"(\d+) (.+) \(([^)]+)\) (\S+)(?: \*([FE])\*)?", text)
        if not match: raise ValueError(f"Unexpected export line: {text}")
        quantity, name, set_code, cn, finish = match.groups()
        tuples.append((set_code.lower(), cn, int(quantity), {None:"nonFoil", "F":"foil", "E":"etched"}[finish]))
        candidates = db.execute("SELECT id,lang FROM printings WHERE set_code=? AND collector_number=?", (set_code.lower(), cn)).fetchall()
        item = {"line": text, "candidateCount": len(candidates), "candidateLanguages": sorted({r["lang"] for r in candidates})}
        (unknown if not candidates else unique if len(candidates) == 1 else ambiguous).append(item)
    owner = json.loads((FIXTURES / "moxfield-v2-zB7a13TqOUWlUZuylE905Q.json").read_text(encoding="utf-8"))
    expected_tuples = collections.Counter((r["set"],r["cn"],r["quantity"],r["finish"]) for r in mox_lines(owner) if r["section"] in {"mainboard", "commanders"})
    return {"schemaVersion": 1, "archidektCsv": {"rows": len(rows), "selectedFieldsEqualApi": actual == expected,
            "categoryCounts": dict(collections.Counter(r["Category"] for r in rows)), "printingIdentity": "Scryfall ID"},
            "moxfieldText": {"rows": len(exported), "copies": sum(x[2] for x in tuples),
                "setNumberQuantityFinishEqualApiMainAndCommander": collections.Counter(tuples) == expected_tuples,
                "omittedMaybeboardCopies": owner["maybeboardCount"], "explicitLanguage": False, "explicitScryfallId": False,
                "uniqueTupleRowsAcrossAllLanguages": len(unique), "ambiguousLanguageRows": len(ambiguous),
                "unknownTupleRows": unknown, "ambiguousExamples": ambiguous[:3]}}


if __name__ == "__main__":
    main()
