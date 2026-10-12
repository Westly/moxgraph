"""WBS 4 research only: minimize saved public payloads; no network or app importer."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data/raw/import-feasibility"
OUT = ROOT / "tests/fixtures/import-feasibility"


def pick(value, keys):
    return {k: value[k] for k in keys.split() if k in value}


def card(value):
    result = pick(value, "id uniqueCardId scryfall_id name set cn lang layout artist")
    result["card_faces"] = [pick(f, "id name artist") for f in value.get("card_faces", [])]
    return result


def moxfield(source):
    result = pick(source, "publicId name enableMultiplePrintings version lastUpdatedAtUtc")
    result["boards"] = {}
    for name, board in source["boards"].items():
        lines = {}
        for key, value in board["cards"].items():
            line = pick(value, "quantity boardType finish isFoil isAlter isProxy")
            line["card"] = card(value["card"])
            if "printingData" in value:
                line["printingData"] = []
                for printing in value["printingData"]:
                    item = pick(printing, "id quantity finish isFoil isAlter isProxy hash lang set cn")
                    if "card" in printing:
                        item["card"] = card(printing["card"])
                    line["printingData"].append(item)
            lines[key] = line
        result["boards"][name] = {"count": board["count"], "cards": lines}
    return result


def moxfield_v2(source):
    boards = {k: {"count": source[k + "Count"], "cards": source[k]} for k in source
              if k + "Count" in source and isinstance(source[k], dict)}
    result = moxfield({**source, "boards": boards})
    for key, value in result.pop("boards").items():
        result[key] = value["cards"]
        result[key + "Count"] = value["count"]
    result["tokens"] = [card(c) for c in source["tokens"]]
    return result


def archidekt(source):
    result = pick(source, "id name private unlisted")
    result["categories"] = [pick(c, "name isPremier includedInDeck") for c in source["categories"]]
    result["cards"] = []
    for value in source["cards"]:
        line = pick(value, "id categories companion flippedDefault modifier quantity")
        c = value["card"]
        line["card"] = pick(c, "id uid artist collectorNumber displayName")
        line["card"]["edition"] = pick(c["edition"], "editioncode editionname")
        line["card"]["oracleCard"] = pick(c["oracleCard"], "uid name lang layout")
        result["cards"].append(line)
    return result


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sources = []
    for path in sorted(RAW.glob("moxfield-*.response")) + sorted(RAW.glob("moxfield-v2-*.json")) + [RAW / "archidekt-deck.json"]:
        data = path.read_bytes()
        provider = "moxfield" if path.name.startswith("moxfield-") else "archidekt"
        version = "v2" if path.name.startswith("moxfield-v2-") else ("v3" if provider == "moxfield" else None)
        transform = moxfield_v2 if version == "v2" else (moxfield if provider == "moxfield" else archidekt)
        value = transform(json.loads(data))
        identity = value.get("publicId", value.get("id"))
        output = OUT / f"{provider}-{'v2-' if version == 'v2' else ''}{identity}.json"
        output.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        sources.append({"provider": provider, "apiVersion": version, "deckId": identity,
                        "sourceUrl": f"https://{provider}.com/decks/{identity}",
                        "apiUrl": f"https://{'api' if version == 'v2' else 'api2'}.moxfield.com/{version}/decks/all/{identity}" if provider == "moxfield" else f"https://archidekt.com/api/decks/{identity}/",
                        "rawSha256": hashlib.sha256(data).hexdigest(), "rawBytes": len(data),
                        "fixture": output.relative_to(ROOT).as_posix(),
                        "fixtureSha256": hashlib.sha256(output.read_bytes()).hexdigest()})
    (OUT / "sources.json").write_text(json.dumps({"schemaVersion": 1, "observedDate": "2026-10-11",
        "note": "Anonymous public reads. Whitelisted deck/printing fields only; no owner profiles, descriptions, prices, credentials or unrelated metadata.",
        "sources": sources}, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(sources, indent=2))


if __name__ == "__main__":
    main()
