# Editorial production release — 2026-10-08

## Database release confirmation

- Project: `jingdezhen-porcelain-wiki`, Supabase project ref `jscttuocrulgpwvsfxou`.
- Release source: GitHub editorial drafts fixed at `0bcef6f2b50c824bf56eeb4bdd34e8bd3e984419`.
- Successfully committed, in one guarded atomic production SQL statement:
  - `public.entries`: 79 updated entries (including 22 metadata additions/updates).
  - `public.craft_processes`: 65 approved process descriptions.
  - `public.timeline_context`: 16 editorial historical-context records.
  - The remaining 7 terminology-review process drafts were not applied.
- Each target was checked against its existing record before update, using the live database record as a concurrency guard; any mismatch would have aborted the transaction.
- A separate complete preview transaction executed the same 160 updates and rolled them back. Read-only follow-up matched all original row versions/timestamps: 79/65/16.
- After the production commit, an independent SQL read compared the actual updated fields with the editorial drafts. Verification: entries 79/79; craft_processes 65/65; timeline_context 16/16.
- The publisher preserved the `updated_by` audit field rather than clearing it; the existing non-null audit value for `met-1991-253-33` remained intact.
- No schema changes, RLS changes, deletions, added records or changes to other content were requested.
- Per the project owner's explicit instruction, no database backup was created for this release.

## Site deployment

This documentation commit on `main` is intended to trigger the existing `Deploy GitHub Pages` workflow (`.github/workflows/deploy-pages.yml`). That workflow regenerates static entry pages from the production Supabase public API before building MkDocs.

**Status at report creation:** database release independently verified. GitHub Pages deployment and live page smoke verification are still pending; this report does not claim that website deployment has completed.

## Scope boundaries

- This release publishes editorial content, not a new UX implementation.
- Historical claims and external source reliability were not independently re-researched at deployment time; draft editorial-review limitations remain.
- No credential, project key or database backup is included in this public report.
