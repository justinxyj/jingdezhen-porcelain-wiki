# Phase 7.8 — Cross-Civilization Network QA

更新时间：2026-09-20

## 全量结果

| 状态 | 数量 | 定义 |
|---|---:|---|
| isolated | 142 | 完全没有 entry_relations |
| single_weak | 3 | 只有1条关系，且无A/B证据级关系 |
| multi_weak | 12 | 多条关系，但全部无A/B证据级关系 |
| single_strong | 17 | 只有1条A/B证据级关系 |
| connected | 16 | 多条关系且至少1条A/B证据级关系 |
| **合计** | **190** | 全部Published + Canonical Eligible |

结论：142/190（74.7%）仍完全孤立；只有33/190（17.4%）至少有一个A/B证据级网络连接。

## 单边弱连接（3）

- huang-yunpeng｜黄云鹏
- nian-xiyao｜年希尧
- zang-yingxuan｜臧应选

## 多边弱连接（12）

- active-archaeology｜2002—2014：御窑厂主动性考古
- changling-stone｜长岭瓷石采掘区
- eastern-jin-tang｜东晋—唐：新平镇与昌南镇
- five-dynasties-song｜五代—宋：湖田窑与青白瓷
- gaoling-mining｜高岭土矿采掘区
- hutian-kiln｜湖田窑
- industry-transition｜1949—1966：生产制度与科技转型
- jiaotan-firewood｜焦潭柴窑燃料生产区
- lang-tingji｜郎廷极
- modern-industry｜1909—1910：近代企业与陶业教育
- unesco-2026｜2026：景德镇手工瓷业遗存
- yuan-blue-white｜元：青花与釉下彩绘

## 当前真正Connected核心（16）

- arita-kiln｜有田窑·有田烧
- blue-and-white｜青花瓷
- colored-glaze｜颜色釉瓷
- europe-porcelain｜欧洲瓷器
- fencai｜粉彩瓷
- imperial-kiln｜御窑厂遗址
- japan-ceramics｜日本陶瓷
- ming-imperial-kiln｜明：御窑厂与官作体系
- qing-colors｜清：御窑、彩瓷与颜色釉
- qingbai-porcelain｜青白瓷
- seto-kiln｜濑户窑
- tang-ying｜唐英
- tang-ying-jun-vase｜雍正仿钧新紫釉天球瓶
- tao-shuo｜《陶说》
- tian-gong-kai-wu｜《天工开物》
- zhu-yan｜朱琰

## 142个孤立Entry：优先修复分组

数据库已经给全部190条写入 `network_qa_status`，因此完整142条名单可直接按以下SQL复现：

```sql
select e.slug, e.zh->>'title' as title
from entries e
join entry_content_admissions a on a.entry_id=e.id
where e.status='published'
  and a.canonical_eligible=true
  and a.network_qa_status='isolated'
order by e.slug;
```

高优先级孤立组已经人工归纳如下：

### P0：跨文明主网络

- arita-jingdezhen｜有田与景德镇青花传统
- chinoiserie｜欧洲中国风与景德镇瓷
- delft-jingdezhen｜代尔夫特陶器与中国瓷器
- dutch-east-india-company｜荷兰东印度公司与瓷器贸易
- europe-jingdezhen｜欧洲与景德镇瓷器
- export-porcelain｜外销瓷
- islamic-world-jingdezhen｜伊斯兰世界与景德镇瓷
- japanese-export-porcelain｜面向日本市场的景德镇瓷
- korean-jingdezhen-bluewhite｜朝鲜半岛与景德镇青花
- kraak-porcelain｜克拉克瓷
- kinrande-export｜金襕手与日本市场
- meissen-jingdezhen｜迈森瓷与景德镇
- portuguese-porcelain-trade｜葡萄牙与中国瓷器贸易
- southeast-asia-jingdezhen｜东南亚与景德镇瓷器
- binary-formula｜二元配方
- blue-white-cobalt｜青花钴料

### P1：景德镇生产系统

- chang-river｜昌江与景德镇瓷业
- changnan-town｜昌南镇与景德镇早期瓷业
- fuliang-county｜浮梁与景德镇瓷业
- kaolin-clay｜高岭土
- porcelain-stone｜瓷石
- porcelain-clay-processing｜瓷土加工
- porcelain-raw-material-system｜瓷业原料供应体系
- river-transport｜水运与瓷业运输
- porcelain-wharf｜瓷业码头
- kiln-fuel-system｜窑业燃料供应
- porcelain-craft-division-labor｜制瓷分工
- porcelain-standardization｜瓷器生产标准化
- ceramic-workers｜陶工与工匠
- ceramic-guilds｜陶瓷行会与行业组织
- imperial-kiln-management｜御窑管理制度
- imperial-civilian-kilns｜官民窑关系

### P1：核心工艺与器物

- ming-imperial-bluewhite｜明代御窑青花
- xuande-bluewhite｜宣德青花
- chenghua-doucai｜成化斗彩
- doucai-porcelain｜斗彩
- wucai｜五彩瓷
- overglaze-enamels｜釉上彩
- underglaze-red｜釉里红
- red-glaze-jingdezhen｜景德镇高温红釉
- langyao-red｜郎窑红
- fencai-technique｜粉彩装饰技术
- qing-peach-shaped-ewer｜清代青花釉里红桃形壶
- xuande-copper-red-bowl｜宣德铜红釉碗
- yongle-copper-red-dish｜永乐铜红釉盘

### P1：东亚与全球比较窑业

- korea-ceramics｜朝鲜半岛陶瓷
- joseon-ceramics｜朝鲜王朝陶瓷
- icheon-ceramics｜利川陶瓷
- longquan-kiln｜龙泉窑·大窑
- cizhou-kiln｜磁州窑·观台
- ding-kiln｜定窑·曲阳
- jun-kiln｜钧窑·禹州
- ru-kiln｜汝窑·清凉寺
- ge-kiln｜哥窑
- guan-kiln｜官窑
- yue-kiln｜越窑·上林湖
- xing-kiln｜邢窑
- yaozhou-kiln｜耀州窑·黄堡
- changsha-kiln｜长沙窑
- dehua-kiln｜德化窑
- shiwan-kiln｜石湾窑
- liling-kiln｜醴陵窑

## Evidence QA 规则

本轮没有把C-grade关系机械升级为A/B，也没有因为两个Entry主题相似就自动创建关系。

真正的修复格式必须是：

Entry → Relation Claim → Evidence → Source → Evidence Type → Confidence → Boundary → Evidence Grade

因此本轮是Network QA，而不是“关系灌水”。

## 冻结

- 不增加Entry。
- 不改变Canonical Admission。
- 不用Recommendation替代Relation。
- 不用媒体数量判断网络价值。
- 不把C级关系批量升级。
- 220→320继续冻结。

版本：`phase7.8-cross-civilization-network-qa-v1`

## v2 Network Repair Update — 2026-09-20

本阶段开始执行真正的 P0/P1 Network Repair，而非只做审查。

### 已完成
- 新增并证据标注一批 P0/P1 Relation Edges。
- 关系类型严格使用既有 schema：related / person / object / kiln / craft / period / source。
- A 级关系主要使用 UNESCO 2026 世界遗产决定/提名文件与博物馆对象记录；B 级关系保留比较性或上下位语义边界。
- 关系 note 写入具体 Relation Claim、证据说明、来源与边界，不把“相似”自动写成“技术传播”。
- Network QA 已刷新为 v2：connected 58、single_strong 29、multi_weak 11、isolated 92。
- 因此至少一个 A/B evidence-grade edge 的 Canonical 已从 33 增至 87 个。

### 本轮修复的核心网络
- 二元配方 → 景德镇 / 高岭土 / 瓷石
- 青花钴料 → 景德镇 / 青花瓷
- 原料、燃料、河流、码头、分工、标准化、行会 → 景德镇生产系统
- 御窑管理 → 御窑厂 / 官民窑体系
- 明代御窑青花 → 御窑 / 宣德青花
- 斗彩、五彩、釉上彩、釉里红、高温红釉 → 工艺/器物节点
- 有田、朝鲜半岛、日本市场 → 青花/日本/东亚网络
- 欧洲、代尔夫特、迈森、葡萄牙、VOC、克拉克瓷、伊斯兰世界、东南亚 → 外销瓷/欧洲/全球网络

### 仍需继续
92 个 Canonical 仍然完全孤立；下一批应继续处理剩余 P1/P2，而不是为了数量把弱证据关系灌入网络。

版本：phase7.8-cross-civilization-network-qa-v2
