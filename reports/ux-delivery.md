# UX 优化交付报告

基线：远端 `main` / `92b957c8c7fb94787ae5645244fbf7d65fe987b1`。执行日期：2026-10-07。工作分支：`work`。

## A. 修改摘要

已按修改前审计推进 P0 → P1 → P2，并分批提交。前轮文案单独保存在 `a6ce8b1`；本次 UX 不改数据库、条目 slug、关系数据或来源发布状态，也未向生产库写入文案草稿。

- 统一六项主导航：首页、百科、博物馆、地图与时间、研究、搜索。保留七主题入口、面包屑和统一页脚；英、日导览明确标为 Beta。
- 首页恢复“青花，不止于蓝。”，增加主搜索、热门词、八步入门路线、七主题、三件故宫藏瓷、时间／地图与关联阅读。旧首页锚点继续保留；静态内容不依赖 reveal 动画。
- 全局搜索复用 knowledge-store；支持 `/` 与 Ctrl / Command + K、直达条目的联想。移除单字母 S 与会被 `?q=` 自动展开的重复主题搜索入口。
- 修复零分条目也进入结果的错误；增加真实 offset 分页、分类标签、折叠高级筛选、关键词高亮、实有图片、空状态及重试。常用别名、拼音和部分繁体名称在同一索引内归一化。
- 条目正文收敛到最大 860px、17–18px 字号与 1.9 行高；补充地图／时间入口、分类关联阅读、来源记录数、折叠研究入口与反馈链接。新增“编辑选读”单独标示，不将其写入历史关系表。
- 地图默认景德镇，支持四级范围、屏幕网格聚合、标记／目录联动、地图／列表切换与原生详情弹窗。时间轴保留三泳道，统一一套弹窗，阅读全文为主入口。
- 关系页默认关联内容，整体 SVG 图放入高级视图；图形关闭时不执行布局。保留研究与全球交流功能，并明确与景德镇的关系及比较边界。
- 图片保留完整器形，增加键盘可用的放大查看、署名和来源入口；缺图明确说明。继续保留故宫图像署名及许可说明，不把官方照片标为 CC0。
- Leaflet 1.9.4、Supabase JS 2.117.0 本地固定版本并附许可证。页面构建阶段筛选组件资源；首页初载不请求地图、Supabase SDK 或知识库。搜索打开时才加载数据依赖。
- 250 个静态条目生成成功，保留 canonical、OG、结构化数据和条目 sitemap。新链接优先静态条目；原 `/entry/?slug=` 入口继续可用。修复 robots.txt 中的字面 `\n`。

## B. 文件列表

主要实现：`hooks/page_assets.py` 控制页面资源；`overrides/main.html` 统一导航与页脚；`visitor-ui.js` 提供搜索和弹窗；`visitor.css` 提供局部设计变量与响应式调整；`generate_entry_pages.py` 同步静态条目体验；`docs/data/reading-paths.json` 保存明确标示的编辑选读。

UX 提交相对审计基线修改／新增文件如下（不含此前文案批次与本报告附件）：

- `.gitignore`
- `docs/contemporary/index.md`
- `docs/craft/README.md`
- `docs/data/reading-paths.json`
- `docs/en/index.md`
- `docs/history/README.md`
- `docs/index.md`
- `docs/ja/index.md`
- `docs/javascripts/entry-search.js`
- `docs/javascripts/global-kiln-map.js`
- `docs/javascripts/global-network.js`
- `docs/javascripts/knowledge-store.js`
- `docs/javascripts/literature-library.js`
- `docs/javascripts/museum.js`
- `docs/javascripts/network-explorer.js`
- `docs/javascripts/timeline-details.js`
- `docs/javascripts/visitor-ui.js`
- `docs/javascripts/wiki-enhancements.js`
- `docs/javascripts/wiki-timeline.js`
- `docs/javascripts/world-browser.js`
- `docs/kilns/README.md`
- `docs/museum/catalog.md`
- `docs/museum/gallery.md`
- `docs/museum/kiln-map.md`
- `docs/museum/people.md`
- `docs/museum/timeline.md`
- `docs/museum/voices-and-books.md`
- `docs/network/README.md`
- `docs/network/global.md`
- `docs/network/relations.md`
- `docs/objects/README.md`
- `docs/people/README.md`
- `docs/research/README.md`
- `docs/search.md`
- `docs/stylesheets/visitor.css`
- `docs/vendor/README.md`
- `docs/vendor/leaflet/LICENSE`
- `docs/vendor/leaflet/images/layers-2x.png`
- `docs/vendor/leaflet/images/layers.png`
- `docs/vendor/leaflet/images/marker-icon-2x.png`
- `docs/vendor/leaflet/images/marker-icon.png`
- `docs/vendor/leaflet/images/marker-shadow.png`
- `docs/vendor/leaflet/leaflet.css`
- `docs/vendor/leaflet/leaflet.js`
- `docs/vendor/supabase/LICENSE`
- `docs/vendor/supabase/supabase.min.js`
- `hooks/page_assets.py`
- `mkdocs.yml`
- `overrides/main.html`
- `scripts/check_built_links.py`
- `scripts/generate_entry_pages.py`
- `scripts/sources_render_dynamic_harness.js`
- `scripts/test_search_discovery.mjs`
- `scripts/ux_browser_smoke.py`

## C. Before → After

|界面|修改前|修改后|
|---|---|---|
|首页|重复导航、整屏展示、无主搜索|六项统一导航、74vh 桌面／68svh 移动 Hero、主搜索与阅读路线|
|搜索|只显示前 12 条，不匹配结果仍出现|准确排除零分项，分页展示全部匹配，联想直达|
|条目|侧轨占阅读宽度，研究入口与正文混排|正文居中，关联按类别展示，研究折叠，反馈可达|
|地图|默认世界范围，详情内容重复|默认景德镇，四级范围、聚合、目录联动与精简详情|
|时间轴|两套弹窗，缺少完整条目主入口|单一原生弹窗，阅读全文、焦点限制与恢复|
|网络|默认密集整体图，技术术语外露|关联内容先行，可选高级图形，关系类型中文展示|
|资源|所有业务脚本全站加载，依赖外部 CDN|页面按需加载，本地固定核心库；首页延迟数据请求|
|故障|部分页面失败后只剩错误信息|静态文章与主题链接可读，条目增强失败保留正文和来源|

预览：[桌面首页](ux-previews/home-desktop.png)、[移动地图](ux-previews/map-mobile.png)、[移动搜索](ux-previews/search-mobile.png)。截图为深色模式；浅色也在同一测试矩阵中验收。

## D. 未执行与范围限制

1. **未推送或部署**：交付为工作区中的可审阅提交，线上站点尚未更新。
2. **全量 JS 严格类型检查仍未通过**：初始 785 项，最终 782 项。此次未通过关闭规则、扩大 any 覆盖或排除业务文件来伪装通过；旧类型债务需要另行系统处理。
3. **搜索容错为有限词表**：支持已列出的常用拼音／别名和部分繁体字符；不声称支持任意汉字拼音、完整繁简转换或模糊拼写纠错。统一搜索覆盖公开知识条目；独立 Markdown 专题仍可由主题导航进入。
4. **首页压缩采用结构调整**：合并重复板块、收敛标题和留白；没有取得稳定的旧版高度测量，因此不宣称已精确缩短 30%。
5. **可访问性并非认证**：已测试语义、标题、焦点、Esc、键盘、减弱动画与响应式；未进行真人屏幕阅读器或完整 WCAG 审计。
6. **外部图像、底图与数据库仍为外部服务**：核心库已本地化，但不承诺外部图片与瓦片永远在线。保留缺图、目录及静态正文回退。未更改馆方图像权利状态。
7. 没有补造缺失的生卒年、坐标、馆藏机构、证据等级或关系说明。已有字段才展示；编辑选读与事实关系明确区分。

## E. 测试结果

|检查|结果|
|---|---|
|MkDocs 严格构建|通过，0 构建警告；未进入 nav 的辅助页面为 INFO|
|静态条目生成|250 个公开条目；生成 sitemap 与 robots|
|浏览器体验矩阵|**174 / 174 通过**，运行时 pageerror 为 0|
|屏宽|375、390、430、1366、1440、1920；主要 11 类页面均无横向溢出|
|主题|上述屏宽检查浅色与深色|
|核心路径 A|青花 → 元代背景／具体元青花器物的编辑选读|
|核心路径 B|唐英 → 御窑 → 地图入口|
|核心路径 C|景德镇地图 → 湖田窑 → 青白瓷器物阅读|
|核心路径 D|时间轴弹窗 → 完整条目 → 来源|
|无 JavaScript|首页、静态条目、窑址文章、地图专题入口、关系页专题入口可读|
|后端故障|阻断 Supabase 后，静态条目正文及来源仍保留|
|全局搜索|拼音联想、规范条目链接、Esc 关闭及焦点返回通过|
|分页与空结果|浏览器及 Node 测试通过；24 条结果无重复；未知名称显示空状态|
|来源展示|**84 / 84 通过**，含动态 jsdom；待发布来源、URL 去重、编号及恶意标签过滤保持一致|
|图片恢复|同对象恢复、禁止无关候选替代与失败回退测试通过|
|站内资源／链接|**13,968 个目标，0 缺失**|
|安全静态检查、结构检查、Museum QA|通过；Museum QA 保留 2 条既有内部措辞启发式提醒|
|TypeScript 数据契约|通过|
|全量 JS 类型检查|未通过，782 项，详见范围限制|

完整逐项结果见 [ux-browser-results.json](ux-browser-results.json)。新增可复跑脚本：

```bash
python scripts/generate_entry_pages.py
mkdocs build --strict
python scripts/check_built_links.py site
node scripts/test_search_discovery.mjs
node scripts/test_museum_image_recovery.mjs
# 安装可选 jsdom 后运行静态／动态来源一致性检查
python scripts/test_sources_render.py --require-dynamic
# 先把 site 以 /jingdezhen-porcelain-wiki/ 子路径提供 HTTP 服务
UX_BASE_URL=http://127.0.0.1:8001/jingdezhen-porcelain-wiki/ python scripts/ux_browser_smoke.py
npm run typecheck:contracts
```

## F. Regression 检查

- 远端 main 已核对后才修改；前轮文案独立保留。
- 未删除 Evidence、Graph、Map、Timeline 或七主题数据模型；旧图仍可打开。
- 无数据库迁移、生产写入、删除条目或改 slug；来源可见性及安全清理规则保留。
- 页面子路径、旧查询条目入口、静态规范入口、旧首页锚点保留。
- 静态条目保留 SEO 元数据；动态失败不会擦除既有正文。
- 所有变更的业务 JavaScript 语法检查与 `git diff --check` 通过。
- 搜索确实改变了错误的旧计数：青花现返回 34 个匹配，而非将全部条目当作匹配。
- 测试 harness 改用来源列表的稳定 class 定位，不再依赖已改写的标题装饰文字；原有 84 项断言均保留。

## G. Commit

- `a6ce8b1 content: preserve reviewed porcelain editorial work`
- `fa567b2 docs: audit current main against full UX requirements`
- `e68dd64 feat(ux): simplify navigation and homepage with lazy global search`
- `5f9b9bc fix(search): exclude nonmatches and add pagination and name aliases`
- `c6d7963 feat(ux): improve entry reading and accessible map and timeline dialogs`
- `6887a43 feat(network): lead with readable relations and make graph optional`
- `3cd2edf perf(ux): pin local libraries and preserve static entry navigation`
- `65a4139 feat(ux): complete guided reading and responsive accessibility`
- `fe21c42 test(ux): cover search accuracy and complete visitor journeys`
- `01eceba test(entry): keep source parity checks independent of heading copy`

本报告及结果附件另行提交；所有提交均保留在 `work` 分支。
