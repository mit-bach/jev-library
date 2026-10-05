# Field index

Survey of public catalogs for Jev debug, test, playground, dashboard, trace, and frontend-inspection projects. Date of the fetches: 2026-10-02. This pass does not redo the deep playground, browser-test, or eval surveys. It records what those passes would miss, plus the catalog hits that turned out to be something else.

A grade exists only when a non-README file was opened. `use` means the opened file draws a decision, a probability, a raw request, or a rerunnable report, and it is not only a screenshot. `study` means the idea is worth keeping and the opened code is thin, mock-only, unofficial, or hard to run. `skip` means the opened file is not a debug or test tool, or the UI is a stub. README-only rows are not graded. Catalog-only rows were not opened past the list.

GitHub `size` is kilobytes. The official request door is `POST https://api.typesafe.ai/v1/systemone`. Any other host is unofficial. No live Jev call was made. No key was copied.

Official TypeSafe surfaces and community repos are separated at the end. The `TypeSafeAI` GitHub org on the parent clone shelf describes itself as a community playground. It is not `github.com/typesafe-ai`.

## Playground

Opened source first.

### jeiel85/jevscope — use

Local decision debugger and batch workbench. Community. Not an official TypeSafe repo.

- URL: https://github.com/jeiel85/jevscope
- Commit: `d39ab43e88af20be7142b4335c84fbf69c740e0e`. Branch `main`. Pushed 2026-09-18T15:29:27Z. License MIT. Size 209.
- Frontend: yes. `apps/studio/src/App.tsx` stores each run as `request` plus `result`. `packages/evaluator/src/workbench.ts` exports `parseCases`, `checkExpectations`, and `runBatch`.
- Door: the studio defaults to `http://localhost:4317` (`VITE_API_URL` in `App.tsx`). `packages/provider-typesafe/src/index.ts` calls `this.#client.systemOne`. The official host string was not in that provider file.
- Keyless: no. The studio footer says the key stays in the local server.
- Tests: `packages/evaluator/src/workbench.test.ts`, `packages/provider-typesafe/src/index.test.ts`.

### MashiroKai/jev-playground — use

Thin page: type a state, add typed questions, read answers and confidence. Community.

- URL: https://github.com/MashiroKai/jev-playground
- Commit: `148e4f927d7c9ec83a37492cb65099410143e459`. Branch `main`. Pushed 2026-09-29T00:14:34Z. License MIT. Size 54.
- Frontend: yes. `public/index.html` function `addQuestionRow`.
- Door: `server.mjs` comments name the default as hosted TypeSafe, `POST api.typesafe.ai/v1/systemone`. The same file also allows a local Laya `POST <baseUrl>/predict` and an OpenAI-shaped `POST <baseUrl>/chat/completions`.
- Keyless: no. The key stays on the Node server (`JEV_API_KEY`).
- Tests: none in the tree.

### Dillettant/jev-test — use

Small Next.js playground that shows the request body it would send. Community.

- URL: https://github.com/Dillettant/jev-test
- Commit: `110c2051ec10ee48ac6aebeb63ee66db59c586b2`. Branch `main`. Pushed 2026-09-19T17:59:46Z. License none. Size 70.
- Frontend: yes. `src/components/Playground.tsx` exports `Playground`. It `fetch`es `/api/systemone` and renders the string `POST https://api.typesafe.ai/v1/systemone` plus the JSON body.
- Door: official URL is in that component. The browser calls the app's own `/api/systemone`.
- Keyless: no evidence of a fixture mode.
- Tests: none in the tree.

### grandaha/jev-playground — use

One experiment inside this repo is a real state-and-question page. The rest are scenario reports. Community.

- URL: https://github.com/grandaha/jev-playground
- Commit: `e4827651dba502f26b9848195d738b28289baba5`. Branch `main`. Pushed 2026-10-01T00:30:07Z. License MIT. Size 3851.
- Frontend: yes, for that experiment. `experiments/playground/scripts/index.html` has a state pane.
- Door: `experiments/playground/scripts/server.py` sets `API = "https://api.typesafe.ai/v1"` and `POST`s `/systemone`.
- Keyless: no. The server reads `TYPESAFE_API_KEY`.
- Tests: `experiments/playground/tests/test_playground.py`.

### goodboybeau/system-one-playground — study

Local Apple-side workbench that compares engines and shows the exact body of a `/v1/systemone` post. Community.

- URL: https://github.com/goodboybeau/system-one-playground
- Commit: `304c528f1e83ca4412f99a9d5943688929404c3a`. Branch `main`. Pushed 2026-09-27T22:43:17Z. License MIT. Size 2889.
- Frontend: yes. `ui/src/pages/Playground.tsx` exports `PlaygroundPage`. The page text says "The exact body sent to POST /v1/systemone."
- Door: that string is the local gateway path. `engines/jev/src/engine_jev/client.py` was not found (HTTP 404). The upstream host was not opened.
- Keyless: unknown. Gateway tests exist: `gateway/tests/conftest.py`, `engines/jev/tests/test_engine_jev.py`.
- Grade is study because the official host was not in the file that draws the page.

### shivanathd/jev-playground — study

BYOK page that keeps the request and the success body in React state. Community.

- URL: https://github.com/shivanathd/jev-playground
- Commit: `20574a96ab5ac3d39b945b290ff0daafec5eca39`. Branch `main`. Pushed 2026-09-19T03:48:55Z. License MIT. Size 93.
- Frontend: yes. `src/components/Playground.tsx` exports `Playground` and holds `SystemOnePayload` and `SystemOneSuccess`.
- Door: not in `Playground.tsx` or `src/lib/run-system-one.ts`. The README names `https://api.typesafe.ai`. That URL was not in the two source files.
- Keyless: no.
- Tests: none in the tree.

### k3a/jev-playground — study

Single HTML tester, including an image control. Community.

- URL: https://github.com/k3a/jev-playground
- Commit: `73eae15d3cbcd11a4a72bae4b147258777934c46`. Branch `main`. Pushed 2026-09-28T14:30:44Z. License none. Size 504.
- Frontend: yes. `index.html` function `renderQuestions`. The API field defaults to `http://localhost:8000/v1/systemone`.
- Door: unofficial local default, System One path. Not `api.typesafe.ai`.
- Keyless: the page can point at any URI. No fixture file was opened.
- Tests: none in the tree.

### frederico-kluser/jev-playground — study

Request inspector with latency and cost. Community. Unofficial door.

- URL: https://github.com/frederico-kluser/jev-playground
- Commit: `4edca2814216a7558f600e5ebc731410fffa19e7`. Branch `main`. Pushed 2026-09-29T00:11:14Z. License MIT. Size 291.
- Frontend: yes. `components/RequestInspector.tsx` exports `RequestInspector`. The footer is the byte size plus `POST https://openrouter.ai/api/alpha/decisions`. `app/page.tsx` exports `PlaygroundPage`.
- Door: OpenRouter alpha decisions API. Not official.
- Keyless: no.
- Tests: `lib/jev.test.ts`.

### hugo-alves/jev-router-playground — study

Routing playground. The official URL is present. The default Jev endpoint is a third-party worker. Community.

- URL: https://github.com/hugo-alves/jev-router-playground
- Commit: `c2eb6ccf68b793d4ad99fb0ff1cc29edf11d9a93`. Branch `main`. Pushed 2026-09-18T01:25:54Z. License MIT. Size 259.
- Frontend: yes. `app.js` is the page. It sets `JEV_DIRECT_URL = 'https://api.typesafe.ai/v1/systemone'`, default `jev` to `https://jev-router-proxy.xperiment.workers.dev/jev`, and OpenRouter to `https://openrouter.ai/api/v1`.
- Keyless: no. Keys sit in `localStorage`.
- Tests: none in the tree.

### yAntPower/jev-decision-lab — study

Bilingual Choice / Noul / Score page. Only the built bundle was opened. Community.

- URL: https://github.com/yAntPower/jev-decision-lab
- Commit: `b60ce057c70499802ad9d56a92ab78007d183be6`. Branch `main`. Pushed 2026-09-25T01:38:58Z. License MIT. Size 107.
- Frontend: yes, as `dist/app.js` and `dist/index.html`. No separate source file was in the tree.
- Door: `dist/app.js` contains `api.typesafe.ai` and `/v1/systemone`.
- Keyless: no evidence.
- Tests: none noted.

### saimahmedqazi/typesafe-jev-playground — study

BYOK workbench with a result inspector and several LLM adapters, not only Jev. Community.

- URL: https://github.com/saimahmedqazi/typesafe-jev-playground
- Commit: `b6e6e316d0967a49bce07f61aa5c4292e785605f`. Branch `main`. Pushed 2026-10-02T07:38:55Z. License none. Size 291.
- Frontend: yes. `src/client/components/ResultInspector.tsx` exports `ResultInspector` (table or raw).
- Door: `src/server/evaluate.ts` fetches Groq, OpenAI, and Google model-list URLs. An official System One URL was not in that file.
- Keyless: no.
- Tests: `tests/adapters/native-jev-adapter.test.ts`.

### wagnerjt/jev-playground — study

React page over the System One result type, with a raw toggle. Community.

- URL: https://github.com/wagnerjt/jev-playground
- Commit: `2d09ec1c1e504f7ec4386a2b9d4edc5fe6069dbc`. Branch `main`. Pushed 2026-09-30T22:37:10Z. License MIT. Size 234.
- Frontend: yes. `src/components/ResponseVisualizer.tsx` exports `ResponseVisualizer` and imports `SystemOneResult` from `@typesafe-ai/sdk`.
- Door: not in that file. The README names `https://api.typesafe.ai` and `http://localhost:11434/v1/systemone`.
- Keyless: unknown.
- Tests: none in the short tree.

### Laaaaksh/jev-playground — study

Small BYOK page. Community.

- URL: https://github.com/Laaaaksh/jev-playground
- Commit: `9a0d9ba518b611d1b24defefc8e6c3f6ac9708e6`. Branch `main`. Pushed 2026-09-27T11:45:07Z. License MIT. Size 17.
- Frontend: yes. `public/app.js` function `addQuestion`. `scripts/dev-server.mjs` serves `http://localhost`.
- Door: not in `app.js`. The dev server does not name `api.typesafe.ai`.
- Keyless: no.
- Tests: none.

### davila7/jev-explained — study

Explainer workbench. Community.

- URL: https://github.com/davila7/jev-explained
- Commit: `5cbe35e04609112be77b1bd447bd79b3bde7980b`. Branch `main`. Pushed 2026-09-20T16:53:26Z. License MIT. Size 1180.
- Frontend: yes. `src/components/Workbench.tsx` exports `Workbench`. `src/components/TracePanel.tsx` is in the tree and was not opened.
- Door: not in `Workbench.tsx`.
- Keyless: unknown.
- Tests: none in the tree.

### STiFLeR7/Jev-LLM-Playground — study

The HTML calls itself a decision workbench. Community.

- URL: https://github.com/STiFLeR7/Jev-LLM-Playground
- Commit: `23c78486ab38db6caed07efa45788a2f46107c1d`. Branch `main`. Pushed 2026-09-25T10:34:07Z. License MIT. Size 841.
- Frontend: yes. `web/index.html`. Comment: "A decision workbench, not a chat dashboard."
- Door: `server.mjs` only allows same-origin local requests. The upstream host was not in the lines opened.
- Keyless: saved benchmark JSON exists under `doc/results/`. Whether the page runs on those files was not proved.
- Tests: `test/benchmark.test.mjs`.

### MoonStruckHorrors/jev-playground — study

Visual question builder for choice, score, and noul. Community.

- URL: https://github.com/MoonStruckHorrors/jev-playground
- Commit: `c140a7def67e39f3ce38b4d2ad190b3ec1c45971`. Branch `main`. Pushed 2026-09-28T20:15:34Z. License none. Size 193.
- Frontend: yes. `src/App.tsx` function `App`, type `QuestionType = 'choice' | 'score' | 'noul'`.
- Door: not in `App.tsx`. The README names TypeSafe, OpenRouter, Cloudflare, and Vercel AI Gateway.
- Keyless: unknown.
- Tests: none noted.

### nwadmark/jev-decision-lab — study

Designs typed questions for the hosted TypeSafe playground. It does not call the model. Community.

- URL: https://github.com/nwadmark/jev-decision-lab
- Commit: `7a9b59742c08bb059704fdc6eb1632f545841973`. Branch `main`. Pushed 2026-09-30T05:10:20Z. License MIT. Size 96.
- Frontend: yes. `index.html` and `app.js` function `selectScenario`. The page copies text. It does not render a model answer.
- Door: none in the page.
- Keyless: yes. It never calls.
- Tests: none.

### Codercise/jev-in-practice — study

Preset playground for fraud, sales, and patent examples. Community.

- URL: https://github.com/Codercise/jev-in-practice
- Commit: `02be666a30ad39d4e9000199f7e8e2c612abfb4f`. Branch `main`. Pushed 2026-09-21T17:48:48Z. License MIT. Size 307.
- Frontend: yes. `src/App.tsx` default export `App`, function `runEvaluation`.
- Door: not in `App.tsx`. The README quotes `https://api.typesafe.ai/v1/systemone`.
- Keyless: no evidence.
- Tests: none noted.

### little-planet-labs/jev-playground — study

Same tree the parent already cloned. Not cloned again.

- URL: https://github.com/Little-Planet-Labs/jev-playground
- Parent path: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/little-planet-labs--jev-playground`
- Commit: `418b723779569b1cb1f21a4f7f34c546d44c7e34`. Branch `main`. Pushed 2026-09-17T13:56:22Z. License none. Size 447.
- Frontend: yes. `src/app/page.tsx` exports `PlaygroundPage` and keeps a `draft`.
- Door: not in `page.tsx`. A guessed `src/lib/typesafe.ts` 404'd.
- Keyless: unknown.
- Tests: none in the tree.

### minkhant1996/system-one-playground — study

Chat-shaped page that can also edit JSON. OpenRouter is the path in the opened backend. Community.

- URL: https://github.com/minkhant1996/system-one-playground
- Commit: `a8c4c3202287993f5202ff90e79356520dce3acb`. Branch `main`. Pushed 2026-09-29T07:59:46Z. License MIT. Size 478.
- Frontend: yes. `frontend/src/components/Playground.tsx` default export `Playground`. It mentions an OpenRouter key and a Manual JSON tab.
- Door: `backend/app/main.py` imports `openrouter` and allows `http://localhost:5173`. Official host not in that file.
- Keyless: the Manual JSON tab is claimed to work without a key. Not proved by a fixture run.
- Tests: none named.

### Ahmar004/jev-playground — study

Large app. The sandbox page is a short skeleton. Community.

- URL: https://github.com/Ahmar004/jev-playground
- Commit: `961141bfdbfa05932678406f03189daecb1ccd07`. Branch `main`. Pushed 2026-10-02T17:53:16Z. License none. Size 1661.
- Frontend: `src/app/(app)/sandbox/page.tsx` exports `SandboxPage`. The visible line says to build a state and ask Noul, Choice, and Score. The file is 1160 bytes.
- Door: not in that file.
- Keyless: unknown.
- Tests: none opened.

### kavehmz/typesafe-playground — study

Several demo pages, including a driving scene, not one request editor. Community.

- URL: https://github.com/kavehmz/typesafe-playground
- Commit: `3e1bd368e81750415199d3ee44f2a8dc4ffee072`. Branch `main`. Pushed 2026-09-29T07:11:22Z. License none. Size 28156.
- Frontend: yes, per demo. Opened `demo01/public/index.html` and `demo02/public/index.html` (the driver scene).
- Door: not in those HTML files.
- Keyless: unknown.
- Tests: none opened.

### tedliou/decision-model-playground — study

Local Laya-versus-Jev article picker. The opened HTML is a shell. Community.

- URL: https://github.com/tedliou/decision-model-playground
- Commit: `195fdb98d517b146fa890c459836ceea94566a72`. Branch `main`. Pushed 2026-09-19T13:31:18Z. License none. Size 117.
- Frontend: `apps/web/index.html` is 527 bytes.
- Door: not in that file. README says the page shows option probabilities.
- Keyless: unknown.
- Tests: none opened.

### jleifeld/maclaya — study

Local Laya behind a Jev-shaped API, with a playground and a dashboard. Not Jev. Community.

- URL: https://github.com/jleifeld/maclaya
- Commit: `351e045a1967007920a4590f258fff3664223205`. Branch `main`. Pushed 2026-09-29T08:15:24Z. License Apache-2.0. Size 633.
- Frontend: yes. `web/src/pages/Playground.tsx` function `QuestionEditor`. `web/src/pages/Dashboard.tsx` exports `Dashboard`.
- Door: `Playground.tsx` calls `runSystemOne`. The host string was not in that file. This is a local model, not `api.typesafe.ai`.
- Keyless: the local model can run without a TypeSafe key. Not proved here.
- Tests: `tests/dashboard-api.test.ts`.

### getainode/jebadiah — study

Open weight models that serve the Jev wire. The opened file is the server, not the playground page. Community.

- URL: https://github.com/getainode/jebadiah
- Commit: `cc904344061e4ee71d2cb8297eafd2ce1c798f99`. Branch `main`. Pushed 2026-09-29T19:10:27Z. License Apache-2.0. Size 1317.
- Frontend: a playground is claimed in the README. Not the file opened.
- Door: `server/src/jebadiah_server/app.py` documents `POST /v1/systemone` on this server. Unofficial model.
- Keyless: local server, no TypeSafe key required for its own weights. Not run.
- Tests: none opened.

### Heman10x-NGU/Verdict-open-jev — study

In-browser WebGPU decision demo for a ModernBERT model, plus a Jev benchmark audit claim. Community. Not Jev.

- URL: https://github.com/Heman10x-NGU/Verdict-open-jev
- Commit: `30f15564821626ca5c1ad5b2638c4eb7078787dd`. Branch `main`. Pushed 2026-09-28T00:30:31Z. License SPDX `NOASSERTION`. Size 8031.
- Frontend: yes. `webgpu-demo/index.html` functions `renderCandidates` and `loadPreset`.
- Door: the demo is in-browser. It does not post to `api.typesafe.ai` in the lines opened.
- Keyless: the WebGPU page is the point. Not run.
- Tests: none opened.

### ali-master/usejev — study

Laya playground shell, not a Jev page. Community.

- URL: https://github.com/ali-master/usejev
- Commit: `89e6b80fcc5e18bbf690c0af38b9e0c054d4ec3d`. Branch `master`. Pushed 2026-09-30T12:40:23Z. License none. Size 589.
- Frontend: `playground/index.html` is an 865-byte shell. The meta text says sixteen Laya demos.
- Door: not Jev.
- Tests: none opened.

### mohitmail85/jev-playground — study

Side-by-side support-ticket page against an unofficial host. Community.

- URL: https://github.com/mohitmail85/jev-playground
- Commit: `263a20be0113f9f03180929551df5fbff2693dc5`. Branch `main`. Pushed 2026-09-27T15:01:49Z. License MIT. Size 14.
- Frontend: `jev_app.py` function `evaluate_with_jev`. The docstring says BeatAPI's free model.
- Door: `localhost:5002` in that file. Not official.
- Keyless: unknown.
- Tests: none.

### wustep/jev-playground — skip

Music and inbox product. The opened component draws confidence for inbox rows, not a reusable request editor.

- URL: https://github.com/wustep/jev-playground
- Commit: `4f38b140e91f68da1288fbc91f867bf4a29f478f`. Branch `main`. Pushed 2026-09-26T06:44:56Z. License none. Size 1051.
- Opened: `src/inbox/InboxApp.tsx` exports `InboxApp` and function `ConfidenceTriad`. README quotes `https://api.typesafe.ai/v1/systemone`. That URL was not in the component.

### hegargarcia/jev-playground — skip

Game pages. `src/app/connect-four/page.tsx` is a Connect Four route. `src/app/page.tsx` is a 108-byte home. Not a debug tool.

- URL: https://github.com/hegargarcia/jev-playground
- Commit: `c144bb6d99600eb506dc29133fe780cc88eb5645`. Branch `main`. Pushed 2026-09-17T15:27:20Z. License none. Size 97.

### Bald0Wang/jev-playground — skip

The opened page is a 3D smart-home room, not a request inspector.

- URL: https://github.com/Bald0Wang/jev-playground
- Commit: `7eabcf65afd327dec7526135de335f5c98c15bd3`. Branch `main`. Pushed 2026-09-23T09:22:58Z. License none. Size 1533.
- Opened: `smart-home/smart_home_playground.html` (room, audio). A Cloudflare host appears. `127.0.0.1:8810` appears. No decision render was in the symbols.

### kobashi/jev-playground — skip

Melody toy plus an eval script. Not a general debugger.

- URL: https://github.com/kobashi/jev-playground
- Commit: `ce66832f9098b5f1a5416b7ddb73f8ed151c9ab8`. Branch `main`. Pushed 2026-09-30T00:52:19Z. License MIT. Size 124.
- Opened: `web/index.html` (audio) and `eval/run.ts` (a `goodProbability` field).

## Browser-test

### Nainish-Rai/jev-frontend-qa — study

Browser loop that posts to the official door. The page opened is the synthetic todo demo, not a trace viewer. Community.

- URL: https://github.com/Nainish-Rai/jev-frontend-qa
- Commit: `5ca1988eadc9b66dee0b34d791560e1049ab54cc`. Branch `main`. Pushed 2026-09-28T12:45:09Z. License MIT. Size 811.
- Frontend: `src/jev_frontend_qa/demo_static/index.html` is the todo demo.
- Door: `src/jev_frontend_qa/core/model_client.py` sets `API_URL = "https://api.typesafe.ai/v1/systemone"`.
- Keyless: no for live calls. Demo static files exist.
- Tests: `tests/test_demo.py`, `tests/test_contracts.py`, `evals/jevqa/evals.json`.

### chy4pro/jev-for-chrome — study

Chrome port of the ultrafast browser loop, with a recorded-trace claim. The trace viewer was not the file opened. Community.

- URL: https://github.com/chy4pro/jev-for-chrome
- Commit: `d5c24de556ade0f0a9c7a4c6ebb9dab305e4209e`. Branch `main`. Pushed 2026-10-01T07:58:21Z. License MIT. Size 8968.
- Frontend: extension UI not opened. Provider opened.
- Door: `src/shared/providers/typesafe.ts` sets `config.endpoint || 'https://api.typesafe.ai/v1/systemone'`.
- Keyless: fixtures exist under `scripts/e2e-fixtures/`. Not opened.
- Tests: `tests/agent.test.ts`.

### ado11231/jevqa — study

QA harness with a report UI. The report file does not name a host. Community.

- URL: https://github.com/ado11231/jevqa
- Commit: `1490a1f3ba89eae3cef7fbe59cadda2470a0d37a`. Branch `main`. Pushed 2026-10-01T03:22:01Z. License none. Size 458.
- Frontend: yes. `packages/ui/src/App.tsx`. `packages/server/src/report.ts` builds the report.
- Door: not in `report.ts`. A guessed `packages/core/src/jev.ts` 404'd.
- Keyless: unknown.
- Tests: `packages/server/src/report.test.ts`, `packages/ui/src/report-text.test.ts`.

### droidrun/mobile-jev — study

Android agent with a local studio. Likely already on the browser survey's list. Included because the studio file was opened. Community, high stars.

- URL: https://github.com/droidrun/mobile-jev
- Commit: `395fc222beac4f059f9a0beb337d114a2b066e99`. Branch `main`. Pushed 2026-09-17T12:55:20Z. License MIT. Size 28148.
- Frontend: yes. `apps/jev-studio/app/page.tsx` exports `Studio`.
- Door: not in that page.
- Keyless: unknown.
- Tests: `apps/jev-studio/server/store.test.mjs`.

### mohsen1/llm-debugger-vscode-extension — study

VS Code debugger. Jev is one strategy in the README. The opened view is the webview shell. Community.

- URL: https://github.com/mohsen1/llm-debugger-vscode-extension
- Commit: `17522a386e16bbe21952345c9fc1bc1ba84ad418`. Branch `main`. Pushed 2026-09-21T19:50:11Z. License MIT. Size 3917.
- Frontend: `src/webview/App.tsx` exports `App`. It toggles `debugEnabled`. It does not draw a Jev probability in the lines opened.
- Door: not in `App.tsx`.
- Tests: `benchmark/host/suite/benchmark.test.js`.

### legostin/jev-mcp — skip

The UI file is a stub. The docs page is marketing.

- URL: https://github.com/legostin/jev-mcp
- Commit: `606e948996f808d806e547fab902ed996339baa6`. Branch `main`. Pushed 2026-09-24T11:16:17Z. License MIT. Size 2402.
- Opened: `ui/index.html` is 333 bytes. `docs/index.html` describes an MCP browser driver and names OpenRouter docs. No decision render.

### mizchi/jev-playground — skip

The opened file is a chaos page for a browser experiment (`experiments/browser-chaos/app/index.html`), not a Jev inspector. The repo is large and may hide a real playground elsewhere. That other page was not opened.

- URL: https://github.com/mizchi/jev-playground
- Commit: `79fc189ee6edd8caf96a170227676d7c5c143848`. Branch `main`. Pushed 2026-09-26T16:19:10Z. License none. Size 13499.

## Harness

### openlayer-ai/jevals — use

Library a builder can rerun: state, questions, reduce. No UI. Community.

- URL: https://github.com/openlayer-ai/jevals
- Commit: `0a8f895a0428b89c865f953d5295b6b516e4018c`. Branch `main`. Pushed 2026-10-01T16:48:21Z. License MIT. Size 422.
- Frontend: no.
- Job file: `src/jevals/_eval.py` class `Eval`. Comment: an eval is `state()`, `questions()`, `reduce()`.
- Door: `src/jevals/backends/typesafe.py` posts `{base_url}/v1/systemone`. Default base is `https://api.typesafe.ai` unless `TYPESAFE_BASE_URL` is set. Key: `TYPESAFE_API_KEY`.
- Keyless: examples exist (`examples/evals/refund_policy.yaml`). Live runs need a key. A local Kev or Laya path is claimed in catalogs and was not the file opened.
- Tests: `tests/test_evals.py`, `tests/test_backends.py`.

### 4esv/jev-eval — use

Benchmark runner, plots, and a local System One stand-in. Community.

- URL: https://github.com/4esv/jev-eval
- Commit: `4050562fe17f783479c2f58ee8cbc345fab6fada`. Branch `main`. Pushed 2026-09-23T18:03:53Z. License none. Size 4227.
- Frontend: plots from `evaljev/report.py` function `plots`, not a request editor. `evaljev/serve.py` function `systemone` implements `POST /v1/systemone`.
- Door: `evaljev/runners.py` sets `JEV_URL = "https://api.typesafe.ai/v1/systemone"` and `OR_URL = "https://openrouter.ai/api/v1/chat/completions"`.
- Keyless: local `serve.py` can answer without the hosted model. Hosted runs need `TYPESAFE_API_KEY`.
- Tests: `tests/test_metrics.py`.

### fstandhartinger/jevbench — use

534-decision harness. Size 48804 is under the 50000 clone cap, but it was not cloned. The adapter was read through the API. Community. The live board is a third-party site.

- URL: https://github.com/fstandhartinger/jevbench
- Commit: `bb05a335bc809e61b20c0f745d25499a82b326fc`. Branch `main`. Pushed 2026-09-29T11:25:01Z. License MIT. Size 48804.
- Frontend: not in the opened file. README points at https://benchmarkheaven.com/jev-models. That site was not opened.
- Door: `jevbench/adapters/typesafe.py` posts `{endpoint}/v1/systemone`. The default endpoint expression falls back to `https://api.typesafe.ai`.
- Keyless: no for the hosted adapter.
- Tests: `tests/test_composite.py` and siblings.

### thijmenkam/jev-benchmarks — study

Small harness with a markdown report and a mock client. Community.

- URL: https://github.com/thijmenkam/jev-benchmarks
- Commit: `980be52a890b14867699f83342347dd574af6ab0`. Branch `main`. Pushed 2026-09-18T07:27:28Z. License none. Size 83.
- Frontend: no. `jev_bench/report.py` function `build_report`. `results/latest/report.md` is in the tree.
- Door: `jev_bench/clients/typesafe.py` class `TypeSafeClient` reads `config.TYPESAFE_BASE_URL` and `config.TYPESAFE_API_KEY`. The official host literal was not in that file. `jev_bench/clients/mock.py` exists.
- Keyless: mock client, yes. Live client, no.
- Tests: no test file. Saved `results/latest/` is present.

### AbdelStark/jev-benchmarks — study

Probability-aware report builder. Community.

- URL: https://github.com/AbdelStark/jev-benchmarks
- Commit: `0d610cc53e79bcbec691312b0c4adb4a0e371642`. Branch `main`. Pushed 2026-09-17T07:55:14Z. License Apache-2.0. Size 489.
- Frontend: no. `src/jev_benchmarks/report.py` function `build_report`.
- Door: not in `report.py`.
- Keyless: unknown.
- Tests: `tests/test_cli.py`.

### Tomdachs/jev-replay-lab — use

Local eval workbench: datasets, questions, thresholds, run compare. Placed here because the job is rerunning cases, even though the page also edits questions. Community.

- URL: https://github.com/Tomdachs/jev-replay-lab
- Commit: `d59cd353b6e19422c5d16f6be1dc6f74dc224754`. Branch `main`. Pushed 2026-09-21T00:07:20Z. License MIT. Size 263.
- Frontend: yes. `src/web/main.tsx` builds question drafts and says one request per case goes to `api.typesafe.ai`, with expected labels excluded.
- Door: `api.typesafe.ai` is named in that file. The full path string `https://api.typesafe.ai/v1/systemone` was not the line opened.
- Keyless: no. `TYPESAFE_API_KEY` stays on the server. The UI says up to 200 requests.
- Tests: `tests/core.test.ts`, `tests/browser/workflow.spec.ts`.

### jgridifier/jev-research-eval — study

HTML report generator for saved browser-research cases. Community.

- URL: https://github.com/jgridifier/jev-research-eval
- Commit: `6a4e9bbd9454cc96300ee3724ac613bc52d21351`. Branch `main`. Pushed 2026-09-17T14:43:56Z. License SPDX `NOASSERTION`. Size 133.
- Frontend: the script writes HTML. `scripts/generate_report_v4.py` function `render`.
- Door: not an official URL in that function. A Cloudflare string appears.
- Keyless: yes for the report. Inputs are `fixtures/cases_with_traces.json` and `fixtures/stress_cases_with_traces.json`.
- Tests: none opened.

### sohithk10/jev-trace-evaluator — use

CLI and small web view over recorded agent traces. Community.

- URL: https://github.com/sohithk10/jev-trace-evaluator
- Commit: `3b06ba5edd103d86f560d4afd092b50e56575026`. Branch `main`. Pushed 2026-10-01T00:09:58Z. License none. Size 161.
- Frontend: yes. `src/jev_eval/web.py` class `Handler`, function `audit`. Static files: `src/jev_eval/static/index.html`.
- Door: `src/jev_eval/judge.py` sets `base_url="https://api.typesafe.ai"`.
- Keyless: `examples/traces.jsonl` and `docs/demo-report.json` exist. Live judge needs a key.
- Tests: `tests/test_judge.py`, `tests/test_web.py`.

### dayhaysoos/jevals — study

Claimed local eval workbench. The opened client file does not show a decision. Community.

- URL: https://github.com/dayhaysoos/jevals
- Commit: `af6fecc0776dd5d97d5dc89fc0a72cae5e3e2580`. Branch `main`. Pushed 2026-09-18T14:51:10Z. License MIT. Size 362.
- Frontend: `index.html` is 308 bytes. `bin/jevals.js` exports `main`. `src/client.ts` is 61574 bytes and did not contain `systemone` or an `http` URL in a line scan.
- Door: not found in the opened client.
- Keyless: unknown. `test/workbench.browser.mjs` exists and was not opened.
- Tests: `test/choice.test.ts`, `test/history.test.ts`.

### PromtEngineer/jev-harness — study

Local gate-lab page over saved runs. Community.

- URL: https://github.com/PromtEngineer/jev-harness
- Commit: `9bd4f670a2866498aa570e4ce4654997b3dce190`. Branch `main`. Pushed 2026-09-24T22:00:50Z. License MIT. Size 1498.
- Frontend: yes. `app/index.html` functions `loadGateLab` and `loadRuns`.
- Door: not in that HTML.
- Keyless: the page loads saved runs. Not proved.
- Tests: `tests/policy.test.ts`. `tools/report.py` function `main`.

### AntonioCoppe/jev-harness — study

The file opened was a marketing demo, not the eval CLI. Fixtures exist. Community.

- URL: https://github.com/AntonioCoppe/jev-harness
- Commit: `1a3dd4ae86de72f0df7d6e70b25feffc41ca3255`. Branch `main`. Pushed 2026-09-25T16:31:24Z. License MIT. Size 8050.
- Frontend: `demos/marketing/index.html` only.
- Door: not in that HTML. README discusses `https://docs.typesafe.ai` and `/v1/systemone`.
- Keyless: fixtures under `demos/proof/multi/fixtures/`.
- Tests: no unit test file opened. `src/index.ts` was opened later and is a short export, not the eval runner.

### bitnovus/jev-spam-eval — study

Spam-context experiment report. Community.

- URL: https://github.com/bitnovus/jev-spam-eval
- Commit: `a3757a1b3412177a686c1b4d95227b50a8f73537`. Branch `main`. Pushed 2026-09-18T15:21:10Z. License MIT. Size 6416.
- Frontend: no. `experiments/jev-context/report.py`.
- Door: not in the opened lines.
- Tests: none opened.

### chepyle/jev-test — study

LexGLUE report builder. Also trains an encoder. Community.

- URL: https://github.com/chepyle/jev-test
- Commit: `231645b206242fbbdc80f8a3b45c1a7509e8db54`. Branch `main`. Pushed 2026-10-02T12:34:19Z. License Apache-2.0. Size 464.
- Frontend: no. `report/build_report.py` function `build`.
- Door: not in `build_report.py`.
- Tests: none opened.

### sa-ha/jev-playground — study

Scenario runner that writes a threshold report. Community.

- URL: https://github.com/sa-ha/jev-playground
- Commit: `562fb8eb39dc2669f647d916d32cce8ad9aefe7b`. Branch `main`. Pushed 2026-09-28T15:40:45Z. License MIT. Size 61.
- Frontend: no. `src/jev_playground/report.py` function `buildReport`.
- Door: not in `report.py`.
- Tests: `tests/test_runner_report.py`.

### deepdave98/jev-playground — study

Weekly bench helper, not a page. Community.

- URL: https://github.com/deepdave98/jev-playground
- Commit: `29f0fb44eff41237bc6aeb90d5ed7e5e08da82b5`. Branch `main`. Pushed 2026-09-29T17:16:52Z. License none. Size 528.
- Opened: `common/bench.py` functions `run` and `load`. No host in the extract.
- Tests: none opened.

### butada/draft-jev-evaluator — study

Local draft scorer. Unofficial door. Community.

- URL: https://github.com/butada/draft-jev-evaluator
- Commit: `1c6433d6bc35f2fa68e8af0d80802f4f3422bfef`. Branch `main`. Pushed 2026-09-27T00:46:33Z. License MIT. Size 1714.
- Frontend: yes. `frontend/index.html` is 3988 bytes.
- Door: `backend/app.py` class `EvaluateInput` loads `questions.json` and calls `https://openrouter.ai/api/v1/models` and `https://openrouter.ai/api/{path}`.
- Keyless: questions file is local. Live scores need OpenRouter.
- Tests: none opened.

### ndolinschi/harnessjudge — study

Tiny page. The trace state is initialized to a canned sentence about npm tests. Community.

- URL: https://github.com/ndolinschi/harnessjudge
- Commit: `bdd635beee798b0cb19b3319422d18faf30bfff8`. Branch `main`. Pushed 2026-09-17T09:22:10Z. License none. Size 19.
- Frontend: `src/app/page.tsx` function `decide`. The initial trace string is mock text.
- Door: not in the file.
- Tests: none.

### Hangzhi/diffusion-jev-sglang — study

Unofficial diffusion decision server. The opened files render benchmark charts, not the doodle page. Community.

- URL: https://github.com/Hangzhi/diffusion-jev-sglang
- Commit: `a6dce88a2fc9c11b1df44d03033f1ebafd75c504`. Branch `main`. Pushed 2026-09-23T17:15:58Z. License MIT. Size 15858.
- Opened: `scripts/render_emoji_report.py` function `main`, `scripts/render_gemma_report.py`.
- Door: not the official API. The server claims a `/v1/systemone` shape in the README.
- Tests: none opened.

## Other

Inspectors, dashboards, and trace views that are not a blank playground and not a case harness.

### a742987/JevLens — use

Local timeline of Jev calls: state, questions, answers, probabilities, latency. Community.

- URL: https://github.com/a742987/JevLens
- Commit: `ae1ff103d185197bc5a753c8aa21f6420cf1e0eb`. Branch `main`. Pushed 2026-09-26T13:58:23Z. License MIT. Size 125.
- Frontend: yes. `ui/index.html` function `confidenceOf`. Title: "JevLens — Jev decision timeline".
- Door: `src/jev.ts` builds a `SystemOneRequest` and calls `this.client.systemOne`. `baseURL` comes from the option or `TYPESAFE_BASE_URL`. `apiKey` comes from the option or `TYPESAFE_API_KEY`. The official host literal was not in that file. It scrubs the key before writing the log.
- Keyless: the timeline can show a seeded log. `examples/seed-trace.ts` exists. Live capture needs a key.
- Tests: `test/decision.test.ts`, `test/export.test.ts`.

### andududu/jeview — use

Local proxy and visualizer for traffic that already uses the System One path. Community.

- URL: https://github.com/andududu/jeview
- Commit: `495a4e43e9d67e495a66ab0d9e55ac1c5c4040d6`. Branch `main`. Pushed 2026-09-21T21:52:51Z. License MIT. Size 873.
- Frontend: yes. `ui/app.js` function `questionOf`. It sets the run line to `` `${location.origin}/v1/systemone` ``.
- Door: the page shows the local origin. The upstream host was not in `ui/app.js`.
- Keyless: a `demo/index.html` exists. Not opened.
- Tests: `test/jeview.test.ts`.

### Shoaib-Asghar/jev-probe — study

Perturbation lab with a dashboard. The web file does not name the host. Community.

- URL: https://github.com/Shoaib-Asghar/jev-probe
- Commit: `b14d935b487ecde6959f1d71170548f0d30688ba`. Branch `main`. Pushed 2026-09-28T18:11:59Z. License none. Size 617.
- Frontend: yes. `src/web/app.py` functions `home`, `run_exploration`, `export_run`. Templates: `src/web/templates/index.html`.
- Door: not in `app.py`. A guessed `src/models/typesafe.py` 404'd.
- Keyless: unknown. It logs raw JSON per the README.
- Tests: `tests/unit/test_perturbations.py`.

### Chandler-Sun/chat2jev — study

Turns a chat-completion body into an editable System One request and shows the response. Community.

- URL: https://github.com/Chandler-Sun/chat2jev
- Commit: `fef7b1f734ad272477d0f71894c74c0d03cb306d`. Branch `main`. Pushed 2026-09-23T02:45:29Z. License MIT. Size 2145.
- Frontend: yes. `src/components/playground.tsx` posts to `/api/evaluate` and stores `SystemOneResponse`.
- Door: the browser calls the app. The upstream host was not in the component. README mentions Cloudflare and localhost.
- Keyless: unknown.
- Tests: none opened.

### DonaldMurillo/system-one-playground — study

Studio shell with a Trace tab. The script that fills the tab was not opened. Community.

- URL: https://github.com/DonaldMurillo/system-one-playground
- Commit: `888a033725e67e76fca7f4440ffd9b239a19db1c`. Branch `main`. Pushed 2026-09-23T01:51:19Z. License MIT. Size 7046.
- Frontend: `studio/index.html` has a button `data-tab="trace"`.
- Door: not in that HTML.
- Keyless: README says it can start offline. Not proved from the HTML.
- Tests: none opened.

### molis-ai/jev-workbench — study

UI for versioned judgment functions, not a raw request log. Community.

- URL: https://github.com/molis-ai/jev-workbench
- Commit: `75aeda4d92588b80ddfdcac527011ec14f197c3e`. Branch `main`. Pushed 2026-09-22T14:42:37Z. License MIT. Size 2428.
- Frontend: yes. `apps/web/src/main.tsx` function `Workspace`.
- Door: not in `main.tsx`.
- Tests: `tests/e2e/workbench.spec.ts` is in the tree. Not opened.

### DevMortimer/pi-typesafe — study

Terminal playground for Pi. The client file was opened. The playground command file was not found at the guessed path. Community.

- URL: https://github.com/DevMortimer/pi-typesafe
- Commit: `3a498ea1ba90c041c52e7632e8f292c1d706ac52`. Branch `main`. Pushed 2026-09-30T23:24:22Z. License MIT. Size 494.
- Frontend: terminal, per the README. Not the file opened.
- Door: `src/client.ts` sets `SDK_PATH = "/v1/systemone"` and maps a bare Jev id onto the backend's id, including an OpenRouter form in the comment. The host is the backend config, not a literal in the opened lines.
- Keyless: no.
- Tests: `tests/client.test.ts`, `tests/backends.test.ts`.

### sunil-sadasivan/jevernetes — study

Kubernetes log dashboard that can spend a Jev batch budget. Product, with a report. Community.

- URL: https://github.com/sunil-sadasivan/jevernetes
- Commit: `3a08dcb1c3611c0014b000074006701ad767bfa2`. Branch `main`. Pushed 2026-09-28T04:47:59Z. License MIT. Size 6916.
- Frontend: yes. `jevernetes/web/index.html` has an "ask budget" control. `jevernetes/report.py` function `build_report`.
- Door: not in the HTML.
- Tests: none opened.

### cephalization/jev-triage — study

Issue-triage dashboard. The opened file is a short router with an example state string. Community.

- URL: https://github.com/cephalization/jev-triage
- Commit: `b11928eb5856a16fef722d51caff43990c123b78`. Branch `main`. Pushed 2026-09-29T16:30:04Z. License MIT. Size 1503.
- Frontend: `apps/web/src/main.tsx` function `Root`. `apps/web/index.html` is 768 bytes.
- Door: not in `main.tsx`.
- Tests: `apps/reviewer/tests/agent.test.ts` is a different app in the repo.

### kierandotai/jev-scout — study

Search-agent dashboard on localhost. Product UI. Community.

- URL: https://github.com/kierandotai/jev-scout
- Commit: `81b1b9d9ebe84c01b8786fb4c391bbab401017ac`. Branch `main`. Pushed 2026-09-21T14:28:23Z. License none. Size 240.
- Frontend: `src/dashboard.ts` binds `http://127.0.0.1`.
- Door: the dashboard origin only.
- Tests: `test/dashboard.test.ts` is in the tree. Not opened.

### BrendanH18/jev_fsd — study

Driving game with a report panel. Not a reusable inspector. Community.

- URL: https://github.com/BrendanH18/jev_fsd
- Commit: `bbc9012331dfb175a555c76c50487467ce93fb40`. Branch `main`. Pushed 2026-10-01T03:09:47Z. License MIT. Size 6838.
- Frontend: `static/js/ui/drive-report.js` class `DriveReport`. `static/index.html` is the car picker.
- Door: README names `https://api.typesafe.ai`. Not in the report class lines opened.
- Tests: none opened.

### YUUM321/jev-klondike-benchmark — study

Klondike replay viewer over `decisions.jsonl`. Community.

- URL: https://github.com/YUUM321/jev-klondike-benchmark
- Commit: `7b3eb45519f45258dacec94d57a2e76e9b23aae2`. Branch `main`. Pushed 2026-09-25T10:07:42Z. License MIT. Size 134.
- Frontend: `web/app.js` renders the board. `benchmark/replay.py` function `load_records`.
- Door: not in `web/app.js`. The viewer reads a log.
- Keyless: yes for the viewer, if a log is present. `web/replay.example.json` exists.
- Tests: `tests/test_replay.py`.

### reachjalil/jevlogs — study

OpenTelemetry triage library. The opened app replays a saved dataset and makes no live call. Community.

- URL: https://github.com/reachjalil/jevlogs
- Commit: `217d2b70bfb327a0038b21851c1c9c143eb80469`. Branch `main`. Pushed 2026-09-22T03:35:36Z. License MIT. Size 3387.
- Frontend: `benchmarks/space/app.py` function `load_metrics`. The line says it loads saved decisions and makes no live model calls.
- Door: README names the Vercel AI Gateway model page for Jev. Not in `app.py`.
- Keyless: the opened benchmark is keyless.
- Tests: none opened.

### olivier-motium/jev-doom — study

Local Doom dashboard with an inspect function. Game, not a general tool. Community.

- URL: https://github.com/olivier-motium/jev-doom
- Commit: `13589d2b97d18940423933262834aa3e376ffcdc`. Branch `main`. Pushed 2026-09-21T12:33:03Z. License MIT. Size 70.
- Frontend: `index.html` functions `inspect` and `render`.
- Door: not in the extract.
- Tests: none.

### Resadan-dev/jev-zork — study

Zork replay page. Game. Community.

- URL: https://github.com/Resadan-dev/jev-zork
- Commit: `981451ba8adc076fd4058d20a37c8bef2739c0ae`. Branch `main`. Pushed 2026-09-21T12:18:31Z. License MIT. Size 195.
- Frontend: `replay/index.html`.
- Door: not opened inside the file.
- Tests: none opened.

### patryckalves/jev-no-enem — study

Static exam dashboard. Community.

- URL: https://github.com/patryckalves/jev-no-enem
- Commit: `7f85f787e3d13ce75da5bbc8d578038af73cc077`. Branch `main`. Pushed 2026-09-21T11:59:18Z. License none. Size 116.
- Frontend: `docs/index.html`.
- Door: not in the extract.
- Tests: none opened.

### NorbertBodziony/guard-jev — skip

Comment-moderation product page. Not a debug tool.

- URL: https://github.com/NorbertBodziony/guard-jev
- Commit: `86e7dba193fc94d458f36e225379c12596ddef0c`. Branch `main`. Pushed 2026-09-17T09:07:15Z. License none. Size 65.
- Opened: `app/page.tsx` default export `Home`, function `check`.

### nssmd/jev-bot — skip

Feishu bot setup page branded "decision studio." Product onboarding, not an inspector.

- URL: https://github.com/nssmd/jev-bot
- Commit: `4695a4e92fca03751dd86619612379576228bfda`. Branch `main`. Pushed 2026-09-22T08:20:28Z. License MIT. Size 64.
- Opened: `public/index.html`. It links `https://console.typesafe.ai/keys`.

### TYC-000/jev-dashboard — skip

Streamlit usage dashboard, not a decision view.

- URL: https://github.com/TYC-000/jev-dashboard
- Commit: `65014cc8a665698d10ccf7ba1941ee1b0d596b96`. Branch `main`. Pushed 2026-09-25T07:42:32Z. License none. Size 7.
- Opened: `jev_dashboard.py` functions `load_entries`. Docstring: "Jev API Usage Dashboard".

`rockomatthews/jev-dashboard` is a trading P&L page. Only the README was opened, so it is not graded. It is in the README-only list so it is not mistaken for a decision dashboard.

## Official surfaces

These are TypeSafe's own doors or pages. They are not community repos.

### https://evals.typesafe.ai — use

Opened by curl. The HTML is a workflow-evals dashboard: cost, time, and mean accuracy for Jev against named frontier workflows. No GitHub commit. No source file. The page is official. It is not a request editor. Subpages such as agent-trace observability were linked from catalogs and were not opened one by one.

### https://console.typesafe.ai/playground

Could not open. curl got HTTP 403 from Cloudflare. Catalogs describe it as the hosted state-and-question page. Not graded.

### https://api.typesafe.ai/v1/systemone

The official request door. Not a UI. Not called.

### github.com/typesafe-ai

Not opened as a tree. Catalogs point at `typesafe-ai/skills` and the docs. That org is the one to treat as official. The `TypeSafeAI` org below is a different name.

## Unofficial doors seen in opened source

- `https://openrouter.ai/api/alpha/decisions` in `frederico-kluser/jev-playground` `components/RequestInspector.tsx`.
- `https://openrouter.ai/api/v1` in `hugo-alves/jev-router-playground` `app.js`.
- `https://openrouter.ai/api/v1/chat/completions` in `4esv/jev-eval` `evaljev/runners.py`.
- `https://jev-router-proxy.xperiment.workers.dev/jev` as the default Jev endpoint in that same `app.js`.
- `http://localhost:8000/v1/systemone` as the default field in `k3a/jev-playground` `index.html`.
- `http://localhost:4317` as the JevScope studio API.
- `POST /v1/systemone` on `getainode/jebadiah` and on `4esv/jev-eval` `serve.py`. Those servers are not TypeSafe.
- BeatAPI via `localhost:5002` in `mohitmail85/jev-playground` `jev_app.py`.
- Vercel AI Gateway is named in the `reachjalil/jevlogs` README and in parent clone `terryds/jevplayground`. The gateway URL was not quoted from a source file in this pass.
- Cloudflare and Vercel appear as hosts in several READMEs (`MoonStruckHorrors`, `Hangzhi`). They are not the official door.

## Parent clones already on disk

Read at the README first line only, except `little-planet-labs/jev-playground`, which is graded above. Not graded again. Do not clone them again.

| Path | HEAD | README job, first prose line |
| --- | --- | --- |
| `originals/github/adyoi--jev-system-one-playground` | `b133e6b` | WinForms playground for Choice, Score, and Noul |
| `originals/github/browser-use--jev-ultrafast` | `1231850` | Browser agent. README opens with an alert, not a one-line job |
| `originals/github/comoc--jev-minesweeper` | `5cbc361` | Browser minesweeper demo |
| `originals/github/DeepBlueDynamics--typesafe-arena` | `c057cfb` | Local markdown mirror of docs.typesafe.ai. Not an arena UI |
| `originals/github/devagrawal09--jev-review` | `31f8960` | Code-review workflow |
| `originals/github/ElshinQ--jevaluate` | `9f1b927` | Cheap model tests a web app and asks a human when unsure |
| `originals/github/jonymusky--jev-browser-qa` | `ca6d5a2` | Playwright films, Jev judges |
| `originals/github/KiritoKing--midscene-jev-runner` | `f07d22f` | Midscene Jev runner |
| `originals/github/little-planet-labs--jev-playground` | `418b723` | Graded above. Next.js playground |
| `originals/github/nickthompson480--typesafe-ai-playground` | `8ee3d0b` | Community playground of use cases and games |
| `originals/github/PenglongHuang--jev-demo` | `def34f2` | Zero-build local page for state and typed questions |
| `originals/github/sugarforever--tryjev` | `52770fc` | Hosted playground at tryjev.xyz |
| `originals/github/terryds--jevplayground` | `02c20a0` | Browser testbed through the Vercel AI Gateway |
| `originals/github/TypeSafeAI--jev-harness` | `1239b23` | Proposal-review contract. Community org, not `typesafe-ai` |
| `originals/github/TypeSafeAI--typesafe-playground` | `0fbc9ef` | README calls it a community playground |
| `originals/github/TypeSafeAI--typesafe-ui` | `61e5e9e` | React components for TypeSafe-style pages |
| `originals/github/vinilana--jev-browser` | `7d60873` | Browser project. First prose line is a language switch |
| `originals/github/vinilana--jev-eval-agent` | `037de11` | Eval agent. First prose line is a language switch |

The 2026-10-01 library already has `WillKelly-jev-evaluation` and `system-one-adapter-python`. They were not opened again.

## README only

These READMEs were opened. No non-README file was opened, so they are not graded. One line is the GitHub description or the first README claim.

- `markjaquith/typesafe-ai-playground` `cca499aebace85f8745466b0cc255d49cd5f3149` MIT, size 308. Rust experiments. README: if both keys exist, `OPENROUTER_API_KEY` wins over `TYPESAFE_API_KEY`.
- `pst2154/Nemotron_Jev` `1b7ce4641102a1cfd31bad05460b13de60d7c8ca` MIT, branch `perf/nemotron-diffusion-8b`, size 2853. README curl is `http://localhost:8770/v1/systemone`. Local model plus a Decision Lab explorer. Unofficial.
- `Chunky83/jev-workbench` `dc92a689dee36963ede90970837d62c876d1e066` MIT, size 21173. C++ desktop workspace. README says read `TYPESAFE_API_KEY` from the environment. No UI file opened.
- `SuperInstance/jev-harness` `a5f09486b3453dced58ad252ab4e5972affc3b46` MIT, size 14. README quotes `POST https://api.typesafe.ai/v1/systemone` and describes `preflight()` plus a journal. No UI. Source of `preflight` was not opened. Seven files in the tree.
- `jkudish/jev-browser` `1f0726cc8bc4483b96439504b594a01596d8e347` MIT, size 10453, pushed 2026-10-02. README: task returns the final page, a screenshot, and a decision trace. Default key `TYPESAFE_API_KEY`. Fixtures exist (`test/fixtures/login.html`). Transport file guess 404'd.
- `FBddcz/embodied-jev` `f08de2e4e20d6cd69fea9c57ac1062c3ef510f1e` MIT, size 99876. Over the 50000 clone cap. Not cloned. MuJoCo arm workbench. README names `https://api.typesafe.ai/v1/systemone`.
- `JYeswak/jev_playground` `57458dd93e3c35b38fd11778d3e39a040f9cd977` MIT, size 64084. Over the cap. Not cloned. Research notes and probes, not a single page. README describes graded findings.
- `xiezhr/jev-workbench` `e2f80e3600df05a1dcebdf8811fc1969bd82f0ef` no license, size 24, branch `master`. Tree is the README only. Claims a single-file web workbench. The file is not in the repo.
- `lutvek/jev-playground` `14f43edebdb8f201bb72f03aed97881e43be3858` size 0. Empty repository.
- `souvikr/jev-test` `5721c26fee6bc26f9bdf6c0f75616bcde453310f` size 28. README: harness through `POST https://openrouter.ai/api/alpha/decisions`. Unofficial.
- `yfe404/jev-harness` `de4b645e22ab8aff30e161a35fa5485a88ec0c2d` MIT, branch `master`. Auditable gates for Claude Code and Pi. README says offline examples exist.
- `galinauskas/jev-harness` `33a2c7b3017fd7851f00e4d51eff631e0418e9f7` size 3767. Demo harness across OpenRouter, DeepSeek, and OpenCode.
- `ismaelsoilet/jev-harness` `6a7df76de2a36bf21e7a3116e1f10c7a3a7cb71d` MIT. Five semantic gates. `docs/REPLAY_REPORT.md` was not opened.
- `HarnessRouter/SystemOneHarness` `ab8e8f08b4a6268c0633a474423d556599ee06a4` Apache-2.0, size 10393. Agent loop over System One models. `systemone_harness/trace.py` was not opened.
- `poisson-labs/jev-replay` `ecc958fb627250538d7c71e62566feab1cff8166` MIT, size 6884. Replay-flip study. README names `https://openrouter.ai/models/typesafe/jev-latest`.
- `allebee/pytest-jev` `aa163e448706477ec69998c1784fa6ccef157e84` MIT. Pytest plugin. README only.
- `zhuyansen/jev-search-rerank-eval` `c896f14e944182e17a002dd7546f06ba3788d586` MIT. Graded rerank eval. `src/jse/evaluate.py` not opened.
- `ickma2311/jev-baselines-eval` `3b828cb68992c00835b3f126a3d13534da875277` MIT. Pre-registered baseline eval. README only.
- `YidiDev/jev-benchmark` `9bbc7ab560db1a2acc24c7c42e06205032169ff3` MIT. Rubric benchmark versus Claude and an open model.
- `baibizhe/jev-decision-benchmarks` `32705c33920b710c11593c8ef99e557d450f933b` no license. Decision benchmarks. README only.
- `zsavage8/padflow-jev-evals` `0511166626064bca87ff38beae6a4e9ec4d19e2b` MIT, size 16. Labeled rows and a runner. README only.
- `bradAGI/ruling` `0d4750e1796d96415e267c4cee88fd5f8e1c05ad` MIT. Logit replay of the System One wire. README only.
- `24601/Augustus` `4e0440eb6301fb27ed5630ce7f58e632d3a8c2db` MIT, size 20944. Agent skill for building decision systems. Not a debug UI.
- `phyous/tsai-sc` `6046ecc60156c4a3c04d384b41821a4ff08501b7` MIT. StarCraft harness with published videos of probability overlays. `docs/visual-review.json` not opened.
- `adityakk9031/jev-fast-playwright` `169573f737e5025c921ddf6c194c2bf7b5ce8a8c` no license, branch `master`. Playwright plus Jev. README only.
- `arthurfiorette/jev-playwright` `96bdcc6bdf2dd0a9194c302e84eb6c87abb4f398` MIT. Playwright reporter that asks Jev which tests a change can affect. README says OpenRouter is optional. Score text was in the README, not in a source file.
- `nicobailon/surf-cli` `701dd824046310680c36301beb488cbc876ef302` MIT, size 3997. Browser CLI. Jev is an optional semantic command. Not opened past the README.
- `m-g-n/wp-update-vrt` `8315a8dc40208182c2ec683f3db6bd6d4d94c13a` size 243. WordPress visual-regression risk with Jev. README only.
- `jbt95/jev-toolkit` `6ebd9ceb6fa6633b88efe7f8e61db898a57e5362` MIT. MCP server plus a local event log and Prometheus metrics. README only.
- `gbesse/jev-trace` `f04b606b088d4e3f6f2cde49ccc1d699fd1f36ad` MIT, size 11. Requirements-to-tests matrix. `examples/demo-report.mjs` was listed and not usefully read.
- `ZihuaEvan/GUI_JEV` `f27dde3e4d7eeca2fdc3e6e100f9a664abbfb884` MIT, size 299. Screenshot grid choices. README only.
- `wondertwins/jev-benchmark` `1c2509ac7d5508b8a7ce00ae4df6d7652d05de8b` MIT, size 27667. Chess and NPC benches plus a playground claim. `jevchess/report.py` not opened.
- `imom39a/jev-playground` `f6ebdf22ca4875f191096eb54c835de4b2ffdeb6` Apache-2.0, size 13424. Minesweeper, routing, drone lab. `drone-lab/public/index.html` not opened.
- `nikhil1raghav/jev-playground` `67043996a299fbf8ad44ec1cd4929381c752a415` size 206. Snake and HN toys. README only.
- `gaebalai/jev-playground` `201849f836c754d9aff360cc0e9f0ff287a5593f` size 2705. Korean demos. README only.
- `takafumikobayashi/jev-snap-lab` `1dbfdfa03b296dcb7d88a64cf9a2d4525cc81cab` MIT. Svelte lab. `src/routes/+page.svelte` not opened.
- `xhongc/jev-music-tag` `8a031efc6b5069b42404e2942aa4a00426aec200` size 8863. Music-tag product with a React page. README only. Out of scope as a product.
- `rockomatthews/jev-dashboard` `7441d6ffec1064becd66f66160a09b3b1f27977d` size 7721. Trading P&L page. README only. Not graded.

## Catalog only

Named in a list or a search hit. The target README was not opened. Not graded.

Playgrounds and labs: `poojan8788/jev-playground`, `alpesh-jikadra/jev-playground-examples`, `bnemeth/jev-playground`, `marlonthynk/jev-playground`, `ozanedge/jev-playground`, `rjohnt/jev-playground`, `fol2/jev-playground`, `kavish-agarwal-tech/jev-playground`, `chanmin-10xtf/jev-playground`, `KellerWang2003/jev-playground`, `louispaulet/jev-playground`, `exponen-agi/jev-playground`, `avirooppaul/jev-playground`, `AbnormalPilot/jev-playground`, `yagi469/playground-Jev`, `Jorgediamanto/jev-playground`.

Trace and debug names: `angeloseby/jev-trace`, `sypherin/jev-trace-classifier`, `Shailly0502/JevTrace`, `123wwwa/JevTrace`, `bilaluygurai/jev-dashboard-prompt`. `jevecafoscari/jeve-dashboard-flutter` is a name collision, not a Jev tool, from the search snippet.

Browser and QA names already famous in the lists, left for the deep surveys: `wy-coliney/jev-browser-use`, `browser-use/jev-ultrafast` (parent clone exists), `vinilana/jev-browser` (parent clone exists), `jonymusky/jev-browser-qa` (parent clone exists).

Eval names not opened: `Jevals/jevals-data` (Anil-matcha's list says the harness code is not public), `typesafe-ai/overwatch`, empty-description benchmark repos from GitHub search (`designfordrink/jev-benchmark`, `NikHeck/jev-benchmark`, `dai-forge/jev-benchmark`).

Hosted doors that only resell a playground, from catalogs, not opened: `tryjevai.com`, `jev-ai.pro`. One note is enough. They are not TypeSafe.

Lead-file articles, not repos: `https://www.langchain.com/blog/building-a-harness-with-jev`, the madewithjev harness posts, `https://docs.typesafe.ai/cookbooks/skill_suggestion`. Not kept.

`WillKelly/jev-evaluation` is already at `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/originals/github/WillKelly-jev-evaluation`. Not opened again.

## Lists opened

All of these were fetched. None was an empty list. An awesome-list is an index. It is not a kept tree.

| Catalog | Commit not stored for the list itself | Note |
| --- | --- | --- |
| https://github.com/yibie/awesome-jev | pushed 2026-10-02, 2081 stars, no license | Many product links. Debug hits are duplicates of the rows above. |
| https://github.com/v-modal/awesome-jev-tools | pushed 2026-10-02, 736 stars, no license | Best density of playground and harness blurbs. |
| https://github.com/heyjunpenn/awesome-jev | pushed 2026-09-30, 915 stars, MIT | Claims 962 projects. Treated as an index. |
| https://github.com/kydlikebtc/awesome-jev | pushed 2026-09-30, 591 stars | Call-site citations. Still blurbs until the target is opened. |
| https://github.com/AbdelStark/awesome-typesafe-jev | pushed 2026-10-02, 554 stars, MIT | Source-backed blurbs. |
| https://github.com/cobanov/awesome-jev | pushed 2026-10-01, 493 stars, CC0 | Shorter, still an index. |
| https://github.com/robokrunch/awesome-jev | pushed 2026-10-02, 3 stars, CC0 | Raw README was 556616 bytes. The API cut it at 512000. |
| https://github.com/daftAI2026/awesome-jev | pushed 2026-10-02, 10 stars, no license | Long name dump. Many one-off playgrounds. |
| https://github.com/logicrw/awesome-jev-projects | pushed 2026-10-02, 644 stars, MIT | Raw README was 525646 bytes. The API cut it at 512000. |
| https://github.com/OmniJev/awesome-jev-gallery | pushed 2026-10-02, 488 stars | Evals and dashboards called out by name. |
| https://github.com/Amal-David/awesome-jev | pushed 2026-10-02, 228 stars, CC0 | Short. Music playground and browser harness. |
| https://github.com/Anil-matcha/awesome-jev-by-typesafe | pushed 2026-09-23, 895 stars, MIT | Patterns. Points at `evals.typesafe.ai` workflows. |
| https://github.com/walidboulanouar/awesome-jev-use-cases | pushed 2026-09-26, 377 stars, CC0 | Use-case index. |
| https://github.com/townie/awesome-system-one | pushed 2026-10-02, 5 stars, CC0 | Found `dayhaysoos/jevals` and `DonaldMurillo/system-one-playground`. |
| https://github.com/AnotiaWang/awesome-decision-models | pushed 2026-10-02, 600 stars, CC0 | Decision-model index, not Jev-only. |
| https://github.com/kraayenjon/awesome-jev | pushed 2026-09-27, 166 stars | From the local lead file. Official playground link plus community tools. |

`AnotiaWang/awesome-jev` is not a second list. The GitHub API returns `AnotiaWang/awesome-decision-models` for that name.

https://jevlibrary.dev was not an empty script shell. curl got server-rendered HTML. `GET https://jevlibrary.dev/api/projects` returns two submissions: a static Jev Score walkthrough and a resume app. Neither is a debug or test tool. Nothing from that API was kept.

https://jevhunt.com was not an empty script shell. The homepage is 20 cards of 6759, sorted by stars, mostly out of scope. Search HTML was opened for `playground` (140), `dashboard` (54), `debugger` (3), `inspector` (4), `eval` (51), `harness` (209), `trace` (15), category `demos` (74), and category `browser` (304). Only page 1 of each. `https://jevhunt.com/assets/js/data.js` is UI metadata, not the project table. `https://jevhunt.com/data.js` 404'd. The full 6759 rows were not downloaded.

## What the deep surveys already cover

The parent clone directory already holds the obvious playgrounds, the Browser Use loop, two browser-QA runners, the review dashboard, and the early eval agent. This index does not regrade them. The misses worth a later quality pass are `jeiel85/jevscope`, `a742987/JevLens`, `MashiroKai/jev-playground`, `Dillettant/jev-test`, `grandaha/jev-playground`, `Tomdachs/jev-replay-lab`, `andududu/jeview`, `sohithk10/jev-trace-evaluator`, `openlayer-ai/jevals`, `4esv/jev-eval`, and `fstandhartinger/jevbench`.
