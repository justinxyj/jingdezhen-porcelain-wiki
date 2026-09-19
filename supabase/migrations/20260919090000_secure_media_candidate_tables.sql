-- Protect internal media-candidate tables from the public Data API.
-- These tables are workflow/candidate pools, not public-facing knowledge data.
-- service_role/postgres retain administrative access; anon/authenticated receive no table privileges.

alter table public.craft_media_candidates enable row level security;
alter table public.timeline_media_candidates enable row level security;

revoke all on table public.craft_media_candidates from public, anon, authenticated;
revoke all on table public.timeline_media_candidates from public, anon, authenticated;
