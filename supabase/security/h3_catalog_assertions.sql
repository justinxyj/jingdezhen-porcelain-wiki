-- H-3 readonly catalog assertions (A1–D1).
-- Pure SELECT / DO + RAISE only. No DDL/DML.
-- Fail checks RAISE EXCEPTION; known-debt C2/C3 RAISE WARNING only.

do $$
declare
  v_exists boolean;
  v_prosecdef boolean;
  v_search_path text;
  v_anon_exec boolean;
  v_auth_exec boolean;
  v_service_exec boolean;
  v_missing text[];
  v_rel text;
  v_has_is_staff boolean;
  v_media_verified boolean;
  v_staff_anon boolean;
  v_staff_private boolean;
  v_write text[];
  v_media_anon_select boolean;
  v_view_exists boolean;
  v_anon_sel boolean;
  v_write_grants text[];
  v_invoker boolean;
  v_sens text[];
  v_tbl text;
begin
  -- A1: private.is_staff exists, SECURITY DEFINER, search_path=public
  select exists(
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private' and p.proname = 'is_staff'
      and pg_get_function_identity_arguments(p.oid) = ''
  ) into v_exists;
  if not v_exists then
    raise exception 'H3 A1 FAIL: private.is_staff() missing';
  end if;

  select p.prosecdef,
         (
           select split_part(cfg, '=', 2)
           from unnest(coalesce(p.proconfig, array[]::text[])) as cfg
           where cfg like 'search_path=%'
           limit 1
         )
  into v_prosecdef, v_search_path
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'private' and p.proname = 'is_staff'
    and pg_get_function_identity_arguments(p.oid) = '';

  if not v_prosecdef then
    raise exception 'H3 A1 FAIL: private.is_staff must be SECURITY DEFINER';
  end if;
  if v_search_path is distinct from 'public' then
    raise exception 'H3 A1 FAIL: private.is_staff search_path must be public, got %', coalesce(v_search_path, '<null>');
  end if;

  -- A2: public.is_staff must not exist
  select exists(
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_staff'
      and pg_get_function_identity_arguments(p.oid) = ''
  ) into v_exists;
  if v_exists then
    raise exception 'H3 A2 FAIL: public.is_staff() must not exist';
  end if;

  -- A3: EXECUTE boundaries
  select
    has_function_privilege('anon', p.oid, 'EXECUTE'),
    has_function_privilege('authenticated', p.oid, 'EXECUTE'),
    has_function_privilege('service_role', p.oid, 'EXECUTE')
  into v_anon_exec, v_auth_exec, v_service_exec
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'private' and p.proname = 'is_staff'
    and pg_get_function_identity_arguments(p.oid) = '';

  if v_anon_exec then
    raise exception 'H3 A3 FAIL: anon must not EXECUTE private.is_staff';
  end if;
  if not v_auth_exec then
    raise exception 'H3 A3 FAIL: authenticated must EXECUTE private.is_staff';
  end if;
  if not v_service_exec then
    raise exception 'H3 A3 FAIL: service_role must EXECUTE private.is_staff';
  end if;

  -- B1: RLS enabled on seven tables
  v_missing := array[]::text[];
  foreach v_rel in array array[
    'entries','media','entry_relations','edits','entry_revisions','profiles','favorites'
  ] loop
    if not exists (
      select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = v_rel and c.relrowsecurity
    ) then
      v_missing := array_append(v_missing, v_rel);
    end if;
  end loop;
  if cardinality(v_missing) > 0 then
    raise exception 'H3 B1 FAIL: RLS disabled or missing for: %', array_to_string(v_missing, ',');
  end if;

  -- B2: public SELECT quals on entries/entry_relations/media must not contain is_staff;
  --     media public read must require approved+verified (or status/review_state equivalents)
  select exists(
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename in ('entries','entry_relations','media')
      and cmd = 'SELECT'
      and (
        roles::text ilike '%anon%'
        or roles::text ilike '%public%'
      )
      and coalesce(qual, '') ilike '%is_staff%'
  ) into v_has_is_staff;
  if v_has_is_staff then
    raise exception 'H3 B2 FAIL: public SELECT qual contains is_staff';
  end if;

  select exists(
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'media' and cmd = 'SELECT'
      and (roles::text ilike '%anon%' or roles::text ilike '%public%')
      and (
        (
          coalesce(qual, '') ilike '%approved%'
          and coalesce(qual, '') ilike '%verified%'
        )
        or (
          coalesce(qual, '') ilike '%status%'
          and coalesce(qual, '') ilike '%review_state%'
        )
      )
  ) into v_media_verified;
  if not v_media_verified then
    raise exception 'H3 B2 FAIL: media public read must require approved+verified (or status/review_state)';
  end if;

  -- B3: staff policies call private.is_staff and roles authenticated-only (no anon)
  select exists(
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename in ('entries','media','entry_relations','edits','entry_revisions','profiles','favorites')
      and (
        coalesce(qual, '') ilike '%is_staff%'
        or coalesce(with_check, '') ilike '%is_staff%'
      )
      and roles::text ilike '%anon%'
  ) into v_staff_anon;
  if v_staff_anon then
    raise exception 'H3 B3 FAIL: staff policy includes anon role';
  end if;

  select not exists(
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename in ('entries','media','entry_relations','edits','entry_revisions','profiles','favorites')
      and (
        coalesce(qual, '') ilike '%is_staff%'
        or coalesce(with_check, '') ilike '%is_staff%'
      )
      and not (
        coalesce(qual, '') ilike '%private.is_staff%'
        or coalesce(with_check, '') ilike '%private.is_staff%'
      )
  ) into v_staff_private;
  if not v_staff_private then
    raise exception 'H3 B3 FAIL: staff policy must use private.is_staff()';
  end if;

  -- B4: no anon INSERT/UPDATE/DELETE/ALL policies on the seven tables
  select coalesce(array_agg(tablename || ':' || policyname || ':' || cmd order by tablename, policyname), array[]::text[])
  into v_write
  from pg_policies
  where schemaname = 'public'
    and tablename in ('entries','media','entry_relations','edits','entry_revisions','profiles','favorites')
    and cmd in ('INSERT','UPDATE','DELETE','ALL')
    and roles::text ilike '%anon%';
  if cardinality(v_write) > 0 then
    raise exception 'H3 B4 FAIL: anon write policies present: %', array_to_string(v_write, ',');
  end if;

  -- C1: media × anon has no table-level SELECT
  select has_table_privilege('anon', 'public.media', 'SELECT') into v_media_anon_select;
  if v_media_anon_select then
    raise exception 'H3 C1 FAIL: anon must not have table SELECT on public.media';
  end if;

  -- C2 (known-debt warn): media_public exists; anon SELECT; no write grants preferred
  select exists(
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'media_public' and c.relkind in ('v','m')
  ) into v_view_exists;

  if v_view_exists then
    select has_table_privilege('anon', 'public.media_public', 'SELECT') into v_anon_sel;
  else
    v_anon_sel := false;
  end if;

  select coalesce(array_agg(privilege_type order by privilege_type), array[]::text[])
  into v_write_grants
  from information_schema.role_table_grants
  where table_schema = 'public' and table_name = 'media_public' and grantee = 'anon'
    and privilege_type in ('INSERT','UPDATE','DELETE','TRUNCATE');

  if not v_view_exists or not v_anon_sel or cardinality(v_write_grants) > 0 then
    raise warning 'H3 C2 WARN (known-debt): media_public_exists=% anon_select=% anon_write_grants=%',
      v_view_exists, v_anon_sel, coalesce(array_to_string(v_write_grants, ','), '');
  end if;

  -- C3 (known-debt warn): security_invoker=true
  select exists(
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'media_public'
      and exists (
        select 1 from unnest(coalesce(c.reloptions, array[]::text[])) opt
        where opt = 'security_invoker=true'
      )
  ) into v_invoker;
  if not v_invoker then
    raise warning 'H3 C3 WARN (known-debt): media_public.security_invoker is not true';
  end if;

  -- D1: sensitive tables — anon no SELECT
  v_sens := array[]::text[];
  foreach v_tbl in array array['edits','entry_revisions','profiles','favorites'] loop
    if has_table_privilege('anon', format('public.%I', v_tbl), 'SELECT') then
      v_sens := array_append(v_sens, v_tbl);
    end if;
  end loop;
  if cardinality(v_sens) > 0 then
    raise exception 'H3 D1 FAIL: anon has SELECT on sensitive tables: %', array_to_string(v_sens, ',');
  end if;

  raise notice 'H3 catalog assertions A1–D1 completed (C2/C3 warn-only if debt)';
end $$;
