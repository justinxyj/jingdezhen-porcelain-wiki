# Current State

更新时间：2026-09-19
正式项目基线：6a8700b0621b787ecb92df47448df50a4cb9f966

## GitHub
- 仓库：justinxyj/jingdezhen-porcelain-wiki
- 默认分支：main
- 本次记忆分支：ai/project-memory-6a8700b-20260919

## 基线后的状态
该文件首先记录基线，不假设基线后的每个 PR 都已合并。下一步必须用 GitHub 实际历史核对：
- 6a8700b 之后的 commit
- 当前 main 指向
- 开放/关闭 PR
- CI / Pages
- 与基线之间的差异

## 基线已知重点
1. RLS 方案 B 已落地并有测试记录；不要重新把 is_staff 401 当作现行缺陷。
2. /entry/ 已有产品验收基线。
3. G29 S3/S4 已记录。
4. 媒体债与 timeline/canonical media 是后续重点。
5. CI/Museum QA 已有近期修复，但当前结果需要实际检查。

## 当前任务
- [x] 建立 AI 项目记忆
- [ ] 完成基线→当前 main 的差异审计
- [ ] 核验 Supabase 当前真实状态
- [ ] 核验 CI / Pages
- [ ] 基于真实状态重新确定下一项工程任务

## 新会话恢复方式
1. 读取本文件
2. 读取 PROJECT_CONTEXT / TASKS / CHANGELOG
3. 查询 GitHub 当前 main 与近期 PR/CI
4. 涉及数据库时查询 Supabase 实际状态
5. 再开始修改
