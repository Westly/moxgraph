"""Discover and download a complete Scryfall snapshot using only Python's stdlib.

Network commands are explicit; importing this module never contacts a service.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import time
from datetime import datetime, timezone
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
METADATA_URL = "https://api.scryfall.com/bulk-data"
USER_AGENT = "MoxGraph/0.1 (moxgraph.com; bulk-data preparation)"
PARSER_VERSION = "1.0.0"
CHUNK = 1024 * 1024


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + ".tmp")
    with temp.open("w", encoding="utf-8", newline="\n") as stream:
        json.dump(value, stream, ensure_ascii=False, indent=2)
        stream.write("\n")
    os.replace(temp, path)


def local_path(relative: str, root: Path = ROOT) -> Path:
    target = (root / relative).resolve()
    if not target.is_relative_to(root.resolve()):
        raise ValueError("Manifest path escapes the workspace")
    return target


def checksum(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(CHUNK), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_source_url(url: str) -> None:
    parsed = urllib.parse.urlsplit(url)
    host = parsed.hostname or ""
    if (parsed.scheme != "https" or parsed.username or parsed.password
            or parsed.port not in (None, 443)
            or not any(host == domain or host.endswith("." + domain)
                       for domain in ("scryfall.com", "scryfall.io"))):
        raise ValueError("Only HTTPS Scryfall source URLs are accepted")


class SourceRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        validate_source_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def request(url: str, headers: dict | None = None):
    validate_source_url(url)
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": "application/json,application/octet-stream;q=0.9,*/*;q=0.8",
        "Accept-Encoding": "identity",
        **(headers or {}),
    })
    return urllib.request.build_opener(SourceRedirects()).open(req, timeout=60)


def make_manifest(metadata: dict, root: Path = ROOT) -> tuple[Path, dict]:
    records = [x for x in metadata.get("data", []) if x.get("type") == "all_cards"]
    if len(records) != 1 or metadata.get("has_more"):
        raise ValueError("Expected one all_cards entry in a complete metadata response")
    source = records[0]
    url = source.get("jsonl_download_uri") or source.get("download_uri")
    if not url:
        raise ValueError("Scryfall did not provide a supported download URL")
    validate_source_url(url)
    stamp = datetime.fromisoformat(source["updated_at"].replace("Z", "+00:00"))
    snapshot = "scryfall-all-cards-" + stamp.astimezone(timezone.utc).strftime("%Y%m%d%H%M%S")
    name = Path(urllib.parse.urlsplit(url).path).name
    if not re.fullmatch(r"[A-Za-z0-9._-]+", name):
        raise ValueError("Unsafe source filename")
    is_jsonl = bool(source.get("jsonl_download_uri"))
    expected = source.get("compressed_size") if is_jsonl else source.get("size")
    manifest = {
        "schema_version": 1, "parser_version": PARSER_VERSION,
        "snapshot_id": snapshot, "metadata_url": METADATA_URL,
        "metadata_retrieved_at": now(), "source": source,
        "download": {
            "url": url, "format": "jsonl" if is_jsonl else "json-array",
            "compression": "gzip" if name.endswith(".gz") else "none",
            "path": "data/raw/" + name,
            "expected_bytes": expected, "status": "pending",
        },
        "ingestion": {"status": "pending"},
    }
    return root / "data/manifests" / (snapshot + ".json"), manifest


def discover(root: Path = ROOT) -> Path:
    with request(METADATA_URL) as response:
        body = response.read(1024 * 1024 + 1)
    if len(body) > 1024 * 1024:
        raise ValueError("Unexpectedly large bulk metadata response")
    path, manifest = make_manifest(json.loads(body), root)
    if path.exists():
        previous = json.loads(path.read_text(encoding="utf-8"))
        if previous["download"]["url"] != manifest["download"]["url"]:
            raise ValueError("Snapshot identity already exists with a different source URL")
        print(f"Existing manifest: {path}", flush=True)
    else:
        write_json(path, manifest)
        print(f"Created manifest: {path}", flush=True)
    return path


def download(manifest_path: Path, root: Path = ROOT, opener=request) -> dict:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    info = manifest["download"]
    final = local_path(info["path"], root)
    final.parent.mkdir(parents=True, exist_ok=True)
    partial = final.with_name(final.name + ".part")
    if final.exists():
        if (info.get("status") == "complete"
                and final.stat().st_size == info.get("bytes")
                and checksum(final) == info.get("sha256")):
            print("Verified cached download; no network transfer needed.", flush=True)
            return manifest
        raise ValueError("Existing final download does not match its completed manifest")
    info.setdefault("started_at", now())
    info["status"] = "downloading"
    write_json(manifest_path, manifest)
    try:
        for attempt in range(3):
            offset = partial.stat().st_size if partial.exists() else 0
            validator = info.get("etag") or info.get("last_modified")
            # Without a server validator, restart rather than combine uncertain versions.
            resume = bool(offset and validator)
            headers = {"Range": f"bytes={offset}-", "If-Range": validator} if resume else {}
            try:
                with opener(info["url"], headers) as response:
                    status = response.status
                    if status == 206:
                        content_range = response.headers.get("Content-Range", "")
                        match = re.fullmatch(r"bytes (\d+)-(\d+)/(\d+)", content_range)
                        if not resume or not match or int(match[1]) != offset:
                            raise ValueError("Invalid partial response; refusing to concatenate")
                        total = int(match[3])
                        new_validator = response.headers.get("ETag") or response.headers.get("Last-Modified")
                        if new_validator and new_validator != validator:
                            raise ValueError("Source validator changed during resume")
                        mode = "ab"
                    elif status == 200:
                        offset = 0
                        length = response.headers.get("Content-Length")
                        total = int(length) if length is not None else None
                        mode = "wb"
                    else:
                        raise ValueError(f"Unexpected download status {status}")
                    expected = info.get("expected_bytes")
                    if expected is not None and total is not None and expected != total:
                        raise ValueError("Metadata size and HTTP response size disagree")
                    info.update({"status": "downloading", "etag": response.headers.get("ETag"),
                                 "last_modified": response.headers.get("Last-Modified"),
                                 "response_bytes": total})
                    write_json(manifest_path, manifest)
                    written = offset
                    last_progress = time.monotonic()
                    with partial.open(mode) as target:
                        while chunk := response.read(CHUNK):
                            target.write(chunk)
                            written += len(chunk)
                            if time.monotonic() - last_progress >= 10:
                                print(f"Downloaded {written / 1024**2:.1f} MiB"
                                      + (f" / {total / 1024**2:.1f} MiB" if total else ""), flush=True)
                                last_progress = time.monotonic()
                        target.flush()
                        os.fsync(target.fileno())
                    for bound in (total, expected):
                        if bound is not None and written != bound:
                            raise OSError(f"Incomplete download: {written} of {bound} bytes")
                break
            except (OSError, urllib.error.URLError) as error:
                # Respect access/rate-limit errors; never retry through them.
                if isinstance(error, urllib.error.HTTPError) and error.code < 500:
                    raise
                if attempt == 2:
                    raise
                print(f"Transfer interrupted; bounded retry {attempt + 1}/2: {error}", flush=True)
                time.sleep(2 ** attempt)
        info.update({"bytes": partial.stat().st_size, "sha256": checksum(partial),
                     "status": "complete", "completed_at": now(),
                     "content_validation": "pending-ingestion"})
        os.replace(partial, final)
        write_json(manifest_path, manifest)
        print(f"Download complete: {info['bytes']:,} bytes; SHA-256 {info['sha256']}", flush=True)
        return manifest
    except Exception as error:
        info.update({"status": "failed", "last_error": str(error), "failed_at": now()})
        write_json(manifest_path, manifest)
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("discover")
    downloader = commands.add_parser("download")
    downloader.add_argument("--manifest", required=True, type=Path)
    args = parser.parse_args()
    if args.command == "discover":
        discover()
    else:
        download(args.manifest.resolve())


if __name__ == "__main__":
    main()
