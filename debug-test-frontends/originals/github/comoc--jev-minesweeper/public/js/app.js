// 画面の配線：盤面の描画、操作、手の記録、評価の表示。
// ゲームの規則は game.js、手の決め方は agent.js、Jev への質問の組み立ては jev.js にある。
import { Game, PRESETS, colName } from "./game.js";
import { think, act, createMemory, MODES, pct } from "./agent.js";
import { PROMPT_STYLES, questionKey, analyzeClues, clueSentence } from "./jev.js";
import { solve } from "./solver.js";
import { Calibration } from "./evaluate.js";

const PRICE_PER_MTOK = 0.042; // jev-1.13 の入力単価（USD／100万トークン。出力は無料）
const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nf = new Intl.NumberFormat("ja-JP");
const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);
const pct1 = (v) => (Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : "–");
const needsKey = (mode) => mode === "jev" || mode === "hybrid";

const el = {
  conn: $("conn"),
  preset: $("preset"),
  seed: $("seed"),
  newBoard: $("newBoard"),
  sameBoard: $("sameBoard"),
  modeSeg: $("modeSeg"),
  jevOptions: $("jevOptions"),
  style: $("style"),
  safeT: $("safeT"),
  safeOut: $("safeOut"),
  mineT: $("mineT"),
  mineOut: $("mineOut"),
  autoRow: $("autoRow"),
  step: $("step"),
  run: $("run"),
  delay: $("delay"),
  autoNext: $("autoNext"),
  manualRow: $("manualRow"),
  hint: $("hint"),
  flagMode: $("flagMode"),
  heatSeg: $("heatSeg"),
  board: $("board"),
  boardWrap: document.querySelector(".board-wrap"),
  status: $("status"),
  gameStats: $("gameStats"),
  calib: $("calib"),
  calibStats: $("calibStats"),
  scoreTable: $("scoreTable"),
  inspect: $("inspect"),
  log: $("log"),
  legendNote: document.querySelector(".legend-note"),
};
const INSPECT_HINT = el.inspect.innerHTML;

const MINE_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><g stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
  '<path d="M12 2.8v18.4M2.8 12h18.4M5.5 5.5l13 13M18.5 5.5l-13 13"/></g>' +
  '<circle cx="12" cy="12" r="6.3" fill="currentColor"/><circle cx="9.7" cy="9.7" r="1.7" fill="#fff" opacity=".8"/></svg>';
const FLAG_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3.5v16" stroke="#15222b" stroke-width="2.2" stroke-linecap="round"/>' +
  '<path d="M9 4h10l-3 4.2 3 4.2H9z" fill="#d2402b"/><path d="M4.8 20.5h7.4" stroke="#15222b" stroke-width="2.2" stroke-linecap="round"/></svg>';

const START = {
  jev: "「1手進める」か「自動で解く」で始めます。初手は中央、その後は Jev の確率だけで手を決めます。",
  hybrid: "「1手進める」か「自動で解く」で始めます。Jev が確信できる手は Jev に、確信できないときは厳密ソルバーに任せます。",
  solver: "「1手進める」か「自動で解く」で始めます。比較用に、厳密ソルバーだけで解きます（APIキー不要）。",
  manual: "好きなマスを開いてください。初手とその周りに地雷はありません。「Jevに聞く」で各マスの地雷の確率を色で表示します。",
};
const BY_LABEL = { jev: "Jev", solver: "ソルバー", code: "コード", you: "あなた" };

const S = {
  server: { reachable: false, hasKey: false, model: "", mock: false },
  preset: "beginner",
  seed: 1,
  mode: "solver",
  style: "digested",
  safeT: 0.05,
  mineT: 0.95,
  heat: "jev",
  heatAuto: false,
  compact: false,
  // いまのゲーム
  gen: 0,
  game: null,
  memory: null,
  moves: 0,
  by: {},
  modesUsed: new Set(),
  jev: {},
  probs: null, // 直近の Jev の確率 Map(cell -> p)
  probsTurn: 0,
  fresh: false, // その確率を得たあと盤面が変わっていないか
  asked: new Map(), // cell -> { request, no, p }：そのマスを最後に聞いた質問
  exactCache: null,
  asking: new Set(),
  marks: new Map(), // cell -> "jev" | "solver" | "code"：直前の手（または Jev のおすすめ）
  picked: -1,
  hover: -1,
  focus: 0,
  inspected: -1,
  hintSig: "",
  busy: false,
  running: false,
  runToken: 0, // 古い自動実行ループが新しいループを止めないための番号
  // セッション全体
  calib: new Calibration(),
  score: {},
};

/* ---------------- 中継サーバ ---------------- */

async function transport(payload) {
  try {
    const res = await fetch("/api/jev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` };
    return { ok: true, status: res.status, data };
  } catch {
    return { ok: false, status: 0, error: "中継サーバに接続できません。npm start でサーバを起動してから開き直してください" };
  }
}

async function checkServer() {
  try {
    const res = await fetch("/api/config", { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const c = await res.json();
    S.server = { reachable: true, hasKey: Boolean(c.hasKey), model: c.model || "", mock: Boolean(c.mock) };
  } catch {
    S.server = { reachable: false, hasKey: false, model: "", mock: false };
  }
  const { reachable, hasKey, model, mock } = S.server;
  let state = "ok";
  let text = `Jev に接続できます（モデル ${model}）`;
  if (!reachable) {
    state = "down";
    text = "中継サーバが見つかりません。npm start で起動し、表示された URL から開いてください。ソルバーと手動プレイは使えます";
  } else if (mock) {
    state = "mock";
    text = "モックで動作中：本物の Jev ではなく、簡単な規則で答えています（配線確認用）";
  } else if (!hasKey) {
    state = "nokey";
    text = "APIキー未設定：ソルバーと手動プレイだけ使えます。.env に TYPESAFE_API_KEY を書いてサーバを再起動してください";
  }
  el.conn.dataset.state = state;
  el.conn.textContent = text;
}

/* ---------------- 色 ---------------- */

// 凡例のグラデーション（安全 0% → 注意 30% → 地雷 100%）と同じ位置で補間する
const RAMP = [
  [0, [30, 158, 139]],
  [0.3, [230, 185, 60]],
  [1, [210, 64, 43]],
];
const TILE = [167, 180, 190];
const INK = [21, 34, 43];
const mixRGB = (a, b, t) => a.map((v, k) => Math.round(v + (b[k] - v) * t));

// 中間色が濁らないよう OKLab で補間する（凡例の CSS も in oklab）
const toLin = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const fromLin = (v) => {
  const s = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(0, v) ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, s)) * 255);
};
function toOklab(rgb) {
  const [r, g, b] = rgb.map(toLin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
function fromOklab([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    fromLin(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLin(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLin(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}
const RAMP_LAB = RAMP.map(([p, rgb]) => [p, toOklab(rgb)]);

function heatRGB(p) {
  const v = Math.min(1, Math.max(0, p));
  for (let k = 1; k < RAMP_LAB.length; k++) {
    const [p0, c0] = RAMP_LAB[k - 1];
    const [p1, c1] = RAMP_LAB[k];
    if (v <= p1) {
      const t = (v - p0) / (p1 - p0);
      return fromOklab(c0.map((x, j) => x + (c1[j] - x) * t));
    }
  }
  return RAMP[RAMP.length - 1][1];
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const INK_L = luminance(INK);
// 白と墨色のうち、背景とのコントラストが高い方を文字色にする
function inkOn(rgb) {
  const L = luminance(rgb);
  return 1.05 / (L + 0.05) >= (L + 0.05) / (INK_L + 0.05) ? "#fff" : "#15222b";
}

function cellText(p) {
  const v = p * 100;
  const t = v > 0 && v < 1 ? "&lt;1" : v > 99 && v < 100 ? "&gt;99" : String(Math.round(v));
  return S.compact ? t : `${t}<small>%</small>`;
}

/* ---------------- 盤面 ---------------- */

let cells = [];
let cellKeys = [];

function currentExact() {
  const g = S.game;
  if (g.status !== "playing") return null;
  const sig = `${S.gen}:${g.revealedCount}`; // 旗はソルバーに影響しないので、開いたマス数で盤面が決まる
  if (S.exactCache?.sig !== sig) S.exactCache = { sig, result: solve(g.publicView()) };
  return S.exactCache.result;
}

function buildBoard() {
  const g = S.game;
  const frag = document.createDocumentFragment();
  const head = document.createElement("div");
  head.className = "r";
  head.setAttribute("role", "row");
  const corner = document.createElement("span");
  corner.className = "corner";
  corner.setAttribute("role", "columnheader");
  head.append(corner);
  for (let x = 0; x < g.w; x++) {
    const h = document.createElement("span");
    h.className = "axis col";
    h.setAttribute("role", "columnheader");
    h.textContent = colName(x);
    head.append(h);
  }
  frag.append(head);

  cells = new Array(g.n);
  cellKeys = new Array(g.n).fill("");
  for (let y = 0; y < g.h; y++) {
    const row = document.createElement("div");
    row.className = "r";
    row.setAttribute("role", "row");
    const rh = document.createElement("span");
    rh.className = "axis";
    rh.setAttribute("role", "rowheader");
    rh.textContent = String(y + 1);
    row.append(rh);
    for (let x = 0; x < g.w; x++) {
      const i = y * g.w + x;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cell";
      b.dataset.i = String(i);
      b.setAttribute("role", "gridcell");
      b.tabIndex = i === S.focus ? 0 : -1;
      cells[i] = b;
      row.append(b);
    }
    frag.append(row);
  }
  el.board.replaceChildren(frag);
  el.board.style.setProperty("--cols", String(g.w));
  sizeBoard();
}

function sizeBoard() {
  const g = S.game;
  if (!g || !cells.length) return;
  const avail = el.boardWrap.clientWidth - 4;
  const fixed = 6 + 12 + 2 + 28 + 2 * g.w; // 盤の余白・枠・行番号・マス間のすき間
  const cs = Math.max(22, Math.min(44, Math.floor((avail - fixed) / g.w), Math.floor(620 / g.h)));
  el.board.style.setProperty("--cs", `${cs}px`);
  const compact = cs < 34;
  if (compact !== S.compact) {
    S.compact = compact;
    cellKeys.fill("");
    renderBoard();
  }
}

function renderBoard() {
  const g = S.game;
  const over = g.isOver();
  const heat = over ? "none" : S.heat;
  const exact = heat === "exact" ? currentExact() : null;
  // 厳密解の色分けも、Jev と同じく数字に接したマスだけ（未知領域は一律の値なので凡例に書く）
  const frontier = exact ? (exact.frontierSet ||= new Set(exact.frontier)) : null;
  for (let i = 0; i < g.n; i++) {
    let cls = "cell";
    let html = "";
    let label = g.names[i];
    let hv = "";
    let ink = "";
    if (g.revealed[i]) {
      if (g.mine[i]) {
        cls += " exploded";
        html = MINE_SVG;
        label += "、踏んだ地雷";
      } else {
        const c = g.counts[i];
        cls += " open";
        if (c) {
          cls += ` n${c}`;
          html = String(c);
        }
        label += c ? `、${c}` : "、空白";
      }
    } else if (over) {
      if (g.mine[i] && g.flagged[i]) {
        html = FLAG_SVG;
        label += "、旗（正解）";
      } else if (g.mine[i]) {
        cls += " mine-shown";
        html = MINE_SVG;
        label += "、地雷";
      } else if (g.flagged[i]) {
        cls += " wrong-flag";
        html = FLAG_SVG;
        label += "、旗（誤り）";
      } else label += "、未開封";
    } else if (g.flagged[i]) {
      html = FLAG_SVG;
      label += "、旗";
    } else {
      let p = NaN;
      let stale = false;
      if (heat === "jev" && S.probs?.has(i)) {
        p = S.probs.get(i);
        stale = !S.fresh;
      } else if (frontier?.has(i)) p = exact.prob[i];
      label += "、未開封";
      if (Number.isFinite(p)) {
        const rgb = heatRGB(p);
        cls += stale ? " heat stale" : " heat";
        hv = `rgb(${rgb.join(",")})`;
        ink = inkOn(stale ? mixRGB(rgb, TILE, 0.55) : rgb);
        html = `<span class="p">${cellText(p)}</span>`;
        label += `、地雷の確率 ${pct(p)}${heat === "exact" ? "（厳密解）" : "（Jev）"}`;
      }
    }
    if (S.asking.has(i)) cls += " asking";
    const mk = S.marks.get(i);
    if (mk) cls += ` mv-${mk}`;
    if (i === S.picked) cls += " picked";

    const key = `${cls}|${html}|${hv}|${ink}|${label}`;
    if (key === cellKeys[i]) continue;
    cellKeys[i] = key;
    const b = cells[i];
    b.className = cls;
    b.innerHTML = html;
    if (hv) {
      b.style.setProperty("--heat", hv);
      b.style.setProperty("--heat-ink", ink);
    } else {
      b.style.removeProperty("--heat");
      b.style.removeProperty("--heat-ink");
    }
    b.setAttribute("aria-label", label);
  }

  let note = "";
  if (heat === "jev") note = `色と数字は Jev が答えた地雷の確率（%）${S.probs && !S.fresh ? "。薄い色は盤面が変わる前の答え" : ""}`;
  else if (heat === "exact")
    note = `色と数字は厳密解の地雷の確率（%）${exact?.sea.length ? `。数字に接していないマスはどれも ${pct(exact.seaProb)}` : ""}`;
  else if (!over) note = "色分けなし";
  el.legendNote.textContent = note;
}

/* ---------------- 状態表示 ---------------- */

function setStatus(text, tone = "") {
  el.status.textContent = text;
  if (tone) el.status.dataset.tone = tone;
  else delete el.status.dataset.tone;
}

function addLog({ by = "code", head = "", text, meta = "" }) {
  const li = document.createElement("li");
  li.className = `by-${by}`;
  li.innerHTML = `${head ? `<span class="turn">${esc(head)}</span>` : ""}${esc(text)}${meta ? `<span class="meta">${esc(meta)}</span>` : ""}`;
  el.log.prepend(li);
  while (el.log.children.length > 300) el.log.lastElementChild.remove();
}

const dl = (rows) => rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join("");

function renderGameStats() {
  const g = S.game;
  const j = S.jev;
  const parts = ["jev", "solver", "code", "you"]
    .filter((k) => S.by[k])
    .map((k) => (k === "jev" || k === "solver" ? `<span class="${k}">${BY_LABEL[k]} ${S.by[k]}</span>` : `${BY_LABEL[k]} ${S.by[k]}`));
  const rows = [
    ["盤面", esc(`${PRESETS[S.preset].label}、シード ${S.seed}`)],
    ["開いたマス", `${g.revealedCount} / ${g.n - g.totalMines}`],
    ["旗", `${g.flagCount()} / ${g.totalMines}`],
    ["手数", `${S.moves} 手${parts.length ? `（${parts.join("、")}）` : ""}`],
    [
      "Jevへの質問",
      j.asks ? `${j.asks} 回、計 ${nf.format(j.questions)} 問${j.calls > j.asks ? `（HTTP ${j.calls} 件に分割）` : ""}` : "まだありません",
    ],
    ["平均応答時間", j.asks ? `${nf.format(Math.round(j.latency / j.asks))} ms` : "–"],
    ["入力トークン", j.tokens ? `${nf.format(j.tokens)}（約 $${((j.tokens * PRICE_PER_MTOK) / 1e6).toFixed(5)}）` : "–"],
  ];
  if (j.model) rows.push(["モデル", esc(j.model)]);
  el.gameStats.innerHTML = dl(rows);
}

function renderCalibStats() {
  const s = S.calib.summary();
  if (!s.samples) {
    el.calibStats.innerHTML = dl([["評価したマス", "まだありません"]]);
    return;
  }
  el.calibStats.innerHTML = dl([
    ["評価したマス", `${nf.format(s.samples)} マス`],
    ["Brier スコア", `Jev ${s.brierJev.toFixed(3)}、厳密解 ${s.brierExact.toFixed(3)}（0 に近いほど良い）`],
    [
      "確実に安全なマス",
      s.certainSafe ? `${pct1(s.safeRecall)} を Jev も安全と判断（${nf.format(s.certainSafe)} マス中）` : "まだありません",
    ],
    ["自信ありの誤り", `${s.fatal + s.wrongFlag} 件（安全と判断して地雷 ${s.fatal}、地雷と判断して安全 ${s.wrongFlag}）`],
  ]);
}

function renderCalib() {
  const c = el.calib;
  const W = 260;
  const H = 200;
  const dpr = window.devicePixelRatio || 1;
  if (c.width !== Math.round(W * dpr)) {
    c.width = Math.round(W * dpr);
    c.height = Math.round(H * dpr);
  }
  const ctx = c.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim();
  const font = v("--font");
  const L = 36;
  const R = 18;
  const T = 22;
  const B = 30;
  const pw = W - L - R;
  const ph = H - T - B;
  const X = (p) => L + p * pw;
  const Y = (p) => T + (1 - p) * ph;

  ctx.fillStyle = v("--open");
  ctx.fillRect(L, T, pw, ph);
  ctx.strokeStyle = v("--paper-line");
  ctx.lineWidth = 1;
  for (const t of [0.25, 0.5, 0.75]) {
    ctx.beginPath();
    ctx.moveTo(X(t) + 0.5, T);
    ctx.lineTo(X(t) + 0.5, T + ph);
    ctx.moveTo(L, Y(t) + 0.5);
    ctx.lineTo(L + pw, Y(t) + 0.5);
    ctx.stroke();
  }
  ctx.strokeStyle = v("--tile");
  ctx.strokeRect(L + 0.5, T + 0.5, pw - 1, ph - 1);

  ctx.fillStyle = v("--ink-2");
  ctx.font = `11px ${font}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "right";
  for (const t of [0, 0.5, 1]) ctx.fillText(`${t * 100}%`, L - 5, Y(t));
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (const t of [0, 0.5, 1]) ctx.fillText(`${t * 100}%`, X(t), T + ph + 4);
  ctx.textAlign = "right";
  ctx.fillText("Jevの確率", L + pw, T + ph + 16);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("実際に地雷だった割合", L, T - 7);

  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = v("--ink-2");
  ctx.beginPath();
  ctx.moveTo(X(0), Y(0));
  ctx.lineTo(X(1), Y(1));
  ctx.stroke();
  ctx.setLineDash([]);

  const bins = S.calib.bins.filter((b) => b.n);
  if (!bins.length) {
    ctx.fillStyle = v("--ink-2");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Jev の答えが集まると点が並びます", L + pw / 2, T + ph / 2);
    return;
  }
  const maxN = Math.max(...bins.map((b) => b.n));
  const jev = v("--jev");
  for (const b of bins) {
    const x = X(b.sumP / b.n);
    const y = Y(b.mines / b.n);
    const r = 3 + 7 * Math.sqrt(b.n / maxN);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = jev;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = jev;
    ctx.stroke();
  }
}

function renderScore() {
  const order = [...Object.keys(MODES).flatMap((k) => [k, `${k}:raw`]), "mixed"].filter((k) => S.score[k]);
  const head = "<thead><tr><th>モード</th><th>局</th><th>勝率</th><th>平均手数</th><th>Jevの手</th></tr></thead>";
  if (!order.length) {
    el.scoreTable.innerHTML = `${head}<tbody><tr><td colspan="5" class="empty">終わったゲームはまだありません</td></tr></tbody>`;
    return;
  }
  const rows = order.map((k) => {
    const r = S.score[k];
    const jevShare = r.jevMoves ? pct(r.jevMoves / r.moves) : "–";
    return `<tr><td>${esc(r.label)}</td><td>${r.games}</td><td>${pct(r.wins / r.games)}</td><td>${(r.moves / r.games).toFixed(1)}</td><td>${jevShare}</td></tr>`;
  });
  el.scoreTable.innerHTML = `${head}<tbody>${rows.join("")}</tbody>`;
}

function inspect(i) {
  const g = S.game;
  if (!g || i < 0 || i >= g.n) {
    el.inspect.innerHTML = INSPECT_HINT;
    S.inspected = -1;
    return;
  }
  const over = g.isOver();
  let state;
  if (g.revealed[i]) state = g.mine[i] ? "踏んだ地雷" : g.counts[i] ? `開いたマス（周りの地雷 ${g.counts[i]} 個）` : "開いたマス（周りに地雷なし）";
  else if (over) state = g.mine[i] ? (g.flagged[i] ? "地雷（旗は正解）" : "地雷") : g.flagged[i] ? "地雷ではない（旗は誤り）" : "地雷ではない";
  else state = g.flagged[i] ? "旗を立てた未開封マス" : "未開封";
  const rows = [["状態", esc(state)]];

  const asked = S.asked.get(i);
  if (asked && Number.isFinite(asked.p)) {
    const when = asked.no === S.probsTurn && S.fresh ? "（最新の質問）" : `（${asked.no}手目の質問）`;
    rows.push(["Jevの確率", `<span class="jev">${esc(pct(asked.p))}</span>${esc(when)}`]);
  }
  if (!g.revealed[i] && g.status === "playing") {
    const ex = currentExact();
    if (ex) rows.push(["厳密解", `<span class="solver">${esc(pct(ex.prob[i]))}</span>（いまの盤面）`]);
  }
  const parts = [`<h3>${esc(g.names[i])}</h3>`, `<dl class="kv">${dl(rows)}</dl>`];

  if (g.revealed[i] && !g.mine[i] && g.counts[i] && !over) {
    const clue = analyzeClues(g.publicView()).clues.find((c) => c.at === i);
    parts.push(
      clue
        ? `<p class="fine">この数字から作る手がかり（Jev に渡す英文）</p><ul><li>${esc(clueSentence(g, clue, S.style))}</li></ul>`
        : `<p class="fine">周りに未開封のマスが残っていないので、もう手がかりには使いません。</p>`
    );
  }
  if (asked) {
    const key = questionKey(g, i);
    const q = asked.request.questions[key];
    const ins = q.instructions;
    const own = ins.clues_that_list_the_target || ins.numbers_next_to_the_target || [];
    const near = ins.other_clues_nearby || ins.other_numbers_nearby || [];
    parts.push(`<p class="fine">${asked.no}手目に Jev へ送った質問（${esc(ins.question)}）に添えた手がかり</p>`);
    parts.push(`<ul>${own.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`);
    if (near.length) parts.push(`<p class="fine">近くの手がかり</p><ul>${near.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`);
    parts.push(`<details><summary>この1問の JSON</summary><pre>${esc(JSON.stringify({ [key]: q }, null, 2))}</pre></details>`);
    parts.push(`<details><summary>全問で共有した state</summary><pre>${esc(JSON.stringify(asked.request.state, null, 2))}</pre></details>`);
  } else if (!g.revealed[i] && !g.flagged[i] && g.status === "playing") {
    const frontier = g.neighbors[i].some((j) => g.revealed[j]);
    parts.push(
      `<p class="fine">${frontier ? "このマスについてはまだ Jev に聞いていません。" : "数字に接していないマスは、Jev への質問に含めません。"}</p>`
    );
  }

  // 同じマスを表示し直すときは、開いていた JSON の折りたたみを保つ
  const keepOpen = S.inspected === i ? [...el.inspect.querySelectorAll("details")].map((d) => d.open) : [];
  el.inspect.innerHTML = parts.join("");
  el.inspect.querySelectorAll("details").forEach((d, k) => {
    if (keepOpen[k]) d.open = true;
  });
  S.inspected = i;
}

function refreshInspector() {
  const i = S.picked >= 0 ? S.picked : S.hover;
  if (i >= 0) inspect(i);
}

function syncControls() {
  const g = S.game;
  const over = g.isOver();
  const manual = S.mode === "manual";
  const blocked = needsKey(S.mode) && !S.server.hasKey;
  el.autoRow.hidden = manual;
  el.manualRow.hidden = !manual;
  el.step.disabled = S.busy || S.running || over || blocked;
  el.run.disabled = !S.running && (S.busy || blocked || (over && !el.autoNext.checked));
  el.run.textContent = S.running ? "止める" : "自動で解く";
  el.run.setAttribute("aria-pressed", String(S.running));
  el.hint.disabled = S.busy || over || !S.server.hasKey;
  el.hint.title = S.server.hasKey ? "" : "APIキーを設定すると使えます";
  const off = S.mode === "solver";
  el.jevOptions.classList.toggle("off", off);
  for (const x of el.jevOptions.querySelectorAll("select, input")) x.disabled = off;
  for (const input of el.modeSeg.querySelectorAll("input")) {
    input.disabled = needsKey(input.value) && !S.server.hasKey;
    input.checked = input.value === S.mode;
    input.parentElement.title = input.disabled ? "APIキーを設定すると使えます" : "";
  }
}

function renderAll() {
  renderBoard();
  renderGameStats();
  renderCalibStats();
  renderCalib();
  renderScore();
  syncControls();
  refreshInspector();
}

/* ---------------- ゲームの進行 ---------------- */

function newGame({ preset = S.preset, seed = S.seed, keepRunning = false } = {}) {
  if (!keepRunning) S.running = false;
  S.gen++;
  S.busy = false;
  S.preset = preset;
  S.seed = seed;
  S.game = new Game({ ...PRESETS[preset], seed });
  S.memory = createMemory();
  S.moves = 0;
  S.by = { jev: 0, solver: 0, code: 0, you: 0 };
  S.modesUsed = new Set();
  S.stylesUsed = new Set();
  S.jev = { asks: 0, calls: 0, questions: 0, latency: 0, tokens: 0, model: "" };
  S.probs = null;
  S.probsTurn = 0;
  S.fresh = false;
  S.asked = new Map();
  S.exactCache = null;
  S.asking = new Set();
  S.marks = new Map();
  S.picked = -1;
  S.hover = -1;
  S.inspected = -1;
  S.focus = S.game.center();
  S.hintSig = "";
  el.preset.value = preset;
  el.seed.value = String(seed);
  el.log.replaceChildren();
  el.inspect.innerHTML = INSPECT_HINT;
  buildBoard();
  setStatus(START[S.mode]);
  writeHash();
  renderAll();
}

function recordAsk(request, jev, no) {
  S.probs = jev.probs;
  S.probsTurn = no;
  S.fresh = true;
  for (const cell of request.targets) S.asked.set(cell, { request, no, p: jev.probs.get(cell) });
  S.jev.asks++;
  S.jev.calls += jev.requests;
  S.jev.questions += jev.questions;
  S.jev.latency += jev.latencyMs;
  S.jev.tokens += jev.usage.input_tokens;
  S.jev.model = jev.model || S.jev.model;
}

function onAsk(request) {
  S.asking = new Set(request.targets);
  setStatus(`Jev に ${request.targets.length} 問をまとめて質問しています…`);
  renderBoard();
}

/** 自動モードで1手進める。続けられるなら true を返す。 */
async function step() {
  const g = S.game;
  if (S.busy || g.isOver() || S.mode === "manual") return false;
  const gen = S.gen;
  S.busy = true;
  S.marks = new Map();
  syncControls();
  const ctx = { mode: S.mode, style: S.style, safeT: S.safeT, mineT: S.mineT, memory: S.memory, transport, onAsk };

  let turn;
  try {
    turn = await think(g, ctx);
  } catch (e) {
    turn = { error: e?.message || String(e) };
  }
  if (gen !== S.gen) return false; // 待っている間に盤面が作り直された
  S.asking = new Set();
  const no = S.moves + 1;
  if (!turn || turn.error) {
    S.busy = false;
    const msg = turn?.error || "手を決められませんでした";
    addLog({ by: "error", head: `${no}手目`, text: msg });
    setStatus(msg, "error");
    renderBoard();
    syncControls();
    return false;
  }
  if (turn.exact) S.exactCache = { sig: `${S.gen}:${g.revealedCount}`, result: turn.exact };
  if (turn.jev) {
    recordAsk(turn.request, turn.jev, no);
    S.calib.addTurn(turn, g, S);
    S.stylesUsed.add(S.style);
  }

  // 決めた手を枠で示してから打つ
  for (const c of [...turn.open, ...turn.flag]) S.marks.set(c, turn.by);
  setStatus(turn.reason);
  renderBoard();
  refreshInspector();
  const beat = Number(el.delay.value) * 0.5;
  if (beat) await sleep(beat);
  if (gen !== S.gen) return false;

  act(g, turn, S.memory);
  S.moves++;
  S.by[turn.by]++;
  S.modesUsed.add(S.mode);
  S.fresh = false;
  const meta = [];
  if (turn.opened.length) meta.push(`開いた ${turn.opened.length} マス`);
  if (turn.flag.length) meta.push(`旗 +${turn.flag.length}`);
  if (turn.unflag.length) meta.push(`旗 −${turn.unflag.length}`);
  if (turn.jev) meta.push(`Jev ${turn.jev.questions} 問 ${nf.format(Math.round(turn.jev.latencyMs))} ms`);
  meta.push(...turn.notes);
  addLog({ by: turn.by, head: `${no}手目`, text: turn.reason, meta: meta.join("、") });
  S.busy = false;
  if (g.isOver()) finishGame(turn);
  renderAll();
  return true;
}

async function toggleRun() {
  if (S.running) {
    S.running = false;
    syncControls();
    return;
  }
  const token = ++S.runToken;
  const alive = () => S.running && S.runToken === token;
  S.running = true;
  syncControls();
  while (alive()) {
    if (S.game.isOver()) {
      if (!el.autoNext.checked) break;
      await sleep(Math.max(900, Number(el.delay.value)));
      if (!alive()) break; // 待っている間に止められた、または別の実行が始まった
      newGame({ seed: S.seed >= 999999 ? 1 : S.seed + 1, keepRunning: true });
      continue;
    }
    if (!(await step())) break;
    await sleep(Number(el.delay.value));
  }
  if (S.runToken === token) {
    S.running = false;
    syncControls();
  }
}

function finishGame(lastTurn) {
  const g = S.game;
  const won = g.status === "won";
  // 成績はモードと渡し方の組ごとに集計する（途中で切り替えたゲームは「混在」）
  let key = S.modesUsed.size > 1 ? "mixed" : [...S.modesUsed][0] || S.mode;
  if (key !== "mixed" && needsKey(key)) {
    if (S.stylesUsed.size > 1) key = "mixed";
    else if (S.stylesUsed.has("raw")) key = `${key}:raw`;
  }
  const label = key === "mixed" ? "混在" : key.endsWith(":raw") ? `${MODES[key.split(":")[0]]}（生の数字）` : MODES[key];
  const row = (S.score[key] ||= { label, games: 0, wins: 0, moves: 0, jevMoves: 0 });
  row.games++;
  row.wins += won ? 1 : 0;
  row.moves += S.moves;
  row.jevMoves += S.by.jev;

  let text;
  let meta = "";
  if (won) {
    text = `勝ち：${S.moves}手ですべての安全なマスを開けました`;
    const parts = ["jev", "solver", "code", "you"].filter((k) => S.by[k]).map((k) => `${BY_LABEL[k]} ${S.by[k]}手`);
    meta = parts.join("、");
  } else {
    const c = g.explodedAt;
    const jp = lastTurn?.jev?.probs?.get(c);
    const ep = lastTurn?.exact?.prob?.[c];
    const est = [Number.isFinite(jp) ? `Jevの確率 ${pct(jp)}` : "", Number.isFinite(ep) ? `厳密解 ${pct(ep)}` : ""].filter(Boolean).join("、");
    text = `負け：${g.names[c]} は地雷でした${est ? `（${est}）` : ""}`;
    if (lastTurn?.by === "you") meta = "";
    else if (lastTurn?.guess) meta = "確実に安全なマスがなく、確率の低いマスに賭けて外れました";
    else if (lastTurn?.by === "jev") meta = "Jev が安全と判断したマスが地雷でした（自信ありの誤り）";
  }
  addLog({ by: "end", text, meta });
  setStatus(text, won ? "win" : "lose");
}

/* ---------------- 手動プレイ ---------------- */

function manualOpen(i) {
  const g = S.game;
  if (S.busy || g.isOver() || g.flagged[i]) return;
  if (g.revealed[i]) return chord(i);
  const before = g.status === "playing" ? currentExact() : null;
  const probsBefore = S.fresh ? S.probs : null;
  const opened = g.reveal(i);
  afterManual([i], opened, before, probsBefore, "開いた");
}

// 数字と周りの旗の数が一致していたら、残りの周りのマスをまとめて開く
function chord(i) {
  const g = S.game;
  const n = g.counts[i];
  if (!n) return;
  const nb = g.neighbors[i];
  const flags = nb.filter((j) => g.flagged[j]).length;
  const targets = nb.filter((j) => !g.revealed[j] && !g.flagged[j]);
  if (flags !== n || !targets.length) return;
  const before = currentExact();
  const probsBefore = S.fresh ? S.probs : null;
  const opened = [];
  for (const j of targets) {
    if (g.isOver()) break;
    opened.push(...g.reveal(j));
  }
  afterManual(targets, opened, before, probsBefore, "まとめて開いた");
}

function afterManual(targets, opened, before, probsBefore, verb) {
  const g = S.game;
  S.moves++;
  S.by.you++;
  S.modesUsed.add("manual");
  S.fresh = false;
  S.marks = new Map();
  addLog({
    by: "code",
    head: `${S.moves}手目`,
    text: `あなた：${targets.map((c) => g.names[c]).join(", ")} を${verb}`,
    meta: opened.length ? `開いた ${opened.length} マス` : "",
  });
  if (g.isOver()) finishGame({ by: "you", exact: before, jev: probsBefore ? { probs: probsBefore } : null });
  else setStatus("");
  renderAll();
}

function toggleFlag(i) {
  const g = S.game;
  if (S.busy || g.isOver() || g.revealed[i]) return;
  g.setFlag(i, !g.flagged[i]);
  S.marks.delete(i);
  renderBoard();
  renderGameStats();
  refreshInspector();
}

async function askHint() {
  const g = S.game;
  if (S.busy || g.isOver() || !S.server.hasKey) return;
  if (g.status === "ready") {
    setStatus("最初の1手はどこを開いても安全です（初手とその周りには地雷を置きません）");
    return;
  }
  const gen = S.gen;
  S.busy = true;
  syncControls();
  const ctx = {
    mode: "jev",
    style: S.style,
    safeT: S.safeT,
    mineT: S.mineT,
    memory: createMemory(),
    transport,
    repair: false, // あなたの旗は勝手に外さない
    onAsk,
  };
  let turn;
  try {
    turn = await think(g, ctx);
  } catch (e) {
    turn = { error: e?.message || String(e) };
  }
  if (gen !== S.gen) return;
  S.busy = false;
  S.asking = new Set();
  if (!turn || turn.error) {
    const msg = turn?.error || "Jev に聞けませんでした";
    addLog({ by: "error", text: msg });
    setStatus(msg, "error");
    renderAll();
    return;
  }
  if (turn.exact) S.exactCache = { sig: `${S.gen}:${g.revealedCount}`, result: turn.exact };
  if (!turn.jev) {
    setStatus("数字に接した未開封マスがないので、Jev に聞くことがありません");
    renderAll();
    return;
  }
  recordAsk(turn.request, turn.jev, S.moves + 1);
  // 盤面が同じまま何度聞いても、評価には1回分だけ数える
  const sig = `${g.revealedCount}:${Array.from(g.flagged).join("")}:${S.style}`;
  if (sig !== S.hintSig) {
    S.calib.addTurn(turn, g, S);
    S.hintSig = sig;
  }
  const sorted = [...turn.jev.probs].sort((a, b) => a[1] - b[1]);
  const safe = sorted.filter(([, p]) => p <= S.safeT).map(([c]) => c);
  const mines = sorted.filter(([, p]) => p >= S.mineT).map(([c]) => c);
  S.marks = new Map();
  let text;
  if (safe.length) {
    for (const c of safe) S.marks.set(c, "jev");
    text = `Jevの見立て：安全そうなマスが ${safe.length} 個（${pct(S.safeT)}以下、枠で表示）${mines.length ? `、地雷そうなマスが ${mines.length} 個（${pct(S.mineT)}以上）` : ""}`;
  } else {
    const [best, p] = sorted[0];
    S.marks.set(best, "jev");
    text = `Jevが安全と言い切れるマスはありません。いちばん安全そうなのは ${g.names[best]}（${pct(p)}）です`;
  }
  addLog({
    by: "jev",
    text: `Jevに聞いた：${turn.jev.questions} 問`,
    meta: `${nf.format(Math.round(turn.jev.latencyMs))} ms、入力 ${nf.format(turn.jev.usage.input_tokens)} トークン`,
  });
  setStatus(text);
  renderAll();
}

/* ---------------- 入力 ---------------- */

function setHeat(v) {
  S.heat = v;
  for (const r of el.heatSeg.querySelectorAll("input")) r.checked = r.value === v;
}

function setMode(mode) {
  S.mode = mode;
  if (mode === "manual") S.running = false;
  // ソルバーだけのときは Jev の確率がないので、色分けを厳密解に切り替える（戻すときは元に戻す）
  if (mode === "solver" && S.heat === "jev") {
    setHeat("exact");
    S.heatAuto = true;
  } else if (mode !== "solver" && S.heatAuto && S.heat === "exact") {
    setHeat("jev");
    S.heatAuto = false;
  }
  S.marks = new Map();
  if (S.game && S.game.status === "ready") setStatus(START[mode]);
  writeHash();
}

function focusCell(i) {
  if (i === S.focus || !cells[i]) return;
  if (cells[S.focus]) cells[S.focus].tabIndex = -1;
  S.focus = i;
  cells[i].tabIndex = 0;
  cells[i].focus();
}

function seedFromInput() {
  const v = Math.floor(Number(el.seed.value));
  return v >= 1 && v <= 999999 ? v : S.seed;
}

function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  return { preset: p.get("preset"), seed: Number(p.get("seed")), mode: p.get("mode"), style: p.get("style") };
}

function writeHash() {
  const p = new URLSearchParams({ preset: S.preset, seed: String(S.seed), mode: S.mode, style: S.style });
  history.replaceState(null, "", `#${p}`);
}

function syncThresholds() {
  S.safeT = Number(el.safeT.value) / 100;
  S.mineT = Number(el.mineT.value) / 100;
  el.safeOut.textContent = `${el.safeT.value}%以下`;
  el.mineOut.textContent = `${el.mineT.value}%以上`;
}

function wire() {
  el.preset.addEventListener("change", () => newGame({ preset: el.preset.value, seed: seedFromInput() }));
  el.newBoard.addEventListener("click", () => {
    const typed = seedFromInput();
    newGame({ seed: typed !== S.seed ? typed : S.seed >= 999999 ? 1 : S.seed + 1 });
  });
  el.sameBoard.addEventListener("click", () => newGame({ seed: S.seed }));
  el.seed.addEventListener("keydown", (e) => {
    if (e.key === "Enter") newGame({ seed: seedFromInput() });
  });

  el.modeSeg.addEventListener("change", (e) => {
    if (!MODES[e.target.value]) return;
    setMode(e.target.value);
    syncControls();
    renderBoard();
  });
  el.style.addEventListener("change", () => {
    S.style = el.style.value;
    writeHash();
    refreshInspector();
  });
  el.safeT.addEventListener("input", syncThresholds);
  el.mineT.addEventListener("input", syncThresholds);
  el.heatSeg.addEventListener("change", (e) => {
    S.heat = e.target.value;
    S.heatAuto = false;
    renderBoard();
  });
  el.autoNext.addEventListener("change", syncControls);

  el.step.addEventListener("click", () => step());
  el.run.addEventListener("click", () => toggleRun());
  el.hint.addEventListener("click", () => askHint());

  el.board.addEventListener("click", (e) => {
    const t = e.target.closest(".cell");
    if (!t) return;
    const i = Number(t.dataset.i);
    focusCell(i);
    if (S.mode === "manual") {
      if (el.flagMode.checked && !S.game.revealed[i]) toggleFlag(i);
      else manualOpen(i);
      S.hover = i;
      refreshInspector();
    } else {
      S.picked = S.picked === i ? -1 : i;
      renderBoard();
      inspect(i);
    }
  });
  el.board.addEventListener("contextmenu", (e) => {
    const t = e.target.closest(".cell");
    if (!t) return;
    e.preventDefault();
    if (S.mode === "manual") toggleFlag(Number(t.dataset.i));
  });
  el.board.addEventListener("mouseover", (e) => {
    const t = e.target.closest(".cell");
    if (!t || S.picked >= 0) return;
    const i = Number(t.dataset.i);
    if (i !== S.hover) {
      S.hover = i;
      inspect(i);
    }
  });
  el.board.addEventListener("focusin", (e) => {
    const t = e.target.closest(".cell");
    if (!t || S.picked >= 0) return;
    S.hover = Number(t.dataset.i);
    inspect(S.hover);
  });
  el.board.addEventListener("keydown", (e) => {
    const t = e.target.closest(".cell");
    if (!t) return;
    const g = S.game;
    const i = Number(t.dataset.i);
    const x = i % g.w;
    const y = Math.floor(i / g.w);
    let j = -1;
    if (e.key === "ArrowLeft") j = x > 0 ? i - 1 : i;
    else if (e.key === "ArrowRight") j = x < g.w - 1 ? i + 1 : i;
    else if (e.key === "ArrowUp") j = y > 0 ? i - g.w : i;
    else if (e.key === "ArrowDown") j = y < g.h - 1 ? i + g.w : i;
    else if (e.key === "Home") j = y * g.w;
    else if (e.key === "End") j = y * g.w + g.w - 1;
    else if ((e.key === "f" || e.key === "F") && S.mode === "manual") {
      e.preventDefault();
      toggleFlag(i);
      return;
    } else if (e.key === "Escape" && S.picked >= 0) {
      S.picked = -1;
      renderBoard();
      return;
    } else return;
    e.preventDefault();
    focusCell(j);
  });

  new ResizeObserver(() => sizeBoard()).observe(el.boardWrap);
  document.fonts?.ready.then(() => renderCalib());
}

async function init() {
  for (const [k, p] of Object.entries(PRESETS)) el.preset.add(new Option(p.label, k));
  for (const [k, label] of Object.entries(PROMPT_STYLES)) el.style.add(new Option(label, k));
  for (const [k, label] of Object.entries(MODES)) {
    const lab = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "mode";
    input.value = k;
    lab.append(input, ` ${label}`);
    el.modeSeg.append(lab);
  }
  el.safeT.value = String(Math.round(S.safeT * 100));
  el.mineT.value = String(Math.round(S.mineT * 100));
  syncThresholds();
  wire();

  await checkServer();
  const h = readHash();
  if (PRESETS[h.preset]) S.preset = h.preset;
  if (h.seed >= 1 && h.seed <= 999999) S.seed = Math.floor(h.seed);
  if (PROMPT_STYLES[h.style]) S.style = h.style;
  el.style.value = S.style;
  let mode = S.server.hasKey ? "jev" : "solver";
  if (MODES[h.mode] && (!needsKey(h.mode) || S.server.hasKey)) mode = h.mode;
  setMode(mode);
  newGame({ preset: S.preset, seed: S.seed });
}

init();
