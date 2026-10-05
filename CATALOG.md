# Catalog

Retrieved 2026-10-01 unless a row says otherwise. Paths are relative to this library.

## Official TypeSafe docs

111 markdown pages from `https://docs.typesafe.ai/llms.txt`, saved under `corpus/01-primary-typesafe/` with the same paths. The index copy is `corpus/01-primary-typesafe/LLMS-INDEX.txt`. The full Mintlify dump is `originals/pages/docs.typesafe.ai-llms-full.txt` (906,476 bytes). The launch post HTML is `originals/pages/typesafe-launch-jev.html` (Diogo Almeida, TypeSafe, dated on the page as 15 Sep 2026).

Pages an integration agent actually needs:

| Page | Path |
| --- | --- |
| Introduction | `corpus/01-primary-typesafe/introduction.md` |
| Quick start | `corpus/01-primary-typesafe/introduction/quickstart.md` |
| Coding agents | `corpus/01-primary-typesafe/introduction/coding-agents.md` |
| Machine-learning primer (RLCD) | `corpus/01-primary-typesafe/introduction/machine-learning-primer.md` |
| System One | `corpus/01-primary-typesafe/concepts/system-one.md` |
| State | `corpus/01-primary-typesafe/concepts/state.md` |
| How to build | `corpus/01-primary-typesafe/concepts/how-to-build-with-system-one.md` |
| Primitives | `corpus/01-primary-typesafe/primitives.md` |
| Choice, Score, Noul | `corpus/01-primary-typesafe/primitives/choice.md`, `score.md`, `noul.md` |
| Structured instructions | `corpus/01-primary-typesafe/primitives/advanced.md` |
| Confidence | `corpus/01-primary-typesafe/confidence.md` |
| Patterns | `corpus/01-primary-typesafe/patterns.md` and the four pages under `patterns/` |
| Cookbooks | `corpus/01-primary-typesafe/cookbooks.md` and one file per recipe |
| API | `corpus/01-primary-typesafe/api.md` |
| Models, limits, price | `corpus/01-primary-typesafe/models.md` |
| Jaggedness | `corpus/01-primary-typesafe/model-jaggedness/jev-1.13.md` |
| Agent skill install page | `corpus/01-primary-typesafe/agent-skill.md` |
| Python and JavaScript SDKs | `corpus/01-primary-typesafe/sdk/` |

Reed's contract map, written after `STOP.md`: `corpus/01-primary-typesafe/contract-map/CONTRACT.md`. Ledger: `contract-map/SOURCES.md`. Evals transcript: `contract-map/evals/SITE-TEXT.md`. The workspace original is `engineering/engineers/reed/`.

That map records two facts the docs index does not. The skill repo at `65a39f3` contains `SKILL.md` and `LICENSE` only. There is no `references/` directory, even though the docs page talks about copying reference files. `https://docs.typesafe.ai/migrating-to-v1.md`, named by the skill, returned HTTP 404 on 2026-10-01. The body is `contract-map/evals/migrating-to-v1.response.txt`.

The evals transcript says `193.6x` and `444.6x` are on the TypeSafe homepage and in the launch post. They are not printed on `evals.typesafe.ai`. The overview's mean label for Jev is 67.8%, $0.0004 per case, 0.4 s, tied with the sonnet 5 workflow row on that page. The reference labels are an average of GPT-6 Astra and Claude Fable 5.1 at high thinking.

Official skill body, commit `65a39f3`: `corpus/01-primary-typesafe/official-skill/SKILL.md`.
Choice and Score confidence formulas, commit `e1d4cc9`: `corpus/01-primary-typesafe/official-adapter/confidence_metrics.py`.

Choice confidence in that file, for more than one option, is `(max(p) - 1/K) / (1 - 1/K)` after normalizing. One option returns 1. Score confidence is a different function in the same file. The docs page is the prose. The Python file is the formula.

## Founder-notes PDF

| Item | Path | Grade |
| --- | --- | --- |
| Jev Engineering for Coding Agents | `corpus/02-creator-and-field-guides/Jev-Engineering-for-Coding-Agents.pdf` | Study synthesis. See `PROVENANCE.md`. |
| Text extract | `corpus/02-creator-and-field-guides/Jev-Engineering-for-Coding-Agents.txt` | Same document. |

## Format and prompting

| Item | Path | Grade |
| --- | --- | --- |
| Will Kelly, *A prompting guide for jev* | `corpus/03-prompt-format-and-question-design/third-party/WillKelly-PROMPTING.md` | Third-party experiment. SHA `d80f375621ad4b9306c6dff6941242925d7e2386`, commit date 2026-09-21. Thirteen rules. Report URL is inside the file. |
| Will Kelly README | `corpus/03-prompt-format-and-question-design/third-party/WillKelly-README.md` | Same repo. |
| nexibeo cookbook guide, as of 19 Sep 2026 | `corpus/03-prompt-format-and-question-design/third-party/nexibeo-GUIDE.md` | Third-party. OpenRouter path and the tilde model id. Not the TypeSafe host. |
| Valyu / Prosper Otemuyiwa, DEV, published 2026-09-17 | `corpus/03-prompt-format-and-question-design/third-party/valyu-devto-how-to-use-jev.md` | Third-party practical guide. |
| Lark's format rules, after `STOP.md` | `corpus/03-prompt-format-and-question-design/lark/FORMAT-RULES.md` | Comparison. Official quotes, measured third-party numbers, and author advice are labeled separately. Captures are under `lark/captures/`. |
| Victor Dibia explainer, HTML | `corpus/03-prompt-format-and-question-design/third-party/victordibia-jev.html` | Third-party. HTML, not cleaned. |
| madewithjev card pages | `corpus/03-prompt-format-and-question-design/madewithjev/` | Index cards. Descriptions and outbound X ids. Not the essays themselves. |

## Long posts saved in full

| Item | Path | Grade |
| --- | --- | --- |
| Matt Canham, 21 Sep 2026, "a guide to Jev for the normies" | `corpus/06-longform-discourse/2026-09-21-matthewcanham-2102077098756280413.md` | Community explainer. 1846 likes, 3607 bookmarks at fetch. |
| codila, 18 Sep 2026, 10-step setup playbook | `corpus/06-longform-discourse/2026-09-18-0xCodila-2100984487802708306.md` | Community playbook. Contains a Substack pitch and second-hand product claims. 3401 likes, 8307 bookmarks at fetch. |
| Avid, 23 Sep 2026, keel harness walkthrough | `corpus/06-longform-discourse/2026-09-23-Av1dlive-2102802621664985241.md` | Builder writeup. Operator seed. Repo named in the post: `https://github.com/codejunkie99/keel`. |
| URL list extracted from madewithjev resources | `corpus/06-longform-discourse/madewithjev-resources-urls.txt` | Leads, 157 URLs. |
| Lead list of long posts not yet saved as full text | `corpus/06-longform-discourse/LEADS.md` | Open work. |

## Operator seeds

| URL | Where it went |
| --- | --- |
| `https://x.com/av1dlive/status/2102802621664985241` | Full text in `corpus/06-longform-discourse/2026-09-23-Av1dlive-2102802621664985241.md` |
| `https://drive.google.com/file/d/17h982xvsL3E7b80iGmOCfKp9qTOW9ohv/view` | PDF and text extract in `corpus/02-creator-and-field-guides/` |
| `https://archerhume.com/posts/jevs-architecture-unmasked/?v=3` | HTML only, `originals/pages/archerhume-jevs-architecture-unmasked.html`. Evidence JSON assigned to heron. |
| `https://typesafe.ai/blog/introducing-system-one-models-and-jev` | HTML, `originals/pages/typesafe-launch-jev.html` |

## Measurement data now in the corpus

Eleven Archer Hume JSON files, parsed as JSON, under `corpus/04-architecture-and-measurement/archerhume/`. Heron's index, after `STOP.md`: `corpus/04-architecture-and-measurement/heron/EVIDENCE-INDEX.md`. The essay text is `heron/captures/jevs-architecture-unmasked.md`. Sparse experts stay an inference. The primer and the TechCrunch wording of RLCD are quoted against each other in the index.

Cobble's example catalog, after `STOP.md`: `corpus/05-examples-repos-and-outputs/cobble/EXAMPLES.md`. Trees, including keel at `50b1a6b`, are under `cobble/trees/`.

Keel 0.2.0 docs fetched earlier: `corpus/05-examples-repos-and-outputs/keel-docs/`.
Avid's Jev Engineering manuscript (19 Sep 2026, not the TypeSafe PDF): `corpus/02-creator-and-field-guides/av1dlive-jev-engineering/`.

## Long posts, reading order

Wren's reading order, after `STOP.md`: `corpus/06-longform-discourse/wren/DISCOURSE.md`. Fifty-five captures are in `wren/captures/`. The founder's X account in that set is Diogo Almeida, @CompleteSkeptic. The lab account is @typesafeai.

The launch thread is `wren/captures/2026-09-15-completeskeptic-launch-thread.md`. Edward Irby's risk-agent article is `wren/captures/2026-10-01-edwardirby-risk-agent.md`. Rox's thread and Rox's article are saved separately and do not use the same numbers. John Crown's 30.64% recruiting claim has no benchmark attached. The DSPy office-hours recording and John Kim's YouTube did not yield transcripts.

## Researchers

All five source missions have a `STOP.md`. The maps are copied into the corpus. Do not resume an id unless the operator asks.

- reed — `corpus/01-primary-typesafe/contract-map/`
- lark — `corpus/03-prompt-format-and-question-design/lark/`
- heron — `corpus/04-architecture-and-measurement/heron/`
- cobble — `corpus/05-examples-repos-and-outputs/cobble/`
- wren — `corpus/06-longform-discourse/wren/`

## Debug and test shelf (2026-10-02)

Separate from the source corpus. Read `debug-test-frontends/README.md`, then `debug-test-frontends/QUALITY.md`. The four surveys stopped on 2026-10-02. Their evidence is `debug-test-frontends/surveys/`. Parent clones are `debug-test-frontends/originals/github/`.
