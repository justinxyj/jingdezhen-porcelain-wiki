# 第一轮 UX 修复完成报告

基线：main `0c294e5d326d599b8a19c192ffe1e3ea4bc6488c`。网站修复提交：`2fd937e5af774f18cdd07516092d88545f90dcd0`，`fix(ux): repair mobile filters, source references and visitor entry quality`。本报告记录正式网站部署后的检查，不把本地构建当作线上验收。

## 问题前后对照与 P0/P1 状态

详细位置、原因、复现方式和验收标准见 [基线清单](issues.md)。

| 项目 | 修复前 / 复核结果 | 修复后 | 当前状态 |
|---|---|---|---|
| 1 P0 | YES：320px 器物30px、人物55px | 2列、搜索/机构/计数通栏、完整字段 | 已修复并线上验证 |
| 2 P0 | YES：链接逃出项目目录；原检查0missing漏检 | 正确相对路径，检查器阻止意外逃逸 | 已修复并线上验证 |
| 3 P1 | YES：搜索按钮加在面包屑，导航与主站分离 | 使用已有静态导航中的搜索位，统一手机布局 | 已修复并线上验证 |
| 4 P1 | NO：基线5宽度搜索同一行 | 不重做组件，保留测量回归 | 未复现；回归通过 |
| 5 P1 | YES：图像在分类与路线之后 | 既有馆藏图片区提前至首屏后 | 已修复并线上验证 |
| 6 P1 | YES：无图目录占160px、Entry占98px | 紧凑真实无图说明，单列无图header | 已修复并线上验证 |
| 7 P1 | YES：R01/R09/R10被全部过滤 | 从现有书目解析R编号，静态/动态一致 | 已修复并线上验证 |
| 8 P1 | YES：多卡重复同一句 | 可靠语义note，否则目标摘要，无摘要就不造说明 | 已修复并线上验证 |
| 9 P1 | YES：58个数据候选；已在卡片发现角色标签冲突 | 显示目标真实类别；不改DB、不推断关系 | 已修复并线上验证 |
| 10 P1 | YES：只有数量，无已选条件和清除 | 复用现有控件显示选中值和一键清除 | 已修复并线上验证 |
| 11 P1 | YES：HTML缩进与换行按pre-wrap呈现 | 正常HTML空白流，保留原正文/标题/脚注 | 已修复并线上验证 |
| 12 P1 | YES：有真实字段但不展示 | 显示数据库更新时间/版本，未知不显示 | 已修复并线上验证 |
| 13 P1 | YES：仅GitHub Issues | 复用dialog，本地复制/下载反馈，GitHub可选 | 已修复并线上验证 |
| 14 P1 | 原组件已有，需专项复验 | 限域延迟/断网浏览器检查，确有失败再改 | 已有实现；专项验收通过 |
| 15 P1 | 现有测试未检查select宽度/路径逃逸/新来源 | 增加上述专项及5宽度8页面、截图 | 已修复并线上验证 |

手机完整筛选字段保留。320px 器物下拉框由约30px扩大至139px（机构筛选通栏288px），人物由约55px扩大至139px。青白瓷的 R01/R09/R10 现在从站内已有书目解析出3条参考资料；未添加“已核验”标记。无图说明采用紧凑展示，不添加虚构图片。

## 首页真实器物图片距离

仅提前原有故宫馆藏图片区，未增加或删除首页章节。单位为页面顶部到第一张真实图片的像素距离，同一宽度前后测量：

| 宽度 | Before | Production |
|---|---:|---:|
| 320 | 3263.59 | 950.69 |
| 375 | 3169.41 | 921.09 |
| 390 | 3169.41 | 921.09 |
| 768 | 2650.61 | 979.14 |
| 1440 | 2359.94 | 1026.44 |

原始测量见 [Before](before/home-image-position.json)、[Production](production-acceptance.json)。图片仍使用原有真实来源，实际加载检查通过。

## 自动化及正式网站验收

- 正式 TypeScript 检查：**0 errors**，见 [记录](typecheck.txt)。未关闭 strict、排除核心源码或增加批量 any / ts-ignore。
- 本地与线上专项分别218项通过：五种宽度、明暗模式、首页/器物/人物/百科/搜索/工艺/时间轴/地图/当代/网络等页面；检查下拉宽度、横向溢出、筛选汇总/清除、弹窗键盘、真实版本、来源和导航。见 [线上逐项记录](production-acceptance.json)、[本地记录](local-acceptance.json)。
- 既有174项浏览器检查线上通过，未删除测试：[原有测试记录](production-existing-tests.json)。来源渲染90项通过：[记录](source-tests.txt)，包括未知书目编号不伪造来源。
- 严格构建通过；全站16,160个本地链接目标检查无缺失。新增回归用例确保同站链接逃出项目路径被识别，检查进入 Validate 与部署流程。
- 器物、人物、搜索、工艺、时间轴、地图六类读取失败和重试恢复通过；延迟读取的加载/aria-busy及恢复通过。静态百科在数据服务失败时仍保留正文。
- 可访问性：26组页面/明暗模式 axe 检查报告0条已确认违规，22项键盘检查通过；纠错弹窗另测两种模式、焦点约束、ESC与焦点返回。axe 同时有29项规则级 incomplete 结果，需人工判断，**不宣称完成全面 WCAG 认证或真人屏幕阅读器验收**。[完整记录](production-accessibility.json)
- 四条真实用户路径 A/B/C/D 实际点击通过：[路径记录](production-user-journeys.json)。旧路径 D 用例要求 UNESCO 链接，但当前正式发布的 chinoiserie 正文引用 V&A。已将测试同步到正式稿的精确 V&A 来源 URL，保留真实来源检查；未为了通过测试修改网站或生产数据。

测试数量只证明上述覆盖范围，不能证明所有历史事实正确或所有潜在 UX 问题都已排除。

### 线上访问范围与部署证据

生产地址：https://justinxyj.github.io/jingdezhen-porcelain-wiki/

实际访问首页、`museum/catalog/`、`museum/people/`、`entry/qingbai-porcelain/`、`search/?q=青花`、`craft/technology-tree/`、`museum/timeline/`、`museum/kiln-map/`、`network/global/`、`network/relations/`、`research/evidence/?slug=chinoiserie`、`contemporary/`、`museum/gallery/`；路径另访问青花、元青花、湖田窑、御窑厂、唐英、唐英钧釉瓶、中国风。手机布局及 Dark Mode 包含在逐项记录中。

[Pages 部署 37739460951](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37739460951)：SUCCESS；[Validate 37739461041](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37739461041)：SUCCESS。正式站8份关键资源与本地提交/构建哈希一致：[资源验证](production-asset-verification.json)。后续仅报告/测试样本归档提交不改变已部署前端。

### 手机截图

已浏览核对实际生产截图，完整320/375/390三宽度截图在 [after/](after/)。

| 页面 | Before | After |
|---|---|---|
| 器物320 | [截图](before/museum-catalog-320-viewport.png) | [截图](after/museum-catalog-320.png) |
| 人物390 | [截图](before/museum-people-390-viewport.png) | [截图](after/museum-people-390.png) |
| 青白瓷390 | [截图](before/entry-qingbai-porcelain-390-viewport.png) | [截图](after/entry-qingbai-porcelain-390.png) |
| 筛选状态390 | — | [器物](after/catalog-selected-390.png)、[人物](after/people-selected-390.png) |
| 纠错390 | — | [截图](after/feedback-390.png) |

## 250条内容质量审查与剩余事项

[逐条候选清单](content-issues.md)、[机器可读完整审查](content-audit.json)、[来源访问记录](source-availability.json)。本轮做字段、正文长度、重复句、工程词、关联类别和来源可展示性审查；未将自动扫描冒充250篇史实人工审定。

剔除脚注文献后正文<300字185条，<150字143条，95条正文与摘要相同：这些是优先审查候选，不自动判定内容错误，也不无依据扩写。按本轮规则未发现跨至少3条重复的长段落或所扫描内部工程措辞；这不排除其他薄弱/不自然表述。58个关联类型与目标类别候选需要核对方向和角色，不能全部当作错误关系；本轮只修正用户可见目标类别，不修改数据库关系。

125个来源 URL 实测98个可访问、27个待核实。可访问不等于论述已核验。4个链接两次返回404（含不带Range复查）：

| 条目 | URL | 本轮处理 |
|---|---|---|
| dehua-kiln | https://whc.unesco.org/en/document/180501 | 未找到已确认替代来源，保留待审 |
| lang-tingji | https://www.chnmuseum.cn/zp/zpml/201812/t20181218_26821_wap.shtml | 同上 |
| qian-qichen | https://www.jdz.gov.cn/zjcd/mljdz/t289353.shtml | 同上 |
| wang-qi | https://www.jdz.gov.cn/zsnj/jdzsz/jdzszdwj/rwz/rwc/P020201114583753053261.pdf | 同上 |

其他23项为403/500/503或网络错误，不能由这些响应认定链接永久失效。

游客现在可不登录复制/下载纠错记录，也可选择 GitHub。**记录没有自动发送**，界面明确说明这一点；网站尚无匿名接收服务/维护者邮箱。如果需要自动接收，需要提供真实接收渠道，不能伪造联系地址或扩大为新后台。

## 数据保护与需单独授权的数据库修改

本轮**未执行任何生产数据库写入**。最终只读比较：250条已公开记录的所选字段全部未变，已发布内容79/79、工序65/65、时间轴语境16/16和metadata22/22与稿件一致：[读取验证](production-data-preservation.json)。这是所选公开字段比较，不是全数据库备份或事务快照。

没有待执行的已确定 SQL 更新。本轮数据库候选范围仅是以上4条失效来源、需可靠文献支撑的短正文/缺字段和需人工辨别语义的关系；须先获得可靠替代资料、形成逐字段差异与具体 SQL 范围/风险，再单独请用户批准。未将185条短正文、58个关系候选自动转换为更新。

## 修改范围与提交

[修改文件清单](changed-files.txt)包含全部网站修复、测试及审查材料；未新增第二套组件、搜索或数据库。内容稿未修改，已发布160条内容未覆盖。

- 网站修复：`2fd937e5af774f18cdd07516092d88545f90dcd0`，`fix(ux): repair mobile filters, source references and visitor entry quality`。
- 后续验收归档提交：`docs(ux): archive production verification and mobile screenshots [skip ci]`，包括本报告、截图、逐项测试证据，以及已发布来源对应的路径测试样本；完整 hash 见仓库该提交记录。
