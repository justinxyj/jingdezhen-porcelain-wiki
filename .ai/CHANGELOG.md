# Changelog

## 2026-09-19 — AI memory bootstrap on formal baseline
- Confirmed 6a8700b is the requested formal project baseline.
- Created durable .ai project-memory files.
- No production Supabase change in the memory bootstrap.

## 2026-09-19 — Phase 1 takeover audit
- Verified live Supabase production state.
- Confirmed Phase B public-read RLS is active for the core knowledge layer.
- Confirmed anon cannot execute is_staff().
- Confirmed 149 published entries, 133 media records, 72 craft processes and 71 process relations.
- Confirmed G29 dynamic content exists in production.

## 2026-09-19 — Internal media-candidate security fix
- Enabled RLS on public.craft_media_candidates.
- Enabled RLS on public.timeline_media_candidates.
- Revoked table privileges from public, anon, and authenticated.
- Verified anon/authenticated SELECT and INSERT are denied.
- Added migration supabase/migrations/20260919090000_secure_media_candidate_tables.sql to GitHub main.
- Security Advisor now reports only INFO for these two tables (RLS enabled with no policies), plus pre-existing function/auth WARNs.
