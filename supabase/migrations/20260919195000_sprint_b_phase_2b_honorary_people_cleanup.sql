begin;

-- Honorary/inscription-only modern figures do not provide a distinct
-- "modern Jingdezhen" navigation path in the current knowledge graph.
delete from public.entry_worlds ew
using public.entries e
where ew.entry_id=e.id
  and ew.role='secondary'
  and ew.world_slug='contemporary'
  and e.slug in ('li-xiannian','li-zhengdao','qian-qichen');

commit;
