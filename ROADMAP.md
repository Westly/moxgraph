# moxgraph.com — project roadmap and work breakdown structure

Last updated: 2026-10-12  
Website name and production domain: **moxgraph.com** (confirmed by the owner).  
Initial event: **MagicCon: Atlanta, November 13–15, 2026**.  
Current milestone: **WBS 10.0 in progress; 10.1 authenticated Westly and public Westly/moxgraph created for 10.2. Previous release validation: correctness/storage, accessibility, browser-scope, performance, security and Free relay checks recorded. 125 tests and the static build pass. Optimized relay CPU P99 is 7.12 ms in the bounded live sample; both browser importers work. No WBS 9 blockers. Complete WBS 10 only, then stop before WBS 11.**  
Execution scope: **one parent WBS per owner request. Stop at the parent boundary; do not advance automatically.**

## Project objective

Build a small, clean website that accepts a public Moxfield or Archidekt deck link, preserves the selected printing of every card, and shows which of those cards were illustrated by artists attending MagicCon. Visitors can group and sort their cards by artist, open the official artist profiles and social links, and return to their saved decks on the same browser without an account.

The production website will consist of static files hosted in the owner's Cloudflare account, with its source in the owner's GitHub repository. Changes to the production branch will trigger deployment. Deck storage and matching will run in the visitor's browser. Data preparation may run on a development computer or during CI. On 2026-10-11 the owner approved a narrow exception to the original no-server requirement: a Cloudflare Free Worker retrieves public deck JSON from fixed provider endpoints. It stores no decks and performs no artist matching.

**Required execution order:** collect the complete card/printing/artist dataset → collect the event artists and profile information → reconcile names and generate the artist totals table → implement and validate the website → publish.

This file is the implementation reference. Its unchecked items describe future work, not completed capabilities. WBS 1.0 processed the complete dated Scryfall `all_cards` snapshot. WBS 2.0 collected and audited 130 source entries and profiles representing 65 attendees. WBS 3.0 reconciled all 65 attendees, preserved 2,434 source artist identities, and generated both requested totals tables. WBS 4.0 resolved transport feasibility through the owner-approved Free Worker. WBS 5.0 built and tested the local app foundation and complete compact catalogue. WBS 6.0 added the original brand assets and responsive interface. WBS 7.0 replaced the UI example with working link/export imports, exact matching and reviewable results. WBS 8.0 added browser-local saved decks, validated backups and recovery. WBS 9.0 validated the release, corrected accessibility semantics, added security/cost guards and deployed the approved relay rate/CPU update. The remote repository and production deployment remain later work. Deployed artifacts are still limited to the WBS 4.3 static research probe and WBS 4.7 retrieval relay.

## Requirements and scope

| ID | Requirement | Completion evidence |
| --- | --- | --- |
| R01 | Import public Moxfield and Archidekt deck links | Successful imports from the production origin, with printing identifiers compared against source decks |
| R02 | Compare artists for the selected printing | Exact-print fixtures pass; changing a card's printing can change its artist match |
| R03 | Preserve quantities and deck sections | Main deck, commander, sideboard, and optional sections reconcile to the source |
| R04 | Show attending artists and their official information | Every published attendee has source provenance and an official profile link when provided |
| R05 | Keep photos and social links from MagicCon | Each available photo/link is associated with the correct individual profile |
| R06 | Resolve name differences explicitly | Reviewed mapping between Scryfall names/IDs and MagicCon names/guest IDs |
| R07 | Provide artist totals | Reproducible table with clearly defined card, printing, and artwork counts |
| R08 | Save decks locally without login | Reload, update, deletion, backup, restore, and unavailable-storage cases verified |
| R09 | Keep frontend static and hosting within free limits, with the owner-approved retrieval Worker exception | Static build has no handler; separate relay has fixed public provider routes, no storage/paid bindings; active Free plan and account/asset/build limits checked |
| R10 | Deploy from the user's GitHub repository | A production-branch change produces the expected Cloudflare deployment |
| R11 | Keep the interface simple and accessible | Mobile and desktop import-to-results flow passes keyboard and visual QA |
| R12 | Keep progress traceable | Stable WBS IDs, acceptance evidence, decision log, and next task updated here |

First release includes one event, multiple saved decks, artist grouping, card search, exact printing details, official profile/social links, and browser backup/restore. No accounts, advertising, prices, payment system, collection valuation, or live server database are planned. An optional printable signing list is a small follow-up once the core flow works.

## Verified findings and open feasibility questions

### Findings checked on 2026-10-11

- The supplied [Art of Magic page](https://mcatlanta.mtgfestivals.com/en-us/art-of-magic.html) identifies the Atlanta event and points to a separate [Artist Directory](https://mcatlanta.mtgfestivals.com/en-us/art-of-magic/artist-directory.html). That directory must be followed; the overview alone is not the full roster.
- A direct read of [Scryfall bulk metadata](https://api.scryfall.com/bulk-data) confirmed the `all_cards`, `default_cards`, `oracle_cards`, and `unique_artwork` datasets. `all_cards` is the planned source because it includes every language. Oracle-only and unique-art-only snapshots are insufficient to preserve every selectable printing.
- Scryfall distinguishes printing IDs from Oracle identities and provides artist/illustration fields, including face-level fields. The public [Scryfall type definitions](https://github.com/scryfall/api-types/blob/main/src/objects/Card/CardFields.ts) were inspected to ground the data model. Some direct documentation requests returned HTTP 403; that did not prevent reading the bulk metadata.
- [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/) supports deployments on repository changes. Its [pricing documentation](https://developers.cloudflare.com/pages/functions/pricing/) says static asset requests are free and unlimited when they do not invoke Functions.
- The current Pages Free [limits](https://developers.cloudflare.com/pages/platform/limits/) include 500 builds/month, one concurrent build, a 20-minute build timeout, 20,000 files, and a 25 MiB maximum individual asset. Recheck before launch.
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) is suitable for structured browser-local deck storage. Storage is origin-specific; a preview URL and the final domain do not share saved decks.

### Questions that must be resolved through implementation evidence

1. **Direct provider CORS remains blocked; the approved relay works.** The original Moxfield/Archidekt HTTPS preview failures are retained in `docs/import-feasibility.md`. WBS 4.7 deployed a fixed-provider Free Worker after explicit owner approval; real HTTPS browser reads succeed for both personal Moxfield decks and the Archidekt fixture, and selected printing rows match direct-provider fixtures. See `docs/import-blocker-resolution.md` and D01. Final-domain cross-origin browser testing remains required.
2. **Printing data verified in WBS 4.0, with explicit limits.** Moxfield v2 selected-printing UUIDs/tuples verify for 111/111 Soldiers lines and 125/126 Orzhov lines; one historical Arcane Signet ID/tuple is absent from the frozen catalogue and now has a narrowly guarded reviewed alias in `data/curated/printing-aliases.json` (original fields preserved). Archidekt API and configured CSV agree on all 114 lines. Moxfield text export lacks explicit language and considering cards. Expand `printingData` children and preserve unresolved cases; provider internal IDs are not Scryfall IDs.
3. **Event extraction resolved for the initial snapshot in WBS 2.0.** Public feeds underlying both Art of Magic sections yielded 65 guest and 65 exhibitor entries. All 130 individual profiles were fetched; rendered roster IDs independently agree. Future source/renderer changes require a new audit. See `reports/attendance-coverage.md`.
4. **Project destinations are recorded in WBS 0.0.** The owner selected `moxgraph.com` and a public `Westly/moxgraph` repository. GitHub identity and the signed-in Cloudflare account containing the domain were verified. Repository/project creation and their write/deployment permissions remain later-phase work; the local repository still has no remote or commits.

**Launch gate:** R01 requires real imports from the final domain, exact-print validation and explicit unresolved states. The owner approved the fixed-provider Free Worker as the narrow CORS exception in WBS 4.7; do not add general-purpose proxies, embedded secrets or further services. A file-only release would still be a scope change, not full delivery of both link importers. Provider authentication/access failures must remain explicit.

## Proposed architecture

These are implementation decisions for this project, subject to the feasibility checks above.

| Layer | Proposed implementation | Reason |
| --- | --- | --- |
| Interface | Semantic HTML, TypeScript modules, native CSS, small Vite build | Clear component boundaries and a static output without a full application framework |
| Production hosting | Cloudflare Pages Free with no Functions | Native GitHub integration and a straightforward static deployment |
| Public deck retrieval | Separate Cloudflare Free Worker; fixed Moxfield v2 and Archidekt GET routes | Owner-approved CORS exception; no credentials, cache, database or persistent deck storage |
| Public data | Versioned JSON files and compact lookup shards | No runtime database or data-service bill |
| Data preparation | Python, streaming JSON parsing, local SQLite staging | Process the full bulk file without loading it all into memory; SQLite is a build tool only |
| User data | IndexedDB; small preferences in localStorage | Deck snapshots remain on the visitor's device; no deck cookies needed |
| Card matching | Browser code using published printing/artist indexes | Exact matching remains available without an application server |
| Images | Lazy-loaded card images and official artist portraits | Avoid downloading or deploying a complete image archive |
| Delivery | GitHub production branch → Cloudflare build/checks → static deployment | Repository updates automatically publish passing builds |

Cloudflare currently [recommends Workers for new projects](https://developers.cloudflare.com/pages/). Pages remains the proposed frontend choice because its documented static hosting and native Git integration fit this small site. Revalidate availability during setup. Preserve static frontend delivery and the narrow retrieval-only Worker boundary; review free limits before any deployment-design change.

```text
DATA PREPARATION — development/CI only
Scryfall all_cards → complete printing catalogue → artist identities
                                                ↓
MagicCon directory + profiles → attendance → reviewed artist mappings
                                                ↓
                    validated totals + versioned static lookup files
                                                ↓
                         GitHub → Cloudflare static build

VISITOR'S BROWSER
Public deck link → fixed-provider Free Worker → browser adapter
                                             ↓
                                   exact printing resolution
                                             ↓
                        printed artist IDs ∩ event attendance
                                             ↓
                         artist groups + card printing details
                                             ↕
                                      local IndexedDB
```

The site needs internet access for a new link import and uncached images. Under the approved exception, Cloudflare executes public deck retrieval while application state, matching and saved decks remain in the browser. There is no managed server or database. An offline/PWA cache can be considered later after the core storage and update rules are stable.

## WBS execution rules

- Keep IDs stable. Add new work as a subtask; do not renumber completed work.
- Work only inside the parent WBS explicitly selected by the owner. Complete its children in order, report its exit status, and wait for the owner to request the next parent. Do not start later-parent tasks merely because their dependencies are satisfied.
- `[ ]` means planned; `[x]` means completed with evidence. Add `IN PROGRESS` or `BLOCKED: reason` beside a task when appropriate.
- Finish each phase's exit criteria before treating its dependent milestone as complete.
- Record source timestamps, schema versions, and reproducible commands with generated data.
- Keep source names and source identifiers intact. Normalized names are lookup helpers, not authoritative identities.
- End each work session by updating the progress log and the next executable task.

### 0.0 — Planning and project baseline

- [x] **0.1** Record the requirements and the owner's requested data-first sequence.
- [x] **0.2** Inspect the local workspace and Git state; establish that implementation starts from an empty repository.
- [x] **0.3** Inspect primary sources and document the CORS, exact-printing, and dynamic-directory uncertainties.
- [x] **0.4** Create this roadmap, WBS, proposed data contracts, quality gates, and decision register.
- [x] **0.5** Record the chosen product name, GitHub repository/visibility, Cloudflare account/project, and final domain before those values are needed. Website/domain: `moxgraph.com`; owner-selected repository: `Westly/moxgraph`, public; planned Cloudflare Pages project slug: `moxgraph`; account: the existing signed-in Cloudflare account containing `moxgraph.com`.

| Baseline item | Recorded decision or verified state |
| --- | --- |
| Website name | `moxgraph.com`, supplied by the owner |
| Production domain | `moxgraph.com`; its dashboard shows active Cloudflare registration and the domain's Free plan. Pages project/build-plan configuration is checked separately in 10.5 |
| GitHub account | Connected GitHub integration identifies the user as `Westly` |
| Repository destination | `Westly/moxgraph`, **public**, explicitly selected by the owner |
| Repository status | No matching repository returned by the connected search; not created in WBS 0.0. Creation and repository-specific write verification belong to 10.1–10.2 |
| Cloudflare account | Existing authenticated browser account containing `moxgraph.com`; no credentials copied into project files |
| Cloudflare project | Planned Pages project slug `moxgraph`; project creation and the Free-plan deployment configuration belong to 10.5 |
| GitHub sign-in | Official [GitHub sign-in page](https://github.com/login) opened for the owner. The connected GitHub integration already identifies `Westly`; browser sign-in is a separate session |
| Cloudflare sign-in | Official [Cloudflare sign-in page](https://dash.cloudflare.com/login) opened and reached an authenticated dashboard; the `moxgraph.com` domain page was opened |
| Access boundary | Browser session and GitHub identity are verified. No Cloudflare API token/CLI authorization or new GitHub/Cloudflare permissions were created; actual write/deploy access is checked when that later work is requested |
| Work sequence | Finish one parent WBS at a time. The owner separately authorized WBS 1.0 after 0.0; later parents still require a new request |

**Deliverable:** this roadmap and the recorded project/account baseline. **Exit: complete.** Tasks 0.1–0.5 were finished before the owner authorized WBS 1.0. Repository creation, application work, and deployment remain later-phase work.

### 1.0 — Collect all card, printing, and artist data

Dependencies: completed WBS 0.0 and the owner's instruction to begin WBS 1.0. Do this before collecting the event roster.

- [x] **1.1** Create the source manifest and a reproducible downloader. Discover the current `all_cards` URL from bulk metadata; record source type, upstream timestamp, retrieval timestamp, local checksum, and byte count. Do not hardcode a dated download URL. Evidence: `scripts/data/scryfall_source.py`, `data/manifests/scryfall-all-cards-20261011091913.json`, and seven passing downloader tests.
- [x] **1.2** Download and stream the complete `all_cards` snapshot into local staging. Support interrupted-download recovery where the source permits it; a partial file must not be accepted as a complete snapshot. Evidence: 396,208,251-byte gzip JSONL file, checksum verification, complete stream/CRC validation, and 546,137 stored records.
- [x] **1.3** Preserve every supplied printing across sets, languages, promotional treatments, variants, and supported game types. Keep paper/digital/token classification so totals and UI can use explicit scopes later. Evidence: all source objects retained in SQLite, covering 19 languages and 1,058 sets without filtering.
- [x] **1.4** Extract printing identity, available finishes, image references, Oracle identities, illustration identities, raw credit strings, artist IDs, and face-level relationships. Preserve collector numbers as strings, including letters and symbols. Evidence: indexed printing fields, 24,629 face rows, and original full source JSON.
- [x] **1.5** Build the artist identity catalogue from all available credits. Retain every observed spelling per ID, joint credits, absent IDs, and any conflicting associations for review. Evidence: `data/catalogues/scryfall-all-cards-20261011091913-artists.json` contains 2,434 source artist IDs, 28 IDs with multiple observed names, and 230 unsplit joint-credit combinations.
- [x] **1.6** Build exact-ID and set/collector-number/language lookup indexes. Identify duplicate tuples and missing fields instead of choosing arbitrary rows. Evidence: indexed query plans in the quality report and `scripts/data/scryfall_lookup.py`; no ambiguous tuples in this snapshot.
- [x] **1.7** Produce a completeness report: input records, unique printing IDs, duplicate IDs, language/set coverage, paper/digital counts, missing credits/illustrations, and rejected or quarantined records. Account for every input record. Evidence: `reports/card-data-quality.json`; zero duplicate/quarantined/unaccounted records, SQLite integrity `ok`, and no foreign-key violations.
- [x] **1.8** Save a reproducible baseline and representative fixture records. Keep the large raw download and staging database out of Git and the web build. Evidence: source/artifact checksums, 15 real fixture records, 13 passing tests, `.gitignore` verification, and `docs/data-baseline.md` reproduction instructions.

**Deliverables:** local source snapshot, staging database, source manifest, full artist catalogue, and `reports/card-data-quality.json`.

**Exit: complete.** The complete downloaded snapshot is processed; primary keys and references validate; all records are accounted for and unknowns are reported. “Complete” means complete against the dated Scryfall snapshot, not an unsupported promise about every card ever produced outside that source.

**Baseline:** `scryfall-all-cards-20261011091913` (source updated 2026-10-11 09:19:13.375 UTC). Read `reports/card-data-quality.md` for counts and `docs/data-baseline.md` for reproduction and findings. There are **no WBS 1.0 blockers**. Source limitations remain explicit: 936 records without artist credits/IDs, 784 without illustration IDs, and 93 artist IDs without a single-ID name observation. Do not guess these values during later matching. WBS 1.0 stopped at its boundary; the owner subsequently authorized WBS 2.0 below.

### 2.0 — Collect MagicCon attendees and official profile information

Dependencies: 1.8.

- [x] **2.1** Follow the supplied overview to the current artist directory. Evidence: both public renderers reviewed; 65 guest entries and 65 exhibitor entries, including three featured exhibitors; no pagination/load-more gap. Rendered ID sets retained in `reports/magiccon-browser-audit.json`.
- [x] **2.2** Choose a reproducible extractor using the public directory feed or rendered page. Evidence: `scripts/data/magiccon_source.py`, public category selection verified against the renderer and complete browser ID sets; schema and nonempty-feed checks.
- [x] **2.3** Collect every listed attendee's original display name, guest ID, profile URL, portrait URL and published attendance/booth fields. Evidence: `data/curated/events/atlanta-2026.json`; all 65 have booths, with source-specific days and names preserved.
- [x] **2.4** Visit each distinct official profile and preserve published links/labels. Evidence: all 130 HTML profiles and 130 individual feed responses retrieved; 149 link observations retained; only artist fields/biographies processed, excluding event footer socials. Gallery labels preserved rather than relabeled as stores.
- [x] **2.5** Preserve source portrait URLs and attribution. Decision: original remote URLs, no local image copies or inferred license grant; neutral fallback contract for missing images. Three attendees have no image in either source. UI fallback rendering belongs to WBS 6.0.
- [x] **2.6** Deduplicate event-section entries without losing source observations. Evidence: 130 entries → 65 individuals; 62 unique normalized-name pairs and three reviewed biography pairs in `atlanta-2026-identity-review.json`. All have official guest-person records; Scryfall illustrator status remains unreviewed for WBS 3.0.
- [x] **2.7** Produce a roster audit. Evidence: `reports/attendance-coverage.json` and `.md`; zero unaccounted entries, retrieval failures or pagination gaps; missing images/socials and seven defective profile destinations documented (two have valid published overview alternatives).
- [x] **2.8** Freeze the initial snapshot with source URLs and retrieval timestamps. Evidence: manifest `magiccon-atlanta-2026-20261011T195408Z`, source/artifact checksums, portable published-field extracts, six real fixture profiles and 13 passing focused tests. David Palumbo's roster membership and rendered Instagram link verified.

**Deliverables:** event metadata, raw public roster/profile extracts, `data/curated/events/atlanta-2026.json`, and an attendance coverage report.

**Exit: complete.** Every directory entry is accounted for and published profile/social data is captured. There are **no WBS 2.0 blockers**. Source limitations: three attendees without portraits, 36 without dedicated social fields, and five link observations without a usable published destination. Raw source strings remain unchanged. Read `docs/event-data.md` for reproduction and boundaries. **Stop before WBS 3.0 until the owner requests it.**

### 3.0 — Reconcile artists and generate the requested totals table

Dependencies: 1.8 and 2.8.

- [x] **3.1** Assign stable internal artist keys and connect them to observed Scryfall artist IDs and event guest IDs. Evidence: 2,434 `scryfall-<UUID>` keys and 65 guest mappings.
- [x] **3.2** Generate candidate matches using exact observed names, Unicode normalization, case folding, and whitespace cleanup. Evidence: `reports/artist-match-candidates.json`; accent/punctuation/fuzzy suggestions never approve identities.
- [x] **3.3** Review initials, nicknames, spelling changes and joint identities. Evidence: 61 reviewed exact matches, one normalized match, and three aliases (Jason A. Engle, Olena Richards, Thomas M. Baxa); same-UUID variants retained, unknown collective membership not guessed.
- [x] **3.4** Save reviewed aliases and source evidence in `data/curated/artist-mappings.json`. Original names, method, review date, pinned expected names, source UUID examples and primary evidence retained; stale decisions fail validation.
- [x] **3.5** Validate ambiguous multi-artist credits. Evidence: all 230 joint-credit combinations in `reports/joint-credit-audit.json`; no split-name/UUID positional inference. The 93 UUIDs without a single-ID name observation remain explicitly unnamed.
- [x] **3.6** Calculate the defined counts. Evidence: 546,137 records accounted for; 529,030 eligible paper game-card printings; reversible face identities and supplementary exclusions reviewed in `docs/artist-statistics.md`. Full source table generated before the event left join.
- [x] **3.7** Produce both requested CSVs, equivalent JSON and `reports/artist-reconciliation.md`. Evidence: 2,434 source rows and 65 event rows; exact CSV/JSON serialization check; snapshot and artifact checksums in the statistics manifest.
- [x] **3.8** Audit ambiguous mappings and sample exact matches. Evidence: 19 deeper profile reviews, six biography-work credit checks, UUID-checked examples for every attendee, and independent SQL agreeing on card/printing counts for all 65. Seven real fixtures include Heliod THB #18 versus #259, which have different artists and attendance outcomes.
- [x] **3.9** Publish the discrepancy queue. Evidence: `reports/artist-discrepancies.json` separates zero unmapped attendees, zero verified event zeros, 936 missing-credit source objects, 93 unnamed source UUIDs and 2,369 source identities not listed in this roster.

**Deliverables:** reviewed mapping registry, both artist tables, machine-readable statistics, and reconciliation report.

**Exit: complete.** Every attendee has an explicit verified identity and reproducible totals. The tested unresolved-row contract uses null rather than zero and keeps unmatched attendees visible. Only verified identities qualify for confirmed matches. All 46 tests pass (20 new WBS 3 tests); independent SQL and both CSV checks pass. There are **no WBS 3.0 blockers**. Source gaps remain documented; the 702 eligible records lacking attribution are not assigned to artist totals. Read `reports/artist-reconciliation.md` and `docs/artist-statistics.md`. **Stop before WBS 4.0 until the owner requests it.**

### 4.0 — Prove static deck-link import feasibility

Dependencies: 3.9. The risk is documented now; actual importer work follows the requested data-first sequence.

- [x] **4.1** Obtain representative public links. Evidence: both owner Moxfield decks plus a 975-printing art list and a 114-line Archidekt deck; actual Japanese/German UUIDs, alternate art, multiple printings per name, multiface cards and deck sections captured.
- [x] **4.2** Inspect public access/export paths and terms. Evidence: sanitized fixtures with hashes; owner selected `https://api.moxfield.com/v2/decks/all/{deckId}` and confirmed existing API permission; Archidekt developer guidance reviewed. No credentials/profile data in fixtures.
- [x] **4.3** Test localhost and static HTTPS in a real browser. Evidence: `reports/import-browser-audit.json`, HTTP header observations, and `tools/import-probe/` deployed at `https://moxgraph-import-probe.pages.dev`. Both provider paths fail from HTTPS; Archidekt alone works on localhost:3000. Private/challenge/429 cases explicitly untested. Final-domain browser retest remains a release gate, not a completed test.
- [x] **4.4** Map actual fields and compare selected printings. Evidence: `reports/import-printing-audit.json`, exact source-display references and official-export comparisons. Expand Moxfield child printings; preserve Archidekt category semantics; retain an Arcane Signet catalogue miss. Supplemental v2 art-list quantities fail reconciliation (1,187 copies vs 975 declared; Spirit quantity 215), while both personal decks reconcile. V2 token selection limitation documented.
- [x] **4.5** Verify official exports. Evidence: actual Archidekt CSV with Scryfall IDs matches all 114 API lines. Moxfield's actual Orzhov export matches 100 main/commander copies but omits 39 considering copies and language; 57 rows remain ambiguous across languages. Name-only exports are insufficient. API JSON file evidence retained as a separate manual option.
- [x] **4.6** Write support matrix and explicit scope conflict. Evidence: `docs/import-feasibility.md` and D01. Initial investigation documented direct CORS blockers and the required decision; the owner's subsequent exception and live proof are recorded in 4.7. Production R01 remains undelivered.

- [x] **4.7** Close feasibility blockers under the owner's follow-up request. Reviewed historical printing alias and same-revision v3 recovery proof; 71 local tests pass. After explicit owner approval, deployed the reviewed fixed-provider Free Worker, verified Free plan/settings, and tested both personal Moxfield decks plus Archidekt in a real HTTPS browser. Selected printing rows match direct fixtures; the supplemental v2 quantity warning remains visible. Evidence: `docs/import-blocker-resolution.md`, `reports/import-relay-browser-audit.json`, `reports/import-relay-http-audit.json`. Production adapter and final-origin checks remain in later WBS steps.

**Deliverable:** `docs/import-feasibility.md` and `docs/import-blocker-resolution.md` with sanitized fixtures and reproducible evidence.

**Exit: complete, including blocker follow-up.** The approved research relay is live at [moxgraph-import-relay-probe.westlywhite.workers.dev](https://moxgraph-import-relay-probe.westlywhite.workers.dev); both providers work in the HTTPS probe. Direct provider CORS remains unchanged. A reviewed Arcane Signet alias and complete alternate-snapshot quantity recovery are verified offline, with production handling reserved for WBS 7. The v2 primary endpoint and original evidence remain intact. No current WBS 4 deployment blocker remains; production R01 is not yet delivered. Read `docs/import-blocker-resolution.md`; no WBS 5 work started.

### 5.0 — Establish app structure, contracts, and static data packaging

Dependencies: 3.9 and completed 4.7, including the approved retrieval-only Worker exception.

- [x] **5.1** Scaffold a small TypeScript/Vite static app with pinned dependencies, lockfile, runtime pin, predictable commands and `dist/` output. Evidence: `package.json`, `package-lock.json`, `.node-version`, `src/`, successful static build; no rendering server or database binding.
- [x] **5.2** Implement 16 JSON schemas, generated TypeScript types and standalone CSP-compatible validators covering all 12 roadmap entities plus packaging contracts. Evidence: `scripts/build-contracts.mjs`, `schemas/`, `src/models/`; shared `parseContract` boundary for later adapters; every generated record validated. Provider adapter logic remains WBS 7.
- [x] **5.3** Measure whole-set printing shards, two-character UUID shards and three-character UUID shards against all three provider fixtures. Select 4,096 three-character shards plus 1,058 compact tuple indexes. Evidence: `scripts/data/publish_static.py`, `reports/static-data-packaging.json`. Selected full-deck shard estimates are 2.8–3.2 MB gzip; actual network performance remains WBS 9.
- [x] **5.4** Retain all 546,137 printings, 19 languages and 24,629 faces from the checksum-verified read-only baseline. Publish only identity, credit, image, language, finish and classification fields; omit prices/rules. Evidence: complete coverage audit and byte-identical regeneration; large raw/database files remain outside the web output.
- [x] **5.5** Build all-artist directory, 2,434 source-artist reverse indexes, 65-attendee event directory with original profile/social information and reviewed mappings/statistics. Exact UUID/tuple lookups distinguish unknown, ambiguous and unavailable data. Optional name index omitted. Evidence: `src/data/catalogue.ts`, 12 focused app tests, real browser exact/unknown lookup checks.
- [x] **5.6** Generate content-derived immutable data versions and an active pointer with SHA-256/byte count. Manifest includes source snapshots/timestamps, schema/generator versions, mappings, paths, checksums and coverage. Browser pins one version and verifies file integrity. Evidence: `public/data/active.json`, version `v1-0313a3107f243872`, `reports/static-data-repeatability.json`.
- [x] **5.7** Validate all checksums/references, source-input hashes, safe URLs, allowed static files and the 10,000-file/20-MiB guards before and after building. Production output contains 7,597 files; largest asset is the 1,321,239-byte manifest. Immutable/revalidation rules are configured in `public/_headers`; hosted header verification remains a release check. Evidence: `scripts/check-data.mjs`, `reports/app-foundation-validation.json`.

**Deliverables:** app skeleton, validated schemas/types, compact static data, repeatable build, `docs/static-data.md` and packaging/validation reports.

**Exit: complete.** The built app and catalogue work from a local static preview. Exact-print fixtures and all reference/checksum/file-limit checks pass; regeneration reproduces identical version bytes. No WBS 5 blocker remains. Raw deck metadata is above the initial WBS 9 performance target even though estimated compressed transfer is lower; measure and optimize explicitly in that phase. This is the app foundation, not completed import/matching/storage. WBS 6 completion is recorded below.

### 6.0 — Create the logo, CSS, and user experience

Dependencies: 3.9 for realistic content; 5.1 for implementation.

- [x] **6.1** Use the owner's confirmed Moxgraph / moxgraph.com name and a restrained card-and-pen-nib motif.
- [x] **6.2** Draw three original SVG concepts and select card/nib for readability. Deliver geometric path wordmark, green/ink/white variants, SVG favicon, 32/180/512 px icons and PNG exports. Evidence: `public/brand/`, `scripts/design/create_brand.py`, `scripts/design/export-brand.mjs`.
- [x] **6.3** Define neutral paper surfaces, readable ink/muted text, one green accent, spacing/type/radius/focus tokens and consistent SVG icons. Use system fonts and no remote UI dependencies. Palette contrast checks pass. Evidence: `src/styles/base.css`, `docs/design-system.md`.
- [x] **6.4** Build responsive deck entry/saved-deck empty state, example results and the real 65-attendee artist directory. Event identity and snapshot dates remain visible. Live imports and saving are explicitly unavailable in this design preview.
- [x] **6.5** Add reusable URL/status presentation, example saved-deck row, section controls, artist headers, card rows, exact printing badges, profile cards and empty/error states. Evidence: `src/ui/components.ts`, `src/app.ts`.
- [x] **6.6** Review mobile layouts at 390 and 320 px with 44–50 px primary/icon targets, visible keyboard focus and no horizontal overflow. Compact card rows create their exact image only when expanded; portraits load lazily and missing/failed images use explicit fallbacks.
- [x] **6.7** Keep the official name/portrait links and each usable published website/gallery/social destination; reuse reviewed Scryfall links. Hide missing/invalid links. Every icon link has an accessible label, title and hover/focus tooltip. All 65 attendees covered by source-preservation checks.
- [x] **6.8** Review desktop/mobile hierarchy, palette contrast, keyboard/pointer controls, long names, source destinations, loading, unavailable-data/retry and empty results. Fifteen app tests, TypeScript and full static build/data audits pass. Evidence: `reports/design-validation.json`, `reports/screenshots/wbs6-*.jpg`.

**Deliverables:** original SVG/PNG logo set, CSS system, three responsive screens, reusable presentation components, `docs/design-system.md` and visual QA evidence.

**Exit: complete for the design phase.** The original **Preview example** action demonstrated nine selected, exact-printing source rows. The real directory contains all 65 attendees with official portrait/name/profile/social links. WBS 7 has since replaced the production example with live imports; the WBS 6 fixture and screenshots remain historical evidence. No WBS 6 blockers remain.

### 7.0 — Implement imports, exact-printing matching, and results

Dependencies: 4.7, 5.7, and relevant components from 6.5.

- [x] **7.1** Implement strict provider hostname/path validation, normalization and tracking removal. Evidence: `src/imports/url.ts`, accepted/rejected URL tests; arbitrary targets never reach the relay.
- [x] **7.2** Implement separate v2 Moxfield and Archidekt adapters through the existing relay. Preserve selected children, row/card/printing IDs, quantities, source categories, language and finish; reconcile quantities before acceptance. Generated token suggestions are not owned copies. Evidence: 351 source lines retain exact provider fields, plus successful live browser imports for all three decks.
- [x] **7.3** Support file/paste imports for v2/API JSON, configured Archidekt CSV and Moxfield text. Show format/provenance guidance and missing fields. Evidence: all 114 CSV lines equal the API fixture; all 87 Moxfield text rows retain omitted-language/section limitations; actual CSV file picker and paste flow verified.
- [x] **7.4** Resolve UUIDs/complete tuples and the narrowly guarded Arcane Signet alias; retain source fields, alias notice and unresolved/conflict queue. Manual corrections require preview then confirmation. Reject the 1,187-versus-975 supplemental snapshot; offer fresh v2/file recovery without runtime v3 fallback. Evidence: 350 exact + one alias, 86 ambiguous + one unknown text identities, unknown/conflict/alias-guard tests.
- [x] **7.5** Match only selected printing/face IDs to verified listed attendees; allow whole reviewed-name fallback only without IDs and with a unique mapping. Joint credits retain separate artists and face indexes. Evidence: real-deck matching plus focused synthetic joint/face/unknown-credit tests.
- [x] **7.6** Group by artist, with default artist/card A–Z, copy/set sorting and card/artist search. Evidence: `src/imports/match.ts`, real browser filter and sorting checks.
- [x] **7.7** Default to main deck + commanders; retain side/maybeboard, companions, selected tokens and unusual sections. Preserve source category memberships without double counting. Unsectioned text and conflicting inclusion require explicit review. Evidence: fixtures and browser section totals.
- [x] **7.8** Show exact identity, quantity, finish/language, printing/face credits, lazy exact images and Scryfall printing link. Retain raw source identity in details. Digital-only UNF 107m stays selected and visibly excluded from physical signing counts. Evidence: presentation tests and expanded-card browser review.
- [x] **7.9** Separate physical copies, source lines, unique printing IDs and artists; explain duplicate attribution across artist groups. Evidence: synthetic three-copy/two-artist case totals three globally and six across groups; complete fixture totals in `reports/import-matching-audit.json`.
- [x] **7.10** Handle explicit provider/data/format/quantity errors, age notice, cancellation and zero matches. Commit a new result only after successful validation; retain the previous in-memory result on failure. One provider request at a time, bounded reads/timeouts, cooldowns, Retry-After handling, no automatic retries. Evidence: mocked error matrix and real browser invalid-link, quantity rejection and cancellation. Persistent saved-data checks remain WBS 8.
- [x] **7.11** Generate encoded Scryfall searches from reviewed names/aliases with `unique=cards`, and retain exact printing links plus official profile/social actions. Evidence: all 65 artist links tested, quote/backslash encoding cases and Chris Rahn alias search reviewed in-browser.

**Deliverables:** `src/imports/`, `src/ui/deck.ts`, `src/ui/review.ts`, `src/ui/artist-url.ts`, working app flow, `docs/deck-imports.md`, fixture/browser reports and screenshots.

**Exit: complete.** All 32 app tests, TypeScript and complete static source/output audits pass. Real localhost-to-HTTPS-relay imports agree with the fixtures: Soldiers 17 copies/13 artists, Orzhov 34 copies/15 artists, Archidekt 19 copies/16 artists in the default view. File/paste, manual review, failure retention and cancellation work; desktop/390/320 px layouts reviewed. No WBS 7 blockers remain. No deployment or GitHub change was made. WBS 8 saving and WBS 9/10 release/performance/final-origin checks remain open; R01 is not yet production-verified. Stop before WBS 8.

### 8.0 — Implement browser-local saved decks

Dependencies: 5.2 and 7.2–7.5.

- [x] **8.1** Create versioned IndexedDB stores for saved decks, deck lines, manual printing choices, and cached resolved records. Store minimal source metadata and no authentication material.
- [x] **8.2** Save successful imports transactionally. Reopening the site restores the deck list, selected deck, filters, and last successful results.
- [x] **8.3** Support refresh, local rename, deletion, and clear-all. A refresh replaces a deck only after validation succeeds; distinguish source changes from local display preferences.
- [x] **8.4** Handle reimported decks deterministically using provider plus deck ID. Offer update/duplicate behavior when appropriate; preserve manual choices only if the source line still corresponds to the same card.
- [x] **8.5** Add a versioned JSON backup export and restore flow. Validate imports, bound file sizes/line counts, and show a replace/merge choice before overwriting saved decks.
- [x] **8.6** Handle browser storage denial, quota exhaustion, private browsing, and schema migrations without losing the current in-memory session. Provide a usable backup route if persistent saving fails.
- [x] **8.7** Add concise copy: saved in this browser, not synced across devices, and removable through site controls or browser data clearing. Explain that opening providers or loading remote images contacts those services.
- [x] **8.8** Recompute derived attendance matches when public data changes, while preserving the saved deck's selected printing. Record the versions used for the displayed results.

**Deliverables:** `src/storage/{model,codec,database}.ts`, `src/ui/library.ts`, app integration and CSS, `tests/app/storage.test.ts`, [storage design/recovery](docs/local-storage.md), [validation report](reports/local-storage-validation.json) and `reports/screenshots/wbs8-*.jpg`.

**Exit: complete.** All 47 app tests, TypeScript and full static audits/build pass. Browser UI verifies actual local persistence/reopen, local rename and filters, source refresh, duplicate import, file backup download/merge restore, invalid-backup rejection, deletion/clear-all/undo, manual-choice persistence and stale-tab write refusal. Desktop and 390/320 px storage layouts reviewed. Transactional quota failure, denied storage, failed/cancelled refresh, schema migration/rollback and exact-ID data updates are covered by automated tests. No WBS 8 blockers; no cloud/GitHub changes. Full cross-browser, actual private-mode and production-origin checks remain WBS 9/10. Stop before WBS 9. No app login or tracking/deck cookies are required. Browser data is not a guaranteed permanent backup; see [storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

### 9.0 — Validate correctness, accessibility, performance, and cost boundaries

Dependencies: 6.8, 7.11, and 8.8.

- [x] **9.1** Add focused data/matcher tests for the cases in the acceptance matrix below. Use real captured public records plus clearly labeled synthetic edge cases.
- [x] **9.2** Test imports and storage end-to-end, including source printing changes, multiple decks, refresh failures, and restored backups. Mock provider failures deterministically; use limited live smoke tests to detect integration changes.
- [x] **9.3** Verify portrait/profile/social link associations and exact-print card images. Check icon labels, focus order, dialogs, contrast, touch targets, and screen-reader status announcements.
- [x] **9.4** Test current Chrome/Edge, Firefox, and Safari where available, including iOS/Android layouts. Record untested browsers rather than implying cross-browser coverage.
- [x] **9.5** Measure first-page assets and a representative 100-card import. Initial targets: app HTML/CSS/JS at or below 250 KiB compressed excluding datasets/images; no full-catalogue download; under 5 MiB of encoded metadata transfer for that fixture (WBS 9 clarification; decoded bytes reported separately); sorting cached results under 100 ms on the recorded test device. Adjust only with recorded measurements and rationale.
- [x] **9.6** Render untrusted deck/profile text as text, validate URL schemes, prevent CSV formula injection in exports, and use appropriate static security headers. Verify the bundle and logs contain no secrets or personal deck contents.
- [x] **9.7** Inspect the static release output and separate approved relay configuration. Reject unplanned Functions, handlers, R2/D1/KV bindings, paid image processing, analytics scripts or services. Verify Workers Free remains active, logging/storage remain disabled, provider-friendly rate limits and abuse controls are adequate, CPU fits the Free allowance, and quota exhaustion fails visibly without paid fallback. Keep the cost boundary enforceable in the build.
- [x] **9.8** Complete the release checklist and record outstanding limitations against requirement IDs. Do not use a visual demo as evidence that live imports or exact matching work.

**Deliverables:** test results, size report, browser/visual QA notes, and release checklist.

**Exit: complete.** 125 tests (50 app, nine relay, two policy, 64 Python), TypeScript, all 546,137-record audits and the 7,610-file static build pass. App shell 51,238 gzip bytes; full-provider-body metadata estimate 3.62–4.34 MB; cached browser sorting/render p95 17.30 ms. Five axe-audited states have no violations/incomplete checks after fixes. Available Chromium and responsive layouts pass; other engines, real mobile devices and spoken screen-reader output remain untested. The owner-authorized relay update adds three transient rate counters, keeps logs/storage off and reduces observed active-version CPU P99 to 7.12 ms. Both live browser providers pass; command-line Moxfield 403 and source gaps are documented limitations. Evidence: `docs/release-validation.md`, `docs/release-checklist.md`, `reports/release-validation.json`, `reports/performance-audit.json`, `reports/relay-local-validation.json`. No WBS 9 blockers. Final-origin/Git deployment checks remain WBS 10; do not start it automatically.

### 10.0 — GitHub, Cloudflare, and the registered domain

Dependencies: 0.5 and 9.8 for production launch. Repository creation and a temporary preview may happen earlier when needed for 4.3.

- [x] **10.1** Identify the user's authenticated GitHub account and selected repository. Use the existing credential integration; never ask for a password/token in chat or place credentials in source files.
- [ ] **10.2** Create or connect the repository with agreed name and visibility. Add source, curated data, generated lightweight assets, lockfiles, documentation, and `.gitignore`; exclude raw bulk files, staging databases, user exports, caches, and secrets.
- [ ] **10.3** Set the production branch to `main`; use `codex/` branches for development by default. Configure required checks where the repository plan permits them.
- [ ] **10.4** Add CI for schema/data checks, focused tests, type checking, a static build and the separate relay tests. Ensure each deployment runs release-blocking checks, since repository checks alone do not necessarily delay a Cloudflare deployment.
- [ ] **10.5** Connect Cloudflare Pages Free to the chosen GitHub repository with access limited to that repository. Set production branch, pinned build environment, build command, and `dist` output; enable controlled preview builds. Configure a separate reproducible Git-triggered deployment for the approved retrieval Worker within the Free plan, with appropriately scoped deployment access and no secrets in the frontend. Do not rely on manual dashboard edits for production releases.
- [ ] **10.6** Publish the validated site, associate the registered domain through Pages, configure only the required DNS record, and verify TLS and the canonical www/apex redirect. Preserve unrelated records such as mail configuration. Follow [custom-domain setup](https://developers.cloudflare.com/pages/configuration/custom-domains/).
- [ ] **10.7** Perform live acceptance testing from the final HTTPS origin, including both deck providers, local save/reload, image/profile links, and a controlled GitHub change that verifies automatic deployment.
- [ ] **10.8** Document deployment rollback and recovery for the static site and the separate relay. Use atomic static deployments; ensure data manifests and their shards ship together. Record the live URLs, repository URL, production commit, data revision, relay version and cloud plan.

**Deliverables:** owner-controlled GitHub repository, automatic Cloudflare deployment, custom domain, and rollback instructions.

**Exit:** a repository update produces the correct production site, failed validation prevents publishing a bad build, and final-domain imports are verified. GitHub authentication does not imply Cloudflare authorization; account setup is handled only when access is actually needed.

### 11.0 — Maintain data and prepare for the event

Dependencies: 10.8.

- [ ] **11.1** Provide a manual refresh command that repeats card ingestion, then attendance ingestion, then reconciliation/count generation. Never update totals independently from their source revisions.
- [ ] **11.2** Generate reviewable diffs for roster additions/removals, name changes, new unmapped artists, changed photos/socials, and material count changes. An empty scrape or major unexplained drop fails validation and leaves the last good release intact.
- [ ] **11.3** Establish a refresh cadence: proposed weekly card snapshots, weekly roster checks, and more frequent roster checks near the event. A scheduler is optional and is configured only when the owner requests/enables it.
- [ ] **11.4** If GitHub Actions is used for data refreshes, keep jobs bounded and cache-aware, commit only changed outputs, prevent workflow loops, and set retention/budget controls for the actual account plan. Ordinary UI commits must not redownload the bulk database.
- [ ] **11.5** Show event-data freshness and source links in the app. Preserve the last confirmed roster when a new fetch fails; do not convert a failure into attendee cancellations.
- [ ] **11.6** Run a final roster/profile review before the event and preserve an event snapshot afterward. Reuse the model for future events without overwriting Atlanta's history.
- [ ] **11.7** Document routine alias corrections, provider breakage, dataset rollback, browser backup recovery, and adding another event.

**Deliverables:** maintenance runbook and repeatable refresh process.

**Exit:** the owner can update and recover the site without a backend, a surprise service subscription, or manual edits to generated totals.

## Data contracts

The following are target contracts to implement in WBS 1–5. Field names can change before schema version 1 is frozen, but their meaning must remain explicit.

| Entity | Identity | Essential fields |
| --- | --- | --- |
| `SourceSnapshot` | source + snapshot ID | source URL/type, source timestamp, retrieval time, checksum, byte/record counts, parser version, completion status |
| `CardPrinting` | Scryfall printing ID | Oracle IDs, name/printed name, set code/name, collector number as string, language, available finishes, layout, game/type flags, raw artist credit, artist IDs, image URL, Scryfall URL |
| `PrintingFace` | printing ID + face index | face name, optional face Oracle ID, raw artist credit, artist ID when supplied, illustration ID, face image |
| `Artist` | stable internal artist key | canonical display name, observed Scryfall artist IDs, all observed source names, individual/collective/unknown kind |
| `ArtistMapping` | mapping key | event/guest reference, raw MagicCon name, matched artist key(s), reviewed Scryfall names/IDs, method, status, evidence, review date, notes |
| `Event` | event key | official name, dates, location, directory URL, source snapshot, data freshness |
| `Attendance` | event + guest key | raw name, artist mapping reference, official profile URL, source portrait URL, optional local portrait path, published booth/days/status, source references |
| `ArtistLink` | attendance + link key | type/platform, original label, original URL, safe display URL if normalized, source profile URL, retrieval time |
| `ArtistStatistics` | artist + snapshot + scope | distinct cards, printing editions, language-specific printings, distinct artworks, supplemental-object counts, missing-data counts |
| `SavedDeck` | local deck UUID | provider, source deck ID/URL, title, imported/refreshed time, source checksum, schema version, data/mapping versions |
| `DeckLine` | local deck + source line key | source IDs, name, quantity, section/categories, supplied set/number/language/finish, resolved printing ID, resolution status, manual selection provenance |
| `MatchResult` | deck line + event + credited artist | resolved printing, matched face(s), verified attendance, dataset revision, result state/reason |

Use JSON `null` for genuinely unknown values and a typed status/reason where it matters. Preserve `source_artist_credit` even when structured IDs exist. A single printing can have multiple artist credits, and one person can have multiple source names. Model these relationships explicitly rather than flattening them into one name column.

### Required artist totals table

The CSV/JSON source table should contain at least these columns. The website may hide technical audit columns by default while keeping them downloadable.

| Column | Meaning |
| --- | --- |
| `artist_key` | Internal stable identity |
| `scryfall_artist_ids` | All reviewed Scryfall IDs associated with that identity |
| `scryfall_artist_name` | Preferred observed Scryfall name |
| `scryfall_name_variants` | Other observed Scryfall spellings/credits; structured array in JSON |
| `magiccon_artist_name` | Exact name in the current event source |
| `magiccon_guest_id` | Source guest ID where available |
| `event_id` / `attendance_status` | Event association and supported attendance status |
| `match_status` / `match_method` | Verified, review needed, or unmatched; ID/alias/exact-name/manual evidence |
| `unique_cards_total` | Distinct eligible Oracle card identities credited to this artist |
| `printing_editions_total` | Distinct eligible editions, deduplicated across translated records |
| `language_printings_total` | Distinct eligible Scryfall printing IDs, including language variants |
| `unique_artworks_total` | Distinct known illustration IDs credited to this artist |
| `supplemental_objects_total` | Tokens/emblems/art cards or other separately classified objects |
| `missing_oracle_id_total` / `missing_illustration_id_total` | Coverage gaps excluded from their respective distinct-ID totals |
| `portrait_url` / `magiccon_profile_url` | Source photo and official artist profile |
| `website_url` / `social_links` / `scryfall_artist_url` | Available original links and generated Scryfall browsing link |
| `source_updated_at` / `retrieved_at` / `reviewed_at` | Freshness and audit dates |
| `mapping_notes` / `evidence_urls` | Why a non-identical name was accepted or remains unresolved |

**Counting rules:**

1. The default “cards illustrated” total counts distinct Oracle identities among **paper game cards**, including alternate-frame/promo printings, where the artist has a credited illustration. Count the same card once for that artist even if they illustrated multiple editions. For reversible layouts, use the eligible face Oracle identities and document that special case.
2. Keep digital-only records in ingestion, but exclude them from the default physical-signing scope. Track tokens, emblems, art cards, and other supplementary objects separately so the main card count remains interpretable. Preserve an all-record count in the audit report.
3. Define an edition with an explicit validated key containing set code, collector number, and the ordered illustration/credit identity of its faces. Deduplicate identical language variants, but retain language-specific artwork differences. If illustration data is missing, report the fallback and uncertainty; do not accidentally merge distinct art.
4. Count artworks using known illustration IDs. Count both different face illustrations where applicable; missing IDs are reported separately rather than manufactured.
5. Credit a shared illustration to each verified contributor. Artist totals can overlap and therefore must not be summed as a global unique-card total.
6. Preserve finish on a deck line. Foil/nonfoil does not automatically produce another illustration or another Scryfall printing record; use source identities to decide.
7. A verified identity with no eligible cards gets `0`. An unresolved name mapping gets `null` and “Needs review.” Exclude unresolved rows from numerical rankings until reviewed.
8. Generate the full artist table first, then left-join the roster so attendees without matches remain visible. The event table is not a filtered list that silently drops unmatched names.

The complete dated snapshot has now been processed. Actual totals live in the generated CSV/JSON reports and `reports/artist-reconciliation.md`, with their source revisions and counting contract. David Palumbo's verified row contains 137 distinct eligible cards, 270 editions, 1,758 language printings and 140 known artworks for this snapshot.

### Exact-printing resolution contract

Apply these rules in order:

1. Prefer an actual **Scryfall printing ID** supplied by the provider. Resolve it in the current catalogue and verify that other supplied printing fields do not contradict it.
2. Otherwise, resolve an exact **set code + collector number + language** tuple. Use a provider-internal ID only through a verified adapter mapping. Keep collector-number punctuation and suffixes intact.
3. If language is missing or a tuple has multiple candidates, mark the printing unresolved unless the provider contract supplies a verified default. Do not assume English or the cheapest/latest printing.
4. A card name, Oracle ID, or artist name alone cannot establish the selected printing. Present candidate printings for explicit manual selection and store that choice as manual, not as provider-confirmed.
5. Conflicting source fields produce a conflict state. A newly released/unknown printing produces an unknown state. Do not replace either with a random matching name.
6. Use the resolved printing's artist IDs and face credits. Use reviewed name mappings only when IDs are absent; unresolved identities stay unresolved. Do not inherit credits from other editions or indiscriminately traverse related/meld cards.
7. Handle deprecated/replaced source identifiers only through a documented migration or verified mapping. Log the original ID and migration; do not infer replacements by card name.

Minimum printing statuses: `exact`, `manual`, `ambiguous`, `unknown`, and `conflict`. Attendance-match states are separate: `attending`, `no_listed_attendee`, `artist_unmapped`, `credit_missing`, and `data_unavailable`. This separation prevents “we could not resolve the card” from being displayed as “no attending artist.”

## Main interface flow

1. **Import:** event title, one URL field, a clear “Find artists” button, and a small supported-export option. Saved decks appear underneath.
2. **Review:** concise import progress and a visible count of unresolved printings. The site remains useful for resolved lines without concealing partial results.
3. **Browse:** artist groups with portrait, official name, matched copy count, official profile/Scryfall/social actions, and their matching card rows. A compact toolbar handles search, sort, and section filters.
4. **Return:** reopen a saved deck instantly, refresh its source on demand, or manage/export local data. The app never refreshes a source deck silently in a way that changes selected printings without showing the update.

Each artist image and name links to that artist's official MagicCon profile. Icon links are individual anchors with clear focus states and adequate spacing. Do not nest links inside another clickable profile card. Missing social links are omitted; unknown-platform links use a labeled generic external-link icon.

## Suggested repository layout

```text
ROADMAP.md
README.md
package.json
package-lock.json
requirements.txt                 # pinned data-pipeline dependencies
src/
  app.ts
  components/
  importers/                    # moxfield, archidekt, supported exports
  matching/                     # printing resolution and attendance matching
  storage/                      # IndexedDB, migrations, backup/restore
  models/
  styles/                       # tokens, base, components, responsive rules
public/
  brand/                        # logo, favicon, approved exports
  data/<version>/               # generated manifests and compact data shards
  _headers
  _redirects
scripts/data/                   # download, ingest, reconcile, count, publish
schemas/
data/curated/                   # reviewed identity mappings and event records
data/raw/                       # ignored bulk downloads
data/staging/                   # ignored local database/intermediate outputs
reports/                        # committed compact audit tables/reports
tests/fixtures/                 # minimal public/synthetic test fixtures
docs/                          # import feasibility, data dictionary, runbooks
.github/workflows/
dist/                           # ignored reproducible static build output
```

Keep large raw snapshots out of normal Git history and out of the deployed site. Start with committed compact derived data if its measured size is reasonable; if growth becomes material, make an explicit storage/build decision with cost limits rather than quietly enabling Git LFS, R2, or a paid artifact service. UI-only builds consume the last validated derived dataset.

## Cost controls

The target is **$0 incremental hosting cost on the current free service**, excluding the already registered domain's renewal and any existing account subscriptions. Current limits are a launch-time check, not a permanent price guarantee.

| Area | Project control |
| --- | --- |
| Static traffic | Serve HTML/CSS/JS/data as static Pages assets; no request-triggered application code |
| Cloud services | One approved fixed-provider retrieval Worker on Workers Free; no Pages Functions, D1, KV, R2, paid image service or paid add-on |
| Relay quota | Workers Free account-wide request/CPU limits; no automatic paid fallback, no deck cache or storage; origin allowlist is not an abuse limit; validate traffic controls before launch |
| Build frequency | Aim for at most 100 builds/month for this project; account for other projects sharing limits; batch data updates and restrict unnecessary previews |
| Asset limits | Internal release guard: at most 10,000 deployed files and at most 20 MiB per file, leaving headroom below current provider limits |
| Data refresh | Separate bulk refreshes from normal frontend builds; cache snapshots and skip unchanged outputs |
| GitHub usage | Verify the owner's actual Actions/storage allowance before scheduling jobs; keep private-repository jobs within included usage and configure available spending blocks |
| User data | Browser-local deck storage, with export/restore; no cloud storage expense |
| Images | Lazy-load only visible cards/portraits; do not mirror the full card image library or enable paid transformations |
| Exceeding a limit | Stop/fail the update and keep the last working deployment; do not auto-upgrade a plan |

Cloudflare account-level billing alerts are useful where available, but an alert is not a spending cap. The primary protection is free static hosting plus the retrieval Worker's verified Free plan and hard quota, with no paid bindings or auto-upgrade. Review Cloudflare and GitHub account settings before launch, without changing unrelated subscriptions. An account-wide Workers paid upgrade would invalidate the relay's cost assumption.

## Acceptance test matrix

| Scenario | Required outcome |
| --- | --- |
| Same card name, two editions with different artists | Only the artist on the imported edition is matched |
| Two variants from the same set | Collector number/printing ID disambiguates them |
| Same card printed in multiple languages | Original selected language/printing is preserved; totals follow the defined deduplication scope |
| Foil/etched/nonfoil selection | Source finish survives import; art is not changed based on finish alone |
| Double-faced/split/reversible card | Correct face credits and card identity are retained; one physical line is not counted twice globally |
| Joint artist credit | Verified contributors appear independently; global physical-copy totals remain deduplicated |
| Artist alias or punctuation variation | Reviewed mapping resolves it; raw names remain visible in the audit table |
| Similar names or studio credit | No automatic person merge without evidence |
| Missing artist/illustration identifiers | Explicit uncertainty; no fabricated identity or artwork count |
| Name-only deck export | Printing stays unresolved until manually selected |
| Invalid/deprecated printing ID | Explicit unknown/migration outcome; no name-based substitution |
| New card newer than the data snapshot | Freshness issue is visible; no incorrect “no artist attending” result |
| Card in multiple Archidekt categories | Source line quantity is counted once for physical-card totals |
| Commander, sideboard, tokens, maybeboard | Each section is retained and filters affect totals consistently |
| Private deck/CORS block/provider outage | Specific actionable error; saved decks remain usable |
| Roster/profile scraper returns empty output | Refresh fails safely and last validated dataset remains published |
| Artist removed or renamed in a later roster | Reviewable attendance diff; stored deck printing does not change |
| User reloads or returns later | Saved decks reopen from the same origin without login |
| Backup restored after schema update | Validation/migration succeeds or reports a clear recoverable error |
| Storage denied or full | Current results remain usable with a backup option |
| Final-domain deployment | Imports, static data, local storage, redirects, TLS, and profile links work from the actual domain |
| Malicious text or URL in external data | Displayed safely; no script execution, unsafe navigation, or spreadsheet formula execution |

## Milestones and critical path

| Milestone | WBS | Result | Status |
| --- | --- | --- | --- |
| M0 | 0.0 / 0.1–0.5 | Evidence-based roadmap, project identity, account destinations, and execution boundary | Complete |
| M1 | 1.0 | Complete dated card/printing/artist catalogue | Complete — 546,137 source records; audit passed |
| M2 | 2.0–3.0 | Audited attendee roster, reviewed identities, and totals tables | Complete — 65 verified attendees; 2,434 source artist rows; counts/exports validated |
| M3 | 4.0 | Import feasibility proven under an explicit architecture decision | Complete — owner-approved Free Worker deployed; both providers verified over HTTPS; printing preservation and exception contracts recorded; production R01 remains later work |
| M4 | 5.0–8.0 | Complete local application, logo/CSS, matching, and saved decks | Complete — WBS 5–8 implemented and validated locally; release matrix remains WBS 9 |
| M5 | 9.0 | Correctness, browser, accessibility, performance, and cost checks pass | Complete — available-browser coverage and limitations recorded; optimized Free relay verified |
| M6 | 10.0 | GitHub-driven production site on the registered domain | Planned |
| M7 | 11.0 | Documented update/recovery process and event readiness | Planned |

Critical path: **M1 → M2 → M3 → M4 → M5 → M6**. Branding can proceed alongside application structure after the data milestone. Account/repository setup can proceed when needed for a preview. Do not spend time on a polished interface before the exact-print data model and import feasibility are established.

No delivery date is committed yet. Dataset processing and browser retrieval feasibility are established; production work will follow the approved static frontend and retrieval-only Free Worker architecture.

## Risk and decision register

| ID | Risk/decision | Response | Resolve by |
| --- | --- | --- | --- |
| D01 | Confirmed direct-provider HTTPS CORS blockers | Owner-approved fixed-provider Free Worker works with both production adapters from localhost:3000. Direct CORS unchanged; final production-origin validation remains | 4.7 and 7.0 complete; release-origin 10.7 |
| D02 | Export identity gaps and stale provider printing IDs | Guarded Arcane Signet alias implemented with original identity retained. Inconsistent v2 quantities reject the snapshot and offer explicit refresh/file recovery; no runtime v3 fallback. Missing language/section stays in manual review; generated tokens stay uncounted | 4.7 proofs and 7.4 implementation complete; re-review if provider fields change |
| D03 | Artist names differ or represent multiple people | Resolved for this event snapshot: 65 verified mappings; unknown source names remain explicit in the discrepancy queue | 3.9 — complete; re-review on source changes |
| D04 | Full catalogue is too large for fast browser use | WBS 9 audit includes bootstrap, duplicate requests and full dated provider bodies: 3.62–4.34 MB encoded metadata estimate; no full-catalogue download. Decoded metadata exceeds 5 MiB; transfer-budget interpretation recorded explicitly. Browser sort/render p95 17.30 ms | 9.5 complete; verify actual Pages encoding/WAN transfer in 10.7 |
| D05 | Source directory is dynamic or changes structure | Reproducible public extraction, completeness audit, failure thresholds, last good snapshot | 2.7 / 11.2 |
| D06 | Attendance or socials change | Dated event snapshots and reviewable source diffs | 11.5 |
| D07 | Browser storage disappears or domain changes | Clear local-storage copy and versioned export/restore; use final origin early | 8.6 / 10.6 |
| D08 | Unexpected hosting/build expense | Workers Free reverified; no paid upgrade/storage. Three managed transient rate counters reject excess imports before upstream; no logs, paid CPU override or automatic paid fallback. Active-version CPU P99 7.12 ms in bounded sample. Free quota is account-wide and counters are colo-local | 9.7 complete; recheck actual account/quotas in 10.5 |
| D09 | Third-party images or attribution terms | Retain provenance, review applicable source guidance, link originals, use graceful placeholders | 2.5 / 6.8 |
| D10 | Product/repository/domain selection | Resolved: `moxgraph.com`, public `Westly/moxgraph`, and planned Cloudflare Pages project `moxgraph`; account presence verified | 0.5 — complete |
| D11 | Cloudflare platform guidance changes | Recheck current hosting options and limits while preserving static delivery and the approved retrieval-only Worker boundary | 10.5 |
| D12 | One data file updates without its related indexes | Versioned manifests, checksums, validation, atomic deployment | 5.6 / 10.8 |

## Source register

Links are source references, not guarantees of permanent endpoints. Preserve observed timestamps in the implemented source manifest.

| Source | Purpose | Initial verification |
| --- | --- | --- |
| [MagicCon Art of Magic](https://mcatlanta.mtgfestivals.com/en-us/art-of-magic.html) | Event context and path to full directory | Overview and directory link verified |
| [MagicCon artist directory](https://mcatlanta.mtgfestivals.com/en-us/art-of-magic/artist-directory.html) | Authoritative attendance discovery | Complete 65-entry directory plus 65-entry overview captured and browser ID sets verified in WBS 2.0 |
| [David Palumbo profile supplied by owner](https://mcatlanta.mtgfestivals.com/en-us/art-of-magic/artist-profile.html?gtID=379894&guest-name=David-Palumbo) | Individual photo/profile/social extraction fixture | Current membership, portrait URLs, booth 9168, all three days, and Instagram captured; rendered social label/destination verified |
| [David Palumbo Scryfall search supplied by owner](https://scryfall.com/search?q=artist%3A%22David+Palumbo%22&unique=cards&as=grid&order=name) | Artist browsing-link example | Not used as a computed numerical total |
| [Scryfall bulk API](https://api.scryfall.com/bulk-data) | Discover current full-card snapshot | Full 2026-10-11 snapshot downloaded, checksummed, ingested, and audited in WBS 1.0 |
| [Scryfall bulk documentation](https://scryfall.com/docs/api/bulk-data) | Dataset definitions and usage | Direct page returned 403 in initial research; metadata used instead |
| [Scryfall card fields](https://github.com/scryfall/api-types/blob/main/src/objects/Card/CardFields.ts) | Printing/face/artist identity model | Primary public definitions inspected |
| [Scryfall API access guidance](https://scryfall.com/docs/faqs/i-m-having-trouble-accessing-the-scryfall-api-or-i-m-blocked-17) | Polite bulk/API access | Guidance favors bulk for large datasets and requires bounded API traffic |
| [Moxfield help](https://moxfield.com/help) | Provider support and workflow investigation | Rendered help/terms/export UI reviewed; owner-provided v2 API tested with confirmed existing permission; HTTPS CORS failure documented |
| [Archidekt FAQ](https://archidekt.com/faq) | Provider workflow investigation | FAQ/developer API guidance and actual CSV reviewed; localhost succeeds, HTTPS CORS fails |
| [Cloudflare Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/) | Repository-driven deployment | Verified |
| [Cloudflare Pages pricing](https://developers.cloudflare.com/pages/functions/pricing/) | Static versus Functions cost boundary | Verified |
| [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/) | Build/file constraints | Verified; recheck before launch |
| [Cloudflare custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) | Domain association and DNS | Reference reviewed |
| [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) | Browser feasibility | Reference reviewed |
| [MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) | Local structured storage | Reference reviewed |
| [MDN storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) | Storage durability/error behavior | Reference reviewed |

## Progress log and next task

| Date | WBS | Work completed | Evidence / next action |
| --- | --- | --- | --- |
| 2026-10-11 | 0.1–0.4 | Workspace/source reconnaissance and detailed project roadmap | Empty local Git repository inspected; primary references above checked; implementation tasks remain open |
| 2026-10-11 | 0.5 | Recorded `moxgraph.com`, verified connected GitHub identity `Westly`, and confirmed the domain in the authenticated Cloudflare dashboard. Owner selected public `Westly/moxgraph`. Opened official account pages | WBS 0.0 complete. Repository and Cloudflare project creation remain later-phase tasks; no credentials stored in the roadmap |
| 2026-10-11 | Execution rule | Owner directed work to proceed one parent WBS at a time without skipping steps | Stop after 0.0; wait for an explicit request to begin 1.0 |
| 2026-10-11 | 1.1–1.8 | Owner authorized the next parent. Created the stdlib downloader, streamed all 546,137 records into SQLite, preserved 24,629 faces and 2,434 artist IDs, built exact indexes, and generated quality reports/fixtures | 13 tests pass; artifact checksums and coverage sums verified; zero rejected, duplicate, unaccounted, or ambiguous printing records. Source credit gaps documented. WBS 1.0 complete; stop before 2.0 |
| 2026-10-11 | 2.1–2.8 | Owner authorized the next parent. Captured both public artist feeds and all 130 individual profiles; consolidated 65 attendees while preserving original names, portrait URLs, socials, gallery links, booths and days | Browser ID sets and David Palumbo fixture verified; 13 focused tests pass; source/artifact hashes checked. Three missing portraits, 36 missing social fields and seven defective profile destinations documented. WBS 2.0 complete; stop before 3.0 |
| 2026-10-11 | 3.1–3.9 | Owner authorized the next parent. Assigned stable UUID keys, reviewed all 65 event identities and 230 joint-credit combinations, computed full/event totals with explicit scope, and generated CSV/JSON reports and discrepancy queue | 46 total tests pass; independent SQL confirms all 65 card/printing totals; CSV equivalence and artifact hashes verified. Seven real printing fixtures and 19 deeper profile reviews retained. WBS 3.0 complete; stop before 4.0 |
| 2026-10-11 | 4.1–4.6 | Owner authorized the next parent and supplied two decks, the Moxfield v2 endpoint and confirmation of existing permission. Captured sanitized payloads, tested real localhost/HTTPS access, deployed only a three-file research probe, audited exact printings and official exports | `docs/import-feasibility.md`; 55 total tests pass. CORS blocks both HTTPS paths; one Arcane Signet ID is unresolved; supplemental v2 quantities fail reconciliation. D01 requires provider configuration or explicit scope decision. Research complete; no WBS 5 work started |

| 2026-10-11 | 4.7 follow-up | Owner requested work through blockers. Located existing Python integration in D:\EDH.GG; rechecked uncached public headers; reviewed historical Arcane Signet alias; verified complete 975-row v3 recovery; prepared fixed-provider relay and checked actual Cloudflare Free subscription | `docs/import-blocker-resolution.md`; 71 tests pass (64 Python, seven relay). Automatic approval review rejected the Hello World creation/persistent Worker exception. No Worker created; no WBS 5 started. Need specific approval, then deployment and real HTTPS proof |

| 2026-10-11 | 4.7 deployment | Owner explicitly approved the described Free Worker exception and deployment. Created the research Worker, replaced temporary Hello World with the exact reviewed source, verified disabled logs/storage and tested real HTTPS retrieval | Active code version `51823ab3`; two personal Moxfield decks and Archidekt succeed. All 351 selected printing rows equal direct fixtures. Supplemental v2 quantity mismatch is correctly flagged. No paid upgrade, production DNS change or WBS 5 work. WBS 4.7 complete |

| 2026-10-11 | 5.1–5.7 | Owner authorized the next parent. Created pinned TypeScript/Vite scaffold, 16 schemas and types, full compact catalogue, UUID/tuple/artist indexes, version manifest, browser loader and static release guards | 12 app tests, TypeScript, full 546,137-record/reference audits and production build pass. Browser exact/unknown lookup verified; identical regeneration confirmed. 7,597 deployed files; app shell about 21 KB gzip. No cloud/GitHub change. WBS 5 complete; stop before 6.0 |

| 2026-10-11 | 6.1–6.8 | Owner authorized the next parent. Created three original logo concepts and final SVG/PNG set, CSS tokens, responsive deck-entry/example-results/real-directory screens, link/printing components and visual evidence | Fifteen app tests, TypeScript, full static audits and build pass. Desktop/390/320 px review, source links, keyboard/pointer controls and controlled load failure/retry verified. No cloud/GitHub change. WBS 6 complete; stop before 7.0 |

| 2026-10-11 | 7.1–7.11 | Owner authorized the next parent. Added real v2 Moxfield/Archidekt imports, JSON/CSV/text recovery, exact resolution and guarded alias, manual review, artist/face matching, section/search/sort controls and explicit totals/errors | 32 app tests, TypeScript, complete static audits/build pass. Live browser imports match fixture totals; file/paste, manual confirmation, cancellation and failure retention verified. Fixed browser fetch binding and narrow-form overflow. Evidence: `docs/deck-imports.md`, `reports/import-matching-*.json`, `reports/screenshots/wbs7-*.jpg`. No cloud/GitHub change. WBS 7 complete; stop before 8.0 |

| 2026-10-11 | 8.1–8.8 | Owner authorized the next parent. Added versioned transactional IndexedDB stores, local library controls, source refresh/reimport with guarded manual-choice retention, bounded SHA-256 JSON backups, merge/replace preview, schema migrations, failure recovery and pinned-ID attendance updates | 47 app tests, TypeScript, full static audits/build pass. Real browser confirms reload/reopen, local names/filters, refresh, duplicate copy, downloaded-file restore, deletion/clear-all/undo, manual persistence and stale-tab conflicts; 390/320 px fit without horizontal overflow. Fixed raw social-provenance validation and persisted list ordering. Evidence: `docs/local-storage.md`, `reports/local-storage-validation.json`, `reports/screenshots/wbs8-*.jpg`. No cloud/GitHub change. WBS 8 complete; stop before 9.0 |

| 2026-10-12 | 9.1–9.8 | Owner authorized the next parent. Added exact-variant and import/storage integration coverage, deterministic browser failure QA, accessibility fixes, performance reports and strict static/relay release policies. Owner authorized minimal encrypted Wrangler access; deployed rate limits and native stream batching to the existing Free relay | 125 tests, TypeScript and complete static build/audits pass. Browser import/refresh, two-deck file restore, five clean axe states, responsive layouts and cached sort/render verified. CPU issue fixed: active version d1ad7fe1 P99 7.12 ms. Full limitations and production gates: `docs/release-validation.md` and `docs/release-checklist.md`. No GitHub, Pages or domain change. WBS 9 complete; stop before 10.0 |

**Current working point: WBS 10.0 authorized and in progress.** No WBS 9 blockers remain. The owner requested WBS 10 on 2026-10-12. Authenticated GitHub identity Westly and existing Git Credential Manager access are verified; the agreed public repository has been created. Continue the remaining 10.2–10.8 steps in order, then stop before WBS 11. Final-domain imports/headers/compression/storage, Git-triggered deployment, TLS/redirects and rollback remain production launch gates. Other browser engines and real mobile devices were unavailable; Moxfield denied one command-line route while actual browser imports worked. These limits are recorded rather than claimed as passing universal coverage.

When resuming work, read this file first and confirm which parent WBS the owner has selected. Work only on that parent's incomplete children in order, update this log with actual files/checks/issues, and stop at the parent boundary. Dependency readiness alone does not authorize moving to the next parent.
