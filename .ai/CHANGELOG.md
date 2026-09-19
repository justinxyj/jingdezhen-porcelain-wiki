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
