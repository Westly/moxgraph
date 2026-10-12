# WBS 5 — static app and catalogue packaging

This phase supplies the local TypeScript/Vite skeleton, shared contracts, complete compact catalogue and browser lookup infrastructure. WBS 6 has since added the logo/interface, and WBS 7 adds [working imports and matching](deck-imports.md). Local saved decks remain WBS 8. No hosting or repository change was part of WBS 5.

## Build and run

Tested with Node 24.11.0, npm 11.9.0 and Python 3.12. Dependencies are exact versions in `package.json` and resolved by `package-lock.json`; `.node-version` pins the tested runtime. Vite 8 produces static assets; no rendering server or cloud binding is added. [Vite documentation](https://vite.dev/guide/).

From the repository root:

```powershell
npm ci
npm run contracts
# Only when generating/changing a snapshot; needs the WBS 1 local baseline:
npm run data:build
npm test
npm run build
npm run preview
```

`npm run dev` and `npm run preview` now both use `http://localhost:3000`, the loopback origin already allowed by the import relay; run one at a time. The preview serves the validated production build. WBS 7 replaces the old lookup/design-example panel with actual deck imports and matching. The catalogue API and tests remain in use; saved decks are still pending.

Normal UI builds consume the current generated `public/data/` files without a bulk download or SQLite database. Regeneration requires the complete baseline from [data-baseline.md](data-baseline.md). Large inputs and archived generated versions remain under ignored local staging/raw directories. WBS 10 will establish the repository/CI distribution workflow; no remote push was made here.

## Contracts and validation boundaries

Canonical definitions live in [build-contracts.mjs](../scripts/build-contracts.mjs). `npm run contracts` writes [JSON Schema](../schemas/contracts.schema.json), [TypeScript types](../src/models/contracts.ts) and standalone validators. Generated validators need no runtime `eval`, so a normal static Content Security Policy can restrict scripts to the site's own files. [Ajv TypeScript guidance](https://ajv.js.org/guide/typescript.html).

The 12 roadmap entities are represented: SourceSnapshot, CardPrinting, PrintingFace, Artist, ArtistMapping, Event, Attendance, ArtistLink, ArtistStatistics, SavedDeck, DeckLine and MatchResult. EventDirectory, DataManifest, ActiveManifest and FileDescriptor complete the 16-schema set.

`parseContract` accepts unknown JSON at shared catalogue boundaries and rejects unexpected fields, wrong types and invalid identifiers. WBS 7's provider adapters validate temporary import rows explicitly, preserving malformed identity fields as review issues where possible; these are not serialized `SavedDeck`/`DeckLine` records. WBS 8 adds a strict versioned storage envelope around these original rows, with backup integrity checks, transactional IndexedDB persistence and tested migrations; see [local storage](local-storage.md). Domain decisions such as reconciling totals and accepting an explicit manual choice live in the WBS 7 importer. Structural validation alone cannot establish those decisions.

- Collector numbers stay strings, including `1F★` and promo suffixes.
- UUIDs, Oracle identities and provider IDs remain distinct.
- Root and face credits stay separate; missing and empty raw credit strings are retained.
- Null values remain unknown; source names, MagicCon names and mapping evidence survive independently.
- Games, paper/digital flags, category, language, finishes, printed name, images and exact Scryfall URLs are retained. Rules text, pricing and unused source payloads are omitted.
- Original social URLs are retained, including malformed originals. Only the previously reviewed usable URL is eligible for display. HTTP scheme case is preserved in source values; actionable URLs must parse as HTTP(S) without embedded credentials.
- Printing lookup and attendance states are separate. This phase returns `found`, `unknown`, `ambiguous`, or a validation/unavailable error; it does not turn missing data into `no_listed_attendee`.

## Packaging decision

The complete frozen baseline is checked against its original database checksum and opened read-only. No card, language or category is filtered out. Each compact printing row follows `schemas/printing-columns.json`, and decoding returns the named `CardPrinting` contract.

| Asset group | Files | Content |
| --- | ---: | --- |
| UUID-prefix printings | 4,096 | Three hexadecimal characters, exact selected printing fields and faces |
| Set tuple indexes | 1,058 | Collector number + language → exact UUID; duplicate tuples would retain all candidates |
| Artist reverse indexes | 2,434 | Source artist UUID → all credited printing UUIDs, including face credits and supplemental/digital records |
| Shared data | 3 | Full source-artist directory, event directory/mappings/statistics, source provenance |
| Manifests | 2 | Immutable version manifest and small active pointer |

Coverage is **546,137 printings, 24,629 faces, 19 languages, 1,058 sets, 2,434 source artists and 65 attendees**. The reverse index is an all-record browsing index, not the default paper-card statistics denominator. Existing reviewed statistics retain their original scope.

The current data package is about **321 MiB on disk**, spread over **7,593 files**. Visitors fetch only the manifest, required directory information and lookup shards; they do not download the full package. The largest lookup/directory file is 452,612 bytes. The version manifest is larger at 1,321,239 bytes and is included in the maximum-asset check.

Measured complete-deck shard payloads (all supplied sections; excludes shared bootstrap metadata):

| Fixture | Printing rows | Chosen UUID shard requests | Raw bytes | Estimated gzip bytes |
| --- | ---: | ---: | ---: | ---: |
| Owner Soldiers | 111 | 109 | 7,735,099 | 2,812,659 |
| Owner Orzhov | 126 | 125 | 8,692,359 | 3,157,088 |
| Archidekt | 114 | 112 | 7,851,374 | 2,856,540 |

Two-character UUID shards required roughly 34–37 MB gzip for these fixtures; whole-set printing shards about 26 MB. Three-character UUID shards are therefore the selected ID lookup path. Compact set-to-ID indexes remain available for tuple-only inputs. A name index is optional and omitted: names cannot establish an exact printing, and adding another catalogue-wide index would increase initial complexity.

These are **gzip estimates from actual JSON**, not measured Cloudflare transfer sizes. `reports/static-data-packaging.json` also records bootstrap bytes and main/commander-only estimates. Raw complete-deck data currently exceeds the initial 5 MiB WBS 9 target; compressed transfer estimates are lower. WBS 9 must measure the agreed release scenario, network compression and request latency, then optimize or explicitly revise the target. No completed performance claim is made here.

## Version and cache rules

`public/data/active.json` selects a content-derived `v1-<hash>` directory and includes the version manifest's SHA-256 and byte count. That manifest records schema/generator versions, both source snapshots and timestamps, mapping revision, column layout, coverage, and every file's path/checksum/size/count.

The browser pins a single version on open. It verifies the active pointer, manifest, byte lengths, SHA-256 and record shapes before returning lookup data. A missing file or mismatched checksum is an unavailable/error state. It never falls forward to a different version mid-lookup. Explicitly reopening the catalogue is the update boundary.

Concurrent requests for the same file share one pending read. The in-memory cache retains at most 64 assets and 24 MiB of encoded contents (parsed JavaScript objects add overhead). Failed requests are not cached and may be explicitly retried. Fetches omit credentials, reject redirects and have timeout/size bounds. No browser persistence, cookies or automatic provider calls are introduced.

The [Pages headers file](../public/_headers) uses `/data/:version/*` for immutable caching and `/data/active.json` for revalidation, avoiding overlapping cache directives. Pages header behavior still needs a hosted check in the release phase; Vite preview does not apply `_headers`. [Cloudflare header rules](https://developers.cloudflare.com/pages/configuration/headers/).

Regeneration never changes a file under an existing version to different bytes. Superseded local output directories are moved to ignored `data/staging/static-versions/` after their resolved paths are checked; they are not silently deleted or copied into the release. A session referencing a version absent after deployment must report unavailable data and offer an explicit refresh in the later UI.

## Release gates and scope

`npm run build` regenerates contracts, checks TypeScript, validates all source assets, produces `dist/`, then validates the actual deployment output. The checks enforce:

- Every printing, face, artist, tuple, reverse-index and attendee reference; exact coverage counts; source-input hashes and all asset checksums.
- At most 10,000 deployed files and 20 MiB per asset, including the manifest.
- A restricted static-file layout, with no Worker handler, server source, raw database, environment file, dependency directory or unmanifested data.
- Safe actionable URLs, immutable version paths and active-manifest revalidation.

Twelve focused app tests cover real multilingual/multiface fixtures, all 351 provider rows, tuple ambiguity, preserved profile/social links, corrupted/missing files, invalid boundaries, deduplicated reads and forbidden release artifacts. Of the 351 provider rows, 350 resolve to the frozen catalogue; the historical Arcane Signet source UUID correctly remains unknown. Its reviewed target can be looked up independently. Applying that alias and its notice belongs to WBS 7.

Final build/browser evidence is recorded in `reports/app-foundation-validation.json`. This local phase changes neither the existing relay nor production DNS. The subsequent WBS 6 interface and logo review is recorded in `docs/design-system.md` and `reports/design-validation.json`; this WBS 5 report remains historical evidence.
