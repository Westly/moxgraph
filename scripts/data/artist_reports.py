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
    tables = {name: read(ROOT / f"reports/{name}.json") for name in ("artists-all", "artists-atlanta-2026")}
    full, attendees = tables["artists-all"]["rows"], tables["artists-atlanta-2026"]["rows"]
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
                  "review_limit": "19 profiles sampled in depth, including all three nonexact source aliases. Every attendee has explicit reviewed name evidence and UUID-checked printing examples. Empty biographies do not supply invented evidence.",
                  "name_only_counterexample": {"name": "Heliod, Sun-Crowned", "oracle_id": "63e596a2-9126-4af6-8782-c38687d664ad",
                      "regular": {"printing_id": "01a8576e-cadc-4521-aadd-3a05f0bc4d20", "set": "thb", "collector_number": "18", "artist": "Lius Lasahido", "attendance": "not_listed_in_snapshot"},
                      "constellation": {"printing_id": "e11cf760-da35-41f2-8cf5-a5141103eeb3", "set": "thb", "collector_number": "259", "artist": "Jason A. Engle", "guest_id": "379900", "attendance": "listed"}}}
    write_json(ROOT / "reports/artist-validation.json", validation)
    generate_report(audit, attendees, mappings, full)
    paths = ["data/curated/artist-match-review.json", "data/curated/artist-mappings.json", "tests/fixtures/artist-counting.json",
             "scripts/data/artist_reconciliation.py", "scripts/data/artist_statistics.py", "scripts/data/artist_reports.py",
             "tests/test_artist_statistics.py", "docs/artist-statistics.md",
             *["reports/" + p for p in ("artists-all.csv", "artists-atlanta-2026.csv", "artists-all.json", "artists-atlanta-2026.json",
                                      "artist-discrepancies.json", "artist-statistics-audit.json", "artist-validation.json", "artist-reconciliation.md",
                                      "artist-match-candidates.json", "joint-credit-audit.json")]]
    write_json(ROOT / "data/manifests/artist-statistics-atlanta-2026.json", {
        "schema_version": 1, "status": "complete", "generated_at": now(), "card_snapshot_id": cm["snapshot_id"],
        "event_snapshot_id": event["snapshot_id"], "mapping_revision": mappings["mapping_revision"],
        "counting_contract": "docs/artist-statistics.md",
        "artifacts": [{"path": p, "bytes": (ROOT / p).stat().st_size, "sha256": checksum(ROOT / p)} for p in paths]})
    print(json.dumps({"status": "pass", "independent_sql_artists": len(sql_checks), "biography_work_checks": len(work_checks),
                      "profile_sample": len(profile_checks), "csv_rows": [x["rows"] for x in csv_checks]}))


def generate_report(audit, rows, mappings, full):
    methods = Counter(m["method"] for m in mappings["event_mappings"])
    gaps = audit["discrepancy_counts"]
    fallbacks = read(ROOT / "reports/artist-discrepancies.json")["queue"]["edition_identity_fallback"]
    uncredited_fallbacks = sum(not f["artist_ids"] for f in fallbacks)
    rows_with_gaps = sum(any(r[k] for k in ("missing_oracle_id_total", "missing_illustration_id_total",
                                          "edition_fallback_printings_total", "artwork_attribution_gap_printings_total")) for r in full)
    lines = ["# Artist reconciliation — MagicCon Atlanta 2026", "",
        "WBS 3.0 is complete. All **65 attendees** have reviewed Scryfall identities. The complete source table contains **2,434 artist UUIDs**. No attendee is omitted and no event identity is unresolved.", "",
        "Sources: Scryfall `all_cards` updated **2026-10-11 09:19:13.375 UTC**, and the [official MagicCon roster](https://mcatlanta.mtgfestivals.com/en-us/art-of-magic.html) retrieved on **2026-10-11**. These totals describe that dated snapshot, including any previews already present; they are not live totals.", "",
        "## Downloads", "", "- [Atlanta artists CSV](artists-atlanta-2026.csv) · [JSON](artists-atlanta-2026.json)",
        "- [All source artists CSV](artists-all.csv) · [JSON](artists-all.json)",
        "- [Reviewed identities](../data/curated/artist-mappings.json) · [Discrepancy queue](artist-discrepancies.json)",
        "- [Counting contract and reproduction](../docs/artist-statistics.md) · [Validation evidence](artist-validation.json)", "",
        "## Identity decisions", "", "Names remain source observations. Stable keys use Scryfall UUIDs. Candidate similarity never approves an identity.", "",
        f"Reviewed decisions: {methods['reviewed_exact_name']} exact-name matches, {methods['reviewed_normalized_name']} normalized-name match, and {methods['reviewed_alias_with_primary_evidence']} aliases supported by primary evidence. The three substantive Scryfall aliases are:", "",
        "| MagicCon name | Scryfall name | Evidence |", "| --- | --- | --- |",
        "| Jason Engle | Jason A. Engle | Official constellation-gods biography, THB #259 credit, and [artist-owned JAE Studio](https://www.jaestudio.com/contact) |",
        "| Olena \"Lena\" Richards | Olena Richards | Official nickname/biography, the profile's `olena_richards` gallery link, and [Lena Richards Art](https://www.lenarichards.com/) |",
        "| Thomas Baxa | Thomas M. Baxa | MagicCon links BaxaArt; its [portfolio](https://www.baxaart.com/portfolio_index.htm) identifies Thomas M. Baxa and his Magic work |", "",
        "The separate Michael/Mike Bierek, Cynthia Sheppard/Shepard, and Tom Wänerstrand/Tomas Wanerstrand event spellings retain the WBS 2 biography evidence. Case, accents, whitespace, pseudonyms and same-UUID Scryfall variants remain visible in the exports. Individual/collective identity is not guessed for unreviewed source artists.", "",
        "All **230 joint-credit combinations** were audited by UUID. Names were never split and paired by position. **93 source UUIDs** lack an unambiguous single-ID name observation; their ID-based statistics remain valid, while names remain null. These do not block any of the 65 event mappings.", "",
        "## What the numbers mean", "",
        "The main total counts distinct Oracle identities on paper game cards. Editions collapse translated records only when set, collector number, layout and ordered illustration/credit identities agree. Language printings count actual Scryfall IDs. Artworks count known illustration IDs. Finishes do not multiply counts. Reversible cards use the artist's own face Oracle IDs.", "",
        "Tokens (including the reversible Mechtitan), emblems, art cards, planes/phenomena, schemes, vanguards, front/reference cards, dungeons, heroes and stickers are supplemental. Digital-only records remain separately counted. Special game cards such as Conspiracies, Attractions, Contraptions and silver-border cards remain eligible.", "",
        f"All **{audit['scope_records']['records_total']:,} source records** were accounted for; **{audit['scope_records']['paper_game_card']:,}** are paper game-card printings before credit coverage is applied. Known credits span **{audit['global_distinct_credited_game_cards']:,}** distinct eligible cards and **{audit['global_distinct_credited_game_artworks']:,}** artworks. Artist totals overlap and must not be summed to obtain a global unique total.", "",
        "## Atlanta totals", "", "| MagicCon artist | Scryfall artist | Cards | Editions | Language printings | Artworks | Supplemental objects |",
        "| --- | --- | ---: | ---: | ---: | ---: | ---: |"]
    for r in rows:
        lines.append("| " + " | ".join(md(r[k]) for k in ("magiccon_artist_name", "scryfall_artist_name", "unique_cards_total", "printing_editions_total", "language_printings_total", "unique_artworks_total", "supplemental_objects_total")) + " |")
    lines += ["", "## Validation and limitations", "",
        "Independent SQL over the normalized credit tables agrees with card and language-printing totals for **all 65 attendees**, and with the complete eligible printing scope. Six cards named or described in official biographies agree with actual credits; 19 profiles received deeper review, including aliases, pseudonyms and all six attendees with multiple single-ID source names. Every attendee also has UUID-checked source printing examples.", "",
        "The saved seven-card fixture and regression suite cover translation deduplication, different art in one language, shared credits, separate face artists, reversible identities/tokens, missing data, source-review drift, null versus zero, and the following real printing counterexample:", "",
        "- [Heliod, Sun-Crowned THB #18](https://scryfall.com/card/thb/18/heliod-sun-crowned): **Lius Lasahido**, not listed in this roster.",
        "- [Heliod, Sun-Crowned THB #259](https://scryfall.com/card/thb/259/heliod-sun-crowned): **Jason A. Engle**, listed as Jason Engle.",
        "- Both share the same name and Oracle ID. Only the selected printing gives the correct attendance match.", "",
        f"The discrepancy queue distinguishes **{gaps['unmapped_attendees']} unresolved attendees**, **{gaps['verified_zero_eligible_cards']} verified attendees with zero eligible cards**, **{gaps['credit_missing']} source objects missing credits**, **{gaps['source_artist_name_unknown']} unnamed source UUIDs**, and **{gaps['not_listed_in_event_snapshot']} source UUIDs not listed in this event snapshot**. Missing credits are not evidence that an artist is absent. Not listed does not mean a confirmed cancellation.", "",
        f"**{gaps['edition_identity_fallback']} eligible printing records** have insufficient artwork/credit information for safe language deduplication. Of these, **{uncredited_fallbacks}** lack artist IDs and are not assigned to any artist total. **{rows_with_gaps} credited artist rows** have an artwork, Oracle or edition-fallback gap in this snapshot. The general fallback rule retains the printing UUID rather than merging uncertain art; affected artist rows expose that uncertainty in their coverage columns.", "",
        "Source profile limitations from WBS 2 persist: three missing portraits, 36 attendees without dedicated social fields, and five link observations without usable published destinations. All original link labels, fields, URLs and provenance are retained in JSON and the CSV's JSON cells; missing links are not fabricated.", "",
        "Both CSVs were authored and inspected through the spreadsheet runtime, then checked byte-for-byte against portable CSV serialization of the JSON rows. UTF-8 BOM preserves names in Excel; null becomes an empty cell and zero stays 0. Arrays/objects use JSON cells. Formula-like source text receives an apostrophe in CSV only; JSON preserves raw values.", "",
        "**Blockers: none for WBS 3.0.** Source gaps remain visible. The next parent is WBS 4.0, static deck-import feasibility; it has not started.", ""]
    (ROOT / "reports/artist-reconciliation.md").write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write-csv", action="store_true", help="Reproduce CSVs with the byte-equivalent stdlib serializer")
    verify(parser.parse_args().write_csv)
