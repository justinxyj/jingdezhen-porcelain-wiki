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
- CI / Pages 已取得最新可验证运行结果：Validate run #85 成功；Pages run #369 成功，对应 main commit 0feb980。

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

## 第三轮：首页
- 首页截图确认自定义首页被 MkDocs 默认页面壳包住：顶部出现多余“首页”面包屑/留白。
- 首页自定义品牌文字过小；已放大中文站名及英文副标题，并同步收紧首页顶部高度。
- 首页右侧“查看源代码”图标点击后进入 404；已在 mkdocs.yml 增加 edit_uri: edit/main/docs/，并在自定义首页隐藏该通用操作按钮，避免首页出现无意义的源码入口。
- 以上均已提交到 main。

## 2026-09-19 — 安全与前端数据层第二阶段
- 生产 media RLS 已收紧：公共读取必须同时满足 status='approved' 与 review_state='verified'。
- 普通 authenticated 用户的媒体 INSERT 已被数据库策略强制限制为 pending / pending、verified_at=NULL、is_primary=false；staff 才能直接插入审核态媒体。
- 曾尝试通过 public.media_public 视图隔离媒体字段，但实际 PostgREST 运行验证发现该视图在当前 API 配置下不可稳定访问；最终采用更直接的列级权限方案。
- 当前生产公共媒体通路：anon 对 public.media 无表级 SELECT，仅获得网页所需安全列的 SELECT 权限；RLS 同时要求 status='approved' 且 review_state='verified'。内部字段（如 verification_note、verified_at、uploader_id、review_state、status）不会通过匿名查询返回。
- knowledge-store.js 已加入明确错误状态、请求超时、有限分页及运行时数据契约校验；详情读取按 slug 定向查询。
- museum-images.js 已加入超时、有限重试、缓存去重、并发上限，并只监听带 data-museum-image 标记的图片。
- site-privacy.js 已删除通用文本匹配删节点逻辑；timeline-interactive.js 只处理新增 DOM 节点。
- 已补充 Python runtime smoke 与 Pages Playwright smoke，CI 分开验证 entries/media/craft/sensitive 及首页、目录、时间轴、72 工序、详情页。
- 2026-09-19 用户实测发现历史时间轴排序错误：原实现按空的 meta.period 字符串排序，导致数据库返回顺序把 1949—1966、2002—2014、2026 等近现代节点排在最前。
- 已修复 museum.js：按 timeline era + 标题起始年份进行稳定的历史排序，并明确将“东晋—唐”置于“五代—宋”之前；近现代 1909、1949、2002、2026 节点排到后段。
- 时间轴排序修复 commit：fb5349a4d307cb62c7902bdba5c85c25685cfd05。

## 2026-09-19 — 新一轮静态审计修复
- H-1：auth-manager 认证刷新失败现在统一产生 AUTH_EXPIRED / 401 错误，保留 cause/details，不再被原始 refresh 错误覆盖。
- H-2 / M-6：详情关系查询改为严格 UUID 校验 + entry_id / related_entry_id 两路结构化查询，稳定排序、去重，并能识别超过 200 条关系的截断。
- M-1：历史节点新增结构化 meta.timeline_sort_year；museum.js 优先按数值排序，period 只负责展示。
- M-2：evidence-hub 改用 textContent 创建弹窗内容，并对白名单站内/HTTPS URL 做协议与域名校验。
- M-5：外部图片恢复增加 pagehide AbortController、失败短期负缓存、Met 对象 ID 严格校验，并记录 Commons 候选来源/对象 ID。
- M-7：生产 EXPLAIN 已确认关系查询命中 entry_relations_entry_type_idx、媒体查询命中 partial verified index；公开 entries 列表新增 published_updated 索引。
- H-3：生产新增 media 每条目单主图唯一约束、entry_revisions(entry_id,version) 唯一约束、关系类型索引；review_edit 本身已有行锁+同事务 revision 写入；新增回归测试并在生产事务回滚验证通过。
- SECURITY DEFINER：handle_new_user / review_edit 已撤销 public/anon/authenticated EXECUTE；is_staff 必须继续 SECURITY DEFINER，否则 profiles_staff_select 会导致 RLS 递归，因此该安全边界保留并固定 search_path。
- M-4：TypeScript 数据库/错误/时间轴契约已加强，tsconfig 开启 strict/noImplicitAny/strictNullChecks；当前仍是“类型契约层”，不是整套浏览器 JS 已迁移为 TS。
- Pages smoke 增加 unhandledrejection 检测及时间轴前两节点顺序断言。

## 2026-09-19 — S1/S2/H1-H5/M1-M5 审计修复
- S1 经生产实时核验后，确认当前最终架构不是 media_public view，而是 public.media 的列级匿名 SELECT + RLS；anon 表级 SELECT 被撤销，但安全公开列拥有 column grant，因此直接查询 media 是可用且已通过线上 ACL smoke。knowledge-store 保持直接 media 查询并与生产最终架构一致，不重新引入已验证不可稳定访问的 media_public view。
- S2 新增 canonical public ACL migration：明确 media 仅 approved+verified 可公开，anon 不可读 revisions/edits/favorites/profiles，敏感媒体字段无 anon column grant；新增 public_acl_snapshot.sql。
- H1 馆长后台已按当前生产 schema 重写，不再查询不存在的 confidence/editorial_status/reviewed_at/verification_status 字段或 sources 表；来源从 entries.sources JSONB 派生。
- H2 详情关系查询统一走 JDM_AUTH.request，不再创建第二个 Supabase client/fallback 请求层。
- H3 museum/wiki/timeline 重试初始化加入序列号/observer 清理，避免旧请求覆盖新结果；site-privacy observer 改为单例。
- H4 公共知识查询继续采用服务端分页和稳定排序；后续可进一步拆分列表字段与详情字段。
- H5 PR 校验不再依赖线上 Supabase；生产 ACL smoke 移到 main/post-deploy 路径。
- M1 核心浏览器 JS 开始启用 checkJs，另保留严格 TS contract config。

## Sprint B — 七大知识世界统一入口（2026-09-19）
- 新增 knowledge_worlds 与 entry_worlds，将网站知识世界从 entries.category 中独立出来。
- 149/149 个已发布条目均已挂载一个 primary knowledge world；Phase 2A 后曾为 395 条 mapping。
- 七大知识世界：历史与发展、工艺与技术、器物与美学、窑址与城市空间、人物与传承、文献与研究、现代景德镇。
- 7 个知识世界入口页已接入动态条目浏览器，显示核心条目与跨世界关联入口。
- knowledge-store.js 新增 worlds() / byWorld()；新增 world-browser.js 与 world-browser.css。

## Sprint B Phase 2B — 当前真实状态（2026-09-19）

- 当前生产数据：149 published / 149 primary / 167 secondary / 316 total mappings。
- 149 个已发布条目全部保留且每条恰好一个 primary；无重复 entry-world 边；无 primary cardinality 异常。
- 本轮四个剩余边界已完成逐条语义审校，不再使用 category 自动放行。
- 人物 → 研究：删除郭沫若→研究；其余 12 条保留并改为人物特定的研究入口 rationale。
- 人物 → 工艺：删除刘远长、占绍林、秦锡麟→工艺；其余 10 条保留并改为具体技艺/生产组织入口 rationale。
- 全球窑址/窑业空间 → 研究：删除焦潭柴窑燃料区、长岭瓷石采掘区、高岭土矿采掘区→研究；保留 12 个可形成具体比较研究问题的窑址入口，并逐条重写 rationale。
- 文献 → 工艺：13 条全部保留，逐条改写为材料、成型、烧成、装饰或传承等具体技术入口。
- 文献 → 器物：12 条全部保留，逐条落到器形、纹饰、款识、品类或视觉特征。
- 文献 → 空间：10 条全部保留，逐条落到遗址、城市、矿区—生产中心、保护区或海上贸易网络。
- 历史 → 器物：4 条全部保留，分别落到青白瓷、青花、官窑器物与清代彩瓷/颜色釉。
- 历史 → 空间：5 条全部保留，分别落到考古发掘、五个世界遗产组成部分、城市形成、湖田窑生产空间与御窑厂城市位置。
- 2026 UNESCO 世界遗产决定用于复核五个组成部分、原料/燃料/窑址/生产中心之间的完整生产系统，以及技术演化与空间组织的关系。
- 本轮生产迁移：supabase/migrations/20260919230000_sprint_b_phase_2b_boundary_semantic_audit.sql。
- 下一步不再继续按四个旧边界机械删数量；应进行一次“映射冻结前总体验收”，检查所有 secondary 的解释质量、每条 rationale 的可推荐性，以及跨世界入口是否产生重复/过密路径，再进入 Phase 2B 语义规则冻结与 Phase 3 知识图谱/推荐系统。

## AI 后续工作协议
1. 先读取 .ai/CURRENT_STATE.md、.ai/TASKS.md、.ai/CHANGELOG.md。
2. 涉及映射时先查 production entry_worlds + entries，不要凭旧聊天记录推断数量。
3. 每轮先按 world/category 分组，再抽查 entry 摘要、现有 relations、sources/media 与用户路径。
4. secondary 只有在“从该 world 进入后能解释出一个具体知识问题”时才保留。
5. 删除关系必须可说明原因；新增关系必须有 entry-specific rationale。
6. 每次生产数据变更后必须做：149 primary、primary cardinality、重复边、published coverage、总 mapping 回归。
7. 数据层变更必须同步写入 supabase/migrations/；.ai 记录必须反映真实生产数字。
8. 不修改 entries / entry_relations 主体数据来代替 world 语义治理；Sprint B 这一层只治理 entry_worlds。
9. Phase 2B 完成后再进入知识图谱、推荐系统和相关条目算法，不提前用不稳定的 mapping 做推荐。
