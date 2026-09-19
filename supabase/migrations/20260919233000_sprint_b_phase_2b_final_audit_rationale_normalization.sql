-- Sprint B Phase 2B Final Audit
-- Normalize remaining generic secondary rationales so every published secondary edge
-- states an entry-specific knowledge question / user value.
-- Data-only migration; no entry-world edges are added or removed.

update public.entry_worlds ew
set rationale = case
  when ew.world_slug='contemporary' and e.slug='modern-industry' then '该条目解释近代企业化与陶业教育如何改变景德镇的生产与人才结构；从现代景德镇进入，可追溯产业现代化的历史前置。'
  when ew.world_slug='contemporary' and e.slug='industry-transition' then '该条目解释1949—1966年生产制度与科技体系转型；从现代景德镇进入，可理解当代产业结构形成的历史路径。'
  when ew.world_slug='craft' and e.slug='industry-transition' then '该历史节点记录传统手工业向现代工业体系的转型，可从工艺世界进入机械化、科技研发与生产组织变化。'
  when ew.world_slug='craft' and e.slug='eastern-jin-tang' then '该历史节点对应景德镇早期窑业形成，可从工艺世界进入早期烧造体系、生产组织与窑业起源。'
  when ew.world_slug='craft' and e.slug='five-dynasties-song' then '该历史节点以湖田窑和青白瓷为核心，可从工艺世界进入青白瓷胎釉、成型与烧造技术的发展。'
  when ew.world_slug='craft' and e.slug='yuan-blue-white' then '该历史节点聚焦元代青花与釉下彩绘，可从工艺世界进入钴料彩绘、胎釉结合与高温烧成。'
  when ew.world_slug='craft' and e.slug='ming-imperial-kiln' then '该历史节点解释明代御窑厂与官作体系，可从工艺世界进入标准化生产、专业分工与御窑技术组织。'
  when ew.world_slug='craft' and e.slug='qing-colors' then '该历史节点串联清代御窑、彩瓷与颜色釉，可从工艺世界进入釉上彩、颜色釉及高温烧成技术。'
  when ew.world_slug='craft' and e.slug='yuan-blue-and-white-vase' then '这件元青花器物可具体观察胎釉、青花绘制、器形与烧成结果之间的技术关系。'
  when ew.world_slug='craft' and e.slug='xuande-blue-and-white-dish' then '这件宣德青花器物可具体观察青花绘画、胎釉配合、纹饰组织与御窑烧造标准。'
  when ew.world_slug='craft' and e.slug='chenghua-doucai-chicken-cup' then '斗彩鸡缸杯把青花与釉上彩结合到具体器物，可从工艺世界进入分次施彩与烧成控制。'
  when ew.world_slug='craft' and e.slug='met-1991-253-33' then '该馆藏元代青花瓶提供具体器物个案，可从工艺世界观察釉下青花绘制、胎釉与烧成条件。'
  when ew.world_slug='craft' and e.slug='tang-ying-jun-vase' then '该雍正仿钧器物可从具体釉色效果进入仿古颜色釉、釉层控制与御窑烧成实践。'
  when ew.world_slug='history' and e.slug='yuan-blue-and-white-vase' then '该元青花器物可作为元代景德镇生产、外销与社会需求的具体物证，连接器物年代与历史环境。'
  when ew.world_slug='history' and e.slug='xuande-blue-and-white-dish' then '该宣德青花盘可作为明代御窑制度与宫廷用瓷的具体物证，连接器物与生产制度史。'
  when ew.world_slug='history' and e.slug='chenghua-doucai-chicken-cup' then '斗彩鸡缸杯可作为成化时期御窑生产与宫廷审美的具体物证，进入明代器用与制度史。'
  when ew.world_slug='history' and e.slug='met-1991-253-33' then '该馆藏元代青花瓶提供可核对的器物个案，可从历史世界进入元代景德镇窑业与跨区域交流。'
  when ew.world_slug='history' and e.slug='fencai' then '粉彩瓷可作为清代景德镇彩瓷发展的器物类型入口，连接御窑生产、审美变化与技术演进。'
  when ew.world_slug='history' and e.slug='tang-ying-jun-vase' then '该雍正仿钧器物可具体连接唐英时期御窑生产、仿古风尚与清代颜色釉发展。'
  when ew.world_slug='history' and e.slug='qingbai-porcelain' then '青白瓷作为宋元景德镇代表性产品，可从具体品类进入湖田窑生产、市场需求与区域贸易史。'
  when ew.world_slug='history' and e.slug='blue-and-white' then '青花瓷作为景德镇核心品类，可从器物类型进入元明时期生产、外销与消费体系的历史变化。'
  when ew.world_slug='history' and e.slug='colored-glaze' then '颜色釉瓷可作为清代及更早釉色技术发展的器物类型入口，连接材料创新与御窑生产史。'
  when ew.world_slug='history' and e.slug='r18' then '该研究以外销瓷与海上丝绸之路为主题，可从历史世界进入景德镇瓷器生产、贸易与海外市场的历史联系。'
  when ew.world_slug='history' and e.slug='r20' then '该研究比较1949—1966年陶瓷科技文献，可从历史世界进入新中国成立初期产业制度、科技与教育转型。'
  when ew.world_slug='history' and e.slug='r08' then '《景德镇市瓷业志》提供覆盖多个时期的地方行业资料，可从历史世界追踪窑业制度、产业与城市发展的连续变化。'
  when ew.world_slug='history' and e.slug='tian-gong-kai-wu' then '《天工开物》保存明代制瓷生产的技术与劳动记录，可从历史世界进入当时的生产方式与社会经济背景。'
  when ew.world_slug='history' and e.slug='r32' then '该资料记录近代改良陶业与中国陶业学堂，可从历史世界进入景德镇企业化、职业教育与近代化进程。'
  when ew.world_slug='history' and e.slug='r33' then '该研究讨论明清御窑厂遗址的考古价值，可从历史世界进入御窑制度、生产组织与遗址发现所重建的历史。'
  when ew.world_slug='history' and e.slug='r07' then '《景德镇市志》建置志等地方志提供城市建置与地方行政资料，可从历史世界重建景德镇城市沿革与制度环境。'
  when ew.world_slug='history' and e.slug='jingdezhen-taolu' then '《景德镇陶录》系统记录清代景德镇窑业，可从历史世界进入窑业制度、生产组织与行业知识。'
  when ew.world_slug='history' and e.slug='r34' then '该考古简报记录御窑厂外围民窑遗存，可从历史世界进入明清官窑与民窑并存的生产格局。'
  when ew.world_slug='history' and e.slug='r06' then '《浮梁县志》提供清代地方行政、经济与窑业背景资料，可从历史世界重建景德镇所在地方社会环境。'
  when ew.world_slug='history' and e.slug='lettres-edifiantes-porcelaine' then '耶稣会士报告保存早期欧洲观察景德镇的材料，可从历史世界进入18世纪景德镇瓷业与全球知识传播。'
  when ew.world_slug='history' and e.slug='tao-cheng-jishi' then '《陶成纪事碑记》记录清代御窑管理与生产实践，可从历史世界进入官窑制度与陶务治理。'
  when ew.world_slug='history' and e.slug='tao-shuo' then '《陶说》整理清代陶瓷史知识，可从历史世界进入景德镇窑业沿革与古代名瓷认知。'
  when ew.world_slug='research' and e.slug='yuan-blue-and-white-vase' then '该器物可作为研究型个案，连接馆藏信息、器物特征、年代判断与元代景德镇窑业研究。'
  when ew.world_slug='research' and e.slug='xuande-blue-and-white-dish' then '该器物可作为研究型个案，连接宣德青花的器形、纹饰、御窑制度与传世/考古证据。'
  when ew.world_slug='research' and e.slug='chenghua-doucai-chicken-cup' then '该器物可作为研究型个案，连接成化斗彩的工艺特征、宫廷使用与馆藏研究证据。'
  when ew.world_slug='research' and e.slug='met-1991-253-33' then '该馆藏对象具有明确博物馆编号，可从研究世界进入图像、馆藏记录与元代景德镇青花的证据链。'
  when ew.world_slug='research' and e.slug='fencai' then '粉彩瓷可作为品类研究入口，连接清代景德镇彩瓷、材料技术、装饰语言与相关文献。'
  when ew.world_slug='research' and e.slug='tang-ying-jun-vase' then '该器物可作为雍正时期仿钧颜色釉研究个案，连接唐英、御窑生产与釉色技术证据。'
  when ew.world_slug='research' and e.slug='qingbai-porcelain' then '青白瓷可作为研究对象，连接湖田窑考古、器物序列、胎釉技术与宋元景德镇研究。'
  when ew.world_slug='research' and e.slug='blue-and-white' then '青花瓷可作为跨时期研究对象，连接原料、绘画技术、器物类型、生产中心与全球贸易证据。'
  when ew.world_slug='research' and e.slug='colored-glaze' then '颜色釉瓷可作为材料与烧成研究对象，连接釉料、矿物成分、窑炉条件与景德镇技术史。'
  else ew.rationale
end
from public.entries e
where ew.entry_id=e.id
  and e.status='published'
  and ew.role='secondary';
