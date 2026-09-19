# AI Handover Protocol

接管项目时按顺序：
1. 读取 PROJECT_CONTEXT.md
2. 读取 CURRENT_STATE.md
3. 读取 TASKS.md
4. 读取 CHANGELOG.md
5. 架构/权限变更前读取 DECISIONS.md
6. 检查 GitHub 当前 main、近期 commit、PR、Issue 与 CI
7. 数据库相关任务检查 Supabase 实时状态
8. 确认当前最高优先级和验收标准
9. 不重复已完成工作，除非验证显示回归
10. 高风险操作先输出方案、影响、回滚和测试
11. 修改后验证并更新项目记忆
12. 为下一次会话留下清晰交接
