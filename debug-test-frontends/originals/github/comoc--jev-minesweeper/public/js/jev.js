// 盤面を Jev（TypeSafe System One API）への1リクエストに変換する。
//
// 設計方針（TypeSafe の jaggedness ドキュメントに沿う）
//  - 算術はコード側で済ませる：「数字 − 周囲の旗」を先に計算して「あと何個」を渡す
//  - 各質問には、その判断に必要な手がかりだけを載せる（無関係な盤面全体は渡さない）
//  - 質問は「このセルは地雷か？」という1つの Noul だけ。全境界セル分を1回で並列に聞く
//  - Jev は英語が最も得意なので、Jev に渡す文面は英語にする

export const PROMPT_STYLES = {
  digested: "前処理あり（算術はコード）",
  raw: "生の数字だけ（算術もJev）",
};

// エージェント（プレイヤー）から見た手がかり。旗は「地雷だと信じているセル」として扱う。
export function analyzeClues(view) {
  const clues = [];
  const cluesOfCell = new Map(); // 未開封セル -> そのセルを含む手がかり
  const contradictions = []; // 周囲の旗が数字を超えている数字セル
  for (let i = 0; i < view.n; i++) {
    if (!view.revealed[i] || view.counts[i] === 255) continue;
    const hidden = [];
    const flags = [];
    for (const j of view.neighbors[i]) {
      if (view.revealed[j]) continue;
      (view.flagged[j] ? flags : hidden).push(j);
    }
    const left = view.counts[i] - flags.length;
    if (left < 0) contradictions.push({ at: i, flags });
    if (!hidden.length) continue;
    const clue = { id: clues.length, at: i, number: view.counts[i], hidden, flags, left: Math.max(0, left) };
    clues.push(clue);
    for (const j of hidden) {
      let list = cluesOfCell.get(j);
      if (!list) cluesOfCell.set(j, (list = []));
      list.push(clue);
    }
  }
  return { clues, cluesOfCell, contradictions };
}

export function clueSentence(view, clue, style) {
  const at = view.names[clue.at];
  const list = clue.hidden.map((j) => view.names[j]).join(", ");
  const n = clue.hidden.length;
  const k = clue.left;
  if (style === "raw") {
    const flags = clue.flags.length ? clue.flags.map((j) => view.names[j]).join(", ") : "none";
    return `${at} shows ${clue.number}; flagged neighbours: ${flags}; hidden neighbours: ${list}`;
  }
  if (n === 1) return k === 0 ? `${at}: its only hidden cell ${list} is not a mine` : `${at}: its only hidden cell ${list} is a mine`;
  if (k === 0) return `${at}: none of these ${n} hidden cells is a mine: ${list}`;
  if (k === n) return `${at}: all ${n} of these hidden cells are mines: ${list}`;
  return `${at}: exactly ${k} of these ${n} hidden cells ${k === 1 ? "is a mine" : "are mines"}: ${list}`;
}

function sharedState(view, style) {
  let hidden = 0;
  let flags = 0;
  for (let i = 0; i < view.n; i++) {
    if (view.revealed[i]) continue;
    if (view.flagged[i]) flags++;
    else hidden++;
  }
  const rate = hidden ? Math.round((100 * Math.max(0, view.totalMines - flags)) / hidden) : 0;
  const facts =
    style === "raw"
      ? [
          "A revealed number counts the mines among its up to 8 neighbouring cells.",
          "Flagged neighbours are cells already marked as mines, and they count toward the number.",
          "Hidden neighbours are unopened, unflagged cells; each one may or may not be a mine.",
          "A hidden cell that appears next to several numbers is the same cell each time.",
        ]
      : [
          "Each clue comes from a revealed number and lists the hidden cells next to it.",
          "Each clue says exactly how many of its listed hidden cells are mines.",
          "Cells already flagged as mines are not listed, and the mine counts already exclude them.",
          "A hidden cell that appears in several clues is the same cell each time.",
          "If every cell listed by clue X is also listed by clue Y, then the cells only Y lists hold exactly Y's count minus X's count of mines.",
        ];
  return {
    game: "Minesweeper",
    facts,
    mines_among_hidden_cells: `about ${rate}%`,
  };
}

function criteriaFor(style) {
  if (style === "raw") {
    return {
      true: { meaning: "The target cell contains a mine." },
      false: { meaning: "The target cell contains no mine, so it is safe to open." },
    };
  }
  return {
    true: {
      meaning: "The target cell contains a mine.",
      certain_when: "A clue that lists the target says all of its listed hidden cells are mines.",
    },
    false: {
      meaning: "The target cell contains no mine, so it is safe to open.",
      certain_when: "A clue that lists the target says none of its listed hidden cells is a mine.",
    },
  };
}

export function questionKey(view, cell) {
  return `cell_${view.names[cell]}`;
}

/**
 * 境界セル（数字に接する未開封・旗なしのセル）ごとに Noul を1問ずつ作る。
 * @returns {{state:object, questions:object, targets:number[], keyToCell:Map<string,number>}}
 */
export function buildRequest(view, { style = "digested", maxNearby = 6 } = {}) {
  const { cluesOfCell } = analyzeClues(view);
  const state = sharedState(view, style);
  const criteria = criteriaFor(style);
  const questions = {};
  const targets = [];
  const keyToCell = new Map();

  for (const [cell, touching] of cluesOfCell) {
    const touchingSet = new Set(touching);
    // 近くの手がかり：対象セルに接する手がかりとセルを共有しているもの（部分集合の推論に必要）
    const overlap = new Map();
    for (const clue of touching) {
      for (const j of clue.hidden) {
        for (const other of cluesOfCell.get(j) || []) {
          if (touchingSet.has(other)) continue;
          overlap.set(other, (overlap.get(other) || 0) + 1);
        }
      }
    }
    const nearby = [...overlap.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].at - b[0].at)
      .slice(0, maxNearby)
      .map(([clue]) => clue);

    const instructions = {
      question: "Is the target cell a mine?",
      target_cell: view.names[cell],
      [style === "raw" ? "numbers_next_to_the_target" : "clues_that_list_the_target"]: touching.map((c) => clueSentence(view, c, style)),
    };
    if (nearby.length) {
      instructions[style === "raw" ? "other_numbers_nearby" : "other_clues_nearby"] = nearby.map((c) => clueSentence(view, c, style));
    }
    const key = questionKey(view, cell);
    questions[key] = { type: "noul", instructions, criteria };
    targets.push(cell);
    keyToCell.set(key, cell);
  }
  return { state, questions, targets, keyToCell };
}

/**
 * 質問を chunkSize 問ずつに分け、同じ state で並列に送る。
 * transport(payload) は { ok, status, data, error } を返す非同期関数（ブラウザでは /api/jev 経由）。
 */
export async function askJev(request, transport, { chunkSize = 80 } = {}) {
  const entries = Object.entries(request.questions);
  const chunks = [];
  for (let i = 0; i < entries.length; i += chunkSize) chunks.push(Object.fromEntries(entries.slice(i, i + chunkSize)));
  const t0 = performance.now();
  const results = await Promise.all(chunks.map((questions) => transport({ state: request.state, questions })));
  const latencyMs = performance.now() - t0;

  const failed = results.find((r) => !r.ok);
  if (failed) return { ok: false, status: failed.status, error: failed.error || "Jev の呼び出しに失敗しました" };

  const probs = new Map();
  const usage = { input_tokens: 0, output_tokens: 0 };
  let model = "";
  for (const r of results) {
    model = r.data.model || model;
    usage.input_tokens += r.data.usage?.input_tokens || 0;
    usage.output_tokens += r.data.usage?.output_tokens || 0;
    for (const [key, answer] of Object.entries(r.data.answers || {})) {
      const cell = request.keyToCell.get(key);
      if (cell !== undefined && typeof answer?.noul === "number") probs.set(cell, answer.noul);
    }
  }
  return { ok: true, probs, usage, model, latencyMs, requests: chunks.length, questions: entries.length };
}
