# Jev Browser

English | [Português (Brasil)](README.pt-BR.md)

A hybrid browser usage harness in TypeScript: an **OpenRouter LLM turns goals into verifiable subgoals**, **Jev chooses each action and DOM field**, OpenRouter generates text whenever a field needs filling, and **Playwright executes the actions**.

## Installation

Node.js 22 or later:

```bash
npm install
npm run browser:install
```

Create a `.env` file using `.env.example` and set `TYPESAFE_API_KEY`. Get your key from the [TypeSafe console](https://console.typesafe.ai). The default model is `jev-latest`; set `TYPESAFE_MODEL` to change it.

For field filling, also set `OPENROUTER_API_KEY` using a key from [OpenRouter](https://openrouter.ai/settings/keys). `OPENROUTER_MODEL=openrouter/free` is the default, but any free or paid model ID is accepted, provided the selected endpoint supports structured output. Example: `OPENROUTER_MODEL=meta/muse-spark-1.3-contributor`. Pricing, availability, and limits depend on the selected OpenRouter model; Jev continues to use your TypeSafe account.

The `--goal` mode also uses OpenRouter to create a plan before opening the browser. Direct tasks and explicit batches only use OpenRouter when filling a field.

## Usage

```bash
npm start -- --goal 'register a user on example.com' \
  --value 'name=Test User' \
  --value 'email=user@example.com' \
  --value 'password=a-test-password' \
  --headed

npm start -- --url https://docs.typesafe.ai/introduction \
  'Open the Quick start page' --headed

npm start -- --url https://www.wikipedia.org \
  'Search for Alan Turing and open the matching article' --headed

npm start -- --url https://www.wikipedia.org \
  'Search for Alan Turing and open the matching article' --value 'Alan Turing'

npm start -- --commands \
  '["visit google.com","search for Example Academy","map its competitors"]' \
  --headed
```

`--goal` asks OpenRouter for a short plan of sequential, verifiable subgoals. The planner is instructed to avoid selectors and invented fields: each subgoal goes to Jev, which observes the page and chooses one concrete action at a time. The plan appears in the terminal and is saved in `plan.json`, `result.json`, and `report.html`. The final evaluation also receives the original goal to check whether the plan omitted any requirements.

Use `--value` to supply data needed for the goal. Labeled values such as `email=...` and `password=...` help the generator choose the correct data. If required information is missing, OpenRouter returns `text: null` and execution stops with `missing_input` instead of inventing a value. Use test accounts and environments when executing actions with external effects.

`--commands` accepts a JSON array of up to 20 commands. Commands run in order in the same browser context, and each must reach `done` before the next starts. You can also pass the JSON array directly as a positional argument. `--max-steps` applies to each command. If `--url` is omitted, the harness uses the first domain or URL found in the input; otherwise, it asks for `--url`.

`--headed` displays the browser; without it, execution is headless. `--max-steps` limits the loop per command (default 20, maximum 100). `--min-confidence` sets the confidence threshold for executing a decision (default 0.55, adjustable for your use case).

Jev makes structured decisions rather than generating free-form text. When it selects a fill action, OpenRouter receives the current command, selected field, observation, and recent steps, and returns JSON with `text` and `reason`. Double quotes and the repeatable `--value` option supply exact values to the generator; the planner and Jev receive redacted hints indicating that those values exist. Every fill goes through the LLM, even when an explicit value is supplied. Clicks, Enter, selections, and scrolling do not call OpenRouter. The initial URL comes from `--url` or the first domain recognized in the input.

## Planning and execution loop

For standalone commands such as `Open https://example.com`, the harness checks the observed URL and presence of page content before calling Jev. A matching URL completes navigation deterministically, accepting a `www` redirect or HTTP-to-HTTPS upgrade while preserving the port, path, query, and fragment. Compound tasks still go through Jev. These steps record `decisionSource: "postcondition"` and the verification reason; confidence `1` describes the rule rather than model certainty.

Jev and the text generator receive the original goal, command list, current index, and completed commands. Planner instructions separate navigation, discovery, filling, submission, and verification; each command should have one completion condition. Markers such as `<provided>` are metadata: the generator resolves actual data from `--value`, and the executor rejects those markers as field content.

An observation with no text and no elements triggers an automatic wait without calling Jev. A `wait` action can also execute below the confidence threshold because it only waits for a new observation. Each command allows at most five consecutive waits; if another wait is needed, execution stops with `page_not_ready`. Waits count toward the step limit. Other actions remain subject to `--min-confidence`. The terminal and HTML report show the policy reason, and steps record `decisionSource` (`readiness` or `jev`). Confidence `1` on an automatic wait represents a deterministic rule, not a model assessment.

1. In `--goal` mode, ask OpenRouter for 1–20 self-contained subgoals; `--commands` skips planning and uses the supplied batch exactly.
2. Capture the URL, title, up to 12,000 characters of page text, and up to 60 elements visible in the viewport.
3. Build concrete options: click, fill a field, select, press Enter, scroll, go back, wait, finish, or stop.
4. Send the current subgoal, observation, and recent steps to Jev through the official TypeSafe SDK.
5. Validate the choice and confidence; for a fill action, request text from OpenRouter and validate the response. Execute through Playwright and observe again.
6. Stop on completion, missing information, low confidence, repeated actions in the same state, or the step limit.

Each run writes artifacts to `runs/<timestamp>/`. Logs include the text and model used for each fill, with password field values redacted. The `done` status represents the executor's completion claim; a separate evaluation checks the outcome. Exit codes: `0` only for `done` plus a `passed` evaluation, `2` for incomplete execution or an evaluation that did not pass, and `1` for a fatal configuration/API/execution error. Action failures enter the history to guide the next decision; Jev API failures end execution after the SDK's retries.

If the LLM reports missing information (`text: null`), execution stops with `missing_input`. An HTTP error, 45-second timeout, invalid JSON, or truncated OpenRouter response during text generation produces `generation_error`. Both statuses use exit code `2`, preserve logs, and prevent the fill. The text generator has no retries or automatic fallback to another model.

## Evaluation and observability — enabled by default

Every run through the CLI or `runSession` captures evidence and performs a final evaluation without additional flags. The terminal prints the path to `report.html`, which can be opened directly in a browser offline. `runHarness` is the low-level loop; integrations should use `runSession` to get these features by default.

| Artifact                                                     | Contents                                                                                                             |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `report.html`                                                | Commands, executor and evaluation outcomes, actions, confidence, timing, generated text, and evidence links          |
| `plan.json`                                                  | Goal, planned commands, rationale, model, and tokens; only present in `--goal` mode                                  |
| `events.jsonl`                                               | Ordered timestamped events, Jev/OpenRouter/evaluation call inputs and outputs, durations, errors, and browser events |
| `steps.jsonl`                                                | Completed or interrupted actions, recorded incrementally                                                             |
| `evidence/step-NNN-before/after.observation.json` and `.png` | DOM observation and screenshot before and after each recorded step                                                   |
| `final.observation.json` and `final.png`                     | Final state, including after failures when the browser is available                                                  |
| `trace.zip`                                                  | Playwright trace containing actions, snapshots, screenshots, and browser network traffic                             |
| `eval.json`                                                  | Verdict, confidence, explicit checks, and evidence reference                                                         |
| `result.json`                                                | Full result (schema version 3), per-command status, metrics, timing, tokens, and capture failures                    |

Evaluation makes **one additional Jev call**, using a question distinct from action selection. It receives the ordered command list, final state, and concrete actions associated with each command; it does not receive the `done` claim as evidence of success. It uses the configured TypeSafe model, so it is a separate assessment rather than a judge from an independent provider. The additional call uses your TypeSafe account.

Verdicts: `passed` (evidence of completion), `failed` (an unmet requirement), `inconclusive` (insufficient evidence or confidence below 0.70), and `error` (evaluator failure). The judge receives text observations limited by the harness, not images. Evaluation is probabilistic and cannot prove external effects that are invisible in the browser.

For verifiable criteria, add optional expectations. Both check for a **literal, case-sensitive substring** in the final observation. A failed expectation fails the evaluation even if the judge approves:

```bash
npm start -- --url https://www.wikipedia.org \
  'Search for Alan Turing and open the matching article' \
  --expect-text 'Alan Turing' --expect-url '/wiki/Alan_Turing'
```

To inspect the trace, use the [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer):

```bash
npx playwright show-trace runs/<run>/trace.zip
```

Navigation, model, and browser launch failures go through finalization and produce a report. If no final state is available, evaluation is inconclusive. Evaluator errors do not erase execution records. Screenshot and trace capture failures appear in `warnings`. Forced process termination and disk write failures can prevent finalization; events already written remain available. Invalid CLI arguments are rejected before starting a run.

Metrics count logical calls to `planner`, `jev`, `openrouter`, and `eval` (internal SDK retries are not separate calls), latency, and provider-reported tokens. `callsWithUsage` distinguishes known usage from unreported usage. There is no monetary cost estimate. The models actually used are recorded in event responses.

## Scope

A prototype for navigation and simple forms in one tab and a fresh context. Links with `target` open in the same tab; JavaScript popups, iframes, CAPTCHA, email confirmation, MFA, persistent login, uploads, and downloads are not supported. OpenRouter can fill password fields, whose values are redacted from events, steps, results, and evaluation input. Instructions tell Jev to treat page content as data and require an explicit request for actions with external effects; this is not a security barrier against prompt injection. Use pages and test tasks under your control.

Page text is sent to TypeSafe. The planner and Jev receive hints that values were supplied, such as `password=<provided>`; full supplied values are sent to OpenRouter when it generates field content. Artifacts are local, with no external telemetry service. Events and results redact password field values, but screenshots, third-party DOM content, and especially `trace.zip` can contain task data, form data, and site traffic; do not treat traces as anonymized. Client API keys are not included in harness events. `runs/` and `.env` are in `.gitignore`.

## Validation

```bash
npm run check
npm test
```

Tests use real Chromium, a local HTTP server, and mocked models. They cover goal planning, subgoal execution, the hybrid flow, password fields with redaction, absence of generator calls for other actions or low-confidence fills, generation errors, missing information, HTTP/JSON formats, observed outcomes, invalid decisions, loops, and step limits. They also verify artifacts, metrics, verdicts, executor/judge disagreement, failures before and during execution, and HTML escaping. They require no API keys and do not establish the quality of real model decisions.

Code is organized into `src/domain` (types and rules), `src/application` (loop, session, and evaluation), and `src/infrastructure` (Playwright, models, telemetry, and HTML). `src/session.ts` composes the adapters and provides the programmatic entry point with evaluation and observability enabled. See [architecture and dependency rules (in Portuguese)](docs/architecture.md).

Run `npm run validate` for type checking, formatting checks, and all tests, including automatic layer boundary checks. `npm run format` applies standard formatting.

OpenRouter: [free model router](https://openrouter.ai/docs/cookbook/get-started/free-models-router-playground) and [structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs).

References: [Jev introduction](https://docs.typesafe.ai/introduction), [JavaScript SDK](https://docs.typesafe.ai/sdk/javascript), [API](https://docs.typesafe.ai/api), and [confidence](https://docs.typesafe.ai/confidence).
