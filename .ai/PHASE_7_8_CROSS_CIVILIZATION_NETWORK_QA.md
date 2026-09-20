# Phase 7.8 — Cross-Civilization Network QA

更新时间：2026-09-20

## 全量结果

| 状态 | 数量 | 定义 |
|---|---:|---|
| isolated | 142 | 完全没有 entry_relations |
| single_weak | 3 | 只有1条关系，且无A/B证据级关系 |
| multi_weak | 12 | 多条关系，但全部无A/B证据级关系 |
| single_strong | 17 | 只有1条A/B证据级关系 |
| connected | 16 | 多条关系且至少1条A/B证据级关系 |
| **合计** | **190** | 全部Published + Canonical Eligible |

结论：142/190（74.7%）仍完全孤立；只有33/190（17.4%）至少有一个A/B证据级网络连接。

## 单边弱连接（3）

- huang-yunpeng｜黄云鹏
- nian-xiyao｜年希尧
- zang-yingxuan｜臧应选

## 多边弱连接（12）

- active-archaeology｜2002—2014：御窑厂主动性考古
- changling-stone｜长岭瓷石采掘区
- eastern-jin-tang｜东晋—唐：新平镇与昌南镇
- five-dynasties-song｜五代—宋：湖田窑与青白瓷
- gaoling-mining｜高岭土矿采掘区
- hutian-kiln｜湖田窑
- industry-transition｜1949—1966：生产制度与科技转型
- jiaotan-firewood｜焦潭柴窑燃料生产区
- lang-tingji｜郎廷极
- modern-industry｜1909—1910：近代企业与陶业教育
- unesco-2026｜2026：景德镇手工瓷业遗存
- yuan-blue-white｜元：青花与釉下彩绘

## 当前真正Connected核心（16）

- arita-kiln｜有田窑·有田烧
- blue-and-white｜青花瓷
- colored-glaze｜颜色釉瓷
- europe-porcelain｜欧洲瓷器
- fencai｜粉彩瓷
- imperial-kiln｜御窑厂遗址
- japan-ceramics｜日本陶瓷
- ming-imperial-kiln｜明：御窑厂与官作体系
- qing-colors｜清：御窑、彩瓷与颜色釉
- qingbai-porcelain｜青白瓷
- seto-kiln｜濑户窑
- tang-ying｜唐英
- tang-ying-jun-vase｜雍正仿钧新紫釉天球瓶
- tao-shuo｜《陶说》
- tian-gong-kai-wu｜《天工开物》
- zhu-yan｜朱琰

## 142个孤立Entry：优先修复分组

数据库已经给全部190条写入 `network_qa_status`，因此完整142条名单可直接按以下SQL复现：

```sql
select e.slug, e.zh->>'title' as title
from entries e
join entry_content_admissions a on a.entry_id=e.id
where e.status='published'
  and a.canonical_eligible=true
  and a.network_qa_status='isolated'
order by e.slug;
```

高优先级孤立组已经人工归纳如下：

### P0：跨文明主网络

- arita-jingdezhen｜有田与景德镇青花传统
- chinoiserie｜欧洲中国风与景德镇瓷
- delft-jingdezhen｜代尔夫特陶器与中国瓷器
- dutch-east-india-company｜荷兰东印度公司与瓷器贸易
- europe-jingdezhen｜欧洲与景德镇瓷器
- export-porcelain｜外销瓷
- islamic-world-jingdezhen｜伊斯兰世界与景德镇瓷
- japanese-export-porcelain｜面向日本市场的景德镇瓷
- korean-jingdezhen-bluewhite｜朝鲜半岛与景德镇青花
- kraak-porcelain｜克拉克瓷
- kinrande-export｜金襕手与日本市场
- meissen-jingdezhen｜迈森瓷与景德镇
- portuguese-porcelain-trade｜葡萄牙与中国瓷器贸易
- southeast-asia-jingdezhen｜东南亚与景德镇瓷器
- binary-formula｜二元配方
- blue-white-cobalt｜青花钴料

### P1：景德镇生产系统

- chang-river｜昌江与景德镇瓷业
- changnan-town｜昌南镇与景德镇早期瓷业
- fuliang-county｜浮梁与景德镇瓷业
- kaolin-clay｜高岭土
- porcelain-stone｜瓷石
- porcelain-clay-processing｜瓷土加工
- porcelain-raw-material-system｜瓷业原料供应体系
- river-transport｜水运与瓷业运输
- porcelain-wharf｜瓷业码头
- kiln-fuel-system｜窑业燃料供应
- porcelain-craft-division-labor｜制瓷分工
- porcelain-standardization｜瓷器生产标准化
- ceramic-workers｜陶工与工匠
- ceramic-guilds｜陶瓷行会与行业组织
- imperial-kiln-management｜御窑管理制度
- imperial-civilian-kilns｜官民窑关系

### P1：核心工艺与器物

- ming-imperial-bluewhite｜明代御窑青花
- xuande-bluewhite｜宣德青花
- chenghua-doucai｜成化斗彩
- doucai-porcelain｜斗彩
- wucai｜五彩瓷
- overglaze-enamels｜釉上彩
- underglaze-red｜釉里红
- red-glaze-jingdezhen｜景德镇高温红釉
- langyao-red｜郎窑红
- fencai-technique｜粉彩装饰技术
- qing-peach-shaped-ewer｜清代青花釉里红桃形壶
- xuande-copper-red-bowl｜宣德铜红釉碗
- yongle-copper-red-dish｜永乐铜红釉盘

### P1：东亚与全球比较窑业

- korea-ceramics｜朝鲜半岛陶瓷
- joseon-ceramics｜朝鲜王朝陶瓷
- icheon-ceramics｜利川陶瓷
- longquan-kiln｜龙泉窑·大窑
- cizhou-kiln｜磁州窑·观台
- ding-kiln｜定窑·曲阳
- jun-kiln｜钧窑·禹州
- ru-kiln｜汝窑·清凉寺
- ge-kiln｜哥窑
- guan-kiln｜官窑
- yue-kiln｜越窑·上林湖
- xing-kiln｜邢窑
- yaozhou-kiln｜耀州窑·黄堡
- changsha-kiln｜长沙窑
- dehua-kiln｜德化窑
- shiwan-kiln｜石湾窑
- liling-kiln｜醴陵窑

## Evidence QA 规则

本轮没有把C-grade关系机械升级为A/B，也没有因为两个Entry主题相似就自动创建关系。

真正的修复格式必须是：

Entry → Relation Claim → Evidence → Source → Evidence Type → Confidence → Boundary → Evidence Grade

因此本轮是Network QA，而不是“关系灌水”。

## 冻结

- 不增加Entry。
- 不改变Canonical Admission。
- 不用Recommendation替代Relation。
- 不用媒体数量判断网络价值。
- 不把C级关系批量升级。
- 220→320继续冻结。

版本：`phase7.8-cross-civilization-network-qa-v1`

## v2 Network Repair Update — 2026-09-20

本阶段开始执行真正的 P0/P1 Network Repair，而非只做审查。

### 已完成
- 新增并证据标注一批 P0/P1 Relation Edges。
- 关系类型严格使用既有 schema：related / person / object / kiln / craft / period / source。
- A 级关系主要使用 UNESCO 2026 世界遗产决定/提名文件与博物馆对象记录；B 级关系保留比较性或上下位语义边界。
- 关系 note 写入具体 Relation Claim、证据说明、来源与边界，不把“相似”自动写成“技术传播”。
- Network QA 已刷新为 v2：connected 58、single_strong 29、multi_weak 11、isolated 92。
- 因此至少一个 A/B evidence-grade edge 的 Canonical 已从 33 增至 87 个。

### 本轮修复的核心网络
- 二元配方 → 景德镇 / 高岭土 / 瓷石
- 青花钴料 → 景德镇 / 青花瓷
- 原料、燃料、河流、码头、分工、标准化、行会 → 景德镇生产系统
- 御窑管理 → 御窑厂 / 官民窑体系
- 明代御窑青花 → 御窑 / 宣德青花
- 斗彩、五彩、釉上彩、釉里红、高温红釉 → 工艺/器物节点
- 有田、朝鲜半岛、日本市场 → 青花/日本/东亚网络
- 欧洲、代尔夫特、迈森、葡萄牙、VOC、克拉克瓷、伊斯兰世界、东南亚 → 外销瓷/欧洲/全球网络

### 仍需继续
92 个 Canonical 仍然完全孤立；下一批应继续处理剩余 P1/P2，而不是为了数量把弱证据关系灌入网络。

版本：phase7.8-cross-civilization-network-qa-v2


## v3 Network Repair Update — 2026-09-20

继续执行：92 Isolated → P1 剩余 → P2 比较窑业 → Claim-by-Claim Evidence → Network Edge。

本轮新增 51 条 evidence-graded relation edges，重点覆盖：
- P1 核心工艺/器物：明代御窑青花、宣德青花、成化斗彩、斗彩、五彩、釉上彩、釉里红、红釉、永乐/宣德铜红器物、二元配方、青花钴料、原料体系。
- P1 生产系统：柴窑/燃料、嘉靖—万历生产、原料加工。
- P2 比较窑业：中国历代窑业与景德镇的比较网络，包括龙泉、磁州、定、钧、汝、哥、官、越、邢、耀州、长沙、德化、石湾、醴陵，以及朝鲜半岛/利川、日本等比较节点。
- 欧洲比较网络：英国、塞夫勒、利摩日、斯托克等。
- 人物/对象：王士性、殷弘绪、秦锡麟、万历青花器、雍正青釉器等。

Network QA v3：connected 70、single_strong 50、multi_weak 11、isolated 59。
190 个 Canonical 中，至少有一个 A/B evidence-grade edge 的节点达到 131/190（68.9%）。

关系仍严格遵循既有 schema；没有批量 C→A/B，也没有把“风格相似”自动解释成技术传播。比较窑业关系统一标明为 comparative/contextual，具体传播或影响仍需对象/考古/文献证据支持。


## v4 Second-Layer Civilization Network — 2026-09-20

本轮不再以“孤立节点 → 景德镇”作为主要策略，而是建立第二层 Network Chain：Entry → regional/market/documentary node → civilizational node → comparison/feedback node。

新增 77 条 evidence-graded relation edges，形成多跳链：
- 景德镇青花 → 日本市场 → 有田/日本陶瓷 → 东亚比较层。
- 景德镇外销瓷 → 欧洲 → 代尔夫特 → 中国风 → 迈森/欧洲瓷器。
- 青白瓷 → 伊斯兰世界 → 外销网络。
- 二元配方 → 高岭土/瓷石 → 欧洲瓷器技术史；该技术链使用 UNESCO 明确表述的“important inspiration and influence”边界。
- 克拉克瓷 → 青花/贸易机构 → 欧洲网络。
- 朝鲜半岛 → 朝鲜王朝 → 日本陶瓷，建立东亚比较层，但不声称直接技术传播。
- 《陶说》、朱琰、王士性、殷弘绪、杜赫德、《天工开物》形成文献/人物交叉网络。
- 粉彩技术 → 釉上彩 → 粉彩瓷，并接入欧洲瓷器比较层。

Network QA v4：connected 74、single_strong 46、multi_weak 11、isolated 59。
190 Canonical 中至少一个 A/B evidence-grade edge 的节点达到 131/190；关系总量 270，其中 A/A+/B 为 193。

重要治理规则：多跳路径不等于单条边的证据强度。每一条 Relation 仍必须单独满足 Claim → Evidence → Source → Boundary → Grade；图上的路径只能用于探索，不可把路径推导结果当作已证实事实。


## v5 Bridge Node Repair — 2026-09-20

本轮从 59 个 isolated 中识别并处理真正的 Bridge Nodes，而不是继续做单跳“节点→景德镇”。围绕日本、伊斯兰世界、东南亚、欧洲、朝鲜半岛、中国其他窑业与对象级证据，新增 67 条 A/B evidence-graded edges。

重点桥接：伊斯兰陶瓷→伊斯兰世界→景德镇；西亚陶瓷→伊斯兰陶瓷；东南亚陶瓷→景德镇东南亚网络→漳州窑；瓷器贸易→外销瓷→欧洲；康熙外销瓷→欧洲；金襕手对象→日本/外销网络；明清具体青花对象→青花全球网络；五彩/釉上彩对象→技术网络；考古地层→瓷片/御窑落选瓷片；款识→年款→御窑系统；民窑/窑主/窑业组织→生产组织网络。

Network QA v5：connected 87、single_strong 74、multi_weak 10、isolated 19。entry_relations 共 311 条，其中 A/A+/B 为 234 条。190 Canonical 中已有 161/190 具有至少一个 A/B evidence-grade edge。

Bridge Node 原则：桥梁价值优先于边数量；跨网络的路径只能用于探索，不能把多跳路径当作单条历史事实；每条边仍独立维护 Claim → Evidence → Source → Boundary → Grade。


## v6 Bridge Centrality — 2026-09-20

本轮进入 Bridge Centrality：不再按孤立节点数量驱动修复，而是寻找能同时连接日本—朝鲜—东南亚—伊斯兰—欧洲子网络的少数高价值桥梁。

新增 62 条 evidence-graded edges。核心桥梁包括：Arita/日本出口瓷、Kraak 青花、VOC、康熙外销瓷、Delft、UNESCO 景德镇遗产节点 r23，以及伊斯兰陶瓷、东南亚陶瓷等区域节点。

证据支持的关键多跳链包括：景德镇青花 → Kraak/日本青花 → 有田 → VOC → 欧洲；日本出口瓷 → 欧洲市场；VOC → Batavia/东南亚 → 欧洲；UNESCO/r23 → 青花/二元配方/外销瓷/欧洲技术史；伊斯兰陶瓷与东南亚陶瓷进入同一比较网络。

Network QA v6：connected 88、single_strong 73、multi_weak 10、isolated 19；entry_relations 332 条，其中 A/A+/B 255 条。

Bridge Centrality 治理：桥梁不是按度数机械排名；必须能够连接不同知识子网络，并且每条跨网络关系都独立满足 Claim → Evidence → Source → Boundary → Grade。多跳路径仅作为探索路径，不作为事实证明。


## v7 Bridge Centrality Analysis — 2026-09-20

完成第一轮真正的 Bridge Centrality Analysis。基于 263 条 A/A+/B 关系构建证据网络，并按预定义的文明子网络计算 cross-group coverage 与 two-hop bridge pairs；由于数据库未安装 pgrouting/graph extension，本轮不冒充精确 Brandes betweenness，而采用可复核的 Bridge Centrality proxy（跨子网络覆盖 + 两跳邻域对数），再做 Claim-by-Claim Evidence QA。

核心候选 16 个：r23、blue-and-white、export-porcelain、japanese-export-porcelain、arita-kiln、kraak-porcelain、europe-porcelain、japan-ceramics、dutch-east-india-company、islamic-ceramics、islamic-world-jingdezhen、europe-jingdezhen、korean-jingdezhen-bluewhite、chinoiserie、southeast-asia-jingdezhen、binary-formula。

其中 cross-group coverage 前列：r23=7、blue-and-white=6、export-porcelain=5、japanese-export-porcelain=4、arita-kiln=4；two-hop bridge pairs 前列：blue-and-white=465、export-porcelain=136、japanese-export-porcelain=55、europe-jingdezhen=55、japan-ceramics/r23/europe-porcelain=28。

Claim-by-Claim QA 后仅补 8 条高价值 A/B 跨网络边：青花→东南亚陶瓷；日本出口瓷→东南亚；日本陶瓷→东南亚；外销瓷→伊斯兰陶瓷；克拉克瓷→代尔夫特；朝鲜半岛/景德镇青花→日本陶瓷；欧洲/景德镇瓷器→日本出口瓷；伊斯兰世界/景德镇→东南亚陶瓷。

Network QA v7：connected 88、single_strong 73、multi_weak 10、isolated 19；entry_relations 340，其中 A/A+/B 263。

重要：本轮没有把“betweenness proxy”写成数学上的精确 betweenness。下一阶段若需要正式 Brandes betweenness，应在离线脚本中导出 340-edge 图并运行 NetworkX/等价实现后再写入指标；数据库中的 network_qa 仍只记录事实网络状态，不写预测性排名。


## v8 Bridge Node Phase 2 — 15-Node Deep Evidence Audit — 2026-09-20

本轮直接进入 Bridge Node Phase 2，不再按“还能连谁”扩边，而是逐节点回答“缺哪一条关键桥，且该桥能否真正缩短两个知识/文明子网络的结构距离”。

### 15 节点审查结论
- 青花瓷 → 欧洲瓷器：新增 A
- 外销瓷 → 东南亚陶瓷：新增 A
- 日本出口瓷 → 克拉克瓷：新增 A；日本出口瓷 → 迈森瓷由 B 升级 A
- 克拉克瓷 → 欧洲瓷器：新增 A
- 伊斯兰世界与景德镇瓷 → 伊兹尼克陶瓷：新增 A
- 日本陶瓷 → 欧洲瓷器：新增 A
- 有田窑 → 朝鲜半岛陶瓷：新增 A
- 有田窑 → 荷兰东印度公司与瓷器贸易：新增 A
- 欧洲与景德镇瓷器 → 迈森瓷：新增 A
- 二元配方：不新增直接“二元配方→迈森”边；保留 UNESCO 已明确支持的“二元配方→欧洲高温硬质瓷技术史”边界
- 伊斯兰陶瓷 → 青花瓷：B→A
- 克拉克瓷 → 伊斯兰陶瓷：B→A
- 东南亚陶瓷 → 伊斯兰陶瓷：B→A
- UNESCO/r23：不增加泛化桥，继续作为证据/解释枢纽

### 结构性结果
当前已形成可由独立证据边支持的短链：
1. 朝鲜半岛 → 有田 → 日本出口瓷 → VOC → 欧洲
2. 景德镇青花 → Kraak → 有田/日本出口瓷 → 欧洲
3. 景德镇青花 → 伊斯兰陶瓷 → Iznik
4. 景德镇外销瓷 → 东南亚 → 伊斯兰世界
5. 景德镇/中国出口瓷 → 欧洲消费 → Meissen再生产

这些是网络中的多跳探索路径，不应被压缩成单条历史事实。

### 数学网络重算
- A/A+/B evidence edges：273
- nodes：161
- Brandes normalized betweenness 已按当前图重新计算
- 当前结构主轴：青花瓷、景德镇窑、外销瓷、欧洲瓷器
- 青花 cross-group coverage：9
- 新增/升级不会被旧中心性排名沿用；后续任何边变化均必须重新计算

### 本轮冻结决定
- 不为了降低 isolated 数量继续灌边
- 不把 UNESCO/r23 变成万能关系跳板
- 不把二元配方直接写成“迈森技术来源”
- 不把朝鲜工匠参与日本早期瓷业扩大为“日本瓷器全部源于朝鲜”
- 不把多跳路径当作单条事实

下一步不应继续堆关系数量，而应对上述反馈回路做 Path-level Evidence QA：逐跳检查年代、方向、对象、证据类型与边界是否共同成立。

版本：phase7.8-bridge-node-phase2-v1
