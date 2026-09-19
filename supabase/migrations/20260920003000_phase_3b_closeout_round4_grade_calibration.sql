-- Phase 3B closeout: persist final Round 4 evidence-grade calibration.
-- No new recommendation logic is introduced here; A+/A remains the production gate.

UPDATE public.entry_relations er
SET evidence_grade = 'A+'
FROM public.entries p, public.entries o
WHERE er.entry_id = p.id
  AND er.related_entry_id = o.id
  AND (
    (p.zh->>'title'='郎廷极' AND o.zh->>'title'='御窑厂遗址')
    OR (p.zh->>'title'='年希尧' AND o.zh->>'title'='御窑厂遗址')
    OR (p.zh->>'title'='臧应选' AND o.zh->>'title'='御窑厂遗址')
    OR (p.zh->>'title'='黄云鹏' AND o.zh->>'title'='青花瓷')
  );
