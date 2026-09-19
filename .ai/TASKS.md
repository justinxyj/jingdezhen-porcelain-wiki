# Tasks

## P0 — 项目记忆
- [x] 建立 .ai 项目记忆体系
- [x] 合并记忆 PR
- [x] 固化每个大阶段结束时的状态更新流程

## P0 — 基线接管审计
- [x] 对比 6a8700b → 当前 main
- [x] 核验当前 main 的真实 commit
- [x] 核验后续 PR 的合并/关闭状态
- [x] 核验当前 CI / Pages
- [x] 核验 live Supabase

## P0 — Supabase 安全
- [x] 为 craft_media_candidates 启用 RLS
- [x] 为 timeline_media_candidates 启用 RLS
- [x] 撤销 public/anon/authenticated 对候选媒体表的表级权限
- [x] 生产状态验证
- [x] GitHub migration 记录

## P1 — Canonical Entry / Media
- [ ] 复核 Issue #2
- [x] 检查核心 entry/media 真实数据通路
- [ ] 清理错误复用媒体，同时保留来源与审计记录
- [x] 修复 Met 馆藏图旧硬编码屏蔽
- [x] 72 工序前端改为读取 canonical craft_processes
- [x] 验证关系按稳定 ID 加载

## P1 — 工程质量
- [x] 核验 mkdocs strict / Museum QA
- [x] 核验 Pages 部署可观察性
- [x] 对齐公共媒体前端审核门槛：只加载 approved + verified
- [x] 数据库层阻止普通用户伪造 approved/verified 媒体
- [x] 公共媒体改为列最小化的 `media` 直读 + RLS，避免公开内部审核字段
- [x] 对齐 schema / migration / frontend data contract
- [x] 修复 knowledge-store API 异常静默空数组
- [x] 详情页改为定向 entry + 有上限关系查询
- [x] 外部图片恢复增加超时、有限重试、缓存与并发上限
- [x] 移除 site-privacy 文本误删逻辑
- [x] 降低 timeline MutationObserver 全量扫描
- [ ] 审核剩余 SECURITY DEFINER function WARN

## P2 — 内容
- [ ] 按来源驱动扩充高价值知识条目
- [ ] 补人物/窑址/器物/工艺之间关系
- [ ] 不给无来源人物或器物强行编写事实

## P2 — 产品
- [ ] 继续数字博物馆入口与视觉交互
- [ ] 前提：核心数据层稳定且可验证

- [x] 第三轮：修复窑址地图容器裁剪/覆盖问题
- [x] 第三轮：修复首页、/entry/、时间轴、72工序及旧博物馆组件夜间模式可读性
- [x] 第三轮：加强 72 工序与窑址地图移动端布局
- [ ] 第三轮：取得可用浏览器/截图能力后完成上线网页像素级验收


- [x] 第三轮：修复用户实测的大量 The Met 图片破损问题（运行时对象 API + Commons 恢复 + 动态图片监听）
- [x] 第三轮：清除静态页面残留的内部 cite 标记
- [ ] 第三轮：等待最新图片修复版本部署后，重新按截图场景验收器物目录与详情弹窗

- [x] 第三轮：修复首页默认面包屑/顶部留白
- [x] 第三轮：放大首页自定义品牌文字
- [x] 第三轮：修复首页源码按钮 404（edit_uri + 首页隐藏）
- [ ] 第三轮：部署后复测首页三项问题


- [x] 第三轮：修复历史时间轴按数据库更新时间排序导致的年代倒序
- [x] 第三轮：历史时间轴按时代与起始年份排序，“东晋—唐”第一，“五代—宋”第二，1909/1949/2002/2026 等近现代节点置后


## 新一轮审计修复
- [x] H-1 认证过期错误统一为 AUTH_EXPIRED / 401
- [x] H-2 关系查询严格 UUID 校验并移除动态 OR filter
- [x] H-3 主媒体/Revision 版本唯一约束与事务回归测试
- [x] M-1 历史时间轴改用结构化 timeline_sort_year
- [x] M-2 evidence-hub 安全 DOM 渲染与 URL 白名单
- [x] M-3 目录搜索重绘降频到 animation frame
- [x] M-4 strict TypeScript 数据契约与错误契约
- [x] M-5 外部图片恢复生命周期中止、负缓存、对象 ID 校验
- [x] M-6 关系稳定排序、去重、截断提示
- [x] M-7 核心查询 EXPLAIN + 生产索引验证
- [ ] M-4 浏览器核心 JS 全量迁移 TypeScript（当前不作为阻塞项，现阶段保留 JS + strict contract）


## 本轮审计
- [x] S1 核验并统一最终 media 公共访问架构
- [x] S2 建立 canonical public ACL migration + ACL smoke
- [x] H1 修复馆长后台 schema drift
- [x] H2 详情关系查询统一认证请求层
- [x] H3 初始化/Observer 生命周期治理
- [x] H4 保持分页与稳定排序，继续关注数据增长
- [x] H5 PR 与生产 smoke 解耦
- [x] M1 核心 JS 开启 checkJs；严格 contract 单独配置
- [x] M2 evidence-hub 安全 DOM 渲染
- [x] M3 动态重绘降频
- [x] M4 动态 HTML 安全边界
- [x] M5 外部图片生命周期/负缓存


## Wiki 2.0 全站改造
- [x] 完成《Wiki 2.0 最终信息架构蓝图》
- [x] 完成《Wiki 2.0 全站改造施工清单》并固化到 .ai/WIKI_2.0_CONSTRUCTION_PLAN.md
- [ ] Sprint A：重构顶部导航与首页入口
- [ ] Sprint B：统一七大知识世界入口
- [ ] Sprint C：统一数字博物馆工具层
- [ ] Sprint D：统一 /entry/ 知识节点页 2.0
- [ ] Sprint E：补全知识关系网络
- [ ] Sprint F：旧入口清理、视觉统一与全站发布验收

