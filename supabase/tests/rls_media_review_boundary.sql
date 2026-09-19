-- Production RLS regression: ordinary authenticated users must not be able
-- to create review-approved/primary media. Run inside a transaction and roll back.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);

do $$
begin
  begin
    insert into public.media (uploader_id,path,status,review_state,verified_at,is_primary)
    values ('00000000-0000-0000-0000-000000000001','rls-regression-should-fail','approved','verified',now(),true);
    raise exception 'RLS regression: ordinary authenticated insert was allowed';
  exception when others then
    if position('row-level security' in lower(sqlerrm)) = 0
       and position('permission denied' in lower(sqlerrm)) = 0
       and position('violates' in lower(sqlerrm)) = 0 then
      raise;
    end if;
  end;
end $$;

rollback;
