-- Phase 6C-2 Evidence Deepening v1
-- Evidence-first deepening for the seven locked research tracks.
-- Sources are primary/institutional and do not create a second fact database.

do $$
declare
  u text := 'https://whc.unesco.org/en/decisions/9170/';
  um text := 'https://whc.unesco.org/en/list/1765/maps';
begin
  -- ① World Heritage: five component parts + serial-system interpretation
  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>世界遗产证据框架</h2><p>2026年，UNESCO世界遗产委员会将“Jingdezhen Handicraft Porcelain Industry Sites”列入世界遗产名录。官方将其定义为由五个组成部分构成的连续遗产，展示10至19世纪景德镇手工瓷业从原料、生产到运输和社会组织的完整系统。</p><h3>五个组成部分</h3><ol><li>Town Area Porcelain Production Center：城市制瓷生产中心</li><li>Hutian Ancient Kiln Site：湖田古窑址</li><li>Gaoling Porcelain Clay Mining Site：高岭瓷土采掘区</li><li>Changling Porcelain Stone Mining Site：长岭瓷石采掘区</li><li>Jiaotan Firewood Production Area：焦潭柴窑燃料生产区</li></ol><p>UNESCO强调，这五部分共同呈现原料来源、窑炉与作坊、城市生产、燃料、水陆运输以及社会组织之间的联系。因此，本 Entry 不应被理解为单一遗址介绍，而应作为整个景德镇手工瓷业生产系统的入口。</p><h3>证据边界</h3><p>这里使用的是UNESCO世界遗产委员会2026年正式决定及官方地图。关于各组成部分的具体范围、保护状态和技术史解释，应继续回到官方遗产文件、考古报告与馆藏研究核对。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url',u,'label','UNESCO World Heritage Committee·48 COM 8B.16·2026'),jsonb_build_object('url',um,'label','UNESCO World Heritage Centre·五组成部分官方地图'))
  where slug='unesco-2026';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>景德镇窑与世界遗产系统</h2><p>UNESCO 2026年的遗产决定把景德镇理解为一个连续的手工瓷业系统，而非单一窑址。官方叙述指出，10至13世纪南北制瓷技术在景德镇区域的整合为青白瓷稳定生产和生产中心形成提供了基础；13至19世纪又出现二元配方、新型窑炉以及钴料和釉上彩等技术创新。</p><p>从16世纪起，景德镇形成连接城市生产中心、原料与燃料产区以及贸易网络的复杂产业结构。分工、专业化和标准化成为大规模高质量生产的重要组织条件。</p><h2>研究边界</h2><p>“景德镇窑”是历史生产体系概念，不应把所有景德镇产品、窑址或具体器物简单视为同一生产单位。具体年代、窑场和器物归属仍需以考古和馆藏证据判断。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url',u,'label','UNESCO World Heritage Committee·Jingdezhen Handicraft Porcelain Industry Sites·2026'))
  where slug='jingdezhen';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>湖田在景德镇早期窑业中的位置</h2><p>UNESCO将湖田古窑址列为五个世界遗产组成部分之一，并把它作为10至13世纪青白瓷技术整合与早期生产中心形成的重要见证。湖田因此应与原料产区、后来的城市生产中心以及水陆运输联系起来观察。</p><p>考古研究仍是判断具体窑炉、作坊、产品序列和年代的主要证据。馆藏器物可以提供比较材料，但不能单凭器物外观替代窑址考古证据。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url',u,'label','UNESCO World Heritage Committee·48 COM 8B.16·2026'))
  where slug='hutian-kiln';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>御窑与城市生产中心</h2><p>UNESCO的2026年评估将城市生产中心描述为御窑、民窑、行会和商人组织共同存在的生产空间。御窑厂因此应放入城市制瓷体系中理解：它既有宫廷用瓷生产的制度属性，也与城市工匠、原料、运输和民营瓷业发生关系。</p><p>故宫资料同时记载，明清景德镇御窑厂存在细密分工，并在清代形成官民并行的生产格局。具体作坊布局、生产制度和器物序列应继续以考古报告和馆藏资料互证。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url',u,'label','UNESCO World Heritage Committee·48 COM 8B.16·2026'),jsonb_build_object('url','https://www.dpm.org.cn/collection/ceramic/226759.html','label','故宫博物院·景德镇御窑厂相关资料'))
  where slug='imperial-kiln';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>高岭矿区与原料链</h2><p>UNESCO把高岭瓷土采掘区列为五个组成部分之一，说明原料开采本身是景德镇手工瓷业遗产的重要组成，而不是生产系统之外的背景资源。官方遗产叙述把瓷石、黏土、燃料、窑址和城市生产中心放在同一产业链中。</p><p>“高岭土”作为现代材料学术语与历史上的高岭矿区之间存在词源和历史联系，但具体矿物组成、开采年代和配方演变应依据矿区考古、材料科学和技术史研究进一步确认。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url',u,'label','UNESCO World Heritage Committee·48 COM 8B.16·2026'),jsonb_build_object('url','https://whc.unesco.org/document/226090','label','UNESCO·ICOMOS技术评估·2026'))
  where slug='gaoling-mining';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>长岭瓷石与生产系统</h2><p>长岭瓷石采掘区是UNESCO 2026年列入的五个组成部分之一。官方把原料采掘与城市生产、运输和燃料供应共同视为景德镇手工瓷业的连续系统。</p><p>这一证据框架意味着长岭不应只作为“矿区景点”理解，而应作为解释景德镇制瓷原料供应和空间组织的知识节点。具体矿体、采掘历史和运输路线仍需结合考古与地质资料研究。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url',u,'label','UNESCO World Heritage Committee·48 COM 8B.16·2026'),jsonb_build_object('url',um,'label','UNESCO World Heritage Centre·五组成部分官方地图'))
  where slug='changling-stone';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>焦潭与燃料供应</h2><p>焦潭柴窑燃料生产区是UNESCO列入的五个组成部分之一。它证明景德镇历史制瓷不能只从“窑炉”本身理解：大规模烧造需要稳定的燃料供应，并通过交通网络与城市生产空间连接。</p><p>因此，燃料生产区与原料矿区、窑址和城市生产中心共同构成遗产系统的空间证据。具体森林利用、燃料运输和历史生态关系需要继续结合地方文献、环境史和遗产评估研究。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url',u,'label','UNESCO World Heritage Committee·48 COM 8B.16·2026'),jsonb_build_object('url',um,'label','UNESCO World Heritage Centre·五组成部分官方地图'))
  where slug='jiaotan-firewood';

  -- ② Jingdezhen core history / production system
  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>青花与全球生产体系</h2><p>UNESCO将13至19世纪的技术创新、生产组织与全球传播联系起来，并特别指出进口钴料、二元配方、窑炉创新以及釉下和釉上装饰技术的发展。16世纪以后，景德镇成为全球重要的手工瓷生产中心。</p><p>因此，“青花”在本项目中既是一个器物与工艺主题，也是连接景德镇城市生产、贸易和全球陶瓷史的核心观察入口。</p><h2>研究边界</h2><p>不同窑口、时期和钴料来源具有差异，不能把所有青花器物视为同一技术体系；具体器物仍需馆藏和考古证据支持。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url',u,'label','UNESCO World Heritage Committee·48 COM 8B.16·2026'),jsonb_build_object('url','https://www.si.edu/spotlight/blueandwhiteceramics','label','Smithsonian Institution·Blue and White Ceramics'))
  where slug='blue-and-white';

  -- ③ Core people
  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>证据深化：唐英</h2><p>故宫博物院资料记载，唐英（1682—1756）自雍正六年起驻景德镇御窑厂任协理官，后来兼理窑务，长期参与景德镇御窑管理与制瓷工艺研究，并留下《陶成纪事》《陶冶图说》《陶人心语》等著作。故宫研究资料还显示，他在景德镇期间深入接触陶工并学习制瓷技术。</p><p>研究唐英时必须区分管理者、技术研究者与具体器物制作者三个层次。现有证据支持其在窑务管理和技术实践中的重要作用，但不能据此把某一具体器物直接归为唐英个人制作。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url','https://www.dpm.org.cn/collection/ceramic/226759.html','label','故宫博物院·各种釉彩大瓶·唐英资料'),jsonb_build_object('url','https://www.dpm.org.cn/Uploads/pdf/1566/T00018_00.pdf','label','故宫博物院·唐英及其助手的制瓷成就'))
  where slug='tang-ying';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>证据深化：郎廷极</h2><p>故宫资料记载，郎廷极于康熙四十四年至五十一年主持景德镇御窑场工作；“郎窑红”之名与其督陶身份相关。故宫馆藏郎窑红梅瓶资料进一步说明，郎窑红属于高温铜红釉体系，对烧成温度与还原气氛要求严格。</p><p>因此，“郎窑”首先是窑务管理和生产时期的历史称谓，不等同于郎廷极本人亲手制作具体器物。器物归属仍需独立馆藏或考古证据。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url','https://www.dpm.org.cn/Uploads/File/2020/05/15/u5ebe4a7333945.pdf','label','故宫博物院·以督窑官名字命名的窑'),jsonb_build_object('url','https://www.dpm.org.cn/collection/ceramic/227698.html','label','故宫博物院·郎窑红梅瓶'))
  where slug='lang-tingji';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>证据深化：年希尧与唐英时期</h2><p>故宫研究资料把年希尧、唐英置于雍正时期景德镇御窑管理与技术实践的连续背景中。资料显示，年希尧任督陶官时与御窑生产管理有关，唐英则在雍正六年起驻景德镇参与协理陶务，后来长期兼理窑务。</p><p>研究“年窑”时应把官员管理、御窑制度和具体产品区分开来；“以督陶官命名”是历史文献和后世陶瓷史中的分类方式，并不自动证明官员亲自设计或制作每件器物。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url','https://www.dpm.org.cn/Uploads/File/2020/11/13/u5fae1d783e93c.pdf','label','故宫博物院·清代瓷器研究成果举要'))
  where slug='nian-xiyao';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>证据深化：臧应选</h2><p>故宫博物院资料把臧应选与康熙时期景德镇御窑管理放在同一制度史脉络中，并指出清代康熙、雍正、乾隆时期的御窑生产在管理、仿古和创新方面持续发展。</p><p>关于臧窑及其具体产品，应以《景德镇陶录》、故宫馆藏研究及相关清代档案互证；不应仅根据后世器物名称把某件作品直接归于臧应选个人。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url','https://www.dpm.org.cn/Uploads/File/2020/05/15/u5ebe4a7333945.pdf','label','故宫博物院·以督窑官名字命名的窑'),jsonb_build_object('url','https://ggzl.dpm.org.cn/app/api/app/exhibitionListPc/140','label','故宫博物院·清代景德镇窑展览资料'))
  where slug='zang-yingxuan';

  -- ④ Core museum objects
  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>博物馆级 Object Profile</h2><p>大都会艺术博物馆将此杯记录为明成化时期景德镇御窑器物，并提供独立馆藏记录、对象编号与研究资源。该对象可作为研究斗彩技术、成化御窑和明代宫廷瓷器制度的具体证据。</p><p>研究时应把“对象记录”与“时代性结论”分开：单件馆藏能够证明该件器物的编目、材质和馆藏研究信息，但不能单独代表整个成化时期景德镇生产。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url','https://www.metmuseum.org/art/collection/search/42515','label','The Metropolitan Museum of Art·Chenghua Chicken Cup'))
  where slug='chenghua-doucai-chicken-cup';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>博物馆级 Object Profile</h2><p>大都会艺术博物馆将该八棱瓶记录为14世纪中叶景德镇窑元青花瓷，提供独立对象记录。其八棱形制、分区纹饰和釉下钴蓝装饰可以作为研究元代景德镇青花及跨区域视觉交流的具体对象证据。</p><p>该对象适合与其他元代景德镇馆藏、伊斯兰世界器物和考古材料比较，但不应由单件器物推导整个元青花生产史。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url','https://www.metmuseum.org/art/collection/search/42491','label','The Metropolitan Museum of Art·Yuan faceted blue-and-white vase'))
  where slug='yuan-blue-and-white-vase';

  -- ⑤ Core literature
  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>证据深化：技术知识的原始记录</h2><p>《天工开物·陶埏》是明代技术文献的重要材料。研究景德镇时，应把其中关于原料、制坯和烧造的记述与景德镇考古、地方志和具体窑址资料交叉阅读，而不能把一般性技术描述直接等同于某一窑址的完整流程。</p><p>文献的价值还在于它把生产劳动、材料和技术知识放在同一叙述体系中，为理解传统手工业的知识组织方式提供一手材料。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url','https://ctext.org/wiki.pl?if=gb&res=336161','label','中国哲学书电子化计划·《天工开物》'))
  where slug='tian-gong-kai-wu';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>证据深化：清代景德镇窑业文献</h2><p>《陶成纪事碑记》与唐英相关陶务文献能够把清代御窑管理、工艺实践和产品分类联系起来。故宫资料同时将《陶成纪事》列为研究景德镇制瓷史的重要文献。</p><p>阅读此类文献时，需要区分作者的制度性记录、技术描述和后世研究解释；文献中的“集大成”等判断属于特定历史语境，不能直接转化为无条件的现代价值判断。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url','https://www.dpm.org.cn/collection/ceramic/226759.html','label','故宫博物院·唐英与《陶成纪事》'),jsonb_build_object('url','https://qkzzs.jcu.edu.cn/zgtcgy/info/1025/1261.htm','label','景德镇陶瓷大学·《陶成纪事碑记》研究资料'))
  where slug='tao-cheng-jishi';

  -- ⑥ Japan / East Asia
  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>景德镇—日本传播链</h2><p>大都会艺术博物馆关于江户时期日本瓷器的研究显示，17世纪日本有田地区的早期伊万里青花在构图和釉下钴蓝技术上受到中国瓷器传统影响；馆藏研究同时指出，日本早期瓷业还吸收了朝鲜半岛工匠传统和中国龙泉等窑业技术。</p><p>这说明东亚传播并不是单向复制：日本在吸收中国与朝鲜技术、器形和装饰资源后形成了早期伊万里、柿右卫门、锅岛等具有日本地域特征的体系。景德镇在这一链条中是重要来源之一，但不应把日本瓷器全部解释为景德镇的直接仿制。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url','https://www.metmuseum.org/toah/hd/jpor/ho_2002.447.123.htm','label','The Metropolitan Museum of Art·Edo-Period Japanese Porcelain'),jsonb_build_object('url','https://www.metmuseum.org/art/collection/search/52223','label','The Metropolitan Museum of Art·Early Imari'))
  where slug='japan-ceramics';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>东亚比较：高丽青瓷</h2><p>高丽青瓷是东亚陶瓷史中具有独立技术与审美传统的重要体系。将其与景德镇青白瓷比较时，可以观察不同地区在釉色、器形、装饰和窑业组织上的差异，而不能把“东亚交流”简单理解为单向影响。</p><p>后续研究应优先使用韩国文化遗产、博物馆和考古资料，与景德镇考古和馆藏对象形成平行证据链。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url','https://whc.unesco.org/en/tentativelists/5806/','label','UNESCO·Goryeo Celadon Kiln Sites of Gangjin'))
  where slug='goryeo-celadon';

  -- ⑦ Global ceramic civilization
  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>全球传播证据链</h2><p>UNESCO指出，16世纪以后景德镇形成连接生产中心、原料和燃料产区以及贸易网络的复杂产业结构，并通过青花、釉上彩和其他产品把技术、艺术与商品传播到世界。Smithsonian的研究也把景德镇放在全球陶瓷贸易史中，强调16世纪欧洲市场扩张以及后来欧洲仿制瓷业形成后的持续影响。</p><p>欧洲瓷器的研究重点因此不应只是“欧洲仿制中国瓷器”，而应同时观察消费、收藏、图案传播、技术模仿和本土产业形成等多个层面。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url',u,'label','UNESCO World Heritage Committee·48 COM 8B.16·2026'),jsonb_build_object('url','https://asia-archive.si.edu/exhibition/porcelain-production-jingdezhen/','label','Smithsonian National Museum of Asian Art·Porcelain Production at Jingdezhen'))
  where slug='europe-porcelain';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>欧洲知识传播中的景德镇</h2><p>殷弘绪在18世纪初对景德镇制瓷生产进行观察，并通过书信把生产知识介绍到欧洲。其材料的研究价值在于提供了欧洲观察者对景德镇生产现场的记录，但这些文字仍应与中国地方文献、考古资料和技术史研究交叉验证。</p><p>因此，本 Entry 的重点不是把殷弘绪描述成“发明者”或单一传播者，而是把他作为跨文化知识传播链中的一手观察者节点。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url','https://www.gotheborg.com/letters/','label','Selected Passages from the Letters of Père d’Entrecolles'))
  where slug='yin-hong-xu';

  -- Modern people: institutional evidence
  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>证据深化：现代粉彩传承</h2><p>景德镇市人民政府发布的《景德镇陶瓷文化生态保护区总体规划（2021—2035年）》将张松茂列入景德镇传统粉彩瓷制作技艺省级代表性传承相关名单。由此可以把他的 Entry 放在现代非遗传承和粉彩技艺延续的制度语境中研究。</p><p>人物研究仍需区分官方认定的传承身份、个人创作履历与具体作品归属，不能用传承人身份替代作品鉴定证据。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url','https://jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','label','景德镇市人民政府·景德镇陶瓷文化生态保护区总体规划（2021—2035年）'))
  where slug='zhang-songmao';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>证据深化：王琦</h2><p>《景德镇市志》人物志资料记载，王琦（1886—1933）参与瓷业美术研究社等近代陶瓷美术活动，并通过展览、画稿和行业刊物参与景德镇陶瓷美术研究与传播。</p><p>这使王琦的研究价值不仅在于个人画风，也在于近代景德镇陶瓷美术组织和公共传播的形成。具体作品、署款与真伪仍应以馆藏记录和作品研究为准。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url','https://www.jdz.gov.cn/zsnj/jdzsz/jdzszdwj/rwz/rwc/P020201114583753053261.pdf','label','《景德镇市志》·人物志·王琦'))
  where slug='wang-qi';

  update public.entries set
    zh=jsonb_set(zh,'{content}',to_jsonb((zh->>'content') || '<h2>证据深化：王步</h2><p>景德镇市人民政府公开资料将王步置于景德镇现代陶瓷美术与青花传统的传承脉络中。研究王步时，可以把个人笔墨风格与景德镇青花传统、现代陶瓷美术教育和生产体系联系起来观察。</p><p>具体作品的年代、作者归属和传世谱系应继续使用博物馆、出版物和作品档案核对。</p>')),
    sources = sources || jsonb_build_array(jsonb_build_object('url','https://jdz.gov.cn/zjcd/mljdz/sj/t933002.shtml','label','景德镇市人民政府·景德镇中国陶瓷博物馆相关资料'))
  where slug='wang-bu';

  -- Admission governance: promote only entries now backed by institutional/primary evidence.
  update public.entry_content_admissions a set
    source_quality='primary_or_institutional',
    citation_readiness='pass',
    admission_status='admitted',
    content_quality_status='ready',
    evidence_score=greatest(evidence_score,5),
    research_pass_version='6C-2-v1',
    reviewed_at=now(),
    notes=coalesce(notes,'') || ' Phase 6C-2 Evidence Deepening: institutional/primary evidence integrated.'
  from public.entries e
  where a.entry_id=e.id and e.slug in (
    'unesco-2026','jingdezhen','hutian-kiln','imperial-kiln','gaoling-mining',
    'changling-stone','jiaotan-firewood','blue-and-white','tang-ying','lang-tingji',
    'nian-xiyao','zang-yingxuan','chenghua-doucai-chicken-cup','yuan-blue-and-white-vase',
    'tian-gong-kai-wu','tao-cheng-jishi','japan-ceramics','goryeo-celadon',
    'europe-porcelain','yin-hong-xu','zhang-songmao','wang-qi','wang-bu'
  );
end $$;