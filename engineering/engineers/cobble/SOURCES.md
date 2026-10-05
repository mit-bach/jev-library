# Sources

Snapshot date: 2026-10-01. No call was made to `api.typesafe.ai`, OpenRouter, or Vercel. No API key was written into this workspace.

An existing clone of the adapter at `GROK-ARCHIVES/JEV-library/originals/github/system-one-adapter-python` was already at `e1d4cc938204b22fc5a3c3aca7044072fe3f712d`. A fresh shallow clone into this workspace matched that SHA. The skills clone under `originals/github/typesafe-ai-skills` matched `65a39f393687675ce170e6094757de20370365b9`. The trees below are the copies this workspace relies on.

## Official git trees

Shallow clone, `--depth 1`, default branch, into `trees/`.

| Repo | SHA | Commit date and subject | Tree |
| --- | --- | --- | --- |
| https://github.com/typesafe-ai/system-one-adapter-python | `e1d4cc938204b22fc5a3c3aca7044072fe3f712d` | 2026-09-22, Release v0.2.1 | `trees/system-one-adapter-python` |
| https://github.com/typesafe-ai/skills | `65a39f393687675ce170e6094757de20370365b9` | 2026-09-12, Release v0.5.7 | `trees/skills` |
| https://github.com/typesafe-ai/typesafe-sdk-python | `f078f1e208a0d885154dc758344ae4fce77ac168` | 2026-09-26, Release v0.7.2 | `trees/typesafe-sdk-python` |
| https://github.com/typesafe-ai/typesafe-sdk-js | `66880ccded6cb642dc1809620c2b108c33730214` | 2026-09-15, Release v0.6.0 | `trees/typesafe-sdk-js` |
| https://github.com/typesafe-ai/n8n-nodes-typesafe-ai | `c12537bbd9ed7159b7bbe23678ca128c7b2fb52b` | 2026-09-28, feat: Add TypeSafe AI node (#1) | `trees/n8n-nodes-typesafe-ai` |
| https://github.com/typesafe-ai/WorkflowEvals | `0ac3b8ad845429f0d8e064ecfb2430a47c5a25cb` | 2026-09-29, init | `trees/WorkflowEvals` |

The org listed 11 public repos on 2026-10-01. The other five are in `STOP.md`. There is no cookbook repository. Cookbooks are on `docs.typesafe.ai`.

## Keel 0.2.0

https://github.com/codejunkie99/keel

- Fetched commit: `50b1a6bb0b0ef3e6802364bb18da1426b547bf9a`
- Commit date: 2026-09-23
- Subject: Publish Keel 0.2.0 source and documentation
- The repo has no tags and no GitHub releases. This commit message is the 0.2.0 mark. `docs/archive/article-sources-0.2.0.md` and `docs/archive/build-report-0.2.0.md` exist on later `main` as renames. On this commit they are still `docs/article-sources.md` and `docs/build-report.md`.
- `main` at fetch time: `5cef4569e7f850b3a85dc998cc64c64e944c80a0`, 2026-09-25, "Merge pull request #3 from codejunkie99/feat/agent-graph-decision-export". That is later than 0.2.0, not an earlier prototype.
- Diff of the decision files from `50b1a6bb` to `5cef4569`: `decision_mode.rs`, `jev_routing.rs`, and `crates/jev-core/src/lib.rs` are unchanged. `docs/decision-architecture.md` changes by one line. `crates/engine/src/decision_log.rs` is added only on `main` and was not copied.
- Tree: `trees/keel`, detached at `50b1a6bb`. Depth 1. Six test files that embed key-shaped fixture strings were deleted from the working tree after checkout. `STOP.md` lists them. `HEAD` is still that commit. The decision files were not edited.

Route selection is `trees/keel/crates/engine/src/jev_routing.rs`. Decision mode is `trees/keel/crates/engine/src/decision_mode.rs`. The HTTP body is built in `trees/keel/crates/jev-core/src/lib.rs` (`request_body`, `MODEL = "jev-1.13.0"`, `ENDPOINT = "https://api.typesafe.ai/v1/systemone"`).

## Docs pages

Fetched with curl on 2026-10-01. No git SHA. Index: `trees/docs.typesafe.ai/llms.txt` from `https://docs.typesafe.ai/llms.txt`.

Saved pages are the introduction, concepts, primitives, confidence, patterns, every cookbook linked from that index, `api.md`, and the Python and JavaScript SDK usage pages. SDK generated interface pages under `/sdk/*/api/interfaces/` were not saved.

Gateway and community pages, also 2026-10-01:

- `trees/pages/openrouter.ai_docs_guides_community_jev-tutorial.md`
- `trees/pages/openrouter.ai_docs_guides_community_jev.md`
- `trees/pages/openrouter.ai_docs_api_alphadecisions_submit.md`
- `trees/pages/vercel.com_docs_ai-gateway_sdks-and-apis_typesafe.md`
- `trees/pages/vercel.com_kb_guide_typesafe-jev-and-ai-sdk.md`

The OpenRouter tutorial page says its printed JSON response was captured from the live API. This workspace did not repeat that call.

## Integration files

These are not full clones. Each directory name ends with the first 12 hex digits of the commit `git ls-remote` returned for `HEAD` on 2026-10-01. Files were downloaded from `raw.githubusercontent.com` at that full SHA.

| Repo | SHA | What was kept |
| --- | --- | --- |
| stanfordnlp/dspy | `98a4deebcf5dd30c02ea86a5abc46b8ae877111c` | `dspy/clients/typesafe.py`, `dspy/adapters/decision.py`, `dspy/adapters/decision_state.py`, `dspy/adapters/types/decision.py`, `dspy/_vendor/lm15/providers/typesafe.py`, the Jev tutorial, `DecisionTypes.md`, and the decision/typesafe tests and two prompt snapshots |
| langchain-ai/langchain | `884d2d66b4862755f19b2b3eb2241957232b63dd` | `libs/partners/typesafe` source, README, pyproject, and the unit tests that assert the wire body. Not `uv.lock` |
| typesafeainate/dspy-typesafeify | `708f1d109fc9316bdbb5674bdb10cf18b55be137` | `typesafe_dspy/`, `tests/typesafe_dspy/test_hybrid.py`, `examples/typesafe_dspy_ticket_triage/` except `benchmark.svg` |
| rajivkuriakose/typesafe-jev-examples | `824972389943a5bf1a351c0f0c846e43868e542f` | README, both examples, `src/jevx/`, tests, `scripts/probe_openrouter.py`, `data/help_center.json`, `docs/HANDOFF.md` |
| iroy2000/langgraph-jev | `5e0f8285e8719903954fe851e6154e75ad3efb20` | README, docs, examples, client, questions, routing, node, models, runnable, and three tests |
| saksham-malhotra-27/jev-relevance | `1534620fa62860b2a953ab790cd1539b5c639a8d` | README, `examples/drop_in.py`, provider, scoring, retriever, strategies, constants, `tests/test_provider.py` |
| Stumble/jev-go | `a475dc925ba68602be93f4478e1381cf5ec27ee4` | README, `client.go`, `client_test.go`, `types.go`, `vercel.go`, `vercel_test.go`, `skills/jev-go/SKILL.md` |
| sawzhang/jev-demo | `6a059255f65fd368cdd252b6fb85087a94cca1d7` | README, demos 01 through 04, `demo/jev_lite.py`, `results/BENCHMARK.md` |
| iamaamir/system-one | `c7f6b7e48886824e8769ad87c014bb5a8fdf2508` | README, HTTP provider, client, questions, responses, `http.test.ts`, four `typesafe-*.json` fixtures |
| arunav25/jev-mcp | `dcd5e5feca6167c2f4ae7b4ffd4c40ed14e99cc7` | README, `src/client.js`, `src/config.js`, `src/tool.js`, `eval/adapters/jev.js`, `test/client.test.js` |
| volcengine/OpenViking | `b597acc1b9c4889d57d376bd2e33fbea7ee7e924` | `openviking/models/rerank/jev_rerank.py` only |
| bytedance/deer-flow | `f840e843d3e2db1485cb65ceae73a5525aa80193` | `backend/packages/harness/deerflow/typesafe/` `client.py`, `connection.py`, `__init__.py`, `validation.py`. Not `AGENTS.md` or `errors.py` |
| GhalebDweikat/winnow | `7fe08546e8b9d42f7660a45777f360cfecd3b0e7` | `sidecar/src/winnow/judge.py`, `questions.py`, `demo.py` |
| langchain4j/langchain4j | `1613ff57a3d28426cdda10bbb45c46bcf15a92d4` | `TypeSafeDecisionModel.java`, `TypeSafeClient.java`, `TypeSafeRequest.java`, `TypeSafeResponse.java`, `TypeSafeQuestion.java`, `TypeSafeDecisionModelTest.java`, `TypeSafeDecisionModelOpenRouterIT.java` |
| Effect-TS/effect | `962647b6a16000f882e6999f001c513a8cccc711` | `packages/ai/typesafe` README, schema, client, decision model, index, and two tests. Not `src/internal/` |
| atliq/jev-ai-use-cases | `f8ebee950a1f919b7d7d7c171686e5a42aa8f04d` | `README.md` and `jev_decision_guide.ipynb`. The repo has four files total |
| jaredpalmer/kev | `952ce9d053f6c958d1447c57c36cc9cb3369aef4` | `kev/api.py` and `kev/serve.py` only. Local compatible server, not a TypeSafe client |

## Recorded response versus everything else

The only TypeSafe HTTP cassette in the official adapter is `trees/system-one-adapter-python/tests/cassettes/test_client_with_live_apis/test_live_typesafe_response_matches_reference_shape.json`. Its `Authorization` header is absent. The other cassettes in that directory are provider LLM calls.

`iamaamir/system-one` README says the `typesafe-*.json` fixtures come from live contract tests against `jev-latest` resolved to `jev-1.13.0`. They are in the snapshot. They were not re-run here.

The OpenRouter tutorial page says its JSON was captured from the live API. It was copied with the page.

Schema `examples=` fields, unit-test stubs, and docs "Example response" blocks that do not say they were captured are labeled as such in `EXAMPLES.md`.

## Searches that found the call sites

GitHub code search on 2026-10-01, through `gh api search/code`:

- `system_one_adapter` found the official adapter, nautilus-compass, winnow, and citation-only repos.
- `repo:stanfordnlp/dspy system_one` found the DSPy client and adapters.
- `org:langchain-ai` plus the path query that returned `libs/partners/typesafe/langchain_typesafe/classifier.py`.
- `"/v1/systemone" language:Python` found LangChain, OpenViking, deer-flow, kev, and others.
- `"/api/alpha/decisions" language:Python` did not return the OpenRouter tutorial. That page was found by web search and then fetched as markdown.
- `ai-gateway.vercel.sh systemone` returned gateway clients. The Vercel docs page was fetched directly.
- A gist-specific result did not appear. `"/v1/systemone" extension:json` returned ordinary repo JSON, not gists. Those hits were not copied.

Repos that only mention the name were not copied. `STOP.md` lists the ones that were seen and left.
