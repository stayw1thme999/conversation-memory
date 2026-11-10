// 数据根目录：自包含计算（不再跨文件引用 src/config.js）。
//
// 为什么内联而不是复用核心导出：本插件准备单独开源分发，外部引用的 src/config.js
// 不在仓库里，别人拿去会 import 失败跑不起来。把三层推导逻辑内联进来，
// 行为与核心完全一致，但插件自洽。
//
// 优先级：QQ_AGENT_DATA_DIR（显式覆盖）> QQ_AGENT_PROFILE（多实例推导 data-2/）> 默认 data/
// 多实例下若自己乱拼，实例 #2 的记忆会写进 #1 目录互相污染 —— 所以必须走同一套推导。
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// lib/ → conversation-memory/ → plugins/ → 仓库根（resources/app）
export const ROOT = path.resolve(__dirname, '..', '..', '..');

// 多实例 PROFILE：QQ_AGENT_PROFILE=2 时数据目录变成 data-2/
function profileSuffix() {
  const raw = String(process.env.QQ_AGENT_PROFILE ?? '').trim();
  const id = /^\d+$/.test(raw) ? raw : '';
  return id ? `-${id}` : '';
}

export const DATA_DIR = process.env.QQ_AGENT_DATA_DIR || path.join(ROOT, `data${profileSuffix()}`);
