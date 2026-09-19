-- Final security/performance hardening.
-- Supersedes the intermediate media_public view and temporary anon is_staff grant.
-- Adds HTTPS media URL constraints, targeted Entry Detail peer functions,
-- and the final is_staff execution boundary.

begin;

revoke execute on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated, service_role;

drop view if exists public.media_public;
drop policy if exists "media_public_read" on public.media;
drop policy if exists "media_public_verified_read" on public.media;
create policy "media_public_verified_read" on public.media
  for select to anon, authenticated
  using (status = 'approved' and review_state = 'verified');

revoke all on table public.media from anon;
grant select (
  id, entry_id, path, title, source, license, creator, captured_at, location,
  created_at, usage_type, source_tier, is_primary, canonical_key, source_url, source_type
) on table public.media to anon;
revoke all on table public.entry_revisions from anon;

alter table public.media drop constraint if exists media_path_https_check;
alter table public.media add constraint media_path_https_check
  check (path ~* '^https://[^[:space:]<>"]+$');
alter table public.media drop constraint if exists media_source_url_https_check;
alter table public.media add constraint media_source_url_https_check
  check (source_url is null or btrim(source_url) = '' or source_url ~* '^https://[^[:space:]<>"]+$');

create or replace function public.entry_timeline_peers(
  p_entry_id uuid, p_eras text[], p_limit integer default 12
) returns setof public.entries
language sql stable security invoker set search_path = public
as $$
  select e.* from public.entries e
  where e.status='published' and e.id<>p_entry_id
    and coalesce(jsonb_array_length(e.zh->'meta'->'timeline'),0)>0
    and exists (select 1 from jsonb_array_elements(e.zh->'meta'->'timeline') t
      where t->>'era'=any(coalesce(p_eras,'{}'::text[])))
  order by e.updated_at desc,e.id
  limit least(greatest(coalesce(p_limit,12),1),100);
$$;

create or replace function public.entry_space_peers(
  p_entry_id uuid, p_eras text[], p_limit integer default 24
) returns setof public.entries
language sql stable security invoker set search_path = public
as $$
  with candidates as (
    select distinct e.* from public.entries e
    left join public.entry_relations r on r.related_entry_id=e.id and r.entry_id=p_entry_id
    where e.status='published' and e.id<>p_entry_id
      and e.zh->'meta'->'map'->>'lat' is not null
      and e.zh->'meta'->'map'->>'lng' is not null
      and (r.entry_id is not null or exists (
        select 1 from jsonb_array_elements(coalesce(e.zh->'meta'->'timeline','[]'::jsonb)) t
        where t->>'era'=any(coalesce(p_eras,'{}'::text[]))))
  ) select * from candidates order by updated_at desc,id
    limit least(greatest(coalesce(p_limit,24),1),100);
$$;
revoke all on function public.entry_timeline_peers(uuid,text[],integer) from public;
revoke all on function public.entry_space_peers(uuid,text[],integer) from public;
grant execute on function public.entry_timeline_peers(uuid,text[],integer) to anon, authenticated;
grant execute on function public.entry_space_peers(uuid,text[],integer) to anon, authenticated;

commit;
