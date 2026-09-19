# Current State

更新时间：2026-09-19
正式项目基线：6a8700b0621b787ecb92df47448df50a4cb9f966

## Sprint B Phase 2B — Final Audit 已完成

- 当前生产数据：149 published / 149 primary / 167 secondary / 316 total mappings。
- 全量 secondary 结构审查完成：按 world/category、entry-specific rationale、跨世界重复入口、单条目多 secondary 密度进行核验。
- 149/149 published entries 均有且仅有一个 primary。
- 重复 entry-world 边：0。
- primary cardinality anomalies：0。
- secondary rationale 为空/过短：0。
- 已清除本轮审查发现的 5 类残留模板化 rationale；不再存在此前的通用模板句。
- 16 个具有 3 条 secondary 的高密度条目已逐条复核；均对应不同知识问题（历史、工艺、研究、空间或器物入口），没有仅因类别相近而机械保留的重复边。
- 本轮没有删除 secondary edge：Final Audit 的结论是当前 167 条 secondary 在结构和语义上均达到冻结门槛；本轮只做 rationale 精确化。
- 新增 migration：supabase/migrations/20260919233000_sprint_b_phase_2b_final_audit_rationale_normalization.sql

## Final Audit 判定

当前 entry_worlds 可以进入“语义冻结”状态。冻结规则：
1. secondary 必须能从目标 world 提出具体知识问题，而不是只满足类别相关。
2. rationale 必须说明“为什么从这个 world 进入此条目”，不得使用纯模板化类别描述。
3. 同一条目允许多个 secondary，但每个 world 必须承担独立知识入口；默认警戒阈值为 3 条以上 secondary，需逐条人工解释。
4. primary 是条目的主叙事归属，不因存在 secondary 而改变。
5. 不以数量最少为目标；只删除缺乏独立知识增益的关系。
6. Phase 3 推荐系统只能消费已冻结 mapping，不得在推荐层重新推断 world 归属。

## 下一阶段

- Phase 2B：语义规则冻结（文档化规则、冻结 entry_worlds 变更门槛）。
- 随后进入 Phase 3：知识图谱与相关条目系统。
