# WBS 9.8 — release checklist

Recorded 2026-10-12. **WBS 9 complete; production launch remains WBS 10.** See [validation details](release-validation.md), [performance measurements](../reports/performance-audit.json), [local relay audit](../reports/relay-local-validation.json) and [browser/build summary](../reports/release-validation.json).

## Requirement disposition

| Requirement | WBS 9 evidence | Remaining launch work / limitation |
| --- | --- | --- |
| R01 — public deck links | Live browser imports/refreshes from localhost:3000 through the approved HTTPS relay succeed for Moxfield and Archidekt | WBS 10.7 must verify the final domain. One command-line path received Moxfield 403; do not promise provider availability from every network |
| R02 — selected printing | All 351 captured source lines preserve selected identities; Heliod same-set variants change the attendance result; incomplete/unknown identities stay unresolved | Newer cards require a refreshed catalogue; the narrow reviewed Arcane Signet alias is not an official Scryfall redirect |
| R03 — copies and sections | Provider/CSV quantity reconciliation, child printing identity, categories and physical-copy deduplication tests pass | The known inconsistent supplemental Moxfield v2 snapshot rejects safely; no silent v3 fallback. Text exports lack language/section metadata and need review |
| R04 — attendance information | 65 verified event identities, provenance, booths/days and official links retained | Dated 2026-10-11 roster. Attendance can change; refresh procedure is WBS 11 |
| R05 — portraits/socials | All-profile source/presentation contracts and Palumbo browser inspection pass | Three portraits and 36 social fields absent upstream; seven defective official destinations retained/documented, never silently guessed |
| R06 — name reconciliation | Stable Scryfall IDs, raw source names and reviewed MagicCon mapping; ambiguity never auto-merges people | Re-review changed names/source evidence during refresh |
| R07 — artist counts | Reproducible all-artist and attendee CSV/JSON tables; card/printing/artwork scopes, face/joint-credit and CSV safety tests | Counts represent the dated catalogue and documented scope |
| R08 — browser-local library | Transactional save/reopen, real downloaded backup restore, refresh/cancellation/failure retention, migration and quota/denied-storage tests | No cross-device sync. Browser eviction/private mode can erase data; backup is explicit. Actual private-mode and other browser engines untested |
| R09 — static/free boundary | Static build guards, 7,610 files, strict relay configuration, verified Workers Free, managed rate limits, disabled logs/storage, measured CPU under 10 ms | Recheck account-wide plan/quotas in WBS 10. Counters are colo-local/eventually consistent, not a strict global cap; an account paid upgrade invalidates the assumption |
| R10 — GitHub deployment | Build and release checks prepared locally | Entire production integration remains WBS 10: public Westly/moxgraph, Git-triggered Pages, domain/TLS, rollback proof |
| R11 — usable/accessibility | Five axe-audited app/dialog states clean; keyboard, exact image/link, 320/390/768/1280px checks; cached sort/render p95 17.30 ms | Only in-app Chromium 154 tested; Firefox/Safari/Edge, real mobile OS and spoken screen-reader output untested. No blanket WCAG/cross-browser certification |
| R12 — traceable work | Roadmap, reports, reproduction commands, source/version and limitations recorded | Stop at this parent; begin WBS 10 only when requested |

## Acceptance matrix evidence

| Scenario family | Evidence |
| --- | --- |
| Same name/different edition; same-set variants; multilingual print; foil/etched | `tests/app/acceptance.test.ts`, `catalogue.test.ts`, `import-adapters.test.ts`, `import-resolution.test.ts`; real Heliod, Teysa, Japanese and foil fixtures |
| Double-faced, split/reversible and joint artist credit | `tests/test_artist_statistics.py`, `test_scryfall_catalogue.py`, `tests/app/import-matching.test.ts`; physical-copy totals are deduplicated |
| Alias/punctuation, similar people/studio names, missing identities | `test_magiccon_data.py`, `test_artist_statistics.py`, `test_import_recovery.py`, `tests/app/acceptance.test.ts`; raw identity retained, no name-only substitution |
| Name-only export, deprecated/unknown ID, card newer than snapshot | `tests/app/import-exports.test.ts`, `import-resolution.test.ts`, `catalogue.test.ts`; explicit review/unavailable outcomes |
| Multiple categories and all deck sections | `tests/app/import-adapters.test.ts`, `import-matching.test.ts`, `tests/test_import_feasibility.py` |
| Private/provider/CORS/outage/quota/cancel | Import client tests, deterministic browser 404/503/cancel checks, relay denial tests; prior saved results survive |
| Empty/broken roster and removed/renamed attendee | `tests/test_magiccon_data.py` failure preservation and evidence invalidation; storage/acceptance tests keep the selected printing after attendance changes |
| Reload, several decks, changed printing, backups/migrations and unavailable storage | `tests/app/storage.test.ts`, `import-storage-flow.test.ts`, WBS 8/9 browser round-trips |
| Malicious text/URLs/CSV | Presentation, contract, CSV and release-policy tests; production CSP exercised locally |
| Final-domain deployment | Explicitly pending WBS 10; local screenshots are not production-origin evidence |

## Release constraints to carry into WBS 10

- Run the documented tests/build without publishing fixtures, raw snapshots, credentials, the local QA harness or server scripts. Publish only `dist`.
- Keep the approved retrieval Worker separate. No Functions, paid add-ons, storage services or automatic paid fallback. Preserve the original provider endpoint and exact-printing logic.
- Verify encoded static JSON transfer and a real ~100-card import from moxgraph.com. The current full-body estimate is 3.62–4.34 MB, while decoded metadata exceeds 5 MiB; report these separately.
- Verify Git integration, actual headers/cache rules, TLS/redirects, browser-local storage on the final origin and deploy rollback. A localhost library does not automatically migrate to the production domain; export/restore it.
- Record unavailable browser/device coverage rather than claiming it passed. Provider denial remains an actionable failure with export/manual recovery, never an excuse to silently choose another printing.

No new scope exception or paid plan is required by these checks. No WBS 10 action was performed.
