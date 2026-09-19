UPDATE public.entry_relations er
SET evidence_grade='B'
FROM public.entries p, public.entries t
WHERE er.entry_id=p.id AND er.related_entry_id=t.id
  AND er.relation_type='person'
  AND p.zh->>'title'='张松茂'
  AND t.zh->>'title'='粉彩瓷';
