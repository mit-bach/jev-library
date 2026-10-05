// ブラウザなしで何局も打たせて数字を取る（デモ前の下調べ・ブログ用）。
//   node bench.mjs --mode hybrid --preset beginner --games 20
//   node bench.mjs --mode jev,hybrid,solver --games 30 --style raw
// 同じ --seed なら同じ盤面の並びになるので、モード・渡し方の比較が公平にできる。
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Game, PRESETS } from "./public/js/game.js";
import { think, act, createMemory, MODES } from "./public/js/agent.js";
import { Calibration } from "./public/js/evaluate.js";
import { loadDotEnv, typesafeConfig, callSystemOne } from "./lib/typesafe.mjs";

loadDotEnv(dirname(fileURLToPath(import.meta.url)));
const cfg = typesafeConfig();
const PRICE_PER_MTOK = 0.042; // jev-1.13 の入力単価（USD / 100万トークン、出力は無料）

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : "true"]);
    return acc;
  }, [])
);
const modes = (args.mode || "hybrid").split(",");
const preset = args.preset || "beginner";
const games = Number(args.games || 10);
const seed0 = Number(args.seed || 1);
const style = args.style || "digested";
const safeT = Number(args.safe || 0.05);
const mineT = Number(args.mine || 0.95);

if (!PRESETS[preset]) throw new Error(`--preset は ${Object.keys(PRESETS).join(" / ")} のいずれか`);
for (const m of modes) {
  if (!["jev", "hybrid", "solver"].includes(m)) throw new Error(`--mode は jev / hybrid / solver（カンマ区切り可）`);
  if (m !== "solver" && !cfg.apiKey) throw new Error("TYPESAFE_API_KEY が必要です（.env か環境変数で設定）");
}

const transport = async ({ state, questions }) => callSystemOne({ ...cfg, state, questions });

async function playOne(mode, seed) {
  const game = new Game({ ...PRESETS[preset], seed });
  const memory = createMemory();
  const calib = new Calibration();
  const ctx = { mode, style, safeT, mineT, memory, transport };
  const s = { turns: 0, by: { jev: 0, solver: 0, code: 0 }, calls: 0, jevTurns: 0, questions: 0, latency: 0, tokens: 0, model: "" };
  while (!game.isOver()) {
    const turn = await think(game, ctx);
    if (turn.error) throw new Error(`seed ${seed}: ${turn.error}`);
    if (turn.jev) {
      s.jevTurns++;
      s.calls += turn.jev.requests;
      s.questions += turn.jev.questions;
      s.latency += turn.jev.latencyMs;
      s.tokens += turn.jev.usage.input_tokens;
      s.model = turn.jev.model;
    }
    calib.addTurn(turn, game, ctx);
    act(game, turn, memory);
    s.turns++;
    s.by[turn.by]++;
  }
  return { won: game.status === "won", calib, ...s };
}

const fmt = (v, d = 3) => (Number.isFinite(v) ? v.toFixed(d) : "–");
const pctS = (v) => (Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : "–");

console.log(`盤面 ${PRESETS[preset].label}／${games}局 × ${modes.join(", ")}／渡し方 ${style}／開く≦${safeT} 旗≧${mineT}／seed ${seed0}〜`);
const rows = [];
for (const mode of modes) {
  const agg = { wins: 0, turns: 0, by: { jev: 0, solver: 0, code: 0 }, calls: 0, jevTurns: 0, questions: 0, latency: 0, tokens: 0, model: "" };
  const calib = new Calibration();
  for (let g = 0; g < games; g++) {
    const r = await playOne(mode, seed0 + g);
    agg.wins += r.won ? 1 : 0;
    agg.turns += r.turns;
    for (const k of Object.keys(agg.by)) agg.by[k] += r.by[k];
    agg.calls += r.calls;
    agg.jevTurns += r.jevTurns;
    agg.questions += r.questions;
    agg.latency += r.latency;
    agg.tokens += r.tokens;
    agg.model = r.model || agg.model;
    calib.merge(r.calib);
    process.stdout.write(r.won ? "o" : "x");
  }
  process.stdout.write(`  ${MODES[mode]}\n`);
  const c = calib.summary();
  rows.push({
    モード: MODES[mode],
    勝率: pctS(agg.wins / games),
    平均手数: fmt(agg.turns / games, 1),
    "Jevが決めた手": agg.turns ? pctS(agg.by.jev / agg.turns) : "–",
    "API呼出/局": fmt(agg.calls / games, 1),
    "平均レイテンシ": agg.jevTurns ? `${Math.round(agg.latency / agg.jevTurns)}ms` : "–",
    "費用/局(USD)": agg.tokens ? `$${((agg.tokens / games) * PRICE_PER_MTOK / 1e6).toFixed(5)}` : "–",
    "Brier(Jev)": fmt(c.brierJev),
    "Brier(厳密解)": fmt(c.brierExact),
    "確実な安全の検出率": pctS(c.safeRecall),
    "自信ありの誤り": c.samples ? `${c.fatal + c.wrongFlag}` : "–",
  });
  if (agg.model) console.log(`  モデル: ${agg.model}`);
}
console.table(rows);
