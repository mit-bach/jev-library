// npm test で実行。外部依存なし。実APIは呼ばない（モックの transport を使う）。
import assert from "node:assert/strict";
import { Game, PRESETS, makeRng } from "../public/js/game.js";
import { solve } from "../public/js/solver.js";
import { buildRequest, askJev } from "../public/js/jev.js";
import { think, act, createMemory } from "../public/js/agent.js";
import { Calibration } from "../public/js/evaluate.js";

let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`ok  ${name}`);
  } catch (e) {
    console.error(`NG  ${name}`);
    console.error(e);
    process.exitCode = 1;
  }
}

// "*" が地雷のレイアウトから、配置済みのゲームを作る
function gameFromLayout(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const mines = rows.join("").split("").filter((c) => c === "*").length;
  const g = new Game({ w, h, mines, seed: 1 });
  rows.forEach((row, y) => [...row].forEach((c, x) => (g.mine[y * w + x] = c === "*" ? 1 : 0)));
  for (let i = 0; i < g.n; i++) g.counts[i] = g.neighbors[i].reduce((a, j) => a + g.mine[j], 0);
  g.status = "playing";
  return g;
}

function bruteForce(view) {
  const hidden = [];
  for (let i = 0; i < view.n; i++) if (!view.revealed[i]) hidden.push(i);
  const M = view.totalMines;
  const hits = new Map(hidden.map((c) => [c, 0]));
  let total = 0;
  const isMine = new Uint8Array(view.n);
  const numbered = [];
  for (let i = 0; i < view.n; i++) if (view.revealed[i] && view.counts[i] !== 255) numbered.push(i);
  function rec(start, left) {
    if (left === 0) {
      for (const i of numbered) {
        let c = 0;
        for (const j of view.neighbors[i]) c += isMine[j];
        if (c !== view.counts[i]) return;
      }
      total++;
      for (const c of hidden) if (isMine[c]) hits.set(c, hits.get(c) + 1);
      return;
    }
    for (let k = start; k <= hidden.length - left; k++) {
      isMine[hidden[k]] = 1;
      rec(k + 1, left - 1);
      isMine[hidden[k]] = 0;
    }
  }
  rec(0, M);
  return { total, prob: new Map([...hits].map(([c, h]) => [c, h / total])) };
}

await test("初手とその周囲には地雷が置かれない／0は連鎖して開く", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const g = new Game({ ...PRESETS.intermediate, seed });
    const c = g.center();
    const opened = g.reveal(c);
    assert.equal(g.mine[c], 0);
    for (const j of g.neighbors[c]) assert.equal(g.mine[j], 0);
    assert.ok(opened.length >= 9, "初手は空白（0）なので9マス以上開く");
    let m = 0;
    for (let i = 0; i < g.n; i++) m += g.mine[i];
    assert.equal(m, 40);
  }
});

await test("安全なマスを全部開くと勝ち、地雷を開くと負け", () => {
  const g = new Game({ ...PRESETS.beginner, seed: 7 });
  g.reveal(g.center());
  for (let i = 0; i < g.n; i++) if (!g.mine[i]) g.reveal(i);
  assert.equal(g.status, "won");
  const h = new Game({ ...PRESETS.beginner, seed: 7 });
  h.reveal(h.center());
  const mine = h.mine.indexOf(1);
  h.reveal(mine);
  assert.equal(h.status, "lost");
  assert.equal(h.explodedAt, mine);
});

await test("厳密ソルバーの確率が総当たりと一致する（ランダム300局面）", () => {
  const rng = makeRng(12345);
  let checked = 0;
  for (let t = 0; t < 300; t++) {
    const w = 4 + Math.floor(rng() * 3);
    const h = 4 + Math.floor(rng() * 2);
    const mines = 3 + Math.floor(rng() * 4);
    const g = new Game({ w, h, mines, seed: 1000 + t });
    g.reveal(Math.floor(rng() * g.n));
    if (g.isOver()) continue;
    const extra = Math.floor(rng() * 3);
    for (let k = 0; k < extra && !g.isOver(); k++) {
      const safe = [];
      for (let i = 0; i < g.n; i++) if (!g.revealed[i] && !g.mine[i]) safe.push(i);
      if (safe.length) g.reveal(safe[Math.floor(rng() * safe.length)]);
    }
    if (g.isOver()) continue;
    const view = g.publicView();
    const bf = bruteForce(view);
    const s = solve(view);
    assert.ok(s.exact);
    for (const [cell, p] of bf.prob) {
      assert.ok(Math.abs(s.prob[cell] - p) < 1e-9, `cell ${g.names[cell]}: solver ${s.prob[cell]} vs brute ${p}`);
      assert.equal(s.certainSafe.includes(cell), p === 0, `certainSafe mismatch at ${g.names[cell]}`);
      assert.equal(s.certainMine.includes(cell), p === 1, `certainMine mismatch at ${g.names[cell]}`);
    }
    checked++;
  }
  assert.ok(checked > 150, `検証できた局面が少なすぎる: ${checked}`);
});

await test("旗はソルバーに影響しない（誤った旗があっても確率は同じ）", () => {
  const g = new Game({ ...PRESETS.beginner, seed: 3 });
  g.reveal(g.center());
  const a = solve(g.publicView());
  for (let i = 0; i < g.n; i++) if (!g.revealed[i] && !g.mine[i]) { g.setFlag(i, true); break; }
  const b = solve(g.publicView());
  for (let i = 0; i < g.n; i++) if (!g.revealed[i]) assert.equal(a.prob[i], b.prob[i]);
});

await test("上級の途中局面でもソルバーが時間内に終わる", () => {
  for (let seed = 1; seed <= 30; seed++) {
    const g = new Game({ ...PRESETS.expert, seed });
    g.reveal(g.center());
    const t0 = performance.now();
    for (let step = 0; step < 60 && !g.isOver(); step++) {
      const s = solve(g.publicView());
      for (let i = 0; i < g.n; i++) if (!g.revealed[i]) assert.ok(s.prob[i] >= 0 && s.prob[i] <= 1);
      const target = s.certainSafe.length ? s.certainSafe[0] : [...Array(g.n).keys()].filter((i) => !g.revealed[i] && !g.mine[i])[0];
      g.reveal(target);
    }
    assert.ok(performance.now() - t0 < 15000);
  }
});

await test("Jevへの質問：算術はコードで済ませた文になっている", () => {
  // A1 は地雷。B2 を開くと「1」、周囲の未開封は A1 A2 A3 B1 B3 C1 C2 C3
  const g = gameFromLayout(["*...", "....", "...."]);
  g.reveal(g.index(1, 1));
  let req = buildRequest(g.publicView());
  const q = req.questions["cell_A1"];
  assert.equal(q.type, "noul");
  assert.equal(q.instructions.target_cell, "A1");
  assert.ok(q.instructions.clues_that_list_the_target.some((s) => /^B2: exactly 1 of these \d hidden cells is a mine/.test(s)));
  assert.ok(q.criteria.true.meaning && q.criteria.false.meaning);
  assert.ok(req.state.facts.length >= 4);
  assert.match(req.state.mines_among_hidden_cells, /^about \d+%$/);

  // A1 に旗を立てると B2 は「残り0個」になる
  g.setFlag(0, true);
  req = buildRequest(g.publicView());
  assert.equal(req.questions["cell_A1"], undefined, "旗のマスには質問しない");
  assert.ok(req.questions["cell_A2"].instructions.clues_that_list_the_target.some((s) => s.startsWith("B2: none of these")));

  const raw = buildRequest(g.publicView(), { style: "raw" });
  assert.ok(raw.questions["cell_A2"].instructions.numbers_next_to_the_target.some((s) => s === "B2 shows 1; flagged neighbours: A1; hidden neighbours: B1, C1, A2, C2, A3, B3, C3"));
});

await test("askJev：質問を分割して並列送信し、確率とトークンを集計する", async () => {
  const g = new Game({ ...PRESETS.expert, seed: 11 });
  g.reveal(g.center());
  const req = buildRequest(g.publicView());
  const n = req.targets.length;
  const calls = [];
  const transport = async (payload) => {
    calls.push(Object.keys(payload.questions).length);
    assert.deepEqual(payload.state, req.state);
    const answers = Object.fromEntries(Object.keys(payload.questions).map((k) => [k, { type: "noul", noul: 0.25 }]));
    return { ok: true, status: 200, data: { model: "jev-mock", answers, usage: { input_tokens: 100, output_tokens: 3 } } };
  };
  const res = await askJev(req, transport, { chunkSize: 10 });
  assert.ok(res.ok);
  assert.equal(res.probs.size, n);
  assert.equal(calls.reduce((a, b) => a + b, 0), n);
  assert.equal(res.usage.input_tokens, 100 * calls.length);
  const fail = await askJev(req, async () => ({ ok: false, status: 422, error: "bad" }));
  assert.equal(fail.ok, false);
  assert.equal(fail.status, 422);
});

// ---- ゲーム全体を回す（モックの Jev） ----
function oracleTransport(game, noise = 0, rng = Math.random) {
  // 厳密解を「Jevの答え」として返す（noise で揺らす）。配管の検証用。
  return async (payload) => {
    const s = solve(game.publicView());
    const answers = {};
    for (const key of Object.keys(payload.questions)) {
      const name = key.slice(5);
      const cell = game.names.indexOf(name);
      let p = s.prob[cell] + (rng() * 2 - 1) * noise;
      answers[key] = { type: "noul", noul: Math.min(1, Math.max(0, p)) };
    }
    return { ok: true, status: 200, data: { model: "mock", answers, usage: { input_tokens: 50, output_tokens: 1 } } };
  };
}

async function playGame(preset, seed, mode, transportFactory) {
  const game = new Game({ ...PRESETS[preset], seed });
  const memory = createMemory();
  const calib = new Calibration();
  const ctx = { mode, style: "digested", safeT: 0.05, mineT: 0.95, memory, transport: transportFactory ? transportFactory(game) : null };
  let turns = 0;
  const by = { jev: 0, solver: 0, code: 0 };
  while (!game.isOver()) {
    const turn = await think(game, ctx);
    if (turn.error) throw new Error(turn.error);
    calib.addTurn(turn, game, ctx);
    act(game, turn, memory);
    by[turn.by]++;
    if (++turns > 2000) throw new Error("終わらない");
  }
  return { won: game.status === "won", turns, by, calib };
}

await test("ソルバーだけ：初級の勝率が妥当（配管とソルバーの総合確認）", async () => {
  let wins = 0;
  for (let s = 1; s <= 200; s++) wins += (await playGame("beginner", s, "solver")).won ? 1 : 0;
  console.log(`    初級 200局: ${wins} 勝`);
  assert.ok(wins >= 160, `勝率が低すぎる: ${wins}/200`);
});

await test("Jevだけ／Jev＋ソルバー：正確なモックなら同程度に勝てる", async () => {
  for (const mode of ["jev", "hybrid"]) {
    let wins = 0;
    let jevMoves = 0;
    let total = 0;
    for (let s = 1; s <= 60; s++) {
      const r = await playGame("beginner", s, mode, (g) => oracleTransport(g));
      wins += r.won ? 1 : 0;
      jevMoves += r.by.jev;
      total += r.turns;
    }
    console.log(`    ${mode}: 60局 ${wins} 勝、Jevが決めた手 ${jevMoves}/${total}`);
    assert.ok(wins >= 45, `${mode} の勝率が低すぎる: ${wins}/60`);
  }
});

await test("でたらめな確率を返すモックでも必ず終局する（旗の修復・行き詰まり対策）", async () => {
  const rng = makeRng(99);
  const randomTransport = () => async (payload) => ({
    ok: true,
    status: 200,
    data: { model: "mock", answers: Object.fromEntries(Object.keys(payload.questions).map((k) => [k, { type: "noul", noul: rng() }])), usage: {} },
  });
  for (const preset of ["beginner", "intermediate", "expert"]) {
    for (let s = 1; s <= 15; s++) {
      for (const mode of ["jev", "hybrid"]) await playGame(preset, s, mode, randomTransport);
    }
  }
});

await test("誤った旗は矛盾検出で外される", async () => {
  const g = gameFromLayout(["*...", "....", "...."]);
  g.reveal(g.index(1, 1)); // B2 = 1
  g.setFlag(g.index(0, 1), true); // A2（安全）に誤って旗
  g.setFlag(0, true); // A1（地雷）にも旗 → B2 の周りの旗が 2 > 1
  const memory = createMemory();
  const turn = await think(g, { mode: "jev", style: "digested", safeT: 0.05, mineT: 0.95, memory, transport: oracleTransport(g) });
  assert.equal(g.flagged[0], 0);
  assert.equal(g.flagged[g.index(0, 1)], 0);
  assert.ok(turn.notes[0].includes("旗の矛盾"));
});

await test("中級・上級の質問サイズが API の上限（64k トークン）に十分収まる", () => {
  for (const preset of ["intermediate", "expert"]) {
    let worst = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const g = new Game({ ...PRESETS[preset], seed });
      g.reveal(g.center());
      for (let k = 0; k < 25 && !g.isOver(); k++) {
        const s = solve(g.publicView());
        g.reveal(s.certainSafe[0] ?? [...Array(g.n).keys()].find((i) => !g.revealed[i] && !g.mine[i]));
      }
      if (g.isOver()) continue;
      const req = buildRequest(g.publicView());
      const chars = JSON.stringify(req.state).length + JSON.stringify(req.questions).length;
      worst = Math.max(worst, chars);
    }
    console.log(`    ${preset}: 最大 ${worst} 文字（概算 ${Math.round(worst / 3.5)} トークン、80問ずつ分割送信）`);
    assert.ok(worst / 3.5 < 64000 * 2);
  }
});

console.log(`\n${passed} 件成功`);
