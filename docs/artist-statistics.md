# Artist identities and counting contract

WBS 3.0, contract version 1.0.0, reviewed 2026-10-11. The [reconciliation report](../reports/artist-reconciliation.md) is the readable result; [artist-validation.json](../reports/artist-validation.json) records the checks. This is offline data preparation. No hosted service, account credentials or paid resources are used.

## Inputs and identity

The inputs are the complete WBS 1 Scryfall snapshot `scryfall-all-cards-20261011091913` and frozen WBS 2 event snapshot `magiccon-atlanta-2026-20261011T195408Z`. Their manifests pin paths, retrieval times and checksums. Neither the card database nor the original event snapshot was modified in WBS 3.

`artist_key` is `scryfall-<UUID>` and survives spelling changes. The registry preserves 2,434 explicit source UUIDs, with a list of observed single-ID credits and their provenance. The most frequently observed single-ID credit is the preferred source display name; it is not a legal-name assertion. A UUID without a single-ID name observation has a null name. Do not split a joint credit on punctuation or assume name order matches UUID order. Do not merge two different UUIDs because their names look similar.

The event mapping has a separate stable key `atlanta-2026-guest-<guest ID>`. Both raw event-section names are preserved, including spaces and case. The event table's `magiccon_artist_name` is the guest name; `magiccon_exhibitor_name` is the showroom name. The `scryfall_name_variants` array includes the preferred name and all other observed names for that UUID.

Candidate discovery uses exact names, NFKC/case/whitespace normalization, then accent/punctuation and fuzzy suggestions. Only explicit frozen decisions in [artist-match-review.json](../data/curated/artist-match-review.json) approve an event match. Each decision records the expected source names, UUID, primary evidence, method and review date. Changed names or snapshot IDs invalidate the old decision. The 62 unique exact/normalized candidates and three substantive aliases were reviewed in this run; future candidates are not automatically approved.

Six attendees have multiple single-ID Scryfall names: Andrea Radeck, Chris Rahn, Mark Tedin, Phil Foglio, Steve Prescott and Tyler Jacobson. These variants remain connected by the source UUID. The artist registry labels verified event people as individuals; other source identities remain `unknown` rather than guessing studio membership.

## Scope and metrics

The default scope is **paper game cards present in the dated snapshot**, regardless of legality or release date. It includes promos, alternate frames, basic lands, Conspiracies, Attractions, Contraptions, silver-border and other unusual game cards. Upcoming previews already present in the snapshot are included. This is not a released-before-event-only filter.

The WBS 1 broad category is refined here, without rewriting the baseline. Supplemental layouts include tokens, double-faced tokens, emblems, art series, planar, scheme, vanguard and front cards. Type lines beginning with Token, Emblem, Card, Dungeon, Hero or Stickers are also supplemental. A reversible card takes the category of its faces; mixed face categories fail validation for review. The one reversible Mechtitan token is therefore excluded from game-card totals. The seven saved [real printing fixtures](../tests/fixtures/artist-counting.json) include this case.

| Column | Exact meaning |
| --- | --- |
| `unique_cards_total` | Distinct credited Oracle IDs on eligible game cards. For a reversible card, use only the face Oracle IDs explicitly credited to the artist. Ordinary split/transform/modal cards count their shared root Oracle once. |
| `printing_editions_total` | Distinct edition keys among eligible records. The key contains set code, collector number (including suffixes), layout, ordered artwork/credit units, ordered face illustration/credit identities and root artist IDs. It omits language and finishes. |
| `language_printings_total` | Distinct eligible Scryfall printing IDs, including translated printings. |
| `unique_artworks_total` | Distinct known illustration IDs explicitly credited to the artist on eligible records. A shared illustration credits each explicit contributor. Different face illustrations remain separate. |
| `supplemental_objects_total` | Distinct `(supplemental category, Oracle ID)` pairs among paper supplementary objects. Reversible objects use their credited face Oracle IDs. If an Oracle ID is absent, retain a `printing:<UUID>` fallback rather than infer equality. |
| `supplemental_printings_total` | Distinct paper supplemental printing IDs. |
| `missing_oracle_id_total` | Eligible printing IDs credited to this artist with an absent relevant root/face Oracle identity; excluded from the distinct-card total. |
| `missing_illustration_id_total` | Eligible printing IDs where an expected artwork unit explicitly credited to this artist lacks an illustration ID. One affected printing counts once even if several faces are missing IDs. |
| `edition_fallback_printings_total` | Eligible printing IDs whose edition key additionally includes their printing UUID because artwork identity or attribution is incomplete. This avoids merging uncertain records; it can overcount translated editions. |
| `artwork_attribution_gap_printings_total` | Eligible printing IDs with a visual unit lacking artist IDs, or where root credits cannot all be assigned to the known units. Missing attribution is not guessed. |
| `digital_only_printings_total` | Nonpaper printing IDs with digital/Arena/MTGO availability. A paper-and-digital record belongs to the paper scope. |
| `other_nonpaper_printings_total` | Nonpaper records without a digital availability signal. |
| `all_records_total` | All distinct source printing IDs attributed to this artist, across scopes. |

Split, adventure, flip and prepare layouts ordinarily share a printed image. Their root illustration is one artwork unit; a text-only secondary face without an illustration ID does not introduce a false gap. Any explicitly different face illustration is retained. Separate-image faces use their own explicit artist and illustration IDs. A root list of two artists does not establish which artist painted an otherwise uncredited face.

The edition key is conservative: matching languages merge only when all relevant known identities agree. Language-specific alternate artwork remains a separate edition. Collector-number suffixes and face order remain significant. A finish does not manufacture a new edition or artwork. The edition count may be higher than a collector's informal set/number count when source identities differ or are incomplete.

Counts can overlap between artists. Never sum per-artist card counts as a global unique-card count. The audit computes global unions separately; those global unions describe explicitly credited objects, not the coverage of uncredited objects.

## Joins, unknowns and links

Generate the complete source identity table first, then left-join every roster attendee through reviewed mappings. `verified` with no eligible cards means numeric **0**. An unresolved attendee has **null** counts and remains in the event export. IDs without a known individual name can still have reproducible source counts; they cannot become an event match through a guessed name.

`not_listed_in_snapshot` describes a source identity without a verified event association. It does not claim that person canceled or will never attend. The discrepancy queue separates unresolved attendees, verified zero-card attendees, missing source credits, unnamed source UUIDs, and source artists absent from the roster. Each missing-credit record and edition fallback is individually identifiable by printing ID.

Portrait and official profile URLs come from the frozen event record. `website_url` is the first usable published website-field link; it is null if that field has no usable destination. `social_links` contains platform-classified link observations. `published_links` preserves **all** event links, including mislabeled website/gallery fields, original strings, duplicate source observations and invalid destinations. Later UI code must use the retained `usable_url` and status rather than turn an invalid source string into an active link. A website placed in a social field is still available in `published_links`.

Scryfall browsing links search the observed single-ID names, including variants, with quoted artist terms. They are for navigation. Totals are computed from UUIDs and the local snapshot, not Scryfall web-result counts. Unnamed IDs have no guessed name-search URL. Source timestamps, event retrieval times, mapping review dates and evidence URLs remain in each table. The two JSON files also contain shared snapshot provenance and the statistics script checksum.

## Reproduce and verify

First reproduce WBS 1 and WBS 2 if their ignored staging files are absent; see [data-baseline.md](data-baseline.md) and [event-data.md](event-data.md). Preserve or explicitly review changes to the identity decisions before accepting a different source snapshot. Then run from the repository root with Python 3.12 or later:

```powershell
python scripts/data/artist_reconciliation.py
python scripts/data/artist_statistics.py
python scripts/data/artist_reports.py --write-csv
python -m unittest discover -s tests -v
```

The scripts use the standard library and do not fetch data. The statistics pass verifies the frozen 4.8 GB database checksum and streams all 546,137 source objects. Allow roughly two minutes and several hundred MB of working memory on a typical development computer. Outputs are local JSON/CSV/Markdown files and a checksum manifest. Generated timestamps may change on rerun; row contents and counts are deterministic for unchanged inputs and scripts.

The initial CSVs were authored and inspected in the bundled spreadsheet runtime. Its public documentation did not expose native CSV export, and its worksheet reader coerced timestamp text to dates. The authoring builder checked those timestamps against the original instants and restored their exact source spelling/precision before RFC 4180 serialization. Both resulting files passed a byte-for-byte comparison against `artist_reports.py`'s portable stdlib serializer. Reproduction does not require that desktop-only dependency.

Run `python scripts/data/artist_reports.py` without `--write-csv` to verify existing exports and regenerate the readable report, evidence and manifest. It rejects stale mapping/review or statistics hashes, lost roster rows, null/zero mistakes, CSV differences and count disagreements. Independent SQL over the normalized WBS 1 credit relationships validates the paper scope and distinct-card/language-printing counts for all 65 attendees. Six biography-named works are checked against actual printing credits.

CSV uses UTF-8 with BOM and CRLF, a header row, no formulas and no spreadsheet styling. Null is an empty cell; zero is `0`. Arrays and objects are compact JSON cells. Source strings beginning with a spreadsheet formula trigger receive a protective apostrophe in CSV only. The JSON exports are the authoritative raw-value representation.

The full outputs and evidence are listed in [the statistics manifest](../data/manifests/artist-statistics-atlanta-2026.json). Large raw files, the database and temporary spreadsheet authoring files stay ignored. WBS 3 does not create a website, importer, logo, GitHub repository or Cloudflare deployment. WBS 4 begins only after the owner's next request.
