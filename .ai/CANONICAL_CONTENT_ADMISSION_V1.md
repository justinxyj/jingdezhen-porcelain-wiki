# Phase 6B / 6C — Canonical Content Admission v1 与 Entry 内容质量深化

更新时间：2026-09-20

## 1. 阶段结论

Phase 6A 解决的是：

> 149 个 Entry 能不能成为真正的互联网页面。

Phase 6B / 6C 解决的是：

> 这些 Entry 是否已经达到“可被研究者、搜索引擎与 AI 稳定理解和引用”的内容标准。

本轮没有建立第二套事实数据库。新增的 `entry_content_admissions` 只是治理元数据，记录准入、证据和内容质量状态；事实仍以 `public.entries`、`sources`、`media`、World、relations 等现有 canonical 数据为准。

## 2. Canonical Content Admission v1

### 准入标准

每个 published Entry 检查：

1. 独立知识价值
2. 明确实体边界
3. 至少一个来源
4. 来源深度（当前 v1 以 ≥2 个来源作为更强证据信号）
5. 至少一个 Knowledge World
6. 至少一个继续探索出口
7. 正文深度
8. 媒体是否存在 approved + verified 资产
9. 是否存在明显的 Ghost Node / 重复实体风险

### Citation Readiness

- **PASS**：当前正文达到可引用基础，且有至少 2 个来源、正文达到最低深度。
- **REVIEW**：Entry 可以公开存在，但不应把当前正文当作研究型引用的充分依据。
- **BLOCK**：缺少必要实体边界、来源或 Knowledge World；当前生产中无此类 published Entry。

### Content Quality

- **ready**：当前可作为引用基础。
- **develop**：需要继续深化正文、来源层级或研究结构。
- **rewrite**：存在结构性问题，需要重写而不是继续堆字。

## 3. 149 Entry 全量结果

| 指标 | 结果 |
|---|---:|
| published Entry | 149 |
| Canonical Admission | 149 / 149 admitted |
| BLOCK | 0 |
| Citation PASS | 8 |
| Citation REVIEW | 141 |
| Content ready | 8 |
| Content develop | 141 |
| Content rewrite | 0 |
| 有来源 | 149 / 149 |
| 有 Primary World | 149 / 149 |
| 有探索出口 | 149 / 149 |

### 当前真正的瓶颈

不是“Entry 是否存在”，而是：

> **141 个 Entry 仍然只有最低可用内容，尚未达到研究型知识页面的深度。**

这说明下一阶段不应该继续扩充数量，而应该优先把已有 Entry 从：

**可索引**

升级到：

**可理解 → 可引用 → 可继续研究。**

## 4. 当前 Citation PASS

以下 8 个 Entry 已达到当前 v1 的 citation-ready 基础：

- 青花瓷
- 颜色釉瓷
- 粉彩瓷
- 湖田窑
- 御窑厂遗址
- 青白瓷
- 唐英
- 景德镇窑青花莲池纹瓶（Met 1991.253.33）

注意：PASS 不是“学术研究已经完成”，而是“达到当前网站 citation-ready 的最低基础”。

## 5. 本轮已实际深化的核心 Entry

已把以下核心 Entry 从短摘要式正文升级为结构化知识正文：

- 青花瓷
- 御窑厂遗址
- 青白瓷
- 湖田窑
- 粉彩瓷
- 颜色釉瓷
- 唐英
- 《天工开物》
- 《景德镇陶录》
- 郎廷极
- 元青花折枝花纹八棱瓶

正文结构统一引入：

**定义 / 工艺或历史背景 / 研究价值 / 研究边界 / 继续探索**

避免把不确定信息写成确定事实。

## 6. 研究型内容写作规则

以后深化 Entry 不允许：

- 用 AI 常识补齐未知事实；
- 通过关键词堆砌制造 SEO 内容；
- 把一个具体器物推导成整个窑业历史；
- 把督陶官、管理者直接写成器物作者；
- 把来源标题当成事实证据；
- 把单一来源的概括直接升级为确定性学术结论；
- 为了达到字数硬加没有证据的段落。

优先结构：

1. 一句话定义
2. 历史/技术背景
3. 景德镇具体关系
4. 可验证事实
5. 学术争议或研究边界
6. 相关对象/人物/窑址/文献
7. 来源

## 7. 下一轮内容深化队列

优先从以下类型开始：

### 第一批：核心景德镇知识

- 青花瓷
- 御窑厂遗址
- 湖田窑
- 青白瓷
- 高岭土矿采掘区
- 长岭瓷石采掘区
- 焦潭柴窑燃料生产区
- 景德镇手工瓷业遗存
- 元青花
- 明清御窑

### 第二批：核心人物

- 唐英
- 郎廷极
- 年希尧
- 王步
- 黄云鹏
- 王琦
- 王锡良
- 张松茂
- 田鹤仙
- 臧应选

### 第三批：核心器物

- 元青花折枝花纹八棱瓶
- 成化斗彩鸡缸杯
- 宣德青花龙纹盘
- 雍正仿钧新紫釉天球瓶
- Met 1991.253.33

### 第四批：核心文献

- 《景德镇陶录》
- 《天工开物》
- 《陶成纪事碑记》
- 《陶说》
- 湖田窑考古发掘报告
- 御窑遗址考古报告

## 8. 当前明确判断

149 个 Entry **暂时不应该继续机械扩张到 220**。

正确顺序现在是：

**149 Entry**
→ **Citation Admission**
→ **核心 Entry 深化**
→ **来源层级提升**
→ **图片/对象资产提升**
→ **再进入 149 → 220**

这避免出现“500 个页面，但大部分只有一两句话”的低质量扩张。

## 9. 数据库边界

`entry_content_admissions` 是治理表，不是第二事实源。

它不能替代：

- entries
- sources
- media
- knowledge_worlds
- entry_worlds
- entry_relations
- recommendations

任何事实修改仍必须进入 canonical 数据层，并遵守现有来源、关系和 RLS 规则。

## 10. Phase 6B / 6C Done

- [x] 建立 Canonical Content Admission v1
- [x] 149 Entry 全量准入检查
- [x] 149 / 149 有来源
- [x] 149 / 149 有 Primary Knowledge World
- [x] 149 / 149 有探索出口
- [x] 0 BLOCK
- [x] 8 Citation PASS
- [x] 141 Content Develop 队列
- [x] 核心 Entry 内容深化
- [x] 生产 migration 已应用
- [x] GitHub migration 已同步
- [x] 不建立第二事实数据库
- [x] 不修改 World Freeze
- [x] 不修改 Recommendation A+/A Gate
- [x] 不重新打开 Phase 4E

## 11. 下一阶段

下一步不是继续造基础设施。

进入：

**Phase 6C-Content Deepening / Canonical Entry Research Pass**

目标：

> 把 141 个 REVIEW Entry 分批提升到 citation-ready，而不是一次性制造更多 Entry。



> Final verification trigger: Pages deployment must be checked on the latest main SHA after the content-admission migration.
