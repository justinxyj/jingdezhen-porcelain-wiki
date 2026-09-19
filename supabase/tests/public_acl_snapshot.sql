-- Canonical public ACL snapshot regression checks.
-- These assertions inspect production schema metadata; they do not modify data.

do $$
declare
  v_grant boolean;
  v_policy boolean;
begin
  select exists(
    select 1 from information_schema.role_column_grants
    where grantee='anon' and table_schema='public' and table_name='media'
      and column_name='verification_note' and privilege_type='SELECT'
  ) into v_grant;
  if v_grant then raise exception 'ACL regression: anon can select media.verification_note'; end if;

  select exists(
    select 1 from pg_policies
    where schemaname='public' and tablename='media'
      and policyname='media_public_verified_read'
      and qual like '%status = ''approved''%review_state = ''verified''%'
  ) into v_policy;
  if not v_policy then raise exception 'ACL regression: canonical media public policy missing'; end if;

  if has_table_privilege('anon','public.entry_revisions','SELECT') then
    raise exception 'ACL regression: anon has table SELECT on entry_revisions';
  end if;

  if has_table_privilege('anon','public.profiles','SELECT') then
    raise exception 'ACL regression: anon has table SELECT on profiles';
  end if;
end $$;