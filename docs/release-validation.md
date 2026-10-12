# WBS 9 — release validation

Validation date: 2026-10-12. Scope: WBS 9 only. The GitHub repository, Pages project, production domain and production-origin acceptance remain WBS 10.

## Result

WBS 9 is complete within the available browser coverage described below. The original relay exceeded the Workers Free CPU allowance; optimized version `d1ad7fe1-133b-44d9-9d60-04649b17eaf3` is deployed and passes the bounded live CPU check. Both providers successfully refresh from the real application. The final build validates 7,610 static files and all 546,137 printings. No WBS 9 blocker remains. The [release checklist](release-checklist.md) distinguishes completed local gates from the production launch gates still assigned to WBS 10. Stop before that parent until requested.

The owner approved a minimal Wrangler connection on 2026-10-12: account/user read, Worker-script write and refresh access. Wrangler confirms encrypted credential storage with its key in Windows Credential Manager, outside the repository. No new account plan or paid service was enabled. Cloudflare rejected an explicit CPU setting on Free (API 100328); the configuration therefore uses the Free plan's built-in allowance, with no custom paid-plan override. Preview URLs are disabled.

## Correctness and recovery — 9.1 / 9.2

- 50 TypeScript app tests, nine relay tests, two release-policy tests and 64 Python tests passed (125 total).
- `tests/app/acceptance.test.ts` checks captured Heliod THB 18 versus THB 259: the selected printing changes the artist and attendance match. UUID and tuple paths retain edition, collector number, language, finish and exact image. Synthetic ambiguity cases cannot merge people merely because their names match. Removing attendance does not change the stored printing.
- `tests/app/import-storage-flow.test.ts` exercises the actual importer, resolver and transactional IndexedDB session together. A clearly synthetic Teysa printing change from SLD 1235 to RNA 212 changes Tsubonari to Magali Villeneuve; neither artist attends this snapshot. Failed refreshes leave the prior deck intact. Multiple decks, backup validation/restore and database reopen are covered.
- Browser QA at a separate localhost:3001 origin uses captured fixtures and explicit 404/429/503/delay controls. It confirmed successful imports, actionable 404/503 errors, cancellation, changed printing details, reload persistence and two-deck backup restore (240 lines; 736,703-byte downloaded JSON). The real file chooser restored the downloaded backup; merge kept both existing decks.
- The static production build at localhost:3000 applies the checked CSP/headers and gzip. Live Moxfield and Archidekt imports through relay version `03cf2e2e` succeeded with 17 copies/17 printings/13 artists and 19/19/16 respectively in the default sections. No browser warning/error logs were observed. Subsequent optimized-version results belong in the relay section below.

## Accessibility and browser scope — 9.3 / 9.4

Available environment: Windows 11, Codex in-app Chromium 154. No connected Firefox, Safari, Edge, real iOS/Android device or private-browsing session was available. Responsive viewports are layout checks, not evidence of those other browser engines. NVDA/VoiceOver speech output was not tested; status/alert semantics and keyboard behavior were checked.

axe-core 4.14.0 ran locally with WCAG 2 A/AA, WCAG 2.1/2.2 AA and best-practice rules. After correcting region/group semantics and visible-label mismatches, the library (44 passes), results (45), all 65 artists (45), rename dialog (22) and manual-printing dialog with a candidate (30) each returned zero violations and zero incomplete checks. Automated audits do not establish complete WCAG conformance.

Keyboard checks covered initial dialog focus, Escape dismissal and return to the initiating control, native modal background blocking, field labels and status/error announcements in the accessibility tree. No custom focus-trap claim is made. Artist icons measured at least 44×44 CSS pixels. Exact card-image URLs and Palumbo's portrait/profile/social destinations were checked; all 65 profile associations also have source-contract coverage.

Results fit 320×740 (document client/scroll width 305/305); library/directory fit 390×844 (375/375) and tablet library fit 768×1024 (753/753). The manual review dialog fits the 320px viewport. Desktop layouts were reviewed at 1280px. Source limitations remain: three missing portraits, 36 missing social fields and seven defective official profile destinations. See the attendance coverage report; no social links or identities were invented.

## Performance — 9.5

`npm run audit:performance` records the actual catalogue requests against local files, per-response gzip including duplicate requests, and real selector timings in `reports/performance-audit.json`. Test device: AMD Ryzen 5 5600X, Windows 10.0.26200, Node 24.11.0.

The current HTML/CSS/JS shell is 51,238 gzip bytes, under the 256,000-byte budget. All-section fixtures require 112–130 metadata requests, loading only active/manifest/event files and selected UUID shards. None downloads the full catalogue or artist index. Including minimized provider fixtures, gzip metadata is 3,224,504–3,613,233 bytes; decoded metadata is 9,348,237–10,459,804 bytes. Minimized fixtures are not full provider payloads. Production Pages encoding and WAN latency must still be checked in WBS 10.

Budget clarification: the 5 MiB target measures encoded metadata transfer, consistent with the compressed shell target; decoded bytes are explicitly reported above. The initial raw-byte interpretation is not met. This avoids falsely claiming a sub-5-MiB in-memory catalogue. The enforced estimate includes full uncompressed provider bodies from the dated 2026-10-11 live audit: Soldiers 3,779,968 bytes, Orzhov 4,340,152 bytes and Archidekt 3,616,980 bytes including compressed static metadata. Each is below 5,242,880 bytes. A 2026-10-12 direct-provider spot check found 566,605 and 360,362 bytes for Soldiers and Archidekt respectively, close to the earlier full-body sizes; these are not final-domain transfer measurements. Cached browser sort plus render and forced layout, 20 samples at desktop size: median 11.30 ms, p95 17.30 ms, maximum 17.60 ms, below 100 ms. Offline selector-only p95 is 0.10–0.17 ms and is not a browser render benchmark.

## Security and release boundaries — 9.6

The static build checks exact CSP restrictions, URL/text contracts, CSV formula escaping, immutable-data hashes/references, deploy-file allowlists and internal file-count/size ceilings. It rejects recognizable credential patterns, known personal fixture deck IDs in app assets, development harness/axe leakage and active SVG content. This is a focused guard plus source review, not a claim of comprehensive secret scanning. External text is rendered as text; links are protocol-validated. No user deck or credential is embedded in the static release.

`public/_headers` includes self-only scripts/styles, a fixed relay connection origin, blocked objects/framing/base URLs, nosniff, referrer policy and disabled camera/microphone/geolocation/payment permissions. The local release server exercised those headers; Pages application is a WBS 10 check. QA scripts are local development tools and never deployed as server handlers.

## Free relay gate — 9.7

Only two public provider routes are allowed, with GET-only requests, no query strings, fixed upstream hosts, no redirects/retries, stripped caller credentials/cookies, a 12 MiB decoded-body ceiling and a 15-second deadline. It performs no matching and stores no decks. Three Cloudflare-managed transient rate counters run before provider requests: 2/IP/10 seconds, 12/IP/minute, 60/provider/minute. Missing/broken bindings fail closed; throttling returns 429 and exposes Retry-After. Counters are local to each Cloudflare location and eventually consistent, not a strict global provider budget. Shared-network users can share an IP limit. Cloudflare processes request IPs; this is not browser tracking or an application deck database.

The actual account showed Workers Free ($0 current plan), with logs/traces disabled. The config has no R2, D1, KV, database, analytics, paid image service or paid CPU override. `scripts/check-relay.mjs` makes accidental configuration expansion fail the build. An account-level paid upgrade by someone else would invalidate this assumption and must be rechecked before launch. Free quota failures are visible and never trigger an automatic paid fallback. Daily-quota exhaustion is simulated, not induced against the account.

Local workerd audit (`node scripts/audit-relay-local.mjs`) uses real rate bindings with an in-memory provider: 200, 200, 429 and exactly two provider calls for that burst, with zero external requests. A separate 600,049-byte UTF-8 payload survives native batching, including the final partial batch, byte-for-byte. Unit tests additionally cover each limiter's denial/failure, byte limits and safe errors.

Observed CPU history:

| Version | Change | Observed CPU |
| --- | --- | --- |
| 51823ab3 (WBS 4 original) | Small-chunk stream with default compression | P50 26.86 ms; P90 37.78 ms; P99 59.95 ms; latest Moxfield point 52.03 ms |
| 03cf2e2e | Rate bindings and identity encoding | P50 12.64 ms; P90/P99 24.64 ms after two successful browser imports; still above target |
| d1ad7fe1 | Native BYOB batches of 256 KiB; preview URLs off | Active-version dashboard: P50 4.88 ms; final P90/P99/P999 7.12 ms after the browser refreshes, below 10 ms (first review was 5.13 ms) |

A command-line smoke check against d1ad7fe1 received `provider_http_403` for Moxfield. The real application's Moxfield and Archidekt refreshes subsequently both succeeded on d1ad7fe1 with zero lines needing review and unchanged expected totals. No authentication, header impersonation, endpoint fallback or permission bypass was introduced. This is a provider/path availability limitation, not evidence that every network/location works. Keep explicit failure/file recovery and repeat the production-origin smoke test in WBS 10. The CPU figures are a small smoke-test sample, not a production-load guarantee; do not extrapolate them to arbitrary 5,000-line decks. The compression/stream-chunk explanation is supported by lower measured CPU after the changes, but the two changes were not a controlled independent benchmark.

Post-deployment dashboard settings show exactly the three rate bindings, no variables/secrets, no cron/queue/email triggers, cache disabled, and Logs/Traces/Issues switches all false. Wrangler uploaded only the retrieval Worker, with no production site, DNS, Pages or GitHub changes. The old root research UI is retired; the endpoint root now returns a plain status message. Historical WBS 4 reports describe the earlier version.

Reproduction: `npm test`; `python -m unittest discover -s tests -p 'test_*.py'`; `npm run build`; `npm run audit:performance`; `node scripts/audit-relay-local.mjs`. Browser mock QA: `npm run qa` at localhost:3001. Production-header preview: `npm run preview:release` at localhost:3000. These commands do not deploy. `scripts/audit-relay-live.ts` is an opt-in bounded network diagnostic; its latest command-line run failed on the first Moxfield request and must not be represented as a passing three-deck audit.

Sources checked 2026-10-12: [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [rate-limit binding behavior](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [compression behavior](https://developers.cloudflare.com/workers/runtime-apis/fetch/), [native batch reads](https://developers.cloudflare.com/workers/runtime-apis/streams/readablestreambyobreader/), [Pages limits](https://developers.cloudflare.com/pages/platform/limits/).
