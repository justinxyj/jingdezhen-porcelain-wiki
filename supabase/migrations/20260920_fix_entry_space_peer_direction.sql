-- Include both outgoing and incoming entry relations when building targeted space peers.
begin;
create or replace function public.entry_space_peers(
  p_entry_id uuid, p_eras text[], p_limit integer default 24
) returns setof public.entries
language sql stable security invoker set search_path = public
as $$
  with candidates as (
    select distinct e.* from public.entries e
    left join public.entry_relations r
      on ((r.related_entry_id=e.id and r.entry_id=p_entry_id)
          or (r.entry_id=e.id and r.related_entry_id=p_entry_id))
    where e.status='published' and e.id<>p_entry_id
      and e.zh->'meta'->'map'->>'lat' is not null
      and e.zh->'meta'->'map'->>'lng' is not null
      and (r.entry_id is not null or exists (
        select 1 from jsonb_array_elements(coalesce(e.zh->'meta'->'timeline','[]'::jsonb)) t
        where t->>'era'=any(coalesce(p_eras,'{}'::text[]))))
  ) select * from candidates order by updated_at desc,id
    limit least(greatest(coalesce(p_limit,24),1),100);
$$;
commit;
