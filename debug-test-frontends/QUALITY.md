# Quality

Parent read on 2026-10-02. All four surveys are merged: `surveys/sedge/`, `surveys/pylon/`, `surveys/brant/`, and `surveys/quill/`. A grade in a survey is evidence. This file is the shelf judgment. A grade here is not a live API call and not a rerun of anyone's benchmark.

Jev answers typed questions. These tools do not make it write the page. A tool is **use** when a person debugging or testing a Jev system should open it. **Study** means the idea is worth keeping and the runnable path is thin, mocked, or a different job. **Skip** means it will mislead.

## Open these first

**Rerun a question case with no key.** `AntonioCoppe/jev-harness` at `1a3dd4a`. `eval/cli.ts` `runOffline` replays `answers` or `mockedAnswers` and never builds a client. `npx tsx eval/cli.ts eval/fixtures/tool-gate.jsonl` prints `action` and `confidence`. Fifty-one JSONL fixtures are in `eval/fixtures/`. A live run uses `@typesafe-ai/sdk` with `jev-latest`. The host string is not in `src/harness.ts`. Shadow mode returns `shadow_noop`. Tree: `engineering/engineers/sedge/trees/AntonioCoppe--jev-harness`.

**Inspect one request.** `sugarforever/tryjev` at `52770fc`. `src/lib/server/providers.ts` posts the same state and questions to three doors: `POST https://api.typesafe.ai/v1/systemone` with `jev-latest`, OpenRouter `alpha.decisions` with `typesafe/jev-1.13`, and Vercel `experimental_evaluate` with `typesafe-ai/jev`. The browser holds the key and sends it per request. This is the page to use when a call shape is wrong.

**See probabilities on a real browser step.** `PenglongHuang/jev-demo` at `def34f2`. `server.js` proxies the official `/v1/systemone` and also `https://openrouter.ai/api/v1/systemone`. The page is `http://localhost:3000`. The Playwright scene keeps the request, the probabilities, and the screenshot on screen.

**Run the tests a diff can break.** `mizchi/jev-test-filter` at `955bdf4`. `src/jev.ts` posts one state (the diff) and one question per test to `https://api.typesafe.ai/v1/systemone`. It prints the filter flags vitest, node:test, Playwright, cargo test, and go test already accept. `test/jev.test.ts` checks the URL with no live key. A live run needs `TYPESAFE_API_KEY`. Node 24.

**Watch a frontend run.** `jonymusky/jev-browser-qa` at `ca6d5a2`. Playwright films. Jev judges. `pnpm dashboard` serves port 4310 from saved run JSON, with the probability and the video. `src/jev/client.ts` uses Vercel AI Gateway model `typesafe-ai/jev`, not the official HTTP path. The repo includes a `jev-qa` skill.

**Walk an app and stop when unsure.** `ElshinQ/jevaluate` at `9f1b927`. `scripts/jev.mjs` posts to `https://api.typesafe.ai/v1/systemone`. The walk refuses a click under 0.8 confidence and writes `walk-run/walk-report.md`. `scripts/eval.py` can score your own cases. The same walk also sends screenshots to DeepSeek. The "60 cases, every confident answer was right" sentence is the README's claim. It was not rerun here. `python3 scripts/eval.py` on the shipped examples does call the live API.

## Also use

| Tool | Commit | Why it is here | Door |
| --- | --- | --- | --- |
| `TypeSafeAI/typesafe-playground` | `0fbc9ef` | Large lab on port 3042. Examples open with no key. Live Jev controls need a key. Usage dashboard records tokens the provider returned. README says the brand is not an endorsement. | TypeSafe key, official-shaped |
| `little-planet-labs/jev-playground` | `418b723` | Small Next.js page. `src/app/api/evaluate/route.ts` builds questions with `@typesafe-ai/sdk`. Key stays in `.env.local`. | Official SDK |
| `terryds/jevplayground` | `02c20a0` | One HTML file, no server. Good when you only have a Vercel key. The key sits in the browser. | `ai-gateway.vercel.sh/v4/ai/evaluation-model` |
| `Ahmar004/jev-playground` | `961141b` | The inspector is `/sandbox`, not the root README. `src/runner/providers/typesafe.ts` sets `TYPESAFE_URL` to the official endpoint. Beginner mode replays a recording with no key. The key stays in tab memory and is not written to storage. The repo also contains games. Use the sandbox. | Official, proxied at `/api/jev` |
| `devagrawal09/jev-review` | `31f8960` | Code-review report on `127.0.0.1:4317`. The server only serves the saved report. Making the report needs a key. | TypeSafe, for the review |
| `vinilana/jev-browser` | `7d60873` | `report.html`, `events.jsonl`, screenshots, Playwright `trace.zip`. The trace can hold form data. | TypeSafe for the action, OpenRouter when a goal is planned |
| `vinilana/jev-eval-agent` | `037de11` | `eval-ui/index.html` compares an LLM picking among 100 mocked tools with Jev picking the tool. `npm run ui` serves the dashboard from saved JSON. | OpenRouter for the agent, Jev as the classifier |
| `TypeSafeAI/jev-harness` | `1239b23` | Receipt replay with no network: `replayBoundReceipt` in `src/audit/receipt.ts`, checked by `tests/receipt-binding.test.ts`. The routing page draws `receipt.evidence.probabilities` as a meter in `components/arena-inspector.tsx`. Live posts go to `https://api.typesafe.ai/v1/systemone` from `examples/host/jev-choice.ts`. `pnpm bench:review` is a scripted mock. Do not quote those bench totals as a Jev measurement. The README says this community org is not the official TypeSafe team. | Official on the live path. Mock on the bench. |
| `comoc/jev-minesweeper` | `5cbc361` | Hover a cell and see the exact noul text, the JSON, Jev's probability, and a strict solver's probability. `npm run mock` draws the page with no key and says it is a mock. | Official, or the mock |
| `KiritoKing/midscene-jev-runner` | `f07d22f` | A Playwright helper, not a dashboard. Default model string is `~typesafe/jev-latest` on OpenRouter `alpha/decisions`. The tilde matches the 2026-10-01 note that the bare latest id is absent there. | OpenRouter |

## Study

**`TypeSafeAI/clarity-judge` at `f7051ab`.** One card per writing check, with a verdict and a confidence. `lib/judge.ts` sets `source: "simulated"` in demo mode. `lib/jevClient.ts` quotes `https://api.typesafe.ai/v1/systemone` for a real key. Public `judge.jev.works` is the mock. Open it to copy the card layout. Do not treat a no-key run as Jev.

**`PromtEngineer/jev-harness` at `9bd4f67`.** The lab page draws router probabilities from `results/runs/<run>/decisions.jsonl`. That directory is not in the clone. `extension/jev-harness.ts` quotes the official endpoint. `tests/policy.test.ts` needs no network. A live run also wants Gemini, Neon, and Pi.

**`AbdelStark/jev-benchmarks` at `0d610cc`.** Calibration report `results/reports/btzsc-pilot-v1.md` is committed. The case rows are not. There is no decision page.

**`dfranco-projects/jev-guardbench` at `512389d`.** Markdown metrics table. `configs/full.yaml` names `jev-1.13.0` and does not quote the official host. `configs/smoke.yaml` points at local Kev on port 8009. Datasets load from Hugging Face.

**`ianlintner/jev-shadow-adapter` at `afc1a36`.** `DEFAULT_ENDPOINT` is the official `/v1/systemone`. The Grafana file graphs suggestion-versus-baseline rates, not one question's probability vector.

**`silex-ai-lab/jev-runtime-observability` at `64aae74`.** Trace page in `web/index.html`. The page says a missing `typesafe:` prefix means the answerer is not TypeSafe's Jev. The server URL was not opened. Not cloned.

**`anisselbd/jev-phishing-bench` at `1d56e8c`.** `results/report.md` is a published comparison. The emails are not in the clone. `run_jev.py` can `--dry-run` one payload to `https://api.typesafe.ai/v1/systemone`. A real rerun needs a key and a Hugging Face download.

**`WillKelly/jev-evaluation` at `d80f375`.** Already in the 2026-10-01 library. Open `runs/full-20260919/report.html` with no key. The runner is a fixed campaign, not a small loop for a question you are still editing.

**`WorkflowEvals`.** Already in `corpus/05-examples-repos-and-outputs/cobble/trees/WorkflowEvals`. Question text is in the tree. Case rows download from Hugging Face. `--dry-run` does not call a model. Prefer AntonioCoppe while you are still editing a question.

**`TypeSafeAI/typesafe-ui` at `61e5e9e`.** Copy the result components. `apps/web/components/labs/typed-preview.tsx` calls `fixtureAnswers`, and the banner says no Jev request is sent. `packages/typescript-config/package.json` says `PROPRIETARY`. Do not treat the repo as MIT.

**`saimahmedqazi/typesafe-jev-playground` at `b6e6e31`.** `DEFAULT_NATIVE_JEV_ENDPOINT` is `https://api.jev.ai/v1/evaluate`, not TypeSafe. When `response.answers` is missing, `ResultInspector.tsx` draws a noul of `0.98` or `0.02`. That number is not a model probability.

**`DeepBlueDynamics/typesafe-arena` at `c057cfb`.** Cloned. Not opened in this parent pass. Quill did not grade it.

## Skip

**`adyoi/jev-system-one-playground` at `b133e6b`.** The default endpoint in `Program.cs` is `https://api.typesafe.ai/v1/system-one`, with a hyphen. The official path has no hyphen. The README says that URL returns Not Found and the app answers with a local keyword matcher. The three-pane layout is the only reason to open it.

**`aaddrick/building-with-typesafe-jev` at `a46856c`.** The eval harness runs Claude Code plugin arms. `evals/docs/harness.md` says no TypeSafe key. It is a skill eval, not a Jev fixture runner.

**`NiazMorshed2007/jev-review` at `57690af`.** MCP plugin. `public/` holds a demo video and no HTML view. `src/jev/client.ts` quotes the official endpoint. There is nothing to look at after a run.

**`system-one-adapter-python` at `e1d4cc9`.** Already in the 2026-10-01 library. It adapts other LLMs to a System One shape. It is not a Jev debug harness. The cassette in that repo records `speed_latest`, not `jev-1.13.0`.

## Catalog finds re-opened here

Pylon graded these from source. The parent then fetched the named file at the named commit and found the same symbols.

**`jeiel85/jevscope` at `d39ab43`.** A local studio plus a batch checker. `packages/evaluator/src/workbench.ts` exports `parseCases`, `checkExpectations`, and `runBatch`. The studio talks to `http://localhost:4317`. The TypeSafe provider calls `systemOne`. The official host string was not in that provider file. The key stays on the local server. This is the UI pair to AntonioCoppe's JSONL loop.

**`a742987/JevLens` at `ae1ff10`.** A timeline of calls. `ui/index.html` is titled "JevLens — Jev decision timeline". `src/jev.ts` calls `client.systemOne` and scrubs the key before the log. `examples/seed-trace.ts` can fill the page without a live call. `baseURL` comes from `TYPESAFE_BASE_URL` or an option. The official host literal was not in that file.

**`andududu/jeview` at `495a4e4`.** A local proxy page. `ui/app.js` shows `` `${location.origin}/v1/systemone` ``. Point an existing client at that origin and watch the questions. The upstream host was not in `ui/app.js`.

**`openlayer-ai/jevals` at `0a8f895`.** A Python library, no page. `src/jevals/backends/typesafe.py` posts `{base_url}/v1/systemone`. The default base is `https://api.typesafe.ai`. `tests/test_backends.py` is in the repo. Use it when the cases are YAML. AntonioCoppe stays the smaller JSONL loop.

**`Tomdachs/jev-replay-lab` at `d59cd35`.** `src/web/main.tsx` says one request per case goes to `api.typesafe.ai`, expected labels are left out, and a run can send up to 200 requests. The full path `/v1/systemone` was not that line. The key stays on the server.

**`sohithk10/jev-trace-evaluator` at `3b06ba5`.** `src/jev_eval/judge.py` sets `base_url="https://api.typesafe.ai"`. `src/jev_eval/web.py` serves `static/index.html` over recorded traces. `examples/traces.jsonl` is in the repo. A live judge needs a key.

**`Dillettant/jev-test` at `110c205`.** `src/components/Playground.tsx` fetches the app's `/api/systemone` and prints `POST https://api.typesafe.ai/v1/systemone` plus the JSON body. No tests. tryjev is the fuller inspector. This one is the short preview.

## Catalog graded use, not re-opened here

These are pylon's grades. The parent did not fetch the file again.

- `MashiroKai/jev-playground` at `148e4f9`. `server.mjs` names the official `/v1/systemone`, and also a local Laya `/predict` and an OpenAI-shaped `/chat/completions`.
- `grandaha/jev-playground` at `e482765`. `experiments/playground/scripts/server.py` posts `/systemone` on `https://api.typesafe.ai/v1`.
- `4esv/jev-eval` at `4050562`. `evaljev/runners.py` sets `JEV_URL` to the official endpoint and also has an OpenRouter chat URL. `evaljev/serve.py` is a local `/v1/systemone` stand-in.
- `fstandhartinger/jevbench` at `bb05a33`. `jevbench/adapters/typesafe.py` posts `{endpoint}/v1/systemone` and falls back to `https://api.typesafe.ai`. About 48 MB. Not cloned. The live board named in the README, benchmarkheaven.com, was not opened.

The long study list, the README-only rows, and the unofficial doors are in `surveys/pylon/FIELD-INDEX.md`. `https://console.typesafe.ai/playground` returned HTTP 403. `https://evals.typesafe.ai` opened. That eval site is already mirrored under `corpus/01-primary-typesafe/contract-map/evals/`.

## Frontend loops

These leave evidence of a browser run. The parent re-fetched the door file for the first four. The rest are brant's grades. The full notes are `surveys/brant/BROWSER-TEST.md`.

**`browser-use/jev-ultrafast` at `1231850`.** A local inspector at `http://127.0.0.1:8766`. `jev_ultrafast/static/app.js` draws `target_probabilities`. `jev_ultrafast/model.py` posts to `https://api.typesafe.ai/v1/systemone`. `pytest tests/test_agent.py` mocks that post. This is not a pass bit. Do not quote the README's flight-search timing as a measurement from this shelf. Typed field text uses a second model.

**`Faresabdelghany/jev-browser-test` at `28a5506`.** `scripts/jev_client.py` sets `DEFAULT_BASE_URL` to the official endpoint. `scripts/report.py` writes `report.html` with confidence and screenshots. The README says `scripts/selftest.py` is offline. That script was not run here.

**`srirsatt/jev-uicheck-fast` at `2e0ad04`.** `src/jev.ts` posts to the official endpoint. Three choice questions score a before/after snapshot: intent, unexpected changes, regression. The exit code follows browser health. Jev's score is advisory. `test/jev.test.mjs` mocks fetch.

**`Kevin-Liu-01/Relay` at `46cc77a`.** Not cloned. GitHub size is about 135 MB. `runner/typesafe.mjs` posts `https://api.typesafe.ai/v1/systemone`. `src/live/main.jsx` renders a heading `Action probabilities`. Replays open with no key. The README says those bars are the returned distribution, not the chance the task succeeds.

**`dingw530/playwright-jev` at `15bd5a4`.** Official `DEFAULT_ENDPOINT` in `src/typesafe-client.mjs`. An offline example uses preset actions and does not call Jev. The trace is JSON, not a page.

**`tontoko/jev-browser` at `94f8814`.** Library, CLI, and MCP. Playwright traces and screenshots. `src/decision.ts` sets the client origin to `https://api.typesafe.ai`. `npm test` is the no-key path. No run dashboard.

**`arthurfiorette/jev-playwright` at `96bdcc6`.** A Playwright reporter that asks Jev which tests to run before the browser starts. A green run can mean zero tests ran. The README says secrets in the diff are not redacted. Unset, the SDK uses the official host. `JEV_PLAYWRIGHT_PROVIDER_URL=https://openrouter.ai/api` is the other door.

**`cooper667/jev-playwright` at `5c99a71`.** Checklist, screenshots, and a PASS/FAIL line. `skills/jev-playwright/runner/engine/jev.ts` posts to Cloudflare `accounts/${accountId}/ai/run` with model `typesafe/jev`. That is not TypeSafe's host. No no-key command was found.

**`moritzkremb/jev-voice-browser` at `198a076`.** The control page draws live probability bars while Playwright acts. Model pin in the survey is `jev-1.13.0`. The door is the SDK default unless `TYPESAFE_BASE_URL` is set. You have to watch it. There is no trace file by default.

**`reticlehq/reticle` at `4a6317f`.** Not cloned. About 145 MB. `server/src/features/harness/jev-driver.ts` sets the base to `https://api.typesafe.ai` and the path to `/v1/systemone`. If the base is not that origin, the path switches to `/v1/model/systemone`. The file says a probability is not the verdict. The verdict lives in `engine/src/evidence/verified.ts`, which was not opened. Do not read a Jev confidence as pass or fail.

## More inspectors

Quill opened these. Detail is `surveys/quill/PLAYGROUNDS.md`.

- `luongnv89/system1` at `872e2d0`. One HTML file. It can call any `/v1/systemone` the browser is allowed to reach. The page says TypeSafe's API answers this origin with a CORS error, so a key typed here does not complete a call to `api.typesafe.ai`.
- `wagnerjt/jev-playground` at `2d09ec1`. Response card titled "Jev Model Response & Probabilities". Default base `https://api.typesafe.ai`. A preset also names Ollama at `http://localhost:11434/v1/systemone`. The key is not stored in the browser.
- `kerryback/jev` at `ad19272`. OpenRouter only. `config.py` sets `BASE_URL` to `https://openrouter.ai/api` and the model to `~typesafe/jev-latest`. The browser does not hold the key.
- `mariusandra/jev.st` at `0eaf0e6`. The text page draws probability tracks. The browser stores the key inside `localStorage` key `jebst-cars`. A relay forwards to `https://api.typesafe.ai`. One preset posts to PostHog's gateway instead.
- `nickthompson480/typesafe-ai-playground` at `8ee3d0b`. The smaller original of the community lab. `python3 run.py` serves port 8765. `server.py` posts to the official endpoint. The key stays in the server process. Use the Next.js lab if you already have it running.

## Closed

All four surveys have a `STOP.md`. `JYeswak/jev_playground` was README-only and was dropped. `https://console.typesafe.ai/playground` returned HTTP 403. Jason Arbon's Playwright post names no repository in the free text. No survey called the Jev API. No survey ran a test suite.
