# MagicCon event-data baseline — WBS 2.0

The initial snapshot is `magiccon-atlanta-2026-20261011T195408Z`, captured on October 11, 2026, from 19:54:08 through 19:55:36 UTC. It covers the official Art of Magic category for MagicCon: Atlanta, November 13–15, 2026.

This phase ends with an audited event roster. It does not map attendees to Scryfall identities, calculate illustrated-card totals, implement the website, create a GitHub repository, or deploy to Cloudflare.

## Results

- 65 public guest entries on the [Art of Magic overview](https://mcatlanta.mtgfestivals.com/en-us/art-of-magic.html).
- 65 exhibitor entries in the [Artist Directory](https://mcatlanta.mtgfestivals.com/en-us/art-of-magic/artist-directory.html), including three featured entries.
- All 130 official profile pages and all 130 corresponding individual public data responses retrieved successfully; no list/detail discrepancies.
- 65 distinct attendees after merging duplicate event entries. Both original names, IDs, URLs, images, attendance fields and links remain in `source_entries`.
- 11 raw name differences, including whitespace and capitalization. Three nontrivial pairs have recorded biography evidence: Cynthia Sheppard / Cynthia Shepard, Michael Bierek / Mike Bierek, and Tom Wänerstrand / Tomas Wanerstrand. These are event-section merges only, not Scryfall mappings.
- Every attendee has a booth number. Paul Scott Canavan is listed Friday/Saturday; the other 64 are listed all three days.
- Six guest profiles and seven showroom profiles have no image. Combining their published image sources leaves three attendees without either: John Stanko, Martina Fačková and Phil Foglio.
- 35 dedicated social-field observations across 29 attendees; 36 attendees have no dedicated social field. Available websites, gallery links and biography URLs are retained.
- 149 link observations: 142 profile links and seven additional biography URL observations. Seven profile destinations have syntax/platform issues. Two have valid alternate destinations already published by the overview; five remain unusable without correction. No correction has been invented.

The [coverage report](../reports/attendance-coverage.md) includes the discrepancy lists. There are no WBS 2.0 collection blockers. Source gaps must remain explicit when implementing the UI.

## How completeness was established

The overview contains `growTixGuestList`, while the directory contains `growTixExhibitors`. Their shared public `gt-scripts-min.js` loads Leap Event's public JSON feeds. The page-embedded event key is public renderer configuration, not a GitHub/Cloudflare credential. The collector discovers it each time; tracked manifests omit its value.

The guest renderer reads `/api/people?schedule=1` with an empty search term and then selects `publicly_visible` records whose **global_categories** contain `Art of Magic`. `people_categories` is not the selection field. The response contains 218 people; 153 outside the public artist selection were excluded, not marked absent or imported as artists.

The exhibitor renderer reads `/api/space_order_categories`, then `/api/space_orders?specials=1&category=20591` with an empty search term. The category feed verifies that `20591` is `Art of Magic`. This returns 65 entries. Its premium spotlight is disabled in page configuration; featured exhibitors are already in this array.

Both renderers build the full list before applying browser-local category/day/alphabet filters. Their relevant code contains no pagination/load-more request, and the feed envelopes contain no continuation metadata. In the rendered browser, the complete guest-ID and exhibitor-ID sets matched the captured feeds. The guest list had one populated group, `featured`, with 65 entries. No canceled/memoriam entries were present. See [browser evidence](../reports/magiccon-browser-audit.json), including the reviewed renderer checksum. A future feed-envelope change or an unreviewed browser snapshot blocks curation.

For every source entry, the collector fetches the official HTML profile, verifies its renderer/event configuration, and fetches its individual `/api/people?...&id=...` or `/api/space_orders?...&id=...` response. The response must contain exactly the requested ID and agree with every list field. This is a public feed capture, not 130 browser-rendered profile inspections. David Palumbo's rendered profile separately confirms his name, dates and Instagram label/destination.

No unrelated event guest profiles, external artist websites or social pages were crawled. Product artwork/special-offer galleries are outside the attendance/profile collection scope; their card totals are not used.

## Files and provenance

| File | Purpose | Git policy |
| --- | --- | --- |
| `data/manifests/magiccon-atlanta-2026-20261011T195408Z.json` | Retrieval URLs, timestamps, HTTP status, byte counts, SHA-256 hashes, public renderer configuration, 130 profile retrieval records and generated artifacts | Track |
| `data/raw/magiccon-atlanta-2026-20261011T195408Z/` | Original page HTML, JavaScript, list feeds and individual responses | Ignore |
| `data/raw/magiccon-atlanta-2026/` | Initial source reconnaissance; not the frozen baseline | Ignore |
| `data/sources/events/atlanta-2026-profiles.json` | Portable extracts of the original published artist-profile fields with provenance; no unrelated guests or unrendered exhibitor registration names | Track |
| `data/curated/events/atlanta-2026.json` | Event metadata and 65 attendees, retaining both source observations | Track |
| `data/curated/events/atlanta-2026-identity-review.json` | Three reviewed cross-section identity decisions and required biography evidence | Track |
| `reports/attendance-coverage.json` and `.md` | Generated coverage, missing information and link issues | Track |
| `reports/magiccon-browser-audit.json` | Independently observed roster IDs and profile spot check | Track |
| `tests/fixtures/magiccon-profiles.json` | Six real public profile extracts for focused regression tests | Track |

Raw HTML may contain unrelated page configuration and analytics markup. It is retained locally for provenance, never copied into the future application. Raw JSON/HTML must not be inserted into the website DOM. The portable profile extracts also are preparation/audit data; WBS 5 decides which fields to ship to visitors.

## Reproduce locally

Python 3.12+ standard library only; no package, API account, paid service, application server or owner credential is required.

Run focused tests:

```powershell
python -m unittest discover -s tests -p test_magiccon_data.py -v
```

Rebuild the frozen local baseline without network access:

```powershell
python scripts/data/magiccon_catalogue.py --manifest data/manifests/magiccon-atlanta-2026-20261011T195408Z.json
```

This requires the ignored raw capture on this computer. A Git clone contains the portable published-field extracts and completed results, but not the original HTML/response archive. To capture the current upstream state on another computer:

```powershell
python scripts/data/magiccon_source.py
```

The collector prints a new dated manifest. Before curating that new capture, inspect both rendered rosters and any changed renderer, update `reports/magiccon-browser-audit.json` with the actual observed IDs/checksum/snapshot, and review changed event-identity evidence. Then run the curator against the printed manifest path. Do not copy old browser evidence to claim a new observation. Current upstream data cannot reproduce an older historical snapshot if the publisher changes it.

The source script uses three workers, a delay before requests, a 45-second timeout and a response-size bound. It reads only allowlisted public event/feed hosts and checks redirects. It performs no automatic retry loop or scheduled refresh. Each run receives its own raw directory; the original capture remains available. Failed captures write a failed manifest and cannot replace the curated data. Curating a different snapshot with fewer attendees also stops for review. Artifact publication occurs only after all validation succeeds; related files must still ship together in the later static deployment.

Generated reports have run timestamps, so their bytes can change on a rebuild. With the same capture/review files, attendee identities, names, links, dates, image observations and coverage counts should remain the same. The manifest records artifact, collector, curator, identity-review and browser-evidence hashes.

## Link and image rules

- Preserve source strings, including typos, trailing spaces, HTTP schemes, query strings and capitalization. Never change a guest's name or social handle to resemble a Scryfall name in this phase.
- `published_href` preserves the individual profile destination. For plain biography text, `origin=biography_text` identifies an extracted textual URL rather than an original clickable anchor. Its source string is retained; adding `http://` to a scheme-less textual website is an explicit derivation.
- `overview_published_href` preserves the official overview renderer's prefixed version of a social field. This allows kelogsloops' Instagram and Jarel Threat's YouTube to use existing valid published URLs despite malformed hrefs on their individual profiles.
- `usable_url` is selected only from a syntactically valid destination; social fields must point to the corresponding platform. A null value means review is needed. HTTP reachability and account ownership are not verified by syntax checks.
- The `store_url` source field is labeled **View Artists Magic Gallery** by this event. Preserve that label even when the destination is Gatherer/Scryfall, rather than inventing a store link.
- Never import event-wide Facebook, PlayMTG, mtgfestivals Instagram or Bluesky footer links as artist socials. Only artist-specific response fields and biographies are processed.
- Retain all published image variants and their source profile. Prefer a guest image, then the same verified individual's showroom image. No image may be borrowed from a different artist or printing.
- Use original remote image URLs with lazy loading in the later UI and a neutral person placeholder when absent/unavailable. No image downloads, local optimization, or paid image service were added. Preserve MagicCon attribution and link the image/name to the official profile. A photographer credit/license was not supplied in these profile fields; public availability is not recorded as a license grant.
- `entity_kind=individual` means an official guest-person record backs the entry. Unmatched exhibitors remain `unreviewed_exhibitor`; a studio name alone does not imply an individual. `card_illustrator_status=not_reconciled` prevents attendance data alone from claiming Scryfall credit matches.

## Next boundary

WBS 2.0 is complete. Wait for the owner to authorize WBS 3.0, which will reconcile Scryfall identities and generate the artist totals tables. No Scryfall data was read or changed by the WBS 2 scripts.
