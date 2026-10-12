"""Validate WBS 3 outputs and generate the readable report; optionally reproduce CSVs."""
from __future__ import annotations

import argparse
from collections import Counter
import csv
import io
import json
import re
import sqlite3

from artist_reconciliation import CARD_MANIFEST, EVENT_PATH, MAPPING_PATH, REVIEW_PATH, read
from artist_statistics import METRICS
from scryfall_source import ROOT, checksum, now, write_json
from pipeline_config import EVENT


def csv_cell(value):
    if value is None:
        return ""
    if isinstance(value, (list, dict)):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    if isinstance(value, str) and (re.match(r"^\s*[=+\-@]", value) or value.startswith(("\t", "\r", "\n"))):
        return "'" + value
    return str(value)


def csv_bytes(rows):
    stream = io.StringIO(newline="")
    writer = csv.writer(stream, lineterminator="\r\n")
    fields = list(rows[0])
    writer.writerow(fields)
    writer.writerows([[csv_cell(row.get(f)) for f in fields] for row in rows])
    return ("\ufeff" + stream.getvalue()).encode("utf-8")


def md(value):
    return str(value).replace("|", "\\|").replace("\n", " ")


def verify(write_csv=False):
    mappings, event, audit = read(MAPPING_PATH), read(EVENT_PATH), read(ROOT / "reports/artist-statistics-audit.json")
    tables = {name: read(ROOT / f"reports/{name}.json") for name in ("artists-all", "artists-" + EVENT["id"])}
    full, attendees = tables["artists-all"]["rows"], tables["artists-" + EVENT["id"]]["rows"]
    expected_hashes = {"mappings": checksum(MAPPING_PATH), "event": checksum(EVENT_PATH),
                       "statistics_script": checksum(ROOT / "scripts/data/artist_statistics.py")}
    if mappings["source_hashes"]["review"] != checksum(REVIEW_PATH):
        raise ValueError("Identity review changed; regenerate mappings and counts first")
    for table in tables.values():
        for k, value in expected_hashes.items():
            if table["source_hashes"][k] != value:
                raise ValueError(f"Stale table: {k} changed")
    source_ids = {i for a in mappings["artists"] for i in a["scryfall_artist_ids"]}
    if len(full) != len(source_ids) or {r["scryfall_artist_ids"][0] for r in full} != source_ids:
        raise ValueError("Full table dropped or duplicated a source artist")
    if len(attendees) != len(event["attendees"]) or {r["magiccon_guest_id"] for r in attendees} != {a["guest_id"] for a in event["attendees"]}:
        raise ValueError("Event left join dropped or duplicated an attendee")
    for r in attendees:
        for m in METRICS:
            if r["match_status"] == "verified":
                if type(r[m]) is not int or r[m] < 0:
                    raise ValueError("Verified count is invalid")
            elif r[m] is not None:
                raise ValueError("Unresolved event total must be null")
    csv_checks = []
    for name, table in tables.items():
        path = ROOT / f"reports/{name}.csv"
        expected = csv_bytes(table["rows"])
        if write_csv:
            path.write_bytes(expected)
        if path.read_bytes() != expected:
            raise ValueError("CSV is not equivalent to its JSON: " + name)
        with path.open(encoding="utf-8-sig", newline="") as f:
            decoded = list(csv.DictReader(f))
        if len(decoded) != len(table["rows"]):
            raise ValueError("CSV round-trip row count mismatch")
        csv_checks.append({"path": path.relative_to(ROOT).as_posix(), "rows": len(decoded), "sha256": checksum(path)})

    cm = read(CARD_MANIFEST)
    db = sqlite3.connect(f"file:{(ROOT / cm['ingestion']['artifacts']['database']['path']).as_posix()}?mode=ro", uri=True)
    # Independent SQL formulation over WBS 1's normalized credit relationships,
    # rather than the statistics loop or its category/art-unit helpers.
    db.execute("""CREATE TEMP VIEW eligible AS
      SELECT p.* FROM printings p WHERE paper=1 AND category='card' AND layout<>'front_card'
      AND COALESCE(type_line,'') NOT GLOB 'Token*' AND COALESCE(type_line,'') NOT GLOB 'Card*'
      AND COALESCE(type_line,'') NOT GLOB 'Dungeon*' AND COALESCE(type_line,'') NOT GLOB 'Hero*'
      AND COALESCE(type_line,'') NOT GLOB 'Stickers*'
      AND NOT (layout='reversible_card' AND EXISTS (
        SELECT 1 FROM faces f WHERE f.printing_id=p.id AND json_extract(f.source_json,'$.type_line') GLOB 'Token*'))""")
    db.execute("CREATE TEMP TABLE attending_ids(id TEXT PRIMARY KEY)")
    db.executemany("INSERT INTO attending_ids VALUES (?)", [(i,) for r in attendees for i in r["scryfall_artist_ids"]])
    query = """SELECT ca.artist_id, p.id, p.oracle_id FROM attending_ids a
      JOIN credit_artists ca ON ca.artist_id=a.id JOIN credits c ON c.id=ca.credit_id
      JOIN eligible p ON p.id=c.printing_id"""
    oracle_sets, printing_sets = {}, {}
    for ident, pid, oracle in db.execute(query):
        printing_sets.setdefault(ident, set()).add(pid)
        if oracle:
            oracle_sets.setdefault(ident, set()).add(oracle)
    for ident, oracle in db.execute("""SELECT f.artist_id,f.oracle_id FROM faces f
      JOIN attending_ids a ON a.id=f.artist_id JOIN eligible p ON p.id=f.printing_id
      WHERE p.layout='reversible_card' AND f.oracle_id IS NOT NULL"""):
        oracle_sets.setdefault(ident, set()).add(oracle)
    sql_checks = []
    for r in attendees:
        if r["match_status"] != "verified":
            continue
        ids = r["scryfall_artist_ids"]
        cards = len(set().union(*(oracle_sets.get(i, set()) for i in ids)))
        printings = len(set().union(*(printing_sets.get(i, set()) for i in ids)))
        if (cards, printings) != (r["unique_cards_total"], r["language_printings_total"]):
            raise ValueError("Independent SQL count disagrees: " + r["magiccon_artist_name"])
        sql_checks.append({"guest_id": r["magiccon_guest_id"], "unique_cards_total": cards, "language_printings_total": printings, "result": "pass"})
    sql_scope = db.execute("SELECT COUNT(*) FROM eligible").fetchone()[0]
    if sql_scope != audit["scope_records"]["paper_game_card"]:
        raise ValueError("Independent scope count disagrees")

    # The named cards appear in the captured official biographies. Look up the
    # actual dated source credits, with a set constraint for the relevant work.
    named_works = [('379894', 'gtc', 'Totally Lost'), ('379888', 'avr', 'Craterhoof Behemoth'),
                   ('379916', 'wwk', 'Stoneforge Mystic'), ('379945', 'lrw', 'Shriekmaw'),
                   ('379949', 'drk', 'Blood Moon'), ('379900', 'thb', 'Heliod, Sun-Crowned')]
    by_guest = {m["magiccon_guest_id"]: m for m in mappings["event_mappings"]}
    work_checks = []
    for guest, set_code, name in named_works:
        if guest not in by_guest or by_guest[guest]["status"] != "verified":
            continue  # A historical spot check is not evidence of continued attendance.
        reviewed_ids = set(by_guest[guest]["scryfall_artist_ids"])
        cards = [json.loads(r[0]) for r in db.execute("SELECT source_json FROM printings WHERE set_code=? AND name=? AND lang='en'", (set_code, name))]
        matched = [c for c in cards if reviewed_ids & set(c.get("artist_ids") or [])]
        if not matched:
            raise ValueError("Biography work does not match the reviewed ID")
        c = matched[0]
        work_checks.append({"guest_id": guest, "name": name, "printing_id": c["id"], "set": c["set"],
                            "collector_number": c["collector_number"], "raw_credit": c["artist"], "scryfall_uri": c["scryfall_uri"],
                            "official_profile_url": by_guest[guest]["evidence_urls"][0], "result": "pass"})
    db.close()
    selected = {'379900','379934','379948','379894','379904','379916','379899','379956','379924','379930','379939','378578','379949','379931','379919','379888','379917','379945','379950'}
    profile_checks = [{"guest_id": m["magiccon_guest_id"], "event_names": m["magiccon_names"],
                       "source_names": m["scryfall_names"], "method": m["method"], "notes": m["notes"],
                       "evidence_urls": m["evidence_urls"], "printing_examples": m["credit_examples"]}
                      for m in mappings["event_mappings"] if m["magiccon_guest_id"] in selected]
    validation = {"checked_at": now(), "card_snapshot_id": cm["snapshot_id"], "status": "pass",
                  "source_rows": len(full), "event_rows": len(attendees), "csv_checks": csv_checks,
                  "independent_sql_paper_scope": sql_scope, "independent_sql_attendee_counts": sql_checks,
                  "profile_sample_review": profile_checks, "biography_named_card_checks": work_checks,
                  "review_limit": "Historical baseline identity samples revalidated against current printing IDs; this is not a new human profile review. Current browser observations are recorded separately in magiccon-browser-audit.json.",
                  "name_only_counterexample": {"name": "Heliod, Sun-Crowned", "oracle_id": "63e596a2-9126-4af6-8782-c38687d664ad",
                      "regular": {"printing_id": "01a8576e-cadc-4521-aadd-3a05f0bc4d20", "set": "thb", "collector_number": "18", "artist": "Lius Lasahido", "attendance": "not_listed_in_snapshot"},
                      "constellation": {"printing_id": "e11cf760-da35-41f2-8cf5-a5141103eeb3", "set": "thb", "collector_number": "259", "artist": "Jason A. Engle", "guest_id": "379900", "attendance": "listed"}}}
    write_json(ROOT / "reports/artist-validation.json", validation)
    generate_report(audit, attendees, mappings, full)
    paths = ["data/curated/artist-match-review.json", "data/curated/artist-mappings.json", "tests/fixtures/artist-counting.json",
             "scripts/data/artist_reconciliation.py", "scripts/data/artist_statistics.py", "scripts/data/artist_reports.py",
             "tests/test_artist_statistics.py", "docs/artist-statistics.md",
             *["reports/" + p for p in ("artists-all.csv", f"artists-{EVENT['id']}.csv", "artists-all.json", f"artists-{EVENT['id']}.json",
                                      "artist-discrepancies.json", "artist-statistics-audit.json", "artist-validation.json", "artist-reconciliation.md",
                                      "artist-match-candidates.json", "joint-credit-audit.json")]]
    write_json(ROOT / f"data/manifests/artist-statistics-{EVENT['id']}.json", {
        "schema_version": 1, "status": "complete", "generated_at": now(), "card_snapshot_id": cm["snapshot_id"],
        "event_snapshot_id": event["snapshot_id"], "mapping_revision": mappings["mapping_revision"],
        "counting_contract": "docs/artist-statistics.md",
        "artifacts": [{"path": p, "bytes": (ROOT / p).stat().st_size, "sha256": checksum(ROOT / p)} for p in paths]})
    print(json.dumps({"status": "pass", "independent_sql_artists": len(sql_checks), "biography_work_checks": len(work_checks),
                      "profile_sample": len(profile_checks), "csv_rows": [x["rows"] for x in csv_checks]}))


def generate_report(audit, rows, mappings, full):
    cm, event = read(CARD_MANIFEST), read(EVENT_PATH)
    methods = Counter(m["method"] for m in mappings["event_mappings"])
    unresolved = [r for r in rows if r["match_status"] != "verified"]
    lines = [f"# Artist reconciliation — {event['name']}", "",
        f"{len(rows):,} roster attendees; {len(full):,} source artist UUIDs; {len(unresolved)} unresolved attendee identities.", "",
        f"Card source: `{cm['snapshot_id']}`, updated {cm['source']['updated_at']}. "
        f"Event source: `{event['snapshot_id']}`, retrieved through {event['retrieved_through']}.", "",
        f"[Official roster]({EVENT['overview']}) · [Event CSV](artists-{EVENT['id']}.csv) · [Event JSON](artists-{EVENT['id']}.json) · "
        "[All artists CSV](artists-all.csv) · [All artists JSON](artists-all.json)", "",
        "Counts describe the dated sources. Stable Scryfall UUIDs determine identity and credit; similar names never approve a mapping. "
        "Unchanged decisions retain their original review date. Changed/new identities require evidence before publication.", "",
        "## Mapping methods", "", "| Method | Attendees |", "| --- | ---: |",
        *[f"| {md(k)} | {v} |" for k, v in sorted(methods.items())], "",
        "## Name differences", "", "| MagicCon name | Scryfall names | Status |", "| --- | --- | --- |",
        *[f"| {md(r['magiccon_artist_name'])} | {md(', '.join(r['scryfall_name_variants']))} | {r['match_status']} |"
          for r in rows if r['magiccon_artist_name'] not in r['scryfall_name_variants']], "",
        "## Data gaps", "", "| Category | Records |", "| --- | ---: |",
        *[f"| {md(k)} | {v:,} |" for k,v in sorted(audit['discrepancy_counts'].items())], "",
        "Unknown counts remain null; verified zero remains 0. Artist totals overlap on joint work and must not be summed into global unique-card totals. "
        "Missing credits, absent portraits and unpublished social fields remain explicit; links are never invented.", "",
        "[Counting contract](../docs/artist-statistics.md) · [Independent SQL and CSV validation](artist-validation.json) · "
        "[Discrepancy queue](artist-discrepancies.json) · [Current refresh review](data-refresh-diff.md)", "",
        "CSV uses UTF-8 BOM, CRLF and no formulas. Formula-like values are escaped in CSV; JSON retains original source strings. "
        "The pipeline verifies CSV/JSON equivalence and independent SQL counts before preparing a release.", ""]
    (ROOT / "reports/artist-reconciliation.md").write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write-csv", action="store_true", help="Reproduce CSVs with the byte-equivalent stdlib serializer")
    verify(parser.parse_args().write_csv)
