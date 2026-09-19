# 景德镇陶瓷数字博物馆

> **Jingdezhen Porcelain Digital Museum · Jingdezhen Porcelain Wiki**
>
> 一座面向公众、研究者与陶瓷爱好者的开放知识博物馆：把**历史、工艺、器物、窑址、人物、图像与文献**连接成可以持续核验、编辑和扩展的知识网络。

<p align="center">
  <a href="https://justinxyj.github.io/jingdezhen-porcelain-wiki/"><strong>进入数字博物馆 →</strong></a>
  ·
  <a href="https://github.com/justinxyj/jingdezhen-porcelain-wiki">GitHub 源码</a>
</p>

---

## 🌐 立即访问

### 🏛️ 数字博物馆

**网站地址：**

**https://justinxyj.github.io/jingdezhen-porcelain-wiki/**

这是项目的正式线上入口。网站采用 GitHub Pages 发布，当前主站包含博物馆首页、历史时间轴、器物图谱、人物数据库、窑址地图、图片库和统一知识条目系统。

### 🧭 主要入口

| 入口 | 功能 |
|---|---|
| [数字博物馆首页](https://justinxyj.github.io/jingdezhen-porcelain-wiki/) | 世界 → 中国 → 景德镇的沉浸式首页入口 |
| [博物馆总览](https://justinxyj.github.io/jingdezhen-porcelain-wiki/museum/) | 数字博物馆总导航 |
| [历史时间轴](https://justinxyj.github.io/jingdezhen-porcelain-wiki/museum/timeline/) | 按历史时期浏览景德镇及区域、世界陶瓷史比较 |
| [器物图谱](https://justinxyj.github.io/jingdezhen-porcelain-wiki/museum/catalog/) | 浏览结构化器物条目 |
| [人物数据库](https://justinxyj.github.io/jingdezhen-porcelain-wiki/museum/people/) | 浏览历史人物、艺术家、教育者与传承人物 |
| [窑址地图](https://justinxyj.github.io/jingdezhen-porcelain-wiki/museum/kiln-map/) | 地理查看窑址、原料与生产空间 |
| [图片库](https://justinxyj.github.io/jingdezhen-porcelain-wiki/museum/gallery/) | 浏览已核验的官方馆藏图像 |
| [知识条目](https://justinxyj.github.io/jingdezhen-porcelain-wiki/entry/) | 统一 Wiki 条目阅读入口 |

---

## 🏺 这个项目到底在做什么？

景德镇陶瓷不是一张“名瓷清单”。它同时涉及：

**历史** → 朝代、制度、贸易、城市发展

**工艺** → 原料、成型、施釉、装饰、烧成

**器物** → 器型、釉色、纹饰、用途、考古与馆藏

**窑址** → 御窑、民窑、古窑址、原料与燃料生产区

**人物** → 督陶官、工匠、画师、艺术家、教育者、研究者、传承人

**图像** → 官方博物馆馆藏图、器物摄影与媒体元数据

**文献** → 考古报告、地方志、馆藏记录、学术研究与遗产资料

最终它们会进入同一张知识关系网，而不是彼此孤立的网页。

```text
                         ┌── 文献 / 来源
                         │
                         ↓
人物 ───────→ 历史时期 ←────── 工艺
 │             │              │
 │             ↓              ↓
 ├────────→ 器物 ←───────────┘
 │             │
 ↓             ↓
窑址 ←────── 图片 / 馆藏
 │
 ↓
城市空间 / 当代景德镇
```

---

## ✨ 当前网站能力

### 时间轴

历史时间轴不仅展示景德镇内部发展，也按时期加入中国其他窑业与世界陶瓷史背景，方便从生产技术、制度、贸易和文化交流等角度阅读。

### 器物图谱

每个器物逐渐采用统一结构记录，例如：

`ID · 中文 · English · 日本語 · 年代 · 器型 · 胎质 · 釉 · 装饰 · 工艺 · 尺寸 · 用途 · 出土地点 · 收藏机构 · 馆藏编号 · 图片 · 来源`

点击器物卡片进入统一知识条目，可继续查看正文、图片、来源、编辑和历史版本。

### 人物数据库

人物与“人物与传承”采用统一入口，人物条目不再只是静态介绍，而是能够继续关联：

`人物 ↔ 历史 ↔ 器物 ↔ 窑址 ↔ 工艺 ↔ 文献 ↔ 图片`

### 窑址地图

将窑址、生产区、原料与燃料节点放到空间关系中，并通过条目链接进入更详细的遗产记录。

### 官方馆藏图像

图像优先采用可核验的博物馆官方记录，并保留来源页面、馆藏编号、许可与作者信息。当前第一批图像主要来自 The Metropolitan Museum of Art 的 Open Access / Public Domain 馆藏体系。

---

## 🔐 Wiki 与社区功能

项目不仅是静态网站，同时预留完整的知识协作工作流：

```text
注册 / 登录
      ↓
提交新条目或修改
      ↓
审核
      ↓
发布
      ↓
版本历史
      ↓
继续修订
```

当前数据层使用 Supabase，主要包括：

- `entries`：正式知识条目
- `edits`：社区编辑与审核申请
- `entry_revisions`：公开版本历史
- `media`：图片与媒体元数据
- `favorites`：用户收藏
- `profiles`：用户身份与角色
- 关系数据：用于连接人物、器物、窑址、工艺、历史与文献

---

## 📚 内容原则

**可核查**  
重要事实尽量提供博物馆、考古报告、学术研究、地方志或其他可靠来源。

**可追溯**  
保留来源编号、馆藏页面与修订记录，便于继续核验。

**中立表达**  
区分已知事实、研究观点与仍存在争议的问题。

**尊重版权**  
第三方图片与文字必须遵守原始来源的许可或授权条件。

---

## 🛠️ 技术栈

- **MkDocs Material**：知识站点与文档导航
- **JavaScript / CSS**：数字博物馆交互与视觉层
- **Leaflet**：窑址地图
- **Supabase**：认证、知识条目、编辑、版本、媒体和收藏
- **GitHub Actions + GitHub Pages**：自动构建与部署

---

## 🤝 参与贡献

这个项目欢迎补充历史资料、器物、人物、窑址、来源、译文和原创图像。

推荐贡献流程：

```text
Fork → 新建分支 → 修改 → Commit → Pull Request → Review → Merge
```

查看：[贡献指南](CONTRIBUTING.md)

---

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
