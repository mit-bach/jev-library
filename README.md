# JEV library

A local archive of source material about Jev, for agents that will build with it. Snapshot date: 2026-10-01. The public copy is https://github.com/mit-bach/jev-library. Upstream licenses stay with the copied trees. Read `NOTICE.md`.

Jev is TypeSafe AI's first System One model. Official docs say you send a `state` and typed `questions`, and the model returns structured answers with probabilities. It does not write text, write code, or replace the LLM inside a coding agent. The official endpoint in the docs snapshot is `POST https://api.typesafe.ai/v1/systemone`. The current alias `jev-latest` points at `jev-1.13.0`. Input is text only. Price on the models page is $0.042 per million input tokens, output free. Context is 64k tokens per request, and 32k for the state plus the longest question.

Read this file, then `CATALOG.md`, then the grade you need. Do not treat a community guide as the API contract.

## Grades

- **Official.** Pages under `corpus/01-primary-typesafe/`, fetched from `https://docs.typesafe.ai/*.md` on 2026-10-01. Index: `corpus/01-primary-typesafe/LLMS-INDEX.txt`. Some of those files start with a long Mintlify compressor function. The prose after that function is the document.
- **Official code.** `corpus/01-primary-typesafe/official-skill/SKILL.md` is TypeSafe's agent skill at commit `65a39f393687675ce170e6094757de20370365b9` (tag text in the clone: Release v0.5.7, 2026-09-12). `corpus/01-primary-typesafe/official-adapter/confidence_metrics.py` is from `typesafe-ai/system-one-adapter-python` commit `e1d4cc938204b22fc5a3c3aca7044072fe3f712d` (Release v0.2.1, 2026-09-22). Full clones live in `originals/github/`.
- **Study synthesis.** `corpus/02-creator-and-field-guides/`. The PDF the operator supplied is a September 2026 compilation of design notes attributed to Diogo Almeida. Its cover says it is not affiliated with or endorsed by TypeSafe. Read `PROVENANCE.md` before you quote it.
- **Third-party measured or practical.** `corpus/03-prompt-format-and-question-design/third-party/`. Will Kelly's prompting guide is an experiment writeup against `jev-1.13.0`, not a TypeSafe spec. The nexibeo cookbook describes OpenRouter's decisions endpoint, which is a different host and model string from TypeSafe's HTTP API. The Valyu DEV guide is a community practical guide.
- **Cards and leads.** `corpus/03-prompt-format-and-question-design/madewithjev/` and `corpus/06-longform-discourse/madewithjev-resources-urls.txt` are index pages. They point at the real essays. The essays that were fetched in full are named in `CATALOG.md`.
- **Raw fetches.** `originals/` holds the untouched downloads: the docs dump, HTML pages, the PDF, and git clones.

## What an agent should read first

1. `corpus/01-primary-typesafe/contract-map/CONTRACT.md` — reed's map of the 2026-10-01 docs. Every rule points at a local file. The pages still win if they disagree with the map.
2. `corpus/01-primary-typesafe/introduction/coding-agents.md` — Jev is not the coding model.
3. `corpus/01-primary-typesafe/official-skill/SKILL.md` — how to design the questions.
4. `corpus/01-primary-typesafe/primitives.md` — Choice, Score, Noul. Skip the compressor blob at the top.
5. `corpus/01-primary-typesafe/api.md` and `models.md` — request shape, limits, aliases.
6. `corpus/01-primary-typesafe/model-jaggedness/jev-1.13.md` — known failure modes and what to do instead.
7. `corpus/01-primary-typesafe/confidence.md` plus `official-adapter/confidence_metrics.py` — confidence is a summary of the distribution, not a second opinion about truth.
8. The cookbook closest to the job, under `corpus/01-primary-typesafe/cookbooks/`.
9. `corpus/03-prompt-format-and-question-design/lark/FORMAT-RULES.md` — which host, which model string, and where third-party guides disagree with the docs.
10. `corpus/06-longform-discourse/wren/DISCOURSE.md`, then the captures it names. A number there is the author's claim.
11. The PDF in `corpus/02-creator-and-field-guides/` and Will Kelly's prompting guide.

## Conflicts already on disk

TypeSafe docs: `POST https://api.typesafe.ai/v1/systemone`, model `jev-latest` or `jev-1.13.0`. Context on the models page: 64k tokens per request, and 32k for the state plus the longest question.

OpenRouter Decisions, from OpenRouter's own schema saved by lark: `POST https://openrouter.ai/api/alpha/decisions`, model `typesafe/jev-1.13` or `~typesafe/jev-latest`. Nexibeo, commit `3e0207df`, records that `typesafe/jev-latest` without the tilde does not exist on that host. OpenRouter's rendered model page on 2026-10-01 shows a 32K context. Do not merge that figure with TypeSafe's 64k/32k split.

`thejevai.com`, `jevmodel.org`, and `jevtypesafeai.com` are third-party doors. One thejevai sample sends `options` instead of `criteria`. They are not TypeSafe's endpoint. The comparison is `corpus/03-prompt-format-and-question-design/lark/FORMAT-RULES.md`.

Question ids are not sent to the model. Write the whole question in `instructions`. A Noul near 0.5 means yes and no are about equally likely. It does not mean a medium score. Questions in one request do not see each other's answers.

## Engineering desk

`engineering/` is the eng-orch workspace for the 2026-10-01 source archive. It is not part of the corpus. Five source researchers were spawned on 2026-10-01. All five have stopped, and their maps are copied into the corpus. Missions remain in `engineering/prompts/`. The workspace originals remain under `engineering/engineers/<id>/`. Do not resume reed, wren, lark, heron, or cobble unless the operator asks.

`Deployment/` does not exist.

## Debug and test shelf

`debug-test-frontends/` is a separate 2026-10-02 collection. It holds playgrounds, dashboards, browser-test loops, and eval harnesses for debugging a system that uses Jev. Read `debug-test-frontends/README.md`. Its desk is `debug-test-frontends/engineering/`. It is not part of the 2026-10-01 corpus.

`anthropic-harness/FINDINGS.md` is a 2026-10-02 note on projects that run Jev beside Claude. It separates the official skill, community MCP servers, and host-owned hooks. It is not part of the 2026-10-01 corpus.

## What this snapshot does not claim

It does not include a live API key, a live call, or a measured result from this machine. Numbers in community posts are the author's numbers. Archer Hume's architecture essay is a reconstruction. Its HTML is in `originals/pages/`. The evidence JSON is in `corpus/04-architecture-and-measurement/archerhume/`. Heron's index is `corpus/04-architecture-and-measurement/heron/EVIDENCE-INDEX.md`.
