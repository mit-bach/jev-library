// 1手分の「考える（think）」と「打つ（act）」。ブラウザと bench.mjs で共用する。
//
// モード
//  jev    : Jev の確率だけで手を決める（コードは閾値判定と算術だけ）
//  hybrid : Jev が確信できる手だけ Jev に任せ、確信できないときは厳密ソルバーへ回送する
//           （TypeSafe の Confidence-gated routing パターン）
//  solver : 厳密ソルバーだけ（比較用のベースライン。APIキー不要）

import { solve } from "./solver.js";
import { analyzeClues, buildRequest, askJev } from "./jev.js";

export const MODES = {
  jev: "Jevだけ",
  hybrid: "Jev＋ソルバー",
  solver: "ソルバーだけ",
  manual: "自分で遊ぶ",
};

export function createMemory() {
  return { noReflag: new Set(), turnsWithoutOpen: 0 };
}

export const pct = (p) => {
  if (!Number.isFinite(p)) return "–";
  const v = p * 100;
  if (v > 0 && v < 1) return "<1%";
  if (v < 100 && v > 99) return ">99%";
  return `${Math.round(v)}%`;
};

// 数字より周りの旗が多い＝どれかの旗が間違い。コード側で不変条件を守る（その周りの旗を外す）。
export function repairFlags(game, memory) {
  const removed = [];
  for (let round = 0; round < 4; round++) {
    const { contradictions } = analyzeClues(game.publicView());
    if (!contradictions.length) break;
    for (const c of contradictions) {
      for (const f of c.flags) {
        if (game.flagged[f]) {
          game.setFlag(f, false);
          removed.push(f);
          memory.noReflag.add(f);
        }
      }
    }
  }
  if (game.flagCount() > game.totalMines) {
    for (let i = 0; i < game.n; i++) {
      if (game.flagged[i]) {
        game.setFlag(i, false);
        removed.push(i);
      }
    }
  }
  return removed;
}

// 数字に接していない未開封マス（未知領域）
export function seaCells(view) {
  const out = [];
  for (let i = 0; i < view.n; i++) {
    if (view.revealed[i] || view.flagged[i]) continue;
    if (!view.neighbors[i].some((j) => view.revealed[j])) out.push(i);
  }
  return out;
}

// 角 → 辺 → その他 の順に選ぶ（角は空白が出やすく、情報が増えやすい）
function pickSeaCell(view, cells) {
  const rank = (i) => {
    const x = i % view.w;
    const y = Math.floor(i / view.w);
    const edges = (x === 0 || x === view.w - 1 ? 1 : 0) + (y === 0 || y === view.h - 1 ? 1 : 0);
    return 2 - edges;
  };
  return [...cells].sort((a, b) => rank(a) - rank(b) || a - b)[0];
}

function beliefDensity(view) {
  let hidden = 0;
  let flags = 0;
  for (let i = 0; i < view.n; i++) {
    if (view.revealed[i]) continue;
    if (view.flagged[i]) flags++;
    else hidden++;
  }
  return hidden ? Math.max(0, view.totalMines - flags) / hidden : 1;
}

function planSolver(view, exact, routed) {
  const prefix = routed ? "Jevが確信できない → ソルバーへ回送。" : "";
  const safe = [...exact.certainSafe].sort((a, b) => a - b);
  const flag = exact.certainMine.filter((c) => !view.flagged[c]);
  const unflag = safe.filter((c) => view.flagged[c]);
  if (safe.length) {
    return { by: "solver", open: safe, flag, unflag, reason: `${prefix}確実に安全な ${safe.length} マスを開く` };
  }
  let best = -1;
  let bestP = Infinity;
  for (let i = 0; i < view.n; i++) {
    if (view.revealed[i]) continue;
    const p = exact.prob[i];
    const penalty = view.flagged[i] ? 1e-9 : 0; // 同率なら旗のないマスを優先
    if (p + penalty < bestP) {
      bestP = p + penalty;
      best = i;
    }
  }
  if (view.flagged[best]) unflag.push(best);
  return {
    by: "solver",
    open: [best],
    flag,
    unflag,
    guess: true,
    reason: `${prefix}確実に安全なマスがない → 地雷確率が最小の ${view.names[best]}（${pct(exact.prob[best])}）に賭ける`,
  };
}

function planJev(view, probs, exact, ctx) {
  const sorted = [...probs].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const safe = sorted.filter(([, p]) => p <= ctx.safeT).map(([c]) => c);
  const mines = sorted
    .filter(([c, p]) => p >= ctx.mineT && !ctx.memory.noReflag.has(c))
    .map(([c]) => c);
  const flagNote = mines.length ? `、${mines.length} マスに旗` : "";

  if (safe.length) {
    return { by: "jev", open: safe, flag: mines, unflag: [], reason: `Jevが安全と判断（P≦${pct(ctx.safeT)}）した ${safe.length} マスを開く${flagNote}` };
  }
  if (mines.length && ctx.memory.turnsWithoutOpen < 2) {
    return { by: "jev", open: [], flag: mines, unflag: [], reason: `開けるマスはないが地雷を ${mines.length} 個特定（P≧${pct(ctx.mineT)}）→ 旗を立てて聞き直す` };
  }
  if (ctx.mode === "hybrid") {
    const plan = planSolver(view, exact, true);
    plan.flag = [...new Set([...mines, ...plan.flag])].filter((c) => !plan.open.includes(c));
    return plan;
  }
  // Jevだけ：確信できるマスがないので賭ける。未知領域の平均密度（コードで計算）の方が低ければそちらを開く。
  const [best, bestP] = sorted[0];
  const sea = seaCells(view);
  const density = beliefDensity(view);
  if (sea.length && density + 0.02 < bestP) {
    const cell = pickSeaCell(view, sea);
    return {
      by: "code",
      open: [cell],
      flag: mines,
      unflag: [],
      guess: true,
      reason: `Jevの最小確率 ${pct(bestP)} より未知領域の平均 ${pct(density)} の方が低い → ${view.names[cell]} を開く`,
    };
  }
  return {
    by: "jev",
    open: [best],
    flag: mines.filter((c) => c !== best),
    unflag: [],
    guess: true,
    reason: `確信できるマスがない → Jevの確率が最小の ${view.names[best]}（${pct(bestP)}）に賭ける`,
  };
}

function planNoTargets(view) {
  const sea = seaCells(view);
  if (sea.length) {
    const cell = pickSeaCell(view, sea);
    return { by: "code", open: [cell], flag: [], unflag: [], guess: true, reason: `聞くべき境界マスがない → 未知領域の ${view.names[cell]} を開く` };
  }
  const flagged = [];
  for (let i = 0; i < view.n; i++) if (!view.revealed[i] && view.flagged[i]) flagged.push(i);
  return { by: "code", open: [], flag: [], unflag: flagged, reason: "行き詰まり → 旗をすべて外して評価し直す" };
}

/**
 * 1手分考える。盤面は（旗の修正以外）変更しない。
 * ctx: { mode, style, safeT, mineT, transport, memory, chunkSize, repair }
 */
export async function think(game, ctx) {
  const turn = { mode: ctx.mode, by: "code", open: [], flag: [], unflag: [], reason: "", guess: false, notes: [] };
  if (game.isOver()) return null;
  if (game.status === "ready") {
    turn.open = [game.center()];
    turn.reason = "初手は中央（地雷は初手の周囲に置かれないので必ず安全）";
    return turn;
  }

  if (ctx.mode !== "solver" && ctx.repair !== false) {
    const removed = repairFlags(game, ctx.memory);
    if (removed.length) turn.notes.push(`旗の矛盾を検出 → ${removed.map((c) => game.names[c]).join(", ")} の旗を外した`);
  }

  const view = game.publicView();
  turn.exact = solve(view);

  if (ctx.mode === "solver") return Object.assign(turn, planSolver(view, turn.exact, false));

  const request = buildRequest(view, { style: ctx.style });
  turn.request = request;
  if (!request.targets.length) return Object.assign(turn, planNoTargets(view));

  ctx.onAsk?.(request);
  const jev = await askJev(request, ctx.transport, { chunkSize: ctx.chunkSize || 80 });
  if (!jev.ok) {
    turn.error = jev.error;
    turn.status = jev.status;
    return turn;
  }
  turn.jev = jev;
  if (!jev.probs.size) {
    turn.error = "Jev の応答に確率（answers[…].noul）が含まれていませんでした";
    return turn;
  }
  return Object.assign(turn, planJev(view, jev.probs, turn.exact, ctx));
}

/** think の結果を盤面に反映する。 */
export function act(game, turn, memory) {
  const opened = [];
  for (const c of turn.unflag) game.setFlag(c, false);
  for (const c of turn.flag) game.setFlag(c, true);
  for (const c of turn.open) {
    if (game.isOver()) break;
    if (game.revealed[c]) continue;
    opened.push(...game.reveal(c));
    if (game.status === "lost") {
      turn.explodedAt = c;
      break;
    }
  }
  turn.opened = opened;
  if (memory) memory.turnsWithoutOpen = opened.length ? 0 : memory.turnsWithoutOpen + 1;
  return turn;
}
