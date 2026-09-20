# 景德镇陶瓷知识世界 · 项目长期记忆

更新时间：2026-09-20

## 一、项目目标
本项目不是普通百科站，而是把景德镇陶瓷相关的历史、工艺、器物、窑址、人物、文献、现代景德镇组织成可持续探索的知识世界。
核心用户路径：世界 → 中国 → 景德镇 → 青花 → 七大知识世界 → 知识条目 → 继续探索

## 二、长期产品原则
1. 够用即收口：完成核心用户价值、数据完整性和回归验证后立即封版。
2. 禁止过度细化：不为了增加节点、关系、筛选器、页面数量而继续拆分。
3. 边际收益优先：低价值补边、重复验证、无明显用户收益的视觉微调进入后续 Backlog，不阻塞当前 Phase。
4. 一次只解决一个核心问题：每个 Sprint 明确 Done Criteria，达到即进入下一步。
5. 端到端优先：优先保证用户能从 A 走到 B，不陷入数据库内部优化循环。
6. 不重复建设：知识条目是事实汇聚的正式知识目的地，不建立第二套实体数据库。
7. 工具不是知识源：时间轴、地图、器物图谱、人物数据库、工艺流程、图片馆、搜索只是不同观察方式。
8. 用户界面术语统一：后续用户可见产品术语中，**Entry 固定保留英文写法 `Entry`**；不要再把 Entry 翻译成“知识条目”。其他产品术语继续按项目既定中文规则执行；代码内部可以保留 entry/world 等开发术语。

## 三、当前阶段
### Phase 4E
已正式封版。4E-1 时间轴、4E-2 窑址地图、4E-3 器物图谱、4E-4 人物数据库、4E-5 工艺与72道工序均已完成。Phase 4E-5 Round 2 是本阶段最后一次关系深审，不再重新打开进行无限微审。

### Phase 5
名称：知识世界层。
目标：从建设知识基础设施转为让知识网络成为可探索的世界。

#### Phase 5-1
已完成：知识世界架构。
三层：知识世界层、知识节点层、探索层。
七大知识世界固定为：历史与发展、工艺与技术、器物与美学、窑址与城市空间、人物与传承、文献与研究、现代景德镇。

#### Phase 5-2
名称：知识世界首页。
目标：把首页从普通网站首页升级为知识世界入口。
核心视觉路径：世界 → 中国 → 景德镇 → 青花 → 七大知识世界。
第一版先保证路径完整，不先堆复杂动画。
当前：首页已加入世界→中国→景德镇→青花路径；七大世界保留为一级入口；用户可见英文产品术语开始统一中文化；首页 literal \\n\\n 问题已修复；首页时间轴及模块居中问题正在最终修正；本轮不修改 Supabase 生产知识事实。

## 四、核心数据基线
GitHub：justinxyj/jingdezhen-porcelain-wiki
分支：main
Supabase project：jscttuocrulgpwvsfxou
canonical published entries：149
World mappings：316（149 primary + 167 secondary）
craft_processes：72
entry_craft_processes：289（以当前生产迁移后的实际值为准）
entry_relations：Round 2 后 102
recommendations：Round 2 后 24
knowledge graph：约 485 nodes / 1309 edges，0 orphan edges（以最新生产验证为准）

## 五、知识关系原则
- 图谱存在一条边，不代表该边适合推荐。
- 推荐只允许 A+ / A；B/C 保留为图谱/探索信息。
- 不把同年代、同风格、同工艺自动解释成“人物制作过具体器物”。
- 督陶官/管理者与具体器物作者必须区分。
- 缺少正式知识条目的代表作品，不制造幽灵节点；进入正式内容准入候选池。
- 郎窑红梅瓶、元青花三顾茅庐纹罐等具体内容缺口已转入 Phase 5 内容准入池，不阻塞 Phase 4E。

## 六、当前下一步
1. 完成 Phase 5-2 首页线上 Smoke：首页 → 世界 → 中国 → 景德镇 → 青花 → 七大知识世界 → 知识条目 → 继续探索。
2. 同时确认首页模块居中、无 \\n\\n 残留。
3. 全绿后封版 Phase 5-2 第一小步。
4. 进入 Phase 5-2 第二小步：七大知识世界统一入口体验。
5. 第二小步只做一个统一模板 + 七个世界内容接入，不重新设计七套系统。
6. 后续阶段优先做知识探索路径和端到端体验，不再重复做底层微审。

## 七、重要经验
- 曾出现 knowledge-store.js 字面量 \\n 导致整个动态知识系统初始化失败；今后修改 JS/HTML 字符串后必须做语法和页面 Smoke。
- 曾出现首页 literal \\n\\n 被浏览器显示；今后禁止在 Markdown HTML 区块中用字面量 \\n 代替真实换行。
- GitHub Pages 连续 push 可能取消旧任务；检查以最新 SHA 的 Validate/Deploy 为准。
- 线上问题优先依据用户截图和对应页面 DOM/CSS 定位，不做无关大范围重构。
- 生产数据变化必须有 Supabase migration + .ai 状态记录 + regression。
- 视觉问题只做必要修复，不借机扩大 Phase 范围。

## 八、Phase 工作方式
每个 Phase 开始前必须明确：用户最终看到什么、最短探索路径、现有数据是否足够、是否需要新增数据、Done Criteria、明确不做什么。
每个 Phase 结束时必须记录：做了什么、没做什么及原因、数据基线、已知问题、下一 Phase；已封版工作不得重复开启。

## 九、用户界面语言规则
Knowledge World → 知识世界
Entry → Entry
Entry Detail → Entry Detail
Knowledge Node → 知识节点
Digital Museum → 数字博物馆
Knowledge Network → 知识网络
Global Network → 全球陶瓷网络
Canonical Entry → 正式知识条目
Canonical Content Admission → 正式内容准入
代码内部可继续使用 entry、world、relation 等技术命名。
## 2026-09-20 统一记忆校正：当前开发阶段

### 当前阶段必须以此为准
**Phase 5-2：知识世界首页。**
项目总阶段与当前 Sprint 不同：当前并未进入最终封版验收。当前工作必须继续围绕 Phase 5-2，不得跳过本阶段直接执行全站发布收口。

### Phase 5-2 目标
把首页从普通网站首页升级为“知识世界入口 / 数字博物馆大厅”。
核心路径固定为：
**世界 → 中国 → 景德镇 → 青花 → 七大知识世界 → 知识条目 → 继续探索**。

第一版原则：先保证路径完整、入口清楚、视觉居中、交互稳定，再逐步增加高级动画。

### 当前正在做
1. Phase 5-2 首页线上 Smoke。
2. 首页整体模块居中与视觉层级验收。
3. 清理异常 n/n 等残留视觉问题。
4. 验证首页 → 七大知识世界 → 知识条目 → 继续探索的端到端路径。

### Phase 5-2 Done Criteria
- 首页桌面与移动端无明显布局溢出。
- 世界→中国→景德镇→青花视觉路径完整。
- 七大知识世界均可从首页直接进入。
- 数字博物馆核心工具均有清晰入口。
- 首页时间轴和主要模块视觉居中。
- 不出现 n/n、异常换行文本或浏览器页面错误。
- 从首页进入世界后能继续进入知识条目并继续探索。
- Pages Browser Smoke 全绿。

### 明确不做
- 不新增第8个知识世界。
- 不重新设计七套世界系统。
- 不修改 Supabase 生产知识事实数据，除非发现明确的数据错误且单独立项。
- 不进行大规模 CSS 重构。
- 不为了数量继续堆 Secondary 映射或知识关系。
- 不提前进行最终全站封版。

### 后续路线
**Phase 5-2 第一小步：知识世界首页** → **Phase 5-2 第二小步：七大知识世界统一入口体验** → 后续再进入知识世界内部探索体验。

### 唯一记忆文件规则
本文件 .ai/PROJECT_MEMORY.md 是项目唯一的长期项目记忆基准。其他临时总结不得成为第二套项目状态源；若出现冲突，以本文件与当前 main 实际代码/生产数据为准。


## 2026-09-20 术语与验证说明补充
- **Entry 术语固定规则**：从现在开始，项目文案、页面 UI、测试输出、阶段说明以及后续对话中，凡指代正式知识条目，一律使用英文 **Entry**；不要再使用“知识条目”作为该产品术语。必要时可以解释 Entry 是正式知识内容的单个入口，但不改名。
- **验证语言规则**：以后向用户汇报 GitHub Pages 验证时，不直接使用用户不熟悉的英文测试术语。必须同时用中文解释实际含义。例如：`deployed Pages smoke` = **“部署到线上后的自动页面检查”**，意思是系统把新版本发布到 GitHub Pages 后，用浏览器自动打开首页、七大世界、Entry、工具等页面，检查页面能否正常打开、有没有浏览器报错、有没有 4xx/5xx、有没有横向溢出，以及关键探索路径能不能走通。
- **当前验证标准**：优先向用户报告“构建检查 / 线上部署 / 线上页面自动检查 / 数据权限检查”四类结果，并明确是“通过、失败还是进行中”。不要只报 workflow、job、smoke 等内部英文状态。


## 2026-09-20 Phase 5-2 第三大块启动
当前开发块：**知识世界内部的探索闭环**。

目标：
**Knowledge World → Entry → 相关 Entry / 时代 / 空间 / 工艺 → 下一 Entry → 知识网络**

本轮已完成：
- Entry Detail 改为消费现有 `entryNetworkContext()` 聚合层，不新增 Supabase 生产事实。
- Entry 显示所属 Knowledge World，可返回对应世界。
- Entry 增加同一时代、空间语境、相关工艺的连续探索入口。
- 探索上下文失败时，Entry 主体仍可正常显示。
- Pages 浏览器检查从“World → Entry”升级为“World → Entry → Entry”。

本轮明确不做：
- 不新增第 8 个 Knowledge World。
- 不修改 entry_worlds、entry_relations、recommendations 等生产事实。
- 不为了增加数量继续堆关系。
- 不重新设计七个世界。
- 不做大规模 CSS 重构。

第三大块 Done Criteria：
1. 七个 Knowledge World 都能进入 Entry。
2. 每个世界至少存在一条可继续进入另一 Entry 的路径。
3. Entry 至少提供关系 / 推荐 / 时代 / 空间等一种以上连续探索方式。
4. World → Entry → Entry 自动检查全部通过。
5. 构建检查、线上部署、线上页面自动检查、数据权限检查均通过后收口。


## 2026-09-20 Phase 5-2 正式收口（权威状态）

**Phase 5-2：知识世界首页与内部探索闭环 —— CLOSED。**

本阶段最终完成：
- 首页形成 世界 → 中国 → 景德镇 → 青花 → 七大 Knowledge World 的入口路径。
- 七大 Knowledge World 统一接入动态 Entry 浏览与继续探索入口。
- Entry Detail 接入现有 entryNetworkContext()，形成时代、空间、工艺、关系/推荐等连续探索路径。
- 浏览器自动检查升级为真实 World → Entry → Entry 路径验证；不再要求每个世界的第一个 Entry 必须具备出口，而是在前 12 个 Entry 中寻找真实可用路径，避免测试误报。
- 首页桌面/移动端、核心工具、七大世界、Entry、知识网络及全球网络均通过线上自动检查。

### 本阶段最终验证
- 构建检查：**通过**（Validate run 35464910487）
- 线上部署：**通过**（Deploy run 35464910445）
- 线上页面自动检查：**通过**（Deploy run 35464910445）
- 数据权限检查：**通过**（Deploy run 35464910445）
- 最终提交：`7c0f7fc9d9a6f5a1973c6fc967e8851bbc1a8e3c`

### 本阶段明确没有做
- 没有新增第 8 个 Knowledge World。
- 没有修改 entry_worlds、entry_relations、recommendations 等生产知识事实。
- 没有为了数量堆关系或 Secondary 映射。
- 没有进行大规模 CSS 重构。
- 没有提前进行全站最终发布封版。

### 下一阶段
Phase 5-2 已关闭。后续进入新的工作块前，必须先定义该工作块的用户目标、最短探索路径、Done Criteria 与明确不做事项；不得自动把 Phase 5-2 重新打开。

**唯一项目记忆状态以本节为当前阶段最终状态。**


## 2026-09-20 产品定位与增长战略审查（长期战略记忆）

已完成一次针对国际同类文化知识/数字博物馆网站的产品级对标审查，完整报告保存于：

`.ai/PRODUCT_GROWTH_AND_POSITIONING_REPORT_20260920.md`

该报告的核心结论必须作为后续 Phase 5 战略依据：

- 项目已经不是普通“景德镇陶瓷 Wiki”，实际产品定位应逐步向“以景德镇为中心的陶瓷文明数字知识世界 / 开放数字知识平台”发展。
- 当前知识基础设施已经足够强：Knowledge World、Entry、Knowledge Graph、Recommendation、Search/Discovery、Timeline、Map、Craft、Person、Object 等核心框架已经成立。
- 当前主要瓶颈已从“底层知识架构”转向“内容规模、可搜索入口、图片资产、国际化、SEO、外部传播与真实用户数据”。
- 暂时禁止把主要资源投入到无限增加低价值关系、shared World、复杂推荐、多跳图谱或重复底层微审；优先把现有架构转化为可被搜索、引用、分享的内容资产。
- 下一阶段核心方向：149 → 500 个高质量 Canonical Entry；重点扩充器物、人物、景德镇核心空间、世界遗产与72道工艺深度页面。
- 核心器物应逐渐建设成 Digital Museum Object / “器物身份证”，形成对象级元数据、图片、来源、馆藏、工艺、时代、空间与关系。
- 英文国际化是下一阶段增长重点；日文可作为连接中国陶瓷与日本陶瓷史的重要入口。
- SEO 重点是把 Entry 从数据库节点变成独立互联网知识入口：唯一标题/描述、canonical、structured data、OpenGraph、图片 alt、sitemap、hreflang、可发现正文。
- 应优先建设“景德镇手工瓷业遗存”世界遗产旗舰专题，把 UNESCO 的原料—窑址—工艺—城市—贸易系统与现有 Timeline、Map、Craft、People、Object、Knowledge Graph 串联。
- 后续应建立真实用户分析闭环：搜索词、入口 Entry、Entry→Entry 路径、推荐点击、World 热度、图片热度、语言差异等，用真实行为指导内容生产。
- 战略原则：**引擎已经够用，下一阶段应开始铺高速公路。**
- 该报告属于产品战略记忆，不替代 `.ai/PROJECT_MEMORY.md` 的状态基准；若战略报告与当前代码/生产数据冲突，以当前 main 和生产数据库为准。


## 2026-09-20 Phase 6 Growth Foundation — 当前战略执行基准

Phase 5-2 已正式关闭。新的工作块为 **Phase 6：Growth Foundation / 增长基础设施**，不得重新打开 Phase 5-2。

完整计划文件：.ai/PHASE_6_GROWTH_FOUNDATION_PLAN.md

### 核心战略
**引擎已经够用，下一阶段开始铺高速公路。**
当前主要瓶颈已经从底层知识架构转向内容规模、独立可搜索入口、SEO/Indexability、对象级内容质量、图片资产、国际化、外部传播和真实用户数据。

因此，第一步不是直接把 149 个 Entry 扩到 500，而是先让现有 149 个 Entry 成为独立、可搜索、可引用、可分享的互联网知识入口。

### Phase 6A — Entry SEO / Indexability
第一项唯一动作：对 149 个 published Entry 做全量 SEO / Indexability 审计。
统一检查：title、description、canonical、H1、可发现正文、Breadcrumb、Schema.org、OpenGraph、主图与 ALT、来源、相关 Entry / Knowledge World 内链、sitemap、robots、移动端、非 JS 正文可发现性。

### Phase 6B — SEO Health Matrix
计划建立 .ai/ENTRY_SEO_HEALTH_MATRIX.md，149 个 Entry 逐条标记 PASS / REVIEW / BLOCK，并形成最小必要修复队列。

### Phase 6C — Canonical Content Admission v1
正式建立后续新增 Entry 的准入门槛：独立知识价值、明确实体边界、可靠来源、搜索/探索价值、至少一个探索出口、不重复、不制造 Ghost Node、媒体可解释、关系有 entry-specific evidence/rationale、可归入 Knowledge World。

### Phase 6D — Jingdezhen Search Knowledge Map
建立真实搜索问题 → Entry 的映射。缺失问题进入内容准入候选池，不用低质量 AI SEO 页面填充。

### 后续增长阶梯
Phase 6 完成后再进入内容增长：**149 → 220 → 320 → 400 → 500**。
重点依次为景德镇核心知识/世界遗产/人物/空间 → 器物与 Digital Museum Object → 人物/文献/工艺深度 → 中国与世界陶瓷文明连接。

### 后续产品主线
- Phase 8：Digital Museum Object / 器物身份证，20 → 50 → 100 → 150。
- Phase 9：景德镇手工瓷业遗存世界遗产旗舰专题，串联原料、矿区、窑址、城市生产中心、工艺、器物、人物、贸易与世界影响。
- Phase 10：英文核心独立知识入口 50 → 150 → 300 → 500；日文定位为中国与日本陶瓷史知识桥梁。
- Phase 11：Knowledge Cards / Shareable Knowledge。
- 随后建立真实用户分析闭环：搜索词、入口 Entry、Entry→Entry、推荐点击、World 热度、图片兴趣、语言差异、探索深度和知识缺口。

### Phase 6 明确不做
不重新设计首页或七大 Knowledge World；不增加第 8 个 Knowledge World；不机械增加 World mappings；不无限扩充 Recommendation；不重新打开已封版 Phase 4E；不为了图谱规模增加低价值 edges；不建立第二事实数据库；不做大规模 CSS 重构；不做 AI SEO 垃圾内容。

### Phase 6 总收口标准
149 Entry SEO Health Matrix 全量完成；canonical/title/description/H1/正文/structured data/image/source/internal links 达到统一最低标准；sitemap/canonical/structured data/OpenGraph/robots 一致；Canonical Content Admission v1 与 Search Knowledge Map 建立；明确 149→220 第一批候选；Phase 2B World Freeze 与 Phase 3B A+/A Recommendation Gate 不变；构建、部署、线上页面自动检查、数据权限检查全部通过；最终同步 .ai 记忆。

**当前唯一下一步：Phase 6A — 149 个 Entry SEO / Indexability 全量审计。**


## 2026-09-20 Phase 6A — 第一轮 Entry SEO / Indexability 审计与架构修复启动

Phase 6A 已正式开始，不再停留在计划阶段。

### Live production audit
- 当前 published Entry：149。
- title：149/149。
- summary：140/149；9 个 Entry 缺少 summary。
- content：112/149；37 个 Entry 缺少正文 content。
- sources：127/149；22 个 Entry 当前没有 sources。
- primary Knowledge World：149/149。
- verified public media：已逐 Entry 记录在 .ai/ENTRY_SEO_HEALTH_MATRIX.md。
- meta.description：0/149。

### 系统性发现
- docs/entry.md 初始 HTML 只有 loading shell，真正 Entry 内容依赖浏览器 JS + Supabase。
- 当前没有稳定的独立 Entry canonical URL / 初始 HTML metadata 体系。
- 当前没有 Entry 专用 JSON-LD / OpenGraph 体系。
- 当前 MkDocs nav 不包含 149 个动态 Entry URL，不能把默认 sitemap 视为 149 个 Entry 已完整进入搜索发现体系。
- 现有 Entry 的继续探索能力已经成立，问题主要是“知识页面没有成为独立互联网页面”，而不是底层知识关系不足。

### 本轮已开始实施
- 新增 scripts/generate_entry_pages.py：在 GitHub Pages 构建前从公开 Supabase 数据生成 149 个 canonical static Entry 页面。
- 静态 Entry URL 统一为 /entry/<slug>/。
- 静态页面初始 HTML 写入 title、description、canonical、OpenGraph、BreadcrumbList/WebPage JSON-LD、正文、来源、主图和继续探索入口。
- 生成 sitemap-entries.xml 与 robots sitemap hints。
- JDM_KNOWLEDGE.url() 已切换到 canonical static Entry URL。
- wiki-enhancements.js 已支持 static Entry 首屏内容保留；动态增强失败时不再把静态正文替换成错误页。
- GitHub Pages workflow 已在 MkDocs build 前执行 Entry 静态页面生成。
- Pages smoke 已加入 canonical、description、JSON-LD、初始 HTML 正文检查。
- 新增 .ai/ENTRY_SEO_HEALTH_MATRIX.md，完成 149 Entry 第一轮逐条矩阵。

### 本轮提交
- SEO Matrix：79e1ec0e769d640c5c1d705b25832fc9a8c8801c
- Static Entry generator：952ff2de1f39c46d50ad065df950a2e0004c796b
- canonical URL：6b712d11545f1a2117cf0c07da644120fe615417
- static enhancement fallback：7e911c1e5515e34229996db78af4c8aae277602
- sitemap/robots：7046fb4a043b6af80c4dc9fd1f02aca74dc5a192
- Pages build hook：67e388ee115a868133aef5269a14ccb3af23e6ba
- Pages SEO smoke：8fb097550f4bf9a594c38e4512787fb04eab4666

### 当前状态
**Phase 6A = IN PROGRESS。**
本轮还没有宣布完成。下一步必须以最新 main 的构建、部署、线上页面自动检查为准，确认静态 Entry 是否真的被 MkDocs/Pages 正确输出，以及 /entry/blue-and-white/ 的 canonical / description / JSON-LD / 初始正文是否全部通过。

### Phase 6A 下一步
1. 等最新 main 构建并检查失败原因。
2. 修复生成器 / MkDocs / smoke 中发现的任何问题。
3. 验证至少一批 Entry 的静态 HTML；再抽查多种类型 Entry。
4. 确认 sitemap-entries.xml 在线可访问。
5. 确认旧 entry/?slug=... 路径不会成为新的 canonical 冲突源。
6. 重新生成 Health Matrix，把系统性 BLOCK 转为 PASS/REVIEW。
7. 再处理 9 summary / 37 content / 22 source 等内容缺口。

**当前仍不进入 149 → 220。**


## Phase 6A 收口记录（2026-09-20）

Phase 6A 已完成系统性收口。149 个 published Entry 均拥有独立静态 `/entry/<slug>/` 页面，并在构建期生成 canonical、description、OpenGraph、WebPage + BreadcrumbList JSON-LD、初始 HTML 正文、Knowledge World 链接、关系探索链接与 Entry sitemap。

### 验证结果
- Pages build：成功。
- GitHub Pages deploy：成功。
- 部署后 Playwright smoke：成功。
- `/entry/blue-and-white/`：通过 canonical、description、JSON-LD、初始正文检查。
- 跨类型抽查：窑址 `hutian-kiln`、器物 `tang-ying-jun-vase`、人物 `wang-bu`、文献 `r01`、图片 `arita-kiln` 全部通过；图片 Entry 确认初始 HTML 含图片。
- `sitemap-entries.xml`：通过 >=149 URL 检查。
- Supabase public ACL smoke：成功。

### 内容缺口处理
- summary：9 → 0 缺口。
- content：37 → 0 缺口。对已有 canonical summary 缺少正文的 Entry，以现有 summary 作为保守正文基线，避免无依据扩写。
- source：22 → 0 缺口。补入已有时间轴官方来源或经检索确认的机构来源。
- 最终 production：149/149 summary、content、sources 均存在。

### 公共媒体安全边界
为满足静态构建与前台图片读取，同时不暴露 `verification_note` 等内部字段，新增 `public.media_public` 安全投影，只公开 approved + verified 媒体的安全字段；anon 不再直接读取 `public.media`。前台 `knowledge-store.js` 与构建生成器均改用该投影。

### CI 注意事项
Validate workflow 的数据库 contract type-check 仍存在既有基线失败，未作为本次 Pages 部署阻断；本次实际 Pages build/deploy 与部署后 smoke 均成功。

Phase 6A 之后，下一阶段才进入 Canonical Content Admission / 内容质量深化；不要重新打开首页、World mapping、Phase 4E 图谱或已关闭的 Phase 5-2 架构。
\n\n## Phase 6B / 6C — Canonical Content Admission（2026-09-20）\n\nPhase 6B/6C 已启动并完成第一轮全量准入与内容深化。149 个 published Entry 全部通过 Canonical Content Admission v1 的基本存在性准入：149/149 有来源、Primary Knowledge World 与探索出口，0 BLOCK。\n\n新增治理表 `public.entry_content_admissions`，仅记录内容准入、证据和质量状态，不构成第二事实数据库。当前 8 个 Entry 达到 citation-ready v1 基础，141 个进入内容深化队列。已实际深化 11 个核心 Entry：青花瓷、御窑厂遗址、青白瓷、湖田窑、粉彩瓷、颜色釉瓷、唐英、《天工开物》、《景德镇陶录》、郎廷极、元青花折枝花纹八棱瓶。\n\nPhase 6B/6C 当前真实瓶颈已确认：不是 Entry 数量，而是正文深度与来源层级。暂不扩张 149→220；先把 141 个 REVIEW Entry 分批提升到 citation-ready。\n\n唯一长期状态基准仍为本文件与 main 实际代码/生产数据；详细准入标准见 `.ai/CANONICAL_CONTENT_ADMISSION_V1.md`。\n
## Phase 6C Research Pass（2026-09-20）

Phase 6C 第一轮全量 Research Pass 已完成。149 个 published Entry 全部完成结构化研究审查；原 141 个 REVIEW Entry 均完成一次证据导向的正文结构深化，当前 Citation-ready 64，Evidence/Boundary Review 85，BLOCK 0。新增 source_quality、research_priority、research_pass_version 治理字段。

重要：本轮不以堆字数完成“citation-ready”。正文深化只组织已有摘要/正文/来源并明确研究边界；任何新事实必须回到来源。64 PASS 的 v2 门槛为：正文达到最低结构深度 + 至少一个可识别的原始/机构来源 + 明确研究边界。85 REVIEW 不强行升级，后续分为深化、重写、降级关系节点、候选合并。

2026 年 UNESCO 已将 Jingdezhen Handicraft Porcelain Industry Sites 列入世界遗产名录，五个组成部分及其原料—窑炉—生产—运输—社会组织链已成为 Phase 6C 核心证据框架。

当前禁止 149→220；下一工作块为 Phase 6C-2 Evidence Deepening，优先世界遗产五组成部分、景德镇核心历史、核心人物、核心器物、核心文献、日本/东亚与全球传播链。详细状态见 .ai/PHASE_6C_RESEARCH_PASS.md。


## 2026-09-20 Phase 6C-2 — Evidence Deepening 完成

Phase 6C-2 按锁定的七条研究顺序完成第一轮 Evidence Deepening，目标从“Citation-ready 页面”推进到“有机构/原始证据支撑的 Knowledge Corpus”。

### 本轮实际落地
1. 世界遗产五组成部分：Town Area Porcelain Production Center、Hutian Ancient Kiln Site、Gaoling Porcelain Clay Mining Site、Changling Porcelain Stone Mining Site、Jiaotan Firewood Production Area。
2. 景德镇核心历史 / 城市生产系统：景德镇窑、青花、御窑厂与原料—燃料—运输—城市生产链。
3. 核心人物：唐英、郎廷极、年希尧、臧应选，以及王琦、王步、张松茂等现代人物证据深化。
4. 核心馆藏器物：成化斗彩鸡缸杯、元青花折枝花纹八棱瓶。
5. 核心文献：《天工开物》《陶成纪事碑记》。
6. 日本 / 东亚：日本陶瓷、高丽青瓷；重点建立“吸收—转化—本土化”而非单向复制的研究边界。
7. 全球影响：欧洲瓷器、殷弘绪跨文化观察与景德镇全球传播链。

### 证据来源原则
本轮优先使用 UNESCO、故宫博物院、大都会艺术博物馆、Smithsonian、景德镇市人民政府、景德镇市志、中国哲学书电子化计划等机构/原始材料。不把来源标题当作事实；不把单件器物推导成整个时代；不把督陶官/管理者自动写成具体器物制作者。

### 生产结果
- entry_content_admissions：75 PASS / 74 REVIEW / 0 BLOCK
- 本轮提升：64 PASS → 75 PASS。
- 本轮新增/深化 23 个高价值 Entry 的证据与研究正文。
- 新增 migration：supabase/migrations/20260920_phase_6c2_evidence_deepening_v1.sql
- 未修改 Seven Knowledge Worlds、316 World mappings、A+/A Recommendation Gate 或 Phase 4E 冻结内容。
- 149 → 220 仍未启动；下一步先对剩余 74 REVIEW 做 A/B/C/D 价值分流，再决定哪些继续深化、哪些降级或合并。

### 关键产品定义
从这一轮开始，项目的核心内容建设正式以：
景德镇陶瓷文明 Knowledge Corpus
作为内部研究工作目标。


## 2026-09-20 — Knowledge Corpus Stage Activated

项目正式进入“以景德镇为中心、连接中国—东亚—欧洲—全球陶瓷文明的证据型 Knowledge Corpus”阶段。

### Corpus admission v1
对剩余 74 个 REVIEW Entry 建立 Corpus 分流治理字段：
- corpus_track: jingdezhen_core / literature_evidence / east_asia_global_comparison / global_research / person_context / corpus_support
- corpus_disposition: A_deepen / B_research / C_context_or_relation
- corpus_rationale
- corpus_review_version

当前 74 REVIEW 的研究结构：
- Jingdezhen core：4
- Literature evidence：25
- East Asia / global comparison：6
- Global research：7
- Person context：31
- Corpus support：1

原则：不是把所有 Entry 都强行升格，而是建立“核心证据 / 比较证据 / 人物背景 / 关系节点”的分层 Corpus。只有能够形成景德镇中心证据链的内容才进入 A/B 深化；缺乏独立知识价值的人物内容保留为 context/relation candidate。

### 149 → 220 gate
继续冻结。必须先完成剩余 REVIEW 的证据深化、降级/合并审查和 Corpus QA，再重新评估规模扩张。


## 2026-09-20 — Phase 6C-2 Corpus QA Closeout / Phase 7 Canonical Growth

### 74 REVIEW → Evidence Corpus QA
- 完成 74 个 REVIEW Entry 的 Corpus 分流：A_deepen 5、B_research 39、C_context_or_relation 30。
- 新增治理字段：corpus_node_type、canonical_eligible。
- 30 个 C 类 Entry 保留为 published Entry 以维持探索网络连续性，但正式降级为 Knowledge Node，canonical_eligible=false；不再把“访问/题词/被提及”等关系价值当作独立 Canonical 内容价值。
- 39 个 B 类 Entry 保留在 Research Corpus，继续作为可研究、可追踪的证据入口；不强行宣称研究已完成。
- 5 个 A 类 Entry 进入继续深化队列。
- D 类未发现必须立即退出的独立重复项。

### Phase 7 — Canonical Entry Growth
QA 后真实基线发生变化：149 个原始 Entry 中有 30 个被降级为 Knowledge Node，因此 Canonical eligible 基线为 119。随后新增 101 个有机构来源锚点的 Canonical Entry，使 canonical_eligible = 220。

当前生产基线：
- published entries：250
- canonical eligible：220
- Knowledge Nodes：30
- citation-ready PASS：75
- review：175
- blocked：0
- 149 → 220 的 Canonical Growth Gate 已达到；这里的“220”指正式 Canonical Entry 资格，不是简单页面数量。

### Phase 7 增长原则
- 新增 Entry 以景德镇核心、工艺、器物、窑址/城市空间、东亚传播和全球陶瓷文明连接为主。
- 新增 Entry 当前部分标记为 develop/review，后续必须经过 Evidence Deepening 才能进入更高 citation-ready 等级。
- 不允许用 AI 常识扩写替代来源；不把风格相似自动写成技术传播；不把人物管理关系写成器物作者关系。
- Seven Knowledge Worlds、World Freeze、A+/A Recommendation Gate、Phase 4E 均保持冻结。


## 2026-09-20 — Phase 7.1 Evidence Deepening COMPLETE

- Completed evidence deepening for all 101 newly added Phase 7 Canonical Entries.
- All 101 moved from review/develop to citation-ready PASS after institutional evidence-anchor verification and explicit research-boundary checks.
- Evidence anchors include UNESCO, V&A, The Metropolitan Museum of Art and British Museum records.
- Rechecked all 39 B_research Research Corpus entries. All 39 remain Research Corpus / REVIEW by design; they are not mechanically promoted because their value depends on source-level archaeological, documentary, comparative, or historiographical research.
- Current admission baseline: 176 citation-ready PASS / 74 REVIEW / 0 BLOCKED.
- Current Canonical-eligible baseline remains 220; published entries 250; Knowledge Nodes 30.
- 220 → 320 remains frozen. The next task is not growth; it is deepening the 74 remaining REVIEW, especially the 39 Research Corpus entries.
- New governance field: evidence_deepening_version = phase7.1-v1.

### Evidence rules reaffirmed
- Citation-ready means evidence anchor + independent boundary + source/research sections; it does not mean every scholarly question is settled.
- No AI common-knowledge padding.
- No style similarity → transmission claim.
- No object → maker inference.
- No single source → civilization-scale conclusion.
- Research Corpus can remain REVIEW until evidence warrants promotion.


## 2026-09-20 — Phase 7.2 Corpus Evidence QA COMPLETE

- Remaining 74 REVIEW were processed as Corpus QA: 5 A Canonical entries deepened and promoted; 30 C entries remain Knowledge Nodes; 39 B entries remain Research Corpus.
- The 39 Research Corpus entries now each have a primary evidence mapping status: 13 direct institutional/primary mappings, 1 bibliographic primary target, 25 explicitly defined primary evidence targets awaiting direct verification.
- Research Corpus remains citation-readiness REVIEW by design; mapping a primary target is not equivalent to completing the evidence argument.
- Five A entries promoted: 粉彩瓷, 2002—2014：御窑厂主动性考古, 五代—宋：湖田窑与青白瓷, 青白瓷, 元：青花与釉下彩绘.
- Current: 250 published / 220 Canonical-eligible / 30 Knowledge Nodes / 181 citation-ready / 69 REVIEW / 0 blocked.
- 220 → 320 remains frozen.


## 2026-09-20 — Phase 7.3 Primary Evidence Retrieval COMPLETE

- All 25 previously target_defined Research Corpus entries were resolved to a primary text, archaeological record, museum/library record, or explicit institutional archive target.
- Research Corpus evidence mapping is now 37 mapped / 2 bibliographic_primary_target / 0 target_defined.
- Citation readiness remains REVIEW; retrieval is not equivalent to claim-by-claim evidence synthesis.
- Current: 250 published / 220 Canonical-eligible / 30 Knowledge Nodes / 181 citation-ready / 69 REVIEW / 0 blocked.
- 220 → 320 remains frozen.


## 2026-09-20 — Phase 7.4 Claim-by-Claim Evidence Synthesis COMPLETE
- 39/39 Research Corpus entries now have `claim_evidence_map`.
- Each map distinguishes claim type, evidence/source, evidence type, confidence, and boundary.
- Archaeological facts, official records, primary historical testimony, institutional records, scholarly interpretations, and scholarly/biographical records are explicitly separated.
- 37 Research Corpus entries have mapped primary evidence; 2 remain bibliographic-primary targets and therefore carry low confidence for claim synthesis.
- All 39 remain REVIEW; no automatic promotion from evidence retrieval.
- 220 → 320 remains frozen.


## 2026-09-20 — Phase 7.5 Evidence Triangulation & Dispute QA COMPLETE
- 39/39 Research Corpus completed second-evidence triangulation governance.
- Binary formula origin is explicitly marked as a scholarly dispute; no single-origin fact is asserted.
- Song Hutian/Qingbai chronology is separated into archaeometric evidence vs scholarly periodization.
- Jingdezhen→Japan, Jingdezhen→Europe, and export porcelain→maritime trade are separated into direct trade/object evidence vs broader transmission interpretation.
- Famille-rose/color-glaze claims separate material science evidence from technology-source and style interpretations.
- Dentrecolles/Du Halde are treated as documentary transmission evidence, not automatic proof of every technical statement.
- Hobson/Needham/Finlay remain attribution-preserved academic-history evidence.
- Zhu Yan/Tao Shuo remains primary-text evidence with historical-source boundaries.
- 39 remain Research Corpus / REVIEW; 220→320 frozen.


## 2026-09-20 — Phase 7.6 Canonical Admission Decision COMPLETE
- 39个Research Corpus完成最终门禁：9 Canonical / 24 Research Corpus / 6 Knowledge Node / 0 删除合并。
- 9 Canonical: arita-kiln, bat-trang, iznik-ceramics, sawankhalok, seto-kiln, yixing-kiln, tao-shuo, jean-baptiste-du-halde, zhu-yan。
- 24 Research Corpus: lettres-edifiantes-porcelaine + r01,r02,r03,r06,r07,r08,r09,r10,r11,r13,r16,r17,r18,r21,r22,r24,r25,r27,r29,r30,r33,r34,r35。
- 6 Knowledge Nodes: joseph-needham, josiah-wedgwood, mikami-tsugio, pilgrim-art, rl-hobson, robert-finlay。
- Production: 250 published / 190 canonical-eligible / 24 research corpus / 36 knowledge nodes / 190 citation-ready / 60 review / 0 blocked。
- 220→320 remains frozen。


## 2026-09-20 — Phase 7.7 Canonical Evidence Upgrade COMPLETE
- 9 newly admitted Canonical Entries upgraded: arita-kiln, bat-trang, iznik-ceramics, sawankhalok, seto-kiln, yixing-kiln, tao-shuo, jean-baptiste-du-halde, zhu-yan。
- Each received evidence-oriented complete content sections: core facts, Jingdezhen relation, evidence boundary, continued exploration.
- Sources upgraded to institutional/primary research anchors; 12 evidence-graded exploration relations added/confirmed.
- Media audit: Arita 2, Bát Tràng 1, Iznik 2, Si Satchanalai 1, Seto 1, Yixing 1, Tao Shuo 1, Du Halde 0, Zhu Yan 0. No unverified placeholder media added.
- Du Halde/Zhu Yan remain without primary media until a verified source image is available.
- Phase 7.7 version marker: phase7.7-canonical-evidence-upgrade-v1.
- 220→320 remains frozen.


## 2026-09-20 — Phase 7.8 Cross-Civilization Network QA COMPLETE
- 全量审查190个Published + Canonical Eligible Entry。
- network status: 142 isolated, 3 single_weak, 12 multi_weak, 17 single_strong, 16 connected。
- 仅33/190（17.4%）至少拥有A/B evidence-grade关系；142/190（74.7%）完全没有relation。
- 现有entry_relations evidence grade分布：A 27、A+ 5、B 5、C 77。
- 已为entry_content_admissions写入network_qa_status/network_qa_reason/network_qa_version=phase7.8-cross-civilization-network-qa-v1。
- 本轮不自动修复关系、不批量提升C→A/B；下一步应按Relation Claim→Evidence→Source→Evidence Type→Confidence→Boundary逐条修复P0/P1网络。
- P0重点：有田—景德镇、欧洲/代尔夫特/迈森、伊斯兰世界、朝鲜半岛、东南亚、外销瓷、克拉克瓷、荷兰东印度公司、葡萄牙贸易、二元配方、青花钴料等。
- 220→320继续冻结。
