# Artist reconciliation — MagicCon Atlanta 2026

WBS 3.0 is complete. All **65 attendees** have reviewed Scryfall identities. The complete source table contains **2,434 artist UUIDs**. No attendee is omitted and no event identity is unresolved.

Sources: Scryfall `all_cards` updated **2026-10-11 09:19:13.375 UTC**, and the [official MagicCon roster](https://mcatlanta.mtgfestivals.com/en-us/art-of-magic.html) retrieved on **2026-10-11**. These totals describe that dated snapshot, including any previews already present; they are not live totals.

## Downloads

- [Atlanta artists CSV](artists-atlanta-2026.csv) · [JSON](artists-atlanta-2026.json)
- [All source artists CSV](artists-all.csv) · [JSON](artists-all.json)
- [Reviewed identities](../data/curated/artist-mappings.json) · [Discrepancy queue](artist-discrepancies.json)
- [Counting contract and reproduction](../docs/artist-statistics.md) · [Validation evidence](artist-validation.json)

## Identity decisions

Names remain source observations. Stable keys use Scryfall UUIDs. Candidate similarity never approves an identity.

Reviewed decisions: 61 exact-name matches, 1 normalized-name match, and 3 aliases supported by primary evidence. The three substantive Scryfall aliases are:

| MagicCon name | Scryfall name | Evidence |
| --- | --- | --- |
| Jason Engle | Jason A. Engle | Official constellation-gods biography, THB #259 credit, and [artist-owned JAE Studio](https://www.jaestudio.com/contact) |
| Olena "Lena" Richards | Olena Richards | Official nickname/biography, the profile's `olena_richards` gallery link, and [Lena Richards Art](https://www.lenarichards.com/) |
| Thomas Baxa | Thomas M. Baxa | MagicCon links BaxaArt; its [portfolio](https://www.baxaart.com/portfolio_index.htm) identifies Thomas M. Baxa and his Magic work |

The separate Michael/Mike Bierek, Cynthia Sheppard/Shepard, and Tom Wänerstrand/Tomas Wanerstrand event spellings retain the WBS 2 biography evidence. Case, accents, whitespace, pseudonyms and same-UUID Scryfall variants remain visible in the exports. Individual/collective identity is not guessed for unreviewed source artists.

All **230 joint-credit combinations** were audited by UUID. Names were never split and paired by position. **93 source UUIDs** lack an unambiguous single-ID name observation; their ID-based statistics remain valid, while names remain null. These do not block any of the 65 event mappings.

## What the numbers mean

The main total counts distinct Oracle identities on paper game cards. Editions collapse translated records only when set, collector number, layout and ordered illustration/credit identities agree. Language printings count actual Scryfall IDs. Artworks count known illustration IDs. Finishes do not multiply counts. Reversible cards use the artist's own face Oracle IDs.

Tokens (including the reversible Mechtitan), emblems, art cards, planes/phenomena, schemes, vanguards, front/reference cards, dungeons, heroes and stickers are supplemental. Digital-only records remain separately counted. Special game cards such as Conspiracies, Attractions, Contraptions and silver-border cards remain eligible.

All **546,137 source records** were accounted for; **529,030** are paper game-card printings before credit coverage is applied. Known credits span **33,291** distinct eligible cards and **49,867** artworks. Artist totals overlap and must not be summed to obtain a global unique total.

## Atlanta totals

| MagicCon artist | Scryfall artist | Cards | Editions | Language printings | Artworks | Supplemental objects |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Aaron Miller | Aaron Miller | 142 | 313 | 1959 | 150 | 17 |
| Alayna Danner | Alayna Danner | 105 | 317 | 1727 | 152 | 11 |
| Alessandra Pisano  | Alessandra Pisano | 34 | 65 | 337 | 38 | 3 |
| Alix Branwyn | Alix Branwyn | 57 | 94 | 504 | 62 | 10 |
| Andrea Radeck | Andrea Radeck | 31 | 49 | 136 | 33 | 5 |
| Ben Hill | Ben Hill | 28 | 54 | 252 | 29 | 4 |
| Bruce Brenneise | Bruce Brenneise | 32 | 83 | 307 | 34 | 1 |
| Chase Stone | Chase Stone | 124 | 371 | 1937 | 128 | 11 |
| Chris Rahn | Chris Rahn | 249 | 725 | 3694 | 264 | 51 |
| Chris Rallis | Chris Rallis | 166 | 436 | 2322 | 184 | 18 |
| Chris Seaman | Chris Seaman | 128 | 228 | 1129 | 126 | 11 |
| Cynthia Sheppard | Cynthia Sheppard | 69 | 181 | 1030 | 72 | 7 |
| Danny Schwartz | Danny Schwartz | 31 | 47 | 224 | 31 | 4 |
| Daren Bader | Daren Bader | 192 | 409 | 2360 | 194 | 10 |
| David Palumbo | David Palumbo | 137 | 270 | 1758 | 140 | 11 |
| Douglas Shuler | Douglas Shuler | 137 | 594 | 1800 | 153 | 2 |
| Eli  Minaya | Eli Minaya | 40 | 69 | 351 | 40 | 9 |
| Eric Deschamps | Eric Deschamps | 189 | 527 | 2967 | 202 | 22 |
| Evyn Fong | Evyn Fong | 57 | 112 | 592 | 63 | 5 |
| Gabor Szikszai | Gabor Szikszai | 180 | 460 | 2704 | 185 | 7 |
| Izzy | Izzy | 231 | 553 | 3410 | 234 | 13 |
| Jarel Threat | Jarel Threat | 57 | 91 | 496 | 59 | 6 |
| Jason Engle | Jason A. Engle | 193 | 405 | 2257 | 206 | 26 |
| Jeff Miracola | Jeff Miracola | 155 | 286 | 1669 | 159 | 12 |
| Joe Slucher | Joe Slucher | 68 | 115 | 847 | 73 | 5 |
| John Stanko | John Stanko | 86 | 180 | 1143 | 92 | 7 |
| Josiah "Jo" Cameron  | Josiah "Jo" Cameron | 26 | 35 | 190 | 26 | 5 |
| Josu Solano | Josu Solano | 39 | 66 | 287 | 39 | 1 |
| Justine Jones | Justine Jones | 36 | 40 | 279 | 36 | 12 |
| Kai Carpenter | Kai Carpenter | 44 | 81 | 379 | 46 | 13 |
| Kaja Foglio | Kaja Foglio | 64 | 192 | 733 | 69 | 1 |
| kelogsloops | Kelogsloops | 11 | 15 | 16 | 15 | 0 |
| Kieran Yanner | Kieran Yanner | 251 | 561 | 3126 | 262 | 39 |
| Leon Tukker | Leon Tukker | 59 | 121 | 547 | 78 | 7 |
| Lucas Graciano | Lucas Graciano | 164 | 345 | 2053 | 176 | 19 |
| Mark Poole | Mark Poole | 180 | 693 | 2249 | 216 | 11 |
| Mark Tedin | Mark Tedin | 214 | 749 | 3067 | 238 | 8 |
| Martina Fačková | Martina Fačková | 32 | 79 | 344 | 35 | 11 |
| Mathias Kollros | Mathias Kollros | 161 | 348 | 2148 | 169 | 6 |
| Michael Bierek | Mike Bierek | 97 | 274 | 1782 | 102 | 4 |
| Nicholas Gregory | Nicholas Gregory | 124 | 241 | 1419 | 139 | 19 |
| Nino Vecia | Nino Vecia | 40 | 71 | 364 | 40 | 6 |
| Olena "Lena" Richards | Olena Richards | 58 | 102 | 594 | 67 | 12 |
| Paul Scott Canavan | Paul Scott Canavan | 40 | 77 | 496 | 43 | 2 |
| Phil Foglio | Phil Foglio | 61 | 107 | 427 | 65 | 0 |
| Phil Stone | Phil Stone | 22 | 22 | 212 | 22 | 5 |
| Pindurski | PINDURSKI | 43 | 87 | 520 | 46 | 9 |
| Randy Gallegos | Randy Gallegos | 219 | 479 | 2709 | 233 | 15 |
| Richard Kane Ferguson | Richard Kane Ferguson | 96 | 179 | 849 | 100 | 5 |
| RK Post | rk post | 128 | 291 | 1688 | 132 | 6 |
| Ryan Pancoast | Ryan Pancoast | 181 | 499 | 2585 | 199 | 53 |
| Sam Burley | Sam Burley | 91 | 343 | 2031 | 149 | 11 |
| SchmandrewART  | SchmandrewART | 9 | 10 | 40 | 9 | 2 |
| Serena Malyon | Serena Malyon | 49 | 69 | 348 | 49 | 12 |
| Steve Prescott | Steve Prescott | 238 | 542 | 3193 | 246 | 32 |
| Steven Belledin | Steven Belledin | 185 | 587 | 3418 | 194 | 17 |
| Svetlin Velinov | Svetlin Velinov | 370 | 885 | 5346 | 400 | 35 |
| Thomas Baxa | Thomas M. Baxa | 131 | 242 | 1395 | 133 | 7 |
| Tom Wänerstrand | Tom Wänerstrand | 64 | 211 | 833 | 74 | 0 |
| Tyler Jacobson | Tyler Jacobson | 148 | 323 | 1862 | 153 | 26 |
| Tyler Walpole | Tyler Walpole | 113 | 178 | 824 | 116 | 10 |
| Victor Adame Minguez | Victor Adame Minguez | 171 | 402 | 2118 | 184 | 33 |
| Vincent Proce | Vincent Proce | 117 | 322 | 1797 | 131 | 12 |
| Winona Nelson | Winona Nelson | 142 | 350 | 2200 | 144 | 24 |
| Wizard of Barge | Wizard of Barge | 31 | 39 | 39 | 33 | 3 |

## Validation and limitations

Independent SQL over the normalized credit tables agrees with card and language-printing totals for **all 65 attendees**, and with the complete eligible printing scope. Six cards named or described in official biographies agree with actual credits; 19 profiles received deeper review, including aliases, pseudonyms and all six attendees with multiple single-ID source names. Every attendee also has UUID-checked source printing examples.

The saved seven-card fixture and regression suite cover translation deduplication, different art in one language, shared credits, separate face artists, reversible identities/tokens, missing data, source-review drift, null versus zero, and the following real printing counterexample:

- [Heliod, Sun-Crowned THB #18](https://scryfall.com/card/thb/18/heliod-sun-crowned): **Lius Lasahido**, not listed in this roster.
- [Heliod, Sun-Crowned THB #259](https://scryfall.com/card/thb/259/heliod-sun-crowned): **Jason A. Engle**, listed as Jason Engle.
- Both share the same name and Oracle ID. Only the selected printing gives the correct attendance match.

The discrepancy queue distinguishes **0 unresolved attendees**, **0 verified attendees with zero eligible cards**, **936 source objects missing credits**, **93 unnamed source UUIDs**, and **2369 source UUIDs not listed in this event snapshot**. Missing credits are not evidence that an artist is absent. Not listed does not mean a confirmed cancellation.

**702 eligible printing records** have insufficient artwork/credit information for safe language deduplication. Of these, **702** lack artist IDs and are not assigned to any artist total. **0 credited artist rows** have an artwork, Oracle or edition-fallback gap in this snapshot. The general fallback rule retains the printing UUID rather than merging uncertain art; affected artist rows expose that uncertainty in their coverage columns.

Source profile limitations from WBS 2 persist: three missing portraits, 36 attendees without dedicated social fields, and five link observations without usable published destinations. All original link labels, fields, URLs and provenance are retained in JSON and the CSV's JSON cells; missing links are not fabricated.

Both CSVs were authored and inspected through the spreadsheet runtime, then checked byte-for-byte against portable CSV serialization of the JSON rows. UTF-8 BOM preserves names in Excel; null becomes an empty cell and zero stays 0. Arrays/objects use JSON cells. Formula-like source text receives an apostrophe in CSV only; JSON preserves raw values.

**Blockers: none for WBS 3.0.** Source gaps remain visible. The next parent is WBS 4.0, static deck-import feasibility; it has not started.
