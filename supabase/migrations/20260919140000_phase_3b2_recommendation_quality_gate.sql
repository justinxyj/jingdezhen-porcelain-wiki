-- Phase 3B-2 recommendation quality gate
create or replace view public.knowledge_recommendations with (security_invoker=true) as
with direct as (
 select e.source_node_id,e.target_node_id,e.edge_type,
        coalesce(e.rationale,e.metadata->>'relation_type') reason,
        case when e.edge_type in ('entry_relation:source','entry_relation:object') then 100
             when e.edge_type='entry_relation:related' then 96 else 94 end weight
 from public.knowledge_graph_edges e
 where e.source_node_id like 'entry:%' and e.target_node_id like 'entry:%'
 and (
   e.edge_type in ('entry_relation:source','entry_relation:object')
   or (e.edge_type='entry_relation:related' and length(trim(coalesce(e.rationale,'')))>=8)
   or (e.edge_type in ('entry_relation:person','entry_relation:kiln')
       and length(trim(coalesce(e.rationale,'')))>=12
       and coalesce(e.rationale,'') not in ('人物—知识关联','人物与相关知识关联','历史—窑址关联','基础知识关联'))
 ),
 ranked as (
   select c.*,row_number() over(partition by c.source_node_id,c.target_node_id order by c.weight desc,c.edge_type) rn
   from direct c
 )
 select r.source_node_id,r.target_node_id,n.label target_label,n.category target_category,
        r.edge_type,r.reason,r.weight
 from ranked r
 join public.knowledge_graph_nodes n on n.node_id=r.target_node_id
 where r.rn=1;
revoke all on public.knowledge_recommendations from public;
grant select on public.knowledge_recommendations to anon,authenticated;