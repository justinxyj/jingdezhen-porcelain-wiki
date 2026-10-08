# UX Final Completion Report

本轮整体状态：**BLOCKED**。40 个原遗漏项：**30 DONE / 10 BLOCKED / 0 NOT APPLICABLE**。

前端代码已推送 main、发布到 GitHub Pages，并在真实线上重新验收。生产代码提交：`e4faee7f7d15cd908c8b2aacd31013947b640d6a`；本轮基线：`4b7a2bd33662d41cd40d490c4c7812daec6f8165`。报告存档提交不改变这份已验收代码。

**新版数据库文案没有发布。** 2026-10-08 的最新公开生产回读显示 79 / 65 / 16 个目标记录仍是原版本。云环境与仓库发布工作流均缺少数据库写入连接。不能把编辑稿、前端功能通过或跳过数据库探针的绿色 CI 当作内容上线。

## 1. 原遗漏项与当前状态

修改前的文件、表、组件及证据映射保存在 [Missing Checklist](ux-missing-checklist.md)。下表逐项闭环；BLOCKED 的组件代码和审定稿不计作生产数据完成。

| # | 原遗漏项 | 当前状态 | 结果 / 依据 |
|---|---|---|---|
| 1 | 79 个数据库条目文案 | **BLOCKED** | 79 份逐条语义重编已提交；生产 0/79，缺数据库写入连接。 |
| 2 | 65 道工序文案 | **BLOCKED** | 65 份五问说明已审定；7 个术语待考稿排除；生产 0/65。 |
| 3 | 16 个时间轴语境 | **BLOCKED** | 16 份有来源的历史解释已审定；生产 0/16。 |
| 4 | Markdown 静态专题进入统一搜索 | **DONE** | 构建索引与数据库统一 schema；实际搜索进入 craft/qinghua/。 |
| 5 | 搜索是否有图片 | **DONE** | 使用实际可用 media 或专题图片；72 项线上专项包含正向过滤。 |
| 6 | 搜索是否有文献 | **DONE** | 使用明确出版/学术/历史文献 metadata；普通 URL 反例不通过筛选。 |
| 7 | 空结果相似推荐 | **DONE** | 仅唯一、距离受限的英文别名错拼提示；xxxxxxxx 无随机相似推荐。 |
| 8 | 空结果类别推荐 | **DONE** | 空态展示原查询、清除筛选、真实类别及固定热门内容。 |
| 9 | 别名扩充 | **DONE** | 覆盖用户高频词表；玲珑瓷进入现有青花专题，影青映射青白瓷。 |
| 10 | 拼音扩充 | **DONE** | 覆盖指定拼音，含 fen cai / fencai；线上结果集合对比。 |
| 11 | 繁简体容错 | **DONE** | NFKC、大小写、空格与核心繁简字词规范化；线上同义查询集合一致。 |
| 12 | Evidence 来源分类 | **DONE** | 明确 metadata 才分类；其余显示其他资料；来源数量不代表核验。 |
| 13 | Evidence 完整证据链入口 | **DONE** | 默认收起参考资料，分类展开，进入独立证据链；缺少 claim/verification 如实说明。 |
| 14 | 图片查看器覆盖剩余入口 | **DONE** | Entry、Catalog、Gallery、Search、Map、Timeline 实际点击；人物与相关卡片无图入口不伪造。 |
| 15 | 图片 metadata | **DONE** | 实际来源、年代、作者、权利按存在显示；来源机构与馆藏机构分开；相关条目年代不冒充图像精确年代。 |
| 16 | 器物釉色筛选 | **BLOCKED** | 组件、真实字段过滤及未知回退已发布；新增审定釉色 metadata 未写入。 |
| 17 | 器物纹饰筛选 | **BLOCKED** | 组件和字段检查已发布；新增审定莲池纹 metadata 未写入。 |
| 18 | 器物馆藏机构筛选 | **BLOCKED** | 组件和真实机构字段检查已发布；2 件器物审定馆藏 metadata 未写入。 |
| 19 | 人物生卒年 | **BLOCKED** | 仅显示可靠字段，未知允许隐藏；3 个审定生年待随数据库发布。 |
| 20 | 人物为什么重要 | **BLOCKED** | 现有有来源正文首段贡献说明已上线；9 人进一步审定的重要性资料尚未写入。 |
| 21 | 人物关键词 | **BLOCKED** | 真实身份、时代及现有关键词回退上线；9 人审定主题关键词尚未写入。 |
| 22 | 地图地域筛选 | **DONE** | 41 地点、互斥地域分类、并集覆盖；10 项实际地图验收。 |
| 23 | 地图 Hover / Focus 联动 | **DONE** | 列表 hover/focus/click 与 marker click/focus、平移和滚动实际通过。 |
| 24 | 地图详情图片 | **DONE** | 有实际 media 才展示；详情图能进入共享查看器。 |
| 25 | 地图相关器物入口 | **DONE** | 御窑厂详情实际进入唐英款钧釉瓶，无关系不显示空按钮。 |
| 26 | 地图相关人物入口 | **DONE** | 御窑厂真实关联唐英；实际地图验收通过。 |
| 27 | 搜索移动端 Bottom Sheet | **DONE** | 原生 dialog；五组筛选、计数、应用/清除、Tab 包含、ESC 与焦点返回。 |
| 28 | Relation 关系语义 | **DONE** | 6 条已存在、有依据的有向关系增加释义；其余保持相关内容，不制造边。 |
| 29 | Global Network 与景德镇关系说明 | **DONE** | 景德镇核心路径优先；无明确联系的世界内容保留为比较资料。 |
| 30 | 当代景德镇历史延续路线 | **DONE** | 4 条有来源阅读路线，链接现有条目/专题，不制造博物院或大学假 Entry。 |
| 31 | Footer 统一 | **DONE** | 探索/工具/项目共享导航；静态条目与模板一致；检查实际链接和单一 Footer。 |
| 32 | Breadcrumb 统一 | **DONE** | 首页 › 分类 › 当前页；统一 aria-current；线上跨模板检查。 |
| 33 | Loading 统一 | **DONE** | 共享 loading、aria-busy；剩余技术/全球/博物馆加载入口收敛。 |
| 34 | Error 统一 | **DONE** | 共享 Error/Empty/Retry；技术详情折叠；断开后端仍保留静态正文。 |
| 35 | Design Tokens / 重复 CSS 收敛 | **DONE** | 统一颜色、空间、圆角、阴影与控件/卡片/弹窗/筛选/状态基础规则，保留既有布局。 |
| 36 | 首页长度量化 | **DONE** | 同视口比较初轮 UX 前、本轮生产基线、当前；桌面较初轮前 -43.2%，手机 -32.6%。 |
| 37 | Accessibility 完整验收 | **DONE** | 页面与打开状态 axe、键盘/焦点/缩放、实际 focus-visible、减少动画、共享文本对比度；限定为浏览器验收。 |
| 38 | Performance 完整验收 | **DONE** | 6 类生产页面冷缓存 requests/JS/CSS/coverage 实测，检查按页重库和图片加载。 |
| 39 | 782 个类型错误处理 | **DONE** | 正式 npm run typecheck 为 0 errors；保持 strict，未新增 any/@ts-ignore/核心排除。 |
| 40 | 最终生产环境验收 | **BLOCKED** | 前端发布及请求页面/四条路径 PASS；新版数据库内容未发布，整体不能 DONE。 |

## 2. Production Database

| 内容 | Draft | Production | Production verified |
|---|---|---|---|
| 79 个条目 | 79/79 已逐条重编，未应用 | **0/79** 新版 | **NO** |
| 65 道工序 | 65/65 已审定，7 个术语待考稿不在发布清单 | **0/65** 新版 | **NO** |
| 16 个时间轴语境 | 16/16 已审定为历史解释 | **0/16** 新版 | **NO** |

Production verified：**NO**。这里的 NO 指新版内容未发布、未能验证新版页面；已真实执行公开生产读回，160 个原记录的快照守卫全部未改变。证据：[逐目标回读](ux-final-evidence/production-content-status.json)。

内容稿进行语义重编，解释对象、意义、历史/工艺/影响；工序说明覆盖操作、目的、方法、效果及前后联系。历史综述保留来源范围，不把官方引文与编辑综合说明混为一谈，不生成无法证实的人物/因果。草稿中的内部审核字段不进入公开正文。

发布机制已实现：目标数量与唯一性校验、完整记录哈希和版本守卫、串行化事务与行锁、受保护备份、diff、默认写入后读回并回滚的 Preview、必须匹配审阅 Preview SHA256 的 Apply、提交后独立读回收据。没有连接之前，**以上机制没有在生产数据库实际执行**，离线测试不能代替它。

| 必须步骤 | 实际执行状态 |
|---|---|
| 离线目标身份、160 条数量、原记录守卫检查 | DONE |
| 生产备份 / 可恢复数据库状态确认 | BLOCKED：缺写入连接，未创建生产备份 |
| 生产 Preview / 回滚 Dry Run | BLOCKED：连接检查即停止 |
| 实际生产 diff 审阅 | BLOCKED：无 live Preview，只有审定稿 |
| 写入、提交、独立生产读回 | BLOCKED：未执行任何数据库写入 |
| 网站读取新版正文 | BLOCKED：生产仍为旧正文 |

真实尝试：[Editorial preview run 37671062659](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37671062659)，在连接检查以 exit 2 停止，原日志为：`BLOCKED: H3_DB_URL is not configured. No preview or writes performed.` 本次云环境再次检查 H3_DB_URL / DATABASE_URL 均不存在。数据库探针跳过不作为通过证明。

新增 metadata 同样属于尚未发布的数据：2 件器物的真实馆藏/釉色/纹饰，9 人的身份/贡献/关键词，其中 3 人有审定生年；日期不详者不补造日期。详见 [entry-drafts.json](../content/editorial/entry-drafts.json) 与 [安全发布说明](../content/editorial/PUBLISHING.md)。

## 3. Search

| 项目 | 验收 | 实际结果 |
|---|---|---|
| Database | PASS | 真实青花、唐英等数据库结果，可进入实际 Entry |
| Markdown | PASS | 同一搜索结果进入青花专题；schema 统一，source_type 不作为用户分类显示 |
| Alias | PASS | 用户高频词字典及核心搜索正反例；玲珑瓷落到现有有来源专题 |
| Pinyin | PASS | qinghua/qinghuaci/yuyao/hutian/tangying/gaoling/jingdezhen/fen cai/fencai/qingbai |
| Traditional Chinese | PASS | 御窯廠、景德鎮、雞缸杯、玲瓏瓷、琺瑯彩等与对应简体结果集合一致 |
| Filters | PASS | 图片以实际可用图像字段，文献以明确出版类型及书目信息；普通 URL 不被认作文献 |
| Empty State | PASS | xxxxxxxx 展示原查询、清除、相关类别、固定热门；不随机生成相似结果 |
| Mobile Bottom Sheet | PASS | 类型/时代/领域/图片/文献，数量、应用和清除；焦点包含、ESC、返回按钮 |

线上证据：[搜索、图片与导航专项](ux-final-evidence/production-search-images-navigation.json)；规范化与错误字段反例在 `scripts/test_search_discovery.mjs`。PASS 仅表示检索功能，不表示数据库重编内容已写入。

## 4. Evidence

| 项目 | 验收 | 结果 |
|---|---|---|
| 分类 | PASS | 博物馆与馆藏机构/学术研究/历史文献/官方资料/其他来源依赖明确 metadata；未知落入其他资料 |
| Verified 状态 | PASS | 普通参考 URL 显示参考资料；必须有 verified 状态、审阅者/时间、claim、定位信息才显示核验 |
| Evidence Chain | PASS | Entry 收起参考资料，可展开分类及进入完整链页面；存在的 source/relation/provenance 显示，缺少 claim/verification 如实保留未知 |

“分类通过”不代表每条历史来源都有足够 metadata；“证据链通过”不代表本站全部主张已核验。唐英参考资料默认收起，未虚标已核验；青花—欧洲中国风的已有关系进入实际 UNESCO 来源。来源一致性测试验证页面索引与链接，不把 URL 数量当作核验来源数量。

## 5. Catalog / People / Map / Relations / Images

| 项目 | 功能验收 | 数据发布验收 | 说明 |
|---|---|---|---|
| Catalog 釉色 | PASS | **FAIL** | 真实 metadata 过滤、未知不参与；审定铜红釉数据未写入 |
| Catalog 纹饰 | PASS | **FAIL** | 真实字段过滤；审定莲池纹数据未写入 |
| Catalog 馆藏机构 | PASS | **FAIL** | 不按标题推断；2 件器物的审定机构数据未写入 |
| People 生卒年 | PASS | **FAIL** | 已知端点才显示，未知允许隐藏；审定新增日期未写入 |
| People 为什么重要 | PASS | **FAIL** | 已上线读取现有正文贡献说明；9 人进一步编辑的重要性 metadata 未写入 |
| People 关键词 | PASS | **FAIL** | 已有真实身份/时代/关键词显示；9 人审定主题关键词未写入 |
| Map 地域 | PASS | PASS | 41 地点，分类互斥且并集覆盖；景德镇 5、中国其他 17、日本 3、韩国 4、东南亚 3、西亚 3、欧洲 6、其他 0 |
| Map 双向联动 | PASS | PASS | Hover/Focus/Click 高亮、平移、Marker→列表滚动、焦点返回均实际通过 |
| Map 详情与关联 | PASS | PASS | 真实图片、地点、年代、摘要、百科；只有已存在器物/人物关系才给入口 |
| Relation 语义 | PASS | PASS | 6 条可靠已有边的语义覆盖；未确认的边仍显示相关内容 |
| Global Network | PASS | PASS | 景德镇相关核心与其他比较资料分层；不删除世界资料、不制造联系 |
| 当代历史延续路线 | PASS | PASS | 御窑/博物馆、技艺/非遗、教育/陶大专题、外销/当代交流四线，真实目标与引用 |
| Images 共享 Viewer | PASS | PASS | Entry/Catalog/Gallery/Search/Map/Timeline 实际入口；双轴放大/缩小、等比适窗、ESC 与来源 |
| Images metadata | PASS | PASS | 实际来源及使用条件；相关内容年代、作者、馆藏、来源机构按真实字段展示，缺失不补造 |

地图专项：[10 条真实联动检查](ux-final-evidence/production-map.json)。人物当前没有可用图片、相关条目卡片当前为纯文字时，该具体图片入口为 NOT APPLICABLE，未制造图片填空。故宫图像有实际来源入口；可信机构来源不自动等于所有图像都可自由再利用，版权页与已知图像条件如实保留。

## 6. Accessibility

实际生产浏览器验收：13 个页面 × 明暗模式（26），7 个打开状态 × 明暗模式（14），共 40 个 axe 状态，**0 detected violations**；22 项菜单/筛选/图片键盘检查、3 项图键盘与 AX 树检查、30 项焦点/减少动画/共享颜色检查通过。没有禁用 axe 规则。

| 要求 | 结果 | 证据 / 范围 |
|---|---|---|
| Keyboard-only / Tab order | PASS | 移动菜单 Enter、筛选 Tab/Shift+Tab、搜索快捷键、图片 Enter、地图 Marker Focus、图节点 Enter |
| Focus visible | PASS | 实际键盘操作后的 :focus-visible 与 outline/box-shadow；5 重点数据页面明暗模式 |
| Modal focus trap | PASS | 原生 dialog；筛选连续 Tab 留在内部；地图/搜索/图片弹窗 |
| Focus return | PASS | 移动菜单、筛选、图片、地图关闭回到触发入口；图重绘保留节点焦点 |
| ESC | PASS | 弹窗与移动菜单实际关闭 |
| aria-label / aria-expanded / aria-controls | PASS | axe、按钮与控制区域语义、打开状态检查；图长标签完整名称保留 |
| role=dialog / aria-modal | PASS | 共享原生 dialog 明确 modal 与标题关联 |
| Image alt | PASS | axe 图像规则与真实入口检查；空数据不制造图片 |
| Heading hierarchy | PASS | 页面 heading-order 与打开状态自动规则检查 |
| Form label | PASS | 实际表单可访问名称、axe label 规则 |
| Contrast | PASS | axe 可确定文本对比度；共享 ink/muted/blue 在明暗 paper 上实算均 ≥4.5:1 |
| Reduced Motion | PASS | prefers-reduced-motion: reduce 下实际主内容动画 none、transition-duration 0 |
| Screen Reader semantics | PASS | Chromium 可访问性树暴露图按钮与完整描述；原生表单/对话框/导航语义 |

重点覆盖 Search、Filters、Timeline、Map、Viewer、Network、Entry、Mobile Menu。证据：[页面与键盘](ux-final-evidence/production-accessibility.json)、[打开状态与图 AX](ux-final-evidence/production-modal-accessibility.json)、[焦点/动画/颜色实测](ux-final-evidence/production-focus-motion.json)。

验收边界：axe 记录中的 `incomplete`（如 SVG/渐变文字对比度及原生控件需复核）原样保留；0 detected violations 不等于全部 WCAG 情景的形式认证。Screen Reader 项为浏览器可访问性树及语义验收，未冒称人工 NVDA/VoiceOver 听读测试。

## 7. Performance

真实生产 Chromium 冷缓存、1440×1000、内容就绪后 2 秒；Entry 等待正文与下一步入口完成 hydration。下列均为实测，不是 Lighthouse 分数。传输大小单位 bytes；最后一列是未使用 JS/CSS **UTF-16 源码范围比例**，不是浪费的网络传输大小。覆盖率场景未点击所有交互，事件处理器未执行会计为未使用。

| 页面 | 请求数 | 总传输 bytes | JS bytes | CSS bytes | Supabase 读取 / CORS preflight | 未使用 JS / CSS 源码 |
|---|---|---|---|---|---|---|
| 首页 | 26 | 160,461 | 46,309 | 56,620 | 0 / 0 | 61.4% / 88.7% |
| Entry 青花 | 41 | 291,627 | 89,029 | 12,978 | 12 / 12 | 79.3% / 76.7% |
| Search 青花 | 50 | 557,054 | 125,412 | 59,017 | 6 / 6 | 74.1% / 87.1% |
| Map | 59 | 577,963 | 168,411 | 62,446 | 2 / 2 | 73.5% / 87.2% |
| Timeline | 45 | 487,422 | 125,810 | 61,583 | 3 / 3 | 75.4% / 88.1% |
| Network 关系 | 41 | 411,958 | 125,341 | 58,595 | 2 / 2 | 76.4% / 87.2% |

六页测量期间网络 loading failures 均为 0。完整逐请求、覆盖率、图像 loading/complete/naturalWidth 与导航 timing 保存在 [生产性能数据](ux-final-evidence/production-performance.json)。

- Leaflet：仅地图功能页面加载（窑址地图及 Global 地图）；首页、Entry、Search、Timeline、关系网络不加载 Leaflet。
- Graph：关系网络页面自己的布局脚本，只有展开高级关系图才计算；其余页面不加载该脚本，无新增第三方 Graph 系统。
- Timeline：仅时间轴页面加载相关时间轴脚本，其他页面不加载。
- Supabase：数据页面使用本地 vendored SDK；首页无 Supabase 请求。表中真实读取与 OPTIONS 分开，不把预检误报为重复数据读取。
- 图片：真实媒体入口使用 lazy loading；首屏外图片的未加载状态可在 DOM 记录核对，来源链接保留。未将所有远程博物馆图片在首页预加载。
- CDN：Material 公共资源仍存在；OpenStreetMap 地图瓦片、对应官方馆藏图片为功能性外部依赖，按页面使用，未新增全站重库 CDN。

本轮完成性能**验收与按页依赖验证**，没有为了压低覆盖率指标推翻正常样式或删除交互。

## 8. 首页长度量化

初轮 UX 前归档：`fa567b2bc813dd764b47516685247aff765cd83d`；本轮开始时已发布 main：`4b7a2bd`。三者在同一浏览器、相同视口测量。

| 视口 | 阶段 | 页面总高 px | main section 数 | 首屏主要元素数 |
|---|---|---|---|---|
| 1440×1000 | 初轮 UX 前 | 7234 | 7 | 11 |
| 1440×1000 | 本轮生产基线 | 4150 | 6 | 13 |
| 1440×1000 | 当前生产 | 4112 | 6 | 13 |
| 390×844 | 初轮 UX 前 | 8724 | 7 | 58 |
| 390×844 | 本轮生产基线 | 5916 | 6 | 14 |
| 390×844 | 当前生产 | 5880 | 6 | 14 |

当前较初轮 UX 前高度：桌面 **-43.2%**、手机 **-32.6%**。本轮基线已有合理收敛，保留 6 个 section，没有为达数字强删内容。首屏指标是 main 内实际视口相交的 h1/h2/p/input/button/a 数量，属于可复现 DOM 指标，不是人工“视觉组块”数量；并非要求桌面所有指标都下降。

证据：[三基线原始数据](ux-final-evidence/homepage-before-current.json)，脚本 `scripts/ux_home_measure.py`。

## 9. Type Check

正式命令：`npm run typecheck`（contracts + active JS）。结果：**0 errors**；本轮基线 JS 为 **782 errors**。

| 分类 | 处理 |
|---|---|
| 真正类型错误 | 显式领域类型、联合类型收窄、调用签名与返回值修正 |
| Legacy typing | JSDoc 参数/容器注释、共享全局接口；未知值收窄，不使用 any |
| DOM typing | Element/HTMLInputElement/HTMLImageElement 等实际守卫、nullable 路径处理 |
| Supabase generated types | 正确 media_public / recommendation / RPC 字段及响应领域定义 |
| Third-party library | Supabase 与 Leaflet 声明匹配、ESNext/Bundler 与 DOM.Iterable 正确 lib |
| Tests | 保留原安全测试，更新到实际仍加载的时间轴脚本；新增有意义的来源/过滤/发布守卫/缩放验收 |
| Dead code | 删除从未加载的旧 timeline-interactive.js；当前两个时间轴脚本仍正式检查 |
| Incorrect tsconfig scope | 覆盖 18 个活动 JS，包括共享 dom-safe；未排除核心源码 |

strict/noImplicitAny/strictNullChecks 保持；没有新增批量 any、@ts-ignore、关闭 strict 或第三方豁免。基线已存在的 skipLibCheck 未更改。证据：[782 原始错误](ux-final-evidence/typecheck-before.log)、[最终正式输出](ux-final-evidence/typecheck-current.log)。

## 10. Production Test

真实生产入口（全为已访问页面，不是只检查本地 build）：

| 用途 | 页面 |
|---|---|
| 首页 | https://justinxyj.github.io/jingdezhen-porcelain-wiki/ |
| 搜索 | https://justinxyj.github.io/jingdezhen-porcelain-wiki/search/?q=青花 |
| 青花 | https://justinxyj.github.io/jingdezhen-porcelain-wiki/entry/blue-and-white/ |
| 唐英 / 人物 | https://justinxyj.github.io/jingdezhen-porcelain-wiki/entry/tang-ying/ |
| 湖田窑 | https://justinxyj.github.io/jingdezhen-porcelain-wiki/entry/hutian-kiln/ |
| 工艺 | https://justinxyj.github.io/jingdezhen-porcelain-wiki/entry/kiln-firing/ |
| 器物 | https://justinxyj.github.io/jingdezhen-porcelain-wiki/entry/tang-ying-jun-vase/ |
| 人物目录 | https://justinxyj.github.io/jingdezhen-porcelain-wiki/museum/people/ |
| 时间轴节点 | https://justinxyj.github.io/jingdezhen-porcelain-wiki/museum/timeline/ （实际点击湖田窑） |
| 地图节点 | https://justinxyj.github.io/jingdezhen-porcelain-wiki/museum/kiln-map/ （实际点击湖田窑、御窑厂、有田） |
| Network | https://justinxyj.github.io/jingdezhen-porcelain-wiki/network/relations/ |
| Global | https://justinxyj.github.io/jingdezhen-porcelain-wiki/network/global/?slug=blue-and-white |
| Evidence | https://justinxyj.github.io/jingdezhen-porcelain-wiki/research/evidence/?slug=chinoiserie |
| Markdown 专题 | https://justinxyj.github.io/jingdezhen-porcelain-wiki/craft/qinghua/ |
| 图片馆 | https://justinxyj.github.io/jingdezhen-porcelain-wiki/museum/gallery/ |

移动端含 390×844，响应式检查含 6 个宽度；Dark Mode 实际切换 default/slate；174 项浏览器检查中包括无 JS 与后端失败时静态阅读。测试数字不推出全部需求完成：它们证明具体被测行为；新版数据库内容仍 FAIL。

### 四条真实点击路径

| 路径 | 结果 | 实际路线 |
|---|---|---|
| A | PASS | 首页提交青花 → 搜索结果 → 青花 → 元青花 → 湖田窑 → 御窑厂 → 唐英 |
| B | PASS | 搜索唐英 → 人物正文 / 为什么重要 → 御窑厂 → 地图详情 → 唐英款钧釉瓶 |
| C | PASS | 地图默认景德镇 → 湖田窑 → 百科 → 青白瓷 |
| D | PASS | Global 景德镇青花 → 欧洲中国风装饰参照关系 → 中国风 Entry → Evidence → 实际 UNESCO 来源 |

这些路线为可阅读关联，不将湖田窑—御窑厂阅读跳转声称为没有依据的直接继承关系。证据：[实际点击 19 项](ux-final-evidence/production-journeys.json)、[174 浏览器检查](ux-final-evidence/production-browser.json)。

[Deploy 37682469004](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37682469004)：**SUCCESS**，包含生产 Pages smoke 和公开 ACL smoke。[Validate 37682468851](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37682468851)：**SUCCESS**，包含正式 types、专项测试、静态生成、strict build 和链接检查。

八个线上 JS/CSS 关键资源的字节哈希与该提交源码匹配：[生产修订证明](ux-final-evidence/production-revision.json)。这证明新前端资源上线，**不证明**新数据库文案上线。

## 11. Commits

全部代码/数据稿提交已推送 main。报告与原始验收记录另作纯文档存档提交；不会把 draft 的 applied 状态改为 true。

| commit hash | commit message | 涉及范围 |
|---|---|---|
| `18812f09bf1c143ad09c9dd5be71b3ec8d9db075` | content: review 79 entries, 65 processes and 16 contexts with guarded release | 79/65/16 审稿、守卫式发布脚本与工作流 |
| `dcbc04ba276d7717e20582f78c1fdcdb967ea0fe` | feat: close search, evidence and visitor UX gaps with strict type checks | 统一搜索/Evidence/地图/关系/公共组件及严格类型修复 |
| `45228725747b2e9b64cd070bd2c15675d48a28ff` | ci: generate canonical pages before strict build and validate links | 生成静态条目后 strict build、真实链接校验 |
| `6a9072d339baa126c4e4898f6719505bdaf84388` | fix: preserve image provenance and finish high-frequency search acceptance | 核心检索词、图像恢复与来源保留 |
| `f047338193e1e49256faeb7dc3f67a2bbe6d851a` | fix: unify remaining visitor loading and recovery states | 剩余 Loading/Error/Empty 收敛 |
| `f856774030aa50c083cd720d9334cf8f0daa5886` | types: include the shared HTML sanitizer in strict visitor checks | 共享 HTML sanitizer 纳入严格检查 |
| `5676e3995d168177c37e868dafe4653364070888` | fix(a11y): validate open menus, dialogs and graph keyboard semantics | 原生移动菜单、打开状态 a11y 与图键盘语义 |
| `5281782b6fdf18c366d5ef509aca0c2f2c9e20ae` | fix(people): explain significance using existing sourced introductions | 人物重要性采用已有正文贡献说明 |
| `f4c341d150a0b3e2de1636f455a080a4ab816905` | fix(images): distinguish source institutions from collection ownership | 图片来源机构与馆藏归属分开 |
| `e4faee7f7d15cd908c8b2aacd31013947b640d6a` | fix(images): scale both dimensions and verify actual viewer geometry | 实际图像双轴缩放及几何验收 |

## 12. Remaining BLOCKED

仅剩一个外部依赖，关联表中 10 个 BLOCKED 项：**有权执行该项目安全发布流程的生产数据库连接未配置**。

- 具体项目：79 条目、65 工序、16 时间轴；3 项器物 metadata 筛选的数据补全；3 项人物 metadata 补全；包含新版数据的最终生产验收。
- 具体原因：当前云环境没有 H3_DB_URL / DATABASE_URL；真实手动发布工作流确认仓库 H3_DB_URL 缺失并在连接前停止。
- 需要数据：无需重新提供文案；审定稿、目标身份、哈希、sources 和 metadata 已在仓库。
- 需要权限：通过安全配置为仓库 H3_DB_URL Secret 或当前云环境注入连接；连接需能在项目既有权限机制下对 entries/craft_processes/timeline_context 执行锁定、备份、事务更新与读回。**不要在聊天里发送密钥。**
- 需要人工判断：无需额外内容批准；配置数据库凭据需要掌握该数据库的授权方。
- Agent 无法继续的原因：已有公开浏览器 key 仅用于允许的读操作，不能作为生产写入身份；GitHub 推送授权不自动提供数据库账户，不能绕过 RLS 或凭空创建有效 Secret。
- 是否技术限制：不是代码无法实现；是缺少外部数据库身份。安全流程与离线守卫验证已准备完成，live Preview / Apply 必须持有真实连接。

其余项目没有以工作量、以后优化或未处理作为 BLOCKED。因为这一依赖，整体不能标记 DONE。
