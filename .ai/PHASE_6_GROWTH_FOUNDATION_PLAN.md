# Phase 6 — Growth Foundation / 增长基础设施计划

更新时间：2026-09-20

## 0. 阶段定位

Phase 5-2 已正式关闭。本计划不是重新打开 Phase 5-2，而是新的工作块：

**Phase 6：Growth Foundation / 增长基础设施**

核心战略：

> **引擎已经够用，下一阶段开始铺高速公路。**

项目当前的主要瓶颈已经从知识底层架构转向：
- Entry 内容规模
- 独立可搜索入口
- 页面可索引性
- 对象级内容质量
- 图片资产
- 英文/日文国际化
- 外部引用与传播
- 真实用户行为数据

因此，暂不直接把 149 个 Entry 粗暴扩张到 500，而是先让现有 149 个 Entry 成为真正独立、可搜索、可引用、可分享的互联网知识入口。

## 1. 用户最终看到什么

用户不再只能从首页进入项目。

未来用户可以通过 Google/Bing/其他搜索、外部引用、社交分享、机构网站链接直接进入某一个 Entry，例如：
- 景德镇
- 青花瓷
- 御窑厂遗址
- 湖田窑
- 唐英
- 王步
- 成化斗彩鸡缸杯

进入 Entry 后，可以继续沿：
**Entry → Knowledge World → 时间 / 空间 / 工艺 → 相关 Entry → Knowledge Network**

形成“搜索进入、知识停留、继续探索”的闭环。

## 2. Phase 6A — Entry SEO / Indexability Foundation

### 用户目标

让每一个公开 Entry 都具备独立互联网知识页面的基本条件。

### 统一检查项

每个 published Entry 至少检查：

1. 唯一页面标题
2. 唯一 meta description
3. 唯一 canonical URL
4. 清晰 H1
5. 可被搜索引擎发现的正文
6. Breadcrumb / 面包屑语义
7. Schema.org structured data
8. OpenGraph / 社交分享 metadata
9. 主图片及正确 ALT
10. 来源信息
11. 相关 Entry / Knowledge World 内链
12. sitemap 可发现
13. robots / canonical 不互相冲突
14. 移动端可读
15. 非 JS 情况下确认关键正文不会完全消失

### 明确原则

- 不为 SEO 制造第二套内容数据库。
- SEO metadata 必须来自现有 canonical Entry 与既有事实层。
- 不做 AI SEO 批量生成垃圾页面。
- 不把搜索关键词堆入正文。
- 不因 SEO 修改历史事实或 World mapping。
- 不修改 Supabase 生产知识事实，除非另立数据修复任务。

### Done Criteria

- 149/149 published Entry 完成 SEO Health Matrix。
- 所有 Entry 均有明确 canonical。
- 所有 Entry 均有 title / description / H1。
- 关键正文可被搜索引擎/静态构建结果发现。
- structured data 无系统性错误。
- OpenGraph / image / ALT 正常。
- sitemap 能覆盖全部应公开 Entry。
- 无明显 canonical 冲突、重复 URL 或 orphan Entry。
- 构建检查、线上部署、线上页面自动检查全部通过。

## 3. Phase 6B — Entry SEO Health Matrix

建立：

.ai/ENTRY_SEO_HEALTH_MATRIX.md

矩阵以 149 个 Entry 为行，以 SEO / 内容完整性指标为列。

建议字段：

| 字段 | 含义 |
|---|---|
| entry_id | canonical ID |
| slug | 页面地址 |
| title | 页面标题 |
| description | meta description |
| h1 | 页面主标题 |
| canonical | canonical URL |
| body_indexable | 正文是否可发现 |
| schema | structured data |
| og | OpenGraph |
| image | 主图 |
| image_alt | ALT |
| breadcrumb | 面包屑 |
| source | 来源 |
| world | Knowledge World |
| related | 继续探索入口 |
| sitemap | sitemap 状态 |
| mobile | 移动端状态 |
| status | pass / review / block |
| notes | 修复说明 |

### Done Criteria

149 个 Entry 全部有明确状态：
**PASS / REVIEW / BLOCK**

并能够直接形成 Phase 6A 的修复队列。

## 4. Phase 6C — Canonical Content Admission v1

建立正式内容准入标准，用于之后 149 → 500。

新增 Entry 不以“数量”作为主要标准。

一个候选 Entry 至少应满足：

1. 有独立知识价值。
2. 有明确实体边界。
3. 有可靠来源。
4. 可以成为用户搜索或探索入口。
5. 至少有一个继续探索出口。
6. 不重复已有 Entry。
7. 不制造 Ghost Node。
8. 媒体如存在，来源/版权/审核状态可解释。
9. 关系如存在，必须有 entry-specific rationale 或明确证据。
10. 能归入至少一个 Knowledge World。

### 优先级

第一优先：
- 核心器物
- 景德镇核心历史/空间
- 重要人物
- 世界遗产组成部分
- 72 道工艺的深度知识页面

第二优先：
- 中国陶瓷史关键对象
- 日本/东亚陶瓷交流对象
- 世界陶瓷文明连接点

### 明确不做

- 为了达到 500 强行补条目。
- 为了图谱边数量制造 Entry。
- 为了 SEO 制造近义重复 Entry。
- 让一个具体作品只作为人物关系的“幽灵节点”存在。

## 5. Phase 6D — Jingdezhen Search Knowledge Map

建立“真实搜索问题 → Entry”的映射，不是关键词堆砌。

第一批问题族：

### 景德镇基础
- What is Jingdezhen porcelain?
- 景德镇为什么成为世界瓷都？
- 景德镇陶瓷历史
- 景德镇为什么适合制瓷？

### 青花与器物
- 青花瓷是什么？
- 元青花为什么重要？
- 景德镇青花瓷怎么烧？
- 成化斗彩鸡缸杯是什么？

### 窑址与城市
- 御窑厂是什么？
- 湖田窑是什么？
- 景德镇古窑址有哪些？
- 高岭土与景德镇瓷器有什么关系？

### 人物
- 唐英是谁？
- 郎廷极是谁？
- 王步是谁？
- 黄云鹏是谁？

### 工艺
- 景德镇瓷器怎么制作？
- 72 道工序是什么？
- 高岭土如何影响瓷器？
- 青花瓷如何装饰？

### 世界陶瓷文明
- Jingdezhen and global porcelain trade
- Chinese porcelain and Europe
- Jingdezhen and Japanese ceramics
- Chinese blue-and-white porcelain

### Done Criteria

- 建立搜索问题 → canonical Entry 的第一版知识地图。
- 每个高价值问题至少有一个明确 Entry 落点。
- 缺失问题进入 Content Admission 候选池，而不是生成低质量页面。

## 6. Phase 7 — Content Expansion

只有 Phase 6 基础完成后，开始系统扩张内容。

### 目标阶梯

**149 → 220 → 320 → 400 → 500**

不是一次性冲 500。

### 149 → 220
重点：
- 景德镇核心知识
- 世界遗产
- 核心历史
- 关键窑址
- 核心人物

### 220 → 320
重点：
- 器物
- 博物馆级对象
- 馆藏对象
- 代表性器形/纹饰/款识

### 320 → 400
重点：
- 人物
- 文献
- 工艺深度页面
- 城市空间

### 400 → 500
重点：
- 中国与世界陶瓷文明连接
- 日本/东亚交流
- 全球窑业比较
- 国际用户搜索入口

每一批都必须经过 Canonical Content Admission。

## 7. Phase 8 — Digital Museum Object / 器物身份证

先做 20 个旗舰对象试点，再扩到：

**20 → 50 → 100 → 150**

每个核心 Object 建议具备：

- Object ID
- 名称
- 年代
- 产地 / 窑址
- 器形
- 胎
- 釉
- 纹饰
- 款识
- 工艺
- 人物
- 文献
- 馆藏机构
- 图片
- 图片来源与许可
- IIIF（如可用）
- 尺寸
- Timeline
- Space
- Knowledge World
- Related Entry
- Recommendation
- Global Network position
- Sources

目标不是做一个“更长的 Entry”，而是建立可引用的数字博物馆对象档案。

## 8. Phase 9 — 世界遗产旗舰专题

旗舰专题：

**景德镇手工瓷业遗存**

围绕 UNESCO 五个组成部分组织：

1. 城区瓷业生产中心
2. 湖田古窑址
3. 高岭瓷土矿遗址
4. 长岭瓷石矿遗址
5. 焦潭柴窑燃料生产区

将：
**原料 → 矿区 → 窑址 → 城市生产中心 → 工艺 → 器物 → 人物 → 贸易 → 世界影响**

串成一条可探索知识链。

现有 Timeline / Map / Craft / People / Object / Knowledge Graph / World / Entry 均作为已有观察层，不新建第二事实源。

## 9. Phase 10 — International Knowledge

### English

第一阶段：
50 个核心 Entry

第二阶段：
150

第三阶段：
300

最终目标：
500 个核心英文独立知识入口。

英文不是简单机器翻译，应优先保证：
- 术语准确
- 中国陶瓷史语境准确
- 来源可追溯
- 搜索意图明确
- 页面可独立理解

### Japanese

日文不是简单翻译层。

定位为：
**中国陶瓷与日本陶瓷史之间的知识桥梁。**

优先：
- 中国→日本技术传播
- 景德镇→日本陶瓷
- 青花瓷→日本
- 东亚贸易
- 中国瓷器在日本的接受史

## 10. Phase 11 — Knowledge Cards / Shareable Knowledge

建设可分享的专题知识卡：

例如：

- 为什么景德镇成为世界瓷都？
- 一件景德镇瓷器是怎样诞生的？
- 青花瓷为什么是蓝白色？
- 景德镇手工瓷业遗存是什么？
- 景德镇如何影响世界陶瓷？

Knowledge Card 应该把：
**文字 + 时间 + 地图 + Object + Craft + People + Entry**

组合成可以独立传播的知识资产。

## 11. Analytics / 真实用户数据闭环

在内容扩张后建立行为分析：

- 用户从哪里进入
- 哪个 Entry 是搜索入口
- 哪个 Entry 没有流量
- 搜索词是什么
- Entry → Entry 点击
- Recommendation 点击
- Knowledge World 热度
- 图片点击/兴趣
- 中文/英文/日文差异
- 探索深度
- Search → Entry → Exploration 路径
- 哪些知识问题没有对应 Entry

最终形成：

**搜索需求 → 内容生产 → Entry → 用户行为 → 数据反馈 → 下一轮内容生产**

## 12. 技术优先级

### P0
- Entry SEO / Indexability
- Canonical Entry 页面质量
- English 核心内容系统

### P1
- Structured Data
- OpenGraph
- Sitemap
- hreflang
- 图片资产治理
- 世界遗产旗舰专题
- Knowledge Cards
- 基础用户行为分析

### P2
- Contributor / 编辑协作
- IIIF / Open Cultural Data
- 机构级外部引用系统

### P3
- 更复杂的多跳 Graph
- 更复杂的 Recommendation Algorithm

## 13. 当前明确不做

在 Phase 6 Growth Foundation 期间，除非出现明确线上问题：

- 不重新设计首页
- 不重新设计七大 Knowledge World
- 不增加第 8 个 Knowledge World
- 不继续机械增加 World mapping
- 不继续无限扩充 Recommendation
- 不继续深审已经封版的 Phase 4E
- 不为了图谱规模增加低价值 edges
- 不建立第二套事实数据库
- 不做大规模 CSS 重构
- 不做 AI SEO 垃圾内容
- 不为了“看起来高级”增加技术复杂度

## 14. Phase 6 总 Done Criteria

Phase 6 完成的标志不是“代码写完”，而是：

1. 149 个 Entry 全部通过 SEO Health Matrix。
2. Entry 都具备独立 canonical URL。
3. Entry 的正文、标题、描述、结构化数据、图片、来源、内链达到统一最低标准。
4. Sitemap / canonical / structured data / OpenGraph / robots 形成一致体系。
5. 建立 Canonical Content Admission v1。
6. 建立 Jingdezhen Search Knowledge Map。
7. 明确 149 → 220 第一批内容扩张候选。
8. 不改变 Phase 2B World Freeze。
9. 不改变 Phase 3B A+ / A Recommendation Gate。
10. 构建、部署、线上页面自动检查、数据权限检查全部通过。
11. .ai 记忆同步更新真实状态。

## 15. 下一步唯一动作

**Phase 6A：先做 149 个 Entry 的 SEO / Indexability 全量审计。**

执行顺序：

**读取当前 main → 确认 Entry 渲染机制 → 建立 SEO Health Matrix → 找出系统性问题 → 修复最小必要代码 → 线上验证 → 再进入 149 → 220 内容扩张。**

第一轮不扩充 500 个 Entry。

**先让已有知识真正进入互联网。**
