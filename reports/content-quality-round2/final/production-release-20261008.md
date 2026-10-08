# 第二阶段内容治理｜生产发布记录（2026-10-08）

## 生产发布结论

用户已明确授权：只允许最终校对包中 **43条 public.entries** 与 **3条 public.entry_relations.note** 更新，禁止媒体写入及任何新记录。

发布源锁定：
- 最终审核包：[`9c62f8000d9b502a3e26f0f78fe672772afafac1`](https://github.com/justinxyj/jingdezhen-porcelain-wiki/commit/9c62f8000d9b502a3e26f0f78fe672772afafac1)
- 原值及版本化恢复快照：[`copyedit-preflight.json`](copyedit-preflight.json)、[`production-diff.json`](production-diff.json)。
- 数据库项目：`jscttuocrulgpwvsfxou`。

### 执行顺序与结果

1. **备份与恢复条件**：项目所在组织为 Supabase Free 计划，不提供自动每日整库备份。这次使用不可变 GitHub 提交中的 **46条目标记录原值、版本、原始时间和恢复字段**，作为*此次发布涉及字段的定向恢复保障*。这不是完整数据库灾难恢复备份，严禁对外宣称拥有完整备份。
2. **实时原值守卫**：2026-10-08 12:17:29 UTC，在生产库对比 ID/slug、分类、状态、zh/en/ja、sources、version、updated_at，以及3条关系的复合主键、note、created_at、evidence_grade；结果 **43/43 entries + 3/3 relations 均严格一致，0差异**。上述字段覆盖已锁定发布包的全部原始 SHA256 所使用字段。
3. **真实可回滚事务预演**：2026-10-08 12:18:24 UTC，SERIALIZABLE事务中按计划更新43+3，核验43+3新值，按原值恢复43+3，再次验证恢复完整一致，最后明确执行 `ROLLBACK`。预演均成功；未留下持久改动。
4. **正式写入**：2026-10-08 12:20:01 UTC，SERIALIZABLE事务中重新以 `FOR UPDATE` 锁定目标，完整校验原值及版本，再将43条的zh/sources更新为最终稿、version递增、updated_at记录实际发布时间，另仅更新3条关联记录的note。检查43+3更新数量及新值后 `COMMIT`；成功。
5. **独立回读**：2026-10-08 12:20:28 UTC，独立数据库查询核实 **43/43 entries、3/3 relations完全匹配批准稿，错误0**，原有分类、en/ja、status和关系端点等保护字段未改变。表总量 **entries 250、entry_relations 350、media 70**；媒体写入0、新记录0。
6. **旧内容保护**：旧79条百科、65条工序及16条时间轴、22项元数据均未在本次SQL更新范围内，本次43个entries目标与旧79个正文目标无交集；未执行旧160条发布计划重放。

## 恢复保障说明

仅针对这次46条数据：上述固定提交保留发布前的逐字段 `before`、原始版本/哈希与独立现场快照。事务预演已实际测试全量恢复并逐条验证。若以后确需回退，必须先重新读取当前生产行，**只有仍匹配本次发布后的各字段与版本守卫**才按快照恢复；如已发生后续编辑则禁止盲目覆盖。版本、时间及审计轨迹需按现行库机制谨慎处理。这不能替代整库备份或PITR。

## 网站部署

本次提交本发布记录的目的是触发已有 GitHub Pages 工作流：`scripts/generate_entry_pages.py` 从 Supabase 最新公开数据重新生成250个静态条目，随后由已有CI核对SEO、共享Header、单层外框及线上浏览器测试。**本记录建立时，网站部署尚待CI核验；不可预先标记网站已成功上线。**

相关资料：
- [最终审核报告](final-review.md)
- [完整字段差异与恢复原值](production-diff.json)
- [恢复来源快照](copyedit-preflight.json)
