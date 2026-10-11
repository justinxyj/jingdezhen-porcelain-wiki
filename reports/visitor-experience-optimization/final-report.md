# 景德镇陶瓷数字博物馆｜游客体验集中优化最终验收报告

> **状态：正式游客体验优化验收通过（2026-10-11）。** 本结论由可核验的 GitHub Actions 正式部署、真实浏览器测试及独立回读产物支持；不代表未核实馆藏身份和未来资料维护工作已经完成。

## 1. 范围和原有成果

- 正式站点：https://justinxyj.github.io/jingdezhen-porcelain-wiki/
- 体验优化基线提交：[`0f0af74b90b587c2e964b88a6eb4ef4633babcf4`](https://github.com/justinxyj/jingdezhen-porcelain-wiki/commit/0f0af74b90b587c2e964b88a6eb4ef4633babcf4)
- 本次集中收尾：[`PR #33`](https://github.com/justinxyj/jingdezhen-porcelain-wiki/pull/33)，合入 `1b73e765e400ad90c5182fcca3793d689ce1fc3f`；补充700px断点修正 `0f3148805106f3c83319fe9d88959144b8e7669c` 与回归测试 `ee0c52e4084e95f043476b30efb3fb92aacdbc49`。
- 未修改 Supabase 生产数据库、250条已有百科史实正文、知识关系或媒体记录，未删除旧工作区。

原先 Agent 报告有未推送的768px补丁和本地报告草稿，但其旧云执行器无法启动；**本次未能读取或确认旧工作区的未提交文件**。以下补丁是从已部署网站的正式构建产物及现行 GitHub 源码重新复现和实现的，不声称找回原文件。

## 2. 十项游客体验优化的代码交付

`0f0af74` 包含：首页真实馆藏主视觉和简化首屏、百科探索总览及地图／时间入口、手机器物筛选面板与筛选状态、72道工序主要流程引导、时间轴方法说明折叠、短条目紧凑排版和参考资料入口、待核器物状态区分、相关知识阅读入口、导航／研发控件去技术化，以及搜索降级与反馈入口等优化。

这些是仓库内可见的实现范围，不表示每项都有独立的用户研究结论。图像身份与图片展示权利仍遵循现有来源记录；不以图片外观为依据为待核器物补充馆藏信息，不引入新的内容事实。

## 3. 原阻碍及最终补充修复

### 3.1 768px封面图片失败造成正文移动——已修复

从上次正式 Pages 构建附件提取的 HTML/CSS/JS，在隔离 Chromium 中对真实百科封面模拟：将正常的图片替换为较大尺寸的失败备用 SVG。

| 验收宽度 | 原始观察 | 修复后同场景 |
|---|---:|---:|
| 700px | 正文下移106.5px | 0px |
| 768px | 正文下移157.5px | 0px |
| 390px、701px、767px、849px、850px、851px、900px、1440px | 已核对相邻断点 | 正文不位移 |

根因是 `wiki-entry-cover` 在响应式过渡区可随图片固有尺寸改变宽度；较大的备用图导致封面高度一起增加。补丁仅约束850px以下封面的布局尺寸，不编辑静态正文。浏览器回归测试采用本地 data URI 分别模拟480×360和1200×800图片，比较**封面宽高、正文Y位置、正文HTML**，覆盖390/700/768/850/1440px和两种主题，不依赖图片服务商 CDN。

### 3.2 百科稳定性单例超时——保留严格验收

前次官方部署工作流 [`37797494149`](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37797494149) 的静态百科稳定性测试 **284通过／1失败**：`private-kiln-high-end-1440-default-normal` 等待 `.wiki-entry-body` 显示超时30秒。页面静态 HTML 中含有正文，故不能据此认定正文数据遗失；也不能仅凭单次超时推定为偶发网络故障。

未删除或放宽测试断言。后续 [PR #33 Validate](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/38130946407) 完整验证 **285通过／0失败**，包括该类真实浏览器稳定性检查。在最终主分支验证与部署后再次测试中，该用例均通过。曾经发生一次超时的事实保留在历史记录中，仍不能反向证明首次超时的全部根因。

## 4. 已验证与待确认

- PR #33：Validate Museum Build **Success**；250个静态条目和特定弱网／无JS情形合计285个浏览器稳定性用例全部通过；新增封面失败测试通过。
- 主分支最新代码（含700px断点）：[`ee0c52e4`](https://github.com/justinxyj/jingdezhen-porcelain-wiki/commit/ee0c52e4084e95f043476b30efb3fb92aacdbc49)。
- 最新 [Validate](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/38131677622)：**Success**（2026-10-11 UTC）。
- 最新 [Pages](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/38131677633)：**Success**。正式部署完成、Pages Smoke、线上Header交互、游客展览路径、250页稳定性、Supabase ACL均为Success。
- [H-3目录检查](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/38131677624)：**Success**。
- 从该 Pages 运行的 `entry-render-stability-production` 原始测试产物独立读取：**285/285通过，0失败**；上一轮超时的 `private-kiln-high-end-1440-default-normal` 本轮明确通过。
- 主分支前置250条静态百科检查同样为 **285/285通过，0失败**；严格的原测试断言及超时阈值均未降低。
- 此前 `0f0af74` 代码的全站体验优化及本轮仅封面尺寸的补充修复已部署到正式站点，经过上述工作流在线检查。

## 5. 保护范围和遗留事项

本轮没有授权也没有实施数据库写入、百科史实或关系数据改动。图片加载失败仅显示已标明的备用占位，不把其他器物图像冒充本器物。已有25件待核器物、尚待许可核查的两张图片、长期内容补证均属于后续维护，不在本次技术验收中强行解决。

原 Agent 的云执行器与未提交草稿状态仍未确认，且**本次没有对原工作区进行任何删除、重置或覆盖**。

## 6. 最终签收条件

**已满足本次集中优化的全部约定收尾条件。** 最新主分支 Validate、H-3目录检查与 Pages（含部署后所有在线复验）均为Success；本报告已归档至 `main`。本次游客体验优化可正式签收，网站转入日常维护。保留先前失败的历史证据与旧云工作区未恢复的说明；不将长期馆藏考证问题当成已解决。
