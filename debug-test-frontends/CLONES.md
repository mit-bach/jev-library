# Clones

Parent shallow clones on 2026-10-02. Directory name is `owner--repo`. Commit is `git rev-parse HEAD` after `--depth 1`. These are snapshots, not grades. The quality writeup waits on the four surveys.

Rows marked opened are files the parent read. Rows marked cloned were fetched and not read past the tree existing.

## Opened

| Directory | Commit | What the opened file shows |
| --- | --- | --- |
| `sugarforever--tryjev` | `52770fc2166b929ede98c6a1599cc03dea33af9c` | Playground with three doors in `src/lib/server/providers.ts`. TypeSafe is `POST https://api.typesafe.ai/v1/systemone` and model `jev-latest`. OpenRouter is `alpha.decisions` and model `typesafe/jev-1.13`. Vercel is `experimental_evaluate` and model `typesafe-ai/jev`. The browser key is forwarded per request. |
| `TypeSafeAI--typesafe-playground` | `0fbc9ef9d99157a2f86631fa3b385ef88ca79a10` | Next.js lab on port 3042. README says examples browse without a key and controls labeled Live Jev need `TYPESAFE_API_KEY`. A usage dashboard records per-call usage. README says branding is not vendor endorsement. Live site named in the README: `https://typesafe-ai-playground.vercel.app`. |
| `TypeSafeAI--typesafe-ui` | `61e5e9e30face27cf03da0035c79cde408240cca` | Component library. `/lab` renders local fixtures with no provider key. `docs/jev-labs.md` describes Jev contract and result components. |
| `jonymusky--jev-browser-qa` | `ca6d5a2d46623f9f8606aabc10f1143afd070090` | Playwright drives. Jev judges. `src/jev/client.ts` calls Vercel AI Gateway `gateway.evaluationModel('typesafe-ai/jev')`, not the official HTTP path. `pnpm dashboard` serves `dashboard/index.html` on port 4310 from `artifacts/runs/*.json`. The repo ships a `jev-qa` skill. |
| `devagrawal09--jev-review` | `31f89602797fb7bea007f8a480bf368bf564954e` | Code-review workflow plus a dashboard. `src/dashboard/server.ts` binds `127.0.0.1` port 4317 and serves a saved report. Producing the report needs a key. |
| `TypeSafeAI--jev-harness` | `1239b23052b701e690727755cf17ea90c92654ff` | README says this community org is independent of the official TypeSafe team. `pnpm test` and `pnpm bench:review` need no key. The bench totals are scripted mock values, not measurements of Jev. Receipt v1 is an offline SHA-256 binding. |
| `terryds--jevplayground` | `02c20a09b37cca2fbdd586394f2bee82db6a5dae` | One HTML page. No backend. `public/index.html` posts to `https://ai-gateway.vercel.sh/v4/ai/evaluation-model`. The key stays in the browser and is sent to that host. |
| `PenglongHuang--jev-demo` | `def34f2c3c996554d05a124fcdd67acad9ff41fa` | `server.js` proxies `https://api.typesafe.ai/v1/systemone` and also `https://openrouter.ai/api/v1/systemone`. Page is `http://localhost:3000`. The Playwright scene is in the same repo. |
| `adyoi--jev-system-one-playground` | `b133e6b41fbc0638cfb11f413cd6544f7b1cf1e2` | WinForms UI. `Program.cs` defaults the endpoint to `https://api.typesafe.ai/v1/system-one` (a hyphen). README says that path returns Not Found and this build simulates answers with a local matcher. The official path has no hyphen. |
| `vinilana--jev-browser` | `7d608732aa586465dc612c1d54c8b83b6ddc7625` | Each run writes `report.html`, `events.jsonl`, screenshots, and a Playwright `trace.zip`. README says the trace can contain form data. |
| `browser-use--jev-ultrafast` | `1231850a0bf1a0c0341fe408ef1668dbbfdfac46` | Browser agent. Jev picks an operation and an element from a numbered table. README is a product demo, not a test dashboard. |

## Opened after the first table

| Directory or tree | Commit | What the opened file shows |
| --- | --- | --- |
| `mizchi--jev-test-filter` under `engineering/engineers/brant/trees/` | `955bdf4e20ff49c3dac0b5b3eee5df0278d5be87` | `src/jev.ts` posts to `https://api.typesafe.ai/v1/systemone`. `test/jev.test.ts` asserts that URL with no live call. |
| `ElshinQ--jevaluate` | `9f1b9272a9ac797fae6bfba54d141d2953a62991` | `scripts/jev.mjs` posts to the official endpoint. The walk also calls DeepSeek. |
| `little-planet-labs--jev-playground` | `418b723779569b1cb1f21a4f7f34c546d44c7e34` | `src/app/api/evaluate/route.ts` uses `@typesafe-ai/sdk`. |
| `TypeSafeAI--clarity-judge` under `engineering/engineers/sedge/trees/` | `f7051ab8115aca726cdc16a4d131aeaa527bdabf` | README: no key means a labeled mock. A key calls TypeSafe. |
| `vinilana--jev-eval-agent` | `037de1120c84b4b63cdf748e2acf258ff66d7731` | README: `eval-ui/index.html` and `scripts/serve-ui.mjs`. |
| `comoc--jev-minesweeper` | `5cbc361b1260cdfef6e9383639797bf483c064e0` | README: cell hover shows the noul text, the JSON, and the solver probability. `npm run mock` needs no key. |
| `KiritoKing--midscene-jev-runner` | `f07d22fd682697e874faf2f5a062d30272b92900` | README: OpenRouter `alpha/decisions`, model `~typesafe/jev-latest`. |
| `AntonioCoppe--jev-harness` under `engineering/engineers/sedge/trees/` | `1a3dd4ae86de72f0df7d6e70b25feffc41ca3255` | `src/harness.ts` shadow mode returns `shadow_noop`. |
| `anisselbd--jev-phishing-bench` under `engineering/engineers/sedge/trees/` | `1d56e8c64d029a9554a0874e2ef2901ed196e230` | Cloned. Source not read in the parent pass. |

## Cloned, parent has not read the source yet

| Directory | Commit |
| --- | --- |
| `nickthompson480--typesafe-ai-playground` | `8ee3d0b36d0c2dd46987131f0b7b14c084d81e65` |
| `DeepBlueDynamics--typesafe-arena` | `c057cfbb892a0b39d7c882fc591be0b4285e8d9e` |

## Not full-cloned by the parent

GitHub `size` was over 50000 KB. Surveys may still take a partial read.

- `Kevin-Liu-01/Relay` (about 135 MB). Description: watch computer-use agents, live browser replay, inspectable evaluation traces.
- `JYeswak/jev_playground` (about 567 MB). Description: graded findings for what Jev can do.
- `reticlehq/reticle` (about 145 MB). Description: runtime perception for web and desktop apps.
- `AntonioCoppe/jev-harness` was over that line for the parent. The sedge survey shallow-cloned it anyway. See the opened table.
