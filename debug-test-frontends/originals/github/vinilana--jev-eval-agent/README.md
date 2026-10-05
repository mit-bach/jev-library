# jev-eval-agent

🇺🇸 English · 🇧🇷 [Leia em português](README.pt-BR.md)

A personal-assistant agent built with [eve](https://eve.dev) (Vercel), with **100 mocked tools**,
served through **OpenRouter**. The repository exists to answer one question: *how many steps does the
agent need to finish the same task when the LLM picks the tool itself vs. when
[Jev](https://docs.typesafe.ai) (TypeSafe's classifier) picks it?*

| `AGENT_MODE` | Who picks the tool | Model reasoning |
|---|---|---|
| `llm-direct` (default) | the LLM, seeing all 100 tools on every step | on (`DIRECT_REASONING`, preset default) |
| `jev-classifier` | Jev, called before **every** model step with the conversation state; only the chosen tool is exposed to the LLM, which just fills in the arguments | the minimum the endpoint accepts (`JEV_REASONING`) or off |

Everything lives on `main`; the mode is a single environment variable. Instructions, catalog, evals and UI are identical in both modes.

## How it works

```
agent/
  agent.ts              model (OpenRouter); reasoning and providerOptions depend on MODE
  mode.ts               reads AGENT_MODE (llm-direct | jev-classifier)
  instructions.md       shared system prompt
  instructions/mode.ts  extra guidance per mode (session.started)
  lib/models.ts         model presets (EVAL_MODEL)
  lib/catalog.ts        100 tools: name, description, zod schema and mock executor
  lib/world.ts          deterministic mock "world" (calendar, contacts, flights, expenses…)
  lib/jev-router.ts     builds the state from ctx.messages and asks Jev (choice with 101 options)
  lib/trace.ts          writes Jev's decisions to eval-results/jev-trace.jsonl
  tools/catalog.ts      defineDynamic: session.started → 100 tools | step.started → the 1 tool Jev picked
evals/
  prompts.ts            the 6 benchmark prompts + required tool families
  shared.ts             extracts metrics from the event stream and writes eval-results/<mode>/<prompt>.json
  assistant.eval.ts     one eval per prompt
eval-ui/index.html      comparison dashboard
eval-ui/slides.html     presentation deck
scripts/serve-ui.mjs    serves the dashboard and aggregates eval-results/**/*.json
scripts/run-all.sh      runs the eval for modes × models in sequence
```

In `jev-classifier` mode the Jev call asks two questions about the same state
(`{ user_request, actions_taken[], assistant_said[] }`, derived from eve's message history):

- `next_tool`: a `choice` over the 100 tools + `respond_to_user` ("I'm done, answer the user");
- `done`: a `noul` ("does every requested action already appear in actions_taken?").

If Jev picks `respond_to_user` but `done` is below `JEV_DONE_THRESHOLD` (default 0.5), the router
blocks the reply and exposes the next-best tool instead (confidence-gated routing). When
`respond_to_user` passes, no tool is exposed and the model writes the final answer. Every decision
(choice, confidence, `done`, top-5, latency and whether the gate fired) goes to `eval-results/jev-trace.jsonl`
and shows up in the dashboard timeline.

## Models

All through OpenRouter; pick one with `EVAL_MODEL=<key>` (default `gemini-3.8-flash`). Presets live in `agent/lib/models.ts`:

| key | model | reasoning in llm-direct | reasoning in jev-classifier |
|---|---|---|---|
| `gemini-3.8-flash` | google/gemini-3.8-flash | medium | low (mandatory, cannot be disabled) |
| `deepseek-v4.1-flash` | deepseek/deepseek-v4.1-flash | high | off |
| `gpt-5.6-luna` | openai/gpt-5.6-luna | medium | none |
| `gpt-5.6-sol` | openai/gpt-5.6-sol | medium | none |
| `opus-5` | anthropic/claude-opus-5 | medium | off |
| `fable-5.1` | anthropic/claude-fable-5.1 | medium | low (mandatory) |
| `gpt-6-astra` | openai/gpt-6-astra | medium | low (mandatory) |
| `qwen3.8-27b` | qwen/qwen3.8-27b | medium | off |

```bash
EVAL_MODEL=deepseek-v4.1-flash npm run eval           # one mode (AGENT_MODE), one model
MODELS="gemini-3.8-flash gpt-5.6-luna" npm run eval:all
MODELS=all npm run eval:all                           # all 8 models × 2 modes
```

Results are written to `eval-results/<mode>/<model>/<task>.json`.

## The 6 tasks

Three basic (3 tools each) and three complex (4 to 7 tools), all with **distractor tools** that have
look-alike names in the catalog (`flights_hold` × `flights_book`, `calendar_block_time` × `calendar_create_event`
× `calendar_create_meeting`, `email_send_later` × `email_send` × `email_draft`,
`reminder_create_location` × `reminder_create`, `expenses_summary_by_merchant` × `expenses_summary`,
`task_create_subtask` × `task_create`, `transfer_money_scheduled` × `transfer_money`, …).
Calling a distractor counts as a "wrong tool" in the report.

The prompts are sent to the agent **in Portuguese**: the benchmark persona is a Brazilian user (Rio,
São Paulo, R$, PIX), and the versioned results were produced with those exact prompts. `evals/prompts.ts`
also carries an English `title` and a `promptEn` translation, used for display only in the dashboard and
the deck. The English paraphrases below are those translations.

### Basic

1. **p1-marina** — "Do I have a meeting with Marina tomorrow morning? If so, email her confirming the time and create a reminder for me 30 minutes before." (ideal: 3 tools; Marina's email is already on the calendar event, so the contact lookup is optional)
2. **p2-voo-sp** — "On Friday I need to be in São Paulo for a 2 pm meeting. Find the cheapest flight leaving Rio in the morning, book it and put it on my calendar." (ideal: 3 tools; a cheaper afternoon flight is planted as a trap)
3. **p3-orcamento** — "How much did I spend on restaurants this month? If it is over R$ 800, create a task to review the budget and message me a summary." (ideal: 3 tools; actual spend = R$ 942.50)

### Complex

4. **p4-viagem-completa** — hold (do not buy) the cheapest morning flight, find a hotel within 2 km of the meeting for up to R$ 500, book it, block the calendar from 8 am to 6 pm and message Marina. (ideal: 6 tools)
5. **p5-reuniao-time** — find a free slot, look up the contacts, create a meeting with invites, create a subtask inside an existing task and schedule an email for tomorrow at 8 am. (ideal: 7 tools)
6. **p6-financas** — spending by restaurant, a checklist note with the top 3, a PIX transfer scheduled for the 25th and a location reminder on arriving home. (ideal: 4 tools)

## Running

Requires Node 24+.

```bash
cp .env.example .env.local     # fill in OPENROUTER_API_KEY and TYPESAFE_API_KEY
npm install

# one mode at a time
npm run eval                                   # AGENT_MODE=llm-direct (default)
AGENT_MODE=jev-classifier npm run eval

# or modes × models in one go
npm run eval:all
MODELS="gemini-3.8-flash opus-5" npm run eval:all

# dashboard + slides
npm run ui        # dashboard at http://localhost:4321 · deck at http://localhost:4321/slides.html
```

The dashboard and the deck open in **English by default**. Switch to Portuguese with the **EN / PT**
buttons in the dashboard top bar, the `L` key in the deck, or `?lang=pt` in the URL. The choice is
remembered in the browser and travels with the exported HTML.

Both pages can be exported as a single self-contained HTML file, with data and charts embedded, that
opens without a server: the **export HTML** button in the dashboard (keeps the current filters and
highlight) and the `E` key in the deck.

The deck (`eval-ui/slides.html`) tells the story of the case study (problem → idea → architecture →
catalog and tasks → traces and evals → results → where it stumbles → conclusion) with numbers read from
`eval-results/`. Navigation: ← → / space, `F` fullscreen, `N` speaker notes, `L` language, `D` back to the
dashboard; chips switch the model on the result slides.

`eval-results/` is versioned, so the dashboard and the deck open with the repository's numbers without
running anything. Each run overwrites `<mode>/<model>/<task>.json` and appends a line to `history.jsonl`.

### Smoke test without keys

```bash
AGENT_MODEL=mock npm run eval                                      # llm-direct
AGENT_MODE=jev-classifier AGENT_MODEL=mock JEV_STUB=1 npm run eval  # jev-classifier
```

Uses eve's `mockModel` with a scripted plan and a Jev stub; it only validates the pipeline.

## Metrics recorded per run

`modelSteps` (LLM calls), `toolCalls`, `extraToolCalls`, `distractorCalls` (look-alike wrong tool),
`jevCalls`, `completion` (fraction of required steps covered), `idealPath`,
`efficiency` (completion × ideal/calls × ½ if a wrong tool was called), `usage` (tokens in/out and
`estimatedCostUsd` at OpenRouter's public price), `reasoningChars`, `durationMs`, the final reply and
the step-by-step timeline (Jev decision with confidence and top-3, model call, tool and arguments).

The dashboard (`npm run ui`) shows all of it with filters by model and task tier: steps and calls per
task, tokens and cost, per-model distribution, efficiency ranking, call composition (on path / extra /
wrong), efficiency × tokens and the timelines.
