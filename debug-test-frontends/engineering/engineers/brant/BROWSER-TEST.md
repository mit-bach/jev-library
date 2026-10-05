# Browser-test survey

Part: tools a person can open while debugging a frontend that calls Jev. Grades are evidence for a later pass. They are not the shelf's judgment. Stars were not used.

A **use** grade means the opened file shows a decision a person can look at: a probability, a report, a trace, a video, or a screenshot tied to that decision. A **study** grade means the idea is real and the evidence is a log line, a skill with no default artifact, a research lab, or a bench that does not test your page. A **skip** grade means it is not a debug or test tool.

No live Jev call was made. No browser binary was installed. No test suite was executed. "No-key command" is the command the repo documents or wires. It is not a command this survey ran.

Official door, from the 2026-10-01 scope: `POST https://api.typesafe.ai/v1/systemone`. Where a repo only calls `TypeSafeClient.systemOne`, the URL is not in that repo. It is in `@typesafe-ai/sdk@0.6.0`, which this survey fetched: the client sets `baseURL` to `https://api.typesafe.ai` unless `TYPESAFE_BASE_URL` or `baseURL` overrides it, then `systemOne` calls `POST` `/v1/systemone`, and the transport joins them as `` `${this.baseURL}${req.path}` `` (`dist/index.mjs` in that package).

## Run these while testing a frontend

Open one of the first four if you need to watch a page. Open the filter tools if you need to choose which Playwright tests to run. Open Relay if you need a replay that does not spend a key.

### 1. jonymusky/jev-browser-qa — use

Playwright drives and films. Jev judges claims and picks a control. After a run the dashboard shows pass/fail, the probability, a screenshot, the video, and a trace download.

- Commit `ca6d5a2d46623f9f8606aabc10f1143afd070090` on `main`. Pushed `2026-09-19T20:39:17Z`. License MIT.
- Question: `judge` in `src/jev/judge.ts` builds a boolean question from `snapshotPage`. `pick` in `src/jev/pick.ts` builds a choice over visible controls. Both call `askJev` in `src/jev/client.ts`.
- Report: `JevReporter` in `src/jevReporter.ts` writes `artifacts/runs/<runId>.json` and `artifacts/summary.md`. `scripts/dashboard.ts` serves `dashboard/index.html`, which draws the probability meters and the video.
- What you see: probabilities, a pass bit, a screenshot, an MP4 or WebM, and a Playwright trace zip. The dashboard is at `http://localhost:4310` after `pnpm dashboard`.
- Door, from `src/jev/client.ts`: `gateway.evaluationModel('typesafe-ai/jev')` via the Vercel AI SDK. The repo does not hardcode the gateway URL. The README says the direct API is `POST https://api.typesafe.ai/v1/systemone` and that this project does not use it. Needs `AI_GATEWAY_API_KEY`.
- No-key command: `pnpm typecheck`, or `pnpm dashboard` against an empty `artifacts/` directory. `pnpm test` and `pnpm jev:smoke` need a key. `tests/login.spec.ts` and `tests/navigation.spec.ts` call `expectPage` against `BASE_URL` (default `http://localhost:3000`).
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/jonymusky--jev-browser-qa`
- Writeup opened: https://me.jonymusky.com/blog/jev-system-one-browser-qa names this repo and also `wy-coliney/jev-browser-use` (graded under study).

### 2. vinilana/jev-browser — use

One CLI run writes an offline HTML report and a Playwright trace. Confidence is a column, not a hidden field.

- Commit `7d608732aa586465dc612c1d54c8b83b6ddc7625` on `main`. Pushed `2026-09-17T05:42:50Z`. No license file. GitHub reports no SPDX id.
- Question: `createJevDecider` in `src/infrastructure/models/jev.ts` sends one `choice` named `action` over candidate ids. `createJevEvaluator` sends a `choice` named `completion`.
- Report: `renderReport` in `src/infrastructure/reporting/html.ts`. `FileObserver` in `src/infrastructure/telemetry/file-observer.ts` writes `report.html` and appends `events.jsonl`.
- What you see: `runs/<run>/report.html` (status, eval verdict, per-step confidence, before/after screenshots), `events.jsonl`, `steps.jsonl`, `result.json`, `eval.json`, `final.png`, and `trace.zip`. Open the trace with `npx playwright show-trace`.
- Door: `new TypeSafeClient` then `client.systemOne`. The URL is not in this repo. SDK 0.6.0, which this package depends on, posts `https://api.typesafe.ai/v1/systemone`. Field text goes to OpenRouter at `https://openrouter.ai/api/v1/chat/completions` (`src/infrastructure/models/openrouter.ts`). That is a second door, not the Jev door.
- No-key command: `npm test` (`tsx --test test/*.test.ts`). `test/session.test.ts` injects a fake decider and still launches Playwright against a local fixture server, so Chromium has to be installed already. This survey did not install it and did not run the suite. `npm run check` is typecheck only.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/vinilana--jev-browser`

### 3. ElshinQ/jevaluate — use

A walk, a lower-level browser loop, a visible-text judge, and a first-click tree test. The walk is the one to open.

- Commit `9f1b9272a9ac797fae6bfba54d141d2953a62991` on `main`. Pushed `2026-09-19T15:15:25Z`. License MIT.
- Question: `buildQuestions` in `scripts/browser-loop.mjs` builds one `choice` (`move`) and one `noul` (`goal_reached`) from indexed elements. `judgeLines` in `scripts/judge-lines.mjs` classifies one visible line. `scripts/tree-test.mjs` asks `first_click`. All call `jev` in `scripts/jev.mjs`. The walk reuses that client.
- Report: `scripts/walk.mjs` writes `walk-report.md`, `summary.json`, `trace.jsonl`, and, with `--watch`, `walk.webm`. The browser loop writes `trace.jsonl`, `verdict.json`, and `step-NN.png`. The tree test writes a JSON file under `--out`.
- What you see: a markdown table of goals, status, and vision findings; screenshots beside it; an optional video. The text judge prints `FLAG` / `UNSURE` lines and a confidence. The tree test prints hit rate and writes JSON. There is no HTML dashboard.
- Door, quoted from `scripts/jev.mjs`: `export const ENDPOINT = 'https://api.typesafe.ai/v1/systemone'`. The walk also calls DeepSeek for pixels. Jev does not see those pixels.
- No-key command: none that produces a judgment. The scripts exit if `TYPESAFE_API_KEY` is missing. There is no test runner. Fixtures are `examples/walk.json`, `examples/lines.txt`, `examples/tree.json`, `examples/tasks.json`. The browser loop needs Playwright installed.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/ElshinQ--jevaluate`

### 4. browser-use/jev-ultrafast — use

A local inspector shows the live page, numbered elements, and the probability bars for the choice Jev just made.

- Commit `1231850a0bf1a0c0341fe408ef1668dbbfdfac46` on `main`. Pushed `2026-09-30T01:24:38Z`. License MIT. Local `HEAD` matches GitHub.
- Question: `choose` in `jev_ultrafast/model.py` builds `operation` plus one target question per operation. Instruction text is `NEXT_ACTION` and `TARGET` in `jev_ultrafast/questions.py`.
- Report: `jev_ultrafast/demo.py` serves `jev_ultrafast/static/index.html`. `static/app.js` renders `target_probabilities` as bars and a step trace with latency and probability. Optional frames go to `artifacts/frames`. A checked-in `docs/demo.mp4` is a recording, not your run.
- What you see: at `http://127.0.0.1:8766`, operation and target probabilities, the chosen element, and whether the page changed. Not a pass bit. A separate verifier exists for the flights example.
- Door, quoted from `model.py`: `post_json("https://api.typesafe.ai/v1/systemone", os.environ["TYPESAFE_API_KEY"], body)`. Typed field text uses a second, OpenAI-compatible model.
- No-key command: `pytest tests/test_agent.py` (or `uv run pytest`). The file says "No paid APIs" and mocks `post_json`. Dependencies are not installed here, so this survey did not run it. `uv run jev` needs `TYPESAFE_API_KEY`.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/browser-use--jev-ultrafast`

### 5. Faresabdelghany/jev-browser-test — use

A skill plus a Python runner. A finished run is a directory a person can open.

- Commit `28a550694dfb79acff962736819ac4e48cc5c678` on `main`. Pushed `2026-09-24T13:41:55Z`. No license file.
- Question: `scripts/jev_client.py` posts the decision body. `DEFAULT_BASE_URL = "https://api.typesafe.ai/v1/systemone"`.
- Report: `build` in `scripts/report.py` reads `trace.json` and `result.json` and writes `report.html`. The HTML shows confidence, per-step probability text, and screenshots.
- What you see: `report.html`, `trace.json`, `result.json`, and step screenshots. `scripts/summarize_trace.py` prints a short version of the same run.
- Door: the constant above.
- No-key command: `.venv/bin/python scripts/selftest.py`. The README says it is offline and must end `SELFTEST OK`. This survey did not create the venv or run it. `scripts/unit_tests.py` stubs the client.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/Faresabdelghany--jev-browser-test`

### 6. cooper667/jev-playwright — use

A Claude/Codex plugin. Playwright runs a plain-English checklist. Jev picks the control and judges the check. Artifacts land in the Playwright output directory.

- Commit `5c99a71dc2dd0b9e1ef945603eec4af1f9c0ca17` on `main`. Pushed `2026-09-30T07:49:56Z`. License MIT.
- Question: `askJev` in `skills/jev-playwright/runner/engine/jev.ts`.
- Report: `skills/jev-playwright/runner/engine/checklist.ts` writes `qa-report.json` and, if `QA_TRACE` is set, `qa-trace.zip`. `evidence.ts` names `step-${number}.png`. `verdict` in `verdict.ts` prints a PASS/FAIL line that includes the yes-probability.
- What you see: a verdict line, step screenshots, a JSON report, and an optional trace zip. Layout checks are screenshots for the caller, not a Jev score.
- Door, quoted from `jev.ts`: `` `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run` `` with body `model: "typesafe/jev"`. Needs `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. This is not the TypeSafe host.
- No-key command: none found. The clone has no test directory and no `package.json` scripts.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/cooper667--jev-playwright`

### 7. srirsatt/jev-uicheck-fast — use

Playwright snapshots a page before and after a change. Local code checks console and network health. Jev scores the diff. The exit code follows browser health. Jev stays advisory.

- Commit `2e0ad04e879f18ddcc5916afed2974eb09b093f9` on `main`. Pushed `2026-09-30T01:06:43Z`. No license file.
- Question: `buildIntentRequest` in `src/checks/questions.ts` builds three `choice` questions: `intent`, `unexpectedChanges`, `regression`. Each criterion is `satisfied`, `violated`, or `insufficient_evidence`.
- Report: `formatCombinedReport` in `src/report.ts` prints each choice with `probability` and `confidence`.
- What you see: a text report and a structured report object. Not a video. The README also describes JSON evidence.
- Door, quoted from `src/jev.ts`: `const endpoint = 'https://api.typesafe.ai/v1/systemone'`. `test/jev.test.mjs` asserts that URL.
- No-key command: `npm test` builds, then `node --test test/*.test.mjs`. The Jev test mocks fetch. A URL health check, per the README, does not need a key. This survey did not run either.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/srirsatt--jev-uicheck-fast`

### 8. dingw530/playwright-jev — use

Jev picks from a bounded action list. `playwright-cli` acts. Deterministic assertions decide pass or fail. The trace file keeps the confidence.

- Commit `15bd5a44d8517ce75bd303c53ba66ec3d8afdca6` on `main`. Pushed `2026-09-23T01:37:13Z`. License MIT.
- Question: operation rules and the request live in `src/typesafe-client.mjs`. `src/runner.mjs` records each decision on the trace, including a review stop when confidence is under the threshold.
- Report: `Runner` writes `traceFile` as pretty JSON. The README says the login example writes `outputs/login-trace.json`.
- What you see: a pass/fail line and a JSON trace with status (`passed`, `failed`, `review`, `blocked`), per-step errors, and Jev latency. Not an HTML page.
- Door, quoted from `src/typesafe-client.mjs`: `const DEFAULT_ENDPOINT = "https://api.typesafe.ai/v1/systemone"`.
- No-key command: serve `examples/demo-app` and run `node scripts/cli.mjs examples/login.offline.json --offline`. The README says that path uses preset actions and does not call Jev. `npm test` and `npm run check` do not need a key. This survey did not run them. The offline path still needs `playwright-cli` and a local server.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/dingw530--playwright-jev`

### 9. tontoko/jev-browser — use

A library, CLI, and MCP server. Native Playwright operations stay in code. Jev only answers choice questions. Traces and screenshots are part of the product, not an afterthought.

- Commit `94f8814fd9af914749c00b8b91192d307ffbb35d` on `main`. Pushed `2026-10-01T11:39:54Z`. License Apache-2.0.
- Question: `src/bindings.ts`, `src/browser.ts`, and `src/runner.ts` build `type: 'choice'` questions. `wireDecisionRequest` and the client in `src/decision.ts` send them.
- Report: `src/browser-events.ts` starts and stops a Playwright trace. `src/screen.ts` writes a `screen-*.jsonl` journal and can capture PNGs. `src/session-worker.ts` writes `session.json`.
- What you see: trace, screenshots, a session file, and CLI results. There is no run dashboard in the files opened here.
- Door, quoted from `src/decision.ts`: `const hostedOrigin = 'https://api.typesafe.ai'`, passed as `baseURL` to `TypeSafeClient`. The path `/v1/systemone` is the SDK's, not a string in this file. A custom `JEV_BASE_URL` is allowed and, on loopback, needs no hosted key.
- No-key command: `npm test` (`node scripts/test.mjs`). `test:live` is separate and is not the no-key path. This survey did not run either.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/tontoko--jev-browser`

### 10. Kevin-Liu-01/Relay — use

A Slack-like workspace where an agent runs and a person watches the decision. GitHub `size` is 138680, so this survey did not clone it. The files below were read through the GitHub contents API.

- Commit `46cc77af7ff88b8d0191e9d35ea1f85ef94484bc` on `main`. Pushed `2026-10-02T20:25:36Z`. `LICENSE` is MIT. The license API returns `NOASSERTION`.
- Question: `actionCandidates` and `TypeSafeRouter.prepare` in `runner/typesafe.mjs` build one `choice` named `action` over a menu of at most 255 controls.
- Report: `src/live/main.jsx` renders a heading `Action probabilities` from `decision.probabilities`. The README describes History, Compare, and Audit, plus JSON, JSONL, and screenshot bundles. `replay.html` plays a recorded run inside the workspace.
- What you see: the browser the agent drove, the probability bars for the offered menu, and downloadable trajectories. The README says those bars are the returned distribution, not a probability that the task will succeed. Replays open with no key. A live run needs a TypeSafe key or a Ramp key. Keys are not written into the saved history.
- Door, quoted from `runner/typesafe.mjs`: `` fetch(`https://api.typesafe.ai/v1/${path}` `` and later `this.request('systemone', prepared.body)`, so the decision post is `https://api.typesafe.ai/v1/systemone`.
- No-key command: `npm test` (`node --test tests/*.test.mjs`). `tests/hosted.test.mjs` mocks the TypeSafe response. `npm run live` serves the UI; inspecting a published replay does not need a key. This survey did not install or run it.
- Tests also include `tests/browser/hosted.spec.mjs` and `tests/playback.test.mjs`.

### 11. mizchi/jev-test-filter — use

This is the diff scorer the mission asked for. It does not drive a browser. It scores every test against a git diff and prints the filter your runner already accepts, including Playwright.

- Commit `955bdf4e20ff49c3dac0b5b3eee5df0278d5be87` on `main`. Pushed `2026-09-24T12:11:22Z`. License MIT.
- Question: `buildQuestion` in `src/questions.ts` builds one `score` per test. Levels are `unrelated`, `unaffected`, `at-risk`, `likely-failing`.
- Report: `renderJson` in `src/cli.ts` prints `score` and `confidence` per test. A recorded run is `.jev-test-filter/last.json`. `--replay` re-gates that file with no new call.
- What you see: filter arguments (`--test-list` for Playwright, name patterns for vitest and node:test) or the full JSON. Not a video.
- Door, quoted from `src/jev.ts`: `DEFAULT_BASE_URL = "https://api.typesafe.ai"` and `` `${this.baseUrl}/v1/systemone` ``.
- No-key command: `pnpm test` (`node --test "test/*.test.ts"`), which uses a fake transport, or `jev-test-filter --replay .jev-test-filter/last.json` after a recorded run. This survey did not install or run it. A live score needs `TYPESAFE_API_KEY` or `TYPESAFEAI_API_KEY`.
- Playwright discovery is `listPlaywrightTests` in `src/playwright.ts`. Filter shapes are `buildFilter` in `src/filter.ts`.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/mizchi--jev-test-filter`

### 12. arthurfiorette/jev-playwright — use

Same job as the filter above, as a Playwright reporter. It runs before the browser tests. A green run can mean zero tests ran. Read the `Selected 0/N` line.

- Commit `96bdcc6bdf2dd0a9194c302e84eb6c87abb4f398` on `main`. Pushed `2026-10-01T21:49:44Z`. License MIT. The committer date on the shallow clone is 2026-09-24. `HEAD` matches GitHub.
- Question: `sdkClient` and the batch caller in `src/selection.ts` / `src/batch.ts` call `client.systemOne`.
- Report: the reporter prints the selection. There is no HTML dashboard in the files opened here. The README warns that secrets in the diff are not redacted.
- What you see: which tests were selected, then the normal Playwright report for those tests.
- Door: `new TypeSafeClient` with `baseURL` only when `providerUrl` is set (`src/selection.ts`). Unset, the SDK posts `https://api.typesafe.ai/v1/systemone`. The README shows `JEV_PLAYWRIGHT_PROVIDER_URL=https://openrouter.ai/api` as the other door. The SDK then appends `/v1/systemone`.
- No-key command: `pnpm test` (`tsx --test test/*.test.ts`) if the tests inject a client. This survey did not open every test body and did not run them. A real selection needs `JEV_PLAYWRIGHT_PROVIDER_KEY`.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/arthurfiorette--jev-playwright`

### 13. moritzkremb/jev-voice-browser — use

Voice is the input. The reason it is here is the control room: probability bars for intent and target while Playwright acts.

- Commit `198a0764395a666f8398026c0d8abdaf6d1866c5` on `main`. Pushed `2026-09-21T08:57:55Z`. License MIT.
- Question: `buildRequest` in `src/jev.js` fans out `choice` questions from `QUESTIONS` in `src/constants.js` (`intent`, `target`, `site`, and others). It calls `client.systemOne`. Model is pinned to `jev-1.13.0`.
- Report: `src/public/index.html` is the page. Bars are `.bar` / `.fill`. There is no trace file by default.
- What you see: live bars, the winning action, latency, and a log. You have to be looking while it runs.
- Door: `TypeSafeClient` from `@typesafe-ai/sdk` `^0.6.0`. URL is the SDK default above, unless the process sets `TYPESAFE_BASE_URL`.
- No-key command: `npm test` (`node --test 'test/unit/**/*.test.js'`). `test/unit/controller.test.js` mocks Jev. `npm run demo` refuses to start without a key. This survey did not `npm install` and did not run the tests.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/moritzkremb--jev-voice-browser`

### 14. reticlehq/reticle — use, with a hard limit

GitHub `size` is 148893, so this survey did not clone it. It is a runtime inspector for a running web or desktop app, not a passing mention of Jev. Jev may drive the page. Jev does not own the verdict.

- Commit `4a6317f9155e31e5e55d718c42718c66c225fd3b` on `main`. Pushed `2026-10-02T19:13:15Z`. The root `LICENSE` is a per-package mix: Apache-2.0 for the protocol and embeddable SDK, plus a functional source license on the server. The license API returns `NOASSERTION`.
- Question: `jevDriver` in `server/src/features/harness/jev-driver.ts`. The file builds the choice set from controls on the page, including synthetic options `finish`, `look_again`, and `go_back`. The comment at the top says a probability is not proof and points the verdict at `engine/src/evidence/verified.ts`. This survey did not open `verified.ts`.
- Report: the README says the product returns pass, fail, or could-not-tell, with a `file:line`. This survey did not open the dashboard component.
- What you see: a verdict that is computed in code, plus whatever trace the inspector stores. Do not read a Jev confidence as that verdict.
- Door, quoted from `jev-driver.ts`: `DEFAULT_JEV_BASE_URL = 'https://api.typesafe.ai'`, `SYSTEMONE_PATH = '/v1/systemone'`, and `doFetch(\`${options.baseUrl}${options.path}\`)`. If `baseUrl` is not the TypeSafe origin, the path switches to `PLATFORM_PATH = '/v1/model/systemone'`. `bench/JEV-SCORECARD.md` records a 404 from posting the TypeSafe path at the platform host.
- No-key command: not established. `server/src/features/harness/jev-driver.test.ts` exists. This survey did not run it.
- Grade file: `server/src/features/harness/jev-driver.ts`, read through the API.

## Study

These are worth keeping in view. They are the wrong first tool when a person needs evidence of a frontend run.

### KiritoKing/midscene-jev-runner — study

A Playwright step runner for Midscene Test. It decides and acts. It does not write a report.

- Commit `f07d22fd682697e874faf2f5a062d30272b92900` on `main`. Pushed `2026-09-24T07:34:55Z`. License MIT.
- Question: `createDecisionRequest` in `src/decision.ts`.
- Evidence: `runJev` in `src/runner.ts` emits observer events with `operation`, `target`, `label`, and token usage. The event object opened here does not include probability. No HTML or trace writer is in this package. The caller owns the browser.
- Door: `DEFAULT_JEV_BASE_URL = 'https://openrouter.ai/api/alpha'` in `src/constants.ts`, joined by `endpoint(baseUrl, 'decisions')` in `src/utils.ts`. The README states the resulting URL `https://openrouter.ai/api/alpha/decisions` and model `~typesafe/jev-latest`. Not the official host.
- No-key command: `pnpm test` (`vitest run`). `tests/runner.test.ts` mocks `fetch` and imports Playwright. This survey did not run it.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/KiritoKing--midscene-jev-runner`

### xpressabhi/jev-browser — study

A decision CLI. It does not open a browser. One compact JSON line on stdout is the whole artifact.

- Commit `740f1800d61717cdb9eaab66c39799283c905342` on `main`. Pushed `2026-09-20T17:20:04Z`. License MIT.
- Question: `buildRequest` in `src/core/jev.ts`, instructions from `src/core/questions.ts`.
- Door, quoted from `src/core/jev.ts`: `export const TYPESAFE_URL = "https://api.typesafe.ai/v1/systemone"`.
- Tests: `npm test` (`node --test test/*.test.ts`), including `test/jev.test.ts`. No-key if those tests pass a fake `fetch`. Not run here.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/xpressabhi--jev-browser`

### Ying-Kai-Liao/jev-browser — study

A real Playwright loop with a library, CLI, and MCP server. The default person-facing output is a summary line.

- Commit `b8c9e7f862ade1a112bd5d6544ba8e0c7dcbeb36` on `main`. Pushed `2026-10-02T06:44:03Z`. License MIT.
- Question: the `do` loop in `src/session.mjs` builds `noul` and `choice` questions (`done`, `tool`, `value`, target index, and others) and calls `jev` in `src/jev.mjs`.
- Evidence: `bin/jev-browser.mjs` prints `passed/steps` and, with `--json`, the run object. `screenshot` is a method. This survey found no default trace or HTML report.
- Door, quoted from `src/jev.mjs`: `export const API_URL = process.env.JEV_API_URL || "https://api.typesafe.ai/v1/systemone"`.
- No-key command: `npm test` (`node --test test/*.test.mjs`). `test:e2e` is separate. Not run here.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/Ying-Kai-Liao--jev-browser`

### romaluev/jev-ego — study

The ultrafast action space on an ego-lite browser, not Playwright. It can persist JSON. It has no dashboard.

- Commit `12eaafe795db56da821d9268ee7b9ae9ea24b23b` on `main`. Pushed `2026-09-17T14:35:29Z`. `LICENSE` is MIT. The license API returns `NOASSERTION`.
- Question: `NEXT_ACTION` / `TARGET` in `src/questions.ts`. `src/model.ts` posts the body.
- Evidence: `src/main.ts` writes `probe.json` or `state.json` when an output directory is set, and prints a table. That is a file, and it is easy to miss.
- Door, quoted from `src/model.ts`: `postJson("https://api.typesafe.ai/v1/systemone", key, body)`.
- No-key command: `pnpm test` (`vitest run`). Not run here.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/romaluev--jev-ego`

### krw82/jev-playwright-mcp — study

A proxy in front of `@playwright/mcp`. Jev can block a risky tool call. The person sees a log line.

- Commit `db7762fd2ef66af7b38362c98982692bc81f57b7` on `main`. Pushed `2026-09-17T09:18:17Z`. License MIT.
- Question and door: `src/jev/client.ts` sets `const JEV_ENDPOINT = "https://api.typesafe.ai/v1/systemone"`.
- Evidence: `src/proxy.ts` logs `Blocked by Jev risk gate` with `p=<probability>`. No report file.
- No-key command: `npm test` (`vitest run`). `tests/jev-client.test.ts` asserts the endpoint. Not run here.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/krw82--jev-playwright-mcp`

### yukurash/jev-playwright-repair-lab — study

A lab that compares locator repair: rules, a GPT model, and Jev, then checks the repair independently. Useful if a frontend's Playwright locators broke. It is not a page-judge loop.

- Commit `500aabc76805554e8fa3aa19c1deb31abaa41c3e` on `main`. Pushed `2026-09-25T08:46:40Z`. License MIT.
- Door, from `packages/providers/src/live.ts`: `https://api.typesafe.ai/v1/systemone`, or `https://openrouter.ai/api/v1/systemone`, or `https://ai-gateway.vercel.sh/v1/evaluate`. `packages/providers/src/providers.test.ts` asserts the OpenRouter and Vercel URLs.
- Evidence opened: `docs/comparison-results.md` and `docs/providers.md`. The CLI has `doctor`, `capture`, and `repair`. This survey did not open the CLI's output writer.
- No-key command: `npm test` (`vitest run`). Not run here.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/yukurash--jev-playwright-repair-lab`

### zbcoding/jev-userflow-browser-monitor — study

A skill template for a daily GitHub Action. You copy it onto a site. The checked-in target is `https://example.com`.

- Commit `e061366933c6d34dd4a79564d5f5d4bc4988b284` on `main`. Pushed `2026-09-22T20:56:14Z`. License MIT.
- Question and door: `scripts/jev.mjs` sets `const TYPESAFE_URL = "https://api.typesafe.ai/v1/systemone"`.
- Evidence: `templates/run.mjs` writes `qa-results/result.json` and, on failure, `failure.png`. Nothing is produced until the template is copied and the action runs.
- Tests: no test script.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/zbcoding--jev-userflow-browser-monitor`

### davidkotler/jev-browser-tests — study

Three prompt-driven checks against saucedemo. The README says the demo has no reporting. A person gets a `PASS` or `FAIL` line.

- Commit `ed532e1070fff55ccd58ae9e0f8184ca29e36943` on `main`. Pushed `2026-09-22T03:45:49Z`. No license file.
- It vendors the ultrafast pattern and verifies with a `verify(page)` function. This survey did not open the decision function. The README is the evidence for the grade: no report.
- No-key command: not found. `uv run pytest` is the documented run and needs keys.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/davidkotler--jev-browser-tests`

### wy-coliney/jev-browser-use — study

Named by the jonymusky writeup. A Codex skill: Jev clicks, the coding agent types and verifies. The skill text says no trace file is written unless you ask.

- Commit `cf7e76607d4ec70592b24becadd0296dcda8177a` on `main`. Pushed `2026-09-23T04:01:55Z`. License MIT.
- Question: `decide` in `skills/jev-browser-use/bridge.mjs` builds `questions.next` as a `choice`.
- Door, quoted there: `endpoint:'https://api.typesafe.ai/v1/systemone'`. The same table has an OpenRouter adapter. Provider config is `skills/jev-browser-use/references/provider-configuration.md`.
- Tests: `.github/tests/bridge.test.mjs`, `bridge-transport.test.mjs`, `bridge-input-contract.test.mjs`. Not opened line by line and not run.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/brant/trees/wy-coliney--jev-browser-use`

### PenglongHuang/jev-demo — study

A local page for sending a state and typed questions and seeing bars. Preset scenes include a browser task. It does not test your frontend.

- Commit `def34f2c3c996554d05a124fcdd67acad9ff41fa` on `main`. Pushed `2026-09-30T02:10:57Z`. License MIT.
- Draw file: `barsHtml` and the answer renderer in `public/js/output.js` show choice probabilities, score bars, noul probability, and confidence.
- Door, from `server.js` as returned by search: `official: 'https://api.typesafe.ai/v1/systemone'` and `openrouter: 'https://openrouter.ai/api/v1/systemone'`. `public/js/app.js` repeats those URLs.
- No-key command: `npm test` (`node --test "tests/*.spec.js"`). Not run here. The page itself needs a key to call Jev.
- This survey did not isolate the function that assembles a preset's question map. The bars are the part that was read.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/PenglongHuang--jev-demo`

### devagrawal09/jev-review — study

A code-review dashboard, not a browser test. The grid is real probabilities, so it belongs in the notes.

- Commit `31f89602797fb7bea007f8a480bf368bf564954e` on `main`. Pushed `2026-09-17T00:29:25Z`. License MIT.
- Question: `src/review/judgments.ts` imports `choice`, `noul`, `score`, and `TypeSafeClient` from `@typesafe-ai/sdk` `^0.6.0`. The URL is not in the repo. The SDK posts `https://api.typesafe.ai/v1/systemone`.
- Draw file: `src/dashboard/public/app.js` draws one screening probability per file and category.
- No-key command: `npm run dashboard` if a saved report exists, or `npm run check` (typecheck plus a syntax check of `app.js`). There is no test script.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/devagrawal09--jev-review`

### vinilana/jev-eval-agent — study

An eval of tool routing, with a dashboard of recorded runs. Not a frontend test. The UI can be opened without a key because the results are already in the repo.

- Commit `037de1120c84b4b63cdf748e2acf258ff66d7731` on `main`. Pushed `2026-09-17T11:07:31Z`. No license file.
- Question: `getClient` in `agent/lib/jev-router.ts` uses `TypeSafeClient`. SDK door as above. The agent also uses OpenRouter for the language model.
- Draw file: `eval-ui/index.html` and `eval-ui/charts.js`.
- No-key command: `npm run ui` (`node scripts/serve-ui.mjs`). There is no unit-test script. `npm run typecheck` does not need a key.
- Local path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/vinilana--jev-eval-agent`

### Placed from one file, not surveyed as a test loop

- **sugarforever/tryjev — study.** `src/lib/server/providers.ts` posts `https://api.typesafe.ai/v1/systemone`. The same app also calls OpenRouter and Vercel AI Gateway (`src/lib/types.ts`). It is a three-pane playground. This survey did not read the Svelte answer pane. Commit `52770fc2166b929ede98c6a1599cc03dea33af9c`, `main`, pushed `2026-09-25T19:24:01Z`, MIT. Path: `.../originals/github/sugarforever--tryjev`.
- **terryds/jevplayground — study.** `public/index.html` sets `const ENDPOINT = 'https://ai-gateway.vercel.sh/v4/ai/evaluation-model'`. Browser-only, Vercel door, not TypeSafe. Commit `02c20a09b37cca2fbdd586394f2bee82db6a5dae`, `main`, pushed `2026-09-19T09:52:17Z`, no license from the API. The answer renderer was not read. Path: `.../originals/github/terryds--jevplayground`.
- **TypeSafeAI/typesafe-playground — study.** `lib/serverJev.ts` posts `https://api.typesafe.ai/v1/systemone`. It is a large use-case playground, not a browser-test loop. The React answer view was not opened. Commit `0fbc9ef9d99157a2f86631fa3b385ef88ca79a10`, `main`, pushed `2026-10-01T17:56:41Z`, MIT. Path: `.../originals/github/TypeSafeAI--typesafe-playground`.
- **TypeSafeAI/jev-harness — study.** `examples/host/jev-choice.ts` exports `JEV_SYSTEMONE_URL = "https://api.typesafe.ai/v1/systemone"`. A coding harness that leaves receipts. Not a browser test. The receipt UI was not opened. Commit `1239b23052b701e690727755cf17ea90c92654ff`, `main`, pushed `2026-10-01T23:21:58Z`, MIT. Path: `.../originals/github/TypeSafeAI--jev-harness`.
- **adyoi/jev-system-one-playground — study.** `Program.cs` defaults the endpoint box to `https://api.typesafe.ai/v1/system-one`. That path is not `/v1/systemone`. The result pane was not read. Commit `b133e6b41fbc0638cfb11f413cd6544f7b1cf1e2`, branch `master`, pushed `2026-09-24T08:33:07Z`, no SPDX id from the API. Path: `.../originals/github/adyoi--jev-system-one-playground`.

## Dropped

- **comoc/jev-minesweeper — skip.** A game that asks Jev to play minesweeper. `server.mjs` proxies to TypeSafe `/v1/systemone`. There is no reusable test or debug UI in the files seen. Commit `5cbc361b1260cdfef6e9383639797bf483c064e0`. Path: `.../originals/github/comoc--jev-minesweeper`.
- **Jason Arbon, "I Put Jev in a Playwright Browser Testing Loop."** https://jarbon.substack.com/p/i-put-jev-in-a-playwright-browser The free text describes a storefront, a Node controller, Playwright, two Jev calls per probe, and a dashboard of timings and probabilities. It names no GitHub repository. The rest of the post is behind a subscription wall. Nothing was cloned from it.
- **mizchi/jev-lint** and **mizchi/jev-playground** showed up in search. They were not opened. jev-lint's description is a text linter. It is not graded.
- **mizchi/awesome-jev** is a list. It was not cloned.

Named seeds that were not dropped: jev-browser-qa, vinilana/jev-browser, jevaluate, Relay, midscene-jev-runner, jev-voice-browser, jev-ego, both other jev-browser repos (xpressabhi and Ying-Kai-Liao), jev-ultrafast, jev-test-filter, and reticle. Reticle stayed because `jev-driver.ts` is a runtime inspector that posts to System One, not a slogan.
