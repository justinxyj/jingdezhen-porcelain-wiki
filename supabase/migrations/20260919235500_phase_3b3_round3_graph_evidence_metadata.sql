-- Preserve the unified knowledge graph and expose relation evidence grades.
CREATE OR REPLACE VIEW public.knowledge_graph_edges
WITH (security_invoker = true)
AS
WITH published_entries AS (
 SELECT id,category,status,sources FROM public.entries WHERE status='published'
),
entry_sources AS (
 SELECT e.id AS entry_id,NULLIF(TRIM(s.value->>'url'),'') AS url,
        COALESCE(NULLIF(TRIM(s.value->>'label'),''),TRIM(s.value->>'url')) AS label
 FROM public.entries e
 CROSS JOIN LATERAL jsonb_array_elements(
   CASE WHEN jsonb_typeof(e.sources)='array' THEN e.sources
        WHEN jsonb_typeof(e.sources)='string' THEN (e.sources #>> '{}')::jsonb
        ELSE '[]'::jsonb END) s(value)
 WHERE e.status='published'
),
media AS (
 SELECT m.id,m.entry_id,m.source_url,m.source,m.source_type
 FROM public.media m JOIN published_entries e ON e.id=m.entry_id
 WHERE m.status='approved' AND m.review_state='verified'
),
craft_links AS (
 SELECT ecp.entry_id,ecp.process_id,ecp.relation_type,ecp.note
 FROM public.entry_craft_processes ecp JOIN published_entries e ON e.id=ecp.entry_id
),
world_links AS (
 SELECT ew.entry_id,ew.world_slug,ew.role,ew.rationale,ew.display_order
 FROM public.entry_worlds ew JOIN published_entries e ON e.id=ew.entry_id
)
SELECT 'entry:'||wl.entry_id::text AS source_node_id,'world:'||wl.world_slug AS target_node_id,
 CASE WHEN wl.role='primary' THEN 'world_primary' ELSE 'world_secondary' END AS edge_type,
 wl.rationale AS rationale,wl.display_order AS display_order,
 jsonb_build_object('role',wl.role) AS metadata
FROM world_links wl
UNION ALL
SELECT 'entry:'||e.id,'category:'||md5(e.category),'classified_as',NULL::text,0,
 jsonb_build_object('category',e.category)
FROM published_entries e WHERE e.category IS NOT NULL AND e.category<>''
UNION ALL
SELECT 'entry:'||r.entry_id,'entry:'||r.related_entry_id,'entry_relation:'||r.relation_type,
 r.note,0,jsonb_build_object('relation_type',r.relation_type,'evidence_grade',r.evidence_grade)
FROM public.entry_relations r
JOIN published_entries a ON a.id=r.entry_id JOIN published_entries b ON b.id=r.related_entry_id
UNION ALL
SELECT 'entry:'||m.entry_id,'media:'||m.id,'has_media',NULL::text,0,
 jsonb_build_object('source_url',m.source_url,'source',m.source,'source_type',m.source_type)
FROM media m
UNION ALL
SELECT 'entry:'||cl.entry_id,'craft:'||cl.process_id,'craft_process:'||cl.relation_type,
 cl.note,0,jsonb_build_object('relation_type',cl.relation_type)
FROM craft_links cl
UNION ALL
SELECT 'craft:'||r.process_id,'craft:'||r.related_process_id,'craft_relation:'||r.relation_type,
 r.note,0,jsonb_build_object('relation_type',r.relation_type)
FROM public.craft_process_relations r
UNION ALL
SELECT 'entry:'||t.entry_id,'timeline:'||t.entry_id,'has_timeline_context',NULL::text,0,'{}'::jsonb
FROM public.timeline_context t JOIN published_entries e ON e.id=t.entry_id
UNION ALL
SELECT 'entry:'||s.entry_id,'source:'||md5(s.url),'cites_source',s.label,0,jsonb_build_object('url',s.url)
FROM entry_sources s WHERE s.url IS NOT NULL
UNION ALL
SELECT 'media:'||m.id,'source:'||md5(m.source_url),'media_source',m.source,0,
 jsonb_build_object('url',m.source_url,'source_type',m.source_type)
FROM media m WHERE NULLIF(TRIM(m.source_url),'') IS NOT NULL
UNION ALL
SELECT 'craft:'||cp.id,'source:'||md5(cp.source_url),'craft_source',cp.source_title,0,
 jsonb_build_object('url',cp.source_url)
FROM public.craft_processes cp WHERE NULLIF(TRIM(cp.source_url),'') IS NOT NULL
UNION ALL
SELECT 'timeline:'||t.entry_id,'source:'||md5(t.official_source_url),'timeline_source',
 t.official_source_title,0,jsonb_build_object('url',t.official_source_url)
FROM public.timeline_context t JOIN published_entries e ON e.id=t.entry_id
WHERE NULLIF(TRIM(t.official_source_url),'') IS NOT NULL;

CREATE OR REPLACE VIEW public.knowledge_recommendations
WITH (security_invoker = true)
AS
WITH direct AS (
 SELECT e.source_node_id,e.target_node_id,e.edge_type,
        COALESCE(e.rationale,e.metadata->>'relation_type') AS reason,
        CASE WHEN e.edge_type IN ('entry_relation:source','entry_relation:object') THEN 100
             WHEN e.edge_type='entry_relation:related' THEN 96 ELSE 94 END AS weight
 FROM public.knowledge_graph_edges e
 WHERE e.source_node_id LIKE 'entry:%' AND e.target_node_id LIKE 'entry:%'
   AND e.edge_type IN ('entry_relation:source','entry_relation:object','entry_relation:related','entry_relation:person','entry_relation:kiln')
   AND e.metadata->>'evidence_grade' IN ('A+','A')
),
ranked AS (
 SELECT c.*,row_number() OVER(PARTITION BY c.source_node_id,c.target_node_id ORDER BY c.weight DESC,c.edge_type) rn
 FROM direct c
)
SELECT r.source_node_id,r.target_node_id,n.label AS target_label,n.category AS target_category,
 r.edge_type,r.reason,r.weight
FROM ranked r JOIN public.knowledge_graph_nodes n ON n.node_id=r.target_node_id
WHERE r.rn=1;
