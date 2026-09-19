-- Canonical 72-step process seed.
-- Production schema was created separately; this migration mirrors the curated
-- process catalog currently seeded in Supabase.
-- Image policy: stage representative images are explicitly marked as such.

BEGIN;

DELETE FROM public.craft_process_relations;
DELETE FROM public.craft_processes;

INSERT INTO public.craft_processes
(sequence, slug, name_zh, category, category_name, description_zh,
 historical_period, tools_zh, materials_zh, output_zh, source_title, source_url,
 source_institution, source_tier, image_url, image_credit, image_source_url,
 image_source_type, image_status, image_license, image_creator, image_search_query, image_review_note)
VALUES
(1,'mining','采矿','material','原料','从瓷土、瓷石等矿源取得制瓷原料，是生产链起点。','传统制瓷体系长期工序','采掘工具','瓷土、瓷石等矿料','原矿原料','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_45aa148150364c28a17c83bbf03f2b0e.JPG','新华社｜高岭土开采现场','https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/c.html','official_stage_representative','verified'),
(2,'ore-selection','选矿','material','原料','按矿物质量和用途挑选适合后续加工的原料。','传统制瓷体系长期工序','筛选、拣选工具','矿石、瓷土','选定原料','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(3,'stone-quarrying','采石','material','原料','采出适合制瓷的瓷石等矿物原料。','传统制瓷体系长期工序','采掘工具','瓷石','瓷石原料','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(4,'crushing','破碎','material','原料','把矿石敲碎，为细化和淘洗创造条件。','传统制瓷体系长期工序','锤具、破碎工具','矿石、瓷石','碎料','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(5,'pounding','舂料','material','原料','将矿料反复舂打，使颗粒进一步细化。','传统制瓷体系长期工序','石舂、舂臼','矿料','细化矿料','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(6,'washing','淘洗','material','原料','利用水流分离粗细颗粒与杂质，得到适用泥料。','传统制瓷体系长期工序','淘洗池、淘洗工具','矿料、水','泥浆','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(7,'sieving','过筛','material','原料','通过筛分控制颗粒大小并进一步去除杂质。','传统制瓷体系长期工序','筛具','泥浆','筛分后的泥浆','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(8,'iron-removal','除铁','material','原料','去除铁质杂质，降低烧成后颜色和缺陷风险。','传统制瓷体系长期工序','除铁设备、磁选工具','泥浆','除铁泥浆','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(9,'settling','沉淀','material','原料','让泥浆静置沉降，使颗粒分级并便于进一步脱水。','传统制瓷体系长期工序','沉淀池','泥浆、水','沉淀泥料','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(10,'dewatering','脱水','material','原料','去除泥浆中的多余水分，使泥料达到可加工状态。','传统制瓷体系长期工序','滤水、晾晒工具','泥浆','含水适度泥料','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(11,'zhibu','制不（趸）','material','原料','景德镇传统制瓷文献中的专门工序或计量环节；词形存在古今转写差异，暂保留原写法并标注待考。','明清手工制瓷体系','传统泥料工具','泥料','待后续配料的泥料单元','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(12,'batching','配料','material','原料','按性能需求组合不同原料，使泥料满足成型和烧成要求。','传统制瓷体系长期工序','称量工具、配料器具','瓷石、瓷土等','配合料','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(13,'grinding','粉碎','kneading','制泥','进一步细化原料，使泥料更均匀。','传统制瓷体系长期工序','粉碎、研磨工具','配合料','细料','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(14,'mixing','混合','kneading','制泥','使各类原料分布均匀，为练泥创造条件。','传统制瓷体系长期工序','混合工具','多种泥料、水','混合泥料','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(15,'kneading','练泥','kneading','制泥','反复加工使泥料组织均匀、性能稳定。','传统制瓷体系长期工序','练泥工具、泥凳','泥料','均匀泥料','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_61778eaa7f3e48d79de223638f892ce3.jpg','新华社｜揉泥现场','https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/c.html','official_stage_representative','verified'),
(16,'kneading-by-hand','揉泥','kneading','制泥','通过反复揉、摔等动作排除气泡并均匀水分。','传统手工制瓷','揉泥工具、泥凳','熟泥','可塑泥团','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_61778eaa7f3e48d79de223638f892ce3.jpg','新华社｜揉泥现场','https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/c.html','official_stage_representative','verified'),
(17,'aging','陈腐','kneading','制泥','让泥料储存后状态趋于稳定，提高后续成型性能。','传统手工制瓷体系','储泥设施','练后泥料','陈腐泥料','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(18,'tempering','熟泥','kneading','制泥','使泥料达到适宜成型的状态。','传统手工制瓷体系','揉泥工具','陈腐泥料','熟泥','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(19,'clay-portioning','分泥','kneading','制泥','按器型和生产需要分配泥料。','传统手工制瓷','量泥工具','熟泥','分份泥料','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(20,'clay-quantity','泥料定量','kneading','制泥','控制每件器物的用泥量，保持器壁和尺寸稳定。','传统手工制瓷','称量工具','熟泥','定量泥团','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(21,'fuzhuo','扶琢','kneading','制泥','对泥料进行扶持、整理；具体地域与时代用法需结合工艺史料进一步核验。','传统手工制瓷','整理工具','泥料','整理后泥料','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(22,'mud-washing','淘泥','kneading','制泥','进一步整理泥料，去除不适用颗粒；与原料淘洗概念需按具体工艺语境区分。','传统手工制瓷','淘泥工具','泥料、水','细化泥料','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(23,'clay-resting','泥料醒制','kneading','制泥','使加工后的泥料恢复稳定可塑状态。','传统手工制瓷','储泥设施','泥料','待成型泥料','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(24,'on-wheel','上车','kneading','制泥','把泥料置于辘轳或拉坯设备上，准备进入成型。','传统手工制瓷','辘轳、拉坯车','定量泥团','上车泥团','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(25,'centering','找中心','forming','成型与修整','使泥团在旋转台上保持同心。','传统手工制瓷','拉坯车','泥团','居中泥团','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(26,'throwing','拉坯','forming','成型与修整','利用旋转和手工提拉塑造圆器坯体。','传统手工制瓷','拉坯车、拉坯工具','泥团','初成坯体','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_f4dd983be25444d39058e7841a2d6e57.JPG','新华社｜拉坯现场','https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/c.html','official_stage_representative','verified'),
(27,'trimming-greenware','起坯','forming','成型与修整','将成型坯体从成型位置取下并保持器形。','传统手工制瓷','起坯工具','初成坯体','起坯坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(28,'molding','印坯','forming','成型与修整','借助模型把泥坯压印成规定形状。','传统手工制瓷','印坯模具','泥坯','模印坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(29,'joining-parts','接坯','forming','成型与修整','把不同泥件连接成完整器型。','传统手工制瓷','接坯工具','泥件、泥浆','组合坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(30,'drying-greenware','晾坯','forming','成型与修整','让坯体缓慢失水，达到修整所需硬度。','传统手工制瓷','晾坯架','湿坯','半干坯','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(31,'liju','利坯','forming','成型与修整','用利坯刀旋削，使厚薄和器形均匀。','传统手工制瓷','利坯刀、辘轳','半干坯','规整坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(32,'gualing','剐坯','forming','成型与修整','对坯体表面和局部进一步旋削整理。','传统手工制瓷','旋削工具','坯体','修整坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(33,'finishing','修坯','forming','成型与修整','修正器壁、口沿和表面，使形制符合要求。','传统手工制瓷','修坯刀具','坯体','精修坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(34,'foot-cutting','挖足','forming','成型与修整','处理器底和足部空间。','传统手工制瓷','修足刀具','坯体','足部初成形','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(35,'foot-finishing','修足','forming','成型与修整','修整底足尺寸和轮廓。','传统手工制瓷','修足刀具','坯体','规整底足','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(36,'water-correction','补水','forming','成型与修整','对局部干燥处补充水分，避免修整时出现开裂风险。','传统手工制瓷','补水工具、湿布','半干坯','湿度调整后的坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(37,'attach-handle-spout-ear','接把、咀、耳','decoration','坯体与彩绘','连接器物的把、流、耳等附件。','传统手工制瓷','接把工具','泥件、泥浆','带附件坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(38,'incising','刻坯','decoration','坯体与彩绘','在坯体表面刻出线条或浅浮雕。','传统手工制瓷','刻刀','坯体','刻花坯','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(39,'sgraffito','划花','decoration','坯体与彩绘','以工具划出细线纹样。','传统手工制瓷','划花工具','坯体','划花纹样','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(40,'stamping-pattern','印花','decoration','坯体与彩绘','利用模具在坯体上留下装饰纹样。','传统手工制瓷','印花模具','坯体','印花纹样','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(41,'openwork-carving','镂雕','decoration','坯体与彩绘','去除局部胎泥，形成通透纹样。','传统手工制瓷','雕刻工具','坯体','镂雕坯','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(42,'relief','浮雕','decoration','坯体与彩绘','使纹样从胎体表面凸起，形成浅浮雕效果。','传统手工制瓷','雕刻工具','坯体','浮雕坯','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(43,'applique-relief','堆雕','decoration','坯体与彩绘','以附加泥料堆叠塑造立体装饰。','传统手工制瓷','堆雕工具','泥料、坯体','立体装饰坯','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(44,'design-layout','打图（起稿）','decoration','坯体与彩绘','确定纹样位置、比例与构图，为正式绘制做准备。','传统手工制瓷','画稿、墨线工具','坯体、纸样','起稿纹样','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(45,'select-cobalt','选青料','decoration','坯体与彩绘','按呈色要求选择青花钴料。','青花相关工序','选料工具','青花钴料','选定青料','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(46,'grind-cobalt','研青料','decoration','坯体与彩绘','把青花料加工至适合绘制的状态。','青花相关工序','研磨工具','青花料','细化青花料','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(47,'prepare-underglaze-blue','调青花','decoration','坯体与彩绘','调配青花料的浓淡、黏度和使用状态。','青花相关工序','调料器具','青花料、介质','绘制用青花料','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(48,'underglaze-blue-painting','画坯','decoration','坯体与彩绘','在素坯上绘制纹饰。','传统青花工艺','毛笔、画具','素坯、青花料','彩绘坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_0481a98e30454d95a53b86e1c53addb6.jpg','新华社｜画坯现场','https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/c.html','official_stage_representative','verified'),
(49,'glazing','施釉','glaze','施釉','在坯体表面覆盖釉层。','传统手工制瓷','施釉工具','釉浆、坯体','施釉坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(50,'dipping-glaze','蘸釉','glaze','施釉','将坯体浸入釉浆挂釉。','传统手工制瓷','釉桶、釉夹','坯体、釉浆','挂釉坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(51,'swirling-glaze','荡釉','glaze','施釉','通过倾荡使釉层覆盖更加均匀。','传统手工制瓷','釉浆容器','坯体、釉浆','均匀釉层','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(52,'blown-glaze','吹釉','glaze','施釉','利用气流使釉料附着形成釉层。','传统手工制瓷','吹釉工具','釉料','釉层','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(53,'pour-glaze','浇釉','glaze','施釉','把釉浆浇覆于坯体表面。','传统手工制瓷','浇釉工具','釉浆、坯体','釉层','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(54,'da-glaze','搨釉','glaze','施釉','以工具辅助转移或覆盖釉料；具体器型应用需结合工艺资料进一步核验。','传统手工制瓷','搨釉工具','釉料、坯体','局部釉层','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(55,'spray-glaze','喷釉','glaze','施釉','把釉浆雾化喷覆。','现代及传统施釉路径','喷釉工具','釉浆','喷覆釉层','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(56,'scatter-glaze','洒釉','glaze','施釉','以洒布形成釉层或装饰效果。','传统施釉路径','洒釉工具','釉料','洒釉效果','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(57,'immersion-glaze','浸釉','glaze','施釉','将器物整体或局部浸入釉浆。','传统施釉路径','浸釉容器','坯体、釉浆','浸釉坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(58,'brush-glaze','刷釉','glaze','施釉','用刷具施釉。','传统施釉路径','刷釉工具','釉料','刷釉坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(59,'seal-greenware','刹合坯','glaze','施釉','整理、衔接和清洁施釉后的坯体，为入窑做准备；名称与具体操作待进一步核对。','传统施釉及入窑前工序','整形工具','施釉坯','整理后坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(60,'dry-glaze','晾釉','glaze','施釉','让釉层稳定干燥并减少表面损伤。','传统手工制瓷','晾坯架','施釉坯','待烧坯体','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(61,'saggars-clay','匣土配制','kiln','装烧与烧成','配制制作匣钵所需耐火泥料。','传统烧成体系','匣土工具','耐火泥料','匣土','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(62,'saggars-making','制匣钵','kiln','装烧与烧成','制作保护瓷坯的高温窑具。','传统烧成体系','匣钵模具','匣土','匣钵','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(63,'saggars-repair','修匣钵','kiln','装烧与烧成','修整匣钵尺寸和表面，使其可以重复使用。','传统烧成体系','修匣钵工具','匣钵','合用匣钵','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(64,'loading','装坯','kiln','装烧与烧成','把待烧坯体合理放入匣钵。','传统烧成体系','装坯工具、匣钵','待烧坯体','入匣坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(65,'filling-kiln','满窑','kiln','装烧与烧成','根据窑位和器型组织装窑，使空间利用和烧成条件合理。','传统烧成体系','窑具、窑炉','装坯匣钵','满窑状态','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(66,'firing-master-control','把桩','kiln','装烧与烧成','承担烧窑过程中对火候、窑况与操作节奏的控制。','传统柴窑烧成体系','柴窑工具、测温与观火工具','窑炉、燃料','受控烧成状态','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(67,'carrying-greenware','驮坯','kiln','装烧与烧成','在生产和窑内工序之间搬运、安放坯体。','传统手工制瓷','搬运工具','坯体、匣钵','待装窑坯体','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(68,'kiln-staging','架表','kiln','装烧与烧成','按窑炉结构和烧成规律布置器物及窑具。','传统烧成体系','窑具','坯体、窑具','合理装窑结构','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(69,'ignition','点火','kiln','装烧与烧成','启动窑炉进入升温阶段。','传统烧成体系','燃料、点火工具','窑炉、燃料','升温窑炉','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(70,'kiln-firing','烧窑','kiln','装烧与烧成','控制燃料、温度、气氛和火候完成烧成。','传统烧成体系','柴窑、窑工工具','燃料、装窑器物','烧成瓷器','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846b01af614c016b2bf_3b26201898234bfaa6a8d8725c24b3c5.jpg','新华社｜古窑烧窑现场','https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/c.html','official_stage_representative','verified'),
(71,'kiln-receiving','收兜脚','kiln','装烧与烧成','完成烧窑末段的窑内收尾操作。','传统烧成体系','窑工工具','烧成器物','待冷却窑品','景德镇陶瓷文化生态保护区总体规划','https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml','景德镇市人民政府',1,NULL,NULL,NULL,'official_stage_representative','pending_review'),
(72,'cooling','停火冷却','kiln','装烧与烧成','结束烧成并控制降温，待安全状态后开窑。','传统烧成体系','窑炉、温度观察工具','烧成瓷器','成品瓷器','景德镇手工制瓷技艺','https://www.ihchina.cn/Article/Index/detail?id=14270','中国非物质文化遗产网',1,'https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/2026072539351a0d75ef4846c016b2bf_3b26201898234bfaa6a8d8725c24b3c5.jpg','新华社｜烧窑阶段代表照片（非独立冷却步骤摄影）','https://www.xinhuanet.com/politics/20260725/39351a0d75ef4846b01af614c016b2bf/c.html','official_stage_representative','verified');


-- Commons candidates identified during media-governance review.
-- These are representative process images, not claims of Jingdezhen-specific historical practice.
UPDATE public.craft_processes SET
  image_url='https://commons.wikimedia.org/wiki/Special:FilePath/Throwing_clay_on_a_pottery_wheel.jpg',
  image_credit='Wikimedia Commons｜Throwing clay on a pottery wheel',
  image_source_url='https://commons.wikimedia.org/wiki/File:Throwing_clay_on_a_pottery_wheel.jpg',
  image_source_type='commons_candidate',
  image_status='pending_review',
  image_license='CC BY-SA 4.0',
  image_creator='Drbones1950',
  image_search_query='pottery wheel throwing clay',
  image_review_note='通用陶轮拉坯示例；用于说明动作，不证明为景德镇特定工序。'
WHERE sequence IN (24,25,26);

UPDATE public.craft_processes SET
  image_url='https://commons.wikimedia.org/wiki/Special:FilePath/Glaze_Spraying_di_Kilang_Claytan.png',
  image_credit='Wikimedia Commons｜Glaze Spraying di Kilang Claytan',
  image_source_url='https://commons.wikimedia.org/wiki/File:Glaze_Spraying_di_Kilang_Claytan.png',
  image_source_type='commons_candidate',
  image_status='pending_review',
  image_license='CC BY-SA 4.0',
  image_creator='Encik Tekateki',
  image_search_query='ceramic glazing glaze spraying',
  image_review_note='现代陶瓷喷釉示例；只对应“喷釉”动作，不等同于景德镇传统手工喷釉。'
WHERE sequence=55;

UPDATE public.craft_processes SET
  image_url='https://commons.wikimedia.org/wiki/Special:FilePath/Cazette2.JPG',
  image_credit='Wikimedia Commons｜Cazette2.JPG',
  image_source_url='https://commons.wikimedia.org/wiki/Category:Saggars',
  image_source_type='commons_candidate',
  image_status='pending_review',
  image_license='待核对原文件页面',
  image_creator=NULL,
  image_search_query='saggar saggars kiln furniture ceramic',
  image_review_note='匣钵（saggar）通用示例；使用前需按原文件页再次核对作者与许可。'
WHERE sequence IN (61,62,63,64,65);

UPDATE public.craft_processes SET
  image_url='https://commons.wikimedia.org/wiki/Special:FilePath/A_kiln_at_Jingdezhen.jpg',
  image_credit='Wikimedia Commons｜A kiln at Jingdezhen',
  image_source_url='https://commons.wikimedia.org/wiki/File:A_kiln_at_Jingdezhen.jpg',
  image_source_type='commons_candidate',
  image_status='pending_review',
  image_license='CC BY-SA 4.0',
  image_creator='Pauloleong2002',
  image_search_query='Jingdezhen kiln',
  image_review_note='景德镇窑炉照片；适合作为烧窑/冷却阶段代表图，而非逐步操作摄影。'
WHERE sequence IN (66,67,68,69,70,71,72);

UPDATE public.craft_processes SET
  image_url='https://commons.wikimedia.org/wiki/Special:FilePath/Jingdezhen_Porcelain_(10180352655).jpg',
  image_credit='Wikimedia Commons｜Jingdezhen Porcelain (10180352655)',
  image_source_url='https://commons.wikimedia.org/wiki/File:Jingdezhen_Porcelain_(10180352655).jpg',
  image_source_type='commons_candidate',
  image_status='pending_review',
  image_license='CC0 1.0',
  image_creator='Gary Todd',
  image_search_query='Jingdezhen porcelain museum',
  image_review_note='景德镇瓷器成品示例，适合作为烧成后产出/成品视觉资料，不对应单一工序动作。'
WHERE sequence=72;

INSERT INTO public.craft_process_relations(process_id, related_process_id, relation_type, note)
SELECT p.id, p2.id, 'precedes', '数字化主流程相邻节点'
FROM public.craft_processes p
JOIN public.craft_processes p2 ON p2.sequence=p.sequence+1;

COMMIT;
