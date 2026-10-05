// マインスイーパー本体（DOM非依存）。ブラウザ・bench.mjs・テストで共用する。
// 地雷は初手を打った瞬間に、初手とその周囲8マスを避けて配置する（初手は必ず空白が開く）。

export const PRESETS = {
  beginner: { w: 9, h: 9, mines: 10, label: "初級（9×9、地雷10）" },
  intermediate: { w: 16, h: 16, mines: 40, label: "中級（16×16、地雷40）" },
  expert: { w: 30, h: 16, mines: 99, label: "上級（30×16、地雷99）" },
};

// 再現性のための軽量乱数（mulberry32）
export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 0 -> A, 25 -> Z, 26 -> AA（表計算ソフトと同じ列名）
export function colName(x) {
  let s = "";
  let v = x + 1;
  while (v > 0) {
    const r = (v - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    v = Math.floor((v - 1) / 26);
  }
  return s;
}

export const HIDDEN_COUNT = 255; // publicView で未開封セルの数字を隠す番兵値

export class Game {
  constructor({ w, h, mines, seed = 1 }) {
    if (mines >= w * h) throw new Error("地雷が多すぎます");
    this.w = w;
    this.h = h;
    this.n = w * h;
    this.totalMines = mines;
    this.seed = seed;
    this.mine = new Uint8Array(this.n);
    this.revealed = new Uint8Array(this.n);
    this.flagged = new Uint8Array(this.n);
    this.counts = new Uint8Array(this.n);
    this.neighbors = [];
    for (let i = 0; i < this.n; i++) {
      const x = i % w;
      const y = Math.floor(i / w);
      const list = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < w && ny < h) list.push(ny * w + nx);
        }
      }
      this.neighbors.push(list);
    }
    this.names = Array.from({ length: this.n }, (_, i) => colName(i % w) + (Math.floor(i / w) + 1));
    this.status = "ready"; // ready | playing | won | lost
    this.revealedCount = 0;
    this.explodedAt = -1;
  }

  index(x, y) {
    return y * this.w + x;
  }

  center() {
    return this.index(Math.floor(this.w / 2), Math.floor(this.h / 2));
  }

  isOver() {
    return this.status === "won" || this.status === "lost";
  }

  placeMines(safeIdx) {
    const rng = makeRng(this.seed);
    const banned = new Set([safeIdx, ...this.neighbors[safeIdx]]);
    if (this.n - banned.size < this.totalMines) {
      banned.clear();
      banned.add(safeIdx);
    }
    const pool = [];
    for (let i = 0; i < this.n; i++) if (!banned.has(i)) pool.push(i);
    for (let k = 0; k < this.totalMines; k++) {
      const j = k + Math.floor(rng() * (pool.length - k));
      [pool[k], pool[j]] = [pool[j], pool[k]];
      this.mine[pool[k]] = 1;
    }
    for (let i = 0; i < this.n; i++) {
      let c = 0;
      for (const j of this.neighbors[i]) c += this.mine[j];
      this.counts[i] = c;
    }
    this.status = "playing";
  }

  // セルを開く。開いたセルの一覧を返す（0 のセルは周囲を連鎖的に開く）。
  reveal(i) {
    if (this.isOver() || this.revealed[i]) return [];
    if (this.status === "ready") this.placeMines(i);
    if (this.mine[i]) {
      this.revealed[i] = 1;
      this.flagged[i] = 0;
      this.status = "lost";
      this.explodedAt = i;
      return [i];
    }
    const opened = [];
    const stack = [i];
    while (stack.length) {
      const c = stack.pop();
      if (this.revealed[c]) continue;
      this.revealed[c] = 1;
      this.flagged[c] = 0; // 0 の隣は必ず安全なので、誤った旗は外して開く
      this.revealedCount++;
      opened.push(c);
      if (this.counts[c] === 0) {
        for (const j of this.neighbors[c]) if (!this.revealed[j]) stack.push(j);
      }
    }
    if (this.revealedCount === this.n - this.totalMines) this.status = "won";
    return opened;
  }

  setFlag(i, on) {
    if (this.isOver() || this.revealed[i]) return false;
    this.flagged[i] = on ? 1 : 0;
    return true;
  }

  flagCount() {
    let c = 0;
    for (let i = 0; i < this.n; i++) c += this.flagged[i];
    return c;
  }

  // 地雷の位置を含まない「プレイヤーから見える情報」だけを渡す。
  publicView() {
    const counts = new Uint8Array(this.n);
    for (let i = 0; i < this.n; i++) {
      counts[i] = this.revealed[i] && !this.mine[i] ? this.counts[i] : HIDDEN_COUNT;
    }
    return {
      w: this.w,
      h: this.h,
      n: this.n,
      totalMines: this.totalMines,
      revealed: this.revealed.slice(),
      flagged: this.flagged.slice(),
      counts,
      neighbors: this.neighbors,
      names: this.names,
      status: this.status,
    };
  }
}
