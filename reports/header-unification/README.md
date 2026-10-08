# 全站 Header 统一验收

基线：`8b46eb2b0f6558e4bd51ad76c3ba68744467a4ac`；基线生产前端：`2fd937e5af774f18cdd07516092d88545f90dcd0`。

## 原因与修复

主站经由 MkDocs Material 的 `base.html → overrides/main.html` 渲染；百科生成器原先直接输出完整 `index.html`，被 MkDocs 当作静态文件复制，绕过了主站模板。生成器同时维护了另一套导航、页脚、样式和脚本列表。

现在生成器仅输出 `index.md`：SEO 元数据加原有百科 HTML 正文。MkDocs 为这 250 页提供同一个 Material Header、主导航、面包屑和页脚。主导航的唯一设计来源是 `overrides/main.html`；品牌栏、菜单及主题控件继承 Material。`visitor-ui.js` 仅为共享品牌栏添加搜索及键盘行为。`page_assets.py` 统一按页面需要加载脚本。

删除了生成器中的独立导航、外层 HTML 壳、全局重置样式、独立面包屑、重复页脚与重复脚本列表；删除 `visitor-static-nav` 的全部有效 CSS 和 JS 兼容分支，以及 `JDM_STATIC_ENTRY_SLUG` 注入/读取。旧导航名称只保留在拒绝它的自动化断言中。生成时删除旧的生成器所属 `index.html`，避免旧文件继续被复制。

保留生成器中的公开 Supabase 读取、正文清理、图片、来源、关系、真实更新时间、canonical 数据、JSON-LD 和 sitemap/robots 生成。全部数据库操作均为读取，未修改数据库或编辑稿。`article-preservation.json` 记录了同一批生产读取数据经过新旧生成器输出后，250 个百科 article 逐字相同的 SHA-256 结果。

回归测试还发现，百科异步增强若在反馈弹窗打开期间替换链接，会使关闭后焦点无法返回。共享弹窗现在在原链接已被替换时按相同 href 找回当前链接；保留原测试，并增加确定性的替换链接回归检查。

三个既有当代页面链接仅将源码目标 `index.html` 调整为 `index.md`，让 MkDocs 能解析新生成的文档；最终公开 URL 保持不变。另保留 Material 的纯 CSS 手机菜单，使隐藏的桌面侧栏在手机勾选菜单时仍可用，不依赖 JavaScript。

## 持续防回归

- `scripts/check_shared_header.py`：检查全部 250 个生成文档必须由 MkDocs 渲染；每页唯一 Header/主导航、与首页相同的 Header 结构、六个实际导航目标、canonical、JSON-LD、可索引及无 JavaScript 正文。另检查整个站点所有 HTML 的共享结构。
- 四个故意制造的回归必须被拒绝：旧导航、重复 Header、丢失主导航、改变 Header 结构。生成器、有效 CSS、JS 中恢复旧导航也会失败。
- `scripts/test_shared_header_browser.py`：同一 Chromium，320/390/768/1440、浅色/深色，首页、青花瓷、湖田窑、唐英、器物图谱、时间轴；对比几何位置、字号、颜色、间距和 Header 像素。像素容差仅允许通道差超过 16 的像素占比 ≤0.5%，避免抗锯齿噪声；几何及 CSS 比较必须完全相同。
- 实测主题切换、搜索真实条目、弹窗焦点约束、ESC 返回焦点、Ctrl+K、手机菜单键盘与无 JavaScript 导航；截图上传 CI artifact。
- Validate 与 Pages 的发布前构建都重新生成 250 页并执行这些检查；Pages 发布后再次对线上页面执行浏览器检查。任一发布前检查失败，Pages artifact 不会上传。

## 验收结果

本地严格构建通过；250 个百科 SEO/正文结构与全站 308 页 Header 结构通过；31,660 个内部目标零缺失。954 项 Header 浏览器检查通过（48 个屏宽/主题/页面组合，另含无 JavaScript 导航和焦点恢复回归），174 项既有浏览器检查与 228 项第一轮质量验收通过。正式 TypeScript 检查为 0 errors；90 项来源渲染检查及现有搜索、来源披露、正文清理、图片恢复、metadata、编辑发布边界与安全检查通过。详细结果保存在同目录 JSON 文件中。

代码提交：`da09e249897180a63b83d944bb2d18d07909e079`，已推送 `main`。GitHub Validate 已成功；Pages 发布前构建与发布步骤均已成功。已从正式 canonical URL 实际重新读取 250/250 个百科页面，全部通过 Header、主导航、canonical、JSON-LD、可索引正文和来源结构检查（`production-all-entries.json`）。独立线上浏览器验收：954/954 通过，0 失败，覆盖指定六类页面的 48 个屏宽/主题组合。全部 Header 几何和样式与首页一致，像素比较通过；主题、搜索、手机菜单、键盘及无 JavaScript 路径通过。正式 Pages 工作流（包括构建门禁、实际部署、既有线上 smoke、新增线上 Header 检查与既有 ACL smoke）最终 SUCCESS；Validate 工作流最终 SUCCESS。完整步骤状态保存在 `pages-run.json`、`validate-run.json`。本次 Header 任务状态：DONE。

线上验收页面：

- [首页](https://justinxyj.github.io/jingdezhen-porcelain-wiki/)
- [青花瓷](https://justinxyj.github.io/jingdezhen-porcelain-wiki/entry/blue-and-white/)
- [湖田窑](https://justinxyj.github.io/jingdezhen-porcelain-wiki/entry/hutian-kiln/)
- [唐英](https://justinxyj.github.io/jingdezhen-porcelain-wiki/entry/tang-ying/)
- [器物图谱](https://justinxyj.github.io/jingdezhen-porcelain-wiki/museum/catalog/)
- [历史时间轴](https://justinxyj.github.io/jingdezhen-porcelain-wiki/museum/timeline/)

构建验证：[Validate run 37748885272](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37748885272)。发布记录：[Pages run 37748885286](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37748885286)。对应 CI artifacts 保存了构建前后全部浏览器截图，`after/` 也保存了独立正式网站验收的完整截图与 Header 截图。

## 截图

`before/` 为改动前正式网站截图，包含首页与青花瓷详情的四种屏宽、两种主题。旧百科没有主题按钮，其深色对照通过设置既有主题属性获得；首页使用实际主题切换按钮。`after/` 保存正式部署后的六类页面截图和 Header 特写，其中包含与 before 相同屏宽/主题的首页和青花瓷详情。所有截图使用同一 Chromium 和 900px 高度。

### 前后对照入口

| 页面/条件 | 改动前正式网站 | 改动后正式网站 |
|---|---|---|
| 首页 · 390px · 浅色 | [before](before/home-390-default.png) | [after](after/home-390-default.png) |
| 青花瓷 · 390px · 浅色 | [before](before/entry-390-default.png) | [after](after/blue-and-white-390-default.png) |
| 首页 · 1440px · 深色 | [before](before/home-1440-slate.png) | [after](after/home-1440-slate.png) |
| 青花瓷 · 1440px · 深色 | [before](before/entry-1440-slate.png) | [after](after/blue-and-white-1440-slate.png) |

## 修改范围与保留边界

模板：`overrides/main.html`；生成器：`scripts/generate_entry_pages.py`；共享导航上下文：`hooks/visitor_navigation.py`；样式/交互：`docs/stylesheets/visitor.css`、`docs/javascripts/visitor-ui.js`；清理旧全局：`docs/javascripts/wiki-enhancements.js`、`types/jdm-globals.d.ts`；三处源码文档链接：`docs/contemporary/index.md`；回归与 CI：`scripts/check_shared_header.py`、`scripts/test_shared_header_browser.py`、`scripts/ux_quality_acceptance.py`、两个既有 GitHub workflows。其余改动均为本次验收报告与截图。

未修改生产数据库、三个内容编辑稿、生产百科事实和来源，也未继续第二轮阶段 B 内容修订。没有残留旧 Header 回退实现。现有 250 页 URL 与 Supabase 读取机制保留；本任务未发现仍需外部权限解决的 Header 阻塞项。该结论仅针对本次 Header 修复，不代表其他内容质量任务已经完成。

验收材料的补充提交仅更新 `reports/header-unification/`，使用 `[skip ci]`，不改变已验收的生产前端代码；生产运行的代码提交明确为上述 `da09e24`。
