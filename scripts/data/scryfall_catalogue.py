"""Stream a verified full Scryfall snapshot into an auditable local catalogue.

WBS 1 only: no MagicCon collection, attendee reconciliation, or website output.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
import gzip
import io
import json
import os
from pathlib import Path
import sqlite3
import time
import unicodedata
import uuid

from scryfall_source import ROOT, PARSER_VERSION, checksum, local_path, now, write_json

MAX_RECORD = 32 * 1024 * 1024
SCHEMA_VERSION = 1

SCHEMA = """
PRAGMA foreign_keys=ON;
PRAGMA journal_mode=DELETE;
PRAGMA synchronous=NORMAL;
PRAGMA temp_store=FILE;
PRAGMA cache_size=-65536;
CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE printings (
 id TEXT PRIMARY KEY, source_ordinal INTEGER NOT NULL UNIQUE, oracle_id TEXT,
 name TEXT NOT NULL, printed_name TEXT, set_code TEXT NOT NULL, set_name TEXT,
 collector_number TEXT NOT NULL, lang TEXT NOT NULL, layout TEXT, type_line TEXT,
 set_type TEXT, category TEXT NOT NULL, paper INTEGER NOT NULL, digital INTEGER NOT NULL,
 released_at TEXT, finishes_json TEXT NOT NULL, games_json TEXT NOT NULL,
 artist_credit TEXT, artist_ids_json TEXT NOT NULL, illustration_id TEXT,
 image_uris_json TEXT, scryfall_uri TEXT, face_count INTEGER NOT NULL,
 has_credit INTEGER NOT NULL, has_artist_id INTEGER NOT NULL,
 has_illustration_id INTEGER NOT NULL, source_json TEXT NOT NULL
);
CREATE TABLE faces (
 printing_id TEXT NOT NULL REFERENCES printings(id), face_index INTEGER NOT NULL,
 name TEXT, oracle_id TEXT, artist_credit TEXT, artist_id TEXT, illustration_id TEXT,
 image_uris_json TEXT, source_json TEXT NOT NULL, PRIMARY KEY (printing_id, face_index)
);
CREATE TABLE artists (id TEXT PRIMARY KEY);
CREATE TABLE credits (
 id INTEGER PRIMARY KEY, printing_id TEXT NOT NULL REFERENCES printings(id),
 face_index INTEGER NOT NULL, raw_credit TEXT, artist_ids_json TEXT NOT NULL
);
CREATE TABLE credit_artists (
 credit_id INTEGER NOT NULL REFERENCES credits(id), artist_id TEXT NOT NULL REFERENCES artists(id),
 PRIMARY KEY (credit_id, artist_id)
);
CREATE TABLE artist_names (
 artist_id TEXT NOT NULL REFERENCES artists(id), raw_name TEXT NOT NULL,
 normalized_name TEXT NOT NULL, scope TEXT NOT NULL, observations INTEGER NOT NULL,
 PRIMARY KEY (artist_id, raw_name, scope)
);
CREATE TABLE quarantine (
 source_ordinal INTEGER PRIMARY KEY, printing_id TEXT, reason TEXT NOT NULL, source_json TEXT NOT NULL
);
"""


def packed(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def normalize_name(name):
    return " ".join(unicodedata.normalize("NFKC", name).casefold().split())


def records(path: Path, data_format: str, compression: str):
    """Yield (source ordinal, object, original JSON); validate EOF and gzip CRC."""
    binary = gzip.open(path, "rb") if compression == "gzip" else path.open("rb")
    with binary:
        if data_format == "jsonl":
            ordinal = 0
            while line := binary.readline(MAX_RECORD + 1):
                if len(line) > MAX_RECORD:
                    raise ValueError("Source JSONL record exceeds the 32 MiB safety bound")
                if not line.strip():
                    continue
                ordinal += 1
                text = line.decode("utf-8").strip()
                yield ordinal, json.loads(text), text
        elif data_format == "json-array":
            with io.TextIOWrapper(binary, encoding="utf-8") as stream:
                decoder = json.JSONDecoder()
                buffer = ""
                eof = False

                def fill():
                    nonlocal buffer, eof
                    chunk = stream.read(65536)
                    if not chunk:
                        eof = True
                    buffer += chunk

                def whitespace():
                    nonlocal buffer
                    buffer = buffer.lstrip()
                    while not buffer and not eof:
                        fill()
                        buffer = buffer.lstrip()

                whitespace()
                if not buffer.startswith("["):
                    raise ValueError("Expected a top-level JSON array")
                buffer = buffer[1:]
                ordinal = 0
                after_comma = False
                while True:
                    whitespace()
                    if buffer.startswith("]"):
                        if after_comma:
                            raise ValueError("Trailing comma in source array")
                        buffer = buffer[1:]
                        whitespace()
                        if buffer or not eof:
                            raise ValueError("Unexpected content after source array")
                        break
                    while True:
                        try:
                            obj, end = decoder.raw_decode(buffer)
                            break
                        except json.JSONDecodeError:
                            if eof or len(buffer) >= MAX_RECORD:
                                raise ValueError("Invalid, truncated, or oversized source JSON record")
                            fill()
                    if not isinstance(obj, dict):
                        raise ValueError("Bulk array items must be objects")
                    ordinal += 1
                    yield ordinal, obj, buffer[:end]
                    buffer = buffer[end:]
                    whitespace()
                    after_comma = False
                    if buffer.startswith(","):
                        buffer = buffer[1:]
                        after_comma = True
                    elif not buffer.startswith("]"):
                        raise ValueError("Expected a comma or array terminator")
        else:
            raise ValueError(f"Unsupported source format: {data_format}")


def valid_uuid(value):
    if not isinstance(value, str) or str(uuid.UUID(value)) != value:
        raise ValueError(f"Invalid UUID: {value!r}")


def source_artist_ids(item, face=False):
    if face:
        values = [item["artist_id"]] if item.get("artist_id") else []
    else:
        values = item.get("artist_ids") or []
    if not isinstance(values, list):
        raise ValueError("Artist IDs must be an array")
    for value in values:
        valid_uuid(value)
    return values


def validate_card(card):
    if not isinstance(card, dict) or card.get("object") != "card":
        raise ValueError("Expected a Scryfall card object")
    valid_uuid(card.get("id"))
    for key in ("name", "set", "collector_number", "lang"):
        if not isinstance(card.get(key), str) or not card[key]:
            raise ValueError(f"Missing/non-string required field: {key}")
    for key in ("games", "finishes"):
        if not isinstance(card.get(key), list) or not all(isinstance(x, str) for x in card[key]):
            raise ValueError(f"Expected a string array: {key}")
    source_artist_ids(card)
    faces = card.get("card_faces") or []
    if not isinstance(faces, list) or not all(isinstance(face, dict) for face in faces):
        raise ValueError("Invalid card_faces array")
    for face in faces:
        source_artist_ids(face, face=True)
    for item in [card, *faces]:
        for key in ("artist", "name", "oracle_id", "illustration_id"):
            if item.get(key) is not None and not isinstance(item[key], str):
                raise ValueError(f"Expected an optional string: {key}")
        for key in ("oracle_id", "illustration_id"):
            if item.get(key):
                valid_uuid(item[key])


def category(card):
    layout = card.get("layout")
    if layout in ("token", "double_faced_token"):
        return "token"
    if layout == "emblem":
        return "emblem"
    if layout == "art_series":
        return "art_card"
    if layout in ("planar", "scheme", "vanguard"):
        return "auxiliary"
    return "card"


def insert_credit(db, printing_id, face_index, item):
    ids = source_artist_ids(item, face=face_index >= 0)
    raw = item.get("artist")
    if not raw and not ids:
        return
    credit_id = db.execute(
        "INSERT INTO credits(printing_id,face_index,raw_credit,artist_ids_json) VALUES (?,?,?,?)",
        (printing_id, face_index, raw, packed(ids)),
    ).lastrowid
    for artist_id in set(ids):
        db.execute("INSERT OR IGNORE INTO artists VALUES (?)", (artist_id,))
        db.execute("INSERT INTO credit_artists VALUES (?,?)", (credit_id, artist_id))
    # An entire credit associated with one ID is evidence. A joint credit is NOT split.
    if raw and len(set(ids)) == 1:
        db.execute("""INSERT INTO artist_names VALUES (?,?,?,?,1)
            ON CONFLICT(artist_id,raw_name,scope) DO UPDATE SET observations=observations+1""",
            (ids[0], raw, normalize_name(raw), "face" if face_index >= 0 else "root"))


def insert_card(db, ordinal, card, original):
    validate_card(card)
    faces = card.get("card_faces") or []
    all_parts = [card, *faces]
    ids = source_artist_ids(card)
    has_artist = bool(ids or any(source_artist_ids(face, True) for face in faces))
    values = (
        card["id"], ordinal, card.get("oracle_id"), card["name"], card.get("printed_name"),
        card["set"], card.get("set_name"), card["collector_number"], card["lang"],
        card.get("layout"), card.get("type_line"), card.get("set_type"), category(card),
        int("paper" in card["games"]), int(bool(card.get("digital"))), card.get("released_at"),
        packed(card["finishes"]), packed(card["games"]), card.get("artist"), packed(ids),
        card.get("illustration_id"), packed(card.get("image_uris")) if card.get("image_uris") else None,
        card.get("scryfall_uri"), len(faces), int(any(part.get("artist") for part in all_parts)),
        int(has_artist), int(any(part.get("illustration_id") for part in all_parts)), original,
    )
    db.execute("INSERT INTO printings VALUES (" + ",".join("?" for _ in values) + ")", values)
    insert_credit(db, card["id"], -1, card)
    for index, face in enumerate(faces):
        db.execute("INSERT INTO faces VALUES (?,?,?,?,?,?,?,?,?)", (
            card["id"], index, face.get("name"), face.get("oracle_id"), face.get("artist"),
            face.get("artist_id"), face.get("illustration_id"),
            packed(face.get("image_uris")) if face.get("image_uris") else None, packed(face)))
        insert_credit(db, card["id"], index, face)


def scalar(db, sql, params=()):
    return db.execute(sql, params).fetchone()[0]


def rows(db, sql, params=()):
    cursor = db.execute(sql, params)
    names = [col[0] for col in cursor.description]
    return [dict(zip(names, row)) for row in cursor]


def catalogue(db, snapshot_id):
    names = defaultdict(list)
    for record in rows(db, "SELECT * FROM artist_names ORDER BY artist_id,raw_name,scope"):
        artist_id = record.pop("artist_id")
        names[artist_id].append(record)
    samples = defaultdict(list)
    # Iterate all associations once instead of a full scan per artist.
    for artist_id, printing_id in db.execute("""SELECT ca.artist_id,c.printing_id
            FROM credit_artists ca JOIN credits c ON c.id=ca.credit_id ORDER BY c.id"""):
        if len(samples[artist_id]) < 3 and printing_id not in samples[artist_id]:
            samples[artist_id].append(printing_id)
    joint = rows(db, """SELECT raw_credit,artist_ids_json,COUNT(*) AS credit_observations,
        MIN(printing_id) AS example_printing_id FROM credits
        WHERE json_array_length(artist_ids_json)>1 GROUP BY raw_credit,artist_ids_json
        ORDER BY raw_credit,artist_ids_json""")
    unknown = rows(db, """SELECT raw_credit,COUNT(*) AS credit_observations,
        MIN(printing_id) AS example_printing_id FROM credits
        WHERE artist_ids_json='[]' GROUP BY raw_credit ORDER BY raw_credit""")
    for record in joint:
        record["artist_ids"] = json.loads(record.pop("artist_ids_json"))
    collisions = rows(db, """SELECT normalized_name,COUNT(DISTINCT artist_id) AS artist_id_count,
        GROUP_CONCAT(DISTINCT artist_id) AS ids FROM artist_names
        GROUP BY normalized_name HAVING COUNT(DISTINCT artist_id)>1 ORDER BY normalized_name""")
    for record in collisions:
        record["artist_ids"] = sorted(record.pop("ids").split(","))
    return {
        "schema_version": SCHEMA_VERSION, "snapshot_id": snapshot_id,
        "identity_policy": "Scryfall IDs only. Names are observations, not reviewed aliases. Joint credits remain unsplit.",
        "artists": [{"scryfall_artist_id": artist_id, "observed_single_id_credits": names[artist_id],
                     "example_printing_ids": samples[artist_id],
                     "identity_review_status": "source_identity_only"}
                    for (artist_id,) in db.execute("SELECT id FROM artists ORDER BY id")],
        "joint_credit_observations": joint,
        "credits_without_artist_ids": unknown,
        "normalized_name_collisions": collisions,
    }


def add_indexes(db):
    db.executescript("""
    CREATE INDEX printings_by_tuple ON printings(set_code,collector_number,lang);
    CREATE INDEX printings_by_oracle ON printings(oracle_id);
    CREATE INDEX printings_by_name ON printings(name);
    CREATE INDEX faces_by_artist ON faces(artist_id);
    CREATE INDEX credits_by_printing ON credits(printing_id);
    CREATE INDEX credits_by_string ON credits(raw_credit);
    CREATE INDEX credit_artists_by_artist ON credit_artists(artist_id,credit_id);
    CREATE INDEX artist_names_by_normalized ON artist_names(normalized_name);
    """)
    db.execute("ANALYZE")
    db.commit()


def quality_report(db, manifest, input_count, seconds, artist_catalogue):
    count = scalar(db, "SELECT COUNT(*) FROM printings")
    quarantined = scalar(db, "SELECT COUNT(*) FROM quarantine")
    duplicate_ids = scalar(db, "SELECT COUNT(*) FROM quarantine WHERE reason='duplicate_printing_id'")
    tuples = rows(db, """SELECT set_code,collector_number,lang,COUNT(*) AS count,
        GROUP_CONCAT(id) AS printing_ids FROM printings GROUP BY set_code,collector_number,lang
        HAVING COUNT(*)>1 ORDER BY set_code,collector_number,lang""")
    for record in tuples:
        record["printing_ids"] = sorted(record["printing_ids"].split(","))
    checks = [row[0] for row in db.execute("PRAGMA integrity_check")]
    fk_issues = [list(row) for row in db.execute("PRAGMA foreign_key_check")]
    counters = {
        "input_records": input_count, "stored_printings": count,
        "unique_printing_ids": count, "quarantined_records": quarantined,
        "duplicate_printing_id_records": duplicate_ids,
        "unaccounted_records": input_count - count - quarantined,
        "card_faces": scalar(db, "SELECT COUNT(*) FROM faces"),
        "source_artist_ids": scalar(db, "SELECT COUNT(*) FROM artists"),
        "observed_single_id_names": scalar(db, "SELECT COUNT(DISTINCT raw_name) FROM artist_names"),
        "joint_credit_groups": len(artist_catalogue["joint_credit_observations"]),
        "normalized_name_collisions": len(artist_catalogue["normalized_name_collisions"]),
        "ambiguous_printing_tuples": len(tuples),
        "paper_printings": scalar(db, "SELECT COUNT(*) FROM printings WHERE paper=1"),
        "digital_only_printings": scalar(db, "SELECT COUNT(*) FROM printings WHERE digital=1"),
        "no_paper_game_flag": scalar(db, "SELECT COUNT(*) FROM printings WHERE paper=0"),
        "missing_artist_credit": scalar(db, "SELECT COUNT(*) FROM printings WHERE has_credit=0"),
        "missing_artist_ids": scalar(db, "SELECT COUNT(*) FROM printings WHERE has_artist_id=0"),
        "missing_illustration_ids": scalar(db, "SELECT COUNT(*) FROM printings WHERE has_illustration_id=0"),
        "missing_oracle_ids_all_levels": scalar(db, """SELECT COUNT(*) FROM printings p
            WHERE p.oracle_id IS NULL AND NOT EXISTS
            (SELECT 1 FROM faces f WHERE f.printing_id=p.id AND f.oracle_id IS NOT NULL)"""),
        "missing_root_oracle_id_with_face_ids": scalar(db, """SELECT COUNT(*) FROM printings p
            WHERE p.oracle_id IS NULL AND EXISTS
            (SELECT 1 FROM faces f WHERE f.printing_id=p.id AND f.oracle_id IS NOT NULL)"""),
        "faces_missing_artist_ids": scalar(db, "SELECT COUNT(*) FROM faces WHERE artist_id IS NULL"),
        "faces_missing_illustration_ids": scalar(db, "SELECT COUNT(*) FROM faces WHERE illustration_id IS NULL"),
    }
    for field in ("missing_artist_credit", "missing_artist_ids", "missing_illustration_ids"):
        column = {"missing_artist_credit": "has_credit", "missing_artist_ids": "has_artist_id",
                  "missing_illustration_ids": "has_illustration_id"}[field]
        counters["paper_" + field] = scalar(db, f"SELECT COUNT(*) FROM printings WHERE paper=1 AND {column}=0")
    query_plans = {
        "by_scryfall_id": [row[3] for row in db.execute("EXPLAIN QUERY PLAN SELECT * FROM printings WHERE id=?", ("example",))],
        "by_printing_tuple": [row[3] for row in db.execute("EXPLAIN QUERY PLAN SELECT * FROM printings WHERE set_code=? AND collector_number=? AND lang=?", ("blb", "280", "en"))],
    }
    passed = (input_count > 0 and counters["unaccounted_records"] == 0 and quarantined == 0
              and checks == ["ok"] and not fk_issues)
    return {
        "schema_version": SCHEMA_VERSION, "parser_version": PARSER_VERSION,
        "snapshot_id": manifest["snapshot_id"], "generated_at": now(),
        "source_updated_at": manifest["source"]["updated_at"],
        "source_sha256": manifest["download"]["sha256"], "status": "pass" if passed else "fail",
        "coverage_definition": "Every record in the checksum-verified dated all_cards snapshot. No games, languages, or sets excluded.",
        "input_stream_completed": True, "counts": counters,
        "languages": rows(db, "SELECT lang,COUNT(*) AS printings FROM printings GROUP BY lang ORDER BY lang"),
        "sets": rows(db, "SELECT set_code,MAX(set_name) AS set_name,COUNT(*) AS printings FROM printings GROUP BY set_code ORDER BY set_code"),
        "layouts": rows(db, "SELECT layout,COUNT(*) AS printings FROM printings GROUP BY layout ORDER BY layout"),
        "categories": rows(db, "SELECT category,COUNT(*) AS printings FROM printings GROUP BY category ORDER BY category"),
        "game_combinations": rows(db, "SELECT games_json,COUNT(*) AS printings FROM printings GROUP BY games_json ORDER BY games_json"),
        "ambiguous_printing_tuples": tuples,
        "quarantine": rows(db, "SELECT source_ordinal,printing_id,reason FROM quarantine ORDER BY source_ordinal"),
        "sqlite_integrity_check": checks, "foreign_key_issues": fk_issues,
        "lookup_query_plans": query_plans, "processing_seconds": round(seconds, 2),
        "notes": [
            "Absent credit/art IDs are retained and reported; they do not imply no artist.",
            "Root artist arrays and face credits are preserved separately; joint credit strings are never split into assumed identities.",
            "Name collisions and tuple ambiguity require review before use in confirmed matching.",
            "Category is a layout-based staging label; raw type/set/game data remains intact for later counting-scope decisions.",
            "No attendee data, reviewed aliases, or per-artist illustrated-card totals are generated in WBS 1.0.",
        ],
    }


def fixture_records(db, snapshot_id):
    selections = []
    cases = {
        "ordinary_paper": "SELECT id FROM printings WHERE paper=1 AND layout='normal' AND lang='en' AND has_artist_id=1 LIMIT 1",
        "non_english": "SELECT id FROM printings WHERE paper=1 AND lang NOT IN ('en','qya','ph') AND has_artist_id=1 LIMIT 1",
        "non_numeric_collector_number": "SELECT id FROM printings WHERE collector_number GLOB '*[^0-9]*' LIMIT 1",
        "multiple_finishes": "SELECT id FROM printings WHERE json_array_length(finishes_json)>1 LIMIT 1",
        "double_faced": "SELECT id FROM printings WHERE layout IN ('transform','modal_dfc') AND face_count=2 LIMIT 1",
        "reversible": "SELECT id FROM printings WHERE layout='reversible_card' LIMIT 1",
        "split": "SELECT id FROM printings WHERE layout='split' LIMIT 1",
        "token": "SELECT id FROM printings WHERE category='token' LIMIT 1",
        "digital_only": "SELECT id FROM printings WHERE digital=1 LIMIT 1",
        "joint_credit": "SELECT printing_id FROM credits WHERE json_array_length(artist_ids_json)>1 LIMIT 1",
        "missing_artist_id": "SELECT id FROM printings WHERE has_artist_id=0 LIMIT 1",
        "missing_illustration_id": "SELECT id FROM printings WHERE has_illustration_id=0 LIMIT 1",
        "two_face_artists": "SELECT printing_id FROM faces WHERE artist_id IS NOT NULL GROUP BY printing_id HAVING COUNT(DISTINCT artist_id)>1 LIMIT 1",
    }
    missing = []
    for label, sql in cases.items():
        selected = db.execute(sql).fetchone()
        if selected:
            selections.append((label, selected[0]))
        else:
            missing.append(label)
    changed = db.execute("""SELECT oracle_id FROM printings WHERE paper=1 AND lang='en'
        AND layout='normal' AND artist_ids_json!='[]' GROUP BY oracle_id
        HAVING COUNT(DISTINCT artist_ids_json)>1 AND oracle_id IS NOT NULL LIMIT 1""").fetchone()
    if changed:
        pairs = db.execute("""SELECT MIN(id) FROM printings WHERE oracle_id=? AND paper=1
            AND lang='en' AND artist_ids_json!='[]' GROUP BY artist_ids_json LIMIT 2""", changed).fetchall()
        selections.extend(("same_card_different_artist", row[0]) for row in pairs)
    return {
        "schema_version": SCHEMA_VERSION, "snapshot_id": snapshot_id,
        "purpose": "Minimal real source records for future exact-printing tests; no attendance claims.",
        "cases": [{"case": label, "card": json.loads(scalar(db, "SELECT source_json FROM printings WHERE id=?", (key,)))}
                  for label, key in selections],
        "unavailable_cases": missing,
    }


def summary_markdown(report):
    counts = report["counts"]
    lines = ["# Scryfall card-data baseline — WBS 1.0", "", f"Snapshot: `{report['snapshot_id']}`",
             f"Source updated: {report['source_updated_at']}", f"Validation: **{report['status'].upper()}**", "",
             "| Check | Result |", "| --- | ---: |"]
    lines += [f"| {key.replace('_', ' ')} | {value:,} |" for key, value in counts.items()]
    lines += ["", f"Languages: **{len(report['languages'])}**. Sets: **{len(report['sets'])}**.",
              "", "All source records and unknown fields are preserved in the compressed download and in SQLite `printings.source_json`.",
              "The generated artist catalogue contains source identity observations; names have not been reconciled with MagicCon.",
              "Missing credit fields and non-unique lookup tuples are data-quality findings, not discarded records.",
              "", "See `card-data-quality.json` for the complete language/set coverage, ambiguity list, integrity checks, and index query plans.",
              "See `docs/data-baseline.md` for reproduction and exact lookup commands.", "",
              "WBS 2.0 (event artist collection) has not started.", ""]
    return "\n".join(lines)


def build(manifest_path: Path, root: Path = ROOT, rebuild=False):
    started = time.monotonic()
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    info = manifest["download"]
    raw = local_path(info["path"], root)
    if (info.get("status") != "complete" or raw.stat().st_size != info.get("bytes")
            or checksum(raw) != info.get("sha256")):
        raise ValueError("Ingestion requires a complete checksum-verified source download")
    snapshot = manifest["snapshot_id"]
    database = root / "data/staging" / (snapshot + ".sqlite")
    partial = database.with_name(database.name + ".partial")
    database.parent.mkdir(parents=True, exist_ok=True)
    if database.exists() and not rebuild:
        raise FileExistsError("Baseline exists; use --rebuild explicitly to reproduce it")
    if partial.exists():
        if not rebuild:
            raise FileExistsError("An interrupted staging database exists; inspect it or use --rebuild")
        partial.unlink()
    manifest["ingestion"] = {"status": "running", "started_at": now(), "parser_version": PARSER_VERSION}
    write_json(manifest_path, manifest)
    db = sqlite3.connect(partial)
    input_count = 0
    try:
        db.executescript(SCHEMA)
        db.executemany("INSERT INTO metadata VALUES (?,?)", [
            ("snapshot_id", snapshot), ("source_sha256", info["sha256"]),
            ("parser_version", PARSER_VERSION), ("schema_version", str(SCHEMA_VERSION)),
            ("status", "building"),
        ])
        print("WBS 1.2–1.4: streaming source records, preserving all fields and printing/face credits.", flush=True)
        for ordinal, card, original in records(raw, info["format"], info["compression"]):
            input_count += 1
            key = card.get("id") if isinstance(card, dict) else None
            # One record is atomic, including its faces and credits.
            db.execute("SAVEPOINT source_record")
            try:
                insert_card(db, ordinal, card, original)
            except (ValueError, TypeError, sqlite3.IntegrityError) as error:
                db.execute("ROLLBACK TO source_record")
                reason = "duplicate_printing_id" if key and scalar(db, "SELECT COUNT(*) FROM printings WHERE id=?", (key,)) else str(error)
                db.execute("INSERT INTO quarantine VALUES (?,?,?,?)", (ordinal, key, reason, original))
            finally:
                db.execute("RELEASE source_record")
            if input_count % 10000 == 0:
                db.commit()
                db.execute("BEGIN")
            if input_count % 50000 == 0:
                print(f"Processed {input_count:,} records in {time.monotonic()-started:.0f}s", flush=True)
        db.commit()
        print(f"Source EOF validated: {input_count:,} records. WBS 1.5: extracting source artist catalogue.", flush=True)
        artist_catalogue = catalogue(db, snapshot)
        print("WBS 1.6: building exact-printing and artist lookup indexes.", flush=True)
        add_indexes(db)
        print("WBS 1.7: auditing every record, identifier, coverage group, and foreign key.", flush=True)
        report = quality_report(db, manifest, input_count, time.monotonic()-started, artist_catalogue)
        if report["status"] != "pass":
            write_json(root / "reports" / (snapshot + "-failed.json"), report)
            raise ValueError("Completeness/integrity checks failed; staging kept for inspection")
        print("WBS 1.8: saving representative source fixtures and the verified baseline.", flush=True)
        fixtures = fixture_records(db, snapshot)
        db.execute("UPDATE metadata SET value='complete' WHERE key='status'")
        db.commit()
        db.close()
        os.replace(partial, database)
        catalogue_path = root / "data/catalogues" / (snapshot + "-artists.json")
        fixture_path = root / "tests/fixtures/scryfall-printings.json"
        report_path = root / "reports/card-data-quality.json"
        write_json(catalogue_path, artist_catalogue)
        write_json(fixture_path, fixtures)
        write_json(report_path, report)
        summary_path = root / "reports/card-data-quality.md"
        summary_path.write_text(summary_markdown(report), encoding="utf-8", newline="\n")
        manifest["download"]["content_validation"] = "complete-stream-and-gzip-integrity-verified"
        manifest["ingestion"].update({
            "status": "complete", "completed_at": now(), "input_records": input_count,
            "stored_printings": report["counts"]["stored_printings"],
            "parser_sha256": checksum(Path(__file__)),
            "artifacts": {label: {"path": path.relative_to(root).as_posix(), "bytes": path.stat().st_size,
                                  "sha256": checksum(path)} for label, path in (
                ("database", database), ("artist_catalogue", catalogue_path),
                ("quality_report", report_path), ("fixtures", fixture_path), ("summary", summary_path))},
        })
        write_json(manifest_path, manifest)
        print(json.dumps({"status": "complete", "snapshot": snapshot, "counts": report["counts"],
                          "elapsed_seconds": round(time.monotonic()-started, 1)}, indent=2), flush=True)
        return report
    except Exception as error:
        db.close()
        manifest["ingestion"].update({"status": "failed", "error": str(error),
                                      "failed_at": now(), "records_read": input_count})
        write_json(manifest_path, manifest)
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--rebuild", action="store_true")
    args = parser.parse_args()
    build(args.manifest.resolve(), rebuild=args.rebuild)


if __name__ == "__main__":
    main()
