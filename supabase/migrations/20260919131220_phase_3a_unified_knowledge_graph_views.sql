-- Phase 3A: unified public knowledge graph views.
create or replace view public.knowledge_graph_nodes with (security_invoker = true) as
select 'entry'::text node_type,'entry:'||e.id::text node_id,coalesce(e.zh->>'title',e.slug) label,e.category,e.zh->>'summary' summary,jsonb_build_object('slug',e.slug,'category',e.category) metadata
from public.entries e where e.status='published'
union all select 'world','world:'||w.slug,w.title,null,w.description,jsonb_build_object('slug',w.slug) from public.knowledge_worlds w
union all select 'category','category:'||md5(e.category),e.category,e.category,null,jsonb_build_object('category',e.category)
from (select distinct category from public.entries where status='published' and category is not null and category<>'') e
union all select 'media','media:'||m.id::text,coalesce(nullif(m.title,''),m.path),null,null,jsonb_build_object('entry_id',m.entry_id,'path',m.path,'source',m.source,'source_url',m.source_url,'source_type',m.source_type,'license',m.license)
from public.media m join public.entries e on e.id=m.entry_id and e.status='published' where m.status='approved' and m.review_state='verified'
union all select 'craft_process','craft:'||c.id::text,c.name_zh,c.category_name,c.description_zh,jsonb_build_object('slug',c.slug,'sequence',c.sequence,'category',c.category_name) from public.craft_processes c
union all select 'timeline','timeline:'||t.entry_id::text,coalesce(nullif(t.official_source_title,''),t.entry_id::text),t.historical_role,t.relationship_to_jingdezhen,jsonb_build_object('entry_id',t.entry_id)
from public.timeline_context t join public.entries e on e.id=t.entry_id and e.status='published'
union all select 'source','source:'||md5(x.url),x.label,null,null,jsonb_build_object('url',x.url)
from (select distinct nullif(trim(s->>'url'),'') url,coalesce(nullif(trim(s->>'label'),''),trim(s->>'url')) label from public.entries e cross join lateral jsonb_array_elements(case when jsonb_typeof(e.sources)='array' then e.sources when jsonb_typeof(e.sources)='string' then (e.sources #>> '{}')::jsonb else '[]'::jsonb end) s where e.status='published') x where x.url is not null;

create or replace view public.knowledge_graph_edges with (security_invoker = true) as
select 'entry:'||ew.entry_id::text,'world:'||ew.world_slug,case when ew.role='primary' then 'world_primary' else 'world_secondary' end,ew.rationale,ew.display_order,jsonb_build_object('role',ew.role) from public.entry_worlds ew join public.entries e on e.id=ew.entry_id and e.status='published'
union all select 'entry:'||e.id::text,'category:'||md5(e.category),'classified_as',null,0,jsonb_build_object('category',e.category) from public.entries e where e.status='published' and e.category is not null and e.category<>''
union all select 'entry:'||r.entry_id::text,'entry:'||r.related_entry_id::text,'entry_relation:'||r.relation_type,r.note,0,jsonb_build_object('relation_type',r.relation_type) from public.entry_relations r join public.entries a on a.id=r.entry_id and a.status='published' join public.entries b on b.id=r.related_entry_id and b.status='published'
union all select 'entry:'||m.entry_id::text,'media:'||m.id::text,'has_media',null,0,'{}'::jsonb from public.media m join public.entries e on e.id=m.entry_id and e.status='published' where m.status='approved' and m.review_state='verified'
union all select 'entry:'||x.entry_id::text,'craft:'||x.process_id::text,'craft_process:'||x.relation_type,x.note,0,jsonb_build_object('relation_type',x.relation_type) from public.entry_craft_processes x join public.entries e on e.id=x.entry_id and e.status='published'
union all select 'craft:'||r.process_id::text,'craft:'||r.related_process_id::text,'craft_relation:'||r.relation_type,r.note,0,jsonb_build_object('relation_type',r.relation_type) from public.craft_process_relations r
union all select 'entry:'||t.entry_id::text,'timeline:'||t.entry_id::text,'has_timeline_context',null,0,'{}'::jsonb from public.timeline_context t join public.entries e on e.id=t.entry_id and e.status='published';

revoke all on public.knowledge_graph_nodes from public;
revoke all on public.knowledge_graph_edges from public;
grant select on public.knowledge_graph_nodes to anon,authenticated;
grant select on public.knowledge_graph_edges to anon,authenticated;