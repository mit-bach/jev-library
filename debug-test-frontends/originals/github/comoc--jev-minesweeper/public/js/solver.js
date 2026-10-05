// 厳密ソルバー：見えている情報だけから、各未開封セルが地雷である確率を正確に求める。
// ・旗は無視する（旗はエージェントの「信念」であって事実ではないため）
// ・同じ数字群にだけ接するセルをまとめて（グループ化）数え上げ、組合せで重み付けする
// ・盤面全体の地雷数を使い、境界の外（未知領域）も含めて正規化する
// デモでは「Jevが確信できないときの回送先（System Two）」と「答え合わせ」の二役を担う。

import { HIDDEN_COUNT } from "./game.js";

const logFactCache = [0];
function logFact(n) {
  for (let i = logFactCache.length; i <= n; i++) logFactCache[i] = logFactCache[i - 1] + Math.log(i);
  return logFactCache[n];
}
function logC(n, k) {
  if (k < 0 || k > n) return -Infinity;
  return logFact(n) - logFact(k) - logFact(n - k);
}
const SMALL_C = [];
function smallC(n, k) {
  if (!SMALL_C[n]) {
    SMALL_C[n] = [];
    for (let j = 0; j <= n; j++) SMALL_C[n][j] = Math.round(Math.exp(logC(n, j)));
  }
  return SMALL_C[n][k];
}

function convolve(a, b) {
  const out = new Float64Array(a.length + b.length - 1);
  for (let i = 0; i < a.length; i++) {
    if (!a[i]) continue;
    for (let j = 0; j < b.length; j++) out[i + j] += a[i] * b[j];
  }
  return out;
}

// 1つの連結成分を数え上げる。groups: [{size, cons:[制約ID]}], cons: [{need, groups:[グループID]}]
function enumerateComponent(groupIds, groups, cons, nodeLimit) {
  const localOf = new Map(groupIds.map((g, k) => [g, k]));
  const consIds = [...new Set(groupIds.flatMap((g) => groups[g].cons))];
  const localCons = consIds.map((ci) => ({
    need: cons[ci].need,
    groups: cons[ci].groups.map((g) => localOf.get(g)),
  }));
  const G = groupIds.length;
  const size = groupIds.map((g) => groups[g].size);
  const consOfGroup = Array.from({ length: G }, () => []);
  localCons.forEach((c, k) => c.groups.forEach((g) => consOfGroup[g].push(k)));

  // 制約をたどる幅優先順に並べると、早い段階で制約が閉じて枝刈りが効く
  const order = [];
  const seen = new Uint8Array(G);
  for (let s = 0; s < G; s++) {
    if (seen[s]) continue;
    const queue = [s];
    seen[s] = 1;
    while (queue.length) {
      const g = queue.shift();
      order.push(g);
      for (const ci of consOfGroup[g]) {
        for (const h of localCons[ci].groups) {
          if (!seen[h]) {
            seen[h] = 1;
            queue.push(h);
          }
        }
      }
    }
  }

  const maxK = size.reduce((a, b) => a + b, 0);
  const solCount = new Float64Array(maxK + 1);
  const groupMines = Array.from({ length: G }, () => new Float64Array(maxK + 1));
  const assigned = new Int32Array(localCons.length);
  const capacity = Int32Array.from(localCons, (c) => c.groups.reduce((a, g) => a + size[g], 0));
  const choice = new Int32Array(G);
  let nodes = 0;
  let aborted = false;

  function rec(pos, k, weight) {
    if (aborted) return;
    if (++nodes > nodeLimit) {
      aborted = true;
      return;
    }
    if (pos === G) {
      solCount[k] += weight;
      for (let g = 0; g < G; g++) if (choice[g]) groupMines[g][k] += weight * choice[g];
      return;
    }
    const g = order[pos];
    const sz = size[g];
    const cs = consOfGroup[g];
    for (let j = 0; j <= sz; j++) {
      let ok = true;
      let tooMany = false;
      for (const ci of cs) {
        const a = assigned[ci] + j;
        const rest = capacity[ci] - sz;
        if (a > localCons[ci].need) {
          tooMany = true;
          ok = false;
          break;
        }
        if (a + rest < localCons[ci].need) ok = false;
      }
      if (tooMany) break;
      if (!ok) continue;
      for (const ci of cs) {
        assigned[ci] += j;
        capacity[ci] -= sz;
      }
      choice[g] = j;
      rec(pos + 1, k + j, weight * smallC(sz, j));
      choice[g] = 0;
      for (const ci of cs) {
        assigned[ci] -= j;
        capacity[ci] += sz;
      }
    }
  }
  rec(0, 0, 1);

  if (aborted) {
    // 数え上げが大きすぎる場合の近似：各グループの確率を「関係する数字の密度の平均」で代用
    const p = groupIds.map((g) => {
      const list = groups[g].cons.map((ci) => cons[ci].need / cons[ci].groups.reduce((a, h) => a + groups[h].size, 0));
      return Math.min(1, Math.max(0, list.reduce((a, b) => a + b, 0) / list.length));
    });
    const expected = Math.round(p.reduce((a, pg, i) => a + pg * size[i], 0));
    solCount.fill(0);
    solCount[expected] = 1;
    groupMines.forEach((arr, i) => {
      arr.fill(0);
      arr[expected] = p[i] * size[i];
    });
  }
  return { groupIds, size, solCount, groupMines, aborted, nodes };
}

/**
 * @param view game.publicView() の戻り値（旗は無視する）
 * @returns {{prob: Float64Array, certainSafe: number[], certainMine: number[], exact: boolean,
 *            frontier: number[], sea: number[], seaProb: number}}
 */
export function solve(view, { nodeLimit = 2_000_000 } = {}) {
  const { n, revealed, counts, neighbors, totalMines } = view;

  // 1) 数字ごとの制約：「この未開封セル群のうち、ちょうど need 個が地雷」
  const cons = [];
  const consOfCell = new Map();
  for (let i = 0; i < n; i++) {
    if (!revealed[i] || counts[i] === HIDDEN_COUNT) continue;
    const hidden = neighbors[i].filter((j) => !revealed[j]);
    if (!hidden.length) continue;
    const id = cons.length;
    cons.push({ at: i, need: counts[i], cells: hidden, groups: [] });
    for (const j of hidden) {
      let list = consOfCell.get(j);
      if (!list) consOfCell.set(j, (list = []));
      list.push(id);
    }
  }

  // 2) まったく同じ制約集合に属するセルを1グループにまとめる
  const bySig = new Map();
  for (const [cell, list] of consOfCell) {
    const sig = list.join(",");
    let g = bySig.get(sig);
    if (!g) bySig.set(sig, (g = { cells: [], cons: list, size: 0 }));
    g.cells.push(cell);
    g.size++;
  }
  const groups = [...bySig.values()];
  groups.forEach((g, gi) => g.cons.forEach((ci) => cons[ci].groups.push(gi)));

  // 3) 制約でつながったグループを連結成分に分ける
  const parent = groups.map((_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  for (const c of cons) {
    for (let k = 1; k < c.groups.length; k++) {
      const a = find(c.groups[0]);
      const b = find(c.groups[k]);
      if (a !== b) parent[a] = b;
    }
  }
  const compMap = new Map();
  groups.forEach((_, gi) => {
    const r = find(gi);
    if (!compMap.has(r)) compMap.set(r, []);
    compMap.get(r).push(gi);
  });

  // 4) 成分ごとに数え上げ（スケールを揃えるため最大値で正規化）
  let exact = true;
  const comps = [];
  for (const gids of compMap.values()) {
    const c = enumerateComponent(gids, groups, cons, nodeLimit);
    if (c.aborted) exact = false;
    const scale = Math.max(...c.solCount) || 1;
    c.N = c.solCount.map((v) => v / scale);
    c.W = c.groupMines.map((arr) => arr.map((v) => v / scale));
    comps.push(c);
  }

  // 5) 盤面全体の地雷数で結合する（境界外 S マスに残りの地雷が C(S, M-K) 通り）
  const sea = [];
  for (let i = 0; i < n; i++) if (!revealed[i] && !consOfCell.has(i)) sea.push(i);
  const S = sea.length;
  const M = totalMines;

  let total = new Float64Array([1]);
  for (const c of comps) total = convolve(total, c.N);
  const Kmax = total.length - 1;
  const kLo = Math.max(0, M - S);
  const kHi = Math.min(Kmax, M);

  // cw[K] = C(S, M-K) を有効範囲内の最大値で割ったもの（桁あふれ防止）
  let ref = -Infinity;
  for (let K = kLo; K <= kHi; K++) ref = Math.max(ref, logC(S, M - K));
  const cw = new Float64Array(Kmax + 1);
  for (let K = kLo; K <= kHi; K++) cw[K] = Math.exp(logC(S, M - K) - ref);

  let Z = 0;
  let seaMinesTimesZ = 0;
  for (let K = 0; K <= Kmax; K++) {
    Z += total[K] * cw[K];
    seaMinesTimesZ += total[K] * cw[K] * (M - K);
  }

  const prob = new Float64Array(n).fill(NaN);
  const certainSafe = [];
  const certainMine = [];

  if (!(Z > 0)) {
    // 情報が矛盾している（通常は起こらない）。一様分布で返す。
    let hiddenCount = 0;
    for (let i = 0; i < n; i++) if (!revealed[i]) hiddenCount++;
    for (let i = 0; i < n; i++) if (!revealed[i]) prob[i] = Math.min(1, M / Math.max(1, hiddenCount));
    return { prob, certainSafe, certainMine, exact: false, frontier: [...consOfCell.keys()], sea, seaProb: NaN };
  }

  comps.forEach((c, ci) => {
    let others = new Float64Array([1]);
    comps.forEach((d, di) => {
      if (di !== ci) others = convolve(others, d.N);
    });
    const Gk = new Float64Array(c.N.length);
    for (let k = 0; k < c.N.length; k++) {
      let s = 0;
      for (let K2 = 0; K2 < others.length; K2++) {
        const K = k + K2;
        if (K <= Kmax && cw[K]) s += others[K2] * cw[K];
      }
      Gk[k] = s;
    }
    c.groupIds.forEach((g, local) => {
      const sz = c.size[local];
      let num = 0;
      let everSafe = true;
      let everMine = true;
      for (let k = 0; k < c.N.length; k++) {
        if (!(c.N[k] > 0 && Gk[k] > 0)) continue;
        num += c.W[local][k] * Gk[k];
        if (c.W[local][k] !== 0) everSafe = false;
        if (Math.abs(c.W[local][k] - sz * c.N[k]) > 1e-12 * sz * c.N[k]) everMine = false;
      }
      const p = Math.min(1, Math.max(0, num / (sz * Z)));
      for (const cell of groups[g].cells) {
        prob[cell] = p;
        if (!c.aborted && everSafe) certainSafe.push(cell);
        else if (!c.aborted && everMine) certainMine.push(cell);
      }
    });
  });

  const seaProb = S ? Math.min(1, Math.max(0, seaMinesTimesZ / (Z * S))) : NaN;
  for (const cell of sea) {
    prob[cell] = seaProb;
    if (exact && seaMinesTimesZ === 0) certainSafe.push(cell);
    else if (exact && seaProb > 1 - 1e-12) certainMine.push(cell);
  }

  return { prob, certainSafe, certainMine, exact, frontier: [...consOfCell.keys()], sea, seaProb };
}
