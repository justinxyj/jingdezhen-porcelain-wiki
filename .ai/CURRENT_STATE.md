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

## Sprint B — 七大知识世界统一入口
- 新增 knowledge_worlds 与 entry_worlds，将网站知识世界从 entries.category 中独立出来。
- 149/149 个已发布条目均已挂载一个 primary knowledge world。
- Phase 2A 完成后曾有 395 条 mapping；Phase 2B 深层语义审校后收敛为 **375 条 mapping（149 primary + 226 secondary）**。
- 375 条关系保持：149/149 published entries 有且仅有一个 primary；无重复 entry/world 边。
- 7 个知识世界入口页已接入动态条目浏览器，显示核心条目与跨世界关联入口。
- knowledge-store.js 新增 worlds() / byWorld()；新增 world-browser.js 与 world-browser.css。

## Sprint B Phase 2B — 深层语义审校
- 以“用户是否值得从该知识世界进入此条目”为 secondary 的准入标准，不再按数据库 category 批量保留。
- 删除 20 条低价值 secondary：
  - 现代人物 → 历史：8 条（现代艺术/研究/题字关联不足以成为历史世界入口）。
  - 人物 → 器物：11 条（当前没有对应具体器物条目可继续进入；唐英的有效人物—器物入口保留）。
  - 现代人物 → 研究：田汉 1 条（文化传播关联不足以构成研究入口）。
- 保留历史人物、文献、窑址等能够形成明确跨世界阅读路径的关系，即使当前 entry_relations 尚未完全补齐；secondary 是“编辑语义入口”，不是机械复制 relation 表。
- 对 12 条原本使用通用 rationale 的关系改成具体语义理由，避免把“因为主题相关”当成关系依据。
- 当前三条 secondary 最多的条目均经过复核：青花/颜色釉/粉彩/青白瓷、代表性器物、历史节点、唐英、UNESCO 2026 等，均能形成清晰的跨世界阅读路径。
- UNESCO 2026 遗产资料复核确认：景德镇手工瓷业遗存于 2026 年列入世界遗产，五个组成部分共同体现 10—19 世纪手工瓷业的生产、原料、窑炉及空间/社会组织，因此相关 History / Space / Research secondary 入口保留。 

## 下一阶段
- Sprint B Phase 2C：继续逐组审查“人物—历史”“全球窑址—历史”“文献—主题世界”边界，并开始补真正缺失的跨世界边。
- 之后进入 Sprint C：数字博物馆工具层统一。
