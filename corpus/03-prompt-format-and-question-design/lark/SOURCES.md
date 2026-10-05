# Sources

Fetched and read on 2026-10-01. No live call was sent to TypeSafe, OpenRouter, or any third-party host. Official TypeSafe quotes in `FORMAT-RULES.md` are from the parent snapshot `corpus/01-primary-typesafe/`. That tree was not copied here, and docs.typesafe.ai was not re-fetched.

A normal HTTP fetch was used first. The OpenRouter model HTML came back as a script shell (pulse placeholders). A browser then read the rendered page. Firecrawl was not used.

SHAs are the git objects named below. A "repo HEAD" SHA is the default branch at fetch time, which can be later than the commit that last edited one file.

## Saved

### Will Kelly, jev-evaluation

- URL: https://github.com/WillKelly/jev-evaluation
- Local clone already on disk: `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/originals/github/WillKelly-jev-evaluation`
- Commit: `d80f375621ad4b9306c6dff6941242925d7e2386` (2026-09-21, "Do not mistake a closed keep-alive socket for backpressure")
- Saved into this workspace, not the whole clone. Plots, raw logs, and generators were left in the original clone. The prompting guide and the notes the rules cite are here:
  - `captures/willkelly/PROMPTING.md`
  - `captures/willkelly/README.md`
  - `captures/willkelly/jev-evaluation-plan.md`
  - `captures/willkelly/COMMIT.txt`
  - `captures/willkelly/runs/full-20260919/report.md`
  - `captures/willkelly/runs/full-20260919/run_meta.json` (`api_url` `https://api.typesafe.ai/v1/systemone`, `model_alias` `jev-latest`, `run_id` `full-20260919`)
  - `captures/willkelly/runs/guide-demos/README.md` and the live-measurement JSON in that directory (`guide.json`, `abst.json`, `conf.json`, `ctx.json`, `cal.json`, `encodings.json`, `ticket-binding.json`, `semantic-grep.json`)
- Why: thirteen measured rules, and the report rows the numbers come from. `position_bias.json` is cited by the guide and is not in the clone's `runs/full-20260919/` listing that was copied. The 0.0% order figures are taken from `PROMPTING.md`, which the README says `tools/verify_citations.py` checks. This turn did not re-run that tool.

### nexibeo, jev-cookbook

- URL: https://github.com/nexibeo/jev-cookbook
- Guide URL: https://raw.githubusercontent.com/nexibeo/jev-cookbook/main/docs/GUIDE.md
- Commit: `3e0207dfcbab0043ef317df73ddc2343a094ef9c` (2026-09-26, "Link Jev Browser Control from the top of the README")
- Saved: `captures/nexibeo/GUIDE.md`, `captures/nexibeo/COMMIT.txt`, and a depth-1 clone at `captures/nexibeo/repo/` (recipes, `lib/jev.mjs`, results, README).
- Why: OpenRouter request bodies, the tilde in `~typesafe/jev-latest`, and the instruction rules. This is an OpenRouter guide. It is not the TypeSafe API. The client posts to `https://openrouter.ai/api/alpha/decisions`.

### featherless-ai, simple-jev prompt spec

- URL: https://raw.githubusercontent.com/featherless-ai/simple-jev/main/common/PROMPT_STRUCTURE_V1.md
- File commit: `5686b217dd0330b81b3325a64c8ace319017f8a2` (2026-09-24, "Add model-aware prompt defaults, quick search, and classifier limits")
- Repo HEAD at fetch: `12a96cae1741ef42cd630d25e8050c1329746f67` (2026-10-01). That merge is not about this file. `captures/featherless/COMMIT.txt` records HEAD. The file-specific SHA is the one in `FORMAT-RULES.md` section 8.
- Saved: `captures/featherless/PROMPT_STRUCTURE_V1.md`, with a filing comment at the top. The upstream text follows that comment and was not cut.
- Why it is filed this way: it is a spec for turning Jev-shaped input into an ordinary language-model prompt. It is not a TypeSafe document.

### Victor Dibia

- Saved: https://victordibia.com/explainers/jev/ as `captures/victordibia/jev.html` and extracted text `captures/victordibia/jev.txt`.
- Page date on the explainer: updated 2026-09-24. Title: "How Jev works: calibrated decision models."
- Other Jev page found: the explainers index https://victordibia.com/explainers/ links this one page and no second Jev explainer. His newsletter archive links the same piece. CV, year-in-review, projects, GRPO, and MCP pages are not about Jev and were not saved.
- Why: mechanism and his own Qwen scoring measurements. He does not document TypeSafe's HTTP body. Option-letter results in that page are about models he trained, not about `api.typesafe.ai`.

### Made with Jev

- Directory saved, not treated as a substitute for the pages: https://madewithjev.com/resources as `captures/madewithjev/resources.html`. The page calls itself a library of guides. It is a ledger.
- Guides index: https://madewithjev.com/guides as `captures/madewithjev/guides.html`.
- Pages opened because they teach format, structure, or output shape:
  - https://madewithjev.com/what-is-jev — `what-is-jev.html`, `what-is-jev.txt`. The "on one page" infographic is an anchor on this page (`/what-is-jev#infographic`). The HTML is the page; the image asset was not saved separately.
  - https://madewithjev.com/what-is-jev-engineering — `what-is-jev-engineering.html`, `what-is-jev-engineering.txt`. The engineering "on one page" anchor is `/what-is-jev-engineering#infographic`.
  - https://madewithjev.com/how-to-use-jev — `how-to-use-jev.html`, `how-to-use-jev.txt`. Request and response shape, and the confidence slogan.
  - https://madewithjev.com/jev-engineering — `jev-engineering.html`. Reading list. The 10-step slogans quoted in FORMAT-RULES are the ones this page and the engineering page repeat, not a separate fetch of each X article.
  - https://madewithjev.com/jev-as-a-judge — `jev-as-a-judge.html`, `jev-as-a-judge.txt`. Atomic questions, evidence in state, verdict not in state.
  - https://madewithjev.com/jev-agentic-harness — `jev-agentic-harness.html`. Filter illegal options in code; abstention as a real option.

### OpenRouter

- Hub: https://openrouter.ai/docs/guides/community/jev.md — `captures/openrouter/jev.md`
- Tutorial: https://openrouter.ai/docs/guides/community/jev-tutorial.md — `captures/openrouter/jev-tutorial.md`
- Decisions schema: https://openrouter.ai/docs/api/api-reference/alphadecisions/submit-a-decisions-questions-and-answers-request.md — `captures/openrouter/decisions-api.md`
- System One SDK path: https://openrouter.ai/docs/guides/community/typesafe-sdk.md — `captures/openrouter/typesafe-sdk.md`
- Model page HTML (script shell): https://openrouter.ai/typesafe/jev-1.13 — `captures/openrouter/model-page.html`
- Rendered text note, after a browser read: `captures/openrouter/model-page-rendered.txt`. Visible card: `typesafe/jev-1.13`, `$0.042 / $0` per 1M, CONTEXT 32K. The FAQ question "What is the context length of Jev 1.13?" was on the page and was not expanded.
- Catalog JSON: https://openrouter.ai/api/v1/models?output_modalities=decisions — `captures/openrouter/models-decisions.json`. `typesafe/jev-1.13` and `~typesafe/jev-latest` both have `context_length` 32000. The same payload also lists other decision models, including `liquid/d1`. Those are not Jev and are not used as Jev rules.
- Direct GETs of `https://openrouter.ai/api/v1/models/typesafe/jev-1.13` and `https://openrouter.ai/api/v1/models/~typesafe/jev-latest` returned 404. The list filter above is the catalog capture that worked.

### Request-shape conflicts

- https://thejevai.com/docs — `captures/conflicts/thejevai-docs.html`, `thejevai-docs.txt`. Third-party host `POST https://thejevai.com/v1/systemone`, model string on this page `jev-latest`. Not TypeSafe.
- https://thejevai.com/blog/jev-ai-introduction — `thejevai-blog-introduction.html`, `.txt`. Same host, model string `typesafe/jev-1.13`.
- https://thejevai.com/jev-model — `thejevai-jev-model.html`, `.txt`. Sample choice uses `options`, not `criteria`.
- https://github.com/jev-ai README — `github-jev-ai-README.md` (and the HTML org page `github-jev-ai.html`). States it is not the official product site. Shows `thejevai.com` and `typesafe/jev-1.13`.
- https://jevmodel.org/docs/ — `jevmodel-docs.html`, `.txt`. Different host and tighter limits (8 questions, 8,000 characters, 2–20 options).
- https://jevtypesafeai.com/jev/api — `jevtypesafeai-api.html`, `.txt`. Hosted path `POST https://jevtypesafeai.com/api/v1/decide`, distinct from the official URL the page also prints.
- https://jevtypesafeai.com/how-to-use — `jevtypesafeai-how-to-use.html`, `.txt`. Shows the official TypeSafe curl and, elsewhere, the hosted door.
- https://jev.pro/access/jev-on-typesafe — `jev-pro-typesafe.html`. Third-party note dated 2026-09-21. Tells you not to send `typesafe/jev-1.13` or `typesafe-ai/jev` to `api.typesafe.ai`. Vercel's own docs were not opened, so the Vercel id is unverified beyond this page.

### Other format guides saved whole

- https://raw.githubusercontent.com/altryne/jevify/main/references/question-design.md — `captures/other-guides/altryne-question-design.md`
- https://raw.githubusercontent.com/altryne/jevify/main/assets/example-requests.json — `captures/other-guides/altryne-example-requests.json`. Proposed TypeSafe HTTP bodies. The question-design page says none has recorded model output.
- Repo HEAD when fetched: `11f36f8d548cf5020a20e5eb548f21c3d7181a17` (2026-09-26). `captures/other-guides/altryne-COMMIT.txt`. That SHA is the branch HEAD, not a separate blame of the markdown file.
- https://raw.githubusercontent.com/dbreunig/building-with-jev-skill/main/skills/jev/SKILL.md — `captures/other-guides/dbreunig-SKILL.md`
- README: `captures/other-guides/dbreunig-README.md`
- Commit on `main` when fetched: `04fe3666c6b8b8abfec1271c0e581c823a181f6d` (2026-09-17, "Add the jev skill with plugin and marketplace manifests"). `captures/other-guides/dbreunig-COMMIT.txt`.
- A first fetch of `.../SKILL.md` at the repo root and on `master` returned 404. The file lives at `skills/jev/SKILL.md`.

## Rejected or not opened

These looked promising in search. They were not saved, for the reason given. A search snippet is not a capture.

- Made with Jev resource cards that are launch clips, "WTF is Jev", SEO workflow lists, marketing posts, and translations of the same 10-step thread (`/resources/wtf-is-jev-and-9-things-people-are`, `/resources/eight-seo-workflows-for-jev`, `/resources/jev-is-insane-for-marketing`, the compaction-plugin translations, the "explained in 3 minutes" video cards, and the rest of that directory). Reason: the mission says a directory is a ledger and to skip launch-hype listicles. The directory HTML is saved. The cards were not opened one by one.
- https://madewithjev.com/resources/quickstart-state-questions-typed-answers . Reason: the search result is a card that points at docs.typesafe.ai, not an independent format page. The official quickstart is already in the corpus.
- https://madewithjev.com/resources/full-jev-tutorial and https://madewithjev.com/resources/jev-full-tutorial . Reason: search text says they are video cards (Moritz, promptwarrior), not a written request schema.
- https://openrouter.ai/docs/cookbook/building-agents/gate-tool-calls-with-jev and the other cookbooks linked from `jev.md` (cascade, classification, Reddit comments, permission prompts). Reason: not opened. The request schema used for the comparison is the Decisions reference that was saved. These pages are not cited as format rules.
- https://systemonemodels.org/integrations/openrouter/ and https://systemonemodels.org/models/jev/ . Reason: search snippets restate OpenRouter and TypeSafe. The OpenRouter docs themselves were saved. The pages were not opened, so they are not quoted.
- https://dryhurst.io/articles/jev-openrouter-decisions-api/ and https://jevaiguide.com/channels/openrouter/ . Reason: same. Snippets match the OpenRouter docs already saved. Pages not opened.
- https://github.com/sebastianbugal/jev/blob/main/jev/reference/decisions-api.md . Reason: snippet is a community restatement of `POST /api/alpha/decisions`. The OpenRouter schema was saved instead. Page not opened.
- https://www.ayautomate.com/blog/how-to-use-jev-guide and https://toolscout.ai/news/how-to-use-jev . Reason: snippets restate the official three-field body and the jaggedness habits (one claim, no double negative, trim state). Pages not opened, so they are not quoted.
- https://raw.githubusercontent.com/yzfly/awesome-jev-zh/master/docs/quickstart.md . Reason: search snippet is a Chinese restatement of the official SDK shapes. Not saved.
- https://academy.codearia.com/en/articles/jev-typesafe-system-one-model , https://cloudfirstconsulting.com/insights/what-is-jev-typesafe-system-one , https://jevals.com/what-is-jev/ , https://ai.codigital.co.jp/en/guides/jev-system-one-model/ , https://atomicbot.ai/blog/what-is-jev , https://blueorange.digital/blog/jev-system-one-model-explained/ . Reason: launch explainers. Snippets show the official host or no request body. Not opened. Their rate-limit figures are not used. The corpus models page and the guides that were opened already disagree on rate limits, and that disagreement is recorded from those opened pages only.
- Vercel documentation for `typesafe-ai/jev`. Reason: not found in the fetches above and not opened. The string appears only as jev.pro's warning.
- `GET https://openrouter.ai/api/v1/models/typesafe/jev-1.13` and the tilde alias URL. Reason: HTTP 404. The list endpoint was saved instead.
- Featherless repo files other than `PROMPT_STRUCTURE_V1.md`. Reason: the mission names that file. The rest of simple-jev was not cloned.

## Official pages read, not copied

Read from `corpus/01-primary-typesafe/` when a third-party sentence needed the official rule next to it:

- `api.md`, `models.md`, `LLMS-INDEX.txt`
- `concepts/state.md`
- `primitives.md`, `primitives/choice.md`, `primitives/score.md`
- `confidence.md`
- `model-jaggedness/jev-1.13.md`
- `agent-skill.md`, `official-skill/SKILL.md`
- `sdk/python/usage.md`, `sdk/javascript.md`, `sdk/javascript/api/interfaces/SystemOneResult.md`

Not read end to end, and therefore not quoted beyond a line that was opened: `primitives/advanced.md`, `primitives/noul.md`, `concepts/how-to-build-with-system-one.md`, the cookbooks. The parallel-questions "12.2x / 10.0x" figure is taken from the index line, not from a re-read of the cookbook body.
