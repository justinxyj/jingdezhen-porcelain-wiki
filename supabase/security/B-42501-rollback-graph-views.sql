-- =============================================================================
-- B-42501 ROLLBACK | restore knowledge_graph_nodes / edges to pre-B (media + filters)
-- DO NOT APPLY without 极光 approval
-- Forbidden: GRANT SELECT ON public.media TO anon
-- =============================================================================

CREATE OR REPLACE VIEW public.knowledge_graph_nodes
WITH (security_invoker = true) AS
WITH published_entries AS (
         SELECT entries.id,
            entries.slug,
            entries.category,
            COALESCE(entries.zh ->> 'title'::text, entries.slug) AS label,
            entries.zh ->> 'summary'::text AS summary
           FROM entries
          WHERE entries.status = 'published'::text
        ), categories AS (
         SELECT DISTINCT published_entries.category AS key,
            published_entries.category AS label
           FROM published_entries
          WHERE published_entries.category IS NOT NULL AND published_entries.category <> ''::text
        ), entry_sources AS (
         SELECT e.id AS entry_id,
            NULLIF(TRIM(BOTH FROM s.value ->> 'url'::text), ''::text) AS url,
            COALESCE(NULLIF(TRIM(BOTH FROM s.value ->> 'label'::text), ''::text), TRIM(BOTH FROM s.value ->> 'url'::text)) AS label
           FROM entries e
             CROSS JOIN LATERAL jsonb_array_elements(
                CASE
                    WHEN jsonb_typeof(e.sources) = 'array'::text THEN e.sources
                    WHEN jsonb_typeof(e.sources) = 'string'::text THEN (e.sources #>> '{}'::text[])::jsonb
                    ELSE '[]'::jsonb
                END) s(value)
          WHERE e.status = 'published'::text
        ), all_sources AS (
         SELECT entry_sources.url,
            entry_sources.label
           FROM entry_sources
          WHERE entry_sources.url IS NOT NULL
        UNION ALL
         SELECT NULLIF(TRIM(BOTH FROM m.source_url), ''::text) AS "nullif",
            COALESCE(NULLIF(TRIM(BOTH FROM m.source), ''::text), NULLIF(TRIM(BOTH FROM m.source_type), ''::text), TRIM(BOTH FROM m.source_url)) AS "coalesce"
           FROM public.media m
             JOIN entries e ON e.id = m.entry_id AND e.status = 'published'::text
          WHERE m.status = 'approved'::text AND m.review_state = 'verified'::text AND NULLIF(TRIM(BOTH FROM m.source_url), ''::text) IS NOT NULL
        UNION ALL
         SELECT NULLIF(TRIM(BOTH FROM cp.source_url), ''::text) AS "nullif",
            COALESCE(NULLIF(TRIM(BOTH FROM cp.source_title), ''::text), TRIM(BOTH FROM cp.source_url)) AS "coalesce"
           FROM craft_processes cp
          WHERE NULLIF(TRIM(BOTH FROM cp.source_url), ''::text) IS NOT NULL
        UNION ALL
         SELECT NULLIF(TRIM(BOTH FROM t.official_source_url), ''::text) AS "nullif",
            COALESCE(NULLIF(TRIM(BOTH FROM t.official_source_title), ''::text), TRIM(BOTH FROM t.official_source_url)) AS "coalesce"
           FROM timeline_context t
             JOIN entries e ON e.id = t.entry_id AND e.status = 'published'::text
          WHERE NULLIF(TRIM(BOTH FROM t.official_source_url), ''::text) IS NOT NULL
        ), sources AS (
         SELECT DISTINCT ON (all_sources.url) all_sources.url,
            COALESCE(all_sources.label, all_sources.url) AS label
           FROM all_sources
          WHERE all_sources.url IS NOT NULL
          ORDER BY all_sources.url, (COALESCE(all_sources.label, all_sources.url))
        ), worlds AS (
         SELECT knowledge_worlds.slug,
            knowledge_worlds.title AS label,
            knowledge_worlds.description AS summary
           FROM knowledge_worlds
        ), media AS (
         SELECT m.id,
            m.entry_id,
            COALESCE(NULLIF(m.title, ''::text), m.path) AS label,
            m.path,
            m.source,
            m.source_url,
            m.source_type,
            m.license
           FROM public.media m
             JOIN entries e ON e.id = m.entry_id AND e.status = 'published'::text
          WHERE m.status = 'approved'::text AND m.review_state = 'verified'::text
        ), craft AS (
         SELECT craft_processes.id,
            craft_processes.slug,
            craft_processes.name_zh AS label,
            craft_processes.description_zh AS summary,
            craft_processes.category_name,
            craft_processes.sequence
           FROM craft_processes
        ), timeline AS (
         SELECT t.entry_id,
            COALESCE(NULLIF(t.official_source_title, ''::text), t.entry_id::text) AS label,
            t.historical_role,
            t.relationship_to_jingdezhen
           FROM timeline_context t
             JOIN entries e ON e.id = t.entry_id AND e.status = 'published'::text
        )
 SELECT 'entry'::text AS node_type,
    'entry:'::text || published_entries.id::text AS node_id,
    published_entries.label,
    published_entries.category,
    published_entries.summary,
    jsonb_build_object('slug', published_entries.slug, 'category', published_entries.category) AS metadata
   FROM published_entries
UNION ALL
 SELECT 'world'::text AS node_type,
    'world:'::text || worlds.slug AS node_id,
    worlds.label,
    NULL::text AS category,
    worlds.summary,
    jsonb_build_object('slug', worlds.slug) AS metadata
   FROM worlds
UNION ALL
 SELECT 'category'::text AS node_type,
    'category:'::text || md5(categories.key) AS node_id,
    categories.label,
    categories.key AS category,
    NULL::text AS summary,
    jsonb_build_object('category', categories.key) AS metadata
   FROM categories
UNION ALL
 SELECT 'source'::text AS node_type,
    'source:'::text || md5(sources.url) AS node_id,
    sources.label,
    NULL::text AS category,
    NULL::text AS summary,
    jsonb_build_object('url', sources.url) AS metadata
   FROM sources
UNION ALL
 SELECT 'media'::text AS node_type,
    'media:'::text || media.id::text AS node_id,
    media.label,
    NULL::text AS category,
    NULL::text AS summary,
    jsonb_build_object('entry_id', media.entry_id, 'path', media.path, 'source', media.source, 'source_url', media.source_url, 'source_type', media.source_type, 'license', media.license) AS metadata
   FROM media
UNION ALL
 SELECT 'craft_process'::text AS node_type,
    'craft:'::text || craft.id::text AS node_id,
    craft.label,
    craft.category_name AS category,
    craft.summary,
    jsonb_build_object('slug', craft.slug, 'sequence', craft.sequence, 'category', craft.category_name) AS metadata
   FROM craft
UNION ALL
 SELECT 'timeline'::text AS node_type,
    'timeline:'::text || timeline.entry_id::text AS node_id,
    timeline.label,
    timeline.historical_role AS category,
    timeline.relationship_to_jingdezhen AS summary,
    jsonb_build_object('entry_id', timeline.entry_id) AS metadata
   FROM timeline;

CREATE OR REPLACE VIEW public.knowledge_graph_edges
WITH (security_invoker = true) AS
WITH published_entries AS (
         SELECT entries.id,
            entries.category,
            entries.status,
            entries.sources
           FROM entries
          WHERE entries.status = 'published'::text
        ), entry_sources AS (
         SELECT e.id AS entry_id,
            NULLIF(TRIM(BOTH FROM s.value ->> 'url'::text), ''::text) AS url,
            COALESCE(NULLIF(TRIM(BOTH FROM s.value ->> 'label'::text), ''::text), TRIM(BOTH FROM s.value ->> 'url'::text)) AS label
           FROM entries e
             CROSS JOIN LATERAL jsonb_array_elements(
                CASE
                    WHEN jsonb_typeof(e.sources) = 'array'::text THEN e.sources
                    WHEN jsonb_typeof(e.sources) = 'string'::text THEN (e.sources #>> '{}'::text[])::jsonb
                    ELSE '[]'::jsonb
                END) s(value)
          WHERE e.status = 'published'::text
        ), media AS (
         SELECT m.id,
            m.entry_id,
            m.source_url,
            m.source,
            m.source_type
           FROM public.media m
             JOIN published_entries e ON e.id = m.entry_id
          WHERE m.status = 'approved'::text AND m.review_state = 'verified'::text
        ), craft_links AS (
         SELECT ecp.entry_id,
            ecp.process_id,
            ecp.relation_type,
            ecp.note
           FROM entry_craft_processes ecp
             JOIN published_entries e ON e.id = ecp.entry_id
        ), world_links AS (
         SELECT ew.entry_id,
            ew.world_slug,
            ew.role,
            ew.rationale,
            ew.display_order
           FROM entry_worlds ew
             JOIN published_entries e ON e.id = ew.entry_id
        )
 SELECT 'entry:'::text || wl.entry_id::text AS source_node_id,
    'world:'::text || wl.world_slug AS target_node_id,
        CASE
            WHEN wl.role = 'primary'::text THEN 'world_primary'::text
            ELSE 'world_secondary'::text
        END AS edge_type,
    wl.rationale,
    wl.display_order,
    jsonb_build_object('role', wl.role) AS metadata
   FROM world_links wl
UNION ALL
 SELECT 'entry:'::text || e.id AS source_node_id,
    'category:'::text || md5(e.category) AS target_node_id,
    'classified_as'::text AS edge_type,
    NULL::text AS rationale,
    0 AS display_order,
    jsonb_build_object('category', e.category) AS metadata
   FROM published_entries e
  WHERE e.category IS NOT NULL AND e.category <> ''::text
UNION ALL
 SELECT 'entry:'::text || r.entry_id AS source_node_id,
    'entry:'::text || r.related_entry_id AS target_node_id,
    'entry_relation:'::text || r.relation_type AS edge_type,
    r.note AS rationale,
    0 AS display_order,
    jsonb_build_object('relation_type', r.relation_type, 'evidence_grade', r.evidence_grade) AS metadata
   FROM entry_relations r
     JOIN published_entries a ON a.id = r.entry_id
     JOIN published_entries b ON b.id = r.related_entry_id
UNION ALL
 SELECT 'entry:'::text || m.entry_id AS source_node_id,
    'media:'::text || m.id AS target_node_id,
    'has_media'::text AS edge_type,
    NULL::text AS rationale,
    0 AS display_order,
    jsonb_build_object('source_url', m.source_url, 'source', m.source, 'source_type', m.source_type) AS metadata
   FROM media m
UNION ALL
 SELECT 'entry:'::text || cl.entry_id AS source_node_id,
    'craft:'::text || cl.process_id AS target_node_id,
    'craft_process:'::text || cl.relation_type AS edge_type,
    cl.note AS rationale,
    0 AS display_order,
    jsonb_build_object('relation_type', cl.relation_type) AS metadata
   FROM craft_links cl
UNION ALL
 SELECT 'craft:'::text || r.process_id AS source_node_id,
    'craft:'::text || r.related_process_id AS target_node_id,
    'craft_relation:'::text || r.relation_type AS edge_type,
    r.note AS rationale,
    0 AS display_order,
    jsonb_build_object('relation_type', r.relation_type) AS metadata
   FROM craft_process_relations r
UNION ALL
 SELECT 'entry:'::text || t.entry_id AS source_node_id,
    'timeline:'::text || t.entry_id AS target_node_id,
    'has_timeline_context'::text AS edge_type,
    NULL::text AS rationale,
    0 AS display_order,
    '{}'::jsonb AS metadata
   FROM timeline_context t
     JOIN published_entries e ON e.id = t.entry_id
UNION ALL
 SELECT 'entry:'::text || s.entry_id AS source_node_id,
    'source:'::text || md5(s.url) AS target_node_id,
    'cites_source'::text AS edge_type,
    s.label AS rationale,
    0 AS display_order,
    jsonb_build_object('url', s.url) AS metadata
   FROM entry_sources s
  WHERE s.url IS NOT NULL
UNION ALL
 SELECT 'media:'::text || m.id AS source_node_id,
    'source:'::text || md5(m.source_url) AS target_node_id,
    'media_source'::text AS edge_type,
    m.source AS rationale,
    0 AS display_order,
    jsonb_build_object('url', m.source_url, 'source_type', m.source_type) AS metadata
   FROM media m
  WHERE NULLIF(TRIM(BOTH FROM m.source_url), ''::text) IS NOT NULL
UNION ALL
 SELECT 'craft:'::text || cp.id AS source_node_id,
    'source:'::text || md5(cp.source_url) AS target_node_id,
    'craft_source'::text AS edge_type,
    cp.source_title AS rationale,
    0 AS display_order,
    jsonb_build_object('url', cp.source_url) AS metadata
   FROM craft_processes cp
  WHERE NULLIF(TRIM(BOTH FROM cp.source_url), ''::text) IS NOT NULL
UNION ALL
 SELECT 'timeline:'::text || t.entry_id AS source_node_id,
    'source:'::text || md5(t.official_source_url) AS target_node_id,
    'timeline_source'::text AS edge_type,
    t.official_source_title AS rationale,
    0 AS display_order,
    jsonb_build_object('url', t.official_source_url) AS metadata
   FROM timeline_context t
     JOIN published_entries e ON e.id = t.entry_id
  WHERE NULLIF(TRIM(BOTH FROM t.official_source_url), ''::text) IS NOT NULL;

COMMENT ON VIEW public.knowledge_graph_nodes IS
  'Rolled back from B-42501; reads public.media with approved/verified filters; security_invoker kept';
COMMENT ON VIEW public.knowledge_graph_edges IS
  'Rolled back from B-42501; reads public.media with approved/verified filters; security_invoker kept';
