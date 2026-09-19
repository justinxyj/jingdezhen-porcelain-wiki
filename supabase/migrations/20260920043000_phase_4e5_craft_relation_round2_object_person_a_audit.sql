-- Phase 4E-5 Round 2: concrete object/process evidence
-- Evidence gate: only direct museum collection records are admitted here.
WITH pairs(entry_title,process_name,note,url,institution,title) AS (
 VALUES
 ('景德镇窑青花莲池纹瓶（Met 1991.253.33）','画坯','The Met 明确记录该器为景德镇窑、釉下钴蓝绘制的元代青花器；画坯是其直接装饰工序。','https://www.metmuseum.org/art/collection/search/42490','大都会艺术博物馆','Vase with lotus pond scene / 1991.253.33'),
 ('景德镇窑青花莲池纹瓶（Met 1991.253.33）','施釉','The Met 明确记录该器为釉下钴蓝绘制的景德镇窑瓷器；青花绘制后施透明釉的工艺与该器物直接对应。','https://www.metmuseum.org/art/collection/search/42490','大都会艺术博物馆','Vase with lotus pond scene / 1991.253.33'),
 ('景德镇窑青花莲池纹瓶（Met 1991.253.33）','烧窑','The Met 明确记录该器为元代景德镇窑青花瓷；其釉下钴蓝工艺对应高温烧成阶段。','https://www.metmuseum.org/art/collection/search/42490','大都会艺术博物馆','Vase with lotus pond scene / 1991.253.33'),
 ('元青花折枝花纹八棱瓶','画坯','The Met 明确记录该器为元代景德镇窑、釉下钴蓝绘制的八棱瓶；画坯是其直接装饰工序。','https://www.metmuseum.org/art/collection/search/42491','大都会艺术博物馆','Faceted vase with flowers / 1991.253.34'),
 ('元青花折枝花纹八棱瓶','施釉','The Met 明确记录该器为釉下钴蓝绘制的景德镇窑瓷器；青花绘制后施透明釉的工艺与该器物直接对应。','https://www.metmuseum.org/art/collection/search/42491','大都会艺术博物馆','Faceted vase with flowers / 1991.253.34'),
 ('元青花折枝花纹八棱瓶','烧窑','The Met 明确记录该器为元代景德镇窑青花瓷；其釉下钴蓝工艺对应高温烧成阶段。','https://www.metmuseum.org/art/collection/search/42491','大都会艺术博物馆','Faceted vase with flowers / 1991.253.34'),
 ('宣德青花龙纹盘','画坯','The Met 明确记录该器为宣德时期景德镇窑、透明釉下钴蓝绘制的青花盘；画坯是其直接装饰工序。','https://www.metmuseum.org/art/collection/search/42497','大都会艺术博物馆','Dish with dragon amid waves / 1975.99'),
 ('宣德青花龙纹盘','施釉','The Met 明确记录该器为“cobalt blue under transparent glaze”的景德镇窑瓷器；施透明釉是其直接工艺环节。','https://www.metmuseum.org/art/collection/search/42497','大都会艺术博物馆','Dish with dragon amid waves / 1975.99'),
 ('宣德青花龙纹盘','烧窑','The Met 明确记录该器为宣德时期景德镇窑青花瓷；其釉下钴蓝工艺对应烧成阶段。','https://www.metmuseum.org/art/collection/search/42497','大都会艺术博物馆','Dish with dragon amid waves / 1975.99'),
 ('雍正仿钧新紫釉天球瓶','施釉','The Met 明确记录该器为雍正时期景德镇窑、施有“new purple”仿钧釉的天球瓶；施釉与该器物直接对应。','https://www.metmuseum.org/art/collection/search/46080','大都会艺术博物馆','Bottle vase / 14.40.163')
)
INSERT INTO public.entry_craft_processes
(entry_id,process_id,relation_type,note,source_url,source_institution,source_tier,reviewed_at,source_title)
SELECT e.id,cp.id,'uses',p.note,p.url,p.institution,1,now(),p.title
FROM pairs p
JOIN public.entries e ON e.zh->>'title'=p.entry_title AND e.status='published'
JOIN public.craft_processes cp ON cp.name_zh=p.process_name
WHERE NOT EXISTS (
 SELECT 1 FROM public.entry_craft_processes z
 WHERE z.entry_id=e.id AND z.process_id=cp.id
);

-- Person deep-dive result:
-- Do not force 王琦、田鹤仙、王锡良 into the current 72-step taxonomy.
-- Official records establish concrete粉彩作品 and authorship, but the current process list
-- lacks a dedicated “粉彩绘制/填彩/彩烧” node. Their concrete work links are therefore
-- recorded as canonical-content admission candidates, not fabricated process edges.
