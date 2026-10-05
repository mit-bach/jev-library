# Harnesses

A builder debugging Jev question design should rerun AntonioCoppe/jev-harness. The cases are in the repo. Offline mode replays recorded answers with no key and prints the action and the confidence. The other use-grade tools are for a bound receipt, a probability page, or a saved decision you can open.

Grades are evidence from files opened on this turn. They are not the shelf's final judgment.

## Use

### AntonioCoppe/jev-harness — use

Decision harness: confidence gate, shadow mode, recipe questions, JSONL fixtures.

- Repo: https://github.com/AntonioCoppe/jev-harness
- Local: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/sedge/trees/AntonioCoppe--jev-harness`
- Commit: `1a3dd4ae86de72f0df7d6e70b25feffc41ca3255` on `main`. Pushed `2026-09-25T16:31:24Z`. License MIT. GitHub size 8050. Stars 15.
- Load: `loadCases` in `eval/cli.ts` reads a JSONL file, skips blank lines and `#` comments, and `JSON.parse`s each row.
- Print: `runFile` in the same file writes one JSON object per case: `ok`, `id`, `recipe`, `action`, `confidence`. A miss also prints `expected`, `actual`, and `reason`.
- Replay with no key: yes. `runOffline` requires `answers` or `mockedAnswers` and never builds a client. `npm run eval` is `tsx eval/cli.ts`. Example: `npx tsx eval/cli.ts eval/fixtures/tool-gate.jsonl`. Fifty-one `eval/fixtures/*.jsonl` files. A fixture with `"mode": "shadow"` returns action `shadow_noop` and the reason `shadow: would <action>`.
- Live door: `DecisionHarness` in `src/harness.ts` defaults to `new TypeSafeClient({ apiKey, defaultModel: "jev-latest" })` from `@typesafe-ai/sdk`. This file does not quote a host. The README says a self-hosted server is `TYPESAFE_BASE_URL=http://localhost:8000` and describes it as `/v1/systemone`. `--live` ignores fixture answers. `--backend=<module>` must export a `DecisionBackend` with `systemOne()`. The eval constructs the harness with `logger: false`, so the console logger in `src/logger.ts` does not run during the suite.
- Assertion: `expectedAction` string. The recipe's `decide*` function mixes `choice`, `noul`, and `score` answers, then `resolvePolicy` may replace the action when confidence is low (`suppress`, `review`, `escalate_llm`). `tool-gate.jsonl` row `tg-ok` expects `continue`.
- Tests: no `*.test.ts`. The fixture CLI is the check. `ConsoleDecisionLogger.logDecision` prints `decisionLogPayload`: `action`, `intendedAction`, `confidence`, `reason`, `mode`. It does not print the probability map.

### TypeSafeAI/jev-harness — use

Official-org coding harness. An LLM proposes, Jev answers narrow questions, code decides, a receipt can be replayed. Separate from AntonioCoppe's repo.

- Repo: https://github.com/TypeSafeAI/jev-harness
- Local (parent clone, not copied): `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/TypeSafeAI--jev-harness`
- Commit: `1239b23052b701e690727755cf17ea90c92654ff` on `main`. Pushed `2026-10-01T23:21:58Z`. License MIT. Size 2318. Stars 26.
- Load: `loadFixtures` in `src/benchmark/load.ts` reads `fixtures/proposal-review/*.json` (25 files). `clean-null-guard.json` stores `expected.good = "permit"`, `expected.bad = "reject"`, and scripted `mock` probabilities for four noul questions.
- Print, offline: `scripts/bench-review.ts` calls `loadFixtures` and `renderBenchTable` in `src/benchmark/bench.ts`. The table is category counts (bad caught, good blocked, unavailable), not per-question probabilities. The script says the transport is mock only and the numbers are demonstration values, not measurements of Jev. No key.
- Print, page: `ArenaInspector` in `components/arena-inspector.tsx` draws `receipt.evidence.probabilities` as a percent and a `<meter>`. That view is the routing arena (`pnpm dev`, `127.0.0.1:4173`), not the proposal-review bench. A live comparison needs a key and a signed-in Codex CLI. `examples/review/experiment-cli.ts` is offline mock unless `--live`.
- Receipt: `createBoundReceipt` and `replayBoundReceipt` in `src/audit/receipt.ts`. Replay checks a sha256 digest and re-runs `decide` / `decideBase`. No network. The host must supply the expected binding. Test: `tests/receipt-binding.test.ts`. Thirty-five `tests/*.test.ts` files. `pnpm test` is `tsx --test tests/*.test.ts`.
- Live door, quoted: `export const JEV_SYSTEMONE_URL = "https://api.typesafe.ai/v1/systemone"` in `examples/host/jev-choice.ts`. `createReviewHttpTransport` in `examples/host/review-experiment.ts` POSTs that URL with `Authorization: Bearer`.
- Assertion: proposal review compares the verdict label (`permit`, `reject`, `proposal_only`, `unavailable`) to `expected`. Favorable noul answers and the 0.8 threshold are in `decide` in `src/contract/decide.ts`. Routing asserts a choice id and shows the probability vector. `REVIEW_QUESTION_IDS` are `addresses_task`, `evidence_supports`, `unrelated_changes`, `needs_clarification`.

### vinilana/jev-eval-agent — use

Eval of one agent in two modes, plus a page over saved runs. Open this when the question under debug is "which tool is next" and "is the task done".

- Repo: https://github.com/vinilana/jev-eval-agent
- Local: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/vinilana--jev-eval-agent`
- Commit: `037de1120c84b4b63cdf748e2acf258ff66d7731` on `main`. Pushed `2026-09-17T11:07:31Z`. No license file. Size 326. Stars 106.
- Load: `loadPrompts` in `scripts/serve-ui.mjs` slices the `PROMPTS` array out of `evals/prompts.ts`. `collect` reads `eval-results/<mode>/<model>/<prompt>.json`.
- Print: `render` in `eval-ui/index.html`. A `kind === "jev"` timeline row shows the tool name, `confidence`, `done`, whether the gate fired, latency, and the top three `{name, p}` probabilities.
- Replay with no key: yes for the page. `npm run ui` serves committed `eval-results/`. `JEV_STUB=1` makes `chooseNextTool` return `stubDecision` (scripted plan, confidence 0.99) and does not call Jev. A real eval still needs an OpenRouter key for the agent.
- Live door: `chooseNextTool` in `agent/lib/jev-router.ts` calls `getClient().systemOne(...)` on `TypeSafeClient` from `@typesafe-ai/sdk` `^0.6.0`. This repo does not quote the host. The agent model goes through OpenRouter in `agent/agent.ts`. `.env.example` names `TYPESAFE_API_KEY` and `OPENROUTER_API_KEY` with placeholders, not a committed secret.
- Assertion: soft checks in `runBenchmark` in `evals/shared.ts`, driven by `evals/assistant.eval.ts`. `completion` is 1 when every required tool family ran. `idealPath` also requires no extra calls and no distractor. The checks do not assert the Jev choice label. The visible Jev fields are choice (`tool`), confidence, done noul, and gate.

### devagrawal09/jev-review — use

Local dashboard for one saved code review. Not a fixture suite.

- Repo: https://github.com/devagrawal09/jev-review
- Local: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/devagrawal09--jev-review`
- Commit: `31f89602797fb7bea007f8a480bf368bf564954e` on `main`. Pushed `2026-09-17T00:29:25Z`. License MIT. Size 161. Stars 655.
- Load: `readReport` in `src/adapters/report-store.ts` reads `reviews/latest.json` or `REVIEW_FILE`. `handle` in `src/dashboard/server.ts` serves it at `GET /api/review` on `127.0.0.1:4317`. No `reviews/` directory is in the clone, so a fresh server is the empty state.
- Print: `render` in `src/dashboard/public/app.js` calls `matrix`. Each cell is a probability from 0 to 1. `findings` shows `locationConfidence`, `severityConfidence`, and an action (`Request changes`, `Comment`).
- Replay with no key: the page only reads the JSON file. Producing that file (`npm run review:changes:save`) calls Jev.
- Live door: `screenFile` in `src/review/judgments.ts` uses `new TypeSafeClient()` and `client.systemOne` with five `noul` questions, then `profileFile` uses `choice` and `score`. The host is not in this repo. `.env.example` is `TYPESAFE_API_KEY=` with an empty value.
- Assertion: none in-repo. No test file. `npm run check` typechecks and syntax-checks `app.js`. The displayed values are noul probabilities, a choice label, and a score.

## Study

Worth keeping. Not the first thing to rerun while editing a question.

### PromtEngineer/jev-harness — study

Pi agent on Neon Postgres. Jev routes, picks runbook sections, gates tools, and verifies. The lab page shows those numbers, but no run is committed and a live run needs TypeSafe, Gemini, Neon, and Pi.

- Commit `9bd4f670a2866498aa570e4ce4654997b3dce190` on `main`. Pushed `2026-09-24T22:00:50Z`. MIT. Size 1498.
- Local: `.../engineers/sedge/trees/PromtEngineer--jev-harness`
- Load: `run_detail` in `app/server.py` reads `results/runs/<run>/decisions.jsonl`. That directory is absent in the clone.
- Print: `loadRun` in `app/index.html` draws router probabilities, confidence, complexity, and context-picker noul chips.
- Live door, quoted: `fetch("https://api.typesafe.ai/v1/systemone"` in `extension/jev-harness.ts`.
- Assertion: `decideGate`, `decideTier`, `decideRetry` in `extension/policy.ts`. Tests: `tests/policy.test.ts` (no network).
- Replay with no key: only if you already have a `decisions.jsonl`. The clone does not.

### TypeSafeAI/clarity-judge — study

Checker page: one card per writing axis, with a verdict label and a confidence. The no-key path is a local simulation, not a recorded Jev answer.

- Commit `f7051ab8115aca726cdc16a4d131aeaa527bdabf` on `main`. Pushed `2026-09-26T18:40:54Z`. No `LICENSE` file and `package.json` has no license. Size 740.
- Local: `.../engineers/sedge/trees/TypeSafeAI--clarity-judge`
- Print: `ResultsPanel` in `components/ResultsPanel.tsx`. `runJudgmentDetailed` in `lib/judge.ts` sets `source: "simulated"` when `demoMode` is true and calls `mockCallJev`. Otherwise `fetchLive`.
- Live door, quoted: `export const JEV_ENDPOINT = "https://api.typesafe.ai/v1/systemone"` in `lib/jevClient.ts`.
- Assertion: noul or choice, plus derived confidence. Tests include `lib/jevClient.test.ts`, `lib/mockJevClient.test.ts`, `lib/comparison.test.ts`. No committed text fixtures for a keyless real decision.
- `npm test` exists. E2E script is `test:e2e`. Not run on this turn.

### AbdelStark/jev-benchmarks — study

Calibration bench for single-label choice, with a committed pilot report. Cases are not in the repo. There is no decision page.

- Commit `0d610cc53e79bcbec691312b0c4adb4a0e371642` on `main`. Pushed `2026-09-17T07:55:14Z`. Apache-2.0. Size 489.
- Local: `.../engineers/sedge/trees/AbdelStark--jev-benchmarks`
- Load: `load_examples` in `src/jev_benchmarks/data.py` (dataset extra, not vendored rows).
- Print: `build_report` in `src/jev_benchmarks/report.py` writes `report.json` and `report.md` from prediction JSONL. The committed narrative is `results/reports/btzsc-pilot-v1.md`.
- Live door: `JevBackend.predict` in `src/jev_benchmarks/adapters/jev.py` calls `TypeSafeClient.system_one` with a `Choice`. No host string in that file.
- Assertion: predicted label index from the max probability, then calibration metrics (accuracy, Brier, coverage at an error budget). Tests exist under `tests/`. Not run.
- Replay with no key: read the committed report. Regenerating it needs predictions on disk and, for a new Jev run, a key.

### dfranco-projects/jev-guardbench — study

Guardrail bench. The report is a markdown metrics table. Datasets load from Hugging Face. The smoke config points at local Kev, not TypeSafe.

- Commit `512389dc58a721158064ccffc780f980d4ee0cb2` on `main`. Pushed `2026-10-02T20:00:05Z`. No license. Size 625.
- Local: `.../engineers/sedge/trees/dfranco-projects--jev-guardbench`
- Load: `load_deepset` and the other `load_*` functions in `src/guardbench/data.py` call `datasets.load_dataset`.
- Print: `render` in `src/guardbench/report.py` writes a markdown table (precision, recall, F1, AUROC, ECE). Not a per-row decision view.
- Live door: `SystemOneGuard` in `src/guardbench/guards/systemone.py` passes `base_url` into `AsyncTypeSafeClient`. `configs/full.yaml` sets `type: systemone` and `model: jev-1.13.0` and does not set `base_url`. `configs/smoke.yaml` sets `base_url: http://127.0.0.1:8009` for `kev-latest`. The official host is not quoted.
- Assertion: noul probability against `threshold` (default 0.5) and a boolean violation label. Tests: `tests/test_guards.py` uses a fake transport (`base_url="http://kev.test"`).
- Replay with no key: the unit tests. A full report needs downloaded rows and a running judge.

### ianlintner/jev-shadow-adapter — study

Shadow-mode adapter plus a Grafana JSON. The panels are rates and agreement, not one question's probability vector.

- Commit `afc1a3692296f23b8d6b7f34ee54c474372360a4` on `main`. Pushed `2026-09-28T09:40:45Z`. MIT. Size 65.
- Local: `.../engineers/sedge/trees/ianlintner--jev-shadow-adapter`
- Load: `call_jev` in `src/jev_shadow/client.py` POSTs `{model, state, questions}` to the endpoint argument.
- Print: `grafana/jev-shadow-dashboard.json` panel "Jev suggestion vs baseline" queries `jev_shadow_decisions_total`. A second panel is agreement among successful calls.
- Live door, quoted: `DEFAULT_ENDPOINT = "https://api.typesafe.ai/v1/systemone"` in `src/jev_shadow/config.py`. Model default `jev-1.13.0`.
- Assertion: tier label versus a heuristic baseline (`suggest_tier` in `src/jev_shadow/decision.py`). Tests under `tests/`, including `tests/test_client.py`. Not run.
- Replay with no key: tests and the dashboard JSON. A live shadow pass needs a key and Prometheus.

### silex-ai-lab/jev-runtime-observability — study

Trace console for a System One protocol judge. The page says the model is not TypeSafe's Jev unless the judge line says `typesafe:`. Not cloned. Size 9656, under the 50000 limit. Opened two files at the commit below.

- Commit `64aae74b10bcbb0f5449913963942730fcc2ed06` on `main`. Pushed `2026-10-02T20:16:21Z`. Apache-2.0. Stars 2.
- Print: `web/index.html` (live stream, inspector, what-if, review drawer). `signalsLine` in `web/js/verdict.js` formats noul as `raw_probability`, score as score, choice as choice.
- Live door: not opened in the server. The HTML says the judge speaks TypeSafe's `/v1/systemone` protocol and that a missing `typesafe:` prefix means the answerer is not TypeSafe's Jev.
- Replay with no key: not established. The page asks for a reader key and a sandbox run.
- Assertion: `lineVerdict` in `verdict.js` (gated / ungated, recommended versus decided). Not a fixture file in the two files opened.

### anisselbd/jev-phishing-bench — study

One published comparison on 2000 emails. The report is in the repo. The emails are not.

- Commit `1d56e8c64d029a9554a0874e2ef2901ed196e230` on `main`. Pushed `2026-09-19T17:34:05Z`. No license. Size 2355.
- Local: `.../engineers/sedge/trees/anisselbd--jev-phishing-bench`
- Load: `prepare_data.py` downloads PhishNChips from Hugging Face. No csv or jsonl of emails is in the clone.
- Print: `results/report.md` (generated `2026-09-17`). Accuracy, recall, ECE, Brier, latency. Not one row's questions.
- Live door, quoted: `run_jev.py` sets `url = f"{base_url}/v1/systemone"` with `base_url` default `https://api.typesafe.ai`. Question is a `choice` of `phishing` or `legitimate`, plus other questions the report says were sent.
- Assertion: label `y` versus the choice, then threshold curves on probability. `--dry-run` prints one payload and does not call the API. A real rerun needs `TYPESAFE_API_KEY` and the download.
- Tests: none found.

## Already on disk from 2026-10-01

Not cloned again. Opened far enough to judge this job.

### WillKelly/jev-evaluation — study

Path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/originals/github/WillKelly-jev-evaluation`

Commit `d80f375621ad4b9306c6dff6941242925d7e2386` on `main` (`2026-09-21 23:21:26 -0600`). MIT. GitHub `pushed_at` was not requested.

`jeveval/config.py` sets `API_URL` default to `https://api.typesafe.ai/v1/systemone`. `tools/build_report.py` fills `tools/report_template.html`. The finished page is `runs/full-20260919/report.html` (title `Jev Evaluation`). A person can open that file with no key. The runner is a fixed campaign (the README says 123,805 requests), not a small fixture loop for a question you are editing. Use the report. Do not make this the daily harness.

### system-one-adapter-python — skip

Path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/originals/github/system-one-adapter-python`

Commit `e1d4cc938204b22fc5a3c3aca7044072fe3f712d` on `main` (`2026-09-22`, release v0.2.1). MIT. `pushed_at` was not requested.

The README describes a drop-in `system_one` client backed by OpenAI, Anthropic, or Gemini, not by TypeSafe. Tests such as `tests/test_client_with_fake_model.py` exist. No decision page and no Jev fixture replay. A builder comparing an LLM to the System One shape might read it. It is not a Jev debug harness.

### WorkflowEvals — study

Path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/corpus/05-examples-repos-and-outputs/cobble/trees/WorkflowEvals`

The directory name is `WorkflowEvals`. There is no `.git` in that tree, so this copy's commit is unverified. GitHub `typesafe-ai/WorkflowEvals` `main` is `0ac3b8ad845429f0d8e064ecfb2430a47c5a25cb`, committer date `2026-09-29T16:25:12Z`, pushed `2026-09-29T16:25:18Z`, Apache-2.0. Those API facts were not byte-compared to the cobble tree.

`run.py` reproduces https://evals.typesafe.ai. Question text is in the tree, for example `evals/customer_service/questions.py` (`reports_unauthorized` is a `Noul`). Case rows download from Hugging Face. `plot.py` writes PNG, SVG, or PDF of agreement versus cost, not an HTML decision log. `core/providers.py` uses `typesafe_sdk.constants.DEFAULT_BASE_URL` unless `--base-url` or `TYPESAFE_BASE_URL` is set. That constant's string was not opened. `--dry-run` checks inputs without model calls. A live run needs `TYPESAFE_API_KEY`. Study the question files. Do not prefer this over AntonioCoppe for a question you are still editing.

## Dropped

Named, not written up.

- JYeswak/jev_playground. Playground. GitHub size 64084 on the second read (over 50000). Not cloned. README and root listing only, then stopped. Other surveys own playgrounds.
- Prophetlab/JevPokerBench. Search hit. Description says playground and leaderboard. Not opened.
- jkudish/jev-browser and browser-use/jev-ultrafast. Browser agents. The second is already under `debug-test-frontends/originals/github/`. Left to the browser survey. Not written up.
- aaddrick/building-with-typesafe-jev. Commit `a46856c9fbc890653891e25f85ee2f16e1d9b513`, `main`, pushed `2026-10-01T20:14:22Z`, MIT. Local clone in `trees/aaddrick--building-with-typesafe-jev`. `evals/docs/harness.md` runs Claude Code plugin arms and says "No TypeSafe key." `evals/command-gate/prompt.md` asks an agent to write `gate.py`. That is a skill eval, not a Jev fixture runner. Grade skip.
- NiazMorshed2007/jev-review. Commit `57690af54ef7d862c2483342c1e61c14dffcf727`, `main`, pushed `2026-09-17T17:15:20Z`, MIT. MCP plugin. `public/` contains `jev-review-demo.mp4` only. No HTML view. `src/jev/client.ts` quotes `https://api.typesafe.ai/v1/systemone`. Tests exist (`test/questions.test.ts`, `test/mcp.test.ts`) and do not give a person a review to look at. One paragraph, then skip.
- ismaelsoilet/jev-harness. Root listing and README opening only. Agent token gate and MCP. No decision page opened. Skip.
- guilhem/jev-ci-selector. README opening only. GitHub Actions product. The job summary is part of that product, not a reusable question lab. Skip.
- Donnaclarkk981/typesafe-ai-benchmark. README opening only. Root is `README.md` and `doorweed/`. The README text does not describe a Jev fixture runner. Skip.
- jerryshao2012/typesafe_jev. README opening only. Size 18. A workflow essay, not a runner. Skip.
- ianlintner/jev-router. Root listing only. The shadow-adapter repo above is the one whose Grafana file was opened. This sibling was not.
- Suryals/jev-router-lab. README opening only. One AIOps comparison. Not a reusable viewer. Skip.
- TianyuCodings/JevHarness. Search hit only. Size 43246. Not opened.
- Awesome-lists seen in search (`daftAI2026/awesome-jev`, `robokrunch/awesome-jev`, `yibie/awesome-jev`) were not cloned and their bodies were not read.
- Product hits left alone: mail, games, hiring, trading, Home Assistant, paperless, prose linter `scale-venture-partners/riff`. Not debug tools.
