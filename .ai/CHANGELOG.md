# Changelog

## 2026-09-19 — AI memory bootstrap on formal baseline
- Confirmed 6a8700b is the requested formal project baseline.
- Created durable .ai project-memory files.
- No production Supabase change in the memory bootstrap.

## 2026-09-19 — Phase 1 takeover audit
- Verified live Supabase production state.
- Confirmed Phase B public-read RLS is active for the core knowledge layer.
- Confirmed anon cannot execute is_staff().
- Confirmed 149 published entries, 133 media records, 72 craft processes and 71 process relations.
- Confirmed G29 dynamic content exists in production.

## 2026-09-19 — Internal media-candidate security fix
- Enabled RLS on public.craft_media_candidates.
- Enabled RLS on public.timeline_media_candidates.
- Revoked table privileges from public, anon, and authenticated.
- Verified anon/authenticated SELECT and INSERT are denied.
- Added migration supabase/migrations/20260919090000_secure_media_candidate_tables.sql to GitHub main.
- Security Advisor now reports only INFO for these two tables (RLS enabled with no policies), plus pre-existing function/auth WARNs.

## 2026-09-19 — 第三轮上线验收：图片与引用残留修复
- 用户真实上线截图发现大量卡片/详情图片破损，确认生产媒体中存在无效 The Met /???/main-image 路径。
- museum-images.js 增加动态图片错误恢复：The Met Object API → Wikimedia Commons → 明确占位图，并覆盖异步新增 DOM。
- 修复现代景德镇四个页面残留的内部 cite 标记，统一改为正常 UNESCO 资料链接。

## 2026-09-19 — 第三轮：媒体审核边界与前端韧性
- 生产 media 公共 RLS 从仅 status='approved' 收紧为 status='approved' AND review_state='verified'。
- 普通 authenticated 用户插入媒体时只能写 pending/pending、verified_at=NULL、is_primary=false；staff 保留审核态写入能力。
- 新增 public.media_public 公共视图，仅暴露公开网页需要的媒体字段；anon 撤销 media 表 SELECT，公共网页改读视图。
- knowledge-store.js 改为显式 error 状态、10 秒请求超时，并对详情页使用按 slug 定向查询。
- wiki-enhancements.js 增加核心加载错误与关系加载失败的用户提示及重试；关系查询上限 100。
- museum-images.js 增加 8 秒超时、一次有限重试、缓存去重与最多 3 路并发。
- site-privacy.js 删除通用文本匹配删除 DOM 的逻辑；timeline-interactive.js 改为只处理新增节点。
- Validate #85 与 Pages #369 均成功。

## 2026-09-19 — 审计问题 H-1/H-2/H-3/M-1~M-7 修复
- 认证刷新失败不再覆盖 AUTH_EXPIRED。
- 关系查询改为 UUID 校验、双索引路径、稳定排序、去重和截断提示。
- 历史时间轴加入结构化 timeline_sort_year。
- evidence-hub 改为安全 DOM 渲染。
- 外部图片恢复增加页面生命周期中止、负缓存和对象 ID 校验。
- 生产增加主媒体唯一性、revision 版本唯一性和关系类型索引，并通过事务回归测试。
- strict TypeScript contract 层增强。
- Pages smoke 增加 unhandledrejection 与历史顺序检查。

## 2026-09-19 — S1/S2/H1-H5/M1 审计修复
- 以生产实时权限为准建立 canonical public ACL。
- 馆长后台查询与生产 schema 对齐。
- 详情页统一认证请求层，修复重复 client。
- 重试、MutationObserver 生命周期加固。
- PR 不再依赖线上 Supabase；main/post-deploy 执行公开 ACL smoke。
- 核心 JS 开启 checkJs，strict contracts 保持独立。

## 2026-09-19 — Sprint B / 七大知识世界统一入口
- Added editorial knowledge_worlds + entry_worlds layer independent from entry categories.
- Mapped all 149 published entries; 406 primary/secondary mappings currently exist.
- Connected all seven world landing pages to live world-aware entry browsing.
- Refreshed generated Supabase TypeScript contracts.

## 2026-09-19 — Sprint B Phase 2B / 深层语义审校
- 以“secondary 是否值得用户从该知识世界进入”为准入标准，完成第一轮深层语义清洗。
- 生产 secondary 从 246 条收敛为 223 条；总 mapping 从 395 收敛为 372 条。
- 删除 23 条低价值关系：现代人物→历史 8、人物→器物 11、现代人物→研究 1、现代荣誉/纪念性人物→现代景德镇 3。
- 保留具有明确解释路径的历史人物、工艺人物、代表性器物、研究文献、历史节点和全球窑址/陶瓷空间。
- 精修 12 条过于通用的 rationale，改为具体用户入口价值。
- 生产校验：149 published / 149 primary / 226 secondary；无重复 entry-world 边；无 primary cardinality 异常。
- 新增迁移：supabase/migrations/20260919193000_sprint_b_phase_2b_semantic_cleanup.sql
- 新增迁移：supabase/migrations/20260919194000_sprint_b_phase_2b_rationale_precision.sql

## 2026-09-19 — Sprint B Phase 2C / 人物→历史、全球窑址→历史深审
- 完成生产层逐条深审并应用 migration `supabase/migrations/20260919213000_sprint_b_phase_2c_people_history_global_kiln_history.sql`。
- 人物→历史 secondary：37 → 9；全球窑址/空间→历史 secondary：41 → 17。
- 总 mapping：372 → 320（149 primary + 171 secondary）。
- 删除主要为“人物身份/年代本身不构成历史入口”以及“全球区域比较节点过宽”的关系。
- 为保留历史入口重写 entry-specific rationale，消除模板化理由。
- 完成 production mapping/cardinality 回归：149 published、149 primary、171 secondary，primary cardinality 无异常。
- UNESCO 2026 与有田资料用于复核景德镇产业链、东亚技术/贸易史桥接；Frank B. Lentz 调整为 research 入口而非 history 入口。

## 2026-09-19 — Sprint B Phase 2B 深层语义续审
- 以“是否值得用户从该知识世界进入”作为 secondary 唯一准入原则继续清洗生产层。
- 当前生产：149 published / 149 primary / 174 secondary / 323 total mappings。
- 删除 4 条弱入口：杜重远→工艺、景德镇窑→研究、马基利→研究、濑户窑→历史。
- 新增 8 条明确入口：6 条核心生产链窑址→工艺、r11→空间、r18→空间。
- 继续精修人物→历史与人物→工艺的 entry-specific rationale。
- 生产回归：published coverage 149/149、primary 149/149、无重复 entry-world 边、无 primary cardinality 异常。
- GitHub migration：supabase/migrations/20260919220000_sprint_b_phase_2b_deep_semantic_pass.sql
- 下一步进入四个剩余边界的逐条语义审校。

## 2026-09-19 — Sprint B Phase 2B 四边界逐条语义审校完成
- 对当前 production secondary 做四个剩余边界的逐条复核：
  1. 人物 → 研究 / 工艺；
  2. 文献 → 器物 / 工艺 / 空间；
  3. 全球窑址/窑业空间 → 研究；
  4. 历史 → 器物 / 空间。
- 删除 7 条低价值 secondary：
  - 郭沫若 → 研究；
  - 刘远长、占绍林、秦锡麟 → 工艺；
  - 焦潭柴窑燃料生产区、长岭瓷石采掘区、高岭土矿采掘区 → 研究。
- 保留并逐条重写：
  - 人物→研究 12 条；
  - 人物→工艺 10 条；
  - 比较研究型窑址→研究 12 条；
  - 文献→工艺 13 条；
  - 文献→器物 12 条；
  - 文献→空间 10 条；
  - 历史→器物 4 条；
  - 历史→空间 5 条。
- 本轮没有新增 secondary；目标是收敛泛化关系、保留可解释入口。
- 生产回归：149 published / 149 primary / 167 secondary / 316 total mappings；重复 entry-world 边 0；primary cardinality anomalies 0。
- 新增迁移：supabase/migrations/20260919230000_sprint_b_phase_2b_boundary_semantic_audit.sql
- 2026 UNESCO 世界遗产决定用于复核五个组成部分及原料、燃料、窑址、生产中心、运输和技术演化之间的整体生产系统关系。
- 四个边界现已完成；下一步是映射冻结前总体验收，不应再机械按 category 批量删除。



## 2026-09-19 — Sprint B Phase 2B Final Audit

- 对 316 条 production mapping 完成冻结前全量语义总审。
- 发现并清理 5 类残留模板化 rationale：craft→历史、craft→器物、history→器物、history→文献、research→器物；同时精确化 2 条 contemporary 入口理由。
- 本轮共精确化 44 条 rationale；没有新增或删除 secondary edge。
- 16 个条目各有 3 条 secondary，逐条复核后确认承担不同知识问题，无需机械降密度。
- Final Audit 回归：149 published / 149 primary / 167 secondary / 316 total；重复 entry-world 边 0；primary cardinality anomalies 0；weak rationale 0；generic rationale 0。
- 新增 migration：supabase/migrations/20260919233000_sprint_b_phase_2b_final_audit_rationale_normalization.sql。
- Final Audit 通过，entry_worlds 达到语义冻结门槛。
- 下一步：正式固化 Phase 2B semantic freeze 规则与变更门槛，然后进入 Phase 3 知识图谱与相关条目。


## 2026-09-19 — Phase 2B Semantic Freeze 正式固化
- 新增 `.ai/SEMANTIC_FREEZE_RULES.md`。
- 固化 Primary / Secondary / rationale / 多世界密度 / World 边界 / 推荐系统 / 后续生产变更门槛。
- Phase 2B Final Audit 至此完成，316 mappings 进入 Semantic Freeze。
- 下一阶段：Phase 3 知识图谱、相关条目与可解释推荐系统。


## 2026-09-19 — Phase 3A / 知识图谱节点与边统一模型
- 建立 public.knowledge_graph_nodes 与 public.knowledge_graph_edges 两个 security_invoker 只读视图。
- 将 entry、knowledge world、category、source、verified public media、72 craft_process、50 timeline context 统一为节点。
- 将 entry_worlds、entry_relations、entry_craft_processes、craft_process_relations、timeline、media/source 等关系统一为边；保留 world rationale。
- source 节点按 URL 去重，并补齐条目、媒体、工序、时间轴四类来源通路。
- docs/javascripts/knowledge-store.js 新增 graph()，网站可按 nodeType/nodeId 获取图谱节点或局部邻域。
- 生产验证：485 nodes、1,378 edges、0 orphan edges；Phase 2B 仍为 149 primary + 167 secondary = 316 mappings。
- 新增 migration：supabase/migrations/20260919131220_phase_3a_unified_knowledge_graph_views.sql
- 新增 migration：supabase/migrations/20260919132000_phase_3a_source_node_completion.sql
- 新增 .ai/PHASE_3A_KNOWLEDGE_GRAPH_MODEL.md


## 2026-09-19 — Phase 3B / 相关条目候选生成与可解释推荐
- 建立 public.knowledge_recommendations security_invoker 视图。
- 推荐来源分三层：直接知识边、共享知识世界、共享工艺流程；直接关系优先级高于桥接关系。
- 每条候选保留 target、关系类型、reason、weight；同一 source/target 只保留最高优先级路径。
- 新增 knowledge-store.js recommendations()，网站可以按 entryId 读取有限数量的相关条目。
- 生产验证：12,140 条去重候选；Phase 2B 的 149 primary + 167 secondary = 316 mappings 未改变。
- 当前仍未将推荐卡片直接插入页面；本阶段完成的是“推荐引擎数据层 + 可解释理由接口”。


## Phase 3B-2 — 推荐质量审校（2026-09-19）
- 完成分层压力测试：人物、历史、器物、窑址、文献等类别均抽样检查实际推荐结果。
- 发现“共享 World”不能直接作为相关推荐：会把同一研究世界的大量人物/文献/窑址互相批量推荐，知识上虽同域但用户路径过宽；已从最终 recommendation view 移除，仅保留在知识图谱/探索层。
- 发现“共享 craft_process”也不能直接作为相关推荐：当前 entry_craft_processes 中大量历史条目共享工艺流程，直接会产生“两个历史时期因为共同工序而互推”的误导；已从最终 recommendation view 移除。
- 发现 entry_relation 中大量 person/kiln/related 关系的 note 是通用占位描述；这些关系不再自动进入相关推荐。仅保留 source/object，或具有明确、非通用说明的 person/kiln/related 关系。
- 最终生产推荐池收敛为 8 条高置信候选：3 source、3 object、1 related、1 kiln；这是质量门槛结果，不追求数量。
- recommendation view 仍保持 security_invoker；Phase 2B 的 316 条 World mappings 未修改。
- 新增 migration：supabase/migrations/20260919140000_phase_3b2_recommendation_quality_gate.sql。
- 下一步应补充更细粒度、entry-specific 的关系证据后再扩大推荐池；不要通过放宽共享 World/共享工艺规则来凑数量。


## 2026-09-19 — Phase 3B-3 / 高质量关系证据扩充启动
- 不放宽 Phase 3B-2 的推荐质量门槛，也不恢复 shared World / shared craft_process 推荐。
- 从现有 person/kiln/related 关系中筛选具有明确 entry-specific 事实依据的关系，先完成 4 条高置信证据补强：王步→青花瓷、田鹤仙→粉彩瓷、张松茂→粉彩瓷、唐英→御窑厂遗址。
- 证据分别核对景德镇皇窑陶瓷艺术博物馆、文化和旅游部恭王府博物馆/景德镇中国陶瓷博物馆、现有条目定位、故宫博物院资料。
- 生产关系 note 已更新；对应 migration：`supabase/migrations/20260919210000_phase_3b3_relation_evidence_expansion.sql`。
- 本阶段原则：先证据、后扩容；没有明确事实依据的关系继续留在图谱/探索层，不为了增加推荐数量强行补理由。


## 2026-09-19 — Phase 3B-3 第二轮 / 证据可得性筛选
- 对人物→器物、人物→窑址、历史→器物、历史→窑址弱关系进行第二轮证据筛选。
- A 类新增/精修 6 条 entry-specific evidence：王琦→粉彩瓷、唐英→粉彩瓷、明：御窑厂与官作体系→青花瓷、清：御窑/彩瓷与颜色釉→粉彩瓷、明：御窑厂与官作体系→御窑厂遗址、清：御窑/彩瓷与颜色釉→御窑厂遗址。
- C 类删除 3 条时间上不可能成立的历史→御窑厂遗址关系：东晋—唐、五代—宋、元→明清御窑厂遗址。故宫资料记载御窑厂始建于明洪武二年（1369）。
- B 类关系暂不进入推荐：即便知识上可能相关，只要当前没有足够 entry-specific 证据，继续保留在事实图谱层。
- 生产回归：149 entries、149 primary、167 secondary、316 total mappings；recommendation pool 68，其中 person 6 / kiln 3 / related 3 / source 3 / object 3。
- migration：supabase/migrations/20260919223000_phase_3b3_round2_evidence_screening.sql


## 2026-09-19 — Phase 3B-3 第三轮：证据等级化与人物关系深审
- 在 entry_relations 增加 evidence_grade：A+ / A / B / C / D。
- 将证据判断从 note 长度升级为证据等级；knowledge_graph_edges 将等级写入 metadata，knowledge_recommendations 只允许 A+ / A。
- 清理人物→器物 / 人物→窑址的通用占位关系，避免“人物—知识关联”继续伪装成可解释推荐。
- 新增唐英→雍正仿钧新紫釉天球瓶的人物→器物关系，证据等级 A；故宫博物院资料同时提供该器物的清代御窑背景与唐英督陶事实。citeturn0search5turn0search1
- 将张松茂→粉彩瓷降为 B：现有条目语义支持关系，但当前没有足够 entry-specific 的外部证据支撑推荐级 A。
- 故宫博物院资料确认郎廷极与郎窑红釉之间存在直接命名与督陶关系，可作为后续 A+/A 具体器物关系扩充的证据方向。citeturn1search0turn1search1
- 新增 migrations：20260919235000_phase_3b3_round3_evidence_grades.sql、20260919235500_phase_3b3_round3_graph_evidence_metadata.sql、20260919235600_phase_3b3_round3_grade_calibration.sql。


## 2026-09-20 — Phase 3B-3 第四轮：A+ 高价值关系
- 新增/校正 4 条 A+ 关系：郎廷极→御窑厂遗址、年希尧→御窑厂遗址、臧应选→御窑厂遗址、黄云鹏→青花瓷。
- 郎廷极的 A+ 证据来自故宫博物院郎窑红梅瓶条目：郎窑红因康熙时期御器厂督陶官郎廷极得名；故宫展览资料同时将臧应选、郎廷极、年希尧、唐英列为清代景德镇御窑督陶官。citeturn0search0turn1search6
- 黄云鹏的 A+ 证据来自文化部非遗资料：明确记载其从事青花瓷创作、仿古瓷及古陶瓷研究，并列出“元青花三顾茅庐纹罐”等代表作品。citeturn0search4
- 本轮没有为了制造 A+ 而把“人物→粉彩瓷”等泛关系升级为具体器物关系；当前数据库缺少部分应有的具体作品节点，因此暂不伪造目标节点。
- 新增 migration：supabase/migrations/20260920002000_phase_3b3_round4_high_value_relations.sql
