# 景德镇陶瓷数字博物馆｜游客体验集中优化最终验收报告

> **状态：等待最终线上验证。** 本报告基于已提交的代码、可核验的 GitHub Actions 和隔离浏览器测试，不将尚未完成的检查写作通过。最终状态将在最新 Pages 与 Validate 完成后更新。

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

未删除或放宽测试断言。后续 [PR #33 Validate](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/38130946407) 完整验证 **285通过／0失败**，包括该类真实浏览器稳定性检查。最终主分支和部署后测试仍需单独确认。

## 4. 已验证与待确认

- PR #33：Validate Museum Build **Success**；250个静态条目和特定弱网／无JS情形合计285个浏览器稳定性用例全部通过；新增封面失败测试通过。
- 主分支最新代码（含700px断点）：[`ee0c52e4`](https://github.com/justinxyj/jingdezhen-porcelain-wiki/commit/ee0c52e4084e95f043476b30efb3fb92aacdbc49)。
- 最新 [Validate](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/38131677622)：**等待结束**。
- 最新 [Pages](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/38131677633)：**等待结束**。
- H-3目录检查通过。正式上线验收必须另核对 Pages 的 Build、Deploy、在线 Smoke、Header交互、展览路径、百科DOM稳定性、Supabase ACL 全部检查，不得只凭构建成功宣告运营验收。

## 5. 保护范围和遗留事项

本轮没有授权也没有实施数据库写入、百科史实或关系数据改动。图片加载失败仅显示已标明的备用占位，不把其他器物图像冒充本器物。已有25件待核器物、尚待许可核查的两张图片、长期内容补证均属于后续维护，不在本次技术验收中强行解决。

原 Agent 的云执行器与未提交草稿状态仍未确认，且**本次没有对原工作区进行任何删除、重置或覆盖**。

## 6. 最终签收条件

只有最新主分支 Validate 与 Pages（含部署后全部线上复验）均为Success，且该报告在 `main` 中归档，才能将本次游客体验优化标记为完成。若任一失败，报告保持待验收并记录失败依据。
