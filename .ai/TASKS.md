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
