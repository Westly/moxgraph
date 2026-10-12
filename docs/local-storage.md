# Browser-local decks — WBS 8

Implemented in `src/storage/` and `src/ui/library.ts`, integrated in `src/app.ts`. This parent adds persistence to the existing static application. It adds no account, server database, cookie, analytics service, paid binding or deployment.

## User workflow

- Successful imports save locally and appear in **Your saved decks**. Reopening restores the list, its order, selected deck, last successful results, deck sections, card/artist search and sort.
- **Rename** changes only the local display name. **Refresh from source** validates the entire response before replacing the saved source/result. Failure or cancellation retains the previous deck. File/text imports without a source URL can be replaced by importing another export.
- Importing the same provider plus public deck ID offers **Update** an identified local copy or **A separate copy**. Copies have independent internal IDs and filters. Source titles and local names remain separate.
- **Delete** and **Clear all decks** show their scope before confirmation. **Undo last removal** recovers the previous library in the same tab until another library edit; backups remain the durable recovery route.
- **Download backup** exports all decks; **Back up this deck** exports one. **Restore backup** accepts a JSON file or pasted JSON, validates it, then previews names, counts and merge/replace consequences. No external upload occurs.
- Merge adds unfamiliar internal IDs and leaves existing IDs unchanged. Separate copies of a provider deck remain separate. Replace uses the backup exactly, including selection and filters, and removes decks absent from it. The preview offers a current-library download before replacing anything. A changed library invalidates an open preview.

## Database and records

Database: `moxgraph-local`, IndexedDB version **2**. It belongs to the exact site origin; localhost, the eventual production domain, different browser profiles and different devices have separate libraries. A localhost backup can later be restored on the production origin.

| Store | Key | Contents |
| --- | --- | --- |
| `decks` | Internal UUID | Local title, created/updated timestamps, validated provider/source metadata, import format/provenance, filters |
| `lines` | Deck UUID | Original selected source rows, quantity/section/finish, resolution status/reason/candidate IDs, selected printing UUID |
| `choices` | Deck UUID | Explicit manual choice timestamp, section and finish, keyed to the original source row |
| `cache` | Deck UUID | Deduplicated exact printing records, event directory and mapping snapshot, card/event/data versions |
| `settings` | `library` | Selected deck, view, ordered deck IDs, optimistic transaction revision |

The storage envelope is defined by `PackedEntry` / `PackedLibrary` in `codec.ts`. It deliberately preserves the adapter's original fields, including malformed identifiers retained for review. It is not a direct serialization of the earlier normalized `SavedDeck` / `DeckLine` design contracts. Shared `CardPrinting` and `EventDirectory` records still pass the generated validators; storage adds strict envelope, reference, URL, date, quantity and size validation. Derived artist matches are recomputed from the cached printing and directory instead of trusting serialized match flags. Complete API payloads and authentication material are not saved.

All five stores change in one read/write transaction. An abort after clearing or partially writing a store rolls back the entire transaction. The UI accepts a new result in memory and marks it saved only after transaction completion. Writes are serialized; a delayed filter write cannot resurrect a deleted library. Another tab's committed revision causes a conflict instead of a silent overwrite. The unsaved tab can export its current state and reload. Merge preserves existing IDs, so restoring a conflicting edit over a current ID requires the explicit replace choice.

Database open/read and write operations have bounded waits. Upgrade notifications close the old connection and request reload. Blocked upgrades, denied storage, quota exhaustion, invalid records and future schemas never trigger database deletion. A failed initial read does not grant permission to overwrite an unread existing library on retry.

Version 1 is a documented migration fixture containing the same deck envelope without filters in a single `decks` store. Upgrade validates it, splits records into the current stores and supplies default filters within the upgrade transaction. An invalid migration aborts and retains version 1. **There was no released persisted version 1: WBS 7 held decks only in memory.** This exercises the migration mechanism before public use; future schema changes need their own migrations.

## Backup boundary and limits

Backups contain `{ application: "moxgraph", version: 2, exportedAt, library, checksum }`. The SHA-256 checksum covers the payload and detects accidental modification; it is not a signature or proof of source authenticity. Unsupported versions and unexpected fields are rejected. Restore checks canonical provider URLs, valid IDs/dates, unique deck/row references, cached-printing references, safe actionable link schemes, and data contracts. MagicCon's original malformed social strings remain inert provenance; only reviewed display URLs are actionable.

- Maximum backup: **32 MiB** UTF-8 JSON. Saved payloads reserve 1 KiB for the export envelope.
- Maximum library: **50 decks / 25,000 source lines**.
- Existing per-deck bounds remain **5,000 source lines / 100,000 copies**. Source imports remain bounded at 12 MiB.
- Over-limit or invalid incoming states are rejected before replacing even the current in-memory library.
- On an actual persistence failure, current results and manual choices remain usable in memory and can be backed up. Successful imports are never described as persistently saved if the write fails.

## Printing identity and data updates

A manual override carries across source refresh only when the row key and all source identity/provenance fields are unchanged; quantity alone may change. Changed printing IDs, tuple, finish, language, section, categories or reassigned row keys require a new source resolution or review. This conservative rule may ask for review after harmless source reorganization; it prevents an override from moving to a different card.

On startup and after restore, a new public data version triggers an attendance refresh. Resolved rows use their saved **exact UUID**. A missing UUID stays pinned and unresolved; a different printing is never substituted. If the ID returns in a later catalogue, it can resolve again. Previously unresolved rows can be checked against the new catalogue. Attendance uses the new reviewed mappings, including face credits. The update commits only after the entire operation succeeds; otherwise the prior cached results and their versions remain available.

The UI renders artist groups from the directory associated with the displayed result. Result footers retain the card, event and package versions. This allows old cached results to remain readable if the current catalogue cannot load. It does not install a service worker or promise that the app shell itself works without a network connection.

## Privacy and recovery copy

The UI explains that data is saved in this browser, not synced; private browsing, site-data clearing or browser eviction can remove it. Browser storage is not a permanent backup. The app does not attempt to detect private mode or bypass browser storage policies. It handles denial/quota errors and offers backup. Remote portraits/card images still contact their hosts; public link imports still use the previously approved retrieval relay. Local names, choices, exports and backups are not sent to that relay.

## Verification

See `reports/local-storage-validation.json` for the completed checks and `tests/app/storage.test.ts` for repeatable regressions. The WBS 8 suite uses pinned `fake-indexeddb@6.2.5` in Node, including forced transactional quota failure, blocked/future schemas, denied access, stale-tab conflicts and migration rollback. It is a development dependency and is not in the website bundle. Browser UI checks use the local production build and actual browser IndexedDB.

References: [IndexedDB transactions and upgrades](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB), [version-change events](https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/versionchange_event), [fake-indexeddb project](https://github.com/dumbmatter/fakeIndexedDB).

WBS 9 remains responsible for the full browser/accessibility/performance/cost matrix. WBS 10 remains responsible for GitHub and production Cloudflare Pages deployment.
