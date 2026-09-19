ALTER TABLE public.entry_relations
  ADD COLUMN IF NOT EXISTS evidence_grade text
  CHECK (evidence_grade IN ('A+','A','B','C','D'));

UPDATE public.entry_relations
SET evidence_grade = CASE
  WHEN relation_type IN ('source','object') THEN 'A'
  WHEN relation_type = 'related' AND length(trim(coalesce(note,''))) >= 8 THEN 'A'
  WHEN relation_type IN ('person','kiln')
       AND length(trim(coalesce(note,''))) >= 12
       AND trim(coalesce(note,'')) NOT IN ('人物—知识关联','人物与相关知识关联','历史—窑址关联','基础知识关联')
    THEN 'A'
  ELSE 'C'
END
WHERE evidence_grade IS NULL;

DELETE FROM public.entry_relations
WHERE relation_type = 'person'
  AND trim(coalesce(note,'')) IN ('人物—知识关联','人物与相关知识关联');

INSERT INTO public.entry_relations(entry_id, related_entry_id, relation_type, note, evidence_grade)
SELECT p.id, o.id, 'person',
       '故宫博物院藏品资料将雍正仿钧新紫釉天球瓶置于景德镇清代御窑生产背景，并记载唐英自雍正六年驻景德镇御窑厂任协理官、长期管理窑务；该关系用于连接唐英与雍正时期御窑器物体系。',
       'A'
FROM public.entries p
JOIN public.entries o ON o.zh->>'title' = '雍正仿钧新紫釉天球瓶'
WHERE p.zh->>'title' = '唐英'
ON CONFLICT (entry_id, related_entry_id, relation_type)
DO UPDATE SET note=EXCLUDED.note,evidence_grade=EXCLUDED.evidence_grade;
