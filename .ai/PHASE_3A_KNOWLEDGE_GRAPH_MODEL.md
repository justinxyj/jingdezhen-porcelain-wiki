# Phase 3A — 知识图谱节点与边统一模型

## 目标
把 entry、World、entry_relation、category、source、media、craft process、timeline 统一成网站可直接调用的只读知识网络；原始表仍是事实来源，不复制成第二套数据库。

## 节点
- entry：149 个已发布条目
- world：7 个知识世界
- category：5 个公开条目分类
- source：来自条目、媒体、工序、时间轴的公开来源 URL，去重后形成稳定 source:md5(url) 节点
- media：approved + verified 的公共媒体
- craft_process：72 道 canonical 工序
- timeline：50 个时间轴上下文

## 边
- entry → world：world_primary / world_secondary
- entry → category：classified_as
- entry → entry：entry_relation:<relation_type>
- entry → media：has_media
- entry → craft_process：craft_process:<relation_type>
- craft_process → craft_process：craft_relation:<relation_type>
- entry → timeline：has_timeline_context
- entry → source：cites_source
- media → source：media_source
- craft_process → source：craft_source
- timeline → source：timeline_source

## 设计原则
1. 原始表继续作为事实来源；graph view 只负责统一读取。
2. entry_worlds Semantic Freeze 是 World 语义边界，推荐算法不得重新推断。
3. 公共媒体继续遵守 approved + verified；内部候选媒体不进入公共图谱。
4. source 以 URL 去重，避免同一资料被复制成多个节点。
5. 节点/边使用稳定字符串 ID，网站可以按 node_id 查询局部邻域。
6. world rationale 保留在边上，为下一阶段的可解释相关条目提供依据。

## 当前生产规模
- 485 nodes
- 1,378 edges
- orphan edges：0
- entry/world mapping：149 primary + 167 secondary = 316

## 网站调用层
docs/javascripts/knowledge-store.js 新增 JDM_KNOWLEDGE.graph({nodeType,nodeId,limit})：
- 不传 nodeId：读取节点集合
- 传 nodeId：读取该节点的直接邻接边
- 可按 nodeType 过滤
- 默认 500 条上限

## 本阶段不做
不做黑盒推荐、不改变 316 条冻结 mapping、不修改原始 entry_relation。

## Phase 3B-2 推荐质量结论
知识图谱中的“存在路径”不等于“应该推荐”。共享 World 与共享工艺流程目前只适合作为探索/图谱导航关系，不直接进入相关推荐；相关推荐优先消费有明确 entry-specific 证据的直接关系。