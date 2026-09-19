# Changelog

## 2026-09-19 — AI memory bootstrap on formal baseline
- Confirmed 6a8700b is the requested formal project baseline.
- Created durable .ai project-memory files.
- No production Supabase change in the memory bootstrap.

## 2026-09-19 — Phase 1 takeover audit
- Verified live Supabase production state.
- Confirmed Phase B public-read RLS is active for the core knowledge layer.
- Confirmed anon cannot execute is_staff().
- Confirmed 149 published entries, 133 media records, 72 craft processes and 71 process relations.
- Confirmed G29 dynamic content exists in production.

## 2026-09-19 — Internal media-candidate security fix
- Enabled RLS on public.craft_media_candidates.
- Enabled RLS on public.timeline_media_candidates.
- Revoked table privileges from public, anon, and authenticated.
- Verified anon/authenticated SELECT and INSERT are denied.
- Added migration supabase/migrations/20260919090000_secure_media_candidate_tables.sql to GitHub main.
- Security Advisor now reports only INFO for these two tables (RLS enabled with no policies), plus pre-existing function/auth WARNs.

## 2026-09-19 — 第三轮上线验收：图片与引用残留修复
- 用户真实上线截图发现大量卡片/详情图片破损，确认生产媒体中存在无效 The Met /???/main-image 路径。
- museum-images.js 增加动态图片错误恢复：The Met Object API → Wikimedia Commons → 明确占位图，并覆盖异步新增 DOM。
- 修复现代景德镇四个页面残留的内部 cite 标记，统一改为正常 UNESCO 资料链接。

## 2026-09-19 — 第三轮：媒体审核边界与前端韧性
- 生产 media 公共 RLS 从仅 status='approved' 收紧为 status='approved' AND review_state='verified'。
- 普通 authenticated 用户插入媒体时只能写 pending/pending、verified_at=NULL、is_primary=false；staff 保留审核态写入能力。
- 新增 public.media_public 公共视图，仅暴露公开网页需要的媒体字段；anon 撤销 media 表 SELECT，公共网页改读视图。
- knowledge-store.js 改为显式 error 状态、10 秒请求超时，并对详情页使用按 slug 定向查询。
- wiki-enhancements.js 增加核心加载错误与关系加载失败的用户提示及重试；关系查询上限 100。
- museum-images.js 增加 8 秒超时、一次有限重试、缓存去重与最多 3 路并发。
- site-privacy.js 删除通用文本匹配删除 DOM 的逻辑；timeline-interactive.js 改为只处理新增节点。
- Validate #85 与 Pages #369 均成功。

## 2026-09-19 — 审计问题 H-1/H-2/H-3/M-1~M-7 修复
- 认证刷新失败不再覆盖 AUTH_EXPIRED。
- 关系查询改为 UUID 校验、双索引路径、稳定排序、去重和截断提示。
- 历史时间轴加入结构化 timeline_sort_year。
- evidence-hub 改为安全 DOM 渲染。
- 外部图片恢复增加页面生命周期中止、负缓存和对象 ID 校验。
- 生产增加主媒体唯一性、revision 版本唯一性和关系类型索引，并通过事务回归测试。
- strict TypeScript contract 层增强。
- Pages smoke 增加 unhandledrejection 与历史顺序检查。

## 2026-09-19 — S1/S2/H1-H5/M1 审计修复
- 以生产实时权限为准建立 canonical public ACL。
- 馆长后台查询与生产 schema 对齐。
- 详情页统一认证请求层，修复重复 client。
- 重试、MutationObserver 生命周期加固。
- PR 不再依赖线上 Supabase；main/post-deploy 执行公开 ACL smoke。
- 核心 JS 开启 checkJs，strict contracts 保持独立。

## 2026-09-19 — Sprint B / 七大知识世界统一入口
- Added editorial knowledge_worlds + entry_worlds layer independent from entry categories.
- Mapped all 149 published entries; 406 primary/secondary mappings currently exist.
- Connected all seven world landing pages to live world-aware entry browsing.
- Refreshed generated Supabase TypeScript contracts.

## 2026-09-19 — Sprint B Phase 2B / 深层语义审校
- 以“secondary 是否值得用户从该知识世界进入”为准入标准，完成第一轮深层语义清洗。
- 生产 secondary 从 246 条收敛为 223 条；总 mapping 从 395 收敛为 372 条。
- 删除 23 条低价值关系：现代人物→历史 8、人物→器物 11、现代人物→研究 1、现代荣誉/纪念性人物→现代景德镇 3。
- 保留具有明确解释路径的历史人物、工艺人物、代表性器物、研究文献、历史节点和全球窑址/陶瓷空间。
- 精修 12 条过于通用的 rationale，改为具体用户入口价值。
- 生产校验：149 published / 149 primary / 226 secondary；无重复 entry-world 边；无 primary cardinality 异常。
- 新增迁移：supabase/migrations/20260919193000_sprint_b_phase_2b_semantic_cleanup.sql
- 新增迁移：supabase/migrations/20260919194000_sprint_b_phase_2b_rationale_precision.sql

## 2026-09-19 — Sprint B Phase 2C / 人物→历史、全球窑址→历史深审
- 完成生产层逐条深审并应用 migration `supabase/migrations/20260919213000_sprint_b_phase_2c_people_history_global_kiln_history.sql`。
- 人物→历史 secondary：37 → 9；全球窑址/空间→历史 secondary：41 → 17。
- 总 mapping：372 → 320（149 primary + 171 secondary）。
- 删除主要为“人物身份/年代本身不构成历史入口”以及“全球区域比较节点过宽”的关系。
- 为保留历史入口重写 entry-specific rationale，消除模板化理由。
- 完成 production mapping/cardinality 回归：149 published、149 primary、171 secondary，primary cardinality 无异常。
- UNESCO 2026 与有田资料用于复核景德镇产业链、东亚技术/贸易史桥接；Frank B. Lentz 调整为 research 入口而非 history 入口。

## 2026-09-19 — Sprint B Phase 2B 深层语义续审
- 以“是否值得用户从该知识世界进入”作为 secondary 唯一准入原则继续清洗生产层。
- 当前生产：149 published / 149 primary / 174 secondary / 323 total mappings。
- 删除 4 条弱入口：杜重远→工艺、景德镇窑→研究、马基利→研究、濑户窑→历史。
- 新增 8 条明确入口：6 条核心生产链窑址→工艺、r11→空间、r18→空间。
- 继续精修人物→历史与人物→工艺的 entry-specific rationale。
- 生产回归：published coverage 149/149、primary 149/149、无重复 entry-world 边、无 primary cardinality 异常。
- GitHub migration：supabase/migrations/20260919220000_sprint_b_phase_2b_deep_semantic_pass.sql
- 下一步进入四个剩余边界的逐条语义审校。

## 2026-09-19 — Sprint B Phase 2B 四边界逐条语义审校完成
- 对当前 production secondary 做四个剩余边界的逐条复核：
  1. 人物 → 研究 / 工艺；
  2. 文献 → 器物 / 工艺 / 空间；
  3. 全球窑址/窑业空间 → 研究；
  4. 历史 → 器物 / 空间。
- 删除 7 条低价值 secondary：
  - 郭沫若 → 研究；
  - 刘远长、占绍林、秦锡麟 → 工艺；
  - 焦潭柴窑燃料生产区、长岭瓷石采掘区、高岭土矿采掘区 → 研究。
- 保留并逐条重写：
  - 人物→研究 12 条；
  - 人物→工艺 10 条；
  - 比较研究型窑址→研究 12 条；
  - 文献→工艺 13 条；
  - 文献→器物 12 条；
  - 文献→空间 10 条；
  - 历史→器物 4 条；
  - 历史→空间 5 条。
- 本轮没有新增 secondary；目标是收敛泛化关系、保留可解释入口。
- 生产回归：149 published / 149 primary / 167 secondary / 316 total mappings；重复 entry-world 边 0；primary cardinality anomalies 0。
- 新增迁移：supabase/migrations/20260919230000_sprint_b_phase_2b_boundary_semantic_audit.sql
- 2026 UNESCO 世界遗产决定用于复核五个组成部分及原料、燃料、窑址、生产中心、运输和技术演化之间的整体生产系统关系。
- 四个边界现已完成；下一步是映射冻结前总体验收，不应再机械按 category 批量删除。

