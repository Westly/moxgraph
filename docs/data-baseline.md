# Card-data baseline — WBS 1.0

This phase collects Scryfall card data only. It does not collect MagicCon attendees, reconcile event names, calculate the later per-artist illustrated-card totals, or build/deploy the website.

## Initial baseline results

Snapshot `scryfall-all-cards-20261011091913` passed validation on 2026-10-11:

- **546,137** source records and unique printing IDs; **24,629** face records.
- **2,434** source artist IDs, **19** language codes, and **1,058** set codes.
- **537,000** paper printings and **9,137** digital-only printings, with both groups preserved.
- **Zero** duplicate IDs, quarantined records, unaccounted records, ambiguous printing tuples, or foreign-key violations. SQLite integrity returned `ok`.
- **936** records lack artist credits/IDs; **784** lack illustration IDs. These are source gaps, not ingestion failures. Missing-credit records include 527 in Scryfall's `unk` (Unknown Event) set and various supplementary/playtest/punchcard records; the remainder must not be assumed to have the same cause.
- **28** artist IDs have multiple observed single-ID credit strings, including `Nana Qi` / `PuffyGator`. They are retained as source observations, without guessing an event-name mapping.
- **230** joint-credit combinations are preserved unsplit. **93** artist IDs have no unambiguous single-ID name observation in this snapshot; their joint-credit evidence and example printings remain in the catalogue. These need careful handling during WBS 3.0 reconciliation.
- **15** representative real fixture records cover all requested baseline fixture categories. The current test suite has **13 passing tests**.

The compressed input is 396,208,251 bytes (about 378 MiB). The local SQLite database is 4,849,082,368 bytes (about 4.52 GiB), including complete original JSON objects. Both are ignored by Git. The artist catalogue is about 1.38 MiB. Artifact lengths and SHA-256 checksums were verified after generation, and all coverage-group counts sum to the stored printing total.

There are **no blockers to completing WBS 1.0**. Missing credits and uncertain joint-credit name associations remain explicit data-quality limitations for later matching, not silently filled values.

## Reproduce the baseline

Requirements: Python 3.12 or later with its standard SQLite support. The WBS 1 scripts use only the standard library; no package installation, API key, or paid service is needed. Run commands from the repository root.

```powershell
python -m unittest discover -s tests -v
python scripts/data/scryfall_source.py discover
```

Discovery reads the [Scryfall bulk metadata](https://api.scryfall.com/bulk-data), selects `all_cards`, and prints the manifest path for the current snapshot. Use that exact manifest with both subsequent commands. For the initial snapshot:

```powershell
python scripts/data/scryfall_source.py download --manifest data/manifests/scryfall-all-cards-20261011091913.json
python scripts/data/scryfall_catalogue.py --manifest data/manifests/scryfall-all-cards-20261011091913.json
```

The initial upstream timestamp is `2026-10-11T03:19:13.375-06:00`, equivalent to `2026-10-11T09:19:13.375Z`. Discovery prefers the advertised gzip JSONL URL; it also recognizes the older JSON-array metadata field. The dated download URL is discovered, not hardcoded in the downloader.

To reproduce an existing local database, use the same ingestion command with `--rebuild`. This replaces generated artifacts for that snapshot, so preserve any independently modified staging data first. Normal runs refuse to overwrite a completed database or an interrupted staging database. Raw source records are never edited.

## Files and provenance

| Path | Purpose | Git policy |
| --- | --- | --- |
| `data/manifests/scryfall-all-cards-20261011091913.json` | Source metadata, dates, byte counts, checksums, parser identity, completion state, artifact references | Track |
| `data/raw/all-cards-20261011091913.jsonl.gz` | Complete compressed source snapshot | Ignore |
| `data/staging/scryfall-all-cards-20261011091913.sqlite` | Complete source objects plus indexed printing/face/artist fields | Ignore |
| `data/catalogues/scryfall-all-cards-20261011091913-artists.json` | All observed source artist identities, credit strings, unresolved joint credits, and name collisions | Track |
| `reports/card-data-quality.json` | Full coverage, missing fields, ambiguous tuples, integrity/foreign-key checks, and index plans | Track |
| `reports/card-data-quality.md` | Readable audit summary | Track |
| `tests/fixtures/scryfall-printings.json` | Small representative real source records, including printing/art differences | Track |

The manifest stores the SHA-256 of the raw file and generated artifacts. It also records the ingester's source-code checksum. Byte-for-byte identical raw input is identified by checksum; generated reports contain run timestamps and therefore are not expected to have identical bytes across reruns. Counts, source objects, artist observations, and selected fixture identities should reproduce with the same parser.

The downloaded metadata supplies a compressed byte count, not an upstream checksum or total record count. We compare the advertised and HTTP lengths with the received bytes, calculate our own SHA-256, read the gzip stream to EOF (including its CRC/trailer), and account for every parsed object. This verifies completeness against the dated supplied file; it is not an independent census of everything outside Scryfall's source.

## Download and interruption behavior

- Downloads go to `.part` files. They become final files only after byte-count validation and checksum calculation.
- Rerunning the download verifies an existing completed file and avoids another network transfer.
- A partial file resumes only with a saved ETag or Last-Modified validator and a matching `206 Content-Range` response. If the server returns the entire object, the partial file is overwritten rather than appended.
- Without a validator, the downloader restarts. There are at most two automatic transfer retries. HTTP access/rate-limit errors are surfaced rather than retried through.
- A download marked complete is not yet a completed data baseline. Content validation remains pending until full ingestion and integrity checks succeed.
- Ingestion writes a `.sqlite.partial` database. Malformed/truncated input or failed integrity checks cannot activate it as the completed baseline. Failed records and duplicated printing IDs are quarantined and block a successful release report.
- On a failed run, inspect the manifest error and any `reports/<snapshot>-failed.json`. Correct the cause and rerun with `--rebuild`. The raw file remains available; do not refetch it unless its integrity failed.

## Preservation and identity rules

Every valid source printing is stored once by Scryfall `id`, with its original complete JSON in `printings.source_json`. The compressed source remains the byte-level reference. Unknown or future fields are retained even when they do not have a dedicated SQL column.

Language, set, collector number, available finishes, layout, game flags, selected source images, original credit text, source artist IDs, and face-level fields are preserved. Collector numbers are strings. No language, game, set, digital-only record, token, emblem, or art card is filtered out. A staging category labels known layouts while retaining the original flags for later counting-scope decisions.

`finishes` lists the finishes available for a printing. It does not identify a visitor's selected finish; that belongs to the future deck importer. No physical copies, attendee matches, or per-artist card totals are inferred here.

The artist catalogue uses Scryfall IDs as source identities. A whole credit string linked to a single ID is retained as an observed name. With multiple IDs, the complete credit and unordered identity association remain explicit; the script never splits `A & B` and pairs words with IDs by array order. Face-specific artist IDs provide separate observations. Names are normalized only to flag collisions, never to merge identities automatically.

Missing names/IDs remain missing. They are counted in the report and preserved for later review. A shared normalized spelling attached to different source IDs appears in the collision queue. No mapping has yet been reviewed against MagicCon.

## SQLite tables and indexes

| Table | Contents |
| --- | --- |
| `metadata` | Snapshot, raw checksum, parser/schema versions, and completed/building status |
| `printings` | Exact source IDs, printing attributes, preservation/coverage flags, and full original JSON |
| `faces` | Ordered face records with original face JSON and optional Oracle/artist/illustration IDs |
| `artists` | Distinct Scryfall artist IDs observed at root or face level |
| `credits` | Original root/face credit strings and their original ID arrays |
| `credit_artists` | Many-to-many credit-to-source-artist associations |
| `artist_names` | Single-ID credit observations, scoped to root/face and counted as observations |
| `quarantine` | Invalid or duplicate input records, their ordinals, original data, and reasons |

The printing ID primary key is the preferred lookup. `printings_by_tuple` indexes set, collector number, and language without asserting that every tuple is unique. Multiple records are returned explicitly. Additional indexes cover Oracle IDs, card names, face artists, credit text, and artist associations. The audit report records SQLite query plans to demonstrate that exact-ID and tuple lookups use indexes.

## Inspect exact records

```powershell
python scripts/data/scryfall_lookup.py --database data/staging/scryfall-all-cards-20261011091913.sqlite --id 0000419b-0bba-4488-8f7a-6194544ce91e
python scripts/data/scryfall_lookup.py --database data/staging/scryfall-all-cards-20261011091913.sqlite --set blb --number 280 --lang en
```

Add `--full` for the complete source objects. The command opens the database read-only and requires either a printing ID or all three tuple fields. It returns `one_record`, `multiple_records`, or `not_found`; it never picks the first ambiguous result, substitutes by name, or assumes a language.

## Validation

The test suite covers selected-printing differences, non-English strings, symbolic collector numbers, multiple finishes, distinct face artists, unsplit joint credits, missing IDs, duplicate and ambiguous identities, download resume/restart, changed checksums, malformed JSON arrays, and truncated gzip input. Synthetic fixture records are explicitly test-only. The generated fixture file contains real source records for later integration tests.

Successful full-data ingestion requires every object to be accounted for, zero quarantined/duplicate IDs, SQLite integrity `ok`, and no broken foreign keys. Data-quality gaps such as absent credit IDs or non-unique tuples are reported without inventing replacements. All language, set, layout, and game-group counts are available in the JSON report.

Read `ROADMAP.md` for the current WBS stopping point. Event collection is WBS 2.0 and requires a separate owner request.
