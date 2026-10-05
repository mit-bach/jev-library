// 評価専用：Jev の確率を「実際の地雷配置」と「厳密解」に照らして採点する。
// ここで使う正解（game.mine）は手の決定には一切使わない。

export class Calibration {
  constructor(bins = 10) {
    this.binCount = bins;
    this.reset();
  }

  reset() {
    this.n = 0;
    this.sqJev = 0; // Σ (Jevの確率 − 実際)^2
    this.sqExact = 0; // Σ (厳密解の確率 − 実際)^2（理論上の最良値の目安）
    this.bins = Array.from({ length: this.binCount }, () => ({ n: 0, sumP: 0, mines: 0 }));
    this.certainSafe = 0; // 厳密解で確実に安全なマス
    this.certainSafeFound = 0; // そのうち Jev も「安全」側（≦開く基準）にしたマス
    this.certainMine = 0;
    this.certainMineFound = 0;
    this.fatal = 0; // Jev が「安全」側にしたのに実は地雷
    this.wrongFlag = 0; // Jev が「地雷」側にしたのに実は安全
  }

  /** turn.jev.probs と turn.exact を、正解と照合して記録する */
  addTurn(turn, game, { safeT, mineT }) {
    if (!turn?.jev?.probs || !turn.exact) return;
    for (const [cell, p] of turn.jev.probs) {
      const truth = game.mine[cell] ? 1 : 0;
      const q = turn.exact.prob[cell];
      this.n++;
      this.sqJev += (p - truth) ** 2;
      this.sqExact += (q - truth) ** 2;
      const b = this.bins[Math.min(this.binCount - 1, Math.floor(p * this.binCount))];
      b.n++;
      b.sumP += p;
      b.mines += truth;
      if (q === 0) {
        this.certainSafe++;
        if (p <= safeT) this.certainSafeFound++;
      }
      if (q === 1) {
        this.certainMine++;
        if (p >= mineT) this.certainMineFound++;
      }
      if (p <= safeT && truth) this.fatal++;
      if (p >= mineT && !truth) this.wrongFlag++;
    }
  }

  merge(other) {
    this.n += other.n;
    this.sqJev += other.sqJev;
    this.sqExact += other.sqExact;
    other.bins.forEach((b, i) => {
      this.bins[i].n += b.n;
      this.bins[i].sumP += b.sumP;
      this.bins[i].mines += b.mines;
    });
    for (const k of ["certainSafe", "certainSafeFound", "certainMine", "certainMineFound", "fatal", "wrongFlag"]) this[k] += other[k];
  }

  summary() {
    return {
      samples: this.n,
      brierJev: this.n ? this.sqJev / this.n : NaN,
      brierExact: this.n ? this.sqExact / this.n : NaN,
      safeRecall: this.certainSafe ? this.certainSafeFound / this.certainSafe : NaN,
      mineRecall: this.certainMine ? this.certainMineFound / this.certainMine : NaN,
      certainSafe: this.certainSafe,
      certainMine: this.certainMine,
      fatal: this.fatal,
      wrongFlag: this.wrongFlag,
    };
  }
}
