import { defineEval } from "eve/evals";
import { PROMPTS } from "./prompts";
import { runBenchmark } from "./shared";

export default PROMPTS.map((bench) =>
  defineEval({
    description: `${bench.id} · ${bench.title}`,
    tags: ["benchmark", bench.tier],
    metadata: { promptId: bench.id },
    async test(t) {
      await runBenchmark(t, bench);
    },
  }),
);
