# Production deployment — WBS 10

Status: complete, 2026-10-12. Work is limited to WBS 10; WBS 11 maintenance has not started.

Repository: [Westly/moxgraph](https://github.com/Westly/moxgraph), public, created with the owner's existing GitHub identity and Git Credential Manager connection. Production branch: `main`; future development branches use `codex/`.

Only source, curated/catalogue metadata, compact website data, public/synthetic test fixtures and project documentation are committed. Raw snapshots, SQLite staging databases, dependencies, build output, local Wrangler state, environment credentials and browser backup files are excluded. Git attributes preserve exact bytes for checksummed data and captured fixtures.

## Production and release evidence

The live site is [moxgraph.com](https://moxgraph.com/). Both personal Moxfield decks and the Archidekt fixture import successfully from this HTTPS origin. The browser saves all three decks locally; reload restores the selected deck and its results. No user account, deck cookie or cloud deck database is used.

| Item | Verified release |
| --- | --- |
| Production commit | `d1a5428a2fa95d03d239fb2542675efbc4ae67a5` ([PR 1](https://github.com/Westly/moxgraph/pull/1)) |
| Pages deployment | `985d1f0d-891f-475f-b117-7badca075c68`, [immutable deployment URL](https://985d1f0d.moxgraph.pages.dev/) |
| Pages project URL | [moxgraph.pages.dev](https://moxgraph.pages.dev/) |
| Passing GitHub run | [38279640511](https://github.com/Westly/moxgraph/actions/runs/38279640511): quality and relay deployment both succeeded |
| Retrieval Worker | [moxgraph-import-relay-probe](https://moxgraph-import-relay-probe.westlywhite.workers.dev), version `5a33ab5a-7649-425e-952b-899d89e766cf` |
| Static data | `v1-1785df4c41186eaa`; 546,137 printings, 19 languages, 2,434 source artists, 65 attendees |
| Source revisions | Cards `scryfall-all-cards-20261011091913`; event `magiccon-atlanta-2026-20261011T195408Z` |
| Hosting plans | Pages Free; Workers Free; domain zone Free; no paid upgrade or add-on enabled |

These identifiers describe the release exercised by the acceptance checks. A later documentation-only merge naturally creates new Pages/Worker deployment IDs; consult the corresponding commit's GitHub run and Pages deployment list for the latest IDs. The catalogue and functional release remain the same unless changed explicitly.

Evidence: [launch receipt](../reports/deployment-validation.json), [live HTTP audit](../reports/deployment-http-audit.json), [production screenshot](../reports/screenshots/wbs10-production.jpg). Earlier WBS 9 reports are historical evidence, not claims that the site was already deployed then.

## GitHub and build settings

`main` requires the GitHub Actions `quality` check with strict up-to-date checks, including for administrators. Force pushes and branch deletion are disabled; conversation resolution is required. Develop on `codex/` branches and merge a passing pull request. A solo-owner repository does not require a second reviewer.

Both production pipelines run the same `npm run verify` gate: 51 app tests, nine relay tests, three release-policy tests, 64 Python tests, contract generation, TypeScript checks, full source/output data audits and static build. GitHub also checks generated contracts for drift. A clean Linux checkout now needs only committed files and locked dependencies, not the ignored raw database.

The first clean-cloud run caught that database dependency: commit `fb376b5` failed both GitHub run `38277838528` and Pages build `60fd5263-0487-40bf-ac19-f01a11731bd8` before publication. The fix builds recovery test evidence from checksummed committed printing shards. Commit `163f173` then passed and published. This is actual evidence that a failed release gate prevents a deployment.

| Pages setting | Value |
| --- | --- |
| Git repository / production branch | `Westly/moxgraph` / `main`, automatic production deployments enabled |
| Preview branches | Custom inclusion `codex/*`; branch preview `fe828ad5-0204-492c-9366-3a05d78d80e2` verified |
| Build system / root / output | Version 3 / repository root / `dist` |
| Runtime files | `.node-version`: 24.11.0; `.python-version`: 3.13.3; npm 11.9.0 |
| Build command | `npx --yes npm@11.9.0 ci --no-audit --no-fund && npm run verify` |
| Production and preview build variable | `SKIP_DEPENDENCY_INSTALL=1` |
| Cache / hooks / bindings / frontend secrets | Build cache disabled; no hooks, bindings, Functions or frontend secrets |

The Pages project connects only this repository. The owner's **existing** Cloudflare Pages GitHub installation already covered other repositories; its wider installation permissions were preserved to avoid disrupting those projects. No new account-wide GitHub grant was created. This is the recorded qualification to the original repository-only access preference in 10.5.

The Worker uses `.github/workflows/quality.yml`, after `quality`, only on a push to `main`. It runs `npm run deploy:relay`, which validates again before publishing the checked-in Wrangler configuration. PR jobs cannot deploy. Production deploy jobs are serialized and not cancelled by a newer main push.

The owner-approved API token is an encrypted GitHub environment secret named `CLOUDFLARE_API_TOKEN` in `production-relay`, whose deployment branch policy allows only `main`. It has **Account → Workers Scripts → Edit** on the owner's account, with no DNS, billing, database or storage permissions. It can edit Workers throughout that account, not just this named Worker; it remains valid until revoked. The value is absent from source, build artifacts, chat and local project files. The explicit account ID is not a secret. Keep workflow changes under review because trusted main workflow code can use the environment secret.

The separate, previously approved encrypted local Wrangler connection remains available for owner recovery. Native Workers Builds was not connected: its automatically generated broad token was unnecessary. Pages uses its existing Git integration, and the relay uses standard GitHub-hosted runners in the public repository.

For a clean local verification, use the runtime versions above, run `npx --yes npm@11.9.0 ci --no-audit --no-fund`, then `npm run verify`. Raw catalogue regeneration is a separate operation; ordinary UI/documentation builds never download the bulk source. Windows-safe tuple filenames (`tuples/set-con.json`, for example) avoid the reserved `CON` filename. The new immutable data version changes packaging paths, not card identities.

## Domain, TLS and cost boundaries

Pages provisioned these two proxied CNAME records, each with Auto TTL:

| Name | Target |
| --- | --- |
| `moxgraph.com` | `moxgraph.pages.dev` |
| `www` | `moxgraph.pages.dev` |

The zone contained no records before setup; no mail or unrelated DNS records were removed. Both custom domains show **Active / SSL enabled**. Universal SSL is active for the apex and wildcard; Always Use HTTPS is enabled. The Single Redirect `Moxgraph canonical www to apex` (`15357275927d444c903aab81c4e8783e`) matches `(http.host eq "www.moxgraph.com")`, returns 301 to `concat("https://moxgraph.com", http.request.uri.path)`, and preserves the query string. Live GET checks verify HTTP apex, HTTP www and HTTPS www preserve `/data/active.json?wbs10=path-query` and land on HTTPS apex. No placeholder IP record is used.

Production serves the configured CSP, nosniff, frame denial, referrer and permissions policies. The active pointer has `Cache-Control: no-cache`; versioned manifests/shards have one-year immutable caching. The live active pointer, full manifest and selected printing shard agree with committed checksums. HTML/JS/CSS total **51,137 bytes gzip** on the measured edge responses, below the 250 KiB shell budget. Manifest and printing JSON responses are compressed too. Full import transfer estimates remain in the WBS 9 report; these checks confirm real production compression rather than claiming a new cold-network whole-deck timing measurement.

[Pages Free limits](https://developers.cloudflare.com/pages/platform/limits/) are 500 builds/month, one concurrent build, 20-minute builds, 20,000 files and 25 MiB per asset. This project publishes 7,610 files and uses stricter local guards of 10,000 files and 20 MiB per asset. Production and preview builds both consume the monthly build allowance. [Static Pages requests](https://developers.cloudflare.com/pages/functions/pricing/) do not consume Functions usage because the output has no Functions.

The live account showed **Workers Free / $0 / Current plan**. [Workers Free](https://developers.cloudflare.com/workers/platform/pricing/) permits 100,000 requests/day account-wide and 10 ms CPU per invocation. There is no automatic paid fallback. The Worker retains three transient rate counters: 2 requests/10 seconds per IP, 12/minute per IP, 60/minute per provider. These counters are colo-local and eventually consistent, not an absolute global cap. Worker logs, storage, cron jobs and paid bindings remain off. The identical Worker code measured CPU P99 7.12 ms in WBS 9's bounded sample; that is not a new production-version CPU measurement. Quota exhaustion can stop imports; it does not justify enabling a paid plan. Domain registration/renewal remains the owner's existing separate expense.

Use the apex for deck importing and storage. The auxiliary Pages and branch-preview origins are deliberately absent from the relay allowlist. They can preview layout/catalogue or accept file imports, but live provider retrieval is restricted to the existing approved origins. Libraries on localhost, Pages URLs or other devices do not automatically migrate: download a backup and restore it at moxgraph.com.

## Rollback and recovery

1. Identify the bad commit and stop new main merges while recovering. Record the currently serving Pages deployment, Worker version and `public/data/active.json`; back up any affected browser-local decks before a storage migration rollback.
2. For the static site, open Workers & Pages → moxgraph → Deployments, select a known good **production** deployment's action menu, then **Rollback to this deployment**. The known good predecessor is `9238f5ab-a0d5-48c3-b63b-a924c362a32b` at `163f173`; the fully accepted release is `985d1f0d-891f-475f-b117-7badca075c68`. Preview builds are not rollback targets. Follow [Pages rollback instructions](https://developers.cloudflare.com/pages/configuration/rollbacks/).
3. Roll back the entire static deployment. Never copy just `active.json`, a manifest, an index or individual shards into a different release. The build and Pages publication keep the HTML, pointer and immutable data together; checksums reject mixed/missing data. Reload after rollback and confirm both provider imports and locally saved results. Existing long-lived tabs may need a reload when their previous version is no longer served.
4. For the relay, inspect `npx wrangler deployments list --config tools/import-relay/wrangler.jsonc`, then use the Worker dashboard's Deployments rollback or `npx wrangler rollback <known-good-version-id> --config tools/import-relay/wrangler.jsonc`. Prefer accepted version `5a33ab5a-7649-425e-952b-899d89e766cf`, or its code-identical predecessor `d1ad7fe1-133b-44d9-9d60-04649b17eaf3`. Review [Worker rollback limitations](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/) first: rolling back code does not restore external resource state or every service setting. Confirm the three rate bindings, allowed origins, observability-off setting and Free plan afterward. Avoid the older pre-rate-limit probe versions.
5. Reconcile Git: revert the faulty change in a `codex/` branch, let required checks pass and merge the PR. Otherwise the next automatic main deployment can overwrite a dashboard rollback. Static and relay pipelines are independent; verify **both** after a merge, especially when changing their shared contract. A green Pages build alone does not prove the Worker deployed.
6. If deployment authentication fails, the currently deployed versions remain available. Inspect the failed job before rotating permissions. The owner can revoke the named deployment token in Cloudflare and replace the same encrypted GitHub environment secret; do not broaden the token or embed it in Vite variables. No credential value belongs in an issue or build log.

Rollback procedures were checked against current documentation and the available successful deployment/version histories. No deliberate production rollback or destructive storage migration was performed for this launch. For browser-backup recovery, use [local storage instructions](local-storage.md). For staged manual refreshes, identity review, immutable event archives and dated checkpoints, use the [WBS 11 maintenance runbook](maintenance.md). Ordinary release builds remain offline; no refresh scheduler is enabled.
