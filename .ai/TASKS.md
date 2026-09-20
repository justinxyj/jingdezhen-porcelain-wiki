# Tasks

## P0 — 项目记忆
- [x] 建立 .ai 项目记忆体系
- [x] 合并记忆 PR
- [x] 固化每个大阶段结束时的状态更新流程

## P0 — 基线接管审计
- [x] 对比 6a8700b → 当前 main
- [x] 核验当前 main 的真实 commit
- [x] 核验后续 PR 的合并/关闭状态
- [x] 核验当前 CI / Pages
- [x] 核验 live Supabase

## P0 — Supabase 安全
- [x] 为 craft_media_candidates 启用 RLS
- [x] 为 timeline_media_candidates 启用 RLS
- [x] 撤销 public/anon/authenticated 对候选媒体表的表级权限
- [x] 生产状态验证
- [x] GitHub migration 记录

## P1 — Canonical Entry / Media
- [ ] 复核 Issue #2
- [x] 检查核心 entry/media 真实数据通路
- [ ] 清理错误复用媒体，同时保留来源与审计记录
- [x] 修复 Met 馆藏图旧硬编码屏蔽
- [x] 72 工序前端改为读取 canonical craft_processes
- [x] 验证关系按稳定 ID 加载

## P1 — 工程质量
- [x] 核验 mkdocs strict / Museum QA
- [x] 核验 Pages 部署可观察性
- [x] 对齐公共媒体前端审核门槛：只加载 approved + verified
- [x] 数据库层阻止普通用户伪造 approved/verified 媒体
- [x] 公共媒体改为列最小化的 `media` 直读 + RLS，避免公开内部审核字段
- [x] 对齐 schema / migration / frontend data contract
- [x] 修复 knowledge-store API 异常静默空数组
- [x] 详情页改为定向 entry + 有上限关系查询
- [x] 外部图片恢复增加超时、有限重试、缓存与并发上限
- [x] 移除 site-privacy 文本误删逻辑
- [x] 降低 timeline MutationObserver 全量扫描
- [ ] 审核剩余 SECURITY DEFINER function WARN

## P2 — 内容
- [ ] 按来源驱动扩充高价值知识条目
- [ ] 补人物/窑址/器物/工艺之间关系
- [ ] 不给无来源人物或器物强行编写事实

## P2 — 产品
- [ ] 继续数字博物馆入口与视觉交互
- [ ] 前提：核心数据层稳定且可验证

- [x] 第三轮：修复窑址地图容器裁剪/覆盖问题
- [x] 第三轮：修复首页、/entry/、时间轴、72工序及旧博物馆组件夜间模式可读性
- [x] 第三轮：加强 72 工序与窑址地图移动端布局
- [ ] 第三轮：取得可用浏览器/截图能力后完成上线网页像素级验收

- [x] 第三轮：修复用户实测的大量 The Met 图片破损问题（运行时对象 API + Commons 恢复 + 动态图片监听）
- [x] 第三轮：清除静态页面残留的内部 cite 标记
- [ ] 第三轮：等待最新图片修复版本部署后，重新按截图场景验收器物目录与详情弹窗

- [x] 第三轮：修复首页默认面包屑/顶部留白
- [x] 第三轮：放大首页自定义品牌文字
- [x] 第三轮：修复首页源码按钮 404（edit_uri + 首页隐藏）
- [ ] 第三轮：部署后复测首页三项问题

- [x] 第三轮：修复历史时间轴按数据库更新时间排序导致的年代倒序
- [x] 第三轮：历史时间轴按时代与起始年份排序，“东晋—唐”第一，“五代—宋”第二，1909/1949/2002/2026 等近现代节点置后

## 新一轮审计修复
- [x] H-1 认证过期错误统一为 AUTH_EXPIRED / 401
- [x] H-2 关系查询严格 UUID 校验并移除动态 OR filter
- [x] H-3 主媒体/Revision 版本唯一约束与事务回归测试
- [x] M-1 历史时间轴改用结构化 timeline_sort_year
- [x] M-2 evidence-hub 安全 DOM 渲染与 URL 白名单
- [x] M-3 目录搜索重绘降频到 animation frame
- [x] M-4 strict TypeScript 数据契约与错误契约
- [x] M-5 外部图片恢复生命周期中止、负缓存、对象 ID 校验
- [x] M-6 关系稳定排序、去重、截断提示
- [x] M-7 核心查询 EXPLAIN + 生产索引验证
- [ ] M-4 浏览器核心 JS 全量迁移 TypeScript（当前不作为阻塞项，现阶段保留 JS + strict contract）

## 本轮审计
- [x] S1 核验并统一最终 media 公共访问架构
- [x] S2 建立 canonical public ACL migration + ACL smoke
- [x] H1 修复馆长后台 schema drift
- [x] H2 详情关系查询统一认证请求层
- [x] H3 初始化/Observer 生命周期治理
- [x] H4 保持分页与稳定排序，继续关注数据增长
- [x] H5 PR 与生产 smoke 解耦
- [x] M1 核心 JS 开启 checkJs；严格 contract 单独配置
- [x] M2 evidence-hub 安全 DOM 渲染
- [x] M3 动态重绘降频
- [x] M4 动态 HTML 安全边界
- [x] M5 外部图片生命周期/负缓存

## Wiki 2.0 全站改造
- [x] 完成《Wiki 2.0 最终信息架构蓝图》
- [x] 完成《Wiki 2.0 全站改造施工清单》并固化到 .ai/WIKI_2.0_CONSTRUCTION_PLAN.md
- [x] Sprint A：重构顶部导航与首页入口
- [x] Sprint B：统一七大知识世界入口
- [ ] Sprint C：统一数字博物馆工具层
- [ ] Sprint D：统一 /entry/ 知识节点页 2.0
- [ ] Sprint E：补全知识关系网络
- [ ] Sprint F：旧入口清理、视觉统一与全站发布验收

### Sprint A — 导航与首页重构
- [x] 顶部导航改为“探索景德镇 / 数字博物馆 / 知识网络”三层结构
- [x] 首页加入七大知识世界入口
- [x] 首页统一数字博物馆工具入口
- [x] 新增知识网络总览 / 关系探索 / 全球陶瓷网络入口
- [ ] Sprint A：MkDocs strict / Pages smoke / 移动端回归验收（当前修复中：上一轮 QA 误报网络页面路径）

### Sprint B
- [x] 建立七大知识世界独立数据层
- [x] 149 个已发布条目全部挂载 primary world
- [x] 建立 secondary cross-world mappings
- [x] 7 个世界入口接入动态条目浏览器
- [x] Phase 2：第一轮语义审校
- [x] Phase 2B：第一轮深层语义清洗（395 → 372）
- [x] Phase 2C：人物→历史、全球窑址→历史边界深审（并入连续 Phase 2B 记录）
- [x] Phase 2B 深层语义续审：生产 323 mappings（149 primary + 174 secondary）
- [x] Phase 2B：人物→研究/工艺边界逐条审校
- [x] Phase 2B：文献→器物/工艺/空间边界逐条审校
- [x] Phase 2B：全球窑址→研究边界逐条审校
- [x] Phase 2B：历史→器物/空间边界逐条审校
- [ ] Phase 2B：映射冻结前总体验收与知识图谱/推荐系统可解释入口语义规则
- [ ] Phase 3：知识图谱与相关条目

## Phase 2B 最新生产回归
- 当前：149 published / 149 primary / 167 secondary / 316 total mappings
- 重复 entry-world 边：0
- primary cardinality anomalies：0


## Phase 2B Final Audit
- [x] 316 mappings 全量冻结前总体验收
- [x] secondary rationale 模板化残留清理
- [x] 3+ secondary 高密度条目逐条复核
- [x] 149 primary / 149 published / 167 secondary / 316 total 回归
- [x] 重复 entry-world 边检查
- [x] primary cardinality 检查
- [x] semantic freeze gate：通过
- [ ] Phase 2B：正式固化 semantic freeze 规则与变更门槛
- [ ] Phase 3：知识图谱与相关条目


## Phase 2B Semantic Freeze
- [x] 固化 `.ai/SEMANTIC_FREEZE_RULES.md`
- [x] 明确 Primary / Secondary / rationale / 多世界 / 推荐系统语义门槛
- [x] 固化后续 entry_worlds 生产变更与回归要求


## Phase 3A — 知识图谱节点与边统一模型
- [x] 建立 knowledge_graph_nodes 统一节点视图
- [x] 建立 knowledge_graph_edges 统一关系视图
- [x] 接入 entry / world / category / source / media / craft_process / timeline
- [x] source 按公开 URL 去重并形成稳定节点 ID
- [x] 公共媒体仅纳入 approved + verified
- [x] graph API 接入 knowledge-store.js，可按节点类型/节点 ID读取
- [x] 生产回归：485 nodes / 1,378 edges / 0 orphan edges
- [x] 同步 .ai/PHASE_3A_KNOWLEDGE_GRAPH_MODEL.md 与 migration
- [ ] Phase 3B：相关条目候选生成与可解释推荐规则


## Phase 3B — 相关条目候选生成与可解释推荐
- [x] 建立 knowledge_recommendations 可解释候选视图
- [x] 直接关系优先于共享世界/共享工艺桥接关系
- [x] 保留推荐 reason 与 weight，不使用黑盒模型
- [x] 去重：同一来源条目到同一目标条目只保留最高优先级路径
- [x] knowledge-store.js 新增 recommendations(entryId,{limit})
- [x] 生产验证：12,140 条去重后的候选关系
- [x] 未修改 Phase 2B 冻结的 316 条 World mappings
- [ ] Phase 3B 下一轮：人工审校推荐质量、增加时间轴/来源桥接规则，并接入条目详情页


## Phase 3B-2 — 推荐质量审校
- [x] 分层压力测试人物/历史/器物/窑址/文献
- [x] 淘汰共享 World 直接推荐规则
- [x] 淘汰共享 craft_process 直接推荐规则
- [x] 过滤通用 relation rationale
- [x] 最终推荐池回归：8 条高置信候选
- [x] 新增推荐质量门槛 migration
- [x] Phase 3B-3：第一批高置信 entry-specific 关系证据扩充（4 条）\n- [x] Phase 3B-3 第二轮：证据筛选并处理 9 条关系（6 条补证据、3 条删除）\n- [x] Phase 3B-3：按证据强度完成高价值关系扩充并收口；后续具体器物节点转入独立内容准入任务


## Phase 3B-3 第三轮 — 证据等级与人物关系深审
- [x] 为 entry_relations 建立 A+ / A / B / C / D evidence_grade 字段
- [x] knowledge_graph_edges 携带 evidence_grade 元数据
- [x] recommendation view 改为只消费 A+ / A 关系，不再依赖 note 长度作为唯一门槛
- [x] 清理人物→器物 / 人物→窑址通用占位关系
- [x] 新增唐英→雍正仿钧新紫釉天球瓶的 entry-specific 人物→器物关系
- [x] 将张松茂→粉彩瓷校正为 B：关系合理，但现有证据不足以达到推荐级
- [ ] 继续对唐英、年希尧、郎廷极、臧应选、王琦、王步、田鹤仙、王锡良、刘远长、黄云鹏等人物寻找 A+/A 级具体器物/窑址证据


## Phase 3B-3 第四轮 — A+ 高价值人物关系
- [x] 郎廷极 → 御窑厂遗址：A+
- [x] 年希尧 → 御窑厂遗址：A+
- [x] 臧应选 → 御窑厂遗址：A+
- [x] 黄云鹏 → 青花瓷：A+
- [x] 未发现足够 entry-specific 证据时不强行建立人物→具体器物关系
- [x] 下一轮推荐关系扩展已停止；郎窑红梅瓶、黄云鹏代表仿古器物等具体节点转入独立 canonical content admission


## Phase 3B Closeout
- [x] Phase 3B-3 Round 4 evidence-grade calibration persisted to production and recorded in GitHub.
- [x] Final recommendation gate confirmed: only A+ / A relations enter `knowledge_recommendations`; B / C remain graph/exploration-only.
- [x] Final production regression: 149 published entries / 149 primary worlds / 167 secondary worlds / 316 total mappings; 0 duplicate entry-world edges; 0 primary cardinality anomalies.
- [x] Final recommendation pool: 22; evidence grades: A+ 4 / A 18 / B 1 / C 77.
- [x] Phase 3B recommendation logic is frozen; no further mechanical relation expansion in Phase 3B.
- [ ] Future high-value relation work moves to content admission / canonical entry work (for example specific object nodes), not Phase 3B recommendation tuning.
- [ ] Recommendation cards/UI integration remains a separate product task; current Phase 3B changes are backend/data-layer only.


## Phase 3C — Entry Detail Recommendations
- [x] Entry detail renderer now requests the frozen `knowledge_recommendations` pool through `JDM_KNOWLEDGE.recommendations()`.
- [x] Recommendation targets are hydrated to published canonical entries before rendering, so cards use stable entry URLs rather than internal graph IDs.
- [x] Added “你可能还想了解” recommendation section with up to 8 high-confidence recommendations per entry.
- [x] Added responsive recommendation-card styling and graceful failure messaging; existing entry/relation content remains usable if recommendations fail.
- [x] Pages deployment / browser smoke: verify recommendation cards, target navigation, mobile layout, and dark mode after deployment.
- [x] Phase 3C closeout: production recommendation UI verified after Pages data recovery; 22 recommendation targets resolve to published canonical entries.


## Phase 4 — 知识网络与产品体验升级
### Phase 4A — 知识网络第一阶段
- [x] 将统一 knowledge graph edges 暴露给前端知识网络探索器。
- [x] 建立“关系探索”真实生产数据读取层，不再停留在概念占位页。
- [x] 支持核心节点搜索、category 筛选、节点点击、邻接关系继续探索。
- [x] 核心节点统一进入 Entry Detail；知识世界节点保留为探索节点。
- [x] 增加桌面 / 移动端 / dark mode 网络探索样式。
- [ ] Pages 部署后完成 Phase 4A 浏览器 smoke。

### Phase 4B — 七大知识世界动态化
- [x] 七大世界入口统一接入 live `knowledge_worlds + entry_worlds + entries` 数据。
- [x] 新增 `JDM_KNOWLEDGE.worldOverview()`：动态读取世界定义、核心条目、跨世界入口、类别分布与世界间连接。
- [x] 七个世界页动态显示核心条目数、跨世界入口数、当前连接数。
- [x] 七个世界页动态生成代表性知识入口，并直接进入统一 Entry Detail。
- [x] 七个世界页动态显示 Connected Worlds，按真实 entry-world 重叠关系建立继续探索路径。
- [x] 保持 Phase 2B Semantic Freeze：本阶段只读取冻结 mapping，不重新推断或修改 world 归属。
- [x] 增加桌面 / 移动端 / dark mode 的世界概览与代表入口样式。
- [ ] Pages 部署后完成七个世界页面浏览器 smoke。

### Phase 4B — Entry Detail 2.0
- [x] 新增统一 `entryContext()` 数据读取层，统一获取 Entry 的关系与相关知识节点。
- [x] Entry Detail 升级为“知识节点”结构：主体介绍、节点身份、历史与空间、知识关系、相关推荐、来源。
- [x] 关系卡片直接进入统一 Entry Detail，并保留关系解释。
- [x] 历史/时间轴上下文在存在时动态进入 Entry Detail。
- [x] 相关推荐继续遵守 Phase 3B A+ / A 冻结门槛。
- [x] 增加桌面 / 移动端 Entry Detail 2.0 布局。
- [x] JavaScript syntax regression passed.
- [ ] Pages 部署后完成 Entry Detail 2.0 浏览器 smoke。


## Phase 4B — 统一搜索与发现层（2026-09-20）

- [x] 新增统一 Entry 搜索数据层 JDM_KNOWLEDGE.searchEntries()：所有公开搜索结果以 published Entry 为唯一候选源。
- [x] 新增 JDM_KNOWLEDGE.searchDiscovery()：搜索结果同时补充所属知识世界与高置信相关推荐。
- [x] 新增独立统一搜索页 search.md，搜索结果全部进入 canonical Entry Detail。
- [x] 首页、七大知识世界、关系探索、Entry Detail 均接入统一“搜索知识”入口；Material 页面由全局搜索启动器统一注入。
- [x] 关系探索搜索入口明确收敛到 Entry 知识节点；关系图仍承担邻接探索，不另建第二套内容搜索索引。
- [x] 搜索结果可继续进入知识世界、关系网络与相关推荐，形成“搜索 → Entry → 世界 / 关系 / 推荐”的连续路径。
- [x] JS syntax regression：knowledge-store / entry-search / world-browser / wiki-enhancements / network-explorer 全部通过。
- [ ] Pages deployment browser smoke：验证首页、七世界、关系网络、Entry Detail 的统一搜索入口及搜索结果跳转。


## Phase 4C — 全球陶瓷网络 × 时间 × 空间 × 知识条目（2026-09-20）

- [x] 将全球陶瓷网络从静态入口升级为 Entry 中心的综合探索层。
- [x] 新增 `JDM_KNOWLEDGE.entryNetworkContext()`：统一读取知识条目、知识世界、关系、工艺流程、相关推荐、时间元数据与空间元数据。
- [x] 新增全球网络交互页：可从关键词选择知识条目，并沿“条目 → 工艺 → 时间 → 空间 → 关系 → 推荐”连续探索。
- [x] 时间层接入现有 timeline metadata，按景德镇 / 中国其他窑业 / 世界其他地区分组，不新增未经核验的历史关系。
- [x] 空间层接入现有窑址地图坐标，并在当前条目存在时代信息时展示同一时代的已建档空间节点。
- [x] 工艺层接入现有 72 道 craft_process 图谱关系；不把工艺关系误当作相关推荐。
- [x] 关系与相关推荐继续沿用 Phase 3B 冻结的知识图谱与 A+ / A 推荐规则。
- [x] 全局网络保持知识条目为唯一 canonical 内容入口；地图只是空间呈现层。
- [x] JS syntax regression：knowledge-store / global-network 通过。
- [x] Pages deployment browser smoke：用户已实际检查线上部署，验证器物、人物、窑址三类 Entry 的时间 / 空间 / 关系 / 推荐链路正常。


## Phase 4C Closeout
- [x] 全球陶瓷网络线上 Smoke Test 完成。
- [x] 器物 / 人物 / 窑址三类 Entry 的时间、空间、关系、推荐链路均确认正常。
- [x] Phase 4C 第一轮正式封版。


## Phase 4D — 统一搜索与知识发现系统（第一轮）
- [x] 将搜索能力升级为可复用的统一 Discovery API：支持关键词、知识世界、条目类型、时代、时间轴 lane、空间坐标、时间元数据筛选。
- [x] 新增 `JDM_KNOWLEDGE.searchDiscoveryPage()`，返回结果、匹配总量与 facets；保留 `searchDiscovery()` 兼容旧调用。
- [x] 搜索索引继续只消费 `entries.status='published'` 的 canonical Entry，不创建第二套内容索引。
- [x] 搜索页升级为“搜索 + 筛选 + 继续探索”入口：世界、类型、时代、空间/时间信号、URL 状态同步、快捷键、即时建议。
- [x] 每个结果继续统一落到 Entry Detail，并提供关系网络 / 全球网络 / 相关推荐路径。
- [x] 空关键词支持按筛选条件浏览公开知识条目，适合作为 Discovery 而不只是全文检索。
- [ ] Pages 部署后完成搜索页浏览器 smoke：中文关键词、人物/器物/窑址筛选、时代/空间筛选、移动端、深色模式、URL 回放。


## Phase 4E — 数字博物馆工具层统一：时间轴 2.0（第一轮）
- [x] 时间轴继续使用 published canonical Entry，不建立第二套时间内容索引。
- [x] 时间轴增加时代筛选：唐五代 / 宋 / 元 / 明 / 清 / 近现代。
- [x] 时间轴增加空间 lane 筛选：景德镇 / 中国其他窑业 / 世界其他地区。
- [x] 时间轴节点继续进入统一 Entry Detail，并提供全球网络继续探索入口。
- [x] 时间轴提供统一搜索入口，形成“时间 → Entry → 搜索/关系/全球网络”的连续路径。
- [x] 移动端 / dark mode 筛选控件样式已加入。
- [x] JS syntax regression：wiki-timeline / timeline-details 通过。
- [ ] Pages 浏览器 smoke：时代筛选、空间筛选、节点跳转、移动端、深色模式。


## Phase 4E-2 — 窑址地图 2.0（第一轮）
- [x] 窑址地图继续消费 published canonical Entry 的空间数据，不建立第二套窑址事实源。
- [x] 地图结果增加 live count，并继续支持国家/区域与关键词筛选。
- [x] 地点弹层统一连接 Entry Detail、全球陶瓷网络、统一搜索。
- [x] 页面明确“地图负责空间阅读，Entry 负责知识关系”的产品边界。
- [x] JS syntax regression：global-kiln-map 通过。
- [ ] Pages 浏览器 smoke：地图加载、搜索/区域筛选、地点弹层、Entry/全球网络跳转、移动端、深色模式。


## Phase 4E-3 — 器物图谱 2.0（第一轮）
- [x] 器物浏览继续使用 published canonical 知识条目，不建立第二套器物事实源。
- [x] 新增 `JDM_KNOWLEDGE.objectAtlas()`，一次性聚合器物的知识世界、关系、工艺、时间与空间上下文。
- [x] 器物图谱支持关键词、时代、工艺、器物类型筛选。
- [x] 器物卡片展示工艺、人物、窑址、文献等已存在关系，并可继续进入知识条目。
- [x] 器物卡片增加全球网络继续探索入口。
- [x] 移动端 / 响应式筛选与卡片布局已加入。
- [x] JS syntax regression：knowledge-store / museum 通过。
- [ ] Pages 浏览器 smoke：筛选、关系跳转、全球网络、移动端、深色模式。


## Phase 4E-3 / 搜索发现控件修复
- [x] 修复统一搜索页知识世界、类型、时代、空间、信号筛选控件无法点击的问题。
- [x] 搜索示例改为原生可点击链接，同时保留 JavaScript 增强筛选。
- [x] 筛选事件改为页面级事件委托，降低动态页面绑定失效风险。
- [x] 用户界面公开术语统一为中文，不再展示“Entry”作为产品术语。


## 搜索控件第二轮修复
- [x] 原生搜索示例与筛选链接增加 `#jdm-search-results` 锚点，避免无 JavaScript / 旧缓存状态下点击后回到页面顶部。
- [x] 动态 JavaScript 仍优先接管点击并执行无刷新筛选。
- [x] 线上验证重点：点击搜索示例后应落在结果区，而不是页面顶部。


## Phase 4E-3 收口
- [x] 器物图谱 2.0 第一轮完成并纳入统一知识发现体系。
- [x] 搜索与筛选交互问题已处理；原生链接与动态筛选双保险已完成。
- [x] 器物图谱公开术语已统一为中文产品语言。
- [x] Phase 4E-3 正式收口，不修改生产知识事实与推荐门槛。

## Phase 4E-4 — 人物数据库 2.0
- [x] 新增人物知识聚合层，聚合人物、知识世界、已有关系、工艺、时代与空间上下文。
- [x] 人物数据库支持关键词、时代、身份、知识世界筛选。
- [x] 人物卡片展示已有的工艺、代表作品、窑址、文献、关联人物与同时代人物发现路径。
- [x] 人物卡片增加知识条目与全球网络出口。
- [x] 移动端 / 深色模式 / 响应式布局已加入。
- [x] JS syntax regression：knowledge-store / museum 通过。
- [ ] Pages 浏览器 smoke：人物筛选、关系跳转、全球网络、移动端、深色模式。


## 时代分类统一修正
- [x] 统一时代筛选为：唐五代 / 宋 / 元 / 明 / 清 / 近代 / 现代。
- [x] 人物数据库移除 20世纪、21世纪，增加近代；人物保留原始时代文字并新增规范化 era_group。
- [x] 器物图谱、统一搜索、时间轴同步采用同一时代分组。
- [x] 时间轴将 1911—1948 归入近代，1949 年起归入现代；原始时间数据保留。
- [x] Supabase 时代规范化迁移已应用并记录到 migrations。
- [x] 前端相关筛选与显示逻辑同步更新。


### 4E-4 数据恢复修复
- [x] 修复人物/器物图谱查询对 craft_process 节点字段的错误引用，统一使用 `knowledge_graph_nodes.node_id`。
- [x] 加固 `knowledge-store`：媒体与时间轴辅助数据失败时，不再阻断核心知识条目加载。
- [x] 统一近代/现代边界为 1840–1948 / 1949–至今，并修正发现层时代标签。
- [ ] Pages 浏览器回归：确认历史时间轴、窑址地图、器物图谱、人物数据库、名人与书籍、知识条目全部恢复。


## Phase 4E-4 Closeout — 人物数据库 2.0
- [x] 人物数据库 2.0 正式收口。
- [x] 人物筛选统一为：唐五代 / 宋 / 元 / 明 / 清 / 近代 / 现代。
- [x] 20世纪、21世纪选项已移除；近代统一按 1840–1948，1949 年起为现代。
- [x] 51 位 published 人物均已写入规范化 era_group，缺失数为 0。
- [x] 人物知识聚合层可继续发现工艺、代表作品、窑址、文献、关联人物、同时代人物、知识条目与全球网络。
- [x] 人物数据库线上恢复回归完成；同时确认历史时间轴、窑址地图、器物图谱、人物数据库、名人与书籍、知识条目已恢复核心内容。
- [x] Phase 4E-4 正式收口；未修改 World mappings、生产知识事实或 Phase 3B recommendation gate。

## Phase 4E-5 — 工艺与 72 道工序 2.0
- [x] 保持 canonical craft_processes 为 72 道工序唯一主数据源。
- [x] 新增 JDM_KNOWLEDGE.craftProcesses()，统一暴露 72 道工序目录。
- [x] 新增 JDM_KNOWLEDGE.craftProcessContext()，将单道工序与上下游、知识条目、人物、器物、窑址、文献、时代、空间关联聚合。
- [x] 72 工序详情从“单独工艺说明”升级为“工序 → 技术原理 → 材料 → 工具 → 产出 → 时代 → 知识条目 → 人物/器物/窑址/文献 → 全球网络”。
- [x] 工序关联知识条目继续使用已有 entry_craft_processes / entry_relations，不新增未经来源支持的事实关系。
- [x] 增加知识条目与全球网络继续探索入口。
- [x] 增加响应式 / dark mode 的工艺知识关联样式。
- [x] JS syntax regression：knowledge-store / technology-tree 通过。
- [ ] Pages browser smoke：72 工序筛选、单步详情、上下游跳转、关联知识条目、人物/器物/窑址/文献出口、移动端、深色模式。


## Phase 4E-5 First-Round Closeout — 2026-09-20
- [x] 72 道工序统一读取层、上下游导航、技术原理、材料、工具、产出、时代与 Entry / 全球网络出口完成。
- [x] 用户已完成第一轮线上检查；Phase 4E-5 第一轮正式收口。
- [x] 第一轮未新增生产知识事实，不修改 72 道工序 canonical 数据、entry_craft_processes 或 craft_process_relations。
- [x] CI：Museum QA、Supabase public ACL smoke、TypeScript contract / JS typecheck、MkDocs build 均通过。

## Phase 4E-5 Deepening — 材料 → 器物 → 时代 → 窑址 → 人物
- [x] craftProcessContext() 扩展材料线索、器物、人物、窑址、文献、时代与空间聚合。
- [x] 单道工序详情增加“知识链”路径展示：材料 → 器物 → 时代 → 窑址 → 人物。
- [x] 材料使用 canonical craft_processes.materials_zh 的原始字段分词展示，不建立未经来源支持的独立材料实体。
- [x] 器物 / 人物 / 窑址 / 文献继续从既有 entry_craft_processes + entry_relations 事实关系聚合。
- [x] 时代继续使用 canonical eraGroup 逻辑；空间继续使用 Entry 的既有 map metadata。
- [x] 增加关联条目、时代与空间的深层出口，并保留全球网络继续探索。
- [x] JS syntax regression：knowledge-store / technology-tree 通过。
- [ ] Pages browser smoke：重点检查材料线索、器物/时代/窑址/人物路径、移动端与深色模式。


## Phase 4E-5 Craft Relation Deep Audit — 2026-09-20
- [x] 审查 72 道工序的 289 条原始 Entry 关联，发现其中 204 条属于“完整生产链 / 72步总关联 / 技术链继续存在 / 后段工序”类宽泛占位关系。
- [x] 删除上述 204 条宽泛关系；保留 85 条具有明确历史阶段、技术或遗址语义的关系。
- [x] 新增 20 条器物↔工序直接证据关系：青花瓷、青白瓷、成化斗彩鸡缸杯、颜色釉瓷。
- [x] 新增 12 条御窑厂遗址↔工序直接空间/生产证据关系。
- [x] 新增 9 条人物↔工序直接证据关系：王步 1、黄云鹏 5、唐英 3。
- [x] 当前 entry_craft_processes：126；其中历史 85、器物 20、人物 9、窑址 12；宽泛占位关系 0。
- [x] 所有新增关系均带 source_url / source_institution / source_tier / reviewed_at；未放宽相关推荐 A+ / A gate。
- [x] migration：supabase/migrations/20260920035000_phase_4e5_craft_relation_deep_audit.sql。
- [ ] Pages browser smoke：检查工序详情中的器物、人物、窑址路径及全球网络邻接。


## Phase 4E-5 Craft Relation Deep Audit Round 2 — 2026-09-20
- [x] 复核具体人物↔器物 A+/A 关系，不把“同风格/同年代/同工艺”误当作人物对具体古代器物的直接归属。
- [x] 新增 郎廷极 → 颜色釉瓷，A+：故宫明确说明郎窑红因郎廷极督理景德镇窑务而得名，且郎窑红属于红釉/颜色釉体系。
- [x] 新增 唐英 → 颜色釉瓷，A：故宫资料记录唐英主持御窑期间仿古创新釉彩达到57种。
- [x] 保留 唐英 → 雍正仿钧新紫釉天球瓶 A，不升级为 A+；现有证据证明其处于唐英主持的御窑生产体系，但未直接证明该具体器物由唐英个人制作。
- [x] 未强行建立 王步 / 王琦 / 田鹤仙 / 黄云鹏 → 现有古代馆藏具体器物的作者/制作关系；黄云鹏的“元青花三顾茅庐纹罐”为代表作品，但当前知识库尚无该具体器物节点，暂不伪造关系。
- [x] entry_relations：102；A+ 5 / A 19 / B 1 / C 77；相关推荐 24。
- [ ] 具体器物节点 Round 3：优先评估“郎窑红梅瓶 / 郎窑红釉琵琶尊 / 元青花三顾茅庐纹罐”等是否进入 Canonical Content Admission。


## Phase 4E Final Closeout / Phase 5 Kickoff — 2026-09-20
- [x] Phase 4E-5 Round 2 stopped at the agreed scope boundary; no further recursive deep audit.
- [x] Phase 4E formally closed.
- [x] Future work must follow the new anti-overengineering rule: prioritize high-value user-visible knowledge paths, stop when marginal knowledge gain becomes low, and avoid repeated micro-audits.
- [x] “郎窑红梅瓶”“元青花三顾茅庐纹罐”等进入 Phase 5 Canonical Content Admission pool，不阻塞 Phase 4E closeout。
- [ ] Phase 5-1 Knowledge World architecture.


## Phase 5-2 Knowledge World Home — 2026-09-20
- [x] 首页新增“世界 → 中国 → 景德镇 → 青花”最小世界入口路径。
- [x] 七大知识世界保持一级入口。
- [x] 用户可见英文产品术语本轮已中文化：首页品牌、章节标签、工具卡片等。
- [x] 不新增知识事实数据库，不改 Supabase 生产事实。
- [ ] Pages browser smoke。


## Phase 5-2 当前线上修正 — 2026-09-20
- [x] 修复首页 literal \\n\\n 被渲染为可见文本的问题。
- [x] 加强首页所有主要内容模块的居中约束，避免被 MkDocs/Material 外层布局影响。
- [x] 建立 .ai/PROJECT_MEMORY.md 作为项目长期记忆与防重复施工基线。
- [ ] 等最新 Pages 部署完成后，只做一次首页端到端 Smoke；通过后不再继续首页微调。

## Phase 5-2 当前线上修正 Round 2 — 2026-09-20
- [x] 七大知识世界首页卡片调整为 6 列基准网格：三张 + 三张 + 居中一张，避免最后一张视觉偏置。
- [x] 保留 1000px / 600px 响应式降级，不改变移动端单列体验。
- [ ] Pages browser smoke：确认桌面、平板、移动端卡片布局及首页端到端路径。


## Phase 5-2 第三大块 — 知识世界内部探索闭环
- [x] Entry Detail 接入统一 entryNetworkContext()，在不新增事实数据的前提下聚合 Knowledge World、关系、相关推荐、时代、空间与工艺上下文。
- [x] Entry Detail 增加所属 Knowledge World 回入口。
- [x] Entry Detail 增加“同一时代”“同一空间语境”“相关工艺”等连续探索出口。
- [x] 保留关系网络、相关推荐、搜索、全球陶瓷网络等原有出口。
- [x] 扩展探索上下文失败时保留 Entry 主体内容可读，不让辅助数据阻断 Entry。
- [x] 浏览器自动检查升级为验证 World → Entry → Entry，而不只是验证第一个 Entry 能打开。
- [ ] 最终线上页面自动检查：七个世界逐一验证 Entry → Entry 连续探索、移动端无横向溢出、浏览器无错误。


## Phase 5-2 — 正式收口（2026-09-20）
- [x] 首页 世界 → 中国 → 景德镇 → 青花 → 七大 Knowledge World 路径
- [x] 七大 Knowledge World 统一入口体验
- [x] Knowledge World → Entry → Entry 连续探索闭环
- [x] World → Entry → Entry 自动检查
- [x] 构建检查通过（35464910487）
- [x] 线上部署通过（35464910445）
- [x] 线上页面自动检查通过（35464910445）
- [x] 数据权限检查通过（35464910445）
- [x] Phase 5-2 正式关闭

### Phase 5-2 收口边界
本阶段不新增第 8 个 Knowledge World、不修改生产知识事实、不堆关系数量、不做大规模 CSS 重构；后续新工作必须作为新的工作块单独定义，不重新打开已封版的 Phase 5-2。

## Final Security Hardening — 2026-09-20

- [x] S-1：历史 RLS migration / canonical schema 漂移收口，最终 public ACL 与 private staff helper 固化。
- [x] H-1：统一认证请求层与 AUTH_EXPIRED 闭环。
- [x] H-2：统一 safeHref + 时间轴/Entry Detail 动态 URL 安全。
- [x] H-3：搜索推荐批量化，消除逐条推荐查询。
- [x] H-4：Entry Detail 改为定向 peer 查询；全量缓存上限收紧。
- [x] H-5：数据库安全测试与 private.is_staff 契约一致。
- [x] M-1～M-6：类型、生命周期、错误分类、截断状态、输入契约与媒体边界完成本轮收口。
- [ ] 最终 CI / Pages / 浏览器真实线上验收：待本轮最新提交全部通过后关闭本工作块。


## Phase 6 — Growth Foundation
### Phase 6A — Entry SEO / Indexability
- [ ] 对 149 个 published Entry 建立全量 SEO Health Matrix
- [ ] 核验 title / description / H1 / canonical
- [ ] 核验正文是否可被搜索引擎发现
- [ ] 核验 Schema.org / OpenGraph / Breadcrumb
- [ ] 核验主图 / ALT / 来源 / 内链
- [ ] 核验 sitemap / robots / canonical 一致性
- [ ] 核验移动端与非 JS 可发现性
- [ ] 修复系统性问题后执行构建、部署、线上页面自动检查

### Phase 6B — Content Admission
- [ ] 建立 .ai/ENTRY_SEO_HEALTH_MATRIX.md
- [ ] 固化 Canonical Content Admission v1
- [ ] 建立 Jingdezhen Search Knowledge Map
- [ ] 形成 149 → 220 第一批内容候选

### Phase 6 明确非目标
- [ ] 不重新设计首页/七大 Knowledge World
- [ ] 不增加第 8 个 Knowledge World
- [ ] 不机械增加 World mappings / recommendation edges
- [ ] 不重新打开已封版 Phase 4E
- [ ] 不建立第二事实数据库
- [ ] 不做大规模 CSS 重构或 AI SEO 垃圾内容


## Phase 6A — Entry SEO / Indexability（进行中）
- [x] 对生产 149 published Entry 完成第一轮逐条 Health Matrix
- [x] 核验 title / summary / content / source / world / verified media
- [x] 确认 149 Entry 的系统性 Indexability 阻塞
- [x] 新增 build-time canonical static Entry generator
- [x] canonical Entry URL 统一为 /entry/<slug>/
- [x] 初始 HTML 加入 title / description / canonical / OpenGraph / WebPage + BreadcrumbList JSON-LD
- [x] 生成 Entry sitemap 与 robots sitemap hints
- [x] 动态 Entry enhancement 保留静态首屏内容
- [x] Pages build 在 MkDocs 前生成静态 Entry
- [x] Pages smoke 增加 Entry SEO/indexability 检查
- [ ] 最新 main 构建通过
- [ ] 最新 Pages 部署通过
- [ ] 线上 Entry 静态 HTML smoke 通过
- [ ] sitemap-entries.xml 线上可访问
- [ ] 旧 query-string Entry URL canonical 冲突检查
- [ ] 重新生成 Health Matrix 并收口系统性 BLOCK
- [ ] 处理 9 summary / 37 content / 22 source 内容缺口


## Phase 6A Final — DONE（2026-09-20）
- [x] 149 Entry 静态独立 URL
- [x] 初始 HTML / canonical / description / JSON-LD / OG
- [x] Entry sitemap + robots
- [x] Pages build / deploy / browser smoke
- [x] 跨类型 Entry 抽查 + 图片抽查
- [x] 149 Entry Health Matrix 第二轮
- [x] 9 summary 缺口清零
- [x] 37 content 缺口清零
- [x] 22 source 缺口清零
- [x] public media 安全投影与 ACL smoke

### 下一工作块
Phase 6B/6C：Canonical Content Admission 与 Entry SEO Health 深化；优先把“存在正文”升级为“高质量可引用正文”，不要通过复制 summary 长期代替研究型内容。
\n\n## Phase 6B / 6C — Canonical Content Admission v1（2026-09-20）\n- [x] 建立 `entry_content_admissions` 治理表\n- [x] 149 Entry 全量准入检查\n- [x] 0 BLOCK / 149 admitted\n- [x] 8 Citation PASS / 141 REVIEW\n- [x] 深化 11 个核心 Entry\n- [x] 建立内容质量状态：ready / develop / rewrite\n- [x] 同步 GitHub migration 与 .ai 记忆\n\n### 当前队列\n- [ ] 141 个 REVIEW Entry 分批 citation-ready 深化\n- [ ] 来源层级提升与研究边界补全\n- [ ] 核心器物 Object Profile 内容化\n- [ ] 149→220 暂缓，待现有内容质量达到下一门槛\n
## Phase 6C Research Pass（2026-09-20）
- [x] 149 Entry 全量 Research Pass
- [x] 141 REVIEW Entry 完成证据导向结构深化
- [x] 64 Citation-ready
- [x] 85 Evidence / Boundary Review
- [x] 建立 source_quality / research_priority / research_pass_version
- [x] 世界遗产五组成部分纳入核心证据框架
- [ ] Phase 6C-2 Evidence Deepening：85 REVIEW 分类处理
- [ ] 低价值关系型 Entry 降级/合并审查
- [ ] 核心人物/器物/文献第二独立来源补强
- [ ] 暂缓 149→220


## Phase 6C-2 — Evidence Deepening
- [x] ① UNESCO 世界遗产五组成部分证据深化
- [x] ② 景德镇核心历史 / 城市生产系统证据深化
- [x] ③ 核心人物证据深化
- [x] ④ 核心馆藏器物 Object Profile 证据深化
- [x] ⑤ 核心文献证据深化
- [x] ⑥ 日本 / 东亚传播链证据深化
- [x] ⑦ 全球陶瓷文明影响链证据深化
- [x] 将机构/原始来源写入对应 Entry sources
- [x] 更新 entry_content_admissions：75 PASS / 74 REVIEW / 0 BLOCK
- [x] 写入 .ai 项目状态文件
- [x] 新增 supabase/migrations/20260920_phase_6c2_evidence_deepening_v1.sql
- [ ] 对剩余 74 REVIEW 做 A/B/C/D 分流
- [ ] 完成 Phase 6C-2 最终 Corpus QA 后再评估 149 → 220


## Knowledge Corpus Stage
- [x] 激活“景德镇陶瓷文明 Knowledge Corpus”阶段
- [x] 对剩余 74 REVIEW 建立 Corpus track / disposition 分流
- [ ] A_deepen：优先完成景德镇核心、东亚/全球桥接、关键文献
- [ ] B_research：补齐一手/机构证据与独立研究价值
- [ ] C_context_or_relation：逐条判断是否应降级为关系节点
- [ ] 完成 Corpus QA：证据链、实体边界、跨区域传播链、来源层级、重复/合并检查
- [ ] Corpus QA 完成前保持 149 → 220 冻结


## 2026-09-20 — Corpus QA / Phase 7
- [x] 完成 74 REVIEW Corpus QA：A/B/C/D 分流
- [x] 新增 corpus_node_type / canonical_eligible 治理字段
- [x] 30 个 C 类 Entry 降级为 Knowledge Node
- [x] 39 个 B 类 Entry 保留进入 Research Corpus
- [x] 5 个 A 类 Entry进入继续深化
- [x] 完成 Phase 7 Canonical Growth：canonical eligible 119 → 220
- [x] published entries 扩展至 250；220 个具备 Canonical Entry 资格
- [ ] Phase 7 后续：对新增 101 Entry 进行 Evidence Deepening / Citation Readiness 提升
- [ ] 下一增长门：220 → 320，必须先完成本轮新增 Entry 的证据深化与 Corpus QA


## 2026-09-20 — Phase 7.1
- [x] 101 Phase 7 growth Entries Evidence Deepening complete
- [x] 101 Entries promoted Review/Develop → Citation-ready PASS
- [x] 39 Research Corpus Entries rechecked and retained as B_research / REVIEW
- [x] Evidence deepening governance recorded as phase7.1-v1
- [x] 220 Canonical-eligible baseline preserved
- [ ] 74 remaining REVIEW deepening / Corpus QA
- [ ] 220 → 320 growth remains frozen until REVIEW corpus is cleared or intentionally retained


## 2026-09-20 — Phase 7.2 Corpus Evidence QA
- [x] 完成剩余74 REVIEW的Corpus QA分流复核
- [x] 5个A类Entry完成证据深化并PASS
- [x] 39个Research Corpus完成Primary Evidence Mapping
- [x] 13个Research Corpus获得直接机构/一手证据映射
- [x] 1个Research Corpus获得一手考古报告书目级映射
- [x] 25个Research Corpus完成一手证据目标定义，暂不晋级
- [x] 30个C类继续保持Knowledge Node
- [ ] 对25个target_defined Research Corpus逐条取得可核验原始记录
- [ ] 220 → 320继续冻结


## 2026-09-20 — Phase 7.3 Primary Evidence Retrieval
- [x] 25/25 target_defined Research Corpus完成Primary Evidence Retrieval
- [x] 37/39 Research Corpus mapped
- [x] 2/39保留bibliographic_primary_target
- [x] 0 target_defined
- [ ] 对39 Research Corpus进行claim-by-claim evidence synthesis
- [ ] 220 → 320继续冻结


## 2026-09-20 — Phase 7.4 Claim-by-Claim Evidence Synthesis
- [x] 39/39 Research Corpus逐条建立 Claim → Evidence → Source → Evidence Type → Confidence → Boundary
- [x] 明确区分考古事实 / 官方记录 / 原始文献陈述 / 馆藏记录 / 学术解释 / 学术史叙述
- [x] 37 mapped + 2 bibliographic primary target 已纳入矩阵
- [ ] Evidence Triangulation / Dispute QA
- [ ] 220 → 320继续冻结


## 2026-09-20 — Phase 7.5 Evidence Triangulation & Dispute QA
- [x] 39/39 Research Corpus第二证据核验
- [x] 二元配方争议归因
- [x] 湖田窑/青白瓷分期与材料证据拆分
- [x] 青花→日本/欧洲传播边界拆分
- [x] 外销瓷与海上丝绸之路证据层级拆分
- [x] 粉彩/颜色釉材料事实与技术解释拆分
- [x] 杜赫德/殷弘绪文献传播链核验
- [x] Hobson/Needham/Finlay学术史归因
- [x] 《陶说》原文与现代考古边界核验
- [ ] Phase 7.6 Canonical Admission Decision


## AI Memory Maintenance — ongoing
- [x] 建立并持续使用 `.ai/` 长期记忆模块作为项目接管依据
- [x] 本次明确记录“技术树历史样式问题、窑址地图内容消失问题已由用户修复，不再重复处理”
- [x] 固化记忆更新规则：代码/DB/架构/部署/测试/产品状态发生实质变化后同步更新记忆
- [ ] 每次新工作块结束时检查 CURRENT_STATE / PROJECT_MEMORY / TASKS / CHANGELOG 是否需要同步
- [ ] 每次接管时以最新 main + Supabase + CI 校验记忆，发现漂移立即修正


## 2026-09-20 — Daily Handover Freeze
- [x] 今日 Entry/SEO 语义与静态/动态 UI 统一工作归档
- [x] 时间轴弹层正文/摘要重复问题归档
- [x] 窑址地图媒体污染、运行时依赖与 graceful degradation 排查/治理过程归档
- [x] Bridge Centrality / Path-level Evidence QA 路线归档
- [x] 用户确认技术树“历史”样式与窑址地图内容消失均已自行修复，不再处理
- [ ] 下一阶段：Path-level Evidence QA
- [ ] 下一阶段：Canonical Entry 独立入口、SEO、英文核心内容与媒体治理
