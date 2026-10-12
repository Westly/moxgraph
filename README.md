# moxgraph.com

A static website for finding cards in Moxfield/Archidekt decks illustrated by artists attending MagicCon, using each card's selected printing.

**Current status:** [moxgraph.com](https://moxgraph.com/) is live on Cloudflare Pages Free, with protected GitHub updates deploying the static site and the separate Workers Free retrieval relay. WBS 11 adds staged manual data refreshes, reviewed change reports, exact-printing alias revalidation, recoverable publication and immutable Atlanta archives. The actual final pre-event review (November 12) and post-event archive (November 16, 2026) remain pending. No refresh scheduler or paid service is enabled.

- [Project roadmap and WBS](ROADMAP.md)
- [Manual data refresh, recovery and event checkpoints](docs/maintenance.md) · [Maintenance release acceptance](reports/maintenance-validation.json)
- [Deployment settings and rollback](docs/deployment.md) · [Launch receipt](reports/deployment-validation.json) · [Live HTTP checks](reports/deployment-http-audit.json)
- [Release checklist](docs/release-checklist.md) · [WBS 9 validation](docs/release-validation.md) · [Performance report](reports/performance-audit.json)
- [Local saving, backup/restore and recovery](docs/local-storage.md) · [Storage validation](reports/local-storage-validation.json)
- [Deck imports, matching and recovery](docs/deck-imports.md) · [Fixture audit](reports/import-matching-audit.json) · [Browser validation](reports/import-matching-validation.json)
- [Design system, brand assets and visual QA](docs/design-system.md) · [Design validation](reports/design-validation.json)
- [Local app, contracts, packaging and build instructions](docs/static-data.md)
- [Data packaging measurements](reports/static-data-packaging.json) · [App validation](reports/app-foundation-validation.json) · [Repeatability proof](reports/static-data-repeatability.json)
- [Card-data quality report](reports/card-data-quality.md)
- [Data preparation and reproduction instructions](docs/data-baseline.md)
- [Selected source revisions](data/pipeline.json)
- [Attendance coverage report](reports/attendance-coverage.md)
- [Event snapshot](data/curated/events/atlanta-2026.json)
- [Event-data reproduction instructions](docs/event-data.md)
- [Artist reconciliation and totals report](reports/artist-reconciliation.md)
- [Atlanta artists CSV](reports/artists-atlanta-2026.csv) · [JSON](reports/artists-atlanta-2026.json)
- [All 2,434 source artists CSV](reports/artists-all.csv) · [JSON](reports/artists-all.json)
- [Counting contract and reproduction](docs/artist-statistics.md)
- [Import feasibility, exact-printing findings and decision](docs/import-feasibility.md)
- [Blocker resolution and verified Free Worker deployment](docs/import-blocker-resolution.md)
- [Live retrieval endpoint (status only)](https://moxgraph-import-relay-probe.westlywhite.workers.dev) · [Browser evidence](reports/import-relay-browser-audit.json) · [Printing-preservation evidence](reports/import-relay-http-audit.json)
- [Reviewed printing aliases](data/curated/printing-aliases.json) · [Recovery audit](reports/import-recovery-audit.json)
- [Printing audit](reports/import-printing-audit.json) · [Browser evidence](reports/import-browser-audit.json)
- [Static feasibility probe](https://moxgraph-import-probe.pages.dev)

Use the pinned Node/Python versions in `.node-version` and `.python-version`. Run `npx --yes npm@11.9.0 ci --no-audit --no-fund`, `npm run verify`, then `npm run preview:release` and open **http://localhost:3000/**. That exact loopback origin is allowed by the existing relay. `npm run dev` uses the same port; run one server at a time. See the build instructions above before regenerating data: that separate step needs the ignored full baseline.

Work proceeds one parent WBS at a time. WBS 11 maintenance implementation is ready; its dated November checkpoints remain open in the roadmap. Follow the maintenance runbook to refresh sources in order and publish only a fully checked candidate. Saved decks belong to the browser and origin: use backup/restore to move a library to another browser or device. The relay retains Free limits, transient rate counters and no stored decks or paid fallback.

The data scripts use Python's standard library. Large bulk downloads and SQLite files stay under ignored `data/raw/` and `data/staging/` directories; they are not website assets or Git uploads.
