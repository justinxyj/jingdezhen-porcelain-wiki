-- Sprint B Phase 2B: four-boundary semantic audit
-- Principle: keep a secondary only when entering from the target world
-- yields a concrete, explainable knowledge path.

begin;

delete from public.entry_worlds ew using public.entries e
where ew.entry_id=e.id and ew.world_slug='research' and ew.role='secondary'
  and e.slug='guo-moruo';

delete from public.entry_worlds ew using public.entries e
where ew.entry_id=e.id and ew.world_slug='craft' and ew.role='secondary'
  and e.slug in ('liu-yuanchang','zhan-shaolin','qin-xilin');

delete from public.entry_worlds ew using public.entries e
where ew.entry_id=e.id and ew.world_slug='research' and ew.role='secondary'
  and e.slug in ('jiaotan-firewood','changling-stone','gaoling-mining');

update public.entry_worlds ew
set rationale = case e.slug
 when 'jean-baptiste-du-halde' then '杜赫德编纂《中华帝国全志》并传播早期欧洲对景德镇制瓷业的记录；从人物进入可追踪的早期西方知识传播与景德镇文献史。'
 when 'josiah-wedgwood' then '韦奇伍德以英国陶瓷制造者身份参与对中国瓷器资料的吸收与比较；从人物进入18世纪欧洲陶瓷知识转译与仿制史。'
 when 'rl-hobson' then '霍布森的《中国陶器与瓷器》以20世纪初的器物与窑业观察为研究材料；从人物进入近代景德镇陶瓷史学与文献研究。'
 when 'robert-finlay' then '芬雷从全球贸易史研究景德镇瓷器；从人物进入瓷器贸易、全球商品网络与景德镇世界史研究。'
 when 'mikami-tsugio' then '三上次男长期从事东亚古陶瓷研究并考察景德镇；从人物进入日本学界的景德镇陶瓷研究与东亚陶瓷交流史。'
 when 'wen-zhenheng' then '文震亨《长物志》保存明代鉴藏者对名窑器物的品评；从人物进入明代瓷器鉴赏、消费与文献证据。'
 when 'zhu-yan' then '朱琰《陶说》系统记录景德镇窑业与历代名瓷；从人物进入清代陶瓷史文献与窑业知识整理。'
 when 'li-rihua' then '李日华的笔记记录景德镇制瓷人物吴昊十九等材料；从人物进入明代景德镇工匠与同时代文献证据。'
 when 'joseph-needham' then '李约瑟将景德镇制瓷业纳入中国科学技术史与城市组织研究；从人物进入技术史与产业组织研究。'
 when 'yin-hong-xu' then '殷弘绪在景德镇长期观察制瓷生产并留下书信报告；从人物进入18世纪欧洲对景德镇工艺的田野式文献记录。'
 when 'shen-defu' then '沈德符在明代笔记中品评瓷器；从人物进入明代瓷器消费、鉴赏与同时代文本证据。'
 when 'wang-shixing' then '王士性《广志绎》记述宣德、成化窑器；从人物进入明代地方观察、器物品评与地理文献证据。'
 else ew.rationale end
from public.entries e
where ew.entry_id=e.id and ew.world_slug='research' and ew.role='secondary';

update public.entry_worlds ew
set rationale = case e.slug
 when 'tang-ying' then '唐英连接雍正—乾隆时期御窑管理、工艺记录与具体器物生产；从人物进入官窑生产组织、工艺实践与器物制作。'
 when 'nian-xiyao' then '年希尧连接雍正时期陶务管理与御窑工艺实践；从人物进入制度化生产、工艺管理与技术记录。'
 when 'zhang-songmao' then '张松茂以粉彩创作为核心传承实践；从人物进入现代粉彩绘制、装饰语言与技艺传承。'
 when 'wang-bu' then '王步以青花瓷画著称；从人物进入近代青花绘制、笔墨装饰与瓷上绘画技艺。'
 when 'wang-qi' then '王琦的瓷画实践与珠山八友传统直接相连；从人物进入近代瓷上人物画与粉彩绘画技艺。'
 when 'wang-xiliang' then '王锡良代表现代景德镇陶瓷美术传承；从人物进入粉彩等传统瓷画技艺的现代延续。'
 when 'tian-hexian' then '田鹤仙以瓷上绘画和珠山八友传统为主要艺术实践；从人物进入近代粉彩山水与瓷画装饰。'
 when 'tong-bin' then '童宾作为明代御窑工匠人物，可从人物进入御窑烧造、窑业分工与工匠实践。'
 when 'lang-tingji' then '郎廷极作为康熙时期督陶官连接御窑管理与烧造实践；从人物进入清代官窑生产组织与工艺实践。'
 when 'huang-yunpeng' then '黄云鹏以古陶瓷研究、传统技艺整理与传承实践为核心；从人物进入传统制瓷知识的当代研究与传承。'
 else ew.rationale end
from public.entries e
where ew.entry_id=e.id and ew.world_slug='craft' and ew.role='secondary';

update public.entry_worlds ew
set rationale = case e.slug
 when 'ding-kiln' then '定窑可作为北方白瓷技术谱系的考古入口；从窑址进入白瓷生产、产品演变与景德镇白瓷传统的比较研究。'
 when 'imperial-kiln' then '御窑厂遗址保存窑炉、作坊、窑具与瓷片堆积等生产遗迹；从遗址进入明清御窑考古、生产组织与制度研究。'
 when 'dehua-kiln' then '德化窑兼具窑炉、作坊、白瓷产品与海上贸易考古材料；从窑址进入南方白瓷、雕塑装饰与外销网络比较研究。'
 when 'ru-kiln' then '汝窑可把遗址、出土材料、传世器物与文献证据放在同一研究框架；从窑址进入北宋名窑的证据链研究。'
 when 'hutian-kiln' then '湖田窑跨五代至宋元等时期，出土材料可用于研究青白瓷生产、产品序列与窑业组织，是景德镇窑业考古的核心入口。'
 when 'cizhou-kiln' then '磁州窑可作为民窑生产与大众市场研究入口；从遗址进入民窑产品、装饰创新与消费网络的比较。'
 when 'yaozhou-kiln' then '耀州窑的刻花、印花与青瓷传统可与景德镇青白瓷比较；从窑址进入装饰技术传播与区域技术谱系研究。'
 when 'yue-kiln' then '越窑可用于研究青瓷传统、贡瓷体系与区域技术传播；从遗址进入景德镇青白瓷形成之前后的东亚陶瓷比较。'
 when 'xing-kiln' then '邢窑是中国古代白瓷技术谱系的重要节点；从窑址进入白瓷原料、烧造与产品演变的比较研究。'
 when 'jun-kiln' then '钧窑可从釉色、矿物原料与烧成条件进入技术研究；与景德镇颜色釉体系形成具体工艺比较。'
 when 'changsha-kiln' then '长沙窑可从唐代装饰创新、民窑生产与跨区域贸易进入研究；适合比较景德镇后来形成的装饰与外销网络。'
 when 'longquan-kiln' then '龙泉窑可从青瓷产品体系、窑址景观与海上贸易进入研究；与景德镇生产和外销网络形成区域比较。'
 else ew.rationale end
from public.entries e
where ew.entry_id=e.id and ew.world_slug='research' and ew.role='secondary';

update public.entry_worlds ew
set rationale = case e.slug
 when 'r20' then '该研究比较1949—1966年景德镇陶瓷科技文献，可从工艺世界进入现代材料、技术与生产制度的技术史。'
 when 'r15' then '该研究聚焦宋元青白瓷人物造像技艺，可从工艺世界进入成型、装饰与人物造像制作方法。'
 when 'r21' then '该研究追踪薄胎瓷工艺的现代演变，可从工艺世界进入薄胎成型、工艺改进与传承实践。'
 when 'r13' then '该研究讨论传统陶瓷坯体“一元”配方，可从工艺世界进入瓷石原料、坯体配方与成型性能。'
 when 'r11' then '该研究讨论“二元配方”与高岭土开发史，可从工艺世界进入原料配比、资源开发与烧成技术。'
 when 'r12' then '该综述以景德镇陶瓷科学技术史为对象，可从工艺世界进入材料、成型、烧成与技术演变的研究框架。'
 when 'r14' then '该研究聚焦青白瓷“半刀泥”刻花技艺及其活态传承，可从工艺世界进入具体装饰技法与传承机制。'
 when 'r31' then '该研究聚焦清初高温铜红釉烧造，可从工艺世界进入釉料、气氛与高温烧成条件。'
 when 'r30' then '该研究分析祭红釉釉层结构与呈色关系，可从工艺世界进入釉层、材料与呈色机制。'
 when 'r25' then '该研究追踪粉彩工艺与艺术风格演变，可从工艺世界进入粉彩制作、装饰工艺与风格变化。'
 when 'r28' then '该研究讨论粉彩瓷与无毒粉彩颜料，可从工艺世界进入颜料材料、安全性与彩绘工艺。'
 when 'r19' then '国家级非遗资料直接对应景德镇手工制瓷技艺，可从工艺世界进入完整手工制瓷流程及其传承体系。'
 when 'r29' then '颜色釉资料汇集具体釉色与相关技术信息，可从工艺世界进入颜色釉材料、配制与烧成。'
 else ew.rationale end
from public.entries e
where ew.entry_id=e.id and ew.world_slug='craft' and ew.role='secondary';

update public.entry_worlds ew
set rationale = case e.slug
 when 'r35' then '该研究以宋代景德镇青白瓷为核心，可从器物世界进入青白瓷的器形、装饰与文化交流。'
 when 'r17' then '该研究考察北宋“景德年制”款识，可从器物世界进入纪年款识、器物断代与窑业身份识别。'
 when 'r09' then '该研究建立宋代景德镇青白瓷历史分期，可从器物世界进入产品序列、器形与时代特征。'
 when 'r10' then '该研究追踪湖田窑青白瓷发展，可从器物世界进入青白瓷产品演变与器物类型。'
 when 'r16' then '该研究聚焦明代早期景德镇御窑青花瓷器，可从器物世界进入青花器形、纹饰与时代特征。'
 when 'r27' then '该资料聚焦清代釉上彩瓷器及其文化叙事，可从器物世界进入彩瓷品类、纹饰与文化语境。'
 when 'r26' then '该研究把清中期宫廷花鸟画风与粉彩花鸟装饰相联系，可从器物世界进入粉彩纹饰与图像来源。'
 when 'r31' then '该研究聚焦清初高温铜红釉瓷，可从器物世界进入红釉器物的工艺特征与呈色表现。'
 when 'r30' then '该研究分析祭红釉瓷的釉层结构与呈色，可从器物世界进入颜色釉器物的材料与视觉特征。'
 when 'r25' then '该研究追踪粉彩工艺与艺术风格，可从器物世界进入粉彩器物的装饰语言与风格演变。'
 when 'r28' then '该研究讨论粉彩瓷与颜料，可从器物世界进入粉彩器物的彩绘材料与呈色。'
 when 'r29' then '颜色釉资料可作为颜色釉瓷的品类与视觉特征入口，从器物进入具体釉色体系。'
 else ew.rationale end
from public.entries e
where ew.entry_id=e.id and ew.world_slug='objects' and ew.role='secondary';

update public.entry_worlds ew
set rationale = case e.slug
 when 'r24' then '申遗大事记串联五个遗产组成部分及其保护过程；从空间世界进入景德镇窑址、原料、燃料与生产中心的整体空间网络。'
 when 'r18' then '外销瓷与海上丝绸之路把景德镇生产中心连接到港口、航线和海外市场；从空间世界进入跨区域贸易地理。'
 when 'r33' then '该研究直接解释明清御窑厂遗址的考古价值；从空间世界进入御窑生产区、遗迹分布与城市空间。'
 when 'r02' then '该考古发掘报告提供珠山北麓明清御窑遗址的空间与遗迹证据；从空间世界进入御窑遗址考古。'
 when 'r01' then '该考古报告以湖田窑址为核心，连接遗迹、生产年代与产品分布；从空间世界进入景德镇早期窑业空间。'
 when 'r11' then '二元配方研究同时涉及高岭土资源开发；从空间世界进入矿区—运输—生产中心之间的原料空间网络。'
 when 'r22' then '文化生态保护区总体规划直接处理景德镇陶瓷遗产的空间范围与保护分区；从空间世界进入城市与文化遗产规划。'
 when 'r34' then '该考古简报记录御窑厂西北角外围民窑遗存；从空间世界进入官窑与民窑在城市中的空间关系。'
 when 'r23' then 'UNESCO世界遗产资料明确呈现五个组成部分及其空间联系；从空间世界进入景德镇手工瓷业的整体遗产网络。'
 when 'r03' then '北京大学机构资料聚焦明清御窑厂遗址；从空间世界进入御窑遗址位置、考古对象与城市生产空间。'
 else ew.rationale end
from public.entries e
where ew.entry_id=e.id and ew.world_slug='space' and ew.role='secondary';

update public.entry_worlds ew
set rationale = case e.slug
 when 'five-dynasties-song' then '五代—宋的湖田窑与青白瓷节点直接解释青白瓷产品形成；从器物世界进入时代、器形与青白瓷风格的关系。'
 when 'yuan-blue-white' then '元代青花与釉下彩绘节点直接解释青花器物兴起；从器物世界进入青花器形、纹饰与釉下彩绘的发展。'
 when 'ming-imperial-kiln' then '明代御窑厂与官作体系节点直接连接官窑制度和青花等代表性器物；从器物世界进入制度与器物生产的关系。'
 when 'qing-colors' then '清代御窑、彩瓷与颜色釉节点直接解释粉彩、颜色釉等器物体系；从器物世界进入品类与时代风格。'
 else ew.rationale end
from public.entries e
where ew.entry_id=e.id and ew.world_slug='objects' and ew.role='secondary';

update public.entry_worlds ew
set rationale = case e.slug
 when 'active-archaeology' then '2002—2014年的主动性考古直接改变御窑厂生产遗迹的空间认知；从空间世界进入考古发掘、遗址分布与城市历史空间。'
 when 'unesco-2026' then '2026年世界遗产列入把镇区生产中心、湖田窑、矿区与柴薪生产区纳入一个整体空间系统；从空间世界进入五个组成部分的关系。'
 when 'eastern-jin-tang' then '东晋—唐的新平镇、昌南镇节点连接地方建置与早期窑业空间；从空间世界进入景德镇城市形成与窑业起源。'
 when 'five-dynasties-song' then '五代—宋湖田窑与青白瓷节点直接落到湖田窑及其生产空间；从空间世界进入早期窑业布局与城市外缘生产。'
 when 'ming-imperial-kiln' then '明代御窑厂与官作体系节点直接解释御窑厂在城市生产空间中的核心位置及其官作组织。'
 else ew.rationale end
from public.entries e
where ew.entry_id=e.id and ew.world_slug='space' and ew.role='secondary';

commit;
