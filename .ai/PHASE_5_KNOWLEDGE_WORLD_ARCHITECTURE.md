# Phase 5-1 Knowledge World Architecture

更新时间：2026-09-20

## 1. 定位
Phase 5 从“数字博物馆工具层”转向“知识世界体验层”。
目标不是继续增加页面数量，而是让现有 149 个 canonical Entries、7 个 Knowledge Worlds、72 道工序、时间/空间/关系网络形成一套可连续探索的知识世界。

## 2. 最小完整模型

用户面对的不是数据库表，而是一条探索路径：

**景德镇 → 世界 → 时代 / 空间 / 人物 / 工艺 / 器物 / 文献 → Entry → 继续探索**

七大 Knowledge Worlds 仍是认知入口：
1. 历史与发展
2. 工艺与技术
3. 器物与美学
4. 窑址与城市空间
5. 人物与传承
6. 文献与研究
7. 现代景德镇

数字博物馆工具（时间轴、窑址地图、器物图谱、人物数据库、工艺流程、图片馆）不是第八个世界，而是进入/观察这些世界的工具。

知识网络不是第九个世界，而是跨世界连接层。

## 3. 三层架构

### A. World Layer
回答“我正在探索哪个知识领域？”
- 七大世界
- 世界概览
- 代表条目
- 世界内路径

### B. Knowledge Node Layer
回答“这个具体知识是什么？”
- Entry Detail
- 人物、器物、历史、窑址、文献等 canonical entities
- 工艺流程节点
- 时间/空间上下文

### C. Exploration Layer
回答“下一步可以去哪里？”
- 时间
- 空间
- 工艺
- 人物
- 器物
- 文献
- 关系网络
- 推荐/继续探索

## 4. 首页角色
首页不承担完整知识内容，只承担“世界入口”：
- 景德镇知识世界定位
- 七大世界入口
- 时间轴 / 地图 / 器物图谱等工具入口
- 一条示范探索路径
- 全局搜索

用户首次进入首页后，最多 1 次点击即可进入任一世界或核心工具。

## 5. World 页面角色
每个 World 页面统一结构：
1. 世界定义
2. 代表性知识节点
3. 核心主题/分类
4. 时间或空间入口（仅在有数据时显示）
5. 推荐探索路径
6. 进入 Entry
7. 进入全局网络

不为每个 World 再建立第二套实体数据库。

## 6. Entry 页面角色
Entry 是事实汇聚的 canonical destination。
所有人物/器物/历史/窑址/文献关系最终尽量回到 Entry。
页面只显示已有数据；空关系不制造内容。

## 7. 工具层角色
工具负责“观察方式”，不成为新的事实源：
- Timeline = 从时间看世界
- Map = 从空间看世界
- Object Atlas = 从器物看世界
- People = 从人物看世界
- Craft = 从工艺看世界
- Gallery = 从图像看世界
- Search = 从问题进入世界

## 8. Discovery Path
Phase 5 的核心不是页面数量，而是“可连续走通的路径”。

最低验收标准：
- 首页 → World → Entry → 第二个 Entry：≤ 3 次点击
- Timeline/Map/Object/People/Craft → Entry：可达
- Entry → World / Tool / Global Network：可达
- 任一探索路径不需要用户理解数据库结构。

## 9. 不做的事情
Phase 5-1 明确不做：
- 新建第二套实体表
- 为每个关系再做一个独立页面
- 无限增加标签/筛选器
- 为了“全连接”补低价值关系
- 重写已经通过验收的 Phase 4E 工具
- 大规模视觉重构
- 在没有用户价值的情况下继续细分 World

## 10. Phase 5-1 Done Criteria
- [x] 七大 World / 工具层 / 网络层职责明确。
- [x] Entry 作为 canonical destination。
- [x] 三层架构确定。
- [x] 首页、World、Entry、Tool、Network 的角色边界确定。
- [x] 全项目“够用即收口”原则继承。
- [ ] 第一条端到端 Knowledge World 路径实现并通过 Pages browser smoke。
