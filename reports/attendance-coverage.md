# MagicCon: Atlanta attendance coverage — WBS 2.0

Snapshot: `magiccon-atlanta-2026-20261011T195408Z`. Captured 2026-10-11T19:54:08.430483Z through 2026-10-11T19:55:36.959126Z.

Sources: [Art of Magic overview](https://mcatlanta.mtgfestivals.com/en-us/art-of-magic.html) and [Artist Directory](https://mcatlanta.mtgfestivals.com/en-us/art-of-magic/artist-directory.html).

## Coverage

| Measure | Result |
| --- | ---: |
| people in feed | 218 |
| guest entries | 65 |
| people outside public artist selection | 153 |
| exhibitor entries | 65 |
| source entries | 130 |
| profiles retrieved | 130 |
| distinct attendees | 65 |
| merged duplicate entries | 65 |
| duplicate ids within source | 0 |
| unaccounted entries | 0 |
| retrieval failures | 0 |
| missing guest portraits | 6 |
| missing exhibitor portraits | 7 |
| attendees missing all portraits | 3 |
| attendees without published social fields | 36 |
| published link observations | 149 |
| flagged link observations | 7 |
| links without usable published destination | 5 |
| links using valid overview destination | 2 |
| featured exhibitors | 3 |
| source name differences | 11 |
| unreviewed exhibitor identities | 0 |

All 130 profile URLs were fetched, and their individual public data responses were checked against the list entries. Guest and exhibitor IDs are separate namespaces. Event duplicates retain both complete source observations.

The reviewed official renderer loads complete arrays, then applies category/day/alphabet filters in the browser. It has no server pagination or load-more request in either relevant renderer. Browser inspection found the same 65 guest IDs and 65 exhibitor IDs. Populated groups and the reviewed renderer checksum are recorded in [browser evidence](magiccon-browser-audit.json). The exhibitor list includes 3 featured entries within its total.

## Missing and questionable source data

No portrait in either source: John Stanko, Martina Fačková, Phil Foglio. Use a neutral placeholder.

36 attendees have no published dedicated social field. Their available websites, gallery links and biography URLs remain captured. Absence of a published field does not mean no social account exists.

Portraits retain their original remote URLs and official-profile attribution. No image files were copied or relicensed. Photographer credits/licensing were not stated in the captured profile fields; do not invent them.

Published link labels and source strings are preserved. Some social URLs are malformed on individual profiles but correctly prefixed by the official overview renderer; both published destinations are retained. `usable_url` uses a valid published destination when available and is null otherwise. No typo or handle has been guessed. External websites were not crawled for additional socials. HTTP success of those external links is not claimed.

| Attendee | Field | Published value | Issue |
| --- | --- | --- | --- |
| Alessandra Pisano | website | `Alesspisano.com ` | malformed_url |
| Jarel Threat | youtube | `www.youtube.com/c/JarelThreat` | malformed_url |
| Justine Jones | twitter | `@teanwitch` | malformed_url |
| Justine Jones | instagram | `@tean_witch ` | malformed_url |
| kelogsloops | instagram | `www.instagram.com/kelogsloops` | malformed_url |
| Olena "Lena" Richards | instagram | `https://www.lenarichards.com` | platform_mismatch |
| Winona Nelson | instagram | `instragram.com/winonanelsonart` | malformed_url |

The source labels `store_url` as **View Artists Magic Gallery**. These destinations are often Gatherer/Scryfall searches; they are preserved as gallery links, not relabeled as stores.

## Source name differences

| Guest name (raw) | Directory name (raw) | Deduplication evidence |
| --- | --- | --- |
| `Alessandra Pisano ` | `Alessandra Pisano` | unique_normalized_name_within_official_event_sections |
| `Cynthia Sheppard` | `Cynthia Shepard` | reviewed_biographies |
| `Eli  Minaya` | `Eli Minaya` | unique_normalized_name_within_official_event_sections |
| `John Stanko` | `John stanko` | unique_normalized_name_within_official_event_sections |
| `Josiah "Jo" Cameron ` | `Josiah "Jo" Cameron` | unique_normalized_name_within_official_event_sections |
| `Michael Bierek` | `Mike Bierek` | reviewed_biographies |
| `Phil Stone` | `phil stone` | unique_normalized_name_within_official_event_sections |
| `Pindurski` | `PINDURSKI` | unique_normalized_name_within_official_event_sections |
| `RK Post` | `rk post` | unique_normalized_name_within_official_event_sections |
| `SchmandrewART ` | `SchmandrewART` | unique_normalized_name_within_official_event_sections |
| `Tom Wänerstrand` | `Tomas Wanerstrand` | reviewed_biographies |

Nontrivial pairs use reviewed biography evidence in `data/curated/events/atlanta-2026-identity-review.json`. Other duplicate pairs have unique names after whitespace/case normalization. Entity kind follows the official guest person record; any unmatched exhibitor remains unreviewed rather than assumed to be an individual. Status as a Scryfall card illustrator remains `not_reconciled`.

## Attendance and verification case

Attendance-day groups: Fri,Sat,Sun: 64; Fri,Sat: 1. Booth numbers come from the exhibitor records; guest locations remain separate.

Day exceptions: Paul Scott Canavan: Fri/Sat.

The supplied David Palumbo profile was checked in the rendered browser; exact title, days and social-link label/destination are in [browser evidence](magiccon-browser-audit.json). The event JSON retains his source entries when present in the current roster.

## Exit status

WBS 2.0 complete: every source entry accounted for; zero retrieval failures or unresolved pagination gaps. Missing photos/socials and defective upstream links are documented source limitations, not collection blockers. Scryfall reconciliation and illustrated-card totals remain WBS 3.0 and have not started.

Reproduction, source coverage and snapshot handling: [event-data instructions](../docs/event-data.md).
