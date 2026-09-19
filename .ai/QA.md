# QA Baseline

## Core regression
- Anonymous visitor can load public pages.
- Public dynamic entries can be read without authorization errors.
- /entry/?slug=... renders a published entry.
- Missing entry is distinguishable from RLS/network failure.
- Media is semantically matched and provenance/license is visible where applicable.
- Timeline/map cards use canonical media for that entry.
- Relationships load by stable IDs.
- No legacy renderer conflicts with canonical renderer.

## Database security
- Public read only where intended.
- Public write remains denied unless explicitly designed.
- Staff actions remain protected.
- Functions used by RLS have correct EXECUTE grants.

## Build/release
- Museum QA passes.
- mkdocs build --strict (or equivalent) passes.
- GitHub Pages deployment succeeds and is observable.

## Evidence
For each significant fix record commit/PR, environment, test/request, expected and observed result.
