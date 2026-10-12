"""WBS 3: count the frozen printing snapshot; no network or runtime website code."""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import json
import sqlite3
from urllib.parse import urlencode

from artist_reconciliation import CARD_MANIFEST, EVENT_PATH, MAPPING_PATH, read
from scryfall_source import ROOT, checksum, now, write_json

VERSION = "1.0.0"
METRICS = (
    "unique_cards_total", "printing_editions_total", "language_printings_total",
    "unique_artworks_total", "supplemental_objects_total", "missing_oracle_id_total",
    "missing_illustration_id_total", "edition_fallback_printings_total",
    "artwork_attribution_gap_printings_total", "supplemental_printings_total",
    "digital_only_printings_total", "other_nonpaper_printings_total", "all_records_total",
)
SHARED_IMAGE_LAYOUTS = {"split", "adventure", "flip", "prepare"}
SUPPLEMENTAL_LAYOUTS = {
    "token": "token", "double_faced_token": "token", "emblem": "emblem",
    "art_series": "art_card", "planar": "plane_or_phenomenon", "scheme": "scheme",
    "vanguard": "vanguard", "front_card": "front_card",
}


def category(card):
    if card.get("layout") == "reversible_card":
        face_kinds = {category(f) for f in card.get("card_faces", [])}
        if len(face_kinds) != 1:
            raise ValueError("Mixed supplemental/game reversible card needs a scope review")
        return face_kinds.pop()
    if card.get("layout") in SUPPLEMENTAL_LAYOUTS:
        return SUPPLEMENTAL_LAYOUTS[card["layout"]]
    typ = card.get("type_line") or ""
    for prefix, result in (("Token", "token"), ("Emblem", "emblem"), ("Card", "reference_card"),
                           ("Dungeon", "dungeon"), ("Hero", "hero"), ("Stickers", "stickers")):
        if typ == prefix or typ.startswith(prefix + " "):
            return result
    return "game_card"


def ids_of(obj):
    return set(obj.get("artist_ids") or []) | ({obj["artist_id"]} if obj.get("artist_id") else set())


def all_ids(card):
    return ids_of(card) | set().union(*(ids_of(f) for f in card.get("card_faces", [])))


def art_units(card):
    """Use shared illustration once; do not invent artwork for text-only secondary faces."""
    faces = card.get("card_faces") or []
    if not faces or card.get("layout") in SHARED_IMAGE_LAYOUTS or card.get("image_uris"):
        units = [(card.get("illustration_id"), ids_of(card))]
        # Preserve any explicitly different face artwork even on a shared-image layout.
        units += [(f["illustration_id"], ids_of(f)) for f in faces
                  if f.get("illustration_id") and f["illustration_id"] != card.get("illustration_id")]
        return units
    return [(f.get("illustration_id"), ids_of(f)) for f in faces]


def edition(card):
    """Translations merge only when ordered art and explicit credit identities agree."""
    units = art_units(card)
    covered = set().union(*(ids for _, ids in units))
    fallback = any(not art or not ids for art, ids in units) or covered != all_ids(card)
    faces = tuple((f.get("illustration_id"), tuple(sorted(ids_of(f)))) for f in card.get("card_faces", []))
    signature = (card["set"], card["collector_number"], card.get("layout"),
                 tuple((art, tuple(sorted(ids))) for art, ids in units), faces,
                 tuple(sorted(ids_of(card))), card["id"] if fallback else None)
    return signature, fallback


class Statistics:
    def __init__(self, artist_ids):
        self.data = {i: defaultdict(set) for i in artist_ids}
        self.scope = Counter()
        self.gaps = defaultdict(list)
        self.global_cards = set()
        self.global_arts = set()

    def add(self, card):
        pid, credited = card["id"], all_ids(card)
        if credited - self.data.keys():
            raise ValueError("Printing has IDs absent from the artist registry")
        paper = "paper" in card.get("games", [])
        kind = category(card)
        self.scope["records_total"] += 1
        self.scope[("paper_" if paper else "nonpaper_") + kind] += 1
        eligible = paper and kind == "game_card"
        if not credited:
            self.gaps["credit_missing"].append({"printing_id": pid, "name": card["name"], "scope": kind,
                                                "paper": paper, "scryfall_uri": card.get("scryfall_uri")})
        for ident in credited:
            d = self.data[ident]
            d["all_records_total"].add(pid)
            if not paper:
                metric = "digital_only_printings_total" if card.get("digital") or {"arena", "mtgo"} & set(card.get("games", [])) else "other_nonpaper_printings_total"
                d[metric].add(pid)
            elif not eligible:
                d["supplemental_printings_total"].add(pid)
                if card.get("layout") == "reversible_card":
                    for f in card["card_faces"]:
                        if ident in ids_of(f):
                            d["supplemental_objects_total"].add((kind, f.get("oracle_id") or "printing:" + pid))
                else:
                    d["supplemental_objects_total"].add((kind, card.get("oracle_id") or "printing:" + pid))
        if not eligible:
            return
        if card.get("layout") == "reversible_card":
            for face in card.get("card_faces", []):
                if category(face) != "game_card":
                    raise ValueError("Mixed supplemental/game reversible card needs a scope review")
                for ident in ids_of(face):
                    if face.get("oracle_id"):
                        self.data[ident]["unique_cards_total"].add(face["oracle_id"])
                        self.global_cards.add(face["oracle_id"])
                    else:
                        self.data[ident]["missing_oracle_id_total"].add(pid)
                if not ids_of(face):
                    self.gaps["reversible_face_credit_missing"].append({"printing_id": pid, "face_name": face.get("name")})
        else:
            for ident in credited:
                if card.get("oracle_id"):
                    self.data[ident]["unique_cards_total"].add(card["oracle_id"])
                    self.global_cards.add(card["oracle_id"])
                else:
                    self.data[ident]["missing_oracle_id_total"].add(pid)
        edition_key, fallback = edition(card)
        units = art_units(card)
        covered = set().union(*(who for _, who in units))
        attribution_gap = any(not who for _, who in units) or covered != credited
        for ident in credited:
            d = self.data[ident]
            d["language_printings_total"].add(pid)
            d["printing_editions_total"].add(edition_key)
            if fallback:
                d["edition_fallback_printings_total"].add(pid)
            if attribution_gap:
                d["artwork_attribution_gap_printings_total"].add(pid)
        for art, who in units:
            for ident in who:
                if art:
                    self.data[ident]["unique_artworks_total"].add(art)
                    self.global_arts.add(art)
                else:
                    self.data[ident]["missing_illustration_id_total"].add(pid)
        if fallback:
            self.gaps["edition_identity_fallback"].append({"printing_id": pid, "name": card["name"],
                "artist_ids": sorted(credited), "missing_artwork": any(not art for art, _ in units),
                "attribution_gap": attribution_gap})

    def totals(self, ids):
        return {m: len(set().union(*(self.data[i][m] for i in ids))) for m in METRICS}


def event_row(attendee, mapping, source_rows, statistics):
    verified = mapping["status"] == "verified"
    ids = mapping["scryfall_artist_ids"] if verified else []
    if any(i not in source_rows for i in ids):
        raise ValueError("Reviewed identity absent from full source table")
    totals = statistics.totals(ids) if verified else dict.fromkeys(METRICS)
    guest = next(e for e in attendee["source_entries"] if e["kind"] == "guest")
    exhibitor = next((e for e in attendee["source_entries"] if e["kind"] == "exhibitor"), {})
    links = attendee["links"]
    return {
        "artist_key": mapping["artist_keys"][0] if len(ids) == 1 else None,
        "artist_keys": mapping["artist_keys"] if verified else [],
        "scryfall_artist_ids": ids,
        "scryfall_artist_name": source_rows[ids[0]]["scryfall_artist_name"] if len(ids) == 1 else None,
        "scryfall_name_variants": sorted({n for i in ids for n in source_rows[i]["scryfall_name_variants"]}),
        "magiccon_artist_name": guest["display_name_raw"],
        "magiccon_exhibitor_name": exhibitor.get("display_name_raw"),
        "magiccon_guest_id": attendee["guest_id"], "magiccon_exhibitor_id": attendee["exhibitor_id"],
        "event_id": mapping["event_id"], "attendance_status": attendee["attendance_status"],
        "match_status": mapping["status"], "match_method": mapping["method"],
        **totals,
        "portrait_url": attendee["portrait"]["url"], "magiccon_profile_url": attendee["official_profile_url"],
        "website_url": next((l["usable_url"] for l in links if l["source_field"] == "website" and l.get("usable_url")), None),
        "social_links": [l for l in links if l.get("platform")],
        "published_links": links,
        "scryfall_artist_url": artist_url(sorted({n for i in ids for n in source_rows[i]["scryfall_name_variants"]})),
        "source_updated_at": next(iter(source_rows.values()))["source_updated_at"],
        "retrieved_at": max(e["retrieved_at"] for e in attendee["source_entries"]),
        "reviewed_at": mapping["reviewed_at"], "mapping_notes": mapping["notes"],
        "evidence_urls": mapping["evidence_urls"], "booth": attendee["booth"], "days_at_show": attendee["days_at_show"],
    }


def artist_url(names):
    if not names:
        return None
    terms = ['artist:"' + n.replace('\\', '\\\\').replace('"', '\\"') + '"' for n in names]
    return "https://scryfall.com/search?" + urlencode({"q": " or ".join(terms), "unique": "cards", "as": "grid", "order": "name"})


def build():
    manifest, mappings, event = read(CARD_MANIFEST), read(MAPPING_PATH), read(EVENT_PATH)
    db_path = ROOT / manifest["ingestion"]["artifacts"]["database"]["path"]
    print("Verifying frozen database checksum...", flush=True)
    if checksum(db_path) != manifest["ingestion"]["artifacts"]["database"]["sha256"]:
        raise ValueError("Frozen database checksum mismatch")
    if mappings["card_snapshot_id"] != manifest["snapshot_id"] or mappings["event_snapshot_id"] != event["snapshot_id"]:
        raise ValueError("Mappings and source revisions differ")
    if checksum(EVENT_PATH) != mappings["source_hashes"]["event"]:
        raise ValueError("Frozen event checksum mismatch")
    db = sqlite3.connect(f"file:{db_path.as_posix()}?mode=ro", uri=True)
    stats = Statistics(i for a in mappings["artists"] for i in a["scryfall_artist_ids"])
    for n, (raw,) in enumerate(db.execute("SELECT source_json FROM printings ORDER BY source_ordinal"), 1):
        stats.add(json.loads(raw))
        if n % 100000 == 0:
            print(f"Counted {n:,} printings...", flush=True)
    db.close()
    if stats.scope["records_total"] != manifest["ingestion"]["stored_printings"]:
        raise ValueError("Record accounting mismatch")
    by_event_id = {m["magiccon_guest_id"]: m for m in mappings["event_mappings"]}
    attends = {i: m for m in mappings["event_mappings"] if m["status"] == "verified" for i in m["scryfall_artist_ids"]}
    # Full source table first; every explicit Scryfall UUID remains represented.
    rows = {}
    for a in mappings["artists"]:
        ident = a["scryfall_artist_ids"][0]
        rows[ident] = {"artist_key": a["artist_key"], "artist_keys": [a["artist_key"]],
            "scryfall_artist_ids": [ident], "scryfall_artist_name": a["scryfall_artist_name"],
            "scryfall_name_variants": a["scryfall_name_variants"], "magiccon_artist_name": None,
            "magiccon_exhibitor_name": None, "magiccon_guest_id": None, "magiccon_exhibitor_id": None,
            "event_id": event["event_id"], "attendance_status": "not_listed_in_snapshot",
            "match_status": "source_identity_only", "match_method": "explicit_scryfall_uuid",
            **stats.totals([ident]), "portrait_url": None, "magiccon_profile_url": None, "website_url": None,
            "social_links": [], "published_links": [], "scryfall_artist_url": artist_url(a["scryfall_name_variants"]),
            "source_updated_at": manifest["source"]["updated_at"], "retrieved_at": manifest["metadata_retrieved_at"],
            "reviewed_at": None, "mapping_notes": "Source identity only; no attendance is inferred from absence in the event snapshot.",
            "evidence_urls": ["https://api.scryfall.com/cards/" + p for p in a["example_printing_ids"]],
            "booth": None, "days_at_show": [], "name_status": a["name_status"]}
    event_rows = [event_row(a, by_event_id[a["guest_id"]], rows, stats) for a in event["attendees"]]
    event_by_artist = {i: r for r in event_rows if r["match_status"] == "verified" for i in r["scryfall_artist_ids"]}
    for ident, r in rows.items():
        if ident in event_by_artist:
            # Keep each source identity's own counts if a future mapping has multiple IDs.
            metadata = {k: v for k, v in event_by_artist[ident].items() if k not in METRICS and k not in {
                "artist_key", "artist_keys", "scryfall_artist_ids", "scryfall_artist_name", "scryfall_name_variants", "scryfall_artist_url"}}
            r.update(metadata)
    for r in [*rows.values(), *event_rows]:
        if r["language_printings_total"] is not None and r["printing_editions_total"] > r["language_printings_total"]:
            raise ValueError("Edition count exceeds source printing count")
    missing_names = [r["artist_key"] for r in rows.values() if not r["scryfall_artist_name"]]
    queue = {
        "unmapped_attendees": [{"guest_id": r["magiccon_guest_id"], "name": r["magiccon_artist_name"], "status": r["match_status"]}
                               for r in event_rows if r["match_status"] != "verified"],
        "verified_zero_eligible_cards": [r["magiccon_guest_id"] for r in event_rows if r["match_status"] == "verified" and r["unique_cards_total"] == 0],
        "source_artist_name_unknown": missing_names,
        "not_listed_in_event_snapshot": [r["artist_key"] for i, r in rows.items() if i not in attends],
        **stats.gaps,
    }
    common = {"schema_version": 1, "statistics_version": VERSION, "card_snapshot_id": manifest["snapshot_id"],
              "event_snapshot_id": event["snapshot_id"], "mapping_revision": mappings["mapping_revision"],
              "scope": "paper_game_cards; supplemental and digital records separate; no release-date cutoff",
              "null_policy": "Unresolved event counts are null; verified zero is numeric zero.",
              "counting_contract": "docs/artist-statistics.md", "generated_at": now(),
              "source_hashes": {"database": manifest["ingestion"]["artifacts"]["database"]["sha256"],
                                "mappings": checksum(MAPPING_PATH), "event": checksum(EVENT_PATH),
                                "statistics_script": checksum(ROOT / "scripts/data/artist_statistics.py")}}
    full = sorted(rows.values(), key=lambda r: ((r["scryfall_artist_name"] or "~").casefold(), r["artist_key"]))
    write_json(ROOT / "reports/artists-all.json", {**common, "rows": full})
    write_json(ROOT / "reports/artists-atlanta-2026.json", {**common, "rows": event_rows})
    write_json(ROOT / "reports/artist-discrepancies.json", {**common, "queue": queue})
    summary = {**common, "scope_records": dict(sorted(stats.scope.items())), "source_artists": len(rows),
               "event_rows": len(event_rows), "event_match_statuses": dict(Counter(r["match_status"] for r in event_rows)),
               "global_distinct_credited_game_cards": len(stats.global_cards), "global_distinct_credited_game_artworks": len(stats.global_arts),
               "discrepancy_counts": {k: len(v) for k, v in queue.items()},
               "artist_totals_overlap": True, "global_counts_exclude_objects_without_explicit_artist_ids": True}
    write_json(ROOT / "reports/artist-statistics-audit.json", summary)
    print(json.dumps({"source_artists": len(rows), "event_rows": len(event_rows), "scope": dict(stats.scope),
                      "discrepancies": summary["discrepancy_counts"]}))


if __name__ == "__main__":
    argparse.ArgumentParser(description=__doc__).parse_args()
    build()
