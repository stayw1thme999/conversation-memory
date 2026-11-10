# 变更日志

## [未发布] — 2026-11-10

### 修复

- **`lib/hippocampus.js` 索引删除 O(N) 性能 bug**：只删该 chunk 涉及的 token，不再全量扫 postings。
  为什么：大库上删一个块要扫全部倒排，越用越卡。
  验证：`node --check lib/hippocampus.js` exit 0；逻辑改动见该文件第 93 行注释。
- **`lib/consolidator.js` 语义卡片失败静默（I1）**：本地启发式抽卡失败现在会记录，不再静默吞掉。
- **`lib/consolidator.js` 索引落后对账（B5）**：索引明显落后于磁盘时先对账，防「块在库里但搜不到」；阈值 20 → 2。
- **`work/拆解/relay.mjs`（另一个仓库）时间显示**：ISO/UTC 时间戳转北京时间并显式标时区，避免把 UTC 当本地时间（治「窗口时间感知错乱」）。

### 新增（本次开源化）

- `README.md`：用途 / 安装 / 配置表 / 结构说明
- `LICENSE`：MIT
- `CHANGELOG.md`：本文件

### 待确认

- 工单称「记忆 5 bug」，本次代码里可核对到 3 处明确修复标记（I1 / B5 / O(N)）；其余 2 处（`longterm.js`、`arch.js`）无注释标记，逐条清单待拆解补。