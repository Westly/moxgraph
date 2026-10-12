# Moxgraph — WBS 6 design and interface

Historical phase record: WBS 7 has since replaced the example with [working imports, matching and review](deck-imports.md). The logo and presentation system below remain in use; WBS 6 screenshots describe the earlier design preview.

Completed 2026-10-11. Product name: **Moxgraph**; production domain: **moxgraph.com**. This phase delivers the logo, CSS and responsive presentation. Live adapters/matching (WBS 7), saved decks (WBS 8), broad release validation (WBS 9) and hosting/Git integration (WBS 10) remain separate.

## Brand assets

Three original vector concepts were drawn: card and pen nib, a connection graph inside a card, and a signature monogram. The **card and nib** is selected: it connects a physical card with its illustrator and stays recognizable at favicon size. This is an implementation choice, not a claim that the owner has approved a final brand.

- [Concept board](../public/brand/concepts.svg) and [PNG](../public/brand/concepts.png).
- [Primary mark](../public/brand/mark.svg) and [wordmark](../public/brand/wordmark.svg).
- Ink and white monochrome variants: `mark-ink.svg`, `mark-white.svg`, `wordmark-ink.svg`, `wordmark-white.svg`.
- [SVG favicon](../public/brand/favicon.svg), 32 px, 180 px and 512 px PNG icons, and a 4× wordmark PNG.

The final wordmark uses original geometric letter paths, not embedded fonts. The mark's nib slit is transparent. White variants are intended for a dark surface. Keep at least 8/64 of the mark's width clear around it; avoid displaying the standalone mark smaller than 16 px. Use the mark alone where the wordmark cannot remain readable.

Reproduce SVGs with `python scripts/design/create_brand.py`. Export PNGs with `node scripts/design/export-brand.mjs <installed-sharp-entrypoint>`. This review used the bundled Sharp 0.35.4 `dist/index.mjs`; there is no image dependency or image generation service in the application. The concept-board captions use a system font; production logo SVGs have no font dependency.

## Visual system

`src/styles/base.css` defines neutral surfaces, one green accent, system typography, spacing tokens, 7/12 px radii and focus states. No web font, icon CDN, analytics, paid image processor or application framework was added.

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#172f35` | Headings and primary text |
| Muted | `#54676b` | Supporting text and icons |
| Accent | `#176451` | Main action, focus and links |
| Paper / surface | `#f6f7f3` / `#ffffff` | Page / panels |
| Tint | `#eaf1e9` | Event panel and selected controls |
| Control border | `#798b82` | Input and select boundaries |
| Spacing | 4, 8, 12, 16, 24, 32, 48 px | Layout rhythm |

Measured contrast: ink/paper 13.06:1; muted/paper 5.53:1; muted/tint 5.17:1; white/accent 7.05:1; accent/tint 6.13:1; control border/white 3.60:1. See the validation report for the independently calculated exact values; these are palette checks, not a full accessibility certification.

Navigation, buttons and icon links have 44–50 px targets. Focus is a 3 px accent outline; the URL and search fields use a focus-within outline. Icon links expose an accessible name, title and a tooltip on both hover and keyboard focus. Native details/summary controls work by keyboard. Motion respects reduced-motion preferences. Layouts use three artist columns on desktop, two on intermediate widths and one below 701 px.

## Screens and component boundaries

| Screen/component | Current behavior | Later integration |
| --- | --- | --- |
| Deck entry and URL input | Clearly marked design preview; the preset source link opens the example. A different URL gives an honest unavailable-import message without a request. | WBS 7 validated provider import |
| Your decks / saved-deck row | Explicit empty state and a separately labeled example row; no persistence claim | WBS 8 browser-local records |
| Example results | Nine editorially selected real lines; main + commander defaults to eight copies, eight printings, five artists; maybeboard adds one line/artist | WBS 7 actual resolution/matching and source reconciliation |
| Section filter, search and sort | Presentation over the fixed example only; artist A–Z or count, and name/set ordering inside groups | WBS 7 real deck view model |
| Card row and printing badge | Exact set, collector number, language and selected finish. Native disclosure creates the exact card image only on opening. | WBS 7 unresolved, multi-face and alias notices |
| Artist directory / profile cards | All 65 real attendees; name/portrait open the official profile. Reviewed links, counts, booth and days remain visible; alternate Scryfall credits are in a disclosure. | Future data refresh workflow |
| Status and empty panels | Loading, explicit failure/retry, no search results and no section results; retry keeps keyboard focus on the heading | WBS 7 provider-specific failures |

Reusable render helpers live in `src/ui/components.ts`; screen state and event wiring are in `src/app.ts`. External text is escaped. Invalid/credential-bearing links are hidden. Published URLs use the reviewed `displayUrl`, retain the source's label, and open with `noopener noreferrer`. Identical destinations are deduplicated. Missing links produce no inactive icons. An event field named `store_url` often contains a gallery, so its label and gallery icon are retained instead of implying a store.

The site uses the verified `EventDirectory` through the WBS 5 checksum-validating loader. Its event/card snapshot dates are shown in the footer. Photos come from the official source URL and are lazy-loaded; missing or failed portraits use a neutral person silhouette. Missing card images say they are unavailable and never substitute another printing.

## Example provenance and scope

`src/demo/deck.json` is an authored UI fixture, not an importer or an exhaustive analysis. Its nine rows come from `tests/fixtures/import-feasibility/moxfield-v2-3x55_3CFz060qxL2xac3NA.json`. Each complete printing object equals its catalogue record in `v1-0313a3107f243872`. Tests verify the provider UUID, quantity, finish and reviewed attendee mapping. No new API call was needed. `src/demo/artist-links.json` reuses the 65 reviewed Scryfall destinations from the WBS 3 report; dynamic generation remains WBS 7.

The example's association is one artist per selected line. Its totals are not the production contract for joint credits, multi-face cards or unresolved lines. WBS 7 must replace the example with actual adapter and matching results. WBS 8 must replace the empty saved-deck state. No deck cookies, localStorage or IndexedDB were introduced here.

## Visual and interaction review

- Desktop review at the browser's 1253×884 and 1265×720 viewports; mobile layout review at 390×844 and 320×740. No horizontal overflow in the three screens or tested expanded details.
- One primary example action opens the artist groups. Other entered URLs remain explicitly unsupported. This demonstrates the WBS 6 design exit; it does not satisfy production import requirement R01.
- Search, artist/count/set sorting, section toggles, zero results and reset checked. Pointer and keyboard activation were both verified.
- Exact Myrel PBRO #18p and Bennie Bracks NCC #94 images/links inspected. No card image element exists before a row is expanded.
- David Palumbo's name and portrait destinations agree with the owner-supplied official page. His Instagram, website, gallery and reviewed Scryfall search are retained. Automated checks cover every attendee's usable source destination.
- Martina Fačková missing-portrait fallback reviewed. Richard Kane Ferguson wraps at 320 px. Keyboard-focused icon tooltip remains readable without horizontal overflow.
- Built-app unavailable-data test: the development-only QA server fails the first manifest request after a short delay. Loading → explicit error → manual Retry → 65 artists was verified. No automatic retry loop is present.
- Fifteen app tests, TypeScript and production build pass. Full catalogue hashes/references and static output limits pass. Final output contains 7,610 files, with no Worker/Functions handler or raw database.

Evidence: [validation report](../reports/design-validation.json), [deck entry](../reports/screenshots/wbs6-desktop.jpg), [results](../reports/screenshots/wbs6-results.jpg), [directory](../reports/screenshots/wbs6-artists.jpg), [mobile](../reports/screenshots/wbs6-mobile.jpg), [portrait fallback](../reports/screenshots/wbs6-portrait-fallback.jpg), [error](../reports/screenshots/wbs6-error.jpg).

Reproduce the normal review with `npm run build` and `npm run preview`. Reproduce the controlled failure with `python scripts/design/qa-server.py`, then open `http://127.0.0.1:4181`, choose Artists and Retry after the intentional error. This temporary local server also offers `/proof` for saving browser-tool screenshots to a fixed list of report paths; it is excluded from production output. Stop it after QA.

## Limits and next parent

No WBS 6 blocker remains. Browser coverage is the Codex Chromium browser on Windows with responsive viewport overrides; real Safari, Firefox, mobile devices and screen-reader testing remain WBS 9. Hosted response headers and production-origin imports remain release checks. WBS 5's metadata transfer target remains open for WBS 9. No GitHub or Cloudflare changes were made in this phase.

The next parent, only when requested, is **7.0 — implement imports, exact-printing matching and results**.
