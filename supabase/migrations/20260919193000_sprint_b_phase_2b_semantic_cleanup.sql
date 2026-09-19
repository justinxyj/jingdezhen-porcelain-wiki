begin;

-- Sprint B Phase 2B: remove secondary edges that do not provide a distinct user-facing entry path.
delete from public.entry_worlds ew
using public.entries e
where ew.entry_id = e.id
  and ew.role = 'secondary'
  and (
    (ew.world_slug = 'history' and e.slug in (
      'huang-yunpeng','liu-yuanchang','qigong','qin-xilin','tian-han',
      'wang-xiliang','zhan-shaolin','zhang-songmao'
    ))
    or (ew.world_slug = 'objects' and e.slug in (
      'huang-yunpeng','liu-yuanchang','qin-xilin',
      'wang-xiliang','zhan-shaolin','zhang-songmao',
      'lang-tingji','nian-xiyao','tian-hexian','wang-bu','wang-qi'
    ))
    or (ew.world_slug = 'research' and e.slug = 'tian-han')
  );

commit;
