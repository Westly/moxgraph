"""WBS 3: reviewed event identities, independent of numerical card totals."""
from __future__ import annotations

import argparse
from collections import Counter
import difflib
import json
import re
import sqlite3
import unicodedata

from scryfall_source import ROOT, checksum, now, write_json

from pipeline_config import CARD_MANIFEST, EVENT_MANIFEST, EVENT_PATH, EVENT
REVIEW_PATH = ROOT / "data/curated/artist-match-review.json"
MAPPING_PATH = ROOT / "data/curated/artist-mappings.json"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value):
    return " ".join(unicodedata.normalize("NFKC", value).casefold().split())


def loose(value):
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", norm(value)).encode("ascii", "ignore").decode())


def key(ident):
    return "scryfall-" + ident


def names(artist):
    counts = Counter()
    for obs in artist["observed_single_id_credits"]:
        counts[obs["raw_name"]] += obs["observations"]
    return sorted(counts, key=lambda n: (-counts[n], n))


def candidates(attendee, artists):
    originals = [e["display_name_raw"] for e in attendee["source_entries"]]
    found = []
    for artist in artists:
        observed = names(artist)
        method = ("exact" if any(a == b for a in originals for b in observed) else
                  "normalized" if {norm(n) for n in originals} & {norm(n) for n in observed} else
                  "accent_or_punctuation_candidate" if {loose(n) for n in originals} & {loose(n) for n in observed} else None)
        score = max((difflib.SequenceMatcher(None, norm(a), norm(b)).ratio() for a in originals for b in observed), default=0)
        if method or score >= 0.72:
            found.append({"scryfall_artist_id": artist["scryfall_artist_id"], "names": observed,
                          "method": method or "fuzzy_candidate_only", "score": round(score, 4)})
    return sorted(found, key=lambda a: (a["method"] == "fuzzy_candidate_only", -a["score"], a["scryfall_artist_id"]))


def check_review(attendee, artists_by_id, review):
    if review["expected_event_names"] != [e["display_name_raw"] for e in attendee["source_entries"]]:
        raise ValueError("Event names changed since identity review")
    if review["status"] != "verified":
        return []
    ids = review["scryfall_artist_ids"]
    if not ids or not review.get("evidence_notes") or not review.get("evidence_urls"):
        raise ValueError("Verified identity lacks IDs/evidence")
    for ident in ids:
        if ident not in artists_by_id or sorted(names(artists_by_id[ident])) != sorted(review["expected_scryfall_names"][ident]):
            raise ValueError("Scryfall identity observations changed since review")
    return ids


def build():
    cm, em, review = read(CARD_MANIFEST), read(EVENT_MANIFEST), read(REVIEW_PATH)
    if cm["ingestion"]["status"] != "complete" or em["status"] != "complete":
        raise ValueError("Incomplete source baseline")
    am = cm["ingestion"]["artifacts"]["artist_catalogue"]
    if checksum(ROOT / am["path"]) != am["sha256"]:
        raise ValueError("Artist catalogue checksum mismatch")
    event_artifact = next(a for a in em["artifacts"] if a["path"] == EVENT_PATH.relative_to(ROOT).as_posix())
    if checksum(EVENT_PATH) != event_artifact["sha256"]:
        raise ValueError("Event snapshot checksum mismatch")
    if review["card_snapshot_id"] != cm["snapshot_id"] or review["event_snapshot_id"] != em["snapshot_id"]:
        raise ValueError("Identity review belongs to different snapshots")
    cat, event = read(ROOT / am["path"]), read(EVENT_PATH)
    by_id = {a["scryfall_artist_id"]: a for a in cat["artists"]}
    decisions = {r["magiccon_guest_id"]: r for r in review["decisions"]}
    if len(decisions) != len(review["decisions"]):
        raise ValueError("Duplicate review decisions")
    db = sqlite3.connect(f"file:{(ROOT / cm['ingestion']['artifacts']['database']['path']).as_posix()}?mode=ro", uri=True)
    mappings, candidate_rows, assigned = [], [], set()
    for a in event["attendees"]:
        possible = candidates(a, cat["artists"])
        candidate_rows.append({"guest_id": a["guest_id"], "event_names": [e["display_name_raw"] for e in a["source_entries"]], "candidates": possible})
        decision = decisions.get(a["guest_id"])
        ids = check_review(a, by_id, decision) if decision else []
        if assigned & set(ids):
            raise ValueError("Source artist assigned to multiple attendees; explicit group review required")
        assigned.update(ids)
        examples = []
        for ident in ids:
            for pid in by_id[ident]["example_printing_ids"][:2]:
                row = db.execute("SELECT source_json FROM printings WHERE id=?", (pid,)).fetchone()
                card = json.loads(row[0])
                all_ids = set(card.get("artist_ids") or []) | {f["artist_id"] for f in card.get("card_faces", []) if f.get("artist_id")}
                if ident not in all_ids:
                    raise ValueError("Credit example does not contain reviewed artist ID")
                examples.append({"artist_id": ident, "printing_id": pid, "name": card["name"],
                                 "raw_credit": card.get("artist"), "scryfall_uri": card["scryfall_uri"]})
        mappings.append({"mapping_id": a["event_attendee_id"],
                         "event_id": event["event_id"], "event_attendee_id": a["event_attendee_id"],
                         "magiccon_guest_id": a["guest_id"], "magiccon_exhibitor_id": a["exhibitor_id"],
                         "magiccon_names": [e["display_name_raw"] for e in a["source_entries"]],
                         "artist_keys": [key(ident) for ident in ids], "scryfall_artist_ids": ids,
                         "scryfall_names": {ident: names(by_id[ident]) for ident in ids},
                         "status": decision["status"] if decision else "needs_review",
                         "method": decision["method"] if decision else "no_review_decision",
                         "reviewed_at": decision.get("reviewed_at", review["reviewed_at"]) if decision else None,
                         "notes": decision["evidence_notes"] if decision else "No reviewed identity; totals must remain null.",
                         "evidence_urls": (decision["evidence_urls"] if decision else []) + [x["scryfall_uri"] for x in examples],
                         "credit_examples": examples})
    db.close()
    if set(decisions) - {a["guest_id"] for a in event["attendees"]}:
        raise ValueError("Review has attendees absent from this snapshot")
    registry = [{"artist_key": key(ident), "scryfall_artist_ids": [ident],
                 "scryfall_artist_name": names(a)[0] if names(a) else None,
                 "scryfall_name_variants": names(a), "entity_kind": "individual" if ident in assigned else "unknown",
                 "name_status": "observed_single_id_credit" if names(a) else "joint_credit_identity_unnamed",
                 "name_evidence": a["observed_single_id_credits"],
                 "example_printing_ids": a["example_printing_ids"]} for ident, a in sorted(by_id.items())]
    joint = []
    for row in cat["joint_credit_observations"]:
        if any(ident not in by_id for ident in row["artist_ids"]):
            raise ValueError("Unknown ID in joint credit")
        joint.append({**row, "known_names_by_id": {ident: names(by_id[ident]) for ident in row["artist_ids"]},
                      "unidentified_name_ids": [ident for ident in row["artist_ids"] if not names(by_id[ident])],
                      "attribution_policy": "Credit each explicit source ID; raw joint names remain unsplit. Never zip names with IDs.",
                      "attending_artist_ids": sorted(set(row["artist_ids"]) & assigned)})
    result = {"schema_version": 1, "card_snapshot_id": cm["snapshot_id"], "event_snapshot_id": em["snapshot_id"],
              "mapping_revision": review.get("mapping_revision", EVENT["id"] + "-" + checksum(REVIEW_PATH)[:16]), "generated_at": now(), "reviewed_at": review["reviewed_at"],
              "source_hashes": {"card_artist_catalogue": am["sha256"], "event": event_artifact["sha256"],
                                "review": checksum(REVIEW_PATH)},
              "identity_policy": "One stable key per Scryfall UUID. Names are observations; no cross-ID or joint-name guesses.",
              "artists": registry, "event_mappings": mappings}
    write_json(ROOT / "reports/artist-match-candidates.json", {"snapshot_id": em["snapshot_id"], "attendees": candidate_rows})
    write_json(ROOT / "reports/joint-credit-audit.json", {"snapshot_id": cm["snapshot_id"], "groups": joint})
    write_json(MAPPING_PATH, result)
    print(json.dumps({"registry_artists": len(registry), "event_statuses": dict(Counter(m["status"] for m in mappings)),
                      "joint_groups": len(joint), "unnamed_source_ids": sum(not a["scryfall_artist_name"] for a in registry)}))


if __name__ == "__main__":
    argparse.ArgumentParser(description=__doc__).parse_args()
    build()
