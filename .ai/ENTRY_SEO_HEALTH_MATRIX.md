# Entry SEO Health Matrix

更新时间：2026-09-20

## 审计范围

基于 Supabase production 当前 149 个 published Entry，并对静态 Entry 架构完成构建、Pages 部署和部署后浏览器 smoke 后进行第二轮 Phase 6A 审计。

## 系统性结果

| 检查项 | 当前结果 | 判定 |
|---|---:|---|
| published Entry | 149 / 149 | PASS |
| title | 149 / 149 | PASS |
| summary | 149 / 149 | PASS |
| 正文 content | 149 / 149 | PASS |
| source | 149 / 149 | PASS |
| primary Knowledge World | 149 / 149 | PASS |
| canonical URL | 149 / 149 独立 /entry/<slug>/ | PASS |
| 初始 HTML 正文 | 149 / 149 静态可发现正文 | PASS |
| Schema.org | 149 / 149 WebPage + BreadcrumbList | PASS |
| OpenGraph | 149 / 149 | PASS |
| sitemap Entry 覆盖 | 149 / 149 独立 Entry sitemap | PASS |
| 继续探索 | Entry Network / Relation / Recommendation 已具备 | PASS |

### 第二轮架构结论

Phase 6A 的系统性 indexability 阻塞已关闭：Entry 现在拥有独立静态 URL、初始 HTML 正文、description、canonical、JSON-LD、OpenGraph 与独立 sitemap。原先 9 个 summary、37 个 body、22 个 source 缺口也已清零；剩余 REVIEW 主要是媒体覆盖与少量关系连续性治理。

## 逐 Entry 第二轮矩阵

状态：PASS=基础满足；REVIEW=需要后续治理；BLOCK=系统性架构阻塞。

| # | Entry | title | summary | body | source | world | image | canonical | indexable body | schema | OG | sitemap | next |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | active-archaeology — 2002—2014：御窑厂主动性考古 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 2 | arita-kiln — 有田窑·有田烧 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 3 | bat-trang — 巴特朗陶窑 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 4 | blue-and-white — 青花瓷 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 5 | bo-yibo — 薄一波 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 6 | changling-stone — 长岭瓷石采掘区 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 7 | changsha-kiln — 长沙窑 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 8 | chen-yu — 陈淯 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 9 | chenghua-doucai-chicken-cup — 成化斗彩鸡缸杯 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 10 | cizhou-kiln — 磁州窑·观台 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 11 | colored-glaze — 颜色釉瓷 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 12 | dehua-kiln — 德化窑 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 13 | ding-kiln — 定窑·曲阳 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 14 | dong-biwu — 董必武 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 15 | du-chongyuan — 杜重远 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 16 | eastern-jin-tang — 东晋—唐：新平镇与昌南镇 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 17 | europe-porcelain — 欧洲瓷器 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 18 | fencai — 粉彩瓷 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 19 | feng-zikai — 丰子恺 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 20 | five-dynasties-song — 五代—宋：湖田窑与青白瓷 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 21 | frank-b-lentz — Frank B. Lentz | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 22 | gaoling-mining — 高岭土矿采掘区 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 23 | ge-kiln — 哥窑 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 24 | goryeo-celadon — 高丽青瓷 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 25 | guan-kiln — 官窑 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 26 | guo-moruo — 郭沫若 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 27 | huang-yunpeng — 黄云鹏 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 28 | hutian-kiln — 湖田窑 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 29 | icheon-ceramics — 利川陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 30 | imperial-kiln — 御窑厂遗址 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 31 | industry-transition — 1949—1966：生产制度与科技转型 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 32 | islamic-ceramics — 伊斯兰世界陶瓷 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 33 | iznik-ceramics — 伊兹尼克陶器 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 34 | japan-ceramics — 日本陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 35 | jean-baptiste-du-halde — Jean-Baptiste du Halde（杜赫德） | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 36 | jiaotan-firewood — 焦潭柴窑燃料生产区 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 37 | jingdezhen — 景德镇窑 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 38 | jingdezhen-taolu — 《景德镇陶录》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 39 | joseon-ceramics — 朝鲜王朝陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 40 | joseph-needham — 李约瑟（Joseph Needham） | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 41 | josiah-wedgwood — Josiah Wedgwood（约西亚·韦奇伍德） | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 42 | jun-kiln — 钧窑·禹州 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 43 | korea-ceramics — 朝鲜半岛陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 44 | lang-tingji — 郎廷极 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 45 | lettres-edifiantes-porcelaine — 《耶稣会士书信集》中的景德镇报告 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 46 | li-rihua — 李日华 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 47 | li-xiannian — 李先念 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 48 | li-zhengdao — 李政道 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 49 | liling-kiln — 醴陵窑 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 50 | limoges-porcelain — 利摩日瓷器 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 51 | liu-yuanchang — 刘远长 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 52 | liu-zongyuan — 柳宗元 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 53 | longfellow — Henry Wadsworth Longfellow（亨利·沃兹沃思·朗费罗） | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 54 | longquan-kiln — 龙泉窑·大窑 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 55 | markley — 马基利 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 56 | meissen-porcelain — 梅森瓷器 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 57 | met-1991-253-33 — 景德镇窑青花莲池纹瓶（Met 1991.253.33） | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 58 | mikami-tsugio — 三上次男 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 59 | ming-imperial-kiln — 明：御窑厂与官作体系 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 60 | modern-industry — 1909—1910：近代企业与陶业教育 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 61 | nian-xiyao — 年希尧 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 62 | peng-qizi — 彭器资 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 63 | peng-zhen — 彭真 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 64 | pilgrim-art — The Pilgrim Art: Cultures of Porcelain in World History | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 65 | qian-qichen — 钱其琛 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 66 | qianlong-emperor — 乾隆皇帝 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 67 | qigong — 启功 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 68 | qin-xilin — 秦锡麟 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 69 | qing-colors — 清：御窑、彩瓷与颜色釉 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 70 | qingbai-porcelain — 青白瓷 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 71 | r01 — 《景德镇湖田窑址：1988—1999年考古发掘报告》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 72 | r02 — 《景德镇明清御窑遗址：2002—2004年珠山北麓考古发掘报告》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 73 | r03 — 北京大学：景德镇明清御窑厂遗址 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 74 | r06 — 《浮梁县志》乾隆四十八年（1783）刻本 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 75 | r07 — 《景德镇市志》建置志等地方志资料 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 76 | r08 — 《中国瓷都·景德镇市瓷业志》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 77 | r09 — 《宋代景德镇青白瓷的历史分期及其特征》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 78 | r10 — 《宋代湖田窑青白瓷历史和发展脉络的考察研究》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 79 | r11 — 《景德镇瓷器生产“二元配方”起源初探——兼论高岭土开发史》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 80 | r12 — 《景德镇陶瓷科学技术史研究的发展与展望》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 81 | r13 — 《景德镇传统陶瓷坯体“一元”配方研究》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 82 | r14 — 《景德镇青白瓷“半刀泥”装饰刻花技艺活态传承研究》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 83 | r15 — 《宋元景德镇窑青白瓷人物造像技艺研究》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 84 | r16 — 《明代早期景德镇御窑青花瓷器的初步研究》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 85 | r17 — 《北宋“景德年制”瓷器款识新考》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 86 | r18 — 《“器成天下走”：外销瓷与海上丝绸之路》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 87 | r19 — 国家级非物质文化遗产代表性项目“景德镇手工制瓷技艺” | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 88 | r20 — 《1949～1966年景德镇陶瓷科技文献比较研究》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 89 | r21 — 《改革开放以来景德镇薄胎瓷工艺的发展演变及其特点》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 90 | r22 — 《景德镇陶瓷文化生态保护区总体规划（2021—2035年）》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 91 | r23 — UNESCO：Jingdezhen Handicraft Porcelain Industry Sites / 景德镇手工瓷业遗存 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 92 | r24 — “景德镇手工瓷业遗存”申遗大事记 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 93 | r25 — 《粉彩工艺与艺术风格的演变》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 94 | r26 — 《清中期宫廷花鸟画风对粉彩花鸟装饰的影响》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 95 | r27 — 《景德镇清代釉上彩瓷器的文化故事》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 96 | r28 — 《粉彩瓷与无毒粉彩颜料的研究》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 97 | r29 — 景德镇颜色釉相关资料 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 98 | r30 — 《清代官窑祭红釉瓷的釉层结构及其对呈色的影响》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 99 | r31 — 《清代初期高温铜红釉烧造工艺及特点》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 100 | r32 — 《改良陶业 创办中国陶业学堂》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 101 | r33 — 《明清景德镇御窑厂遗址考古价值阐释刍议》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 102 | r34 — 《江西景德镇御窑厂遗址西北角外围明清民窑遗存考古简报》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 103 | r35 — 《“文化交流”视域下宋代景德镇青白瓷研究》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 104 | rl-hobson — R. L. Hobson（罗伯特·洛克哈特·霍布森） | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 105 | robert-finlay — Robert Finlay（罗伯特·芬雷） | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 106 | ru-kiln — 汝窑·清凉寺 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 107 | sawankhalok — 宋加洛窑·Si Satchanalai | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 108 | seto-kiln — 濑户窑 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 109 | sevres-porcelain — 塞夫勒瓷器 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 110 | shen-defu — 沈德符 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 111 | shen-huaiqing — 沈怀清 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 112 | shiwan-kiln — 石湾窑 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 113 | shu-tong — 舒同 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 114 | southeast-asia-ceramics — 东南亚陶瓷 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 115 | stoke-on-trent — 斯托克陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 116 | tang-ying — 唐英 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 117 | tang-ying-jun-vase — 雍正仿钧新紫釉天球瓶 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 118 | tao-cheng-jishi — 《陶成纪事碑记》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 119 | tao-shuo — 《陶说》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 120 | tian-gong-kai-wu — 《天工开物》 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 121 | tian-han — 田汉 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 122 | tian-hexian — 田鹤仙 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 123 | tong-bin — 童宾 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 124 | uk-ceramics — 英国陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 125 | unesco-2026 — 2026：景德镇手工瓷业遗存 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 126 | wang-bu — 王步 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 127 | wang-qi — 王琦 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 128 | wang-shixing — 王士性 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 129 | wang-xiliang — 王锡良 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 130 | wang-zehong — 王泽洪 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 131 | wang-zhen — 王震 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 132 | wen-zhenheng — 文震亨 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 133 | west-asia-ceramics — 西亚陶瓷 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 134 | xie-juezai — 谢觉哉 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 135 | xie-min — 谢旻 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 136 | xing-kiln — 邢窑 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 137 | xuande-blue-and-white-dish — 宣德青花龙纹盘 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 138 | yaozhou-kiln — 耀州窑·黄堡 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 139 | yin-hong-xu — 殷弘绪（François-Xavier d’Entrecolles） | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 140 | yixing-kiln — 宜兴窑 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 141 | yuan-blue-and-white-vase — 元青花折枝花纹八棱瓶 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 142 | yuan-blue-white — 元：青花与釉下彩绘 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 143 | yue-kiln — 越窑·上林湖 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 144 | zang-yingxuan — 臧应选 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 145 | zhan-shaolin — 占绍林 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 146 | zhang-guangnian — 张光年 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 147 | zhang-songmao — 张松茂 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | PASS |
| 148 | zhangzhou-kiln — 漳州窑 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |
| 149 | zhu-yan — 朱琰 | PASS | PASS | PASS | PASS | PASS | REVIEW | PASS | PASS | PASS | PASS | PASS | REVIEW |

## 第二轮结论

### 已关闭
1. 149 个 Entry 均有 summary、正文与 sources。
2. 149 个 Entry 均生成独立 `/entry/<slug>/` 静态页面。
3. 149 个 Entry 均具备 canonical、description、WebPage/BreadcrumbList JSON-LD、OpenGraph。
4. 149 个 Entry 均进入 `sitemap-entries.xml`。
5. Build 与 Pages 部署均成功；部署后浏览器 smoke 覆盖 canonical、description、JSON-LD、初始正文与继续探索路径。

### 内容质量后续
- REVIEW 的 image 表示当前没有 verified primary public media，不等于 Entry 不可索引。
- 个别 Entry 的 next 为 REVIEW，表示当前关系连续探索证据不足，属于后续知识网络治理，不阻塞 Phase 6A。

### 明确不做
- 不修改 Phase 2B World mappings。
- 不修改 Phase 3B A+ / A recommendation gate。
- 不重做 Knowledge World。
- 不重新设计首页。
- 不建立第二套 Entry 数据库。
- 不通过关键词堆砌制造内容。
