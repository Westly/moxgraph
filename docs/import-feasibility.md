# WBS 4 — deck import feasibility

**Follow-up complete:** The owner approved the narrow Free Worker exception after the initial deployment rejection. Read [the WBS 4.7 follow-up](import-blocker-resolution.md) for the reviewed Arcane Signet alias, verified offline quantity-recovery proof and deployed relay. Real HTTPS browser retrieval succeeds for both personal Moxfield decks and the Archidekt fixture; all returned printing rows match the direct-provider fixtures. This report preserves the initial direct-access observations.

Observed **2026-10-11**. WBS 4.0 research and the subsequent blocker follow-up are complete. **R01 (production deck-link imports) remains undelivered:** the research probe establishes transport feasibility, with application adapters and final-origin tests still required. No application importer or WBS 5 work was started.

The owner supplied both personal Moxfield decks, confirmed existing API permission, and directed use of `https://api.moxfield.com/v2/decks/all/{deckId}`. That endpoint is the selected Moxfield source. Permission is accepted as owner-confirmed; it is not an outstanding approval request. Browser cross-origin access is a separate technical requirement.

## 4.1 — representative public decks

| Case | Source | Printing and section coverage |
| --- | --- | --- |
| Owner: Soldiers | [My Soldiers Rage](https://moxfield.com/decks/3x55_3CFz060qxL2xac3NA) | 100 mainboard copies + 1 commander, 8 sideboard, 30 considering; promo collector suffixes; foil/etched/nonfoil |
| Owner: Orzhov | [Casual Orzhov Shenanigans](https://moxfield.com/decks/zB7a13TqOUWlUZuylE905Q) | 99 mainboard + 1 commander, 39 considering; Japanese Vampiric Tutor; six multiface lines; unknown historical printing ID |
| Multiple editions/art/languages | [Anime/Manga/Japanese Art Card list](https://moxfield.com/decks/SbEkgxN4CEqiCG5B94rkkg) | 975 individual printing rows after expansion; 719 English, 255 Japanese, 1 German; 31 multiface rows; five different Islands |
| Archidekt | [Rog Thras Japanese Evil Twin](https://archidekt.com/decks/19780118/rog_thras_japanese_evil_twin) | 98 mainboard + 2 commanders, 14 sideboard; five multiface lines; collector number `162★`; Normal/Foil/Etched |

The Archidekt title is **not evidence of language**: all 114 selected UUIDs resolve to English records. Actual non-English coverage comes from the Moxfield records. The source rows and aggregate observations are in [the printing audit](../reports/import-printing-audit.json).

## 4.2 — access paths and source guidance

**Moxfield:** the owner-selected v2 URL returned HTTP 200 JSON for both personal decks and the supplemental art list without authentication. The current public frontend also exposed `https://api2.moxfield.com/v3/decks/all/{id}`; earlier v3 samples are retained as research comparisons. The browser harness uses the owner-selected v2 endpoint. Its top-level sections differ from v3's `boards` object. A subsequent v2 check of the supplemental deck found a quantity anomaly, detailed below; do not silently switch endpoints.

The rendered [Moxfield terms](https://moxfield.com/help/terms), effective July 9, 2026, include restrictions on automated retrieval and compilation; the owner's subsequent confirmation of existing permission is recorded above. The [help page](https://moxfield.com/help) lists support contact information. No support messages were sent. No publicly documented Moxfield rate ceiling or compatibility guarantee was established. The initial saved-project search did not expose an existing implementation. The follow-up located the working Python integration at `D:\EDH.GG`; see the linked follow-up report.

**Archidekt:** `https://archidekt.com/api/decks/{numericId}/` returned HTTP 200 JSON anonymously. The trailing slash is retained. Developer responses on the official forum explicitly welcome API use while noting the lack of maintained API documentation: [API access](https://archidekt.com/forum/thread/2832338), [deck endpoint discussion](https://archidekt.com/forum/thread/16962481), and [rate-limit discussion](https://archidekt.com/forum/thread/19112643). The latter describes approximately 40 requests/minute, not a contractual service guarantee. Read alongside the general [terms](https://archidekt.com/terms). Use a single bounded deck request and back off on 429; no load/rate-limit stress test was performed.

Raw public responses remain in ignored `data/raw/import-feasibility/`. [Sanitized fixtures](../tests/fixtures/import-feasibility/sources.json) whitelist identity/quantity/printing/section fields, with raw and fixture SHA-256 hashes. They omit owner profiles, descriptions, prices, notes, social graphs, and credentials. They are offline research fixtures, not production website assets.

## 4.3 — real browser results

Tests used the Chromium in-app browser, `fetch` with `mode: "cors"`, `credentials: "omit"`, no custom headers, no proxy, no extension, and a 20-second timeout. Requests were manually triggered and not repeated in a polling loop.

| Provider | Localhost `http://localhost:3000` | Static HTTPS preview | Anonymous HTTP diagnostics |
| --- | --- | --- | --- |
| Moxfield v2, both owner decks | `TypeError: Failed to fetch` | Same failure for both decks | HTTP 200 JSON; no `Access-Control-Allow-Origin` for either tested origin |
| Archidekt, public deck 19780118 | HTTP 200 readable JSON, 114 rows | `TypeError: Failed to fetch` | HTTP 200 JSON; `Access-Control-Allow-Origin: http://localhost:3000`, which does not authorize the preview origin |
| Moxfield v3, initial comparison only | Failed fetch | Not tested | HTTP 200 without CORS permission for localhost |

The deployed [probe](https://moxgraph-import-probe.pages.dev) contains three small static files and does not send deck URLs to a backend. Its input starts empty; user deck IDs are not embedded in the deployed assets. Cloudflare's dashboard confirmed deployment success, and the hosted page executed the tests above. Evidence: [browser observations](../reports/import-browser-audit.json), [HTTP headers](../reports/import-http-headers.json), and the [probe source](../tools/import-probe/).

The console-log tool returned no entries, so a detailed console CORS error was not captured. The recorded browser failure plus the independent absent/mismatched response headers establish that direct browser reading is not currently available from the preview origin. A command-line 200 response is not browser compatibility. A separate header request using `Origin: https://moxgraph.com` found the same problem; it is **not** a real browser test on the production domain. Final-domain retesting remains a release gate.

No authentication was needed for public raw API reads. Private/unlisted access, expired credentials, missing decks, challenges and 429 responses were not exercised; do not present them as tested behaviors. Private decks remain outside the no-login public-link scope. Do not collect visitor provider tokens. A failed fetch should not be mislabeled “private deck.”

### Preview and cost boundary

`moxgraph-import-probe` is a separate Cloudflare Pages Direct Upload project used only for WBS 4.3. It has no Functions, Worker, database, bindings, analytics, paid upgrade, or custom domain. The production `moxgraph` project and GitHub repository have not been created. Existing projects and domain DNS were not modified.

Static Pages requests are documented as free when Functions are not invoked. This three-file upload is far below the documented upload limits. [Cloudflare pricing](https://developers.cloudflare.com/pages/functions/pricing/), [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/). Direct Upload cannot later be converted to Git integration, so retain the planned separate Git-connected production project. The probe can remain available for a provider CORS retest; eventual removal is a separate cleanup action.

## 4.4 — exact-printing field map

| Common field | Moxfield v2 | Archidekt public payload |
| --- | --- | --- |
| Provider deck identity | `publicId`, not internal `id` | top-level `id` |
| Source line reference | section + map key + printing child identity; map key may be a card name | `cards[].id` |
| Section | `mainboard`, `commanders`, `sideboard`, `maybeboard`, `companions`, `signatureSpells`, `attractions`, `stickers` | card categories plus top-level category definitions; preserve custom categories |
| Quantity | individual `printingData[].quantity` if present; otherwise row `quantity` | `cards[].quantity`, counted once regardless of category count |
| Exact Scryfall printing | individual child `card.scryfall_id` if `printingData` exists; otherwise row `card.scryfall_id` | `cards[].card.uid`; verified against catalogue and official CSV |
| Provider printing identity | `card.id` / `printingData[].id`, separate from Scryfall UUID | `cards[].card.id`, a numeric ID, separate from UUID |
| Set / collector | selected `card.set`, `card.cn` | `card.edition.editioncode`, `card.collectorNumber` |
| Language | selected `card.lang`, cross-check UUID | exact UUID lookup; `oracleCard.lang` is not trusted as a printing language |
| Finish | individual `finish`: `nonFoil`, `foil`, `etched`; preserve raw value | `modifier`: `Normal`, `Foil`, `Etched`; preserve raw value |
| Oracle/card name | display hint only; never printing identity | `oracleCard.uid` and `name` are not the printing ID |
| Faces / artists | resolve selected printing in frozen catalogue, including face-level credits | same; no joining by a default version's artist |

Moxfield `printingData` must be expanded even when `enableMultiplePrintings` is false. In the 975-row art list, **125 individual rows have a different UUID from their parent summary card**. The five Island printings span different artists. Parent and child quantities must reconcile; never count both or attach the summary UUID to every child. A child without an authoritative identity must remain unresolved.

Moxfield v2 `tokens` is a generated list of candidate token cards (20 and 35 in the owner's decks), not counted selected deck lines. V3 exposes an explicit `boards.tokens` selection in the Soldiers deck that v2 does not represent in the same way. Do not fabricate token quantities or silently claim full token-board parity. The v2 adapter's token limitation must be visible if that feature is included.

Archidekt's fixture contains `Sideboard` with `includedInDeck: true`, while its UI excludes 14 sideboard cards from the displayed 100-card total. Treat reserved sideboard/commander semantics explicitly; don't calculate physical totals by summing category memberships or trusting that flag alone. Novel conflicting category combinations will need an unresolved state in WBS 7.

### Audit and source-display comparison

| Input | Expanded lines | UUID/tuple verified | Unresolved |
| --- | ---: | ---: | ---: |
| Soldiers, selected v2 | 111 | 111 | 0 |
| Orzhov, selected v2 | 126 | 125 | 1 |
| Supplemental art list, v3 | 975 | 975 | 0 |
| Supplemental art list, selected v2 | 973 | 973 printing IDs | **Quantity reconciliation fails: 1,187 copies vs 975 declared** |
| Archidekt | 114 | 114 | 0 |

Rendered provider references and official exports were compared with selected tuples, not just names. Moxfield shows Myrel at `/cards/bRQ9J-myrel-shield-of-argive` with the `pbro/18p` printing link; Orzhov shows Teysa `/cards/pRzbJ-teysa-karlov`, Vampiric Tutor `/cards/61Zv7-vampiric-tutor`, and Westvale Abbey `/cards/E0mDl-westvale-abbey-ormendahl-profane-prince`. API tuples and export text agree on SLD #1235, SOA #100 and PSOI #281s respectively. Japanese SOA #100 resolves to artist Sumie Okazu.

Archidekt image labels explicitly show Rograkh CMR #575, Thrasios SPG #16, Sol Ring MB2 #233, Sink into Stupor MH3 #241, and Kogla PIKO #162★. Its CSV preserves those same UUIDs/tuples. Full per-source quantities and examples are in the printing audit.

**Real unresolved case:** Orzhov's Arcane Signet is supplied as Scryfall UUID `f0deab39-dfa3-4652-a05f-b221b979009a`, set `p30a`, number `1F`, language `en`, finish `etched`. Neither that UUID nor tuple exists in the frozen `scryfall-all-cards-20261011091913` baseline. Its official Moxfield export repeats the same tuple. The reason it is absent is not established. Preserve it for explicit review; do not change the frozen catalogue, infer an equivalent printing, or present an unconfirmed artist result.

**Real v2 quantity anomaly:** the supplemental deck's v2 `mainboardCount` is 975, but expanded row quantities total **1,187**. Its single `Spirit` map entry has quantity **215**. The v3 snapshot has three distinct Spirit printing rows with quantity 1 each. Both responses report version 4 and the identical last-updated timestamp `2026-10-09T12:52:23.293Z`, so this is not explained by a recorded deck revision between captures. The exact provider-side cause is unknown. All 973 returned v2 printing UUIDs verify, but the deck is not a valid complete import because the quantities disagree. Preserve the raw evidence and reject/flag the snapshot; do not fix its totals by guessing or merge same-name tokens. The personal v2 decks' quantities do reconcile.

## 4.5 — official export verification

**Archidekt CSV is a verified lossless option for this fixture.** More → Export deck → CSV; leave all cards selected and include out-of-deck cards. Enable Quantity, Name, Edition code, Collector number, Category, Secondary categories, Modifier, **Scryfall ID**, and the header row. The UI's Modifier column is exported with the heading `Finish`. The actual downloaded [CSV](../tests/fixtures/import-feasibility/archidekt-official.csv) has 114 rows; UUID, set, number, quantity and finish all equal the API. Commander and sideboard categories survive. Resolve language via that exact UUID. Default Quantity/Name-only CSV is insufficient.

**Moxfield “Copy for Moxfield” is not fully lossless.** Download (also More → Export) shows an export textbox with set/number and finish markers. The actual [Orzhov text](../tests/fixtures/import-feasibility/moxfield-official-orzhov.txt) has 87 rows / 100 copies and matches mainboard+commander tuples and finishes, but omits 39 considering cards, has no explicit language or Scryfall UUID, and does not label the commander section. Of its 87 tuples, 57 have multiple language candidates in the complete baseline, 29 have one candidate, and Arcane Signet has none. Japanese Vampiric Tutor exports as `1 Vampiric Tutor (SOA) 100`; its Japanese language is absent from the text. Keep missing information explicit; do not default it to English.

Moxfield's Arena, MTGO text and Plain Text options shown in the public export dialog are name-based; the Arena output also filters illegal cards. They cannot demonstrate preservation of the selected physical printing. No public CSV option was shown in the inspected Moxfield dialog. Do not document an unobserved CSV workflow as working.

The owner-selected **Moxfield v2 JSON can be saved as a local file and retains the tested deck printing/section data**, subject to the unknown Arcane Signet and token limitations above. This is an API-response-file workflow, not an observed “Export JSON” button or one-step link import. A production file adapter would still need implementation/validation in WBS 7. Official exported text with ambiguity would need explicit user resolution.

See [export comparison results](../reports/import-export-audit.json). The browser's download event helper timed out, but the files were successfully written to Downloads and inspected directly. This tooling issue did not prevent verification of the actual CSV.

## 4.6 — support matrix and decision

| Capability | Moxfield | Archidekt |
| --- | --- | --- |
| Public API data includes selected printing | Yes, owner-selected v2; one catalogue miss in Orzhov; supplemental v2 quantity mismatch must fail validation | Yes, all 114 fixture lines verified |
| API-use permission | Owner confirms existing permission | Developer guidance welcomes bounded use |
| Direct localhost import | Blocked in real browser | Verified for `http://localhost:3000` only |
| Direct HTTPS preview import | Blocked in real browser | Blocked in real browser |
| Official export preserving exact ID | Not found in inspected public export options | CSV with Scryfall ID enabled verified |
| API JSON file with printing data | Verified offline, could support a manual download/upload workflow | API payload also contains exact IDs; CSV is easier |
| Generic name-only export | Insufficient | Insufficient |
| Private/authenticated decks | Outside initial scope; not tested | Outside initial scope; not tested |
| Full production support | Not proven; CORS and unresolved-line handling required | Not proven; HTTPS CORS required |

**Initial D01 finding:** the original requirements conflicted: both arbitrary public deck links must work from the site, and the site must have no application backend. Existing API-use permission does not cause a browser to ignore CORS. Adding headers to moxgraph's own HTML cannot grant permission to read provider responses. [MDN's CORS explanation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS). The owner subsequently selected the narrow Worker exception below; direct provider behavior remains unchanged.

The investigation identified these paths; the owner subsequently approved option 3:

1. **Preserve the requested static architecture and link imports:** obtain provider CORS enablement for `https://moxgraph.com` and the test origin, then rerun this harness. This is the preferred path under the current requirements. Existing Moxfield permission can support that configuration request. No new general API permission is being requested here.
2. **Approve a file-first release:** Archidekt CSV with exact IDs plus manually saved Moxfield v2 JSON; keep direct link imports explicitly unavailable until fixed. This changes R01 and adds a user download/upload step.
3. **Approve a narrow retrieval Worker — selected and verified:** the owner explicitly approved the bounded Free Worker after its initial approval rejection. The relay is deployed on the existing Free plan and retrieves both providers' public JSON in real HTTPS browser tests. Exact printing rows match the original fixtures; the known supplemental quantity anomaly remains flagged. See the follow-up for source, deployment and evidence links.

The approved first-party retrieval Worker is the only serverless exception. No third-party CORS relay, embedded secret, paid upgrade, user login or database was introduced. No messages were sent to providers. WBS 4 stops here; the next parent is WBS 5 only after a new owner request. The product and production R01 remain later deliverables.

## Reproduce the evidence

From the repository root, with the existing local Scryfall baseline:

```powershell
python scripts/data/import_fixtures.py   # requires the ignored saved public responses
python scripts/data/import_audit.py      # offline audit; writes both audit reports
python -m unittest discover -s tests -p test_import_feasibility.py -v
python -m http.server 3000 --bind 127.0.0.1 --directory tools/import-probe
```

Open `http://localhost:3000` and the deployed HTTPS probe in a normal browser. Enter the source links from 4.1 and press **Test direct browser access** once each. Preserve the rendered JSON/download result, inspect console errors if available, and distinguish browser tests from command-line diagnostics. The probe omits payload bodies from saved evidence. A future successful v2 response will list top-level keys; deep printing checks belong to the offline audit and later importer tests.

For a bounded supplemental header check (two public requests, separated by two seconds):

```powershell
python scripts/data/import_headers.py https://moxgraph-import-probe.pages.dev
```

This appends observations; it does not bypass browser CORS or prove a browser import. Do not probe private decks, reuse credentials, or raise traffic to test a limit. Fixture hashes, export equality checks, quantity checks, child-printing expansion, language preservation and unknown-ID regression checks protect the findings. The standalone probe deliberately has no application storage or matching implementation.
