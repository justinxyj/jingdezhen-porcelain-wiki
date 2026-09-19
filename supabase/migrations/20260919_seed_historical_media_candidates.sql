-- Historical media candidate + source metadata seed.
BEGIN;

UPDATE public.entries e
SET sources = jsonb_build_array(jsonb_build_object(
  'title',tc.official_source_title,
  'url',tc.official_source_url,
  'institution',tc.official_institution,
  'tier',tc.source_tier,
  'type','authoritative'
)),
updated_at=now()
FROM public.timeline_context tc
WHERE e.id=tc.entry_id
  AND e.category='历史'
  AND tc.official_source_url IS NOT NULL;

INSERT INTO public.timeline_media_candidates
(entry_id,image_url,source_url,source_type,source_tier,title,creator,license,review_status,note)
SELECT e.id, v.image_url, v.source_url, v.source_type, v.source_tier, v.title, v.creator, v.license, 'pending', v.note
FROM public.entries e
JOIN (VALUES
('five-dynasties-song','https://commons.wikimedia.org/wiki/Special:FilePath/China_early_18th_C_Jingdezhen_-_porcelain_IMG_9433_Museum_of_Asian_Civilisation.jpg','https://commons.wikimedia.org/wiki/File:China_early_18th_C_Jingdezhen_-_porcelain_IMG_9433_Museum_of_Asian_Civilisation.jpg','commons',3,'Jingdezhen porcelain in Museum of Asian Civilisation','Yumeto','CC BY-SA 4.0','五代—宋阶段器物结果参考，不作为窑址现场证据。'),
('yuan-blue-white','https://commons.wikimedia.org/wiki/Special:FilePath/20260625_Jingdezhen_blue-and-white_porcelain_dish_foliated_rim_and_interwining_flowers.jpg','https://commons.wikimedia.org/wiki/File:20260625_Jingdezhen_blue-and-white_porcelain_dish_foliated_rim_and_interwining_flowers.jpg','commons',3,'Jingdezhen blue-and-white porcelain dish','Windmemories','CC BY-SA 4.0','元代青花历史节点器物参考，非绘制过程照片。'),
('ming-imperial-kiln','https://commons.wikimedia.org/wiki/Special:FilePath/Jingdezhen_Royal_Kiln_Museum_4.jpg','https://commons.wikimedia.org/wiki/File:Jingdezhen_Royal_Kiln_Museum_4.jpg','commons',3,'Jingdezhen Royal Kiln Museum','Commons contributor','CC BY-SA 4.0','明代御窑遗产环境代表图。'),
('qing-colors','https://commons.wikimedia.org/wiki/Special:FilePath/China_1736-1750_Jingdezhen_-_porcelain_IMG_9430_Museum_of_Asian_Civilisation.jpg','https://commons.wikimedia.org/wiki/File:China_1736-1750_Jingdezhen_-_porcelain_IMG_9430_Museum_of_Asian_Civilisation.jpg','commons',3,'Jingdezhen porcelain 1736-1750','Yumeto','CC BY-SA 4.0','清代景德镇瓷器结果参考，不单独证明具体彩瓷工序。'),
('active-archaeology','https://commons.wikimedia.org/wiki/Special:FilePath/Jingdezhen_Royal_Kiln_Museum_4.jpg','https://commons.wikimedia.org/wiki/File:Jingdezhen_Royal_Kiln_Museum_4.jpg','commons',3,'Jingdezhen Royal Kiln Museum','Commons contributor','CC BY-SA 4.0','考古/遗产环境代表图，不是具体发掘现场记录。'),
('unesco-2026','https://commons.wikimedia.org/wiki/Special:FilePath/A_kiln_at_Jingdezhen.jpg','https://commons.wikimedia.org/wiki/File:A_kiln_at_Jingdezhen.jpg','commons',3,'A kiln at Jingdezhen','Pauloleong2002','CC BY-SA 4.0','世界遗产整体叙事的窑炉代表图；正式页面优先 UNESCO 官方媒体。'),
('eastern-jin-tang','https://commons.wikimedia.org/wiki/Special:FilePath/Jingdezhen_Porcelain_(10180352655).jpg','https://commons.wikimedia.org/wiki/File:Jingdezhen_Porcelain_(10180352655).jpg','commons',3,'Jingdezhen Porcelain','Gary Todd','CC0 1.0','早期历史仅作景德镇陶瓷结果参考，不作为东晋—唐现场证据。'),
('modern-industry','https://commons.wikimedia.org/wiki/Special:FilePath/20251011_Jingdezhen_porcelain_in_the_Maritime_Silk_Road_Museum_of_Guangdong.jpg','https://commons.wikimedia.org/wiki/File:20251011_Jingdezhen_porcelain_in_the_Maritime_Silk_Road_Museum_of_Guangdong.jpg','commons',3,'Jingdezhen porcelain in the Maritime Silk Road Museum of Guangdong','Yumeto','CC BY-SA 4.0','近现代历史节点成品/博物馆参考图。'),
('industry-transition','https://commons.wikimedia.org/wiki/Special:FilePath/20251011_Jingdezhen_porcelain_in_the_Maritime_Silk_Road_Museum_of_Guangdong.jpg','https://commons.wikimedia.org/wiki/File:20251011_Jingdezhen_porcelain_in_the_Maritime_Silk_Road_Museum_of_Guangdong.jpg','commons',3,'Jingdezhen porcelain in the Maritime Silk Road Museum of Guangdong','Yumeto','CC BY-SA 4.0','产业转型历史节点成品参考图。')
) v(slug,image_url,source_url,source_type,source_tier,title,creator,license,note)
ON e.slug=v.slug
WHERE e.status='published'
ON CONFLICT (entry_id,image_url) DO NOTHING;

INSERT INTO public.timeline_media_candidates
(entry_id,image_url,source_url,source_type,source_tier,title,review_status,note)
SELECT e.id,'pending://timeline/'||e.slug,
       'https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search='||replace(tc.image_search_query,' ','%20'),
       'google_discovery',3,'待人工选定：'||(e.zh->>'title'),'pending',
       '只作为逐条补图追踪，不得直接展示。'
FROM public.entries e
JOIN public.timeline_context tc ON tc.entry_id=e.id
WHERE e.category='历史'
AND NOT EXISTS (SELECT 1 FROM public.timeline_media_candidates c WHERE c.entry_id=e.id AND c.image_url LIKE 'pending://%');

COMMIT;