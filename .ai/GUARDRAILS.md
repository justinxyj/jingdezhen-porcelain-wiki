# Project Guardrails

## Database
- Never widen public write permissions as a side effect of fixing public read.
- No destructive SQL without explicit approval and recovery path.
- Live Supabase is authoritative for production behavior.
- Keep migrations idempotent where practical.

## Content
- Do not present inference as historical fact.
- Track provenance for historical claims and media.
- Candidate media is not verified media.
- Preserve rejected evidence when useful for auditability.

## Git
- Prefer feature branches for substantive work.
- Never force-push/rewrite main without explicit approval.
- PRs state scope, risk, verification and rollback when relevant.
- Green Pages does not automatically mean strict validation is green.

## AI continuity
- Do not rely on chat memory when project files can answer.
- Start sessions from PROJECT_CONTEXT.md and CURRENT_STATE.md.
- Update handoff records after substantial work.
- Do not claim live state from stale documentation.
