# Jev visual front

A builder debugging a request needs a page that edits state and questions and draws the typed answer with probabilities. These are the ones whose code does that. Grades are evidence from the file named in each entry. They are not a shelf ranking.

Parent clones that already had `.git` were read in place and not cloned again. Extra trees are under `engineers/quill/trees/`. No app was started. The live Jev API was not called.

Official door, when the source quotes it: `POST https://api.typesafe.ai/v1/systemone`.

## Open these first

### 1. sugarforever/tryjev — use

Live page already renders the editor: https://www.tryjev.xyz/

| | |
| --- | --- |
| Grade file | `src/routes/+page.svelte` draws noul, choice, and score cards (probability bar, option bars, confidence) and a JSON tab. |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/sugarforever--tryjev` |
| Commit | `52770fc2166b929ede98c6a1599cc03dea33af9c` on `main`. Matches GitHub `main`. Pushed `2026-09-25T19:24:01Z`. |
| License | MIT (`LICENSE`). |

Run: `npm install` then `npm run dev`. The README opens http://localhost:5173. No test script.

Key: the Key button writes `jev-keys` and `jev-provider` in `localStorage` (`+page.svelte` `persist`). The browser does store the key. The server reads `x-provider` and `x-api-key` and does not persist them. Optional server fallbacks are named in `.env.example`: `OPENROUTER_API_KEY`, `AI_GATEWAY_API_KEY`, `TYPESAFE_API_KEY`. Those values in the example file are empty.

Doors, from `src/lib/server/providers.ts`:

- TypeSafe: `fetch('https://api.typesafe.ai/v1/systemone'...)`, model `jev-latest` (`src/lib/types.ts`).
- OpenRouter: `client.alpha.decisions.create`, model `typesafe/jev-1.13`. The file does not quote an HTTP URL; the SDK owns it.
- Vercel: `createGateway` plus `experimental_evaluate`, model `typesafe-ai/jev`. Noul is sent as `type: "boolean"`. The file does not quote `ai-gateway.vercel.sh`.

Fixtures: `src/lib/scenarios.ts` exports `scenarios` (request presets, not recorded answers). `eval/` (samples, questions, runs, reports) is not imported by `src/`. There is no mock path. A run needs a key for the chosen door.

### 2. little-planet-labs/jev-playground — use

| | |
| --- | --- |
| Grade file | `src/components/AnswerCard.tsx`. `NoulResult`, `ChoiceResult`, and `ScoreResult` draw the probability, the option distribution, and confidence. |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/little-planet-labs--jev-playground` |
| Commit | `418b723779569b1cb1f21a4f7f34c546d44c7e34` on `main`. Matches GitHub `main`. Pushed `2026-09-17T13:56:22Z`. |
| License | No `LICENSE` file. GitHub `license` is null. |

Run: `npm install` then `npm run dev`. README says http://localhost:3000. Put `TYPESAFE_API_KEY` in `.env.local`. There is no `.env.example`. No test script. `npm run lint` exists and does not hit Jev.

Key: the browser does not store it. `localStorage` key `jev-playground-v1` stores the draft (state, model, questions) in `src/app/page.tsx`. The POST is to `/api/evaluate`. `src/app/api/evaluate/route.ts` constructs `new TypeSafeClient()` with no arguments, so the key is the server environment.

Door: the route file does not contain the URL. It calls `client.systemOne(...)`. The installed dependency is `@typesafe-ai/sdk` `^0.6.0`. In the published tarball `@typesafe-ai/sdk@0.6.0` `package/dist/index.mjs`, the client defaults `baseURL` to `"https://api.typesafe.ai"` and posts `"/v1/systemone"`. Override env in that bundle is `TYPESAFE_BASE_URL`. That tarball was read and not kept.

Fixtures: `sampleQuestions()` and `SAMPLE_STATE` in `src/lib/playground.ts` are a sample request, not a recorded response. No mock. A run needs the server key.

### 3. terryds/jevplayground — use

Live page renders: https://jevplayground.terrydjony.com/

Use this when the door is the Vercel AI Gateway, not TypeSafe's API.

| | |
| --- | --- |
| Grade file | `public/index.html`. `renderAnswers` calls `answerCard`, which draws the distribution and an auto-accept tag against the threshold. |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/terryds--jevplayground` |
| Commit | `02c20a09b37cca2fbdd586394f2bee82db6a5dae` on `main`. Matches GitHub `main`. Pushed `2026-09-19T09:52:17Z`. |
| License | No `LICENSE` file. GitHub `license` is null. |

Run: there is no `package.json` and no test script. The UI is the one HTML file. `wrangler.jsonc` is present; this survey did not deploy it. Opening the live site or the file is enough to read the UI.

Key: `KEY_STORAGE = 'jev-playground:key'`. The key stays in memory unless Remember is checked; then `localStorage.setItem` stores it. Drafts use `jev-playground:draft`. The page says the key is not put in shared images or links.

Door, quoted in the file: `const ENDPOINT = 'https://ai-gateway.vercel.sh/v4/ai/evaluation-model'` with model `typesafe-ai/jev` and headers `ai-gateway-protocol-version: 0.0.1`, `ai-gateway-auth-method: api-key`. This is not `https://api.typesafe.ai/v1/systemone`.

Fixtures: `PRESETS` in the same file are request presets. No recorded-response mock. A run needs a Vercel AI Gateway key.

### 4. TypeSafeAI/typesafe-playground — use, for `/language/examples` only

The rest of this repo is a catalog of demos (arcade, games, agents). Do not treat those routes as the inspector. The example builder is the page that edits state and questions and draws the answer.

| | |
| --- | --- |
| Grade file | `components/examples.tsx` `Examples`. The results pane prints the choice, the noul percent, the score, confidence, and `answer.probabilities` bars, plus a raw-response disclosure. |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/TypeSafeAI--typesafe-playground` |
| Commit | `0fbc9ef9d99157a2f86631fa3b385ef88ca79a10` on `main`. Matches GitHub `commits/main`. API `pushed_at` is `2026-10-01T17:56:41Z`. The commit itself is dated 2026-09-28. |
| License | MIT (`LICENSE`). |

Run, from the README and `package.json`: Node 22+, pnpm `10.34.5`, `pnpm install --frozen-lockfile`, `cp .env.example .env.local`, `pnpm dev`. Dev address in the README is http://localhost:3042. Open `/language/examples` (`app/language/examples/page.tsx` renders `<Examples />`).

`.env.example` names `TYPESAFE_API_KEY` and says not to prefix it with `NEXT_PUBLIC_`. The value in the example is empty. It also names `CLEAN_ROOM_JEV_INPUT_RATE` and `CLEAN_ROOM_JEV_OUTPUT_RATE` for a different workspace.

Key: two paths.

- Server env `TYPESAFE_API_KEY`. Not sent to the browser.
- Personal override in `lib/api-key.ts`: `localStorage` key `typesafe-api-key-override`. The browser does store it, unencrypted. `jevHeaders()` sends `X-TypeSafe-API-Key`. `tests/api.test.ts` checks that this override does not enter the model payload.

Door: `lib/serverJev.ts` `serverJevTransport` fetches `"https://api.typesafe.ai/v1/systemone"`. The browser calls `runJev` in `lib/client.ts`, which posts to `/api/run`.

Fixtures: `web/catalog.json` is the example library (inputs and questions), imported by `components/examples.tsx`. It is not a recorded response. Browsing and editing do not need a key. Run does. Other fixtures in the repo (`fixtures/proposal-review/`) belong to other workspaces, not this page.

Tests for this page: `tests/api.test.ts`, `tests/test_catalog.js`, `tests/test_catalog_contract.py`, `tests/e2e/examples-panels.spec.ts`, `tests/e2e/catalog-quality.spec.ts`.

The same repo still contains the older three-panel UI at `web/app.js` (`renderAnswer`) and `server.py` (`DEFAULT_API_URL = "https://api.typesafe.ai/v1/systemone"`). That UI is the nickthompson playground, extended. Prefer `/language/examples` unless you want the zero-install Python server. See nickthompson below for that server.

## Also a real inspector

### PenglongHuang/jev-demo — use

| | |
| --- | --- |
| Grade file | `public/js/output.js` `renderAnswers`. Choice and score get probability bars. Noul shows `a.noul` and a yes/no split. `renderAll` also fills the raw response and the request panes. |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/PenglongHuang--jev-demo` |
| Commit | `def34f2c3c996554d05a124fcdd67acad9ff41fa` on `main`. Matches GitHub `main`. Pushed `2026-09-30T02:10:57Z`. |
| License | MIT (`LICENSE` and `package.json`). |

Run: `npm install` then `npm start` (`node server.js`). `server.js` binds `127.0.0.1` and port `3000` unless `HOST` or `PORT` is set. `npm test` runs `tests/*.spec.js`. `npm run test:e2e` runs `tests/e2e/run.js` and is a browser driver, not required to inspect one call.

Key: `public/js/app.js` `STORAGE.keys` is `jev-keys` in `localStorage`. The comment in `server.js` says the page key is preferred (`x-typesafe-key`) and `TYPESAFE_API_KEY` is the fallback. `.env.example` names `TYPESAFE_API_KEY` and `PORT`. The example value is empty. The browser does store the key. An LLM key for a separate "generate input" action is also stored (`jev-llm`). That is not the Jev key.

Doors, quoted in both `server.js` `API_URL_PRESETS` and `public/js/app.js` `PROVIDERS`:

- `https://api.typesafe.ai/v1/systemone`
- `https://openrouter.ai/api/v1/systemone`
- a custom URL the page stores as `jev-custom-endpoint`

The browser posts to `/api/systemone`. The server proxies.

Mock: `tests/e2e/mock-server.js` and `tests/e2e/mock-standalone.js` stand in for `/v1/systemone`. `tests/llm-proxy.spec.js` points the proxy at a collector URL. The page itself has no "run with fixtures" switch. Request presets live in the public JS. The same app also drives a browser (`browser-driver.js`). That mode is not why this is graded use.

### Ahmar004/jev-playground — use, for `/sandbox` only

The root `README.md` is an unrelated "8x web template". Ignore it. The inspector is the Sandbox page.

| | |
| --- | --- |
| Grade file | `src/features/arena/answer-view.tsx` `JevAnswerBlock` draws the yes probability or the option bars and confidence. `src/features/arena/side-card.tsx` `SideCard` renders `AnswerView`. `src/features/sandbox/run-panel.tsx` `RunPanel` shows that card for a recording or a live run. |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/quill/trees/Ahmar004--jev-playground` |
| Commit | `961141bfdbfa05932678406f03189daecb1ccd07` on `main`. Pushed `2026-10-02T17:53:16Z`. GitHub size `1661` (under the clone limit). |
| License | No `LICENSE` file. GitHub `license` is null. |

Run: Node `>=22.18`, pnpm `10.6.2`, `pnpm dev` (`package.json`). The page is `src/app/(app)/sandbox/page.tsx`, route `/sandbox`. This survey did not boot it. The repo also has Prisma scripts and a course of levels and games. Expect more setup than a static file. Keep the sandbox; leave the games.

Key: `src/features/keys/keys-context.tsx` `KeysProvider` holds keys in React state. The comment says they are not written to localStorage, sessionStorage, cookies, or the URL. A reload clears them. `run-panel.tsx` says the same: "The key stays in this tab and is never saved."

Door: `src/runner/providers/typesafe.ts` `TYPESAFE_URL = 'https://api.typesafe.ai/v1/systemone'`. The browser uses `JEV_PROXY_URL = '/api/jev'` because of CORS. `callTypeSafe` posts `Authorization: Bearer`.

Fixtures: beginner mode replays a recording with no key. `src/content/sandbox.ts` `templateViews` loads `currentRecordings` and keeps Jev's recorded side. Developer mode runs the edited setup live. Tests: `src/app/api/jev/route.test.ts`, `src/features/sandbox/snippets.test.ts`, `src/features/keys/keys.test.tsx`, `src/runner/providers/typesafe.test.ts`. `package.json` `test` runs node:test and vitest.

### luongnv89/system1 — use

One file. Good when the target is any `POST /v1/systemone` the browser is allowed to call (local Kev or Ollama). The page itself says TypeSafe's API answers this origin with a CORS error, so a TypeSafe key typed here does not complete a browser call to `api.typesafe.ai`.

| | |
| --- | --- |
| Grade file | `index.html` `renderAnswers`. Noul shows `P(yes)` to four decimals. Choice and score list each probability. |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/quill/trees/luongnv89--system1` |
| Commit | `872e2d086626dd55da063b7c6685418d7db59b30` on `main`. Pushed `2026-10-01T09:07:49Z`. |
| License | MIT (`LICENSE`). |

Run: open `index.html`. No package, no test file. The key field is sent as `Authorization: Bearer` and is not written to `localStorage`. The only `localStorage` key found is `s1-theme`.

Door: the request is `fetch(base+"/systemone")`. The documented hosted base in the page is `https://api.typesafe.ai/v1`. Presets are in the same file. No recorded-response mock.

### mariusandra/jev.st — use, for the text page

The repo is also a set of games ("cars" that play). The inspector is `js/apps/text.js`.

| | |
| --- | --- |
| Grade file | `js/apps/text.js` `renderAsk`. Choice, score, and noul each get a probability track. |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/quill/trees/mariusandra--jev.st` |
| Commit | `0eaf0e6bad5288882f85393006bc05c6714d0b0e` on `main`. Pushed `2026-10-01T07:22:02Z`. |
| License | No `LICENSE` file. GitHub `license` is null. |

Run: static site. No test script found. Presets load from `data/presets.json` (requests, not a mock server).

Key: `js/models.js` stores cars in `localStorage` key `jebst-cars`, and the car object includes `apiKey`. The browser does store the key. TypeSafe's preset posts to `url: "/ts"` with model `jev-latest`. `functions/ts/[[path]].js` sets `UPSTREAM = "https://api.typesafe.ai"` and forwards the request. A local relay is `tools/jevst-proxy.py` (`--target https://api.typesafe.ai`). PostHog is a different car: `https://gateway.us.posthog.com` (or `gateway.eu.posthog.com`) model `posthog/hogference/jevk5-fp8-0.2`. Any other `/v1/systemone` URL can be saved as a car.

### wagnerjt/jev-playground — use

| | |
| --- | --- |
| Grade file | `src/components/ResponseVisualizer.tsx` `ResponseVisualizer`. The card title is "Jev Model Response & Probabilities". |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/quill/trees/wagnerjt--jev-playground` |
| Commit | `2d09ec1c1e504f7ec4386a2b9d4edc5fe6069dbc` on `main`. Pushed `2026-09-30T22:37:10Z`. |
| License | MIT (`LICENSE`). |

Run: `npm run dev` (`vite dev --port 3000`). No test script. `src/services/presets.ts` holds request presets, including a note for Ollama at `http://localhost:11434/v1/systemone`. No recorded-response mock.

Key: `src/routes/index.tsx` keeps `apiKey` in React state and sends it to the server function. `localStorage` in this repo is only `theme`. The browser does not persist the key. `src/server/jev.ts` uses the typed key, else `process.env.TYPESAFE_API_KEY`.

Door: default base `"https://api.typesafe.ai"`, or `TYPESAFE_BASE_URL`, or the header field. A trailing `/v1/systemone` is stripped so the SDK does not double it. `new TypeSafeClient({ apiKey, baseURL }).systemOne(payload)` then posts `/v1/systemone` (same SDK contract as little-planet).

### kerryback/jev — use

OpenRouter only. Live site named in the README: https://jev.kerryback.com/ (not fetched here).

| | |
| --- | --- |
| Grade file | `page.html` `answerCard` (noul as a two-bar distribution, choice and score from `probabilities`). The call is `jev.py` `run`, which uses `AsyncTypeSafeClient.system_one`. |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/quill/trees/kerryback--jev` |
| Commit | `ad1927242eb8d9bc1b7f9c08c4b47905d058f488` on `main`. Pushed `2026-09-30T23:00:55Z`. |
| License | No `LICENSE` file. GitHub `license` is null. |

Run, from the README: venv, `pip install -r requirements.txt`, set `OPENROUTER_API_KEY`, then `python -m uvicorn app:app --reload --port 8000`.

Key: server environment only. `config.py` reads `OPENROUTER_API_KEY`. The browser does not store it.

Door, quoted in `config.py`: `BASE_URL = "https://openrouter.ai/api"`, model `~typesafe/jev-latest`. The file says this is not OpenRouter's chat model `typesafe/jev-router`.

Fixtures: `PRESETS` in `config.py`. `test_app.py` calls the live door and skips when `OPENROUTER_API_KEY` is absent. There is no recorded-response mock.

### nickthompson480/typesafe-ai-playground — use

This is the smaller original of the TypeSafe example builder. Open it when you want the catalog without pnpm. If you already run TypeSafeAI/typesafe-playground, you do not need this copy for new work.

| | |
| --- | --- |
| Grade file | `web/app.js` `renderAnswer`. Noul percent and bar, choice label plus `probabilities`, score plus legend and probabilities, confidence line. |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/nickthompson480--typesafe-ai-playground` |
| Commit | `8ee3d0b36d0c2dd46987131f0b7b14c084d81e65` on `main`. Matches GitHub `main`. Pushed `2026-09-16T07:18:19Z`. |
| License | MIT (`LICENSE`). |

Run: Python 3.10+, `python3 run.py`. README says the server prints http://127.0.0.1:8765. No packages. The key is typed at the prompt or taken from `TYPESAFE_API_KEY`. It stays in the server process. The browser does not receive it. `web/app.js` `localStorage` key `typesafe-playground-workspace-v2` stores drafts and custom examples, not the key.

Door: `server.py` `DEFAULT_API_URL = "https://api.typesafe.ai/v1/systemone"`.

Fixtures: `web/catalog.json`. You can edit with no key. Run needs a key. Tests: `tests/test_server.py`, `tests/test_http.py`, `tests/test_catalog.js`, `tests/test_catalog_contract.py`, `tests/test_run.py`, `tests/test_mobile_contract.py`.

## Study

The idea is worth keeping. The code does not show a live Jev decision, or the door is not the real API.

### TypeSafeAI/typesafe-ui — study

| | |
| --- | --- |
| Grade file | `apps/web/components/labs/typed-preview.tsx` `TypedPreview`. `execute` calls `fixtureAnswers`. The banner says "No Jev request is sent". |
| Draw | `packages/ui/src/components/jev-result.tsx` `JevResult` prints choice, noul, and score in one list and a meter when the value is between 0 and 1. `packages/ui/src/components/jev-contract.tsx` `JevContract` draws the questions, not the answer. |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/TypeSafeAI--typesafe-ui` |
| Commit | `61e5e9e30face27cf03da0035c79cde408240cca` on `main`. Matches GitHub `main`. Pushed `2026-09-26T18:57:08Z`. |
| License | No root `LICENSE`. GitHub `license` is null. `apps/web/lib/playground/LICENSE.upstream.txt` is MIT for the upstream catalog. `packages/typescript-config/package.json` says `"license": "PROPRIETARY"`. Do not treat the repo as MIT. |

Run: pnpm `10.33.4`, Node `>=20`, `pnpm install --frozen-lockfile`, `pnpm dev`. Library at `/`, lab at `/lab` (`apps/web/app/lab/page.tsx`). No key. Fixtures come from `apps/web/lib/lab-preview.ts` and `apps/web/lib/playground/catalog.json`. Tests: `apps/web/e2e/lab.spec.ts`, `apps/web/e2e/jev-labs.spec.ts`, `apps/web/e2e/playground-coverage.spec.ts`. There is no root unit-test script. `pnpm test:e2e` is Playwright.

### adyoi/jev-system-one-playground — study

Windows Forms three-pane editor. The answers are a local keyword match, not Jev.

| | |
| --- | --- |
| Grade file | `Program.cs` `RenderVisualResults`, fed by the keyword matcher above it (`noul` is `0.98` or `0.00`). No `HttpClient` call was found. |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/adyoi--jev-system-one-playground` |
| Commit | `b133e6b41fbc0638cfb11f413cd6544f7b1cf1e2` on `master`. Matches GitHub `master`. Pushed `2026-09-24T08:33:07Z`. |
| License | No `LICENSE` file. GitHub `license` is null. |

The endpoint text box is set to `https://api.typesafe.ai/v1/system-one` (hyphen, not `systemone`). The README says that URL 404s and the build stays in simulation. No test file. Run the `.csproj` with the .NET SDK on Windows. This survey did not.

### saimahmedqazi/typesafe-jev-playground — study

The workbench edits state and questions and has `ResultInspector`, but the native door is not TypeSafe and one display path invents a probability.

| | |
| --- | --- |
| Grade file | `src/adapters/native-jev-adapter.ts` `DEFAULT_NATIVE_JEV_ENDPOINT = 'https://api.jev.ai/v1/evaluate'`. `src/client/components/ResultInspector.tsx` maps `response.result.value` to `noul: value ? 0.98 : 0.02` when `response.answers` is absent. |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/engineering/engineers/quill/trees/saimahmedqazi--typesafe-jev-playground` |
| Commit | `b6e6e316d0967a49bce07f61aa5c4292e785605f` on `main`. Pushed `2026-10-02T07:38:55Z`. |
| License | No `LICENSE` file. GitHub `license` is null. |

Run: `npm run dev` (Express plus Vite). `npm test` is vitest. Relevant tests: `tests/adapters/native-jev-adapter.test.ts`, `tests/server/evaluate.test.ts`, `tests/client/history.test.ts`.

Key: `nativeJevKey` lives in React state (`src/client/App.tsx`) and is sent as `x-user-jev-key`. `src/client/history.ts` says history in `localStorage` does not persist credentials. LLM practice mode posts to provider chat URLs (`src/server/evaluate.ts` names Groq and OpenAI model-list URLs), not to `/v1/systemone`.

### comoc/jev-minesweeper — study, calibration view only

This is a game. Keep the calibration canvas. Do not open it to edit an arbitrary request.

| | |
| --- | --- |
| Grade file | `public/js/app.js` `renderCalib`. It plots Jev's probability against the share of cells that were mines, plus a Brier score in `renderCalibStats`. |
| Local path | `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/comoc--jev-minesweeper` |
| Commit | `5cbc361b1260cdfef6e9383639797bf483c064e0` on `main`. Matches GitHub `main`. Pushed `2026-09-20T12:50:17Z`. |
| License | No `LICENSE` file. GitHub `license` is null. |

Run: `npm start` (`node server.mjs`). `npm run mock` uses `lib/mock-jev.mjs` and does not call Jev. `npm test` is `test/run-tests.mjs`. `.env.example` names `TYPESAFE_API_KEY`, `TYPESAFE_MODEL` (`jev-latest`), and `PORT` (comment says default 8787). The example key is empty.

Key: server env only. The browser asks `/api` health and never stores the key.

Door: `lib/typesafe.mjs` `callSystemOne` fetches `` `${baseURL}/v1/systemone` `` with `baseURL` default `https://api.typesafe.ai`.

### ihatecoding01/Simple-Jev — study

It has a real page. It is not a systemone inspector. Not cloned (size 3137, under the limit). Read from raw `main` at `9578fcdc9b34f3a7d63e03faf8f1f42b45ebcb7e` (committer `2026-10-02T18:22:20Z`). API `pushed_at` `2026-10-02T18:22:22Z`. License MIT.

`frontend/src/components/DecisionCard.tsx` draws a verdict, a certainty bar, and `result.distribution`. `frontend/src/services/api.ts` `executeJev` posts to the app's own `/api/v1/jev/execute`. `fetchSystemStatus` falls back to `is_simulation: true` and the name "Deterministic Simulation Engine (Demo)". A GitHub code search for `systemone` in this repo returned no hits. The playground page mentions noul, choice, and score as schema types. It does not show the official request.

## Dropped

One line each. Not kept.

- DeepBlueDynamics/typesafe-arena. `c057cfbb892a0b39d7c882fc591be0b4285e8d9e`, `main`, pushed `2026-09-17T06:43:49Z`. GitHub license null. `lume/LICENSE` is BSD-3-Clause for the search tool only. The README is a local mirror of docs.typesafe.ai. `lume/viz/src/ResultsPanel.jsx` lists search hits, not Jev answers. Skip.
- zeke/jev. `8c2907406b60486f4eb9b384e700e912e5b4170a`, `main`, pushed `2026-09-24T00:27:28Z`. No license file. `example/src/index.ts` `renderBars` draws a support demo, but `QUESTIONS` is a constant and the user only edits the message. `example/sample-response.json` is a sample. Skip as a fixed demo, not an inspector. Door in that file is Workers AI `env.AI.run("typesafe/jev", ...)`, not a quoted `api.typesafe.ai` URL.
- nwadmark/jev-decision-lab. `7a9b59742c08bb059704fdc6eb1632f545841973`, `main`, pushed `2026-09-30T05:10:20Z`, MIT. `app.js` renders question tabs. `index.html` links out to `https://console.typesafe.ai/playground`. It does not draw an answer. Skip.
- markjaquith/typesafe-ai-playground. Not cloned. README is a Rust CLI (`typesafe-ai phi ...`) with `OPENROUTER_API_KEY` or `TYPESAFE_API_KEY`. Not a page. Skip. UI source was not opened.
- kavehmz/typesafe-playground. Not cloned. Size 28156. README is four demos (support routing, driving). Not a freeform request editor. Skip. The decision-panel source was not opened.
- blck-snwmn/playground-jev. Not cloned. README is Othello, Tetris, and fixed inquiry samples. Skip.
- JYeswak/jev_playground. Not cloned. GitHub size `64084` (over 50000, no full clone). README is a CLI measurement kit with `--fake`. Not a visual inspector. Skip.
- jleifeld/maclaya. Not cloned. README is a local Laya server with a playground behind a Jev-shaped API. Not hosted Jev. Skip. Playground source was not opened.
- https://jev-xyz.com/en/try. Fetched. Hosted. The browser posts to that site, which holds the key. Questions and options are fixed on the server. State text is the only edit. The page documents the forwarded shape as `POST https://api.typesafe.ai/v1/systemone` with model `jev-latest`. Not a repo, and not an inspector, because the questions cannot change.
- https://jevtypesafeai.com/jev/playground. Unofficial door. Fetched text says the page runs on a live key with no signup, and that production can be `POST https://jevtypesafeai.com/api/v1/decide` with a `jv_live_` key, or the official `POST https://api.typesafe.ai/v1/systemone`. Do not treat this host as TypeSafe. One note only. The rendered form was not driven.
- https://console.typesafe.ai/playground. This is the resource https://jevlibrary.dev/resources/playground opens ("Paste a state, add questions, and see typed answers"). A fetch of the console URL returned a bot wall ("Just a moment..."). Not logged in. No source tree in this survey. Not graded.
- jevlibrary.dev category "Demos & playgrounds" (101 entries, snapshot date on the page Sep 24, 2026). First screen is product demos (shapeshift, killmyidea, jevcache, and others) plus TypeSafeAI/typesafe-playground, which is kept above. The other cards on that screen are apps, not request inspectors. The on-page search did not filter when the input was set from script, so later pages of the 101 were not enumerated.
- jevhunt.com category `https://jevhunt.com/categories/demos`. First page fetched. Same pattern: product demos, plus TypeSafeAI/typesafe-playground and nickthompson480/typesafe-ai-playground, both kept above. Later pages were not enumerated.
- GitHub repository search `jev playground` returned 161 hits. Toy names, notebooks, and game repos were not written up. The ones whose description was a request inspector were opened and are above or in this drop list.
