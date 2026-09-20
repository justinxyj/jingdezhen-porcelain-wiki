# Phase 7.4 — Research Corpus Claim-by-Claim Evidence Synthesis

更新时间：2026-09-20

## 目标

对 39 个 Research Corpus Entry 的当前正文逐条建立：

**Claim → Evidence → Source → Evidence Type → Confidence → Boundary**

本阶段不是继续扩充 Entry，也不是把学术研究文章直接升级为“事实数据库”。

## 39/39 完成

每个 Research Corpus 已写入 `entry_content_admissions.claim_evidence_map`，版本为 `phase7.4-claim-by-claim-v1`。

### Claim 类型

- `archaeological_fact`：考古发掘可报告的遗迹、遗物、地层、窑址等。
- `official_or_documentary_record`：政府、遗产管理、地方志等机构记录。
- `primary_text_or_historical_testimony`：历史文本本身的陈述。
- `institutional_record_with_comparative_interpretation`：馆藏/机构记录与跨文化解释混合。
- `scholarly_interpretation`：现代论文、研究者提出的解释或分期。
- `scholarly_or_biographical_record`：学术史人物、著作及其研究活动记录。
- `bibliographic_primary_target`：只确认原始报告/书目的存在，尚未完成正文级核验。

## 证据边界

### 考古事实
只能把考古报告实际记录的遗迹、遗物、层位、发掘面积、器物类型等作为事实层。

不能直接从“出土”推出：
- 技术传播方向
- 因果关系
- 某人制作某器物
- 文明影响范围

### 历史文献
必须区分：

> “某历史文本这样记载”

与：

> “现代研究已经证明该记载完全正确”。

前者属于 primary text / historical testimony，后者需要独立证据。

### 现代学术研究
论文中的分期、解释、因果关系、传播模型属于作者/研究传统的解释。

因此当前默认：

**有研究 ≠ 已成为无争议事实。**

### 馆藏记录
馆藏记录可证明：
- 对象存在于馆藏记录中
- 馆方给出的年代、材质、类别、来源信息

但不能自动证明：
- 更大的传播史
- 制作者身份
- 技术来源
- 文明影响

## Confidence

- high：直接考古、官方文件、原始文本、馆藏记录等。
- medium：现代学术研究、学术史、跨文化解释。
- low：目前只有书目/档案目标，尚未完成正文级核验。

## 当前状态

- Published: 250
- Canonical-eligible: 220
- Knowledge Nodes: 30
- Citation-ready PASS: 181
- REVIEW: 69
- Research Corpus: 39
- Research Corpus claim synthesis: **39/39**
- Primary Evidence mapped: 37
- Bibliographic primary target: 2
- target_defined: 0
- BLOCKED: 0

## 当前结论

Phase 7.4 的第一轮 Claim Evidence Matrix 已完成。

但 **39 个 Research Corpus 仍保持 REVIEW**。

下一步不是因为有证据就批量升格，而是针对：
1. medium confidence claims
2. low confidence claims
3. 跨区域传播/影响类 claims
4. 需要第二独立证据的 claims

进行 **Evidence Triangulation / Dispute QA**。

220 → 320 继续冻结。
