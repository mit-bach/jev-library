// 配線確認用の「偽 Jev」。本物の Jev ではありません。
// API キーなしで画面・中継・記録の流れを確かめるためだけに使います（npm run mock）。
// 質問に載っている英語の手がかりだけを読み、素朴な規則で確率を返します。
//  - 「none of these」「is not a mine」を含む → ほぼ 0
//  - 「all … are mines」「its only hidden cell … is a mine」 → ほぼ 1
//  - 「exactly k of these n」 → k/n の最大値（部分集合の推論はしない）
// そのため精度はソルバーより低く、Jev の実力の目安にもなりません。

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v) => Math.min(0.97, Math.max(0.03, v));

function ratioOf(sentence) {
  const raw = sentence.match(/shows (\d+); flagged neighbours: (.*?); hidden neighbours: (.*)$/);
  if (raw) {
    const flags = raw[2] === "none" ? 0 : raw[2].split(",").length;
    const hidden = raw[3].split(",").length;
    return (Number(raw[1]) - flags) / hidden;
  }
  if (/none of these|is not a mine/.test(sentence)) return 0;
  if (/^[^:]+: all \d+ of these|its only hidden cell \S+ is a mine/.test(sentence)) return 1;
  const m = sentence.match(/exactly (\d+) of these (\d+)/);
  return m ? Number(m[1]) / Number(m[2]) : NaN;
}

export function mockNoul(question) {
  const ins = question?.instructions || {};
  const clues = ins.clues_that_list_the_target || ins.numbers_next_to_the_target || [];
  const ratios = clues.map(ratioOf).filter(Number.isFinite);
  if (!ratios.length) return 0.5;
  if (ratios.includes(0)) return 0.03;
  if (ratios.includes(1)) return 0.97;
  return clamp(Math.max(...ratios));
}

/** callSystemOne と同じ形の結果を返す */
export async function mockSystemOne({ state, questions }) {
  const t0 = performance.now();
  await sleep(250 + Math.random() * 350);
  const answers = {};
  for (const [key, q] of Object.entries(questions)) answers[key] = { type: "noul", noul: mockNoul(q) };
  const input_tokens = Math.round(JSON.stringify({ state, questions }).length / 3.6);
  return {
    ok: true,
    status: 200,
    data: { model: "mock（偽のJev）", answers, usage: { input_tokens, output_tokens: 0 } },
    attempts: 1,
    latencyMs: performance.now() - t0,
  };
}
