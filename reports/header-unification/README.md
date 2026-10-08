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

本地严格构建通过；250 个百科 SEO/正文结构与全站 308 页 Header 结构通过；31,660 个内部目标零缺失。954 项 Header 浏览器检查通过（48 个屏宽/主题/页面组合，另含无 JavaScript 导航和焦点恢复回归），174 项既有浏览器检查通过。正式 TypeScript 检查为 0 errors；90 项来源渲染检查及现有搜索、来源披露、正文清理、图片恢复、metadata、编辑发布边界与安全检查通过。详细结果保存在同目录 JSON 文件中。

正式网站的最终结果、提交和部署记录将在部署验收后填入；此处不将本地结果误报为已发布。

## 截图

`before/` 为改动前正式网站截图，包含首页与青花瓷详情的四种屏宽、两种主题。旧百科没有主题按钮，其深色对照通过设置既有主题属性获得；首页使用实际主题切换按钮。`after/` 将保存正式部署后的同样两页截图。所有截图使用同一 Chromium 和 900px 高度。
