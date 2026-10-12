# Card gallery and deck exports

Owner-requested WBS 12, October 12, 2026. This replaces the expandable results and artist-count disclosures from the first release.

## Interface

Results show the selected printing's card images immediately, ordered by attending artist. Each tile has its artist name/profile, a small portrait, quantity and a compact printing label. Both faces appear for double-faced printings. Search, deck sections and sorting remain available. **All cards** also shows resolved cards without attendee matches. A table beneath the gallery retains the printing/section edit action, and unresolved cards have a direct review queue.

The directory uses large portraits, small counts and compact official/profile/social links. Reviewed Scryfall aliases still drive matching and name search, but their audit details are kept in the data reports instead of artist-card disclosures. Repeated storage confirmations, provider implementation labels, source-line metrics, internal version IDs and introductory filler have been removed. Actual import/storage errors remain visible; ordinary successful imports open the results quietly.

## Export behavior

Use **Export cards** on results or **Export decks** above the saved library. Individual saved rows also have **Export**. Check one or more decks; this selection is independent of gallery searches and saved filters. The default includes attending-artist matches in main deck and commander. Options include all sections and cards without an attending artist.

Both formats sort by artist, then local deck title, then card. Distinct local copies remain distinct; the PDF labels identical deck titles with copy numbers. A joint credit appears under each matched artist, while the dialog's physical-card total counts each source row once per deck. Exports never resolve a different printing or contact either deck provider.

- CSV: UTF-8 with BOM, CRLF rows, quoted/escaped fields, and formula-cell protection. Columns include artist, deck, quantity, canonical card name, exact set/collector number/language/finish, section, attendance, booth, printing/face credits, Scryfall ID/link, deck link, local deck ID, source-row key and resolution state. Unknown printing data is explicitly marked for review.
- PDF: actual downloadable PDF generated in the browser, twelve card entries per A4 page, with exact printing images, artist/deck labels, quantity checkboxes, printing labels, sections, booth numbers, attribution and page numbers. Both faces are included. Normal text uses a subset of Noto Sans; labels outside its character coverage use browser-rendered text, including emoji deck names. Long titles wrap and visibly truncate with an ellipsis; CSV retains full values.
- The PDF code and font load only when PDF is requested. PDF generation supports 600 card entries per file; CSV supports the saved-library limit. Images are cached per export, limited to 2 MiB per image and 40 MiB per export, with a 6.5-second request deadline. Three consecutive image failures stop further image requests. Missing images keep their card names/printings and produce a visible completion notice. Closing the dialog cancels preparation.
- Changing export selections clears the previous download link so it cannot be mistaken for an updated file. JSON backups remain separate and preserve the complete restorable library.

## Hosting and dependencies

No new server, Worker route, persistent cloud storage, credential, paid plan or scheduled job. The existing static site and retrieval relay continue unchanged. PDF generation uses pinned `pdf-lib` 1.17.1 and `@pdf-lib/fontkit` 1.1.1. Their MIT licenses remain in their packages. The bundled Noto Sans Regular font and OFL license are in `public/fonts/`, obtained from the official `notofonts/noto-fonts` repository. PDF font source: `hinted/ttf/NotoSans/NotoSans-Regular.ttf`.

The CSP adds only `https://cards.scryfall.io` to `connect-src` so the PDF can read the same card images already displayed by the gallery. Export image fetching rejects every other origin, credentials, redirects, non-PNG/JPEG responses and oversized bodies. The static release allowlist admits only the two named font files. Main bundle loading does not preload the PDF chunk.

## Validation

### Saved-deck table follow-up (2026-10-12, WBS 12.7)

Saved decks now share one compact table with Deck, Cards and Actions columns. Clicking the deck name opens its results. Export, rename and delete use 36 px icon buttons with deck-specific accessible names and hover/focus tooltips. The library toolbar uses matching export, backup, restore and clear icons; undo remains available after a removal. The selected deck has a subtle background and `aria-current` on its name.

The full release gate passes all 152 tests, TypeScript and catalogue/build audits. Browser review confirmed existing five-deck data, correct single-deck export selection, rename target and deletion confirmation; dialogs were closed without deleting saved data. The built site fits 390 px and 320 px viewports without horizontal overflow. Axe 4.14.0 reported 49 passes and no violations or incomplete checks on the populated table. Screenshot: `reports/screenshots/saved-decks-table.jpg`. No storage, importer, export generator or hosting configuration changed.

### Gallery and export validation

`tests/app/card-export.test.ts` covers real single/multi-deck totals and ordering, exact alias and Japanese printings, joint credits, separate local copies, CSV injection/quoting, PDF page boundaries, accented names, image failure handling, limits and cancellation. Existing presentation tests now check visible exact images and portrait cards without disclosure menus.

The local QA harness can save the actual browser-generated PDF/CSV using an explicit **Save QA copy** control. It posts only to a loopback endpoint and writes fixed filenames under ignored `data/staging/pdf-qa/`. This instrumentation and public deck fixtures are excluded from production by the release guard. The final two-deck browser PDF has 38 entries representing 51 physical cards, 25 attending artists and four pages, with no missing images. Poppler-rendered pages were visually reviewed, including double-faced cards and emoji titles. Detailed results and production verification are recorded in `reports/interface-exports-validation.json`.
