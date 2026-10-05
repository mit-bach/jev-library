# Sources

Commits are `git rev-parse HEAD` on a local clone unless the row says GitHub API. `pushed_at` is from `GET https://api.github.com/repos/<owner>/<repo>` unless noted.

## Local trees read

Parent clones (`.git` present, not cloned again):

| Path | Commit |
| --- | --- |
| `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/TypeSafeAI--jev-harness` | `1239b23052b701e690727755cf17ea90c92654ff` |
| `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/devagrawal09--jev-review` | `31f89602797fb7bea007f8a480bf368bf564954e` |
| `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/vinilana--jev-eval-agent` | `037de1120c84b4b63cdf748e2acf258ff66d7731` |

Shallow clones under `.../engineers/sedge/trees/`:

| Path | Commit |
| --- | --- |
| `AntonioCoppe--jev-harness` | `1a3dd4ae86de72f0df7d6e70b25feffc41ca3255` |
| `aaddrick--building-with-typesafe-jev` | `a46856c9fbc890653891e25f85ee2f16e1d9b513` |
| `anisselbd--jev-phishing-bench` | `1d56e8c64d029a9554a0874e2ef2901ed196e230` |
| `NiazMorshed2007--jev-review` | `57690af54ef7d862c2483342c1e61c14dffcf727` |
| `TypeSafeAI--clarity-judge` | `f7051ab8115aca726cdc16a4d131aeaa527bdabf` |
| `PromtEngineer--jev-harness` | `9bd4f670a2866498aa570e4ce4654997b3dce190` |
| `AbdelStark--jev-benchmarks` | `0d610cc53e79bcbec691312b0c4adb4a0e371642` |
| `dfranco-projects--jev-guardbench` | `512389dc58a721158064ccffc780f980d4ee0cb2` |
| `ianlintner--jev-shadow-adapter` | `afc1a3692296f23b8d6b7f34ee54c474372360a4` |

2026-10-01 trees (not cloned):

| Path | Commit |
| --- | --- |
| `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/originals/github/WillKelly-jev-evaluation` | `d80f375621ad4b9306c6dff6941242925d7e2386` |
| `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/originals/github/system-one-adapter-python` | `e1d4cc938204b22fc5a3c3aca7044072fe3f712d` |
| `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/corpus/05-examples-repos-and-outputs/cobble/trees/WorkflowEvals` | no `.git`. GitHub `main` `0ac3b8ad845429f0d8e064ecfb2430a47c5a25cb` was not byte-compared to this tree. |

Files opened inside those trees (grade depends on these):

- TypeSafeAI jev-harness: `package.json`, `LICENSE`, `src/benchmark/load.ts`, `src/benchmark/bench.ts`, `src/audit/receipt.ts`, `src/contract/decide.ts`, `scripts/bench-review.ts`, `examples/host/jev-choice.ts`, `examples/host/review-experiment.ts`, `examples/review/experiment-cli.ts`, `fixtures/proposal-review/clean-null-guard.json`, `components/arena-inspector.tsx`, `tests/receipt-binding.test.ts`
- devagrawal09: `package.json`, `.env.example`, `LICENSE`, `src/review/judgments.ts`, `src/dashboard/server.ts`, `src/dashboard/public/app.js`, `src/adapters/report-store.ts`
- vinilana: `package.json`, `.env.example`, `agent/lib/jev-router.ts`, `evals/prompts.ts`, `evals/shared.ts`, `evals/assistant.eval.ts`, `eval-ui/index.html`, `scripts/serve-ui.mjs`
- AntonioCoppe: `eval/cli.ts`, `eval/fixtures/tool-gate.jsonl`, `src/harness.ts`, `src/logger.ts`, `src/loggers/serialize.ts`, `LICENSE`, `package.json` scripts via `python`
- aaddrick: `evals/docs/harness.md`, `evals/command-gate/case.yaml`, `evals/command-gate/prompt.md`, `LICENSE`, `skills/building-with-typesafe-jev/api-reference.md` (search hit on the POST line)
- phishing: `run_jev.py`, `results/report.md`, `prepare_data.py` (search hit)
- Niaz: `src/jev/client.ts`, `LICENSE`, directory listing of `public/`
- clarity-judge: `lib/jevClient.ts`, `lib/judge.ts`, `components/ResultsPanel.tsx`, `package.json`
- PromtEngineer: `app/server.py`, `app/index.html`, `extension/jev-harness.ts`, `extension/policy.ts`, `tests/policy.test.ts`
- AbdelStark: `src/jev_benchmarks/report.py`, `src/jev_benchmarks/adapters/jev.py`, `src/jev_benchmarks/data.py`, `src/jev_benchmarks/cli.py`
- guardbench: `src/guardbench/guards/systemone.py`, `src/guardbench/report.py`, `src/guardbench/data.py`, `configs/full.yaml`, `configs/smoke.yaml`, `tests/test_guards.py`
- ianlintner shadow: `src/jev_shadow/client.py`, `src/jev_shadow/config.py`, `grafana/jev-shadow-dashboard.json`
- WillKelly: `README.md`, `jeveval/config.py`, `runs/full-20260919/report.html` (head), `LICENSE`
- adapter: `README.md`, `LICENSE`
- WorkflowEvals: `README.md`, `core/providers.py`, `core/clients.py`, `core/scoring.py`, `plot.py` (head), `evals/customer_service/questions.py` (search hits), `LICENSE`

Also listed, not every file read: `debug-test-frontends/originals/github/` directory names, cobble `trees/` directory names.

## GitHub API

`Accept: application/vnd.github+json`.

Repo metadata (`/repos/<name>`):

- https://api.github.com/repos/devagrawal09/jev-review
- https://api.github.com/repos/vinilana/jev-eval-agent
- https://api.github.com/repos/AntonioCoppe/jev-harness
- https://api.github.com/repos/TypeSafeAI/jev-harness
- https://api.github.com/repos/aaddrick/building-with-typesafe-jev
- https://api.github.com/repos/JYeswak/jev_playground
- https://api.github.com/repos/anisselbd/jev-phishing-bench
- https://api.github.com/repos/NiazMorshed2007/jev-review
- https://api.github.com/repos/TypeSafeAI/clarity-judge
- https://api.github.com/repos/AbdelStark/jev-benchmarks
- https://api.github.com/repos/PromtEngineer/jev-harness
- https://api.github.com/repos/ismaelsoilet/jev-harness
- https://api.github.com/repos/dfranco-projects/jev-guardbench
- https://api.github.com/repos/Donnaclarkk981/typesafe-ai-benchmark
- https://api.github.com/repos/ianlintner/jev-shadow-adapter
- https://api.github.com/repos/ianlintner/jev-router
- https://api.github.com/repos/Suryals/jev-router-lab
- https://api.github.com/repos/guilhem/jev-ci-selector
- https://api.github.com/repos/silex-ai-lab/jev-runtime-observability
- https://api.github.com/repos/jerryshao2012/typesafe_jev
- https://api.github.com/repos/typesafe-ai/WorkflowEvals

Contents listings:

- https://api.github.com/repos/silex-ai-lab/jev-runtime-observability/contents/web
- https://api.github.com/repos/silex-ai-lab/jev-runtime-observability/contents/web/js
- https://api.github.com/repos/silex-ai-lab/jev-runtime-observability/commits/main
- https://api.github.com/repos/typesafe-ai/WorkflowEvals/commits/main
- Root contents for the extra-candidate list in the same batch as the metadata script (AbdelStark through jerryshao and WorkflowEvals).

Search (repository search, not code search):

- `q=jev+harness+OR+dashboard+OR+eval+typesafe+in:name,description`
- `q=jev fixture runner`
- `q=jev "shadow mode"`
- `q=jev "trace viewer" OR "eval dashboard"` (noisy; not used as grades)
- `q=jev-eval OR jev-bench OR jev-harness in:name`
- `q="systemone" eval harness dashboard` (zero hits)
- `q=clarity-judge`
- `q=WorkflowEvals typesafe`

Code search `repo:silex-ai-lab/jev-runtime-observability systemone` returned HTTP 401. Not used.

## Raw pages

- https://raw.githubusercontent.com/AbdelStark/jev-benchmarks/main/README.md
- https://raw.githubusercontent.com/PromtEngineer/jev-harness/main/README.md
- https://raw.githubusercontent.com/ismaelsoilet/jev-harness/main/README.md
- https://raw.githubusercontent.com/dfranco-projects/jev-guardbench/main/README.md
- https://raw.githubusercontent.com/Donnaclarkk981/typesafe-ai-benchmark/main/README.md
- https://raw.githubusercontent.com/ianlintner/jev-shadow-adapter/main/README.md
- https://raw.githubusercontent.com/ianlintner/jev-router/main/README.md
- https://raw.githubusercontent.com/Suryals/jev-router-lab/main/README.md
- https://raw.githubusercontent.com/guilhem/jev-ci-selector/main/README.md
- https://raw.githubusercontent.com/silex-ai-lab/jev-runtime-observability/main/README.md
- https://raw.githubusercontent.com/JYeswak/jev_playground/main/README.md
- https://raw.githubusercontent.com/jerryshao2012/typesafe_jev/main/README.md
- https://raw.githubusercontent.com/silex-ai-lab/jev-runtime-observability/64aae74b10bcbb0f5449913963942730fcc2ed06/web/index.html
- https://raw.githubusercontent.com/silex-ai-lab/jev-runtime-observability/64aae74b10bcbb0f5449913963942730fcc2ed06/web/js/verdict.js

## Not a source

The Jev API was not called. `@typesafe-ai/sdk` and `typesafe_sdk.constants.DEFAULT_BASE_URL` were not opened, so those hosts are not quoted unless a repo file quotes them.
