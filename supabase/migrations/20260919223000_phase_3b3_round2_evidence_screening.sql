-- Phase 3B-3 round 2: evidence screening of weak relations
-- A: six relations gained entry-specific evidence.
-- C: three pre-Ming -> Ming/Qing imperial kiln-site edges removed as temporally impossible.
update public.entry_relations er
set note = case
  when er.entry_id='d72cb21f-a950-4f28-b3b4-ab65d2cafb23' and er.related_entry_id='b91b0dd6-f828-425f-b149-a131c2b4d133' then '国家博物馆研究指出王琦是“绘画神技”代表；文化和旅游部恭王府博物馆展览资料将王琦列入珠山八友，而该画派以粉彩工笔精描推动新粉彩瓷发展。'
  when er.entry_id='41a53512-cede-4838-9cde-dc56269390a0' and er.related_entry_id='b91b0dd6-f828-425f-b149-a131c2b4d133' then '故宫博物院资料记载唐英长期管理景德镇御窑厂并推动制瓷工艺创新；清代粉彩在雍正、乾隆时期成熟，唐英所处的御窑生产体系正处于这一发展阶段。'
  when er.entry_id='ac26e854-9c9a-44f5-b0ef-22079cc9a446' and er.related_entry_id='46acf042-385b-44e4-8630-ca23898b4956' then '明代景德镇御窑厂建立并发展于青花生产成为主流的时期；故宫博物院资料明确记载元代景德镇已烧制成熟青花，明清青花成为瓷器生产主流。'
  when er.entry_id='832a7646-2137-4cd0-9625-0eb3bb102a02' and er.related_entry_id='b91b0dd6-f828-425f-b149-a131c2b4d133' then '故宫博物院资料指出粉彩创烧于康熙晚期、成熟于雍正和乾隆时期；该历史条目聚焦清代御窑、彩瓷与颜色釉，因此与粉彩发展存在明确时代对应。'
  when er.entry_id='ac26e854-9c9a-44f5-b0ef-22079cc9a446' and er.related_entry_id='da892d36-fa24-4b30-b53b-e650aaa8acf5' then '故宫博物院记载景德镇御窑厂始建于明洪武二年（1369），该历史条目聚焦明代御窑厂与官作体系，与御窑厂遗址存在直接时代和制度对应。'
  when er.entry_id='832a7646-2137-4cd0-9625-0eb3bb102a02' and er.related_entry_id='da892d36-fa24-4b30-b53b-e650aaa8acf5' then '景德镇御窑厂自明代延续至清代，清代继续承担宫廷用瓷生产；该历史条目聚焦清代御窑体系，与御窑厂遗址存在直接历史空间对应。'
end
where (er.entry_id,er.related_entry_id) in (
 ('d72cb21f-a950-4f28-b3b4-ab65d2cafb23','b91b0dd6-f828-425f-b149-a131c2b4d133'),
 ('41a53512-cede-4838-9cde-dc56269390a0','b91b0dd6-f828-425f-b149-a131c2b4d133'),
 ('ac26e854-9c9a-44f5-b0ef-22079cc9a446','46acf042-385b-44e4-8630-ca23898b4956'),
 ('832a7646-2137-4cd0-9625-0eb3bb102a02','b91b0dd6-f828-425f-b149-a131c2b4d133'),
 ('ac26e854-9c9a-44f5-b0ef-22079cc9a446','da892d36-fa24-4b30-b53b-e650aaa8acf5'),
 ('832a7646-2137-4cd0-9625-0eb3bb102a02','da892d36-fa24-4b30-b53b-e650aaa8acf5')
);
delete from public.entry_relations
where relation_type='kiln' and related_entry_id='da892d36-fa24-4b30-b53b-e650aaa8acf5'
and entry_id in ('f16a11cb-9d3e-40cf-ab8c-ab8c7daf7a0c','d03ad6a7-7467-40c2-a75d-e83bcfdd9508','f2ae381c-27d3-4fea-8c4a-2747a993e50b');
