# Current State

更新时间：2026-09-19
正式项目基线：6a8700b0621b787ecb92df47448df50a4cb9f966

## GitHub
- 仓库：justinxyj/jingdezhen-porcelain-wiki
- 默认分支：main
- AI 项目记忆已进入 main（PR #17 已合并）

## 基线→当前接管审计
- 已完成 GitHub 基线→main 差异核验。
- 已完成 live Supabase 生产状态核验。
- 已确认 Phase B 核心公开读取 RLS 已生效；anon 无 is_staff() EXECUTE。
- 已确认生产数据：entries 149、media 133、entry_relations 169、timeline_context 50、craft_processes 72、craft_process_relations 71、entry_craft_processes 289。
- 已确认 G29 动态条目已进入生产。
- 已确认 anon 实际可读取核心公开层：149 entries、124 approved media、169 relations、50 timeline_context。
- CI / Pages 当前仍需单独取得最新可验证运行结果。

## 本次安全修复
- 发现 public.craft_media_candidates 与 public.timeline_media_candidates 在生产中 RLS 关闭。
- 这两个表属于内部媒体候选/治理池，不应直接开放给网站访客。
- 已在生产启用 RLS。
- 已撤销 public / anon / authenticated 对这两个表的表级权限。
- 已验证 anon/authenticated 无 SELECT/INSERT 权限。
- 已在 GitHub main 增加迁移记录：supabase/migrations/20260919090000_secure_media_candidate_tables.sql。
- Supabase Security Advisor 的原 RLS-disabled ERROR 已消失；剩余为“RLS 已启用但无 policy”的 INFO，这是预期的内部封锁状态。

## 本次网站真实功能验收发现并修复
- 验收发现前端 knowledge-store 原先只按 media.status='approved' 过滤，没有按 review_state='verified' 过滤，存在把“待审核媒体”送入公共网页的风险。
- 已修复为只加载 status='approved' 且 review_state='verified' 的媒体。
- 验收发现 media-policy.js 对 The Met 的真实馆藏图 42490/177595/main-image 有硬编码拒绝；该图同时存在 verified 记录，因此会导致真实馆藏图在网页中被错误隐藏。
- 已移除该硬编码拒绝。
- GitHub 最新 main 已包含上述两项修复：56377dd / 5f5784c。
- 关系读取实测可用：anon 对 blue-and-white 可读取 30 条关系。
- G29 的 Met 条目目前有 1 条媒体记录但 review_state=pending，因此按新规则不会公开显示，符合审核门槛。

## 第二轮验收新增发现
- `museum-images.js` 仍存在针对 Met 42490 图片的旧硬编码拦截；已删除，避免再次把合法馆藏图当作占位图屏蔽。
- 72 道工序页面此前使用前端硬编码的 72 个名称/描述，与生产 `craft_processes` 表存在双份数据源风险。
- 已将 `technology-tree.js` 改为从生产 `craft_processes` 读取 72 道工序；只有 `image_status=verified` 时才使用数据库图片，待审核工序继续使用明确标注的阶段代表图。
- 已实测 anon 可读取生产 `craft_processes` 72 条。

## 当前重点
1. 完成 CI / Pages 实时核验。
2. 继续复核 /entry/、时间轴、器物目录、人物页、图片库的真实行为。
3. 审核剩余 SECURITY DEFINER function WARN，不机械修改。
4. 再进入媒体清理与 72 工序图片核验。

## 新会话恢复方式
1. 读取本文件
2. 读取 PROJECT_CONTEXT / TASKS / CHANGELOG
3. 查询 GitHub 当前 main 与近期 PR/CI
4. 涉及数据库时查询 Supabase 实际状态
5. 再开始修改

## 第三轮验收补充
- Pages run #339（commit d92ab58）已成功完成部署；Validate run #55 同样成功。
- 当前环境无法直接打开 GitHub Pages 页面进行像素级浏览器验收；web/container 对 justinxyj.github.io 均无法解析，因此不冒充已完成浏览器目视检查。
- 修复窑址地图容器固定高度与 overflow:hidden 冲突，避免地图下方“怎么使用”等内容与地图区域发生裁剪/覆盖。
- 增强窑址地图移动端高度与层级隔离。
- 为首页、/entry/、时间轴、72 工序及旧博物馆组件增加 Material Slate 夜间模式专用颜色，修复深色背景上的深色文字问题。
- 72 工序移动端进一步收紧横向内容宽度与详情卡布局。


## 第三轮验收：用户实测新增问题
- 用户上线截图确认：器物目录、人物/窑址相关卡片和详情弹窗存在大量“图片区域有但图片不显示”的问题。
- 生产 media 中发现 13 个 The Met 对象 ID 使用了无效的 /???/main-image 路径；另有大量媒体复用了 42490/177595 视觉索引图。
- 已修复公共图片层：所有动态创建的 img 现在都会被 MutationObserver 纳入治理；The Met IIIF 失败时自动按对象 ID查询 The Met Open Access API，取得 primaryImageSmall/primaryImage；再失败时尝试 Wikimedia Commons；最终才显示无破图图标的明确占位图。
- 公共图片统一增加 referrerpolicy=no-referrer，并在恢复过程中隐藏破损图片，避免截图中出现巨大 alt 文本/破图图标。
- 用户截图还确认静态现代景德镇页面出现原始内部引用标记；已将 contemporary/heritage.md、education.md、future.md、industry.md 中这些残留标记替换为正常 UNESCO 世界遗产资料链接。
- The Met 官方文档确认对象接口提供 primaryImage 与 primaryImageSmall，可作为破损 IIIF 图片的恢复来源。
