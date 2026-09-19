-- Phase 3A patch: source becomes a first-class graph node across all public source channels.
create or replace view public.knowledge_graph_nodes with (security_invoker = true) as
with published_entries as (select id,slug,category,coalesce(zh->>'title',slug) label,zh->>'summary' summary from public.entries where status='published'),
categories as (select distinct category key,category label from published_entries where category is not null and category<>''),
entry_sources as (
 select e.id entry_id,nullif(trim(s->>'url'),'') url,coalesce(nullif(trim(s->>'label'),''),trim(s->>'url')) label
 from public.entries e cross join lateral jsonb_array_elements(case when jsonb_typeof(e.sources)='array' then e.sources when jsonb_typeof(e.sources)='string' then (e.sources #>> '{}')::jsonb else '[]'::jsonb end) s
 where e.status='published'),
all_sources as (
 select url,label from entry_sources where url is not null
 union all select nullif(trim(m.source_url),''),coalesce(nullif(trim(m.source),''),nullif(trim(m.source_type),''),trim(m.source_url)) from public.media m join public.entries e on e.id=m.entry_id and e.status='published' where m.status='approved' and m.review_state='verified' and nullif(trim(m.source_url),'') is not null
 union all select nullif(trim(c.source_url),''),coalesce(nullif(trim(c.source_title),''),trim(c.source_url)) from public.craft_processes c where nullif(trim(c.source_url),'') is not null
 union all select nullif(trim(t.official_source_url),''),coalesce(nullif(trim(t.official_source_title),''),trim(t.official_source_url)) from public.timeline_context t join public.entries e on e.id=t.entry_id and e.status='published' where nullif(trim(t.official_source_url),'') is not null),
sources as (select distinct on (url) url,coalesce(label,url) label from all_sources where url is not null order by url,label),
worlds as (select slug,title label,description summary from public.knowledge_worlds),
media as (select m.id,m.entry_id,coalesce(nullif(m.title,''),m.path) label,m.path,m.source,m.source_url,m.source_type,m.license from public.media m join public.entries e on e.id=m.entry_id and e.status='published' where m.status='approved' and m.review_state='verified'),
craft as (select id,slug,name_zh label,description_zh summary,category_name,sequence from public.craft_processes),
timeline as (select t.entry_id,coalesce(nullif(t.official_source_title,''),t.entry_id::text) label,t.historical_role,t.relationship_to_jingdezhen from public.timeline_context t join public.entries e on e.id=t.entry_id and e.status='published')
select 'entry' node_type,'entry:'||id::text node_id,label,category,summary,jsonb_build_object('slug',slug,'category',category) metadata from published_entries
union all select 'world','world:'||slug,label,null,summary,jsonb_build_object('slug',slug) from worlds
union all select 'category','category:'||md5(key),label,key,null,jsonb_build_object('category',key) from categories
union all select 'source','source:'||md5(url),label,null,null,jsonb_build_object('url',url) from sources
union all select 'media','media:'||id::text,label,null,null,jsonb_build_object('entry_id',entry_id,'path',path,'source',source,'source_url',source_url,'source_type',source_type,'license',license) from media
union all select 'craft_process','craft:'||id::text,label,category_name,summary,jsonb_build_object('slug',slug,'sequence',sequence,'category',category_name) from craft
union all select 'timeline','timeline:'||entry_id::text,label,historical_role,relationship_to_jingdezhen,jsonb_build_object('entry_id',entry_id) from timeline;
revoke all on public.knowledge_graph_nodes from public;
grant select on public.knowledge_graph_nodes to anon,authenticated;