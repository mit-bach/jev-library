# Stop

Snapshot date: 2026-10-01. Write root: this directory. No TypeSafe, OpenRouter, or Vercel API call was made. No API key was stored.

## Repos and SHAs that were snapshotted

Full shallow clones:

- `typesafe-ai/system-one-adapter-python` `e1d4cc938204b22fc5a3c3aca7044072fe3f712d`
- `typesafe-ai/skills` `65a39f393687675ce170e6094757de20370365b9`
- `typesafe-ai/typesafe-sdk-python` `f078f1e208a0d885154dc758344ae4fce77ac168`
- `typesafe-ai/typesafe-sdk-js` `66880ccded6cb642dc1809620c2b108c33730214`
- `typesafe-ai/n8n-nodes-typesafe-ai` `c12537bbd9ed7159b7bbe23678ca128c7b2fb52b`
- `typesafe-ai/WorkflowEvals` `0ac3b8ad845429f0d8e064ecfb2430a47c5a25cb`
- `codejunkie99/keel` `50b1a6bb0b0ef3e6802364bb18da1426b547bf9a` (0.2.0 publish commit, not a tag)

File snapshots, `HEAD` at fetch time, only the paths in `SOURCES.md`:

- `stanfordnlp/dspy` `98a4deebcf5dd30c02ea86a5abc46b8ae877111c`
- `langchain-ai/langchain` `884d2d66b4862755f19b2b3eb2241957232b63dd`
- `typesafeainate/dspy-typesafeify` `708f1d109fc9316bdbb5674bdb10cf18b55be137`
- `rajivkuriakose/typesafe-jev-examples` `824972389943a5bf1a351c0f0c846e43868e542f`
- `iroy2000/langgraph-jev` `5e0f8285e8719903954fe851e6154e75ad3efb20`
- `saksham-malhotra-27/jev-relevance` `1534620fa62860b2a953ab790cd1539b5c639a8d`
- `Stumble/jev-go` `a475dc925ba68602be93f4478e1381cf5ec27ee4`
- `sawzhang/jev-demo` `6a059255f65fd368cdd252b6fb85087a94cca1d7`
- `iamaamir/system-one` `c7f6b7e48886824e8769ad87c014bb5a8fdf2508`
- `arunav25/jev-mcp` `dcd5e5feca6167c2f4ae7b4ffd4c40ed14e99cc7`
- `volcengine/OpenViking` `b597acc1b9c4889d57d376bd2e33fbea7ee7e924`
- `bytedance/deer-flow` `f840e843d3e2db1485cb65ceae73a5525aa80193`
- `GhalebDweikat/winnow` `7fe08546e8b9d42f7660a45777f360cfecd3b0e7`
- `langchain4j/langchain4j` `1613ff57a3d28426cdda10bbb45c46bcf15a92d4`
- `Effect-TS/effect` `962647b6a16000f882e6999f001c513a8cccc711`
- `atliq/jev-ai-use-cases` `f8ebee950a1f919b7d7d7c171686e5a42aa8f04d`
- `jaredpalmer/kev` `952ce9d053f6c958d1447c57c36cc9cb3369aef4`

## TypeSafe org repos not cloned

The org had 11 public repos. These five were not cloned:

- `typesafe-ai/vllm`. Fork of a serving engine. About 52 MB. Not an SDK, cookbook, or example.
- `typesafe-ai/LLaDA`. Fork of a diffusion-model implementation. About 20 MB. Not an SDK, cookbook, or example.
- `typesafe-ai/pulumi-clickhouse`. Fork of a Pulumi provider. Not an SDK, cookbook, or example.
- `typesafe-ai/daggerverse`. Inspected through the contents API. Root is Dagger modules for ruff, uv, deptry, zizmor, twingate, and github. No System One example. Not cloned.
- `typesafe-ai/typesafe-ai.github.io`. Inspected through the contents API. Root is `index.html` and `logo.svg`. Not cloned.

There is no public cookbook repo. Cookbook markdown was fetched from `https://docs.typesafe.ai` into `trees/docs.typesafe.ai/`. SDK generated interface pages linked from `llms.txt` under `/sdk/*/api/interfaces/` and `/sdk/*/api/type-aliases/` were not fetched.

`https://api.typesafe.ai/openapi.json` was not fetched. The Python SDK already vendors the generated models and names that URL in a comment.

## Keel files not kept

The 0.2.0 tree was checked out. It is about 14 MB and 441 files, so the whole snapshot was kept except the files below. It was not pruned down to only the decision crates.

`main` (`5cef4569e7f850b3a85dc998cc64c64e944c80a0`) was fetched as a commit object for the diff and was not checked out. Not copied from `main`:

- `crates/engine/src/decision_log.rs` (added after 0.2.0)
- `crates/ui/src/agent_graph.rs`
- the rest of the post-0.2.0 app delta (readme, licenses moved under `licenses/`, extras layout, icon move)

`decision_mode.rs`, `jev_routing.rs`, and `crates/jev-core/src/lib.rs` match `main`.

Deleted from the 0.2.0 working tree because they embed key-shaped fixture strings. They are still in commit `50b1a6bb`. They are not live credentials. They were not copied forward:

- `crates/engine/tests/m5c_accounts_uploads_titles.rs`
- `crates/dsh/credentials/tests/credentials.rs`
- `crates/dsh/credentials-local/tests/local.rs`
- `crates/dsh/llm/tests/llm.rs`
- `crates/dsh/settings/tests/redact.rs`
- `crates/dsh/settings/tests/settings.rs`

Prefix checks that only contain the characters `sk-` as a detector, in `computer_use.rs` and `crates/proto/src/entities.rs`, were left. They do not contain a key value.

## Integration files deliberately not downloaded

- `stanfordnlp/dspy`: the rest of the library, docs, and tests. Not downloaded: `tests/predict/test_decision_live.py` (live test, not a saved response).
- `langchain-ai/langchain`: the monorepo outside `libs/partners/typesafe`, plus that package's `uv.lock`, Makefile, and scripts.
- `typesafeainate/dspy-typesafeify`: the vendored DSPy tree. Only `typesafe_dspy` and the ticket-triage example were kept. `benchmark.svg` was not downloaded.
- `rajivkuriakose/typesafe-jev-examples`: nothing else was in the small tree that was skipped except files not in the list in `SOURCES.md`.
- `Stumble/jev-go`: `cmd/jev/`, `retry.go`, `errors.go`, `validation_internal_test.go`, `AGENTS.md`. `vercel.go` and `vercel_test.go` were kept.
- `sawzhang/jev-demo`: `demo/05_benchmark.py`, `demo/06_codex_file_selection.py`, `demo/07_codex_context_ab.py`, and `docs/01` through `docs/06`. Those docs restate concepts. The README and the four call demos were kept.
- `iamaamir/system-one`: Pi extension, benches, Reflex fixtures, and `system-one-core/src/providers/mock.ts`.
- `arunav25/jev-mcp`: eval harness files other than `eval/adapters/jev.js`, and tests other than `test/client.test.js`.
- `volcengine/OpenViking`: every file except `jev_rerank.py`.
- `bytedance/deer-flow`: the harness outside `typesafe/`, and inside it `AGENTS.md` and `errors.py`. Consumer question strings such as `risky_tool_call` were not in the saved files.
- `GhalebDweikat/winnow`: the sidecar except `judge.py`, `questions.py`, and `demo.py`.
- `langchain4j/langchain4j`: the rest of the monorepo, including `TypeSafeMapper.java`, `TypeSafeAnswer.java`, `TypeSafeUsage.java`, and `TypeSafeDecisionModelSelfHostedIT.java`.
- `Effect-TS/effect`: `packages/ai/typesafe/src/internal/`, `TypeSafeConfig.ts`, `CHANGELOG.md`, and `typetest/`.
- `jaredpalmer/kev`: eval JSONL, experiments, playground, README, and every file except `kev/api.py` and `kev/serve.py`.
- `sawzhang/jev-demo` `results/` other than `BENCHMARK.md`.

## Seen and not copied

Code search returned these. They were not opened far enough to prove a request body, or a glance showed they were not the call this part needed. They are not in the tree:

- `chunxiaoxx/nautilus-compass` imports `SystemOneAdapterClient`. Not copied. The official adapter is already cloned.
- `PostHog/posthog` paths `posthog/llm/system_one.py` and `posthog/egress/typesafe/client.py`. Not opened. Not copied.
- `unslothai/unsloth` `studio/backend/core/systemone/`. Not copied.
- `NandhaKishorM/laya`, `JustVugg/colibri`, `jaredpalmer/kev` beyond the two files above, `sgl-project/sglang` `/v1/decisions` server. The sglang route is a local decisions server name collision risk. Not copied.
- `Human-Agent-Society/reef`, `maximhq/bifrost`, `maziyarpanahi/openmed`, `YaoApp/yao`. Their `/v1/decisions` hits were not shown to be TypeSafe question bodies. Not copied.
- `sethbang/venice-py` `client.decisions.create`. Not shown to be TypeSafe. Not copied.
- Awesome-list repos (`kydlikebtc/awesome-jev`, `BeatAPI/awesome-jev`, `logicrw/awesome-jev-projects`, `walidboulanouar/awesome-jev-use-cases`) cite the adapter. They do not contain the call. Not copied.
- `TianyuCodings/NanoJev`, `Zefan-Cai/Open-Jev`, `daseinlabs/open-jev` discuss the confidence formula. The formula source is the official adapter. Not copied.
- Gists: the code search used here did not return a gist with a `system_one` or decisions body.

`atliq/jev-ai-use-cases` was copied (`README.md`, `jev_decision_guide.ipynb`) and then not used as a primary example, because the notebook was not opened line by line for a request body. It is in the tree if a later pass needs it.

## Secrets

No live key was found. Empty placeholders in `typesafe_dspy_ticket_triage/.env.example` were kept. Test stubs such as `apiKey: "k"` and `Bearer test-key` are in unit tests and are not credentials. The Keel files listed above were the ones removed.
