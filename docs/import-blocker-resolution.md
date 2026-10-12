# WBS 4 — blocker resolution follow-up

Observed 2026-10-11. The owner requested work through the blockers. Work remains inside WBS 4; no WBS 5 application or production deployment was started.

## Current outcome

| Blocker | Work completed | Remaining limitation |
| --- | --- | --- |
| Browser CORS | Owner approved the narrow Free Worker exception. Deployed the reviewed relay; real HTTPS browser retrieval succeeds for both personal Moxfield decks and the Archidekt fixture | Direct provider CORS remains unchanged. Production adapters, traffic controls and final-domain browser tests remain later release work |
| Historical Arcane Signet ID | Reviewed a single, fully qualified provider-printing alias to Scryfall P30M #1F★, English etched, Gaboleps | This is a reviewed inference, not an official ID redirect. Preserve the original fields and show the mapping notice |
| Inconsistent Moxfield v2 quantity | Confirmed the raw JSON has no duplicate object keys; verified a complete v3 snapshot of the same deck revision with 975 copies and all three Spirit printings | v2 remains primary. The offline recovery proof does not enable a runtime v3 fallback or repair the provider's v2 response |

The original [feasibility report](import-feasibility.md) and its observations remain valid historical evidence. The separate [recovery audit](../reports/import-recovery-audit.json) records what can now be resolved without rewriting those observations or the frozen catalogue.

## Existing integration checked

The owner's **Build Commander deck platform** task identifies its actual checkout as `D:\EDH.GG`, separate from the saved project directory. Read-only inspection of `src/edhgg/integrations/moxfield.py` confirms the same owner-selected `api.moxfield.com/v2/decks/all/` endpoint. It retrieves public JSON from Python with a descriptive User-Agent, fixed host, bounded timeout/response size and redirects disabled. It does not establish browser CORS compatibility and supplies no reusable hosted relay.

The public `Westly/EDH-Auto-Podder` and `Westly/TheManaFoundation` repository trees were also inspected read-only. No other project was changed; credentials were not copied. The earlier repository search returning no results was not proof that these repositories or the working integration were absent.

## Arcane Signet: reviewed exception

The owner deck and official export identify Moxfield card `2zQaK` as `p30a / 1F / en / etched`, old Scryfall ID `f0deab39-dfa3-4652-a05f-b221b979009a`. Live Scryfall API and its linked card page both return 404 for this UUID.

The [Moxfield printing page](https://moxfield.com/cards/2zQaK-arcane-signet), its displayed image and stored payload identify the Gaboleps Festival promo with etched finish. The old image and current [Scryfall P30M #1F★](https://scryfall.com/card/p30m/1F%E2%98%85/arcane-signet) show the same artwork and printed `001/001 P Festival`, `PRM EN`, 2022 credit line. Scryfall explicitly labels that record English and Etched.

This must **not** map to P30M #1F merely because its number looks closer: that separate UUID has nonfoil/foil finishes. P30M #1P is also a separate foil record. The reviewed etched target is `7910ce6c-5cde-436e-8d28-62723f0fd592`, illustration `941f324d-5b4d-479f-8db7-c98813ce4c3e`.

[printing-aliases.json](../data/curated/printing-aliases.json) requires the provider, old UUID, provider printing ID, name, set, collector number, language **and finish** to match. The resolver checks the target's identity, finish and artwork against the read-only baseline. It returns both original and resolved identities plus a notice. A changed field or unrelated unknown UUID receives no automatic alias. This is a project-reviewed mapping supported by those sources, not a claim that Scryfall published an official migration.

## Quantity discrepancy: preserve the full source snapshot

For `SbEkgxN4CEqiCG5B94rkkg`, the saved v2 payload itself contains Spirit quantity 215, two fewer printing rows, and a total of 1,187 against 975 declared. A duplicate-key-aware JSON read found zero duplicate object keys, ruling out a Python dictionary overwrite as the cause. The provider-side cause remains unknown.

The independent saved v3 snapshot has the same public ID, version 4 and last-updated timestamp. All 975 rows resolve by exact UUID, set, collector number, language **and finish** to the frozen baseline. Its three Spirit printings each have quantity 1; language counts are 719 English, 255 Japanese and one German.

[import_recovery.py](../scripts/data/import_recovery.py) demonstrates a conservative recovery contract:

1. Keep valid v2 snapshots as the primary source.
2. Reject inconsistent or invalid quantities as incomplete, with an explicit issue.
3. An alternate snapshot must match the deck/revision and declared section counts, reconcile its own quantities and pass all printing checks.
4. Use the entire verified alternate snapshot with a visible source-change notice; never merge v2/v3 rows or change 215 to a guessed value.
5. If recovery is absent, different, malformed or unresolved, leave the import unresolved and offer a source refresh or explicit file workflow later.

This is an offline proof for the later WBS 7 adapter, not an enabled network fallback. The deployed relay exposes only the requested Moxfield v2 source and the Archidekt deck endpoint. Both personal v2 decks reconcile correctly without fallback. The live probe still flags the supplemental v2 deck's quantity mismatch; deployment does not repair upstream data.

## Approved serverless exception

The owner explicitly approved deployment after reviewing **one narrow serverless exception**: Cloudflare executes a small public-deck retrieval Worker. The planned frontend remains static, with exact-print matching and saved decks in the browser. No managed server, database, login, visitor provider credentials, advertisements or paid upgrade is introduced.

Deployed source: [worker.mjs](../tools/import-relay/worker.mjs), with [deployment configuration](../tools/import-relay/wrangler.jsonc). Research project: `moxgraph-import-relay-probe`. The code serves a minimal probe and two fixed GET routes:

- `/api/moxfield/{22-character-public-id}` → `https://api.moxfield.com/v2/decks/all/{id}`
- `/api/archidekt/{numeric-id}` → `https://archidekt.com/api/decks/{id}/`

The Worker accepts no arbitrary target URL or query, forwards no visitor cookies/authorization, follows no redirects and retries no upstream failure. It allows only the named Moxgraph/test browser origins, requires JSON, caps each response at 12 MiB and times requests out after 15 seconds. Responses are `no-store`; no deck cache, KV, database, logs in code, secrets, scheduled job or paid service binding is configured. The body streams through so parsing/matching can remain in the browser. An origin allowlist is browser isolation, **not authentication or a global abuse limit**.

This prototype is not yet production-ready. Actual edge retrieval is verified below, and dashboard Logs, Traces and Issues are disabled. Provider failures remain explicit without alternate proxies or challenge bypasses. Before public launch, WBS 9 must address provider-friendly rate limiting/abuse controls and check CPU use, deployment reproducibility and fallback UI. The final `moxgraph.com` browser test remains a release gate.

### Cost and quota boundary

The owner's Cloudflare **Workers plans** page displayed **Free — $0 — Current plan**, 100,000 requests/day and 10 ms CPU per request. Nothing was upgraded. The quota is account-wide, so other Workers/Pages Functions can consume the same allowance. Cloudflare documents Error 1027 after the Free daily request allowance is exhausted. This design chooses temporary import unavailability at the cap, not a paid fallback. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/).

The deployed Worker performs no database/storage operation. Cloudflare still processes request metadata as the host; “no saved decks on our backend” must not be described as “Cloudflare sees no requests.” Saved-deck persistence is still intended to be browser-local. The active Free subscription was checked immediately before creation. Recheck before production deployment; do not upgrade or deploy under a paid subscription without a new cost decision. A later account-wide paid upgrade would invalidate this cost assumption.

### Deployment history and verified outcome

Automatic approval review initially rejected clicking **Deploy** for the named research Worker. The stated reasons were that the dashboard would initially deploy its Hello World template rather than the tested relay, and a persistent Worker conflicts with the original standalone/no-server requirement without specific authorization. That attempt created no Worker. The owner then replied, **“Yes you have my permission to deploy”**, resolving the approval blocker for the described exception and dashboard sequence.

The research Worker is now live at **[moxgraph-import-relay-probe.westlywhite.workers.dev](https://moxgraph-import-relay-probe.westlywhite.workers.dev)**. The temporary Hello World version was replaced with the reviewed source; active code version shown by Cloudflare is `51823ab3`. Editor contents were copied back and compared with the local source after normalizing CRLF/LF line endings before deployment. The local source SHA-256 is `6df9f0e7dd3019536fef440a068ba5eb73512c121c834811afe1a2e475128b52`.

Post-deployment settings showed Logs, Traces and Issues off; no variables/secrets, bindings, scheduled triggers, Git connection or custom domain; cache disabled; compatibility date `2026-10-11`. No paid upgrade or production DNS change was made. The existing static Pages probe is unchanged.

| Real HTTPS browser case | Result | Expanded printing rows | Quantity result |
| --- | --- | ---: | --- |
| Owner Soldiers | HTTP 200, readable JSON | 111 | All declared sections reconcile |
| Owner Orzhov | HTTP 200, readable JSON | 126 | All declared sections reconcile |
| Archidekt 19780118 | HTTP 200, readable JSON | 114 | Browser probe counts rows; separate fixture comparison verifies quantities |
| Supplemental Moxfield art list | HTTP 200, readable JSON with warning | 973 | Correctly flags 1,187 copies versus 975 declared |

The [browser audit](../reports/import-relay-browser-audit.json) preserves the four rendered results from 22:19–22:20 UTC. These are real same-origin browser tests on the Worker's HTTPS origin. The harness's `moxfieldApi: v2` metadata describes its configured Moxfield route, including when the selected provider is Archidekt; it is not an Archidekt API-version assertion.

Three independent public HTTP reads then compared every expanded printing row against the saved direct-provider fixtures: **111/111 Soldiers, 126/126 Orzhov and 114/114 Archidekt match**, including quantities, sections, selected identities, languages and finishes. [HTTP audit](../reports/import-relay-http-audit.json). These reads supplied the Pages preview Origin and received the matching CORS header plus `no-store`; they are **not** real browser tests from Pages or moxgraph.com. A matching provider row also does not establish Scryfall catalogue resolution; the separate Arcane Signet alias still applies.

**WBS 4.7 exit: complete.** The approved transport exception works, printing-preservation evidence is recorded, and the two data exceptions have bounded resolution contracts. No unresolved deployment blocker remains. R01 is not yet a delivered production feature: WBS 7 must implement validation and user-visible unresolved/recovery states, WBS 9 must validate the release controls, and WBS 10 must prove the final origin. WBS 5 has not started.

## Reproduce local checks

```powershell
python scripts/data/import_recovery.py
python -m unittest discover -s tests -v
node --test tests/import-relay.test.mjs
```

Use the bundled Node executable if `node` is not on PATH. Tests cover exact alias guards and target drift, quantity/revision/printing checks, complete Spirit recovery, fixed upstream routes, rejected methods/origins/queries, credential and cookie isolation, redirects, upstream errors and streamed size limits. Validation: **64 Python tests and seven relay tests pass (71 total)**. The unchanged tested source was deployed; documentation links and artifact hashes were refreshed afterward. The [earlier HTTP observations](../reports/import-blocker-http.json) remain direct public API diagnostics; the two new relay audits above record hosted behavior.

To repeat a bounded browser check, open the live relay, enter one public deck URL from the original feasibility report, and press **Test public deck retrieval** once. Keep the rendered result and distinguish transport/quantity success from the later complete artist-matching workflow. Do not load-test the providers or treat the Free daily allowance as a provider request budget.
