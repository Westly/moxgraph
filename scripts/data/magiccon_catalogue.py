"""Build an auditable event roster from a captured WBS 2 snapshot, offline."""
from __future__ import annotations

import argparse
from collections import Counter
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import urlsplit

from magiccon_source import ROOT, OVERVIEW, DIRECTORY, feed, guest_name, now, select_guests, sha, write_json

from pipeline_config import EVENT, EVENT_PATH

SOCIAL_LABELS = {
    "twitter": "Follow on X", "facebook": "Like on Facebook",
    "instagram": "Follow on Instagram", "imdb": "View IMDB",
    "twitch": "Watch on Twitch", "snapchat": "Follow on Snapchat",
    "deviantart": "View on DeviantArt", "tumblr": "View on Tumblr",
    "youtube": "Watch on Youtube",
}
SOCIAL_HOSTS = {
    "twitter": {"twitter.com", "x.com"}, "facebook": {"facebook.com"},
    "instagram": {"instagram.com"}, "youtube": {"youtube.com", "youtu.be"},
    "imdb": {"imdb.com"}, "twitch": {"twitch.tv"}, "snapchat": {"snapchat.com"},
    "deviantart": {"deviantart.com"}, "tumblr": {"tumblr.com"},
}


def norm(value):
    return " ".join(unicodedata.normalize("NFKC", html.unescape(value)).casefold().split())


def read_verified(meta):
    path = (ROOT / meta["path"]).resolve()
    if not path.is_relative_to(ROOT):
        raise ValueError("Source path escapes workspace")
    raw = path.read_bytes()
    if len(raw) != meta["bytes"] or sha(raw) != meta["sha256"]:
        raise ValueError(f"Checksum mismatch: {meta['path']}")
    return raw


def link_status(href, platform=None):
    # Preserve the supplied value; never guess a handle's destination.
    if not isinstance(href, str) or href != href.strip() or re.search(r"\s", href):
        return "malformed_url"
    try:
        p = urlsplit(href)
        if p.scheme.lower() not in {"http", "https"} or not p.hostname or p.username or p.password:
            return "malformed_url"
        if "." not in p.hostname or p.port not in (None, 80, 443):
            return "malformed_url"
    except ValueError:
        return "malformed_url"
    host = p.hostname.lower().removeprefix("www.")
    expected = SOCIAL_HOSTS.get(platform)
    if expected and not any(host == d or host.endswith("." + d) for d in expected):
        return "platform_mismatch"
    return "valid_syntax"


def addhttp(value):
    return value if re.match(r"^(f|ht)tps?://", value, re.I) else "http://" + value


class Anchors(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a" and "href" in attrs:
            self.current = {"href": attrs["href"], "label": ""}

    def handle_data(self, data):
        if self.current is not None:
            self.current["label"] += data

    def handle_endtag(self, tag):
        if tag == "a" and self.current is not None:
            self.links.append(self.current)
            self.current = None


def extract_links(row, kind, profile):
    links = []

    def add(field, value, label, platform=None, transform=False, origin="profile_link"):
        if not value:
            return
        href = addhttp(value) if transform else value
        status = link_status(href, platform)
        overview_href = addhttp(value) if (kind == "guest" and field in SOCIAL_LABELS and field != "imdb") else None
        overview_status = link_status(overview_href, platform) if overview_href else None
        usable = href if status == "valid_syntax" else (overview_href if overview_status == "valid_syntax" else None)
        links.append({"source_field": field, "source_value": value,
                      "label": label, "published_href": href, "platform": platform,
                      "origin": origin, "status": status,
                      "overview_published_href": overview_href,
                      "overview_href_status": overview_status,
                      "usable_url": usable,
                      "usable_url_source": ("profile" if status == "valid_syntax" else "overview") if usable else None,
                      "source_profile_url": profile["profile_url"]})

    if kind == "guest":
        for field, label in SOCIAL_LABELS.items():
            add(field, row.get(field), label, field)
        # New populated fields need renderer review; do not pretend they were
        # displayed by this version of MagicCon's profile template.
        for field in ("tiktok", "fandom", "profile_url", "video_link", "epic_photo_url"):
            if row.get(field):
                raise ValueError(f"Review newly populated guest field {field}: {row['id']}")
        body, field = row.get("bio") or "", "bio"
    else:
        add("website", row.get("website"), "Website", transform=True)
        add("store_url", row.get("store_url"), profile["page_config"].get("buyButtonText", "Shop Their Store"), transform=True)
        body, field = row.get("description") or "", "description"
    anchors = Anchors()
    anchors.feed(body)
    for link in anchors.links:
        add(field, link["href"], link["label"], origin="biography_anchor")
    # Preserve plain-text URLs too, with their actual source labels. Guest bios
    # do not auto-link them; showroom makeDesc does. Don't invent @handle URLs.
    for match in re.finditer(r"(?:https?://|www\.)[^\s<>\"']+", html.unescape(body)):
        value = match[0].rstrip(".,;:!)")
        if value not in {l["source_value"] for l in links}:
            add(field, value, value, transform=True,
                origin="biography_text" if kind == "guest" else "biography_autolink")
    return links


def deduplicate(guests, exhibitors, reviews):
    pairs, used = [], set()
    exceptions = {r["guest_id"]: r for r in reviews}
    for g in guests:
        name = guest_name(g)
        candidates = [e for e in exhibitors if norm(e["company"]) == norm(name)]
        evidence = {"method": "unique_normalized_name_within_official_event_sections"}
        if g["id"] in exceptions:
            review = exceptions[g["id"]]
            candidates = [e for e in exhibitors if e["id"] == review["exhibitor_id"]]
            if (len(candidates) != 1 or name != review["guest_name"] or
                    candidates[0]["company"] != review["exhibitor_name"] or
                    review["required_guest_bio_text"] not in g["bio"] or
                    review["required_exhibitor_bio_text"] not in candidates[0]["description"]):
                raise ValueError("Reviewed event identity evidence changed")
            evidence = {"method": "reviewed_biographies", "evidence": review["evidence"]}
        if len(candidates) > 1:
            raise ValueError(f"Ambiguous duplicate event identity: {g['id']}")
        e = candidates[0] if candidates else None
        if e and e["id"] in used:
            raise ValueError("Exhibitor record assigned to multiple people")
        if e:
            used.add(e["id"])
        pairs.append((g, e, evidence if e else {"method": "guest_only"}))
    for e in exhibitors:
        if e["id"] not in used:
            pairs.append((None, e, {"method": "exhibitor_only_identity_unreviewed"}))
    return pairs


def build(manifest_path, *, allow_roster_shrink=False):
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest["status"] not in {"captured", "complete"} or manifest.get("failures"):
        raise ValueError("Cannot publish a failed/incomplete capture")
    sources = {Path(s["path"]).name: read_verified(s) for s in manifest["sources"]}
    all_people = feed(sources["people.json"], "people")
    guests = select_guests(all_people, manifest["page_config"]["guest"]["gtGuestType"])
    exhibitors = feed(sources["space_orders.json"], "space_orders")
    if not guests or not exhibitors:
        raise ValueError("Cannot publish an empty source roster")
    audit_path = ROOT / "reports/magiccon-browser-audit.json"
    audit = json.loads(audit_path.read_text(encoding="utf-8"))
    if (audit["snapshot_id"] != manifest["snapshot_id"] or
            audit["reviewed_renderer_sha256"] != manifest["renderer_sha256"]):
        raise ValueError("Browser/renderer audit must be reviewed for this snapshot")
    for kind, rows in [("guest", guests), ("exhibitor", exhibitors)]:
        if sorted(r["id"] for r in rows) != audit[kind + "_roster"]["source_ids_csv"].split(","):
            raise ValueError("Rendered roster does not match feed selection")
    expected = {("guest", g["id"]) for g in guests} | {("exhibitor", e["id"]) for e in exhibitors}
    profiles = {(p["kind"], p["source_id"]): p for p in manifest["profiles"]}
    if len(profiles) != len(manifest["profiles"]) or set(profiles) != expected:
        raise ValueError("Incomplete or duplicated profile coverage")
    observations = {}
    raw_extracts = []
    for key, profile in profiles.items():
        read_verified(profile["page"])
        kind, ident = key
        field = "people" if kind == "guest" else "space_orders"
        rows = feed(read_verified(profile["data"]), field)
        if len(rows) != 1 or rows[0]["id"] != ident:
            raise ValueError("Profile response identity mismatch")
        row = rows[0]
        images = row["images"] if kind == "guest" else ([row["image"]] if row["image"] else [])
        portrait = {"variants": images, "url": next((i.get("big") for i in images if i.get("big")), None),
                    "source_profile_url": profile["profile_url"],
                    "attribution": f"Portrait published by {EVENT['name']}; rights remain with the respective rights holders.",
                    "photographer_credit": None, "license": "not_stated_in_profile_data",
                    "hosting": "remote_source_url", "fallback": "neutral_person_placeholder"}
        for image in images:
            if any(link_status(url) != "valid_syntax" for url in image.values() if url):
                raise ValueError("Malformed portrait URL")
        name = guest_name(row) if kind == "guest" else row["company"]
        categories = [c["name"] for c in row["global_categories"]]
        status = "canceled" if any("canceled" in c.casefold() for c in categories) else (
            "memoriam" if any("memoriam" in c.casefold() for c in categories) else "listed")
        obs = {"kind": kind, "source_id": ident, "display_name_raw": name,
               "profile_url": profile["profile_url"],
               "listing_url": OVERVIEW if kind == "guest" else DIRECTORY,
               "retrieved_at": profile["data"]["retrieved_at"],
               "categories": row["global_categories"], "attendance_status": status,
               "days_at_show_raw": row.get("days_at_show"),
               "booth_raw": row.get("booth_number") if kind == "guest" else row.get("booth"),
               "portrait": portrait, "links": extract_links(row, kind, profile),
               "source_data_sha256": profile["data"]["sha256"]}
        observations[key] = obs
        # Track only artist profile content, not the 153 unrelated event people
        # or exhibitor registration-name fields not rendered on their profile.
        public_fields = (["id", "first_name", "last_name", "alt_name", "bio", "known_for",
                          "days_at_show", "booth_number", "global_categories", "images", "schedules",
                          *SOCIAL_LABELS] if kind == "guest" else
                         ["id", "company", "description", "website", "store_url", "booth",
                          "global_categories", "tags", "image", "artist", "featured"])
        raw_extracts.append({"kind": kind, "profile_url": profile["profile_url"],
                             "retrieved_at": profile["data"]["retrieved_at"],
                             "source_data_sha256": profile["data"]["sha256"],
                             "published_fields": {f: row.get(f) for f in public_fields}})
    review_path = ROOT / f"data/curated/events/{EVENT['id']}-identity-review.json"
    reviews = json.loads(review_path.read_text(encoding="utf-8"))
    attendees = []
    for guest, exhibitor, evidence in deduplicate(guests, exhibitors, reviews["pairs"]):
        entries = [observations[(kind, row["id"]) ] for kind, row in
                   [("guest", guest), ("exhibitor", exhibitor)] if row]
        primary = entries[0]
        portrait = next((entry["portrait"] for entry in entries if entry["portrait"]["url"]), primary["portrait"])
        attendees.append({"event_attendee_id": EVENT["id"] + "-" + ("guest-" + guest["id"] if guest else "exhibitor-" + exhibitor["id"]),
                          "display_name": " ".join(html.unescape(primary["display_name_raw"]).split()),
                          "entity_kind": "individual" if guest else "unreviewed_exhibitor",
                          "entity_kind_basis": "official_guest_person_record" if guest else "needs_review",
                          "card_illustrator_status": "not_reconciled",
                          "guest_id": guest["id"] if guest else None,
                          "exhibitor_id": exhibitor["id"] if exhibitor else None,
                          "official_profile_url": primary["profile_url"],
                          "attendance_status": primary["attendance_status"],
                          "days_at_show": guest["days_at_show"].split(",") if guest and guest.get("days_at_show") else [],
                          "booth": exhibitor.get("booth") if exhibitor else None,
                          "portrait": portrait, "source_entries": entries,
                          "deduplication": evidence,
                          "links": [link for entry in entries for link in entry["links"]]})
    attendees.sort(key=lambda a: norm(a["display_name"]))
    all_links = [link for a in attendees for link in a["links"]]
    issues = [{"attendee": a["display_name"], **link} for a in attendees for link in a["links"] if link["status"] != "valid_syntax"]
    name_differences = [{"guest_id": a["guest_id"], "exhibitor_id": a["exhibitor_id"],
                         "names": [e["display_name_raw"] for e in a["source_entries"]],
                         "method": a["deduplication"]["method"]} for a in attendees
                        if len({e["display_name_raw"] for e in a["source_entries"]}) > 1]
    report = {"schema_version": 1, "snapshot_id": manifest["snapshot_id"], "generated_at": now(),
              "status": "complete", "counts": {**manifest["counts"],
              "source_entries": len(expected), "profiles_retrieved": len(profiles),
              "distinct_attendees": len(attendees), "merged_duplicate_entries": len(expected) - len(attendees),
              "duplicate_ids_within_source": 0, "unaccounted_entries": 0, "retrieval_failures": 0,
              "missing_guest_portraits": sum(not observations[("guest", g["id"])]["portrait"]["url"] for g in guests),
              "missing_exhibitor_portraits": sum(not observations[("exhibitor", e["id"])]["portrait"]["url"] for e in exhibitors),
              "attendees_missing_all_portraits": sum(not a["portrait"]["url"] for a in attendees),
              "attendees_without_published_social_fields": sum(not any(l["platform"] for l in a["links"]) for a in attendees),
              "published_link_observations": len(all_links), "flagged_link_observations": len(issues),
              "links_without_usable_published_destination": sum(not l["usable_url"] for l in all_links),
              "links_using_valid_overview_destination": sum(l["usable_url_source"] == "overview" for l in all_links),
              "featured_exhibitors": sum(bool(e.get("featured")) for e in exhibitors),
              "source_name_differences": len(name_differences),
              "unreviewed_exhibitor_identities": sum(a["entity_kind"] != "individual" for a in attendees)},
              "missing_portrait_attendees": [a["display_name"] for a in attendees if not a["portrait"]["url"]],
              "without_published_social_fields": [a["display_name"] for a in attendees if not any(l["platform"] for l in a["links"])],
              "link_issues": issues, "source_name_differences": name_differences,
              "link_status_counts": dict(Counter(l["status"] for l in all_links)),
              "attendance_days": dict(Counter(",".join(a["days_at_show"]) for a in attendees)),
              "attendance_day_exceptions": [{"name": a["display_name"], "days": a["days_at_show"]} for a in attendees if a["days_at_show"] != ["Fri", "Sat", "Sun"]],
              "browser_audit": {"path": audit_path.relative_to(ROOT).as_posix(), "sha256": sha(audit_path.read_bytes())},
              "completeness": {"method": "Complete arrays loaded by official renderer; browser roster IDs independently reviewed",
                               "feed_pagination": "No pagination metadata; renderer performs one unfiltered request per source and filters locally",
                               "unresolved_pagination_gaps": 0},
              "external_link_reachability": "not_probed; syntax/platform validation only",
              "portrait_reachability": "source URLs captured; browser spot checks only",
              "wbs_3_started": False}
    event = {"schema_version": 1, "event_id": EVENT["id"], "source_event_id": EVENT["sourceId"],
             "name": EVENT["name"], "dates": EVENT["dates"],
             "location": EVENT["location"], "snapshot_id": manifest["snapshot_id"],
             "source_urls": [OVERVIEW, DIRECTORY], "retrieved_from": manifest["started_at"],
             "retrieved_through": manifest["completed_at"],
             "portrait_policy": {"mode": "remote_source_url", "local_copies": False,
                                 "fallback": "neutral_person_placeholder", "license_grant_inferred": False},
             "attendees": attendees}
    # Validate everything before replacing any published artifact.
    if sum(len(a["source_entries"]) for a in attendees) != len(expected):
        raise ValueError("Unaccounted source entries")
    old_path = ROOT / f"data/curated/events/{EVENT['id']}.json"
    if old_path.exists():
        old = json.loads(old_path.read_text(encoding="utf-8"))
        if not allow_roster_shrink and old["snapshot_id"] != event["snapshot_id"] and len(attendees) < len(old["attendees"]):
            raise ValueError("Roster shrink requires review; last good snapshot kept")
    artifacts = {
        f"data/curated/events/{EVENT['id']}.json": event,
        f"data/sources/events/{EVENT['id']}-profiles.json": {"snapshot_id": manifest["snapshot_id"], "profiles": raw_extracts},
        "reports/attendance-coverage.json": report,
    }
    for path, value in artifacts.items():
        write_json(ROOT / path, value)
    report_path = ROOT / "reports/attendance-coverage.md"
    report_path.write_text(markdown_report(event, report), encoding="utf-8")
    manifest["artifacts"] = [{"path": path, "sha256": sha((ROOT / path).read_bytes()), "bytes": (ROOT / path).stat().st_size}
                             for path in [*artifacts, "reports/attendance-coverage.md"]]
    manifest.update(status="complete", curated_at=now(),
                    curator_sha256=sha(Path(__file__).read_bytes()),
                    browser_audit_sha256=sha(audit_path.read_bytes()),
                    identity_review_sha256=sha(review_path.read_bytes()))
    write_json(manifest_path, manifest)
    print(json.dumps(report["counts"], indent=2))


def markdown_report(event, report):
    c = report["counts"]
    lines = ["# MagicCon: Atlanta attendance coverage — WBS 2.0", "",
             f"Snapshot: `{event['snapshot_id']}`. Captured {event['retrieved_from']} through {event['retrieved_through']}.", "",
             "Sources: [Art of Magic overview](" + OVERVIEW + ") and [Artist Directory](" + DIRECTORY + ").", "",
             "## Coverage", "", "| Measure | Result |", "| --- | ---: |"]
    lines += [f"| {k.replace('_', ' ')} | {v} |" for k, v in c.items()]
    lines += ["", f"All {c['profiles_retrieved']} profile URLs were fetched, and their individual public data responses were checked against the list entries. Guest and exhibitor IDs are separate namespaces. Event duplicates retain both complete source observations.", "",
              f"The reviewed official renderer loads complete arrays, then applies category/day/alphabet filters in the browser. It has no server pagination or load-more request in either relevant renderer. Browser inspection found the same {c['guest_entries']} guest IDs and {c['exhibitor_entries']} exhibitor IDs. Populated groups and the reviewed renderer checksum are recorded in [browser evidence](magiccon-browser-audit.json). The exhibitor list includes {c['featured_exhibitors']} featured entries within its total.", "",
              "## Missing and questionable source data", "",
              "No portrait in either source: " + ", ".join(report["missing_portrait_attendees"]) + ". Use a neutral placeholder.", "",
              f"{c['attendees_without_published_social_fields']} attendees have no published dedicated social field. Their available websites, gallery links and biography URLs remain captured. Absence of a published field does not mean no social account exists.", "",
              "Portraits retain their original remote URLs and official-profile attribution. No image files were copied or relicensed. Photographer credits/licensing were not stated in the captured profile fields; do not invent them.", "",
              "Published link labels and source strings are preserved. Some social URLs are malformed on individual profiles but correctly prefixed by the official overview renderer; both published destinations are retained. `usable_url` uses a valid published destination when available and is null otherwise. No typo or handle has been guessed. External websites were not crawled for additional socials. HTTP success of those external links is not claimed.", "",
              "| Attendee | Field | Published value | Issue |", "| --- | --- | --- | --- |"]
    lines += [f"| {i['attendee']} | {i['source_field']} | `{i['source_value']}` | {i['status']} |" for i in report["link_issues"]]
    lines += ["", "The source labels `store_url` as **View Artists Magic Gallery**. These destinations are often Gatherer/Scryfall searches; they are preserved as gallery links, not relabeled as stores.", "",
              "## Source name differences", "", "| Guest name (raw) | Directory name (raw) | Deduplication evidence |", "| --- | --- | --- |"]
    lines += [f"| `{d['names'][0]}` | `{d['names'][1]}` | {d['method']} |" for d in report["source_name_differences"]]
    lines += ["", f"Nontrivial pairs use reviewed biography evidence in `data/curated/events/{EVENT['id']}-identity-review.json`. Other duplicate pairs have unique names after whitespace/case normalization. Entity kind follows the official guest person record; any unmatched exhibitor remains unreviewed rather than assumed to be an individual. This attendance stage does not approve Scryfall illustrator identities.", "",
              "## Attendance and verification case", "",
              "Attendance-day groups: " + "; ".join(f"{days}: {count}" for days, count in report["attendance_days"].items()) + ". Booth numbers come from the exhibitor records; guest locations remain separate.", "",
              "Day exceptions: " + "; ".join(f"{a['name']}: {'/'.join(a['days']) or 'not provided'}" for a in report["attendance_day_exceptions"]) + ".", "",
              "The supplied David Palumbo profile was checked in the rendered browser; exact title, days and social-link label/destination are in [browser evidence](magiccon-browser-audit.json). The event JSON retains his source entries when present in the current roster.", "",
              "## Capture status", "", "Every source entry is accounted for; zero retrieval failures or unresolved pagination gaps. Missing photos/socials and defective upstream links are documented source limitations. Reconciliation and illustrated-card totals are validated as the next stage of each refresh.", "",
              "Reproduction, source coverage and snapshot handling: [event-data instructions](../docs/event-data.md).", ""]
    return "\n".join(lines)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, required=True)
    args = parser.parse_args()
    build(args.manifest)
