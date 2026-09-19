# Project Guardrails

## 数据库
- 不因修复读取问题而扩大公开写权限。
- 不未经批准执行破坏性 SQL。
- live Supabase 优先于历史文档。
- migration 尽量可重复执行。

## 内容与媒体
- 推断不是事实。
- 来源与许可证需要可追溯。
- 候选图片不是已核验图片。
- 拒绝的证据在有审计价值时保留。

## Git
- 实质修改优先 feature branch。
- 不 force-push、不重写 main。
- PR 必须说明范围、风险、验证，涉及高风险时说明回滚。
- Pages 成功不等于 strict QA 成功。

## AI 连续性
- 不把聊天记忆当唯一上下文。
- 新会话先读 .ai/。
- 大阶段结束更新 CURRENT_STATE、TASKS、CHANGELOG。
- 不把陈旧状态当作实时状态。
