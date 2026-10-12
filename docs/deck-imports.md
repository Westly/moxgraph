# WBS 7 — deck imports and exact-printing results

WBS 7 implements real link imports, supported file/paste imports, exact printing resolution, reviewed artist matching and usable results. It replaces the production UI’s WBS 6 example. Saved decks remain WBS 8; this version holds the current deck and manual choices in memory only. No cloud deployment, account, repository, DNS or billing setting was changed.

## Run and verify

```powershell
npm ci
npm test
npm run build
npm run preview
# Separate, repeatable local fixture report:
node --import tsx scripts/audit-imports.ts
```

Open **http://localhost:3000/**. Both `dev` and `preview` now default to that loopback origin; run one at a time. The existing approved relay explicitly allows that origin. `127.0.0.1`, another port or an arbitrary preview domain is a different origin and may be refused. Use a supported export there instead. The final moxgraph.com browser check remains WBS 10.

## Supported inputs

| Input | Exact identity and limitations |
| --- | --- |
| Public Moxfield link | Fixed relay route to the owner-selected v2 endpoint. Selected `printingData` children retain their own UUID, quantity, finish, set, collector number and card language. The wrapper language and parent printing are never borrowed. Every row and board total must reconcile. |
| Public Archidekt link | Fixed relay route to the public deck JSON. Selected UUID, provider row/card IDs, Oracle ID, set, collector number, modifier and category memberships are retained. Oracle display language is not a printing language. |
| Moxfield v2 / Archidekt JSON file or paste | Same structural checks and quantity rules as link imports. Source deck identity remains available; the interface distinguishes file, paste and link retrieval. No runtime v3 adapter or fallback is enabled. |
| Archidekt CSV | Header must include Quantity, Name, Edition code, Collector number, Category, Secondary categories, Finish and Scryfall ID. CSV quoting, multiline fields, BOM and the actual bare quotes in `"Name Sticker" Goblin` are supported. File row numbers are provenance; custom category inclusion may require review. |
| Moxfield “Copy for Moxfield” text | Quantity, card name, `(SET)`, collector number, optional `*F*` or `*E*`. UUID, language and commander/section labels are absent. All rows stay unsectioned and unresolved pending explicit confirmation; considering cards can be omitted from the source export entirely. |

Only allowlisted public deck-page URLs are accepted. Known bare-host/www/trailing-slash/Archidekt slug variants normalize to a canonical source URL; tracking queries/fragments are discarded. User input never becomes an arbitrary retrieval target. Limits: 12 MiB input, 5,000 selected lines, 100,000 copies, bounded text fields and categories. No provider credentials or cookies are sent.

## Resolution and matching

`src/imports/adapters.ts` validates untrusted provider structures into temporary import rows. These retain invalid source identity as a reviewable issue where possible. WBS 8 persists them in a validated `PackedEntry` envelope, preserving original invalid identifiers for review rather than coercing them into normalized `SavedDeck`/`DeckLine` records. See [storage contracts and migrations](local-storage.md). Catalogue printings and event records still pass the shared generated contracts and checksum checks in `Catalogue`.

Resolution uses the selected Scryfall UUID first and rejects contradictory supplied set, collector number, language, finish or Oracle identity. A missing UUID can use set + collector number + explicit language. Missing language stays ambiguous even when only one language candidate exists. Names never select a printing. Missing/corrupt catalogue data aborts the import transaction rather than asserting that an artist is absent.

The one reviewed Arcane Signet migration checks the provider, old UUID, provider printing ID, name, set, collector number, language, finish and frozen baseline. Its target identity, artist, illustration and finish must agree with the reviewed record. The old source fields and notice remain visible. It maps to Gaboleps, who is not in the event roster.

The review dialog loads candidates and requires an image/identity preview followed by **Confirm this printing**. A valid UUID may be entered when no candidate exists. Manual choices preserve source fields, record selection time, printing, section and finish, and show a manual label. They last only for this tab. Selecting a candidate alone changes no result; async preview races cannot commit an earlier candidate over a later selection.

Resolved printing and face artist IDs join only verified mappings for listed attendees. Whole reviewed Scryfall credit names are a fallback only when source artist IDs are absent and exactly one mapping agrees. Arbitrary joint strings are never split. Multiple artists/faces contribute separate artist associations for the same physical line, without following other printings or meld-related objects.

Digital-only selections remain exact selections. For example, Archidekt’s `fd1442b4-da59-4042-835f-143c8dcaa73b` is UNF 107m `"Name Sticker" Goblin`, not available in paper. It is retained under other results with that label and excluded from signing totals.

## Results and recovery

Main deck + commanders are selected initially. Other source sections, sideboard, maybeboard, companions, selected tokens, unusual sections and unsectioned exports remain selectable. Archidekt category memberships do not duplicate a row. Moxfield’s generated token suggestions have no selected quantities and are not counted as owned copies.

Artist and card order default to A–Z. Users can sort by copies or set and search card names/printed names/credits or matched event artist names. Totals distinguish matched physical copies, expanded source lines, unique printing IDs and attending artists. A shared credit appears in multiple artist groups but counts once overall. Other resolved lines and the all-section review queue remain accessible.

Expanded rows show exact image(s), set, collector number, resolved language, selected/unknown finish, source categories, source IDs, credits by face and the exact Scryfall printing page. Image failures do not borrow another printing’s art. Official portraits/profiles and usable published socials remain linked. Artist search links are generated from reviewed Scryfall names/aliases with query escaping and URL encoding, using `unique=cards`.

Only a fully read, validated and resolved import replaces the current result. Failures and cancellation leave it intact. There is one active provider request, a five-second per-provider minimum interval, 25-second timeout and no automatic retries. HTTP 429 respects an exposed Retry-After (seconds or date), with a 60-second minimum/default and a visible retry time. The current relay emits a fixed 60-second value but does not expose that header cross-origin, so the fallback matches its current response policy. Longer upstream delay forwarding/header exposure and account-wide abuse controls need the WBS 9/10 relay review; no relay change was made here.

Missing/private/blocked decks, non-JSON/malformed responses, quantity mismatches, connectivity/CORS failures, quota/downtime and unavailable data have explicit messages and manual retry/export recovery. Card snapshots older than 14 days show an age notice. Reloading loads the active catalogue version. WBS 8 now restores browser-local saved decks, choices, filters and cached results, and recomputes attendance while retaining printing IDs; see [local storage](local-storage.md). No silent endpoint change, automatic paid fallback or guessed quantity is used.

## Evidence

All **32 app tests** pass; TypeScript, the full source/output catalogue audits and production build pass. Static output has **7,610 files**, a 1,321,239-byte largest asset and approximately **43.5 kB gzip** of HTML/CSS/JS (excluding catalogue/images). Full transfer/performance validation remains WBS 9.

| Captured source | Lines / copies | Exact / reviewed alias | Default matched copies / printings / artists |
| --- | ---: | ---: | ---: |
| Owner Soldiers | 111 / 139 | 111 / 0 | 17 / 17 / 13 |
| Owner Orzhov | 126 / 139 | 125 / 1 | 34 / 21 / 15 |
| Archidekt 19780118 | 114 / 114 | 114 / 0 | 19 / 19 / 16 |
| Official Archidekt CSV | 114 / 114 | 114 / 0 | 19 / 19 / 16 |

The supplemental 975-card Moxfield v2 fixture is rejected because expanded quantities total 1,187; a fresh complete export is required. The official 87-row Orzhov text export retains 100 copies, with 86 ambiguous identities and one absent tuple pending review. These are explicit supported recovery cases, not silent losses.

- [Reproducible fixture audit](../reports/import-matching-audit.json)
- [Validation and browser evidence](../reports/import-matching-validation.json)
- [Desktop import](../reports/screenshots/wbs7-desktop.jpg), [artist/card results](../reports/screenshots/wbs7-results.jpg), [mobile](../reports/screenshots/wbs7-mobile.jpg), [manual review](../reports/screenshots/wbs7-review.jpg), [error recovery](../reports/screenshots/wbs7-error.jpg)

Real browser imports from `http://localhost:3000` through the deployed HTTPS relay succeeded for both owner decks and Archidekt. Their displayed source and matched totals agree with the offline report. The official CSV was also selected through the actual file picker. Browser tests cover a missing-language paste, preview/confirmation, invalid link and inconsistent-quantity preservation, cancellation, source links, search/sort/sections and responsive layouts. Controlled provider 429/403/404/502/503, malformed payload and missing/corrupt data cases use automated mocks; they were not forced against the live providers.

No WBS 7 blocker remains. WBS 8 (saving/backup/migrations), WBS 9 (full release QA/performance/traffic controls) and WBS 10 (GitHub/Cloudflare production/final-origin checks) remain unstarted.
