# Jingdezhen Porcelain Wiki — Project Context

## 项目身份
- 项目：Jingdezhen Porcelain Wiki / 景德镇陶瓷数字博物馆
- 定位：以景德镇陶瓷为核心的数字博物馆 + Wiki 知识网络。
- 公开 README 保持面向访客；项目运行状态与 AI 记忆放在 .ai/。

## 接管方式
由一个项目总协调 AI 统一承担六类工作职责：
1. 项目总监
2. 研究策划
3. 产品设计
4. 技术架构
5. 开发工程
6. 测试发布

## 权威状态来源
1. 生产行为、权限、策略、函数和数据：Supabase 实时状态
2. 代码、迁移和已合并变更：GitHub
3. 可部署性：CI / build / QA 结果
4. 项目记忆、决策、任务与交接：.ai/
5. README：公开项目介绍

## 正式基线
本项目当前接管基线固定为：
6a8700b0621b787ecb92df47448df50a4cb9f966

不要把后续分支、未合并 PR 或工作区改动反向当成该基线的一部分。

## 该基线已记录的状态
- RLS 方案 B 已生产落地：公开 SELECT 不再依赖 is_staff()；含 is_staff() 的策略限 authenticated；anon 对 is_staff() 的 EXECUTE 已撤销。
- PR #5（A）和 PR #6（B）已记录为仓库对齐历史。
- /entry/ 产品验收基线 E0–E3 / A–H 已定稿。
- G29 第一批包括 S3 青花、S4 Met 1991.253.33 / object 42490；13 名人物空源名单冻结。
- Museum QA / mkdocs strict 相关误报已修。
- 首页地理入场 / 五维顶栏明确不属于该阶段目标。
- 媒体洗数等问题进入后续排期。

## 当前阶段
Phase 1：知识层稳定、媒体治理、工程可验证性与项目记忆体系。

## 当前优先级
P0：建立可靠项目记忆并验证“基线之后的真实变化”。
P1：canonical entry / media / timeline；schema 与前端数据契约；CI 与 Pages。
P2：源驱动内容扩展。
P2：数字博物馆视觉与知识图谱等更高层体验。

## 硬性约束
- 未经明确批准，不直接做生产高风险 RLS、权限或破坏性数据操作。
- 不伪造历史事实、人物经历、器物信息、来源、图片授权。
- “发现到”的媒体不能自动视为“已核验”。
- 不用过时 README 推断生产数据库现状。
- 不重写 main 历史、不 force-push。
- 高风险修改先给方案、影响面、回滚与验证。

## 会话连续性
聊天是临时工作空间；.ai/ 是长期记忆。新会话必须先读 PROJECT_CONTEXT、CURRENT_STATE、TASKS、CHANGELOG，再检查真实 GitHub/Supabase 状态。
