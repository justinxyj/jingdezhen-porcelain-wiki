-- Phase 4E-5 craft relation deep audit
DELETE FROM public.entry_craft_processes
WHERE note LIKE '%完整生产链%'
   OR note LIKE '%72步总关联%'
   OR note LIKE '%技术链继续存在%'
   OR note LIKE '%后段工序%';

WITH pairs(entry_title,process_name,relation_type) AS (
 VALUES
 ('青花瓷','选青料','uses'),('青花瓷','研青料','uses'),('青花瓷','调青花','uses'),('青花瓷','画坯','uses'),('青花瓷','施釉','uses'),('青花瓷','烧窑','uses'),
 ('青白瓷','淘洗','uses'),('青白瓷','拉坯','uses'),('青白瓷','印坯','uses'),('青白瓷','修坯','uses'),('青白瓷','刻坯','uses'),('青白瓷','划花','uses'),('青白瓷','印花','uses'),('青白瓷','施釉','uses'),('青白瓷','烧窑','uses'),
 ('成化斗彩鸡缸杯','画坯','uses'),('成化斗彩鸡缸杯','施釉','uses'),('成化斗彩鸡缸杯','烧窑','uses'),
 ('颜色釉瓷','施釉','uses'),('颜色釉瓷','烧窑','uses')
)
INSERT INTO public.entry_craft_processes(entry_id,process_id,relation_type,note,source_url,source_institution,source_tier,reviewed_at,source_title)
SELECT e.id,cp.id,p.relation_type,
 CASE WHEN p.entry_title='成化斗彩鸡缸杯' THEN '故宫博物院资料明确该器为成化景德镇御窑厂斗彩器，并记录青花、釉彩及烧制工艺。'
      WHEN p.entry_title='青白瓷' THEN '景德镇市政府非遗资料明确将该工序列入青白瓷制作技艺流程。'
      WHEN p.entry_title='青花瓷' THEN '景德镇市政府资料明确将该工序纳入青花制作中的青料处理、坯上描绘、施釉或烧成环节。'
      ELSE '景德镇市政府非遗体系将颜色釉列为传统烧制技艺；该工序与施釉或烧成直接对应。' END,
 CASE WHEN p.entry_title='成化斗彩鸡缸杯' THEN 'https://intl.dpm.org.cn/Ceramicsis/852.html'
      ELSE 'https://jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml' END,
 CASE WHEN p.entry_title='成化斗彩鸡缸杯' THEN '故宫博物院' ELSE '景德镇市人民政府' END,
 1,now(),
 CASE WHEN p.entry_title='成化斗彩鸡缸杯' THEN '成化款斗彩鸡缸杯' ELSE '《景德镇陶瓷文化生态保护区总体规划（2021－2035年）》' END
FROM pairs p
JOIN public.entries e ON e.zh->>'title'=p.entry_title AND e.status='published'
JOIN public.craft_processes cp ON cp.name_zh=p.process_name
WHERE NOT EXISTS (SELECT 1 FROM public.entry_craft_processes z WHERE z.entry_id=e.id AND z.process_id=cp.id);

WITH pairs(entry_title,process_name) AS (
 VALUES
 ('御窑厂遗址','匣土配制'),('御窑厂遗址','制匣钵'),('御窑厂遗址','修匣钵'),('御窑厂遗址','装坯'),('御窑厂遗址','满窑'),('御窑厂遗址','把桩'),('御窑厂遗址','驮坯'),('御窑厂遗址','架表'),('御窑厂遗址','点火'),('御窑厂遗址','烧窑'),('御窑厂遗址','收兜脚'),('御窑厂遗址','停火冷却')
)
INSERT INTO public.entry_craft_processes(entry_id,process_id,relation_type,note,source_url,source_institution,source_tier,reviewed_at,source_title)
SELECT e.id,cp.id,'historically_important_for',
 '景德镇市政府/故宫考古资料将该工序列入传统窑炉烧成体系，并将御窑厂遗址作为明清御窑生产与窑具考古空间；该关系用于建立工序与遗址的直接空间连接。',
 CASE WHEN p.process_name IN ('制匣钵','修匣钵') THEN 'https://img.dpm.org.cn/Uploads/File/2019/07/25/u5d394a6f171f3.pdf' ELSE 'https://jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml' END,
 CASE WHEN p.process_name IN ('制匣钵','修匣钵') THEN '故宫博物院' ELSE '景德镇市人民政府' END,
 1,now(),
 CASE WHEN p.process_name IN ('制匣钵','修匣钵') THEN '近年御窑厂遗址的考古发掘' ELSE '《景德镇陶瓷文化生态保护区总体规划（2021－2035年）》' END
FROM pairs p
JOIN public.entries e ON e.zh->>'title'=p.entry_title AND e.status='published'
JOIN public.craft_processes cp ON cp.name_zh=p.process_name
WHERE NOT EXISTS (SELECT 1 FROM public.entry_craft_processes z WHERE z.entry_id=e.id AND z.process_id=cp.id);

WITH pairs(entry_title,process_name) AS (
 VALUES
 ('王步','画坯'),
 ('黄云鹏','配料'),('黄云鹏','选青料'),('黄云鹏','研青料'),('黄云鹏','调青花'),('黄云鹏','画坯'),
 ('唐英','配料'),('唐英','施釉'),('唐英','烧窑')
)
INSERT INTO public.entry_craft_processes(entry_id,process_id,relation_type,note,source_url,source_institution,source_tier,reviewed_at,source_title)
SELECT e.id,cp.id,'specializes_in',
 CASE WHEN p.entry_title='王步' THEN '文化和旅游部博物馆资料将王步列为近代景德镇瓷绘名家；其青花瓷绘特长与画坯工序直接对应。'
      WHEN p.entry_title='黄云鹏' THEN '文化部资料记载黄云鹏学习青花绘瓷技法、长期从事青花创作，并熟练配制泥、釉和青花颜料；该工序与其公开技艺记录直接对应。'
      ELSE '景德镇地方志资料记载唐英亲领窑务，掌握原料精选、釉料配方和烧窑火候；该工序与其制瓷实践直接对应。' END,
 CASE WHEN p.entry_title='王步' THEN 'https://www.mct.gov.cn/ggfw/zyjzzt/zhanlan/zhanlanwqhg/202101/t20210111_920648.html'
      WHEN p.entry_title='黄云鹏' THEN 'https://www.mct.gov.cn/preview/special/3415/3423/201202/t20120206_228944.html'
      ELSE 'https://www.jdz.gov.cn/zsnj/jdzsz/jdzszdwj/rwz/rwc/P020201114583753053261.pdf' END,
 CASE WHEN p.entry_title='王步' THEN '文化和旅游部恭王府博物馆' WHEN p.entry_title='黄云鹏' THEN '文化和旅游部' ELSE '景德镇市人民政府' END,
 1,now(),
 CASE WHEN p.entry_title='王步' THEN '月圆逸韵——景德镇珠山八友主题瓷绘作品特展' WHEN p.entry_title='黄云鹏' THEN '景德镇手工制瓷技艺' ELSE '《景德镇市志·人物志》' END
FROM pairs p
JOIN public.entries e ON e.zh->>'title'=p.entry_title AND e.status='published'
JOIN public.craft_processes cp ON cp.name_zh=p.process_name
WHERE NOT EXISTS (SELECT 1 FROM public.entry_craft_processes z WHERE z.entry_id=e.id AND z.process_id=cp.id);
