-- Sync production historical-entry provenance into the repository migration.
BEGIN;
WITH payload(slug,official_source_title,official_source_url,official_institution,source_tier,image_search_query) AS (
  VALUES
  ('eastern-jin-tang','景德镇手工制瓷技艺','https://www.ihchina.cn/art/detail/id/14270.html','中国非物质文化遗产网·中国非物质文化遗产数字博物馆',1,'景德镇 东晋 唐 新平镇 昌南镇 瓷业'),
  ('five-dynasties-song','湖田窑遗址：窑火映千年 瓷韵延古今','https://www.jdz.gov.cn/zwzx/jrcd/t1017519.shtml','景德镇市人民政府',1,'景德镇 湖田窑 五代 宋 青白瓷'),
  ('yuan-blue-white','湖田古瓷窑址：千年窑火里的文明回响','https://kx.jdz.gov.cn/rdzt/kpsy/t1017750.shtml','景德镇市科学技术协会',1,'景德镇 元代 青花 二元配方 高岭土'),
  ('ming-imperial-kiln','景德镇手工制瓷技艺','https://www.ihchina.cn/art/detail/id/14270.html','中国非物质文化遗产网·中国非物质文化遗产数字博物馆',1,'景德镇 明 御窑厂 制瓷 工艺'),
  ('qing-colors','景德镇：瓷韵千年流淌 技艺日益精湛','https://www.ihchina.cn/project_details/10946','中国非物质文化遗产网·中国非物质文化遗产数字博物馆',1,'景德镇 清代 粉彩 颜色釉 唐英 陶冶图说'),
  ('modern-industry','景德镇:从遗产到资源','https://www.ihchina.cn/Article/Index/detail?id=10183','中国非物质文化遗产网·中国非物质文化遗产数字博物馆',1,'景德镇 近代 陶业 学堂 1909 1910'),
  ('industry-transition','景德镇:从遗产到资源','https://www.ihchina.cn/Article/Index/detail?id=10183','中国非物质文化遗产网·中国非物质文化遗产数字博物馆',1,'景德镇 1949 1966 陶瓷 科技 工艺'),
  ('active-archaeology','御窑厂国家考古遗址公园','https://www.jdz.gov.cn/zjcd/mljdz/tscd/t300385.shtml','景德镇市人民政府',1,'景德镇 御窑厂 遗址 考古'),
  ('unesco-2026','Decision 48 COM 8B.16 / Jingdezhen Handicraft Porcelain Industry Sites','https://whc.unesco.org/en/decisions/9170/','UNESCO World Heritage Centre',1,'Jingdezhen Handicraft Porcelain Industry Sites UNESCO 2026')
)
UPDATE public.timeline_context tc
SET official_source_title=p.official_source_title,
    official_source_url=p.official_source_url,
    official_institution=p.official_institution,
    source_tier=p.source_tier,
    image_search_query=p.image_search_query,
    updated_at=now()
FROM payload p JOIN public.entries e ON e.slug=p.slug
WHERE tc.entry_id=e.id;
COMMIT;