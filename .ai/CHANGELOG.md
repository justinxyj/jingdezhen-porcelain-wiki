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
