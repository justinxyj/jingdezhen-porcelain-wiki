-- Final private SECURITY DEFINER boundary for staff authorization.
-- Idempotent because the same boundary is also enforced by the preceding
-- final_security_performance_hardening migration.

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

do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='is_staff'
               and pg_get_function_identity_arguments(p.oid)='') then
    revoke all on function public.is_staff() from public, anon, authenticated;
    drop function public.is_staff();
  end if;
end $$;

commit;
