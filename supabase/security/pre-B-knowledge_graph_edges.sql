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
