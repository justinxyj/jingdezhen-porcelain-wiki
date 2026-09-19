-- Phase 4E-5 Round 2: A+/A person ↔ object audit
-- Only add person-object links where an institutional source directly supports the object-domain relation.
INSERT INTO public.entry_relations(entry_id,related_entry_id,relation_type,note,evidence_grade)
SELECT p.id,o.id,'person',
       '故宫博物院资料明确说明郎窑红釉因康熙时期郎廷极督理景德镇窑务而得名；郎窑红属于颜色釉/红釉体系。该关系将人物与颜色釉瓷这一现有知识节点直接连接。',
       'A+'
FROM public.entries p, public.entries o
WHERE p.zh->>'title'='郎廷极' AND o.zh->>'title'='颜色釉瓷'
  AND p.status='published' AND o.status='published'
  AND NOT EXISTS (
    SELECT 1 FROM public.entry_relations r
    WHERE r.entry_id=p.id AND r.related_entry_id=o.id
  );

INSERT INTO public.entry_relations(entry_id,related_entry_id,relation_type,note,evidence_grade)
SELECT p.id,o.id,'person',
       '故宫博物院资料记载雍正时期唐英驻景德镇御窑厂主持窑务，并记载御窑厂仿古创新的釉彩品种达到57种；该关系用于连接唐英与颜色釉瓷这一现有知识节点。',
       'A'
FROM public.entries p, public.entries o
WHERE p.zh->>'title'='唐英' AND o.zh->>'title'='颜色釉瓷'
  AND p.status='published' AND o.status='published'
  AND NOT EXISTS (
    SELECT 1 FROM public.entry_relations r
    WHERE r.entry_id=p.id AND r.related_entry_id=o.id
  );
