import io
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts/data"))
from scryfall_source import download, make_manifest, validate_source_url, write_json


class Response(io.BytesIO):
    def __init__(self, data, status=200, **headers):
        super().__init__(data)
        self.status = status
        self.headers = headers


class SourceTests(unittest.TestCase):
    def source(self, root, payload=b"example"):
        path, manifest = make_manifest({"data": [{
            "id": "fixture", "type": "all_cards", "updated_at": "2026-10-11T09:19:13Z",
            "jsonl_download_uri": "https://data.scryfall.io/all-cards/example.jsonl.gz",
            "compressed_size": len(payload),
        }]}, root)
        write_json(path, manifest)
        return path, manifest

    def test_discovery_prefers_actual_jsonl_metadata(self):
        with tempfile.TemporaryDirectory() as folder:
            _, manifest = self.source(Path(folder))
            self.assertEqual(manifest["download"]["format"], "jsonl")
            self.assertEqual(manifest["download"]["expected_bytes"], 7)

    def test_exact_download_and_cache_checksum(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            path, _ = self.source(root)
            result = download(path, root, lambda *args: Response(b"example", **{"Content-Length": "7"}))
            self.assertEqual(result["download"]["bytes"], 7)
            result = download(path, root, lambda *args: self.fail("Cache must avoid the network"))
            self.assertEqual(result["download"]["status"], "complete")

    def test_resume_with_validator_and_content_range(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            path, manifest = self.source(root)
            manifest["download"]["etag"] = '"v1"'
            write_json(path, manifest)
            partial = root / (manifest["download"]["path"] + ".part")
            partial.parent.mkdir(parents=True)
            partial.write_bytes(b"exa")
            def opener(url, headers):
                self.assertEqual(headers["Range"], "bytes=3-")
                self.assertEqual(headers["If-Range"], '"v1"')
                return Response(b"mple", 206, **{"Content-Range": "bytes 3-6/7", "ETag": '"v1"'})
            download(path, root, opener)
            self.assertEqual((root / manifest["download"]["path"]).read_bytes(), b"example")

    def test_ignored_range_restarts_instead_of_appending(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            path, manifest = self.source(root)
            manifest["download"]["etag"] = '"v1"'
            write_json(path, manifest)
            partial = root / (manifest["download"]["path"] + ".part")
            partial.parent.mkdir(parents=True)
            partial.write_bytes(b"wrong")
            download(path, root, lambda *args: Response(b"example", **{"Content-Length": "7"}))
            self.assertEqual((root / manifest["download"]["path"]).read_bytes(), b"example")

    def test_invalid_resume_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            path, manifest = self.source(root)
            with self.assertRaises(ValueError):
                download(path, root, lambda *args: Response(b"example", 206, **{"Content-Range": "bytes 0-6/7"}))
            self.assertFalse((root / manifest["download"]["path"]).exists())
            self.assertEqual(json.loads(path.read_text())["download"]["status"], "failed")

    def test_size_mismatch_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            path, manifest = self.source(root)
            with self.assertRaises(ValueError):
                download(path, root, lambda *args: Response(b"bad", **{"Content-Length": "3"}))
            self.assertFalse((root / manifest["download"]["path"]).exists())

    def test_only_scryfall_https_sources(self):
        for url in ("http://api.scryfall.com/x", "https://scryfall.com.attacker.test/x", "https://user:pass@api.scryfall.com/x"):
            with self.assertRaises(ValueError):
                validate_source_url(url)


if __name__ == "__main__":
    unittest.main()
