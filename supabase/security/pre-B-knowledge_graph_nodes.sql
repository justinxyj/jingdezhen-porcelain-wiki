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
