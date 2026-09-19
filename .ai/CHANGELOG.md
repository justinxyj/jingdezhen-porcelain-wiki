# Changelog

## 2026-09-19 — Sprint B Phase 2B Final Audit

- 对 316 条 production mapping 完成冻结前全量语义总审。
- 审查维度：world/category 分布、entry-specific rationale、跨世界重复路径、secondary 密度、primary/secondary 边界。
- 发现 16 个条目各有 3 条 secondary；逐条复核后确认分别承担独立的历史、工艺、研究、空间或器物入口，没有发现应因“过密”而删除的关系。
- 发现剩余 5 类模板化 rationale：craft→历史、craft→器物、history→器物、history→文献、research→器物，并补充 contemporary 两条近现代历史入口理由。
- 本轮共精确化 44 条 rationale；没有新增或删除 secondary edge。
- Final Audit 回归：149 published / 149 primary / 167 secondary / 316 total；重复 entry-world 边 0；primary cardinality anomalies 0；weak rationale 0；generic rationale 0。
- 新增 migration：supabase/migrations/20260919233000_sprint_b_phase_2b_final_audit_rationale_normalization.sql。
- Final Audit 通过，entry_worlds 达到语义冻结门槛。
- 下一步：正式固化 Phase 2B semantic freeze 规则与变更门槛，然后进入 Phase 3 知识图谱与相关条目。

