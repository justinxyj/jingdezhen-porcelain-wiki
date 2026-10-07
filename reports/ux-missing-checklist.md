# UX Missing Checklist

基线：生产 main `4b7a2bd33662d41cd40d490c4c7812daec6f8165`。2026-10-07 开始。

下表在实现前建立；勾选仅表示已完成并取得对应验收证据。最终报告另列 DONE / BLOCKED / NOT APPLICABLE。JS 文件位于 `docs/javascripts/`。

| 完成 | 原遗漏项 | 文件 / 数据表 / 组件 | 必须取得的证据 |
|---|---|---|---|
| [ ] | 79 个数据库条目文案 | content/editorial/entry-drafts.json → entries.zh / sources / version | 逐条审稿、哈希校验、备份、写入后读取与页面正文比对 |
| [ ] | 65 道工序文案 | content/editorial/process-drafts.json → craft_processes | 65 条五问审稿、排除 7 条术语待考稿、生产回读 |
| [ ] | 16 个时间轴语境 | content/editorial/timeline-drafts.json → timeline_context；timeline-details.js | 逐条核对来源；编辑综述不冒充官方摘要；生产回读 |
| [ ] | Markdown 静态专题进入统一搜索 | knowledge-store.js / entry-search.js；docs/**/*.md；构建索引 | 数据库与专题同一结果结构、链接存在 |
| [ ] | 搜索是否有图片 | knowledge-store.js / entry-search.js；media | 可用图片字段正反例 |
| [ ] | 搜索是否有文献 | knowledge-store.js / entry-search.js；来源 metadata | 普通 URL 不触发文献筛选 |
| [ ] | 空结果相似推荐 | entry-search.js / knowledge-store.js | xxxxxxxx 不随机产生相似词 |
| [ ] | 空结果类别推荐 | entry-search.js | 类别、热门、清除筛选均可操作 |
| [ ] | 别名扩充 | knowledge-store.js；规范化词典 | 用户列出的全部高频词 |
| [ ] | 拼音扩充 | knowledge-store.js；规范化词典 | qinghua 至 qingbai，含 fen cai |
| [ ] | 繁简体容错 | knowledge-store.js；规范化词典 | 御窯、青花瓷、景德鎮等与简体等价 |
| [ ] | Evidence 来源分类 | wiki-enhancements.js / evidence-hub.js；sources metadata | 明确 metadata 分类；未知归其他资料 |
| [ ] | Evidence 完整证据链入口 | wiki-enhancements.js / evidence-hub.js | 收起默认、分类展开、证据链跳转及核验标签 |
| [ ] | 图片查看器覆盖剩余入口 | visitor-ui.js / museum.js / timeline-details.js / global-kiln-map.js | 封面、时间轴、目录、人物、图库、地图、相关卡片逐项点击 |
| [ ] | 图片 metadata | visitor-ui.js；media | 展示实际年代、作者、机构、权利；缺失不伪造 |
| [ ] | 器物釉色筛选 | museum.js / knowledge-store.js；器物 metadata | 真实字段过滤；缺失不参与 |
| [ ] | 器物纹饰筛选 | museum.js / knowledge-store.js；器物 metadata | 真实字段过滤；缺失不参与 |
| [ ] | 器物馆藏机构筛选 | museum.js / knowledge-store.js；器物 metadata | 禁止标题推断；真实字段过滤 |
| [ ] | 人物生卒年 | museum.js / knowledge-store.js；人物 metadata | 可靠日期或未知 |
| [ ] | 人物为什么重要 | museum.js；人物正文及可靠资料 | 1–2 句有依据说明 |
| [ ] | 人物关键词 | museum.js；人物 metadata | 真实身份、主题关键词 |
| [ ] | 地图地域筛选 | global-kiln-map.js；地理 metadata | 地域互斥；全部覆盖 |
| [ ] | 地图 Hover / Focus 联动 | global-kiln-map.js | 列表 hover/focus/click 与 marker click/focus 双向测试 |
| [ ] | 地图详情图片 | global-kiln-map.js；media | 可用图片显示并进入查看器 |
| [ ] | 地图相关器物入口 | global-kiln-map.js；relations | 真实关系存在才出现 |
| [ ] | 地图相关人物入口 | global-kiln-map.js；relations | 真实关系存在才出现 |
| [ ] | 搜索移动端 Bottom Sheet | entry-search.js / visitor.css | 移动视口打开、应用、清除、数量、焦点返回 |
| [ ] | Relation 关系语义 | knowledge-store.js / wiki-enhancements.js / network-explorer.js；relations | 有依据标签；未知保持相关内容 |
| [ ] | Global Network 与景德镇关系说明 | global-network.js；timeline_context / relations | 核心路线有据；无联系内容保留但不冒充核心 |
| [ ] | 当代景德镇历史延续路线 | docs/contemporary*；现有条目与专题 | 四条延续路线、真实目标和来源 |
| [ ] | Footer 统一 | overrides/main.html / scripts/generate_entry_pages.py | 三组导航、静态与模板一致、无 404 |
| [ ] | Breadcrumb 统一 | overrides/main.html / scripts/generate_entry_pages.py | 首页 › 分类 › 当前页 |
| [ ] | Loading 统一 | 公共状态组件及数据页面 | 同一 loading 语义 |
| [ ] | Error 统一 | 公共状态组件及数据页面 | 重试、技术详情折叠、空态 |
| [ ] | Design Tokens / 重复 CSS 收敛 | docs/stylesheets/visitor.css 及组件 CSS | 颜色、间距、圆角、阴影、表单、卡片、弹窗与状态 |
| [ ] | 首页长度量化 | docs/index.md；生产基线 4b7a2bd | 同视口 Before/Current 高度、section 数、首屏元素 |
| [ ] | Accessibility 完整验收 | scripts/ux_browser_smoke.py 及专项验收 | 键盘、焦点、弹窗、语义、对比度、减少动画；全部重点页面 |
| [ ] | Performance 完整验收 | hooks/page_assets.py；浏览器性能验收 | 六类页面实际 bytes/requests/coverage；非必要库不加载 |
| [ ] | 782 个类型错误处理 | types/jdm-globals.d.ts / types/database.types.ts / tsconfig.json / 业务 JS | 正式 npm run typecheck 为 0；不降低规则 |
| [ ] | 最终生产环境验收 | .github/workflows/deploy-pages.yml；scripts/pages_smoke.py | 实际生产页面、移动端、暗色、完整 A/B/C/D 路径 |

## 已确认的基线与外部依赖

- `npm run typecheck:js`：782 errors；完整输出保留于 `/tmp/ux2-type-baseline.log`。
- 当前环境未配置数据库写入凭据。Actions run `37616837093` 明确记录 H3_DB_URL 未配置，探针跳过；该成功状态不证明数据库已验证。已请求通过安全渠道配置连接。
- 内容草稿与生产状态分开记录；当前不能把 79 / 65 / 16 草稿计为生产完成。
