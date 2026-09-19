begin;

update public.entry_worlds ew
set rationale = case
  when e.slug='unesco-2026' and ew.world_slug='history'
    then '世界遗产身份把景德镇手工瓷业重新放回10—19世纪生产体系的长期历史脉络中。'
  when e.slug='r19' and ew.world_slug='research'
    then '非遗项目资料为景德镇手工制瓷技艺的当代传承提供制度化证据。'
  when e.slug='r20' and ew.world_slug='research'
    then '该文献直接记录1949—1966年陶瓷科技体系的变化，是现代技术史的研究证据。'
  when e.slug='r21' and ew.world_slug='research'
    then '薄胎瓷工艺演变研究连接当代技术实践与工艺史。'
  when e.slug='r22' and ew.world_slug='research'
    then '文化生态保护区规划提供当代遗产保护、空间管理与研究框架的一手资料。'
  when e.slug='r23' and ew.world_slug='research'
    then 'UNESCO遗产资料提供景德镇手工瓷业遗存的国际遗产认定与价值阐释依据。'
  when e.slug='r24' and ew.world_slug='research'
    then '申遗大事记记录遗产认定过程，是当代遗产研究的时间性证据。'
  when e.slug='r32' and ew.world_slug='research'
    then '近代陶业企业化与职业教育资料解释景德镇由传统手工业走向现代产业体系的过程。'
  when e.slug='blue-and-white' and ew.world_slug='objects'
    then '青花作为核心器物类型，适合从具体器形、装饰与时代实例进入器物世界。'
  when e.slug='colored-glaze' and ew.world_slug='objects'
    then '颜色釉作为器物类型，可从釉色、器形与烧成结果进入器物与美学世界。'
  when e.slug='fencai' and ew.world_slug='objects'
    then '粉彩作为器物类型，可从具体器形、绘饰风格与时代作品进入器物世界。'
  when e.slug='qingbai-porcelain' and ew.world_slug='objects'
    then '青白瓷作为器物类型，可从具体器形、胎釉特征与宋元作品进入器物世界。'
  else ew.rationale
end
from public.entries e
where ew.entry_id=e.id
  and ew.role='secondary'
  and (
    (e.slug='unesco-2026' and ew.world_slug='history') or
    (e.slug in ('r19','r20','r21','r22','r23','r24','r32') and ew.world_slug='research') or
    (e.slug in ('blue-and-white','colored-glaze','fencai','qingbai-porcelain') and ew.world_slug='objects')
  );

commit;
