# conversation-memory（分层会话记忆）

> 把聊天压成「日块索引」，让模型能回忆起很久以前的事；平常不进提示词、不花 token，问旧事才检索。
>
> QQ Agent 插件（`plugins/conversation-memory`），零侵入：全部通过 hooks 挂载，没改核心代码。

## 它解决什么

长会话会被压缩/丢上下文，「上周说过的那个 IP」「之前定过的口径」就再也找不回来。本插件做三件事：

1. **后台巩固**：每 10 分钟把新消息压成日块/小时块索引（模型不知道、也不需要知道）。
2. **极短注入**：每轮往提示词里加一小段记忆（待办 / 跨轮 / 语义卡 / 跨群），量很小。
3. **主动检索**：模型需要翻旧账时调 `memory_search` / `memory_archive`（工具在 `skills/memory-recall/`，通过本插件暴露的 `memory.search` / `memory.archive` 能力取用）。

关掉本插件 → 检索工具自动显示「依赖未就绪」；只留本插件 → 记忆照常巩固与注入，只是模型不能主动翻旧账。

## 安装

1. 把整个目录放到 QQ Agent 的 `resources/app/plugins/conversation-memory/`
2. 重启 QQ Agent（或重载插件）
3. 插件默认启用（`plugin.json` 里 `enabledByDefault: true`），可在设置页逐项开关

## 配置（`plugin.json` → `settings`）

| 键 | 默认 | 说明 |
|---|---|---|
| `enabled` | true | 总开关；关掉不再巩固/注入，已生成索引留在磁盘 |
| `injectArchitecture` | true | 是否每轮注入短记忆片段 |
| `consolidateIntervalMin` | 10 | 后台巩固间隔（分钟），只在有新增时才写盘 |
| `pendingTodos` | true | 待办提醒，到期自动消失 |
| `crossTurnWorking` | true | 跨轮工作记忆（TTL 内有效） |
| `semanticCards` | true | 本地启发式抽「约好/喜欢/雷点」 |
| `crossChatAwareness` | true | 跨会话旁听（极短窗口） |
| `semanticTopN` | 1 | 语义卡最多注入几条 |
| `costGuard` | true | 本地统计 prompt 用量，超阈值砍可选注入 |
| `dayPromptMax` | 300000 | 日 prompt 上限（token），0=不限 |
| `chatPromptMax` | 100000 | 单会话上限（token） |

## 结构

```
plugin.json          插件清单 + 配置 schema
index.js             挂载点：hooks（before-context / before-llm-messages / after-response）+ 后台定时器
lib/hippocampus.js   倒排索引（检索）
lib/consolidator.js  巩固：消息 → 日块/小时块
lib/longterm.js      长期记忆条目
lib/arch.js          架构注入文本拼装
lib/archive.js       存档读写
lib/semantic-cards.js 语义卡抽取
lib/cost-guard.js    成本护栏
lib/pending.js       待办
lib/cross-turn.js    跨轮工作记忆
lib/cross-chat.js    跨会话旁听
lib/sensory.js       感知层
lib/working.js       工作记忆
lib/memory.js        记忆门面
lib/tokenize.js      分词
lib/env.js           环境探测
```

## 2026-11-10 修复

- `hippocampus.js`：删除索引时只删该 chunk 涉及的 token，不再全量扫 postings（修 O(N) 性能 bug）
- `consolidator.js`：语义卡片本地启发式失败不再静默（修 I1）
- `consolidator.js`：索引明显落后磁盘时先对账（防「块在库里但搜不到」），阈值 20 → 2（修 B5）

> 另有 2 项修复由同一批改动带入（`longterm.js` / `arch.js`），逐条对照清单待补；本仓库按当前代码如实导出。

## License

MIT
