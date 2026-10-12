# Data maintenance and event readiness — WBS 11

The site publishes a reviewed static snapshot. Visitors do not trigger bulk downloads or roster scraping. `data/pipeline.json` selects the card and event revisions used together by all preparation tools. Ordinary GitHub/Pages builds run the offline release gate against committed files. No refresh scheduler, background service, paid plan, or new credential is configured.

## Manual refresh

Use the pinned Node/Python versions and installed project dependencies from the [deployment guide](deployment.md). Allow at least 12 GiB of free disk per staged run; raw captures, SQLite databases, validation output and recoverable backups stay in ignored `data/staging/refresh/`. Run from the repository root on a `codex/` branch. Finish code changes before preparing a candidate: the command records executable-source hashes and refuses to promote after those sources change.

```powershell
python scripts/data/refresh.py prepare
```

The command prints an absolute run directory. Keep it for the following commands. Preparation copies the current release inputs into an isolated workspace, discovers and ingests the full Scryfall `all_cards` source, then captures both MagicCon artist feeds and every individual profile. It preserves every original printing ID, collector number, language, finish and face credit. Repeated immutable snapshots reuse only byte-count/checksum-verified local artifacts; a changed importer rebuilds its database. Scryfall transfer has bounded retries and never retries an access/rate-limit rejection. Attendance collection uses three workers, request delays, timeouts and response-size bounds.

Before building, inspect the official rendered [overview](https://mcatlanta.mtgfestivals.com/en-us/art-of-magic.html) and [directory](https://mcatlanta.mtgfestivals.com/en-us/art-of-magic/artist-directory.html). Record their complete guest/exhibitor ID sets, populated groups, filters/pagination, observation time and a rendered profile/social spot check in the candidate's `workspace/reports/magiccon-browser-audit.json`. Record the new event snapshot ID and captured renderer checksum. Review changed renderer behavior; a matching checksum may reference the previous code review, but roster IDs and profile observations must be newly observed. Do not relabel old browser evidence as a new observation. See [event-data methods](event-data.md).

```powershell
python scripts/data/refresh.py build --run "ABSOLUTE_RUN_DIRECTORY"
```

Alternatively supply the new evidence file with `--browser-audit "ABSOLUTE_AUDIT_FILE"`. Build first validates attendance completeness and all list/detail hashes. It then carries forward only unchanged verified artist identities with the original review dates. A changed UUID, observed name, identity profile URL or biography enters the review queue. New identities receive no guessed Scryfall ID. Review queued evidence in `workspace/data/curated/artist-match-review.json`, including each decision's `reviewed_at`, expected raw names, expected UUID/name observations, evidence URLs and explanation, then rerun `build`. Cross-section guest/exhibitor discrepancies are separately reviewed in `workspace/data/curated/events/atlanta-2026-identity-review.json`. Never mark an uncertain pair verified merely to clear a gate.

The ordered build revalidates each existing printing alias against the new source (exact ID, name, edition, language, paper finish, artist and illustration, with the historical ID still absent), reconciles identities, recomputes all artist/event counts, verifies CSV/JSON equivalence and independent SQL totals, produces the change report, packages an immutable data version, updates its demo reference, then runs `npm run verify` in the isolated workspace. A candidate must pass every stage before promotion is available.

Inspect `workspace/reports/data-refresh-diff.md`, its underlying JSON, and `workspace/reports/printing-alias-validation.json`. They list roster additions/removals, event-name changes, changed portraits/profile/social destinations, booths/days/status, changed Scryfall name observations, unmapped attendees and changed counts. Any decrease, increase of at least 10, or relative change of at least 5% is a material artist-count change. A greater-than-2% printing/source-artist drop or any roster removal requires a source-backed explanation. Empty data and unresolved identities cannot be approved. Disappearance is never automatically described as cancellation.

```powershell
python scripts/data/refresh.py promote --run "ABSOLUTE_RUN_DIRECTORY" --review "SHA256_FROM_DIFF" --note "Specific source review, including explanations for any removals or material changes."
npm run verify
```

Promotion requires the exact reviewed diff hash, meaningful notes, unchanged validated outputs and unchanged working-release inputs. It writes a recoverable journal before changing files, retains old data outside the public directory, and records the review in `reports/data-refresh-validation.json`. This is local preparation; deployment happens only after a checked Git commit/PR merge. Commit the pipeline selection, new manifests/catalogue, curated data, reports, demo/fixture references and the complete `public/data` replacement together. Never publish only totals, an active pointer, or selected shards. The normal protected-main release automatically deploys Pages and the existing relay; verify both pipeline results and the live version afterward.

`npm run data:refresh -- prepare` is an equivalent wrapper. `prepare --offline` is a replay of already captured, checksum-verified local sources; it is explicitly recorded as an offline replay and does not claim a fresh scrape. For `prepare --offline`, the event raw files must exist at their manifest paths under the repository root; staged event captures normally remain inside their run workspace. Rebuilding that existing run already works offline. To prepare a separate offline replay, first copy the matching captured raw files to those root-relative paths and let the command verify their hashes. Raw files are absent from a normal Git clone. `npm run data:build` is the lower-level packager and requires the matching local SQLite database; use the staged workflow for an actual refresh.

## Failures and local recovery

- Fetch, parsing, browser completeness or identity failures leave the current working/public release untouched. Inspect the run's `state.json` and failed manifest; fix the source interpretation before starting a new preparation. An environment-only test-runner failure can be retried with the same `build` command after resolving that environment issue; it revalidates the captured sources without fetching them again. Completed card artifacts can be reused by the next run without redownloading. Do not weaken a source/schema guard to accept an empty result.
- A partial promotion automatically restores the previous local release. For an interrupted process or a completed promotion that needs undoing, run `python scripts/data/refresh.py recover --run "ABSOLUTE_RUN_DIRECTORY"`. The old release is restored and displaced files remain in that run. Recovery refuses to overwrite subsequent independent edits; preserve those edits and inspect the journal before any manual repair. Never recursively delete or move a computed path without checking that it stays inside the intended workspace.
- For a deployed mistake, roll back the **whole production Pages deployment**, then revert the faulty Git change through a checked PR, as described in [deployment recovery](deployment.md#rollback-and-recovery). On startup and after restoring a backup, the app automatically recomputes saved-deck attendance when the public data version changes. It retains selected printing IDs and commits the replacement cache only after the whole update succeeds. If the update fails, prior cached results and their versions remain available. Refreshing a deck from its provider is a separate action that may intentionally change its source list.
- Keep local raw sources and recovery runs until the replacement is accepted and the prior release is recoverable from Git/Pages. They are not uploaded. If reclaiming disk later, inspect each absolute path, retain needed evidence, and remove only identified completed runs. This project does not automatically prune local data or Git history.

## Manual cadence and dated checkpoints

The maintainer runs this checklist when requested; these dates are a plan, not scheduled jobs or reminders. A missed date does not change the published source timestamp. Source outages retain the last confirmed roster.

| When | Work | Status |
| --- | --- | --- |
| Mondays through October 26, 2026 | Full card refresh, roster/profile capture, diff review, checked publication if warranted | Manual; next planned check October 19 |
| November 2 and 5 | Full ordered refresh and roster comparison | Pending dates |
| November 9–12 | Check the official roster daily; run the full ordered pipeline before publishing any changes | Pending dates |
| November 12 | Final pre-event capture/review, profile/portrait/social spot checks for every changed attendee, booths/days, both deck providers, exact-print image, local backup; archive `pre-event` | Pending date |
| November 16, after 12:00 UTC | Preserve the last reviewed Atlanta snapshot with `post-event`; label it as a dated published roster, not proof of physical attendance | Pending date |

The October 12 implementation cannot honestly complete November checkpoints. Pre-event archiving is permitted only during the seven days before the event and requires a capture under 48 hours old. Post-event archiving is refused before the day after the event at 12:00 UTC. If final sources are unavailable, preserve the last verified snapshot with its original capture date and explain the gap; do not manufacture a final scrape.

```powershell
python scripts/data/refresh.py archive --checkpoint as-of
python scripts/data/refresh.py archive --checkpoint pre-event
python scripts/data/refresh.py archive --checkpoint post-event
```

Run only the applicable checkpoint. Archives live under `data/history/events/<event-id>/<snapshot>-<checkpoint>/`, with original published fields, event roster, identity evidence, mappings, totals, source manifests, browser audit and per-file hashes. They are immutable and tracked in Git, excluded from website assets. An existing archive is never overwritten. The initial accepted Atlanta state is preserved before the first refresh; further dated snapshots can coexist. The command verifies that all archived review/count/browser revisions belong together.

Refresh is local, so the conditional WBS 11.4 Actions-refresh controls are not applicable. There is no scheduled Actions job, bot commit or workflow loop. Existing release workflows are bounded to 15 minutes, use the locked dependency cache and perform no bulk retrieval. Do not enable a scheduler or additional service without an explicit owner request. Pages preview and production builds still count against the existing account allowance; avoid redundant pushes and check the dashboard if its build quota is reached. Do not add a paid fallback.

## Corrections and maintenance cases

**Artist aliases.** Preserve both source strings. In the candidate's artist review, identify the exact Scryfall UUID and verify it against official biography/card credits or the artist's own published evidence. Record expected name variants, evidence URLs, a dated decision and why the mapping is justified. A punctuation/fuzzy-name candidate is only a review aid. Do not merge two UUIDs or split a joint credit without individual evidence. Rebuild the complete candidate so mappings, counts, indexes and report hashes remain coherent. Card-printing aliases are different: use the narrow evidence/guards in `data/curated/printing-aliases.json`; never replace a missing printing with a same-name card.

**Provider breakage.** Reproduce with the owner-approved public Moxfield v2 endpoint or Archidekt fixture, retain a sanitized minimal payload locally, and determine whether the failure is transport, schema, quantity or printing identity. Keep the last saved deck available and offer its provider export/manual printing review. Respect upstream access restrictions and rate limits. Do not add a name-only fallback, private credentials, an unreviewed endpoint or an unrestricted proxy. Change adapters/relay only with regression coverage for the actual failing case and recheck Free limits before deploying. See [deck imports](deck-imports.md) and [release checks](release-checklist.md).

**Browser backup recovery.** At `https://moxgraph.com`, use **Download backup** before clearing storage, migrating a browser or replacing a library. On the destination browser, choose **Restore backup**, select/paste the JSON locally, review the preview, and use **Merge** to preserve existing decks. Use replacement only when its displayed removals are intended, after downloading the current library. Malformed, future-version or checksum-failed backups must not erase the current library. A failed **Refresh from source** preserves the prior successful result. Clearing site data can permanently lose unbacked decks; there is no account/server copy. Full behavior is in [local storage](local-storage.md).

**Another event.** First archive Atlanta and commit that history. Create a reviewed branch and a new event ID, official host, feed identity, source URLs and dates; retain Atlanta's original curated event/source files and every history directory. Configuration removes hardcoded snapshot dates from the pipeline, but switching an event is an explicit onboarding task: discover its renderer/category, capture and review both rosters/profiles, create its cross-section identity evidence and a new artist-review baseline, then reconcile/package/test it. The refresh command deliberately refuses to compare one event against another as if it were an ordinary update. Global card UUIDs/credits and saved-deck source selections remain reusable; attendance and identity decisions need evidence for the new event. Update the selected pipeline and app event only in a checked release after this new baseline exists. Multi-event navigation is not implemented by this maintenance step.

## Evidence

`tests/test_data_refresh.py` covers identity invalidation, original review dates, exact printing-alias revalidation, change reporting, exact diff approval, empty/unmapped rejection, target mutation, partial-write/move recovery, path boundaries, immutable archives, future-date guards and verified cache reuse. Existing tests cover collector schema/access errors, exact printing imports and browser transactions. The current refresh receipt, diff, coverage reports and static packaging report record the real run. No deliberate production rollback, future event check or scheduled run is claimed by these tests.

Production acceptance for the implemented maintenance release is recorded in [the WBS 11 receipt](../reports/maintenance-validation.json). Later documentation-only deployments may have different deployment IDs while serving the same tested data version.
