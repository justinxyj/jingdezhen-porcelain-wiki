-- Keep evidence grade in the unified graph metadata.
-- Recommendation eligibility is grade-based, not note-length-based.
CREATE OR REPLACE VIEW public.knowledge_graph_edges
WITH (security_invoker = true)
AS
SELECT source_node_id,target_node_id,edge_type,rationale,display_order,metadata
FROM (
  -- Existing graph definition is preserved by the canonical view migration.
  -- This migration is intentionally a marker for the evidence-grade contract.
  SELECT 'entry:'::text || r.entry_id::text AS source_node_id,
         'entry:'::text || r.related_entry_id::text AS target_node_id,
         'entry_relation:'::text || r.relation_type AS edge_type,
         r.note AS rationale,
         0 AS display_order,
         jsonb_build_object('relation_type',r.relation_type,'evidence_grade',r.evidence_grade) AS metadata
  FROM public.entry_relations r
  JOIN public.entries a ON a.id=r.entry_id AND a.status='published'
  JOIN public.entries b ON b.id=r.related_entry_id AND b.status='published'
) q;

CREATE OR REPLACE VIEW public.knowledge_recommendations
WITH (security_invoker = true)
AS
SELECT source_node_id,target_node_id,target_label,target_category,edge_type,reason,weight
FROM (
  SELECT e.source_node_id,e.target_node_id,n.label AS target_label,n.category AS target_category,
         e.edge_type,COALESCE(e.rationale,e.metadata->>'relation_type') AS reason,
         CASE WHEN e.edge_type IN ('entry_relation:source','entry_relation:object') THEN 100
              WHEN e.edge_type='entry_relation:related' THEN 96 ELSE 94 END AS weight,
         row_number() OVER (
           PARTITION BY e.source_node_id,e.target_node_id
           ORDER BY CASE WHEN e.edge_type IN ('entry_relation:source','entry_relation:object') THEN 100
                         WHEN e.edge_type='entry_relation:related' THEN 96 ELSE 94 END DESC,
                    e.edge_type
         ) AS rn
  FROM public.knowledge_graph_edges e
  JOIN public.knowledge_graph_nodes n ON n.node_id=e.target_node_id
  WHERE e.source_node_id LIKE 'entry:%'
    AND e.target_node_id LIKE 'entry:%'
    AND e.edge_type IN ('entry_relation:source','entry_relation:object','entry_relation:related','entry_relation:person','entry_relation:kiln')
    AND e.metadata->>'evidence_grade' IN ('A+','A')
) x
WHERE rn=1;
