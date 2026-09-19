# QA Baseline

## 核心回归
- 公开访客可以加载公开页面。
- 已发布动态条目可以正常读取。
- /entry/?slug=... 能显示实际条目。
- “无条目”与 RLS/网络故障可区分。
- media 与条目语义匹配，来源/许可证按模型展示。
- timeline/map 使用自身 canonical media。
- relations 使用稳定 ID，不把 slug 当 UUID 查询。
- 不同时挂载 legacy 与 canonical renderer。

## 数据库
- 只在预期范围公开读。
- 未设计公开写时，anon 继续禁止写。
- staff 权限继续保护。
- RLS 调用函数的 EXECUTE 权限与实际角色一致。

## 构建发布
- Museum QA pass。
- mkdocs build --strict（或项目等价门禁）pass。
- Pages 部署成功且可观察。

## 证据
每个重要修复记录：commit/PR、环境、测试命令或请求、预期、实际结果。
