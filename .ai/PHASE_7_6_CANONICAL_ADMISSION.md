# Phase 7.6 — Canonical Admission Decision

更新时间：2026-09-20

## Gate result

对39个已完成 Claim Evidence Matrix + Triangulation + Dispute QA 的 Research Corpus 逐条做 Canonical Admission。

### Final decision

- **9 → Canonical Entry**
- **24 → Research Corpus**
- **6 → Knowledge Node**
- **0 → 删除/合并**

### Canonical Entry（9）

1. `arita-kiln` — 有田窑·有田烧
2. `bat-trang` — 巴特朗陶窑
3. `iznik-ceramics` — 伊兹尼克陶器
4. `sawankhalok` — 宋加洛窑·Si Satchanalai
5. `seto-kiln` — 濑户窑
6. `yixing-kiln` — 宜兴窑
7. `tao-shuo` — 《陶说》
8. `jean-baptiste-du-halde` — Jean-Baptiste du Halde（杜赫德）
9. `zhu-yan` — 朱琰

这些对象满足：
- 有独立实体价值；
- 可从景德镇知识世界继续探索；
- 存在稳定机构/馆藏/原始文献证据；
- 能清楚区分事实与解释；
- 不依赖“同风格/同年代”推断关系。

### Research Corpus（24）

保留为研究材料、考古报告、地方志、专题研究或尚需继续论证的研究对象：

`r01,r02,r03,r06,r07,r08,r09,r10,r11,r13,r16,r17,r18,r21,r22,r24,r25,r27,r29,r30,r33,r34,r35` 以及 `josiah-wedgwood`。

特别说明：
- r01/r08 仍有 primary bibliographic target 边界；
- r11 二元配方属于明确学术争议；
- r09/r10/r17/r35 的分期/解释仍需归因；
- r18 的“海上丝绸之路”是宏观框架，不能由单一外销瓷证据替代完整贸易网络证据；
- r25/r27/r29/r30 区分材料科学证据与技术来源/艺术风格解释。

### Knowledge Node（6）

`joseph-needham`, `mikami-tsugio`, `pilgrim-art`, `rl-hobson`, `robert-finlay`，以及在本门禁中被保留为关系/学术史背景节点的 `josiah-wedgwood`。

> 注意：Josiah Wedgwood 的档案证据目前仍不足以支持当前独立 Canonical Entry；因此最终节点级处理优先于继续用低置信度材料扩写。

## Correction

由于治理更新必须保证互斥分类，最终数据库中应满足：
- 9 Canonical
- 24 Research Corpus
- 6 Knowledge Node

## 当前生产统计

- Published Entries: 250
- Canonical-eligible: 190
- Knowledge Nodes: 36
- Research Corpus: 24
- Citation-ready PASS: 190
- REVIEW: 60
- BLOCKED: 0

这里的变化不是“删除内容”，而是把原先的39条Research Corpus重新分层。

## Admission principle

### Canonical Entry
独立实体价值 + 稳定证据 + 明确边界 + 可作为用户知识入口。

### Research Corpus
资料价值高，但当前主体是研究报告、专题研究、争议问题或仍需要继续综合。

### Knowledge Node
存在明确关联价值，但当前更适合承担人物/学术史/关系/背景导航，不应通过证据填充强行升级。

## Frozen

- 不启动220 → 320。
- 不新建第二事实数据库。
- 不把Research Corpus的研究结论自动事实化。
- 不因为跨区域相似就推断传播。
- 不因为同一时期/风格就推断作者或技术来源。
