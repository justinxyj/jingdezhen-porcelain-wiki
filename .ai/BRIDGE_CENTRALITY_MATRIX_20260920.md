# Bridge Centrality Analysis — 2026-09-20

当前生产网络中有 263 条 A/A+/B evidence-grade relations，得到 161 个节点。采用标准 Brandes shortest-path betweenness centrality：normalized=true、endpoints=false、weight=None。NetworkX 文档说明该指标统计节点位于所有节点对最短路径中的比例，算法采用 Brandes。

Bridge Priority Score = 0.55 × normalized Brandes BC + 0.30 × cross-group coverage/max coverage + 0.15 × evidence quality。Evidence quality 中 A+=1、A=1、B=0.7。该分数只用于下一轮 QA/内容投入顺序，不是历史重要性或内容质量评分。

## Top 20

|Rank|Node|Brandes BC|Cross Groups|Evidence|Priority|
|---:|---|---:|---:|---:|---:|
|1|青花瓷|0.83036|8|0.855|0.978|
|2|景德镇窑|0.81896|3|0.838|0.781|
|3|外销瓷|0.34235|6|0.820|0.575|
|4|UNESCO：景德镇手工瓷业遗存|0.11202|7|0.888|0.470|
|5|面向日本市场的景德镇瓷|0.16571|5|0.885|0.430|
|6|欧洲瓷器|0.25753|3|0.867|0.413|
|7|御窑厂遗址|0.28386|1|0.908|0.362|
|8|青花钴料|0.28324|1|0.850|0.353|
|9|二元配方|0.13546|3|1.000|0.352|
|10|粉彩瓷|0.27247|1|0.825|0.342|
|11|伊斯兰世界与景德镇瓷|0.10593|4|0.750|0.333|
|12|日本陶瓷|0.09378|4|0.760|0.326|
|13|有田窑·有田烧|0.02504|4|0.957|0.310|
|14|东南亚陶瓷|0.04084|4|0.850|0.305|
|15|克拉克瓷|0.01677|4|0.786|0.279|
|16|欧洲与景德镇瓷器|0.10973|2|0.807|0.269|
|17|伊斯兰世界陶瓷|0.03455|3|0.800|0.255|
|18|荷兰东印度公司与瓷器贸易|0.00375|3|0.800|0.235|
|19|欧洲中国风与景德镇瓷|0.03472|2|0.900|0.233|
|20|釉里红|0.11509|1|0.700|0.219|

## Interpretation

青花瓷、景德镇窑、外销瓷构成当前证据网络的主要结构骨架。日本出口瓷、日本陶瓷、有田、克拉克瓷、伊斯兰世界与景德镇瓷、东南亚陶瓷、欧洲瓷器、欧洲与景德镇瓷器，是下一轮 Claim-by-Claim Evidence QA 的重点。二元配方、青花钴料、御窑、粉彩、釉里红虽然数学 BC 较高，但部分主要连接景德镇内部技术/生产子图，不能仅因 BC 高就视为跨文明桥。UNESCO/r23 更像证据与解释枢纽。

## Governance

1. Brandes BC 是结构指标，不等于历史重要性。
2. Cross-group coverage 是本项目的文明网络 proxy，不是客观文明分类。
3. Priority Score 只决定下一轮 QA/内容投入顺序。
4. 排名高不自动创建关系。
5. 新边必须独立满足 Claim → Evidence → Source → Boundary → Grade。
6. 多跳路径只能作为探索路径，不作为单条历史事实。
7. 图发生变化后必须重新计算，不沿用旧排名。

## Reproduction

.ai/data/bridge_centrality_edges_20260920.csv 是本次 263 条证据边的冻结快照。
scripts/analyze_bridge_centrality.py 使用 NetworkX betweenness_centrality(normalized=True, endpoints=False, weight=None) 复现 Brandes 结果。
