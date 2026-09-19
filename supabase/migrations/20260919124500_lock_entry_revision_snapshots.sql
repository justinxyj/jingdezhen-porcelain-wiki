-- Close anonymous access to raw revision snapshots.
-- Revision snapshots can contain historical/internal fields and editor UUIDs.

begin;

drop policy if exists "revisions_public_read" on public.entry_revisions;

create policy "revisions_staff_read" on public.entry_revisions
  for select to authenticated
  using (public.is_staff());

revoke select on table public.entry_revisions from anon;
grant select on table public.entry_revisions to authenticated;

commit;
