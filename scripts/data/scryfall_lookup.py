"""Inspect exact printing records in a completed local WBS 1 catalogue."""
import argparse
import json
from pathlib import Path
import sqlite3


def lookup(database, printing_id=None, set_code=None, collector_number=None, lang=None):
    if bool(printing_id) == bool(set_code or collector_number or lang):
        raise ValueError("Use either a printing ID or a complete set/collector-number/language tuple")
    if not printing_id and not all((set_code, collector_number, lang)):
        raise ValueError("Tuple lookup requires set, collector number, and language")
    database = Path(database).resolve(strict=True)
    db = sqlite3.connect(database.as_uri() + "?mode=ro", uri=True)
    try:
        meta = dict(db.execute("SELECT key,value FROM metadata"))
        if meta.get("status") != "complete":
            raise ValueError("Catalogue is not a completed baseline")
        if printing_id:
            rows = db.execute("SELECT source_json FROM printings WHERE id=?", (printing_id,)).fetchall()
        else:
            rows = db.execute("""SELECT source_json FROM printings
                WHERE set_code=? AND collector_number=? AND lang=? ORDER BY id""",
                (set_code, collector_number, lang)).fetchall()
        return {"snapshot_id": meta["snapshot_id"],
                "lookup_state": "one_record" if len(rows) == 1 else "multiple_records" if rows else "not_found",
                "cards": [json.loads(row[0]) for row in rows]}
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", type=Path, required=True)
    parser.add_argument("--id")
    parser.add_argument("--set", dest="set_code")
    parser.add_argument("--number")
    parser.add_argument("--lang")
    parser.add_argument("--full", action="store_true", help="Print the complete original source objects")
    args = parser.parse_args()
    result = lookup(args.database, args.id, args.set_code, args.number, args.lang)
    if not args.full:
        fields = ("id", "name", "printed_name", "set", "collector_number", "lang", "finishes",
                  "artist", "artist_ids", "illustration_id", "card_faces", "scryfall_uri")
        result["cards"] = [{key: card[key] for key in fields if key in card} for card in result["cards"]]
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
