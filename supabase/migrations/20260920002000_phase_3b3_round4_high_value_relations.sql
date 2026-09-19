INSERT INTO public.entry_relations(entry_id,related_entry_id,relation_type,note,evidence_grade)
SELECT p.id,o.id,'kiln','故宫博物院资料将郎廷极列为康熙时期景德镇御窑厂督陶官，并说明郎窑红因其姓氏得名；该关系直接连接人物与明清御窑厂遗址所代表的生产制度与空间。','A+'
FROM public.entries p, public.entries o
WHERE p.zh->>'title'='郎廷极' AND o.zh->>'title'='御窑厂遗址'
ON CONFLICT (entry_id,related_entry_id,relation_type) DO UPDATE SET note=EXCLUDED.note,evidence_grade=EXCLUDED.evidence_grade;

INSERT INTO public.entry_relations(entry_id,related_entry_id,relation_type,note,evidence_grade)
SELECT p.id,o.id,'kiln','故宫博物院资料将臧应选列为康熙时期景德镇御窑厂督陶官；该关系用于连接臧应选与其直接任职的御窑生产空间。','A+'
FROM public.entries p, public.entries o
WHERE p.zh->>'title'='臧应选' AND o.zh->>'title'='御窑厂遗址'
ON CONFLICT (entry_id,related_entry_id,relation_type) DO UPDATE SET note=EXCLUDED.note,evidence_grade=EXCLUDED.evidence_grade;

INSERT INTO public.entry_relations(entry_id,related_entry_id,relation_type,note,evidence_grade)
SELECT p.id,o.id,'kiln','故宫博物院资料将年希尧列为雍正时期景德镇御窑厂督陶官，并与唐英共同负责御窑事务；该关系直接连接年希尧与御窑厂遗址这一生产空间。','A+'
FROM public.entries p, public.entries o
WHERE p.zh->>'title'='年希尧' AND o.zh->>'title'='御窑厂遗址'
ON CONFLICT (entry_id,related_entry_id,relation_type) DO UPDATE SET note=EXCLUDED.note,evidence_grade=EXCLUDED.evidence_grade;

INSERT INTO public.entry_relations(entry_id,related_entry_id,relation_type,note,evidence_grade)
SELECT p.id,o.id,'person','文化部非遗资料记载黄云鹏长期从事青花瓷艺术创作、仿古瓷及古陶瓷研究，并以“元青花三顾茅庐纹罐”等为代表作品；该关系将人物与青花瓷知识节点直接连接。','A+'
FROM public.entries p, public.entries o
WHERE p.zh->>'title'='黄云鹏' AND o.zh->>'title'='青花瓷'
ON CONFLICT (entry_id,related_entry_id,relation_type) DO UPDATE SET note=EXCLUDED.note,evidence_grade=EXCLUDED.evidence_grade;
