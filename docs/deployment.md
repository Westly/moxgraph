# Production deployment — WBS 10

Status: in progress, 2026-10-12. Work is limited to WBS 10; WBS 11 maintenance has not started.

Repository: [Westly/moxgraph](https://github.com/Westly/moxgraph), public, created with the owner's existing GitHub identity and Git Credential Manager connection. Production branch: `main`; future development branches use `codex/`.

Only source, curated/catalogue metadata, compact website data, public/synthetic test fixtures and project documentation are committed. Raw snapshots, SQLite staging databases, dependencies, build output, local Wrangler state, environment credentials and browser backup files are excluded. Git attributes preserve exact bytes for checksummed data and captured fixtures.

The frontend will be a Git-connected Cloudflare Pages project named `moxgraph`, publishing `dist`. The already approved retrieval Worker remains separate on Workers Free. Neither pipeline may introduce paid services or publish after failed validation. Live URLs, commits, settings, verification and recovery procedures will be recorded as the remaining WBS 10 steps are completed.
