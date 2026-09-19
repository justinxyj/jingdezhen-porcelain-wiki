-- Enforce the public media review boundary at the database layer.
-- Ordinary authenticated users may submit only pending, non-primary media.
-- Only staff can insert or update review-controlled media fields.
-- Public clients read only approved + verified media through a column-minimized view.

begin;

drop policy if exists "media_public_read" on public.media;
drop policy if exists "media_insert" on public.media;

create policy "media_public_read" on public.media
  for select to anon, authenticated
  using (
    status = 'approved'
    and review_state = 'verified'
  );

create policy "media_user_insert" on public.media
  for insert to authenticated
  with check (
    auth.uid() = uploader_id
    and status = 'pending'
    and review_state = 'pending'
    and verified_at is null
    and coalesce(is_primary, false) = false
  );

create policy "media_staff_insert" on public.media
  for insert to authenticated
  with check (public.is_staff());

create or replace view public.media_public
with (security_invoker = false, security_barrier = true)
as
select
  id,
  entry_id,
  path,
  title,
  source,
  license,
  creator,
  captured_at,
  location,
  created_at,
  usage_type,
  source_tier,
  is_primary,
  canonical_key,
  source_url,
  source_type
from public.media
where status = 'approved'
  and review_state = 'verified';

revoke all on table public.media_public from public, anon, authenticated;
grant select on table public.media_public to anon, authenticated;

revoke select on table public.media from anon;
grant select on table public.media to authenticated;

commit;
