# 静态百科单层外框与渲染稳定性验收

基线：`5efe6916df598d391c6abff984588a7aa9ed8bfe`。本次只处理二次渲染、嵌套外框及由此关联的布局变化；未修改百科生成器、百科内容、生产数据库或共享 Header 模板。

## 根因与修复

静态根元素本身已是完整 article，原异步入口仍调用整页 render，向其内部再创建一个 article 并替换正文。现在静态标记在入口处直接进入非破坏性增强，整页 render 内也拒绝处理静态根元素。

静态正文、标题、图片、来源、已有知识关系、canonical 和 JSON-LD 以首次 HTML 为准，不会随着 Supabase 返回重新排版。只在游客展开现有“深入研究”时查询相关推荐，且只更新该详情内的相关推荐模块；模块预留固定滚动区域，数据到达不改变外框高度。展开详情本身是用户主动操作，属于预期高度变化。失败只显示模块状态，完整正文仍保留。相关推荐使用与原动态入口相同的渲染片段，没有第三套百科模板。

原动态 `/entry/?slug=…` 继续使用既有模板。渲染时区分容器与已有 article：后者复用外框，不再嵌套 article；重复渲染依旧保持单层。

另发现 `site-privacy.js` 在 DOMContentLoaded 删除 `.wiki-entry-footer` 的读者提示，造成外框缩短。该提示并非内部工程元数据，已从删除名单移除，保留首次 HTML。其他内部元数据清理规则不变。

## 防回归检查

- `test_entry_ownership.mjs`：静态根禁止整页 render，首次打开不读数据库；局部增强成功与失败均保持原正文节点；动态 div 和 article 容器各重复渲染两次，始终一层外框。
- `test_entry_render_stability.py`：全部 250 个实际生成页面经过首次 HTML、DOMContentLoaded、主动增强加载中、真实数据完成四个阶段；记录外框数量/嵌套、标题、正文、图片、文档坐标和尺寸、原节点身份、滚动位置、所选文本。
- 320/390/768/1440、浅色/深色分别检查慢网、断网、数据库 503、JavaScript 关闭；另检查三个实际动态入口。
- 三阶段截图保持相同顶部视角；另保存加载中和完成后的真实滚动/选中文本视角。图中的“深入研究”展开是测试用户主动操作。
- Validate 和 Pages 发布前都执行 250 页浏览器验收；Pages 发布后在正式 URL 再执行全量验收，CI 保存 DOM JSON 和阶段截图。
- 测试网络只允许 GET 和既有 SQL STABLE 同代/空间查询 RPC；没有数据库写入。当前云环境代理需要测试端转发真实读取响应，响应内容不造假；GitHub Actions 无此代理时直接使用原生浏览器网络。

## 状态

本地：285/285 浏览器场景通过，0 失败。其中 250 个百科均完成全部阶段；32 个响应式/故障/无 JavaScript 场景通过，3 个实际动态入口通过。静态正文节点保持同一对象，没有通过复制相同文字掩盖替换。主动展开后，加载中与完成后的外框/正文/图片尺寸及坐标相同，滚动位置和所选文本相同。详细数据见 `local-dom-results.json`，阶段截图见 `local/`。

TypeScript：0 errors。90 项来源渲染检查、正文清理、Evidence 披露、渲染所有权单元检查通过；250 页 SEO/正文及全站 308 页共享 Header 检查通过，31,660 个内部目标零缺失。

## 正式发布与 Smoke 修复验收

渲染修复提交：`ae3adbb9e529418274c8968ed2276af0a4d93ca0`。首次 Pages 运行 37763629260 已部署，但旧 Smoke 仍在两处等待 `#wiki-entry-root .wiki-entry-card`，错误地要求第二层外框，因此失败。

测试修复提交：`4afa74b7f81eb1e3eb1c77c159e5246a32d12499`。只修改 `scripts/pages_smoke.py` 和 `scripts/pages_smoke.mjs`：Python 共享断言等待根 article 本身，并要求全页恰好一个 card、嵌套数量为零；两个续读路径改用该断言。JavaScript Smoke 同样增加数量及禁止嵌套断言。检查其他自动化脚本未发现仍要求双层 DOM 的断言；现有所有权和 250 页稳定性测试继续保留。

- [完整 Pages 运行 37765154553](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37765154553)：**Success**。Build、Deploy、部署后 Smoke、共享 Header 浏览器检查、正式网站 250 页稳定性检查及 ACL 只读检查全部成功。成功状态及每步结果见 `production/pages-run-success.json`；Actions 的 production Entry artifact 包含部署后完整 DOM 与截图。
- [Validate 运行 37765154375](https://github.com/justinxyj/jingdezhen-porcelain-wiki/actions/runs/37765154375)：**Success**。状态见 `production/validate-run-success.json`。
- 测试修复部署前，针对已上线的相同渲染修复版本进行了独立真实浏览器全量检查：**285/285，0 失败**，全部 250 静态页面完成各阶段检查，见 `production/independent-dom-results.json`。
- 新部署后的全量真实浏览器检查由 GitHub Pages deploy job 再次执行并成功。当前云环境的补充独立重测遇到 envoy / cloudflare_https_tunnel 的 HTTP 503，导致页面加载超时；不能计为通过。沙箱外重试同样遭遇该传输错误，确认后停止，不改测试、不伪造页面。失败运行摘要另存 `production/independent-after-network-summary.json`。

| 浏览器阶段 | 部署前单层版本 | 新部署后 CI 全量检查 |
| --- | --- | --- |
| 首次 HTML | card 1，nested 0 | card 1，nested 0 |
| DOMContentLoaded | card 1，nested 0 | card 1，nested 0 |
| 增强加载中 | card 1，nested 0 | card 1，nested 0 |
| 增强完成 | card 1，nested 0 | card 1，nested 0 |

各阶段正文、标题、图片原节点保持一致。主动展开研究区之后，加载中与完成后的外框和正文位置/尺寸、滚动位置、选中文本保持一致；没有正文替换或非预期异步布局变化。320/390/768/1440、浅色/深色、慢网、断网、数据库异常和无 JavaScript 场景均由成功 CI 覆盖。独立线上三阶段截图见 `production/`（390px 与 1440px）；新部署后截图见成功运行的 production Entry artifact。

未修改百科正文、共享 Header、canonical、JSON-LD、生产数据库或 Supabase 读取逻辑。250 页重新生成、SEO、内部链接及共享 Header 门禁继续运行；本轮没有删除或跳过旧测试。
