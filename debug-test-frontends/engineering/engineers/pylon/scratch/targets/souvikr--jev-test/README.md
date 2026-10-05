# jev-test

A small test harness for **Jev** (`~typesafe/jev-latest`), TypeSafe's structured decision model, called through OpenRouter's alpha **Decisions API** (`POST https://openrouter.ai/api/alpha/decisions`).

Jev doesn't generate text. You send it a `state` (the text or JSON to judge) and a set of typed `questions`. It returns typed answers with calibrated probabilities, and your code decides what to do with them.

## Setup

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh   # installs uv (Python manager)
uv sync                                           # Python 3.12 + requests + python-dotenv
cp .env.example .env                              # then paste your key into .env
```

`.env`:

```
OPENROUTER_API_KEY=sk-or-v1-...
```

`.env` is git-ignored. Never commit it.

## Run

```bash
uv run test_jev.py          # quickstart: one call using all three question types
uv run run_cases.py         # full suite (17 cases, 23 checks)
uv run run_cases.py score   # only cases whose name contains "score"
uv run run_cases.py -v      # also print probabilities and raw answers
uv run benchmark.py         # compare Jev vs GPT-5.6 Terra vs Claude Opus 5
```

| File | Purpose |
|---|---|
| `jev.py` | `decide(state, questions)`: a thin wrapper around the Decisions endpoint |
| `test_jev.py` | Quickstart example from the OpenRouter docs |
| `cases.py` | Test cases taken from the TypeSafe / OpenRouter documentation |
| `run_cases.py` | Runs the cases, checks expectations, and prints a confidence band and the total cost |
| `benchmark.py` | Runs the same cases on Jev and on general LLMs and compares latency, tokens, cost and accuracy |

## Request shape

```json
{
  "model": "~typesafe/jev-latest",
  "state": "Help! My payouts have been failing for 3 days.",
  "questions": {
    "<key>": { "type": "noul | choice | score", "instructions": "...", "criteria": ... }
  }
}
```

- `state` can be a **string, object, or array**. Objects let the instructions refer to fields by name, for example `"Compare assistant_answer against help_center_excerpts"`.
- One request can hold **many questions**. They are evaluated in parallel, so batch them instead of making separate calls.
- `instructions` and each criterion can be a plain string or a structured object (see the choice and score sections below).

## The three question types

### 1. `noul`: yes / no probability

Use it for a genuinely binary judgment.

```json
"refund": {
  "type": "noul",
  "instructions": "Is the customer requesting a refund?",
  "criteria": {                                   // optional
    "true":  "Asks for money back",
    "false": "No request for money back"
  }
}
```

Response:

```json
{ "type": "noul", "noul": 0.98 }
```

- `noul` is the **probability that the answer is yes**, from 0 to 1.
- **0.5 means "can't tell"**, not "medium". There is no separate `confidence` field because the probability already expresses certainty.
- Phrase the question so that a high value means yes. Add `true`/`false` criteria when the boundary is subtle, for example to define what counts as "contacted support before".
- Typical use: `if answers["refund"]["noul"] > 0.8: ...`

### 2. `choice`: pick one label from a fixed set

Use it for routing and classification: teams, intents, languages, categories.

```json
"team": {
  "type": "choice",
  "instructions": "Which team should handle this ticket?",
  "criteria": {
    "billing":   "Payments, invoices, refunds, charges",
    "technical": "Bugs, errors, outages, API problems",
    "account":   "Login, profile, permissions",
    "other":     "Anything not covered above"
  }
}
```

Response:

```json
{
  "type": "choice",
  "choice": "billing",
  "probabilities": { "billing": 0.87, "technical": 0.13, "sales": 0 },
  "confidence": 0.80
}
```

- `choice` is the label with the highest probability. `probabilities` covers **every** label, including labels at 0, and sums to 1.
- `confidence` (0 to 1) measures how peaked the distribution is: a flat distribution gives low confidence and a peaked one gives high confidence.
- List all the options. Add `other` / `none` when inputs can fall outside the list.
- When options are easy to confuse, use a structured criterion:
  ```json
  "billing_dispute": {
    "what": "Disputes a specific charge they believe is wrong",
    "not_for": "General pricing questions",
    "examples": ["Why was I charged twice?", "I was billed after canceling"]
  }
  ```
- When the top choice is only moderately confident, check the runner-up label in `probabilities`.

### 3. `score`: position on an ordered scale

Use it for severity, frustration, quality, expertise, or anything else with levels.

```json
"severity": {
  "type": "score",
  "instructions": "How severe is this bug?",
  "criteria": [
    "Cosmetic issue; nothing is broken",
    "Broken or degraded feature, but a workaround exists",
    "Core functionality down with no workaround, or data loss"
  ]
}
```

Response:

```json
{
  "type": "score",
  "score": 1.05,
  "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
  "probabilities": { "0": 0, "1": 0.95, "2": 0.05 },
  "confidence": 0.92
}
```

- `criteria` is an **ordered array**. Index 0 is the lowest level. Use at most about 10 levels; 3 is often enough.
- `score` is the **probability-weighted mean** of the level indexes: `Σ index × p(index)`. It can land between integers, so round it if you need a single level. Use `probabilities` to see the full picture.
- Each level is judged separately, without knowing its neighbours. Write **concrete situations**, not vague degrees ("workaround exists" rather than "moderately severe").
- Keep **one dimension per score**. For a combined judgment, ask several score questions and weight them in code. `run_cases.py` does this: `0.6×severity + 0.3×frustration + 0.1×report_quality`.
- If probability keeps splitting between adjacent levels, use object tiers with `what` + `examples`.

## Acting on confidence

This is the TypeSafe guidance, and `run_cases.py` labels every answer with one of these bands:

| confidence | band | action |
|---|---|---|
| > 0.9 | **act** | proceed automatically |
| 0.5 – 0.9 | **confirm** | ask the user or gather more data |
| < 0.5 | **escalate** | send to a person or a reasoning model |

Raise the thresholds as the risk goes up: reading a balance needs less confidence than approving a transfer.

## Results (typesafe/jev-1.13, 2026-09-19)

All 23 checks passed in 17 cases, for a total cost of about **$0.0003**. Some notable results:

- **Structured criteria help.** The docs' Safari bug scored `1.51` with confidence `0.26` (escalate) using plain tiers. With `what` + `examples` tiers it scored `1.02` with confidence `0.97` (act). This matches the effect described in the TypeSafe docs.
- **Object state works.** Jev judged an assistant answer as `unsupported` against help-center excerpts (the answer said 60 days where the policy says 30).
- The quickstart ticket routed to `billing` with confidence 0.80, which falls in the confirm band and not the act band. There was a 13% chance of `technical`.

## Benchmark: Jev vs general LLMs

`benchmark.py` sends all 17 cases (23 checks) to each model. Jev gets them through the Decisions API. The LLMs get the **same state, instructions and criteria** through OpenRouter chat completions, with a strict JSON schema: a probability for noul, a label for choice, and a level index for score. All three models are graded with the same checks.

Example run on 2026-09-19 (4 requests in parallel, latency measured from this machine and including network time):

| Model | Accuracy | Median latency | p90 latency | Tokens in / out | Total cost (17 calls) | Cost / call |
|---|---|---|---|---|---|---|
| `~typesafe/jev-latest` (jev-1.13) | 23/23 | **452 ms** | **1,085 ms** | 6,380 / 584 | **$0.00027** | **$0.000016** |
| `openai/gpt-5.6-terra` | 23/23 | 1,505 ms | 2,209 ms | 3,349 / 251 | $0.00971 | $0.000571 |
| `anthropic/claude-opus-5` | 23/23 | 3,394 ms | 5,023 ms | 7,850 / 519 | $0.05223 | $0.003072 |

What the numbers show:

- **Accuracy was the same.** Every model passed every check, so on these cases the difference is speed and cost, not correctness.
- **Speed:** Jev's median latency was about **3× faster than GPT-5.6 Terra** and about **7.5× faster than Claude Opus 5**.
- **Cost:** Jev was about **35× cheaper than GPT-5.6 Terra** and about **190× cheaper than Claude Opus 5**. Jev charges only for input tokens ($0.042 per million) and its output tokens are free.
- **Tokens:** Jev's input count includes its own prompt scaffolding, so the token counts aren't directly comparable across models. Compare cost instead.
- **Output format:** Jev returns a full probability distribution plus `confidence`, which is what lets you act, confirm or escalate. The LLMs here return a single answer, and any noul probability they give is self-reported rather than calibrated.

Caveats: this is a single run on a small, clear-cut set of cases, and latency varies from run to run. The LLMs ran with OpenRouter's default reasoning settings. Rerun `uv run benchmark.py` for fresh numbers; raw per-case results are written to `results/benchmark.json`, which is git-ignored.

## Error codes

`400` bad request · `401` missing or invalid key · `402` insufficient credits · `404` model not found · `413` payload too large · `429` rate limited · `5xx` provider or server error.

## References

- [OpenRouter Decisions API reference](https://openrouter.ai/docs/api/api-reference/alphadecisions/submit-a-decisions-questions-and-answers-request)
- [OpenRouter cookbook: Jev-verified cascade](https://openrouter.ai/docs/cookbook/evaluate-and-optimize/jev-verified-cascade)
- TypeSafe docs: [System One](https://docs.typesafe.ai/concepts/system-one) · [noul](https://docs.typesafe.ai/primitives/noul) · [choice](https://docs.typesafe.ai/primitives/choice) · [score](https://docs.typesafe.ai/primitives/score) · [confidence](https://docs.typesafe.ai/confidence)
