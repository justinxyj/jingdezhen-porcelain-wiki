-- Expose only verified public media fields to anon; keep sensitive media columns behind authenticated RLS.
create or replace view public.media_public as
select id, entry_id, path, title, source, license, creator, captured_at, location, created_at, usage_type, source_tier, is_primary, canonical_key, source_url, source_type
from public.media
where status = 'approved' and review_state = 'verified';
revoke select on table public.media from anon;
grant select on table public.media_public to anon;
