-- Regression tests for database invariants and function boundaries.
-- All writes are transaction-local and rolled back.

begin;

do $$
declare v_entry uuid; v_a uuid;
begin
  select id into v_entry from public.entries limit 1;
  if v_entry is null then raise exception 'test requires an entry'; end if;
  insert into public.media(entry_id,path,is_primary,status,review_state)
  values(v_entry,'__test_primary_a__',true,'pending','pending')
  returning id into v_a;
  begin
    insert into public.media(entry_id,path,is_primary,status,review_state)
    values(v_entry,'__test_primary_b__',true,'pending','pending');
    raise exception 'primary uniqueness regression';
  exception when unique_violation then null;
  end;
end $$;

do $$
declare v_entry uuid; v_editor uuid;
begin
  select id into v_entry from public.entries limit 1;
  select id into v_editor from public.profiles limit 1;
  if v_entry is null or v_editor is null then raise exception 'test requires entry/profile'; end if;
  insert into public.entry_revisions(entry_id,editor_id,version,snapshot)
  values(v_entry,v_editor,987654,'{}');
  begin
    insert into public.entry_revisions(entry_id,editor_id,version,snapshot)
    values(v_entry,v_editor,987654,'{}');
    raise exception 'revision uniqueness regression';
  exception when unique_violation then null;
  end;
end $$;

do $$
declare v_definer boolean;
begin
  select prosecdef into v_definer
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='is_staff'
    and pg_get_function_identity_arguments(p.oid)='';
  if v_definer then raise exception 'is_staff must be SECURITY INVOKER'; end if;
end $$;

rollback;