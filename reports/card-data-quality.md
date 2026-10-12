# Scryfall card-data baseline — WBS 1.0

Snapshot: `scryfall-all-cards-20261011091913`
Source updated: 2026-10-11T09:19:13.375+00:00
Validation: **PASS**

| Check | Result |
| --- | ---: |
| input records | 546,137 |
| stored printings | 546,137 |
| unique printing ids | 546,137 |
| quarantined records | 0 |
| duplicate printing id records | 0 |
| unaccounted records | 0 |
| card faces | 24,629 |
| source artist ids | 2,434 |
| observed single id names | 2,374 |
| joint credit groups | 230 |
| normalized name collisions | 0 |
| ambiguous printing tuples | 0 |
| paper printings | 537,000 |
| digital only printings | 9,137 |
| no paper game flag | 9,137 |
| missing artist credit | 936 |
| missing artist ids | 936 |
| missing illustration ids | 784 |
| missing oracle ids all levels | 0 |
| missing root oracle id with face ids | 83 |
| faces missing artist ids | 167 |
| faces missing illustration ids | 3,792 |
| paper missing artist credit | 936 |
| paper missing artist ids | 936 |
| paper missing illustration ids | 784 |

Languages: **19**. Sets: **1058**.

All source records and unknown fields are preserved in the compressed download and in SQLite `printings.source_json`.
The generated artist catalogue contains source identity observations; names have not been reconciled with MagicCon.
Missing credit fields and non-unique lookup tuples are data-quality findings, not discarded records.

See `card-data-quality.json` for the complete language/set coverage, ambiguity list, integrity checks, and index query plans.
See `docs/data-baseline.md` for reproduction and exact lookup commands.

WBS 2.0 (event artist collection) has not started.
