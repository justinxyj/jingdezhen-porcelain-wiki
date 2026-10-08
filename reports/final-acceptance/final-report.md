# 景德镇陶瓷数字博物馆｜第三阶段最终验收报告

日期：2026-10-08（日本时间）。基线：`f5d9f1dee184888940a0530ed209c266ab275c91`。

**当前结论：最终验收 BLOCKED，不能标记达到全部正式运营验收标准。** 已完成正式站基线浏览器检查、必要小范围修复、本地复验，并推送修复。GitHub Pages构建成功、部署步骤已执行，正式站样式文件曾确认包含新版修复；但随后云执行环境的HTTPS代理故障同时阻断GitHub Pages、GitHub API及Git远程连接。发布后的实际浏览器复验失败，工作流最终状态无法确认，不能把本地截图或部署前通过结果当作部署后验收。

本次没有修改Supabase生产数据库、百科正文、知识关系、馆藏归属或图片记录，没有重做Header或百科模板，没有新增大型功能。已发布的第二阶段43条百科及3条关系通过只读GET确认与批准稿一致；这次核对不是新一轮内容审查，也不是全库备份。85条保留待核记录与25件器物身份问题按用户要求属于资料维护，不作为本阶段阻塞原因。

## 1. 实际页面与游客流程

使用真实headless Chromium，正式站基线和修复后本地站均实际操作；移动端指移动视口，未声称是真机或Safari验收。主矩阵12页 × 320/390/768/1440px × 浅色/深色，共96个布局组合。

| 流程 | 实际操作 | 正式站修复前 | 修复后本地 | 修复后正式站 |
| --- | --- | --- | --- | --- |
| 第一次参观 | 读取数字博物馆说明、搜索入口、从导航进入百科 | PASS | PASS | BLOCKED |
| 搜索 | 在首页输入青花瓷、湖田窑、唐英，实际提交、点击准确结果 | PASS | PASS | BLOCKED |
| 百科阅读 | 正文、图片、展开参考资料、知识关系与静态选读、浏览器返回 | PASS | PASS | BLOCKED |
| 器物/人物 | 6项器物筛选、3项人物筛选、条件展示、清除、器物详情跳转 | PASS | PASS（布局/详情）；筛选回归沿用未变代码的基线检查 | BLOCKED |
| 地图 | 列表与标记Hover/Focus联动、选择湖田窑、点击百科、地域互斥筛选 | PASS | PASS（地图到百科）；联动沿用基线检查 | BLOCKED |
| 时间轴 | 选择湖田窑语境，阅读弹窗及真实百科入口 | PASS | PASS | BLOCKED |
| 研究与证据 | 普通参考资料与“原始记录不代表已核验”说明、资料入口 | PASS | PASS | BLOCKED |
| 全球/关系网络 | 实际选择关联条目；展开SVG图、键盘选中及跳转 | PASS（全球路径） | PASS（含SVG图） | BLOCKED |
| 手机主要路径 | 390px完整重复搜索、阅读、返回、地图、时间轴及证据路径 | PASS | PASS | BLOCKED |
| 触摸专项 | 新增移动Chromium触摸模拟的菜单、Bottom Sheet、地图/搜索 | NOT RUN | NOT RUN | NOT RUN：前置线上访问被代理阻断 |

不能以“页面能打开”替代上述操作。最终修复后本地游客检查170项全部通过；正式站修复前的响应式/筛选/失败重试脚本228项通过。[初次游客检查原始结果](evidence/visitor-before-initial.json)保留8个工艺H1失败及两个定位过窄的检查失败。初次自编验收脚本有两项仅在“深入研究”内找湖田窑延伸阅读，实际相关入口在静态知识关系及选读区域；经定位修正检查范围，未因此新增或伪造关系。工艺页的重复H1则是真实缺陷并已修复。

证据：[游客本地结果](evidence/visitor-local.json)、[正式站基线筛选与异常检查](evidence/responsive-and-failure-baseline.json)、[地图联动](evidence/map-interactions.json)、[SVG及操作系统/网站主题交叉检查](evidence/graph-and-os-palette-local.json)。

## 2. 确认的问题与修复

| 项目 | 优先级 | 根因及最小修复 | 当前状态 |
| --- | --- | --- | --- |
| 主题条目卡片/入口对比度不足 | P1 | 旧CSS只跟随操作系统深色，网站主题切换后仍出现白卡及低对比文字；改用现有visitor颜色变量，并修复小字透明度 | 已修复、本地19页×2主题扫描通过；生产复验BLOCKED |
| 工艺页关联链接与工序标识对比度 | P2 | 链接继承Material颜色，标识透明度过低；沿用既有主题色与正文次要色 | 已修复、本地通过；生产复验BLOCKED |
| 工艺页重复H1与H2→H4跳级 | P2 | Markdown页标题外又写H1，动态卡片直接H4；内页说明改H2、卡片改H3，同步原尺寸样式，不改文字或工序数量 | 已修复、各视口单H1/标题层级通过；生产复验BLOCKED |
| 自动生成百科的GitHub源码按钮404 | P2 | 250个Markdown是构建产物，并未提交对应源码；Material仍生成raw链接。共享现有page-context hook对带entry_schema的页面取消不存在的源码动作；普通文档源码按钮及真实参考资料保留 | 构建全部250页通过；新增负向用例可拦截复发；生产复验BLOCKED |
| 性能脚本等待已删除的旧元素 | 检查工具缺陷 | 不再等待旧visitor-entry-shortcuts，改为确认完整静态根元素；保持不触发研究增强的冷访问测量，并增加CLS观察器 | 修复后完成正式站基线6页测量；新版CLS发布后未测定 |
| 无障碍脚本先于异步内容完成 | 检查工具缺陷 | 等待真实主题卡片及工艺关联卡片，扩大到七个主题；检测到违规或键盘失败时返回非零 | 本地38个页面/主题扫描及22项键盘检查通过 |

未发现可确认的P0站点缺陷。代理故障不是已证明的生产站P0故障。不能据本地通过宣称所有P1已完成生产闭环。

## 3. 截图与DOM证据

**以下“修复后”截图来自本地真实浏览器，不是正式站截图。** 正式站发布后截图因代理故障未取得，不用本地截图冒充。

| 问题/页面 | 正式站修复前 | 本地修复后 |
| --- | --- | --- |
| 当代主题卡片，390px深色 | [白卡及低对比文字](screenshots/before/contemporary-390-slate.png) | [跟随网站深色](screenshots/local-after/contemporary-390-slate.png) |
| 当代主题卡片，1440px深色 | [修复前](screenshots/before/contemporary-1440-slate.png) | [本地修复后](screenshots/local-after/contemporary-1440-slate.png) |
| 工艺关联卡片，390px深色 | [修复前](screenshots/before/craft-390-slate.png) | [本地修复后](screenshots/local-after/craft-390-slate.png) |
| 青花瓷单层外框，390px | [正式站基线](screenshots/before/entry-390-default.png) | [本地保持单层](screenshots/local-after/entry-390-default.png) |
| 首页与共享品牌栏，390px | [正式站基线](screenshots/before/home-390-default.png) | [本地保持原设计](screenshots/local-after/home-390-default.png) |

正式站基线的250条百科及35个附加案例共285个真实浏览器案例通过：初始HTML、DOMContentLoaded、主动增强加载中/完成，始终一个百科卡片、零嵌套；正文、位置/尺寸、选择文本与滚动位置不被替换。附加案例包括四种屏宽、深浅主题、慢网、断网、数据库异常、无JavaScript及3个动态入口。图像/字体正常初始解码后测量，不把自然资源加载混同于异步正文替换。详细DOM阶段摘要见[百科稳定性](evidence/entry-stability-before.json)。发布前构建也验证250页canonical、JSON-LD、可索引正文，以及全站308页的唯一共享Header。

## 4. 链接、来源及未修复事项

严格构建检查31,660个站内目标，缺失0；真实路径均实际点击。构建内链接检查不等于每个锚点都做了线上点击。

全站外部anchor链接去重704个，GET实测：216个200、84个404、380个429、1个403、3个500、15个503、5个网络异常。200只表示可访问，不表示史实已核验。84个404中81个来自上述不存在的生成页GitHub源码路径；全部250个生成源码按钮已从构建HTML中移除。移除后454个外部链接的分类是原观测重分类，不冒充重新跑过全部链接：216个200、3个404、211个429，其余访问异常。限流、403和5xx未判定永久失效。18个异常链接沙箱外复查仍为15个Envoy503及3个404。

资料维护项（不擅自更改）：

1. 钱其琛来源：`https://www.jdz.gov.cn/zjcd/mljdz/t289353.shtml`，两次观测404。涉及生产sources，替换需独立来源依据及用户授权。
2. 王琦来源：`https://www.jdz.gov.cn/zsnj/jdzsz/jdzszdwj/rwz/rwc/P020201114583753053261.pdf`，两次观测404。同样不绕过数据库修改限制。
3. 工艺规划资料：`https://www.jdz.gov.cn/zwgk/zfgb/2024n/d3q/szfwj_3307/t958190.shtml`，两次观测404。尚未取得同文可靠替代，保留出处并归档，不拼凑新资料。工艺页其他官方入口保留。
4. 图片出处/版权声明实际可见，失败图片可退化为明确的文字说明图，不用另一器物或AI图顶替。故宫版权归属声明不能等同已取得任意再利用许可；权利范围仍需运营方维护。第二阶段两张待审图片不在本次增加范围内，没有媒体写入。
5. 反馈提供实际下载与可选GitHub Issues（仓库has_issues=true），下载明确“尚未发送”；未搭建未经授权的收集服务，也未虚构邮箱。

证据：[完整外部观测](evidence/external-links-initial.json)、[复查](evidence/external-links-retry.json)、[分类与界限](evidence/external-link-triage.json)。这不是源文替换或新一轮内容治理。

## 5. 可访问性及性能

修复后本地19页×2主题共38次axe扫描，检测到的violation为0；22项手机菜单、筛选弹窗Tab、ESC、焦点返回、图片查看器键盘/缩放检查通过。额外11项检查覆盖操作系统浅/深与网站浅/深的组合、SVG图展开及键盘选条目。原正式站焦点可见、Reduced Motion及公共文字颜色对比检查30项通过。实际main图像有alt，矩阵页面只有一个H1，无整页意外横向溢出；工艺图自身可横向浏览，不等于整页溢出。

**未完成项不能标通过：** axe仍有color-contrast、aria-prohibited-attr及label-content-name-mismatch三类incomplete，共560次节点判定（跨页面/主题重复）；没有声称这些均已人工核验。云端未用实体手机、VoiceOver/NVDA做真人读屏验收，不声称完整WCAG认证。发布后axe、触摸专项及最终视觉复验因代理故障未完成。

证据：[修复前axe](evidence/accessibility-before.json)、[本地修复后axe](evidence/accessibility-local.json)、[焦点/动效](evidence/focus-and-reduced-motion.json)。

以下是**正式站修复前的真实冷Chromium测量**（1440×1000，禁用缓存、内容可见后2秒）。不是Lighthouse评分或发布后数据。Supabase栏分“数据请求 + CORS预检”。未执行JS/CSS为UTF-16源代码区间估算，不是网络传输字节，也不是可以直接删除的功能。

| 页面 | 请求数 | JS传输KiB | CSS传输KiB | DOMContentLoaded秒 | Supabase数据+预检 | 未执行JS/CSS估算 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 首页 | 29 | 46.4 | 55.9 | 1.65 | 0 + 0 | 62.2% / 88.8% |
| 青花瓷百科 | 36 | 129.6 | 55.9 | 1.40 | 0 + 0 | 82.6% / 86.8% |
| 搜索 | 51 | 127.0 | 58.0 | 1.60 | 6 + 6 | 73.3% / 87.2% |
| 地图 | 60 | 168.7 | 61.7 | 1.27 | 2 + 2 | 73.0% / 87.3% |
| 时间轴 | 46 | 127.1 | 61.0 | 1.16 | 3 + 3 | 74.6% / 88.2% |
| 关系网络 | 42 | 126.6 | 57.9 | 1.42 | 2 + 2 | 75.7% / 87.3% |

六页该次观测没有Network.loadingFailed事件，但各有1次可选的GitHub releases/latest查询返回404；页面仍正常就绪，不能因此声称“所有HTTP请求成功”。该可选仓库信息请求没有影响参观操作，保留在请求明细中；当前未单独核实404是否由于没有Release或访问限制。Leaflet只在地图页实际加载，其他五页未加载；关系网络使用本站SVG，在未展开前不渲染图，展开后有可键盘选择的真实对象，无新增Graph库。时间轴widget只按现有page-assets规则在目标页出现。首页与静态百科初始Supabase读取0，研究增强按用户动作读取。未发现该组测量中重复加载同一个脚本URL。仍有可观的通用样式/未执行脚本，记录为低优先级日常性能观察，不在本轮重构。发布后性能及新增CLS观测未完成，不能标PASS。

完整数据：[性能基线及请求明细](evidence/performance-before.json)。

## 6. 自动化、部署与提交

本地实际通过：

- 正式Type Check：**0 errors**；未改strict/规则/源码范围。[命令记录](evidence/typecheck.txt)。
- museum QA、安全静态检查、250页重新生成、MkDocs strict build、站内链接检查。
- 搜索发现、图片恢复、器物/人物metadata、Evidence披露、正文清洗、静态所有权测试通过。
- 来源静态/动态一致性90项通过；内部链接回归1个、HTML清洗3个、发布安全4个单元测试通过。
- 250页SEO/正文及308页唯一Header检查通过，5个负向变异被拒绝，含重新引入不存在的GitHub源码动作。

修复提交：[`54650dbda5691e72120853dc719b5b1db9230e3a`](https://github.com/justinxyj/jingdezhen-porcelain-wiki/commit/54650dbda5691e72120853dc719b5b1db9230e3a)，已推送main。

| Actions | 运行链接 | 已核实的状态 |
| --- | --- | --- |
| 本次GitHub Pages | [37782683944](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37782683944) | build成功；Deploy步骤已执行，新版CSS曾公开可读；工作流及部署后测试最终状态NOT VERIFIED |
| 本次Validate Museum Build | [37782684063](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37782684063) | 最后可读时在250页DOM检查；最终状态NOT VERIFIED |
| 本次H-3 Catalog Probe | [37782683999](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37782683999) | 已触发，最终状态NOT VERIFIED |
| 第二阶段基线Pages | [37776235549](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37776235549) | 已核实success，仅证明修改前基线，不替代本次状态 |
| 第二阶段基线Validate | [37776235592](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37776235592) | 已核实success，仅证明修改前基线 |

修改文件：docs/craft/technology-tree.md（仅heading标签）、docs/javascripts/technology-tree.js、docs/stylesheets/technology-tree.css、docs/stylesheets/world-browser.css、hooks/visitor_navigation.py、scripts/check_shared_header.py、scripts/ux_accessibility_audit.py、scripts/ux_performance_measure.py，以及实际游客验收脚本scripts/final_visitor_acceptance.py。没有修改第二阶段编辑稿、生产数据或百科生成正文。

## 7. 唯一集中验收阻塞与恢复方式

已确认的外部阻塞：执行环境HTTPS出口代理。首页、GitHub API及Git远程同时返回Envoy503，内容为`Invalid argument|remote address:envoy://cloudflare_https_tunnel/`；沙箱外GitHub/API及浏览器复查未恢复。不是H3_DB_URL、数据库密码或新的Supabase授权问题，Agent没有出口sidecar修复/重启能力。详见[故障与未完成检查](evidence/production-proxy-block.json)、[实际失败浏览器结果](evidence/visitor-production-failed.json)。

需要恢复这个云执行环境的网络出口，或在网络正常且保留GitHub授权的执行环境复验。同一任务只剩：读取上述Actions最终状态、执行以下发布后真实浏览器检查、取得线上截图、更新并推送此报告。不再新增开发任务，不进入新阶段。

```bash
UX_BASE_URL=https://justinxyj.github.io/jingdezhen-porcelain-wiki/ VISITOR_OUTPUT=/tmp/final-visitor-production python scripts/final_visitor_acceptance.py
UX_BASE_URL=https://justinxyj.github.io/jingdezhen-porcelain-wiki/ UX_ACCESSIBILITY_OUTPUT=/tmp/final-accessibility-production.json python scripts/ux_accessibility_audit.py
UX_BASE_URL=https://justinxyj.github.io/jingdezhen-porcelain-wiki/ UX_PERFORMANCE_OUTPUT=/tmp/final-performance-production.json python scripts/ux_performance_measure.py
UX_BASE_URL=https://justinxyj.github.io/jingdezhen-porcelain-wiki/ EXTRA_OUTPUT=/tmp/final-extra-touch-production.json python reports/final-acceptance/evidence/touch-and-palette-check.py
```

上述命令使用已有Playwright/Chromium、axe依赖及正常公开只读连接；所有failed、未执行项及代理失败日志保留，没有为了验收删除测试。

报告提交状态：修复提交已推送；本报告已在执行环境本地提交。由于Git远程同样503，普通推送和沙箱外推送均失败，报告尚未推送GitHub，不提供不存在的远程报告链接；精确本地commit hash见最终交付或当前git HEAD。

## 8. 最终结论

代码中的确认缺陷已按最小范围修复，本地参观与基本无障碍检查通过，未修改生产资料；但**正式发布后完整浏览器验收、Actions最终成功状态和线上修复后截图仍未完成**。因此当前不能宣布项目已结束集中验收或全面达到正式运营标准。

资料待核、来源例行复查、图片权利确认、真实读屏/设备验证属于日常维护，不扩成新的开发阶段。本报告保留准确边界，待出口恢复后只补齐上述验收闭环。
