"""Capture the public feeds loaded by MagicCon's Art of Magic pages (WBS 2).

No Scryfall reads, artist matching, browser credentials, or website deployment.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import time
from urllib.parse import quote, urlencode, urljoin, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

ROOT = Path(__file__).resolve().parents[2]
SITE = "https://mcatlanta.mtgfestivals.com"
OVERVIEW = SITE + "/en-us/art-of-magic.html"
DIRECTORY = SITE + "/en-us/art-of-magic/artist-directory.html"
API = "https://conventions.leapevent.tech/api/"
VERSION = "1.0.0"


def now():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(path)


def validate_source_url(url):
    p = urlsplit(url)
    if (p.scheme != "https" or p.hostname not in
            {"mcatlanta.mtgfestivals.com", "conventions.leapevent.tech"}
            or p.username or p.password or p.port not in (None, 443)):
        raise ValueError("Source URL outside the public MagicCon feed allowlist")


class Redirects(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        validate_source_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def capture(url, relative, folder):
    validate_source_url(url)
    time.sleep(0.2)  # Three workers maximum; do not crawl artists' external sites.
    with build_opener(Redirects()).open(Request(url, headers={
        "User-Agent": "MoxGraphData/0.1 (+https://moxgraph.com)",
        "Accept": "application/json,text/html,application/javascript",
    }), timeout=45) as response:
        raw = response.read(10 * 1024 * 1024 + 1)
        if len(raw) > 10 * 1024 * 1024:
            raise ValueError("Unexpectedly large public feed/page")
        headers = {k: response.headers.get(k) for k in
                   ("Content-Type", "ETag", "Last-Modified")}
        status = response.status
    path = folder / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(raw)
    # The key is public page configuration, not an owner credential. Discover it
    # on each run; keep it out of tracked URLs and console output nevertheless.
    return raw, {"path": path.relative_to(ROOT).as_posix(),
                 "source_url": re.sub(r"([?&]key=)[^&]*", r"\1{public-page-key}", url),
                 "retrieved_at": now(), "http_status": status,
                 "bytes": len(raw), "sha256": sha(raw), "headers": headers}


def config(html, plugin):
    match = re.search(r"\." + re.escape(plugin) + r"\(\{(.*?)\}\)", html, re.S)
    if not match:
        raise ValueError(f"Missing {plugin} configuration")
    return dict(re.findall(r"(\w+)\s*:\s*['\"]([^'\"]*)['\"]", match[1]))


def guest_name(row):
    return row.get("alt_name") or row["first_name"] + " " + row["last_name"]


def slug(name):
    # Match the site's stringCleaner; retain even its unusual &quot; slugs.
    s = name.strip().replace(" - ", "-")
    s = re.sub(r"[/ ]", "-", s)
    s = re.sub(r"[.'\"<>:?,|;!$#%^()=*]", "", s)
    s = re.sub(r"[&+]", "-and-", s).replace("@", "-at-")
    return s.replace("--", "-")


def profile_url(row, kind, cfg):
    if kind == "guest":
        base, param = cfg["guestsPage"], "guest-name"
        name = guest_name(row).replace('"', "&quot;")
    else:
        base, param, name = cfg["exhibitorsPage"], "exhibitor-name", row["company"]
    return urljoin(SITE, base) + "?" + urlencode(
        {"gtID": row["id"], param: slug(name)}, quote_via=quote)


def feed(raw, field):
    value = json.loads(raw)
    if value.get("event_name") != "MagicCon: Atlanta 2026" or not isinstance(value.get(field), list):
        raise ValueError("Unexpected event or feed schema")
    if set(value) != {"event_id", "event_name", "event_slug", field}:
        raise ValueError("Feed envelope changed; review pagination/metadata before proceeding")
    rows = value[field]
    ids = [r["id"] for r in rows]
    if len(set(ids)) != len(ids):
        raise ValueError("Duplicate source IDs")
    return rows


def select_guests(rows, category):
    # Same public/category predicate as growTixGuestList.
    return [r for r in rows if r["publicly_visible"] is True and category.casefold() in
            " ".join(c["name"] for c in r["global_categories"]).casefold()]


def collect():
    snapshot = "magiccon-atlanta-2026-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    folder = ROOT / "data/raw" / snapshot
    folder.mkdir(parents=True, exist_ok=False)
    manifest_path = ROOT / "data/manifests" / (snapshot + ".json")
    manifest = {"schema_version": 1, "snapshot_id": snapshot, "started_at": now(),
                "status": "collecting", "extractor_version": VERSION,
                "extractor_sha256": sha(Path(__file__).read_bytes()),
                "public_key_source_url": OVERVIEW, "sources": [], "profiles": []}
    write_json(manifest_path, manifest)
    try:
        pages = {}
        for name, url in [("overview", OVERVIEW), ("directory", DIRECTORY)]:
            raw, meta = capture(url, name + ".html", folder)
            manifest["sources"].append(meta)
            pages[name] = raw.decode("utf-8")
        if '/en-us/art-of-magic/artist-directory.html' not in pages["overview"]:
            raise ValueError("Overview no longer points to the artist directory")
        guest_cfg = config(pages["overview"], "growTixGuestList")
        exhib_cfg = config(pages["directory"], "growTixExhibitors")
        if guest_cfg["gtAPIKey"] != exhib_cfg["gtAPIKey"]:
            raise ValueError("Pages point to different events")
        key = guest_cfg["gtAPIKey"]
        manifest["page_config"] = {"guest": {k: v for k, v in guest_cfg.items() if k != "gtAPIKey"},
                                    "exhibitor": {k: v for k, v in exhib_cfg.items() if k != "gtAPIKey"}}
        script_paths = set(re.findall(r'src="([^"]*/gt-scripts[^\"]*\.js)"',
                                      pages["overview"] + pages["directory"]))
        if len(script_paths) != 1:
            raise ValueError("Expected one shared directory renderer")
        raw, meta = capture(urljoin(SITE, script_paths.pop()), "renderer.js", folder)
        manifest["sources"].append(meta)
        manifest["renderer_sha256"] = sha(raw)
        feeds = {}
        for field, params in [("people", {"schedule": 1, "search_term": ""}),
                              ("space_order_categories", {}),
                              ("space_orders", {"specials": 1, "category": exhib_cfg["gtCategory"], "search_term": ""})]:
            raw, meta = capture(API + field + "?" + urlencode({**params, "key": key}), field + ".json", folder)
            manifest["sources"].append(meta)
            feeds[field] = feed(raw, field)
        categories = {r["id"]: r["name"] for r in feeds["space_order_categories"]}
        if categories.get(exhib_cfg["gtCategory"]) != guest_cfg["gtGuestType"]:
            raise ValueError("Guest and exhibitor categories differ")
        guests = select_guests(feeds["people"], guest_cfg["gtGuestType"])
        orders = feeds["space_orders"]
        if not guests or not orders:
            raise ValueError("Empty roster cannot replace the last good snapshot")
        if any(exhib_cfg["gtCategory"] not in [c["id"] for c in r["global_categories"]] for r in orders):
            raise ValueError("Exhibitor feed returned entries outside the requested category")
        manifest["counts"] = {"people_in_feed": len(feeds["people"]), "guest_entries": len(guests),
                              "people_outside_public_artist_selection": len(feeds["people"]) - len(guests),
                              "exhibitor_entries": len(orders)}
        print(json.dumps(manifest["counts"]), flush=True)

        def get_profile(kind, row, cfg):
            field = "people" if kind == "guest" else "space_orders"
            plugin = "growTixGuest" if kind == "guest" else "growTixShowroom"
            url = profile_url(row, kind, cfg)
            prefix = f"profiles/{kind}-{row['id']}"
            page, page_meta = capture(url, prefix + ".html", folder)
            pcfg = config(page.decode("utf-8"), plugin)
            if pcfg["gtAPIKey"] != key:
                raise ValueError("Profile points to a different event")
            params = {"schedule" if kind == "guest" else "specials": 1, "key": key, "id": row["id"]}
            raw, data_meta = capture(API + field + "?" + urlencode(params), prefix + ".json", folder)
            records = feed(raw, field)
            if len(records) != 1 or records[0]["id"] != row["id"]:
                raise ValueError(f"Profile identity mismatch for {kind}:{row['id']}")
            # Detail feeds may add fields (e.g. artwork IDs), but list fields
            # must agree: a changing roster needs a fresh coherent capture.
            changed = [k for k, v in row.items() if records[0].get(k) != v]
            if changed:
                raise ValueError(f"List/detail changed for {kind}:{row['id']}: {changed}")
            return {"kind": kind, "source_id": row["id"], "profile_url": url,
                    "page": page_meta, "data": data_meta,
                    "page_config": {k: v for k, v in pcfg.items() if k != "gtAPIKey"}}

        jobs = [("guest", r, guest_cfg) for r in guests] + [("exhibitor", r, exhib_cfg) for r in orders]
        failures = []
        with ThreadPoolExecutor(max_workers=3) as pool:
            futures = {pool.submit(get_profile, *job): job for job in jobs}
            for future in as_completed(futures):
                job = futures[future]
                try:
                    manifest["profiles"].append(future.result())
                except Exception as exc:
                    failures.append({"kind": job[0], "source_id": job[1]["id"],
                                     "error": re.sub(r"key=[^&\s]+", "key={redacted}", str(exc))})
                if (len(manifest["profiles"]) + len(failures)) % 20 == 0:
                    print(f"Profiles processed: {len(manifest['profiles'])}; failures: {len(failures)}", flush=True)
        manifest["profiles"].sort(key=lambda p: (p["kind"], p["source_id"]))
        manifest["failures"] = failures
        if failures:
            raise ValueError(f"{len(failures)} profile retrievals failed; no curated publication")
        manifest.update(status="captured", completed_at=now())
    except Exception as exc:
        manifest.update(status="failed", error=re.sub(r"key=[^&\s]+", "key={redacted}", str(exc)), completed_at=now())
        write_json(manifest_path, manifest)
        raise
    write_json(manifest_path, manifest)
    print(manifest_path.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    collect()
