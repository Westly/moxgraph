"""Bounded, anonymous header diagnostics; not a substitute for browser testing."""
import json
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TARGETS = {
    "moxfield": "https://api.moxfield.com/v2/decks/all/3x55_3CFz060qxL2xac3NA",
    "archidekt": "https://archidekt.com/api/decks/19780118/",
}

if __name__ == "__main__":
    origin = sys.argv[1]
    results = []
    for provider, url in TARGETS.items():
        request = urllib.request.Request(url, headers={"Origin": origin, "User-Agent": "moxgraph-feasibility/0.1 (public-deck CORS check)"})
        try:
            response = urllib.request.urlopen(request, timeout=30)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            headers = {k.lower(): v for k, v in response.headers.items()
                       if k.lower().startswith(("access-control-", "ratelimit", "x-ratelimit"))
                       or k.lower() in {"content-type", "vary", "retry-after", "cf-mitigated"}}
            item = {"observedAt": datetime.now(timezone.utc).isoformat(), "provider": provider,
                    "url": url, "requestOrigin": origin, "status": response.status, "headers": headers}
            results.append(item)
        time.sleep(2)
    path = ROOT / "reports/import-http-headers.json"
    prior = json.loads(path.read_text()) if path.exists() else []
    path.write_text(json.dumps(prior + results, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(results, indent=2))
