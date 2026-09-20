# Bridge Centrality Analysis — 2026-09-20

更新时间：2026-09-20（Bridge Node Phase 2 后重算）

当前证据网络：273 条 A/A+/B evidence-grade relations，161 个节点。

采用标准 Brandes shortest-path betweenness centrality：
- normalized=true
- endpoints=false
- weight=None
- undirected graph

归一化方式与 NetworkX betweenness_centrality(normalized=True)一致。

## Bridge Priority

Bridge Priority Score = 0.55 × normalized Brandes BC + 0.30 × cross-group coverage/max coverage + 0.15 × evidence quality。

Evidence quality：
- A+ = 1.0
- A = 1.0
- B = 0.7

Cross-group coverage 是本项目定义的知识网络 proxy，不是客观文明分类。Priority 只用于 QA / 内容投入顺序，不代表历史重要性、内容质量或价值判断。

## Phase 2 后 Top 20

|Rank|Node|Brandes BC|Cross Groups|Evidence|Priority|
|---:|---|---:|---:|---:|---:|
|1|青花瓷|0.82661|9|0.868|0.885|
|2|景德镇窑|0.80509|3|0.838|0.668|
|3|外销瓷|0.34211|7|0.829|0.546|
|4|欧洲瓷器|0.32350|6|0.908|0.514|
|5|UNESCO：景德镇手工瓷业遗存|0.06870|7|0.888|0.404|
|6|面向日本市场的景德镇瓷|0.10395|6|0.893|0.391|
|7|日本陶瓷|0.09610|6|0.782|0.370|
|8|御窑厂遗址|0.26748|2|0.908|0.350|
|9|粉彩瓷|0.28916|2|0.825|0.349|
|10|伊斯兰世界与景德镇瓷|0.10774|5|0.786|0.344|
|11|有田窑·有田烧|0.03744|5|0.967|0.332|
|12|东南亚陶瓷|0.04402|5|0.900|0.326|
|13|二元配方|0.13685|3|1.000|0.325|
|14|青花钴料|0.26923|1|0.850|0.309|
|15|克拉克瓷|0.02078|5|0.867|0.308|
|16|伊斯兰世界陶瓷|0.03117|4|0.950|0.293|
|17|唐英|0.12438|2|1.000|0.285|
|18|欧洲与景德镇瓷器|0.10993|3|0.820|0.283|
|19|荷兰东印度公司与瓷器贸易|0.01293|4|0.850|0.268|
|20|欧洲中国风与景德镇瓷|0.02923|3|0.900|0.251|

## Phase 2 Structural Bridge Decisions

本轮只加入能够缩短结构距离的证据边：

1. 青花瓷 → 欧洲瓷器（A）
2. 外销瓷 → 东南亚陶瓷（A）
3. 日本出口瓷 → 克拉克瓷（A）
4. 克拉克瓷 → 欧洲瓷器（A）
5. 伊斯兰世界与景德镇瓷 → 伊兹尼克陶瓷（A）
6. 日本陶瓷 → 欧洲瓷器（A）
7. 有田窑 → 朝鲜半岛陶瓷（A）
8. 有田窑 → 荷兰东印度公司与瓷器贸易（A）
9. 欧洲与景德镇瓷器 → 迈森瓷（A）

同时完成证据升级：
- 日本出口瓷 ↔ 迈森瓷：B → A
- 伊斯兰陶瓷 ↔ 青花瓷：B → A
- 克拉克瓷 ↔ 伊斯兰陶瓷：B → A
- 东南亚陶瓷 ↔ 伊斯兰陶瓷：B → A

## 结构解释

青花瓷、景德镇窑、外销瓷、欧洲瓷器构成当前证据网络的主要结构骨架。

面向日本市场的景德镇瓷、日本陶瓷、有田、克拉克瓷、伊斯兰世界与景德镇瓷、东南亚陶瓷、欧洲与景德镇瓷器、VOC，是当前最值得做路径级 QA 的跨网络节点。

UNESCO/r23 的数学 BC 不高，但 cross-group coverage 高，是证据与解释枢纽，而不是“所有文明都应该与它直接建立关系”的万能节点。

二元配方、青花钴料、粉彩、御窑等部分主要承担技术/生产子图桥梁，不因 BC 较高自动视为跨文明桥。

## Governance

1. Brandes BC 是结构指标，不等于历史重要性。
2. Cross-group coverage 是项目内部 proxy。
3. Priority Score 只决定下一轮 QA / 内容投入顺序。
4. 排名高不自动创建关系。
5. 新边必须独立满足 Claim → Evidence → Source → Boundary → Grade。
6. 多跳路径只能作为探索路径，不作为单条历史事实。
7. 图发生变化后必须重新计算，不沿用旧排名。
8. 不为了降低 isolated 数量而制造弱关系。

## Reproduction

.ai/data/bridge_centrality_edges_20260920.csv 是本阶段 273 条 A/A+/B 证据边的冻结快照。

scripts/analyze_bridge_centrality.py 使用 NetworkX betweenness_centrality(normalized=True, endpoints=False, weight=None) 复现 Brandes BC。

本次数学 BC 已按当前 273-edge snapshot 重新计算；工具运行时使用等价 Brandes BFS/dependency accumulation 实现进行核算。

版本：bridge-centrality-matrix-phase2-20260920
