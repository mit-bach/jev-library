# Awesome Jev [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

[Jev](https://docs.typesafe.ai) is TypeSafe's System One model for probability-based yes/no judgments, choices, and scores rather than generated text.

Check permissions and data handling before running a project. Source review is not a runtime test or a security audit.

## Contents

- [Getting Started](#getting-started)
- [Demos](#demos)
- [SDKs and Skills](#sdks-and-skills)
- [Browser and Desktop Tools](#browser-and-desktop-tools)
- [Agent Tools](#agent-tools)
- [Apps and Integrations](#apps-and-integrations)
- [Games and Creative Projects](#games-and-creative-projects)
- [Independent Models](#independent-models)
- [Reading and Research](#reading-and-research)
- [Supporting Drivers](#supporting-drivers)

## Getting Started

Start with the [quick-start example](docs/DIRECTORY.md#20-second-quick-start), then build a [typed classifier](docs/START_HERE.md#build-your-first-typed-classifier), use Jev in an [agent](docs/START_HERE.md#use-jev-in-an-agent), or explore a [local alternative](docs/START_HERE.md#explore-a-local-alternative). The [source notes](docs/REVIEWED.md) record setup, privacy, and evidence limits for the selections below.

## Demos

A few examples to watch before digging into the code. These are creator recordings and publisher previews, not independent benchmarks. Linked previews open the original recording or post.

<!-- demo:ultrafast -->
- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast/blob/main/README.md) - A flight-search recording where Jev chooses browser actions and elements; a separate model writes field text. Browser Use · @gregpr07.

[![Animated flight-search recording from Browser Use; open the creator post](https://raw.githubusercontent.com/browser-use/jev-ultrafast/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/docs/demo.gif)](https://x.com/gregpr07/status/2100411066966749359)

<!-- demo:voice-browser -->
- [Jev Voice Browser](https://github.com/moritzkremb/jev-voice-browser/blob/main/README.md) - Partial speech becomes action and target choices, then Playwright operates the page. Moritz Kremb · @moritzkremb.

[![Still preview of the voice-controlled browser; open the creator video on X](https://pbs.twimg.com/amplify_video_thumb/2100577954338373633/img/tbH43kHpUotE3hzK.jpg)](https://x.com/moritzkremb/status/2100577979021832365)

<!-- demo:align-video -->
- [jev-align](https://github.com/sutro-sh/jev-align/blob/main/README.md) - Label uncertain examples and review proposed classifier or scoring-rubric changes. Sutro. This edits definitions, not model weights.

https://github.com/user-attachments/assets/81650587-e3f1-4655-8213-ed5f6e120e9a

<!-- demo:computer-use -->
- [TypeSafe Computer Use](https://github.com/awlevin/typesafe-computer-use/blob/main/README.md) - A Mac desktop recording where OCR and accessibility observations become action choices. @awlevin. Real use controls the mouse and keyboard and needs desktop permissions.

[![Still preview of native Mac automation; open the creator video on X](https://pbs.twimg.com/amplify_video_thumb/2100262350100246528/img/hRw0xfLBJpNNi3L9.jpg)](https://x.com/awlevin/status/2100262612428894676)

<!-- demo:browser-skill -->
- [Jev Browser Skill](https://github.com/zurfyx/jev-browser-skill/blob/main/README.md) - A Hacker News walkthrough showing observed controls, bounded choices, and local execution in a small reference implementation. zurfyx.

[![Animated Hacker News walkthrough from zurfyx; open the MP4 recording](https://raw.githubusercontent.com/zurfyx/jev-browser-skill/7db9b4cf1cfca82f0742c75054e22cb8089ee908/docs/demo.gif)](https://github.com/zurfyx/jev-browser-skill/blob/main/docs/demo.mp4)

<!-- demo:or-tisco -->
- [tisco](https://github.com/cairodavila/tisco/blob/main/README.md) - Search video transcripts, inspect matches, and approve clip organization. cairodavila · screenshot published by OpenRouter. This is a screenshot, not a video; Jev judges transcripts rather than video pixels.

[![Publisher screenshot of transcript search in tisco; open the OpenRouter showcase post](https://pbs.twimg.com/media/HSxARhBaIAABItD.jpg?name=orig)](https://x.com/OpenRouter/status/2102125798371283444)

More to watch: [Shapeshift's adaptive cards](docs/X_DEMOS.md#shapeshift), [a Rubik's cube coach](docs/X_DEMOS.md#jev-rubiks-coach), [sentence-level reading highlights](docs/X_DEMOS.md#readwithjev), [CLI suggestions](docs/X_DEMOS.md#jevyoumean), [site-search reranking](docs/X_DEMOS.md#jevsearch), and [semantic SQL](docs/X_DEMOS.md#jevql). Each entry links the creator post and records its source and access limits.

The [full creator gallery](docs/DIRECTORY.md#watch-jev-in-action) retains the other videos, images, and attribution. Browse the [X index](docs/X_DEMOS.md), [OpenRouter roundup](docs/OPENROUTER_SHOWCASE.md), or [computer-use comparison](docs/CUA.md) for more examples and limitations.

## SDKs and Skills

- [TypeSafe Python SDK](https://github.com/typesafe-ai/typesafe-sdk-python) - Official Python client with a support-ticket routing example.
- [TypeSafe JavaScript SDK](https://github.com/typesafe-ai/typesafe-sdk-js) - Official JavaScript and TypeScript client.
- [Official TypeSafe Skill](https://github.com/typesafe-ai/skills) - Request-writing guidance for Noul, Choice, and Score questions.
- [Tenbin](https://github.com/simota/tenbin) - MCP server and skill for linting questions, evaluating labeled examples, and choosing thresholds.
- [wellposed](https://github.com/suraj-phanindra/wellposed) - Offline request linter for missing options, broken state references, and question types.
- [jevrs](https://github.com/luizribeiro/jevrs) - Async Rust client with typed answers, derive macros, and native or WASI transports.
- [Jevify](https://github.com/altryne/jevify) - Agent skill for finding places to use Jev and planning comparisons with existing code.
- [Jev Logs](https://github.com/reachjalil/jevlogs) - Scores log entries to decide which need a closer look.
- [Skillbox](https://github.com/kitze/skillbox) - Self-hosted skill library with optional Jev-based recommendations.

## Browser and Desktop Tools

- [Jev Ultrafast](https://github.com/browser-use/jev-ultrafast) - Browser-action and element selection with a separate model for text entry.
- [Jev Voice Browser](https://github.com/moritzkremb/jev-voice-browser) - Voice-controlled Playwright browser that chooses actions from partial speech and page controls.
- [TypeSafe Computer Use](https://github.com/awlevin/typesafe-computer-use) - Mac automation using local OCR and accessibility data, with Jev choosing the next action.
- [Cua Driver + jev-use](https://github.com/trycua/cua) - Python and TypeScript examples where Jev chooses an action, the driver runs it, and code checks the result.
- [Jev Social](https://github.com/socai-io/jev-social) - Bounded social-research loop using Jev choices and socai in the user's Chrome session.
- [Jev Browser Skill](https://github.com/zurfyx/jev-browser-skill) - Small reference for building and executing browser-action choices.
- [Jev Browser](https://github.com/jkudish/jev-browser) - Playwright browser available as an MCP server, CLI, or library.
- [Jev Browser Use](https://github.com/wy-coliney/jev-browser-use) - Skill using an existing Codex browser connection, with Jev choosing clicks and scrolls.
- [Jev Cua](https://github.com/Eronmmer/jev-cua) - Mac automation through Cua Driver, with optional hosted Jev workflow recommendations.
- [jev-bot](https://github.com/stoopid-computers/jev-bot) - Native Mac controls through a JavaScript MCP session, with optional hosted Jev element selection.

## Agent Tools

- [jev-align](https://github.com/sutro-sh/jev-align) - Improves classifier definitions and scoring rubrics using labels and GEPA-proposed edits.
- [Winnow](https://github.com/GhalebDweikat/winnow) - Claude Code context filter that scores tool-output blocks and keeps hidden text locally recallable.
- [Jev-Mem](https://github.com/libingzheren/Jev-Mem) - Research memory system where Jev organizes graph memories and guides retrieval while a separate model writes answers.
- [patdown](https://github.com/tyler-dot-earth/patdown) - Semantic linter that turns Markdown rules into checks and maps flagged evidence to source lines.
- [Oko](https://github.com/bartlomein/oko) - Code-search CLI and MCP server with local candidate retrieval and optional hosted Jev ranking.
- [jgrep](https://github.com/kyu1204/jgrep) - Semantic matching over code chunks, diff hunks, and CSV rows, published on npm as jevgrep.
- [SemDecide](https://github.com/sharziki/semdecide) - Unix CLI for predicates, choices, scores, JSONL filtering, and CI-friendly exit codes.
- [Leanest](https://github.com/baronunread/leanest) - Playwright and Vitest test selector with an optional Jev judge and run-tests fallback on uncertainty.
- [Supercov](https://github.com/supercorp-ai/supercov) - Coverage, security, and code-quality checks where Jev evaluates source files while test coverage stays local.
- [Foreman](https://github.com/thruwire/foreman) - Checks coding-agent progress and decides when intervention may be needed.
- [jev-belay](https://github.com/valentynkit/jev-belay) - Claude Code Stop hook that checks local run evidence before judging an unverified completion claim.
- [jev-claude-statusline](https://github.com/kevnk/jev-claude-statusline) - Claude Code hooks that estimate task progress with Jev and cache it for a status-line display.
- [Jev MCP](https://github.com/jkudish/jev-mcp) - Tools for checking claims against evidence, screening content, and ranking candidates.
- [TypeSafe MCP](https://github.com/itsmostafa/typesafe-mcp) - Go MCP server for making Jev requests from coding agents.
- [jev_search](https://github.com/caio0452/jev_search) - Experimental file search that ranks candidates by keyword and checks passages with Jev.

## Apps and Integrations

- [DocJev](https://github.com/jerryjliu/docjev) - Document classification and packet-boundary detection after local parsing or optional cloud OCR.
- [tisco](https://github.com/cairodavila/tisco) - Video-transcript search with previews of proposed clip moves and renames for approval.
- [neo4jev](https://github.com/jexp/neo4jev) - Neo4j graph exploration using edge choices and goal checks inside a bounded beam search.
- [MinusPodJev](https://github.com/ttlequals0/MinusPodJev) - Podcast ad-detection adapter that scores transcript segments and assembles ad spans in code.
- [llm-typesafe](https://github.com/simonw/llm-typesafe) - Jev access from the LLM command line or Python, including stdin, templates, and async calls.
- [Home Assistant Jev](https://github.com/AboveColin/HA-Jev) - Typed decisions for Home Assistant entities and automations.
- [nospace](https://github.com/riesvile/nospace) - Experimental word-spacing interface where Jev chooses splits and a separate model handles spelling.
- [Vibe Domain](https://obstudio.org/tools/vibe-domain) - Domain-name ranking with a no-key heuristic mode and an optional hosted Jev mode.
- [Spliit Cloud](https://github.com/antonio-ivanovski/spliit-cloud) - Optional expense-category suggestions where Jev picks a category after local dictionary and history matching miss.

## Games and Creative Projects

- [Jev Music Playground](https://github.com/wustep/jev-playground) - Musical-parameter selection with code-generated notes and MIDI, plus a labeled offline mode.
- [JevAI for XMage](https://github.com/ShiftSad/mage) - Magic: The Gathering bots using Jev alone or alongside XMage search.
- [PROMPT FPS](https://github.com/lukaske/jev-doom-agent) - Action selection in a browser-based Doom engine using Freedoom assets.
- [Jev Plays Snake](https://github.com/sorrycc/typesafe-snake) - Snake agent where code finds legal moves and Jev picks a direction.
- [jev-plays-pokemon-red](https://github.com/valentynkit/jev-plays-pokemon-red) - Branch-point action selection for a Pokemon Red agent requiring a lawful local game dump.
- [TypeSafe Mario](https://github.com/fhshaik/typesafe-mario) - Controller-input selection from emulator state, requiring a lawful local game setup.
- [JevPilot](https://github.com/standardagents/jevpilot) - Driving simulation with typed steering and speed choices, not a real-world driving system.
- [Jev Chess](https://jevchess.com) - Hosted shared chess game with move probabilities; public source code has not been verified.

## Independent Models

These projects are not official TypeSafe Jev weights, and compatible outputs do not establish equivalent quality.

- [AnyJev](https://github.com/nokia-applied-research/AnyJev) - Typed-decision readouts for open models with option-order correction and per-question calibration.
- [CUA-S1-FORMS](https://huggingface.co/cua-ai/cua-s1-forms) - Independent form-filling specialist and dataset, not a general desktop agent.
- [Jevlike](https://github.com/vinnylarouge/jevlike) - Independent option scorer with training code and game examples.
- [OpenJev SGLang](https://github.com/ekzhang/openjev-sglang) - Independent typed-decision server using open models and SGLang.
- [Open Medical Jev](https://github.com/FeiLiuEM/open-medical-jev) - Independent frozen-model medical decision router with confidence fusion and conformal candidate sets; not TypeSafe Jev weights.

## Reading and Research

- [Jev in the Wild](https://arxiv.org/abs/2609.30216) - Surveys 2,170 public Jev projects and maps early growth, application domains, and decision-use patterns.

## Supporting Drivers

- [Browser Harness](https://github.com/browser-use/browser-harness) - Model-neutral CDP connection used by Jev Ultrafast, not a Jev model.

## Contributing

Suggest a project with a concrete Jev role, implementation evidence, and honest limitations. Read the [contribution guide](CONTRIBUTING.md) and [selection policy](docs/CURATION.md) first.

## Footnotes

The larger [discovery catalog](docs/CATALOG.md), [local viewer](docs/BROWSE.md), and [refresh history](docs/STATUS.md) are separate from this editorial file. The [gallery selection notes](docs/README_GALLERY.md) explain the dated traction checks and editorial ordering; this is not a live popularity leaderboard. Discovery, research, and drafting have used AI assistance; this project does not claim an exclusively human-authored history or admission to the canonical Awesome index. See [submission status](docs/AWESOME_SUBMISSION.md), [sources and credits](SOURCES.md), [reuse terms](LICENSING.md), and the [security policy](SECURITY.md).
