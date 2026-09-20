# Entry SEO Health Matrix

更新时间：2026-09-20

## 审计范围

基于 Supabase production 当前 149 个 published Entry，以及 GitHub main 当前 Entry 渲染架构进行第一轮 Phase 6A 审计。

## 系统性结果

| 检查项 | 当前结果 | 判定 |
|---|---:|---|
| published Entry | 149 / 149 | PASS |
| title | 149 / 149 | PASS |
| summary | 140 / 149 | REVIEW |
| 正文 content | 112 / 149 | REVIEW |
| meta.description | 0 / 149 | BLOCK |
| source | 127 / 149 | REVIEW |
| primary Knowledge World | 149 / 149 | PASS |
| canonical URL | 未建立独立 Entry canonical metadata | BLOCK |
| 初始 HTML 正文 | /entry/ 只有 loading shell，主体依赖 JS + Supabase | BLOCK |
| Schema.org | 未发现 Entry 专用 JSON-LD 体系 | BLOCK |
| OpenGraph | 未发现 Entry 动态 metadata 体系 | BLOCK |
| sitemap Entry 覆盖 | 当前 MkDocs nav 不包含动态 Entry URL | BLOCK |
| 继续探索 | Entry Network / Relation / Recommendation 已具备 | PASS |

### 关键架构发现

当前 docs/entry.md 的静态内容只有 Entry loading shell；标题、正文、图片、来源、关系、推荐等由 wiki-enhancements.js 在浏览器端从 Supabase 获取后渲染。因此当前 Entry 用户打开后能看到内容，但还不能视为成熟的互联网独立知识页面。第一优先级应修复系统性 Indexability，而不是先逐条手工改 149 个 Entry。

## 逐 Entry 第一轮矩阵

状态：PASS=基础满足；REVIEW=需要后续治理；BLOCK=系统性架构阻塞。

| # | Entry | title | summary | body | source | world | image | canonical | indexable body | schema | OG | sitemap | next |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | active-archaeology — 2002—2014：御窑厂主动性考古 | PASS | PASS | PASS | REVIEW | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 2 | arita-kiln — 有田窑·有田烧 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 3 | bat-trang — 巴特朗陶窑 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 4 | blue-and-white — 青花瓷 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 5 | bo-yibo — 薄一波 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 6 | changling-stone — 长岭瓷石采掘区 | PASS | REVIEW | PASS | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 7 | changsha-kiln — 长沙窑 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 8 | chen-yu — 陈淯 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 9 | chenghua-doucai-chicken-cup — 成化斗彩鸡缸杯 | PASS | PASS | PASS | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 10 | cizhou-kiln — 磁州窑·观台 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 11 | colored-glaze — 颜色釉瓷 | PASS | REVIEW | PASS | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 12 | dehua-kiln — 德化窑 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 13 | ding-kiln — 定窑·曲阳 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 14 | dong-biwu — 董必武 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 15 | du-chongyuan — 杜重远 | PASS | PASS | REVIEW | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 16 | eastern-jin-tang — 东晋—唐：新平镇与昌南镇 | PASS | PASS | PASS | REVIEW | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 17 | europe-porcelain — 欧洲瓷器 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 18 | fencai — 粉彩瓷 | PASS | REVIEW | PASS | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 19 | feng-zikai — 丰子恺 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 20 | five-dynasties-song — 五代—宋：湖田窑与青白瓷 | PASS | PASS | PASS | REVIEW | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 21 | frank-b-lentz — Frank B. Lentz | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 22 | gaoling-mining — 高岭土矿采掘区 | PASS | REVIEW | PASS | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 23 | ge-kiln — 哥窑 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 24 | goryeo-celadon — 高丽青瓷 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 25 | guan-kiln — 官窑 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 26 | guo-moruo — 郭沫若 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 27 | huang-yunpeng — 黄云鹏 | PASS | PASS | PASS | REVIEW | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 28 | hutian-kiln — 湖田窑 | PASS | REVIEW | PASS | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 29 | icheon-ceramics — 利川陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 30 | imperial-kiln — 御窑厂遗址 | PASS | REVIEW | PASS | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 31 | industry-transition — 1949—1966：生产制度与科技转型 | PASS | PASS | PASS | REVIEW | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 32 | islamic-ceramics — 伊斯兰世界陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 33 | iznik-ceramics — 伊兹尼克陶器 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 34 | japan-ceramics — 日本陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 35 | jean-baptiste-du-halde — Jean-Baptiste du Halde（杜赫德） | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 36 | jiaotan-firewood — 焦潭柴窑燃料生产区 | PASS | REVIEW | PASS | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 37 | jingdezhen — 景德镇窑 | PASS | PASS | PASS | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 38 | jingdezhen-taolu — 《景德镇陶录》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 39 | joseon-ceramics — 朝鲜王朝陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 40 | joseph-needham — 李约瑟（Joseph Needham） | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 41 | josiah-wedgwood — Josiah Wedgwood（约西亚·韦奇伍德） | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 42 | jun-kiln — 钧窑·禹州 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 43 | korea-ceramics — 朝鲜半岛陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 44 | lang-tingji — 郎廷极 | PASS | PASS | PASS | REVIEW | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 45 | lettres-edifiantes-porcelaine — 《耶稣会士书信集》中的景德镇报告 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 46 | li-rihua — 李日华 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 47 | li-xiannian — 李先念 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 48 | li-zhengdao — 李政道 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 49 | liling-kiln — 醴陵窑 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 50 | limoges-porcelain — 利摩日瓷器 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 51 | liu-yuanchang — 刘远长 | PASS | PASS | PASS | REVIEW | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 52 | liu-zongyuan — 柳宗元 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 53 | longfellow — Henry Wadsworth Longfellow（亨利·沃兹沃思·朗费罗） | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 54 | longquan-kiln — 龙泉窑·大窑 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 55 | markley — 马基利 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 56 | meissen-porcelain — 梅森瓷器 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 57 | met-1991-253-33 — 景德镇窑青花莲池纹瓶（Met 1991.253.33） | PASS | PASS | PASS | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 58 | mikami-tsugio — 三上次男 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 59 | ming-imperial-kiln — 明：御窑厂与官作体系 | PASS | PASS | PASS | REVIEW | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 60 | modern-industry — 1909—1910：近代企业与陶业教育 | PASS | PASS | PASS | REVIEW | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 61 | nian-xiyao — 年希尧 | PASS | PASS | PASS | REVIEW | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 62 | peng-qizi — 彭器资 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 63 | peng-zhen — 彭真 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 64 | pilgrim-art — The Pilgrim Art: Cultures of Porcelain in World History | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 65 | qian-qichen — 钱其琛 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 66 | qianlong-emperor — 乾隆皇帝 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 67 | qigong — 启功 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 68 | qin-xilin — 秦锡麟 | PASS | PASS | PASS | REVIEW | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 69 | qing-colors — 清：御窑、彩瓷与颜色釉 | PASS | PASS | PASS | REVIEW | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 70 | qingbai-porcelain — 青白瓷 | PASS | REVIEW | PASS | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 71 | r01 — 《景德镇湖田窑址：1988—1999年考古发掘报告》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 72 | r02 — 《景德镇明清御窑遗址：2002—2004年珠山北麓考古发掘报告》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 73 | r03 — 北京大学：景德镇明清御窑厂遗址 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 74 | r06 — 《浮梁县志》乾隆四十八年（1783）刻本 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 75 | r07 — 《景德镇市志》建置志等地方志资料 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 76 | r08 — 《中国瓷都·景德镇市瓷业志》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 77 | r09 — 《宋代景德镇青白瓷的历史分期及其特征》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 78 | r10 — 《宋代湖田窑青白瓷历史和发展脉络的考察研究》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 79 | r11 — 《景德镇瓷器生产“二元配方”起源初探——兼论高岭土开发史》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 80 | r12 — 《景德镇陶瓷科学技术史研究的发展与展望》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 81 | r13 — 《景德镇传统陶瓷坯体“一元”配方研究》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 82 | r14 — 《景德镇青白瓷“半刀泥”装饰刻花技艺活态传承研究》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 83 | r15 — 《宋元景德镇窑青白瓷人物造像技艺研究》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 84 | r16 — 《明代早期景德镇御窑青花瓷器的初步研究》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 85 | r17 — 《北宋“景德年制”瓷器款识新考》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 86 | r18 — 《“器成天下走”：外销瓷与海上丝绸之路》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 87 | r19 — 国家级非物质文化遗产代表性项目“景德镇手工制瓷技艺” | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 88 | r20 — 《1949～1966年景德镇陶瓷科技文献比较研究》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 89 | r21 — 《改革开放以来景德镇薄胎瓷工艺的发展演变及其特点》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 90 | r22 — 《景德镇陶瓷文化生态保护区总体规划（2021—2035年）》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 91 | r23 — UNESCO：Jingdezhen Handicraft Porcelain Industry Sites / 景德镇手工瓷业遗存 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 92 | r24 — “景德镇手工瓷业遗存”申遗大事记 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 93 | r25 — 《粉彩工艺与艺术风格的演变》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 94 | r26 — 《清中期宫廷花鸟画风对粉彩花鸟装饰的影响》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 95 | r27 — 《景德镇清代釉上彩瓷器的文化故事》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 96 | r28 — 《粉彩瓷与无毒粉彩颜料的研究》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 97 | r29 — 景德镇颜色釉相关资料 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 98 | r30 — 《清代官窑祭红釉瓷的釉层结构及其对呈色的影响》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 99 | r31 — 《清代初期高温铜红釉烧造工艺及特点》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 100 | r32 — 《改良陶业 创办中国陶业学堂》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 101 | r33 — 《明清景德镇御窑厂遗址考古价值阐释刍议》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 102 | r34 — 《江西景德镇御窑厂遗址西北角外围明清民窑遗存考古简报》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 103 | r35 — 《“文化交流”视域下宋代景德镇青白瓷研究》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 104 | rl-hobson — R. L. Hobson（罗伯特·洛克哈特·霍布森） | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 105 | robert-finlay — Robert Finlay（罗伯特·芬雷） | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 106 | ru-kiln — 汝窑·清凉寺 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 107 | sawankhalok — 宋加洛窑·Si Satchanalai | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 108 | seto-kiln — 濑户窑 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 109 | sevres-porcelain — 塞夫勒瓷器 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 110 | shen-defu — 沈德符 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 111 | shen-huaiqing — 沈怀清 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 112 | shiwan-kiln — 石湾窑 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 113 | shu-tong — 舒同 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 114 | southeast-asia-ceramics — 东南亚陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 115 | stoke-on-trent — 斯托克陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 116 | tang-ying — 唐英 | PASS | REVIEW | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 117 | tang-ying-jun-vase — 雍正仿钧新紫釉天球瓶 | PASS | PASS | PASS | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 118 | tao-cheng-jishi — 《陶成纪事碑记》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 119 | tao-shuo — 《陶说》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 120 | tian-gong-kai-wu — 《天工开物》 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 121 | tian-han — 田汉 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 122 | tian-hexian — 田鹤仙 | PASS | PASS | PASS | REVIEW | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 123 | tong-bin — 童宾 | PASS | PASS | PASS | REVIEW | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 124 | uk-ceramics — 英国陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 125 | unesco-2026 — 2026：景德镇手工瓷业遗存 | PASS | PASS | PASS | REVIEW | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 126 | wang-bu — 王步 | PASS | PASS | PASS | REVIEW | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 127 | wang-qi — 王琦 | PASS | PASS | PASS | REVIEW | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 128 | wang-shixing — 王士性 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 129 | wang-xiliang — 王锡良 | PASS | PASS | PASS | REVIEW | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 130 | wang-zehong — 王泽洪 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 131 | wang-zhen — 王震 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 132 | wen-zhenheng — 文震亨 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 133 | west-asia-ceramics — 西亚陶瓷 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 134 | xie-juezai — 谢觉哉 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 135 | xie-min — 谢旻 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 136 | xing-kiln — 邢窑 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 137 | xuande-blue-and-white-dish — 宣德青花龙纹盘 | PASS | PASS | PASS | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 138 | yaozhou-kiln — 耀州窑·黄堡 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 139 | yin-hong-xu — 殷弘绪（François-Xavier d’Entrecolles） | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 140 | yixing-kiln — 宜兴窑 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 141 | yuan-blue-and-white-vase — 元青花折枝花纹八棱瓶 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 142 | yuan-blue-white — 元：青花与釉下彩绘 | PASS | PASS | PASS | REVIEW | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 143 | yue-kiln — 越窑·上林湖 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 144 | zang-yingxuan — 臧应选 | PASS | PASS | PASS | REVIEW | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 145 | zhan-shaolin — 占绍林 | PASS | PASS | PASS | REVIEW | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 146 | zhang-guangnian — 张光年 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 147 | zhang-songmao — 张松茂 | PASS | PASS | PASS | REVIEW | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 148 | zhangzhou-kiln — 漳州窑 | PASS | PASS | PASS | PASS | PASS | PASS | BLOCK | BLOCK | BLOCK | BLOCK | PASS |
| 149 | zhu-yan — 朱琰 | PASS | PASS | REVIEW | PASS | PASS | REVIEW | BLOCK | BLOCK | BLOCK | BLOCK | PASS |

## 第一轮结论

### P0 系统性阻塞
1. 149 个 Entry 没有独立 meta.description。
2. /entry/ 是客户端渲染壳，初始 HTML 没有真正知识正文。
3. canonical 没有按 Entry 建立稳定的独立 URL 元数据。
4. 没有 Entry 专用 Schema.org structured data。
5. 没有 Entry 专用 OpenGraph metadata。
6. MkDocs 当前 nav 不包含 149 个动态 Entry URL，不能把默认 sitemap 视为 149 个 Entry 已完整进入搜索引擎发现体系。

### P1 内容质量
- 9 个 Entry 缺少 summary。
- 37 个 Entry 缺少正文 content。
- 22 个 Entry 当前没有 sources。
- 部分 Entry 没有 verified public media。

### 下一轮执行顺序
A1：解决 Entry 独立 URL / 静态可发现正文架构 → A2：title / description / canonical / OG / JSON-LD → A3：149 Entry sitemap / index → A4：补齐 summary/content/source/media → A5：重新跑 Health Matrix → A6：构建、部署、线上页面自动检查、数据权限检查。

完成后才进入 149 → 220。

## 明确不做
- 不修改 Phase 2B World mappings。
- 不修改 Phase 3B A+ / A recommendation gate。
- 不重做 Knowledge World。
- 不重新设计首页。
- 不建立第二套 Entry 数据库。
- 不通过关键词堆砌制造内容。
