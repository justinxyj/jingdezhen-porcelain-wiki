-- Final security/performance hardening.
-- Supersedes the intermediate media_public view and temporary anon is_staff grant.
-- Adds HTTPS media URL constraints, targeted Entry Detail peer functions,
-- and the final is_staff execution boundary.

begin;

create schema if not exists private;
create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as 'select exists(select 1 from public.profiles where id = auth.uid() and role in (''reviewer'',''admin''));';

revoke all on function private.is_staff() from public;
grant execute on function private.is_staff() to authenticated, service_role;

alter policy "craft_process_relations_staff_write" on public.craft_process_relations to authenticated using (private.is_staff()) with check (private.is_staff());
alter policy "craft_processes_staff_write" on public.craft_processes to authenticated using (private.is_staff()) with check (private.is_staff());
alter policy "edits_staff_select" on public.edits to authenticated using (private.is_staff());
alter policy "edits_staff_update" on public.edits to authenticated using (private.is_staff()) with check (private.is_staff());
alter policy "entries_staff_read" on public.entries to authenticated using (private.is_staff());
alter policy "entries_staff_write" on public.entries to authenticated using (private.is_staff()) with check (private.is_staff());
alter policy "entry_craft_processes_staff_write" on public.entry_craft_processes to authenticated using (private.is_staff()) with check (private.is_staff());
alter policy "entry_relations_staff_write" on public.entry_relations to authenticated using (private.is_staff()) with check (private.is_staff());
alter policy "revisions_staff_read" on public.entry_revisions to authenticated using (private.is_staff());
alter policy "revisions_staff_insert" on public.entry_revisions to authenticated with check ((auth.uid() = editor_id) and private.is_staff());
alter policy "media_staff_insert" on public.media to authenticated with check (private.is_staff());
alter policy "media_staff_read" on public.media to authenticated using (private.is_staff());
alter policy "media_staff_update" on public.media to authenticated using (private.is_staff()) with check (private.is_staff());
alter policy "profiles_staff_select" on public.profiles to authenticated using (private.is_staff());
alter policy "timeline_context_staff_write" on public.timeline_context to authenticated using (private.is_staff()) with check (private.is_staff());

do $
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='is_staff'
               and pg_get_function_identity_arguments(p.oid)='') then
    revoke all on function public.is_staff() from public, anon, authenticated;
    drop function public.is_staff();
  end if;
end $;


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
