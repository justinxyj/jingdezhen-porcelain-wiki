# Knowledge World Semantic Freeze Rules

更新时间：2026-09-19

## 1. 文档目的

本文件是 Sprint B Phase 2B 完成后的知识世界语义冻结规则。

它约束 `knowledge_worlds` 与 `entry_worlds` 的编辑方式，并作为 Phase 3 知识图谱、相关条目与推荐系统的语义底座。

本规则不改变 `entries.category`，也不替代 `entry_relations`。

---

## 2. 当前冻结基线

- Published entries：149
- Primary mappings：149
- Secondary mappings：167
- Total entry-world mappings：316
- Duplicate entry-world edges：0
- Primary cardinality anomalies：0
- Weak secondary rationales：0
- Generic rationale templates remaining：0

因此，当前 `entry_worlds` 进入 **Semantic Freeze** 状态。

“冻结”不是禁止修改，而是要求所有后续修改经过本文件规定的语义门槛。

---

## 3. Primary 规则

每个 published entry 必须且只能有一个 primary world。

Primary 表示：

> “如果用户只能从一个知识世界认识这个条目，它最应该首先属于哪里？”

Primary 不表示条目的全部知识内容。

因此：

- 一个条目可以拥有多个 secondary；
- secondary 不得反向改变 primary；
- 不得为了让某个 world 的数量好看而移动 primary；
- 如果 primary 发生变化，必须说明为什么条目的主叙事归属发生了变化。

---

## 4. Secondary 准入规则

一个 secondary 只有同时满足以下条件才允许存在：

### 4.1 具体知识问题

用户从目标 world 进入该条目后，能够自然形成一个具体问题。

例如：

- 从“工艺与技术”进入某件青花器物，可以问：它的青花绘制、胎釉和烧成有什么特点？
- 从“历史与发展”进入青花瓷，可以问：青花瓷如何参与元明时期景德镇生产与贸易体系？
- 从“文献与研究”进入一件馆藏器物，可以问：有哪些馆藏记录、图录或研究证据支持对它的年代和特征判断？

不能仅因为“它也和这个类别有关”就建立 secondary。

### 4.2 独立知识增益

secondary 必须提供 primary world 之外的独立理解路径。

如果两个 secondary 实际上只是回答同一个问题，应删除其中重复的一条。

### 4.3 Entry-specific

每条 secondary 必须针对具体 entry 写 rationale。

禁止只写：

- “该条目与工艺相关。”
- “该条目也具有历史价值。”
- “该条目可以用于研究。”
- “该器物涉及材料、技术和历史。”

必须明确：

> 为什么从这个 world 进入这个具体条目，以及用户能得到什么新的知识。

---

## 5. 多 Secondary 规则

同一 entry 可以拥有多个 secondary。

但每增加一个 world，都必须回答：

> “这个 world 提供了什么其他 world 无法替代的入口？”

### 高密度警戒

- 0–2 个 secondary：正常。
- 3 个 secondary：允许，但必须逐条人工解释。
- 4 个及以上：默认进入专项审查。

数量本身不是删除理由。

只有当新增 secondary 缺乏独立知识增益时，才删除。

---

## 6. Rationale 规范

推荐格式：

> “从【目标 World】进入，可以通过【具体知识对象/问题】理解【独立知识价值】。”

Rationale 应该尽量包含：

1. 具体对象；
2. 具体知识问题；
3. 与目标 World 的关系；
4. 独立于 primary 的知识价值。

禁止模板化批量生成。

---

## 7. 七大 World 边界

### 历史与发展

关注：

- 年代变化
- 窑业制度
- 城市形成
- 产业演变
- 生产与贸易史
- 社会、制度与技术史

不是“所有有年代的东西”。

### 工艺与技术

关注：

- 原料
- 胎釉
- 成型
- 装饰
- 烧成
- 窑炉
- 生产组织
- 技术传承

不是“所有和陶瓷有关的东西”。

### 器物与美学

关注：

- 器形
- 纹饰
- 款识
- 色彩
- 审美
- 品类
- 具体馆藏与器物个案

### 窑址与城市空间

关注：

- 窑址
- 采掘区
- 燃料区
- 生产中心
- 城市空间
- 遗产组成部分
- 运输与贸易空间

### 人物与传承

关注：

- 工艺人物
- 历史人物
- 研究者
- 传承人
- 人物对知识、工艺或制度的具体贡献

### 文献与研究

关注：

- 文献
- 地方志
- 考古报告
- 论文
- 馆藏记录
- 研究证据
- 研究方法与学术问题

### 现代景德镇

关注：

- 当代产业
- 城市发展
- 文旅
- 教育
- 当代陶瓷生态
- 世界遗产保护与当代实践

---

## 8. 边界冲突处理

当一个 entry 同时适合多个 World 时：

1. 先判断 primary 的主叙事；
2. 再判断 secondary 是否提供独立问题；
3. 不使用 category 自动放行；
4. 不以“这个 entry 很重要”为理由建立 secondary；
5. 如果两个 World 的入口实际上相同，只保留更有知识增益的一条。

---

## 9. 推荐系统使用规则

Phase 3 的相关条目和推荐系统：

- 可以使用冻结后的 primary/secondary world mapping；
- 可以使用 entry_relations；
- 可以组合 world + relation + category + source 等信息；
- 不得在推荐层重新猜测 entry 属于哪个 World；
- 不得把“数据库存在关系”直接等同于“用户应该推荐”。

推荐解释必须能够回答：

> “为什么这个条目会出现在这里？”

推荐理由应优先引用：

1. 相同知识世界；
2. 明确 secondary world；
3. 具体 entry relation；
4. 明确的知识问题/主题重合。

---

## 10. 后续变更门槛

任何新增、删除或改变 `entry_worlds` 的生产变更，必须：

1. 说明 entry；
2. 说明 target world；
3. 说明 primary/secondary；
4. 给出 entry-specific rationale；
5. 说明用户从该 World 进入后的具体知识问题；
6. 说明是否产生与现有 secondary 的重复入口；
7. 写入 `supabase/migrations/`；
8. 更新 `.ai/CURRENT_STATE.md`、`.ai/TASKS.md`、`.ai/CHANGELOG.md`；
9. 完成生产回归：
   - published coverage
   - primary = 149
   - primary cardinality
   - duplicate edges
   - total mappings
   - rationale 完整性

---

## 11. Phase 2B 完成定义

满足以下条件后，Phase 2B 才算完成：

- [x] 四个边界完成逐条语义审校
- [x] 316 条 mapping 完成冻结前全量总审
- [x] 167 条 secondary 均通过语义门槛
- [x] rationale 无明显模板化残留
- [x] 高密度条目完成专项复核
- [x] 149/149 primary
- [x] 0 duplicate entry-world edges
- [x] 0 primary cardinality anomalies
- [x] Semantic Freeze 规则固化

Phase 2B 到此结束。

下一阶段进入：

**Phase 3 — 知识图谱、相关条目与可解释推荐系统。**
