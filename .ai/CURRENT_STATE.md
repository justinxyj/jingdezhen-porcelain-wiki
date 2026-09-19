# Current State

更新时间：2026-09-19
正式项目基线：6a8700b0621b787ecb92df47448df50a4cb9f966

## GitHub
- 仓库：justinxyj/jingdezhen-porcelain-wiki
- 默认分支：main
- AI 项目记忆已进入 main（PR #17 已合并）

## 基线→当前接管审计
- 已完成 GitHub 基线→main 差异核验。
- 已完成 live Supabase 生产状态核验。
- 已确认 Phase B 核心公开读取 RLS 已生效；anon 无 is_staff() EXECUTE。
- 已确认生产数据：entries 149、media 133、entry_relations 169、timeline_context 50、craft_processes 72、craft_process_relations 71、entry_craft_processes 289。
- 已确认 G29 动态条目已进入生产。
- CI / Pages 当前仍需单独取得最新可验证运行结果。

## 本次安全修复
- 发现 public.craft_media_candidates 与 public.timeline_media_candidates 在生产中 RLS 关闭。
- 这两个表属于内部媒体候选/治理池，不应直接开放给网站访客。
- 已在生产启用 RLS。
- 已撤销 public / anon / authenticated 对这两个表的表级权限。
- 已验证 anon/authenticated 无 SELECT/INSERT 权限。
- 已在 GitHub main 增加迁移记录：supabase/migrations/20260919090000_secure_media_candidate_tables.sql。
- Supabase Security Advisor 的原 RLS-disabled ERROR 已消失；剩余为“RLS 已启用但无 policy”的 INFO，这是预期的内部封锁状态。

## 当前重点
1. 完成 CI / Pages 实时核验。
2. 复核 Issue #2 媒体债与 /entry/ 实际行为。
3. 审核剩余 SECURITY DEFINER function WARN，不机械修改。
4. 再进入媒体清理与 72 工序图片核验。

## 新会话恢复方式
1. 读取本文件
2. 读取 PROJECT_CONTEXT / TASKS / CHANGELOG
3. 查询 GitHub 当前 main 与近期 PR/CI
4. 涉及数据库时查询 Supabase 实际状态
5. 再开始修改
