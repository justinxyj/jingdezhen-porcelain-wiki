# 内部项目状态（勿放公开 README）

> 本文件供团队查阅。公开仓库 README 仅保留博物馆链接。

## 📍 项目状态

项目正在从「资料型网站」升级为「关系型数字博物馆」。权威源：**代码以 GitHub 为准，数据以 Supabase 为准**；线上：https://justinxyj.github.io/jingdezhen-porcelain-wiki/

### 整体进度（截至 2026-09-19）

| 维度 | 状态 |
|---|---|
| 访客动态 Wiki（公开读） | ✅ 可用（RLS 方案 A→B 已落地，测试整门 PASS） |
| 仓库 ↔ 生产权限对齐 | ✅ PR #5（A）、PR #6（B）已合入 `main` |
| `/entry/` 产品验收基线 | ✅ E0–E3 / A–H 定稿 |
| G29 内容治理第一批 | ✅ S3 青花 + S4 Met 42490 已落地；空源人物 13 人冻结 |
| CI（Validate Museum Build） | ✅ 误报已修（PR #8），`main` 连续 success |
| 首页地理入场 / 五维顶栏 | ⏸ 明确非本阶段目标 |
| 媒体洗数（issue #2）等 | ⏳ 待下一阶段排期 |

### 2026-09-19 工作纪要

**权限与稳定**
- 生产执行 RLS **方案 B**：公开 SELECT 不再依赖 `is_staff()`；含 `is_staff()` 的策略限 `authenticated`；`REVOKE` anon 的 `EXECUTE`。
- 中途曾因员工 `FOR ALL` 策略对 anon 求值导致公开读回归，已修复并复测通过。
- 仓库迁移对齐：PR #6 squash 合入 `main`（生产侧不再重跑该 SQL）。

**内容（G29）**
- 研究交付并经产品签收：S3 青花写作卡、S4 Met **1991.253.33 / object 42490** 字段模板、空源人物冻结名单（13）。
- 动态层：总监经 MCP 写入 seed（`blue-and-white` 补 summary；新建 `met-1991-253-33` + PD 主图 + 关联）；测试实机抽查 **PASS**（未见 42491）。
- 静态：PR #7 合入（`docs/craft/qinghua.md` 等）。

**工程**
- 修复 `Validate Museum Build` 长期失败（导航 QA 跨行误判、mkdocs `--strict` 冲突页/断链），PR #8 合入后失败邮件应停止。

**暂停说明**
- 2026-09-19 起用量接近上限，**暂停排期**；约 **3 天后（2026-09-22）** 再继续下一步（S1 写作批、冻结名单补源、媒体债等，由项目总监与创始人确认优先级）。

---

## 🔗 快速链接

**在线博物馆：**  
https://justinxyj.github.io/jingdezhen-porcelain-wiki/

**GitHub：**  
https://github.com/justinxyj/jingdezhen-porcelain-wiki

**数字博物馆入口：**  
https://justinxyj.github.io/jingdezhen-porcelain-wiki/museum/

---

> **让每一件瓷器背后的时代、技术、材料、地点与人，都留下可以被查证、被连接、并继续书写的记录。**
