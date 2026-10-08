# 数据库发布前只读检查与安全移交

当前状态：连接 BLOCKED；本地结构和公开生产内容对比 PASS；未执行生产 SQL、完整备份、真实 Dry Run 或正式写入。没有修改网站源码或已完成的 30 项 UX。此文档和 JSON 作为交接材料提交到 GitHub；提交材料不代表网站部署或数据库发布。

检查时间：2026-10-08T04:31:10.015955+00:00。固定仓库版本：`0bcef6f2b50c824bf56eeb4bdd34e8bd3e984419`。

## 目标与连接

- 仓库：justinxyj/jingdezhen-porcelain-wiki。
- 唯一目标项目：jingdezhen-porcelain-wiki / `jscttuocrulgpwvsfxou`。
- PostgreSQL 17 / ACTIVE_HEALTHY 为用户在可用 Supabase 连接中的确认；本云 Agent 没有独立 SQL 工具确认它们。
- 本任务工具列表无 Supabase MCP，也无工具检索入口；云环境未提供数据库/管理连接。
- 当前可用的 Supabase 访问仅为公开 REST GET；160 个目标均找到，原身份/版本/内容哈希与稿件守卫一致。
- 不再尝试获取 H3_DB_URL；优先在用户已能调用 Supabase 工具的 ChatGPT 对话接手。若使用本地 Codex，须通过客户端配置 MCP，并在新任务中使工具可用；在当前容器写配置不代表本云 Agent 会自动获得工具。

## 固定数据稿与校验值

| 文件 | SHA256 |
|---|---|
| [content/editorial/entry-drafts.json](https://github.com/justinxyj/jingdezhen-porcelain-wiki/blob/0bcef6f2b50c824bf56eeb4bdd34e8bd3e984419/content/editorial/entry-drafts.json) | `4486e83b4d9e673ab3aa2972af926f4d03a35f03560464f71edeea7207a7f332` |
| [content/editorial/process-drafts.json](https://github.com/justinxyj/jingdezhen-porcelain-wiki/blob/0bcef6f2b50c824bf56eeb4bdd34e8bd3e984419/content/editorial/process-drafts.json) | `514ae1f948bed3c90f03318b511e4a2cb22c6b9e8a18a78c996e01859f6ad1da` |
| [content/editorial/timeline-drafts.json](https://github.com/justinxyj/jingdezhen-porcelain-wiki/blob/0bcef6f2b50c824bf56eeb4bdd34e8bd3e984419/content/editorial/timeline-drafts.json) | `432ea267662313d5adc83697f407d1d3085d1881d31bbfa22be43fe9b25e9998` |

79 条 entries、65 条 craft_processes、16 条 timeline_context，总计 160 个唯一记录。工序文件包含 72 稿，只有 editorial_review=accepted_as_general_process_explanation 的 65 稿进入发布；其余 7 稿不更新。

22 项 metadata 合并在 79 条 entries 中：2 器物、9 人物（3 项生年）、11 其他条目关键词，不额外新增记录。全部稿件仍 applied=false。

本次检查确认：必要正文非空、来源列表及网址结构存在、metadata 字段类型正确、目标身份与原记录守卫匹配。这里只核对资料结构与版本，没有把普通 URL 计为已核验来源，也没有声称重新核验全部历史主张。

逐目标 ID、slug、版本和字段列表在 [editorial-preflight-readonly.json](editorial-preflight-readonly.json)。公开读取结果不是事务级快照，也不是完整数据库备份。

## 字段边界与待审风险

- entries：替换 zh 内 title/summary/content/sources；sources 根字段同步；metadata 合并，不删除未计划的原有键。id/slug/category/en/ja 未纳入更新。
- craft_processes：仅 description_zh 及 updated_at；不更新 sequence、关联和身份。
- timeline_context：更新 historical_role/relationship_to_jingdezhen/ai_summary/description_source_type 及 updated_at；description_source_type 为 editorial_synthesis；不覆盖机构原文。
- 现有脚本还会把 entries.version 加 1、updated_by 设为 NULL，并更新 updated_at。**updated_by 清空是明确的审计字段变更，接手者必须检查现有值和审计规则，不得默认为没有数据损失。**
- 真实数据库列定义、权限、RLS、外键/检查约束、版本/审计触发器尚未 SQL 检查。稿件来源字段的替换也须在真实 diff 中审阅，不以“URL 更多”判断安全。
- 需检查触发器是否有不能回滚的外部副作用或序列变化；有这类情况时不能把 ROLLBACK 宣称为完全无影响。
- 现有脚本的 backup.json 保存目标完整原行；它不是完整数据库 dump。先确认数据库整体备份/恢复可用，再保存全部目标原行及受影响审计/关联数据，备份置于受保护位置，不上传公开 GitHub。

离线内容差异校验值：`774c08d2548cf496b807a1dcfb0399e252aff8c93e1b6c0522e871b1105382e9`。这是公开字段和纯函数生成的比对，**不是 live Preview SHA，不得传给 --apply**。

## 接手流程：严格停在正式写入之前

1. 在具有 Supabase MCP 的执行环境确认工具可用与唯一项目；先只读检查 SQL 身份、目标表/列、RLS、权限、约束、触发器及备份恢复状态。
2. 从上述固定提交读取 3 个数据稿并核对 SHA256；重新读取 160 目标，按现有脚本的版本/哈希守卫核验。出现并发修改即停止，不覆盖。
3. 复用 [publish_editorial.py](https://github.com/justinxyj/jingdezhen-porcelain-wiki/blob/0bcef6f2b50c824bf56eeb4bdd34e8bd3e984419/scripts/publish_editorial.py) 的目标清单、replacement 和事务守卫逻辑，以及 [PUBLISHING.md](https://github.com/justinxyj/jingdezhen-porcelain-wiki/blob/0bcef6f2b50c824bf56eeb4bdd34e8bd3e984419/content/editorial/PUBLISHING.md) 的流程；不创建第二套数据库或发布系统。若通过 MCP 执行 SQL，须保持相同边界，并确保单次调用承载完整事务，不能假设多次工具调用复用一个事务连接。
4. 保存完整备份；有权执行事务且副作用可控后，做真实锁定、160 条更新、读回、差异审阅与 ROLLBACK。外层事务回滚后另行确认生产仍为原状态。
5. 报告备份位置（不含密码）、真实更新范围、metadata 差异、触发器/约束结果、回滚验证和真实预演摘要。**等待用户明确批准；不得 COMMIT / --apply / 运行 apply 工作流。**
6. 取得明确批准后才正式写入；随后读回 79/65/16 和 22 metadata，重新生成静态条目并发布 Pages，核对实际网站正文，再更新 UX Final Completion Report。

## 可用执行环境与 MCP 配置

最简单路线：在用户已经能调用 Supabase 工具并访问该项目的 ChatGPT 对话中接手，并提供本文件、JSON 及上述固定 GitHub 文件链接。接手对话还须能读取稿件；能查看项目不自动等于有 SQL 更新权限。

本地 Codex 可使用官方远程 MCP + 浏览器 OAuth，不需要在聊天中传数据库密码。初始只读配置示例（这是供本地操作的说明，本 Agent 未执行）：

```sh
codex mcp add supabase --url 'https://mcp.supabase.com/mcp?project_ref=jscttuocrulgpwvsfxou&read_only=true'
codex mcp login supabase
```

重新开启具有该工具的任务，先做只读诊断。read_only=true 的连接不能执行真实更新回滚预演；需在权限及副作用检查后，按用户授权切换 SQL 能力，再执行全事务回滚的 Preview，正式提交仍必须另等批准。

官方说明：[Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp)、[Codex MCP 配置](https://developers.openai.com/codex/mcp/)。这些客户端配置不等于能在当前已启动云任务里动态加入工具。

## 可复制的接手指令

> 接手 jingdezhen-porcelain-wiki 数据库发布前检查。唯一 Project ID 为 jscttuocrulgpwvsfxou；稿件固定 GitHub 提交 0bcef6f2b50c824bf56eeb4bdd34e8bd3e984419。读取本交接文件、只读检查 JSON 和 3 份稿件；共79 entries、65接受工序、16 timeline_context，22个条目的metadata已包含在79条中。优先复用已有Supabase MCP，不要求在聊天里提供密码。先核实真实SQL身份/权限/约束/审计触发器和备份，再按项目现有发布守卫做完整备份及160条全事务回滚预演，独立读回确认无永久变化。报告结果后暂停，等待我明确批准正式写入。不得改动已经完成的30项UX，不得新建数据库或第二套发布系统，不得把只读diff的SHA当成真实Preview SHA。
