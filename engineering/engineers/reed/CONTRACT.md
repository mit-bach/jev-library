# CONTRACT

Map of the TypeSafe contract an agent must obey when it calls Jev. Written from the files named here, not from memory. The docs snapshot is the parent's 2026-10-01 save. Later fetches are named, and where they disagree the later text is quoted beside the snapshot.

Corpus root:

`/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/corpus/01-primary-typesafe/`

Index of that snapshot:

`/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/originals/pages/docs.typesafe.ai-llms.txt`

A rule below cites that root plus a path, then the heading in the file. Quoted sentences are the source's words. Example numbers in the docs (0.5, 0.6, 0.8, 0.85, 0.9) are examples on those pages. They are not one official threshold.

The official skill, saved at `official-skill/SKILL.md`, says the live docs are the source of truth. This map is the snapshot plus the later fetches in `SOURCES.md`. If a live page has moved since 2026-10-01, the live page wins, and this file does not.

## Obey these, then read the section

1. Jev is not the model inside a coding agent. It does not write code, stream text, call tools, or edit files.
2. One request is `state`, `model`, and a map of `questions`. Code keeps the control flow.
3. Question ids are for the response map. They are not sent to the model. The whole judgment goes in `instructions` and `criteria`.
4. Questions in one request are independent. One answer is not context for another question in that request.
5. Choice returns one option, a probability for every option, and one `confidence`. Score returns a probability-weighted position, a probability for every level, and one `confidence`. Noul returns one probability that the answer is yes. A noul of 0.5 is not a medium score.
6. `choice` is the highest-probability option. `confidence` is not a per-option field. Do not "pick the option with the highest confidence."
7. Do not ask Jev to do arithmetic, counting, date order, or text generation. Do those in code, or with another model.
8. Do not send images, audio, or video. Do not put unrelated text in `state` and hope.
9. Pin `jev-1.13.0` if a threshold was tuned to that version. `jev-latest` and `jev-preview` both pointed at `jev-1.13.0` in this snapshot, and an alias can move.
10. Thresholds are yours. Test them. The pattern pages do not agree with each other on the example numbers.

## 1. What Jev is, and what it refuses to be

### The model

`introduction.md`, heading `# Introduction`.

> Jev is TypeSafe's flagship model and the first System One model.

> Jev evaluates typed questions against a state and returns structured results directly. No text generation, no parsing.

The same page, heading `## TypeSafe primitives`: three question types, mixed in one call, "evaluated in parallel and in isolation against the same state." Adding questions "does not create context-rot." That sentence is about adding questions. It is not permission to stuff `state`. Section 7 says unrelated material in `state` costs accuracy, and that page uses the words "context rot" for the state, not for extra questions.

`concepts/system-one.md`, heading `# System One`.

> System One models are a class of AI models built to make fast, structured decisions that software can use directly.

> Like an LLM, a System One model understands natural-language input. It returns typed decisions and probabilities rather than generated text.

Same page, heading `## How it differs from an LLM`.

> System One models are trained for calibrated decisions: their probabilities are optimized against outcomes to reflect uncertainty. Calibration is measured across groups of predictions; it does not guarantee that an individual answer is correct.

> System One models do not write replies, produce code, or generate explanations of their reasoning.

The name, same page: Kahneman's fast System 1, not the slow System 2. "Here, the emphasis is on fast, focused judgments."

`introduction/machine-learning-primer.md`, heading `## RLCD and calibrated decisions`. Training path is RLCD, reinforcement learning for calibrated decisions. The contract that page states:

> The model does not generate text.
>
> It returns decisions and probabilities.
>
> Higher probability should correspond to a greater chance that the answer is correct.

The 0.2 / 0.8 / 1.0 rates on that page "describe groups of predictions, not a guarantee about any single answer."

`concepts/how-to-build-with-system-one.md`, the paragraph under the compressor, before `## Three software architectures`.

> System One is TypeSafe's model for building AI-powered software, not agents. It does not generate code or choose its own next action.

The info box on that page, still before the architectures heading: code owns control flow, deterministic rules, and side effects. The model gets narrow typed questions.

Same page, heading `## Three software architectures`, tab "AI-powered software": "Code handles deterministic work and owns the control flow. The model appears only where the system needs programmable common sense or needs to interpret unstructured data. Each AI task is kept atomic and constrained."

Same page, heading `## What makes System One composable`. "Most queries complete in about 100 ms." That is this page's speed claim. It is not the launch post's 70–500 ms range. See section 12.

`models.md`, heading `## Customizing Jev`.

> Jev is not fine-tuned or LoRA-adapted with customer data.

Same page, heading `## Data handling`.

> Jev is not trained on customer requests or responses.

Input, `models.md` heading `## Current models`, and `concepts/state.md` heading `# State`, the Note: text only. String, JSON object, or array of text values. No image, audio, or video. English is the primary training language. Other languages, including CJK, are accepted at lower accuracy (`models.md`, heading `## Language support`).

### Inside a coding agent

`introduction/coding-agents.md`, heading `# Jev with coding agents`.

> Jev is not a drop-in replacement for the LLM behind Claude Code, Cursor, opencode, Copilot, Muse Spark, Grok Bot, or similar tools. Instead, you can use your coding agent as usual to write code that uses Jev to make decisions.

Same page, heading `## Jev is not a chat or code-completion LLM`.

> Jev is a System One model. It does not generate text, write code, or hold a conversation.

> Coding agents rely on an LLM that streams text, calls tools, and edits files based on natural-language instructions. Jev does none of that. There is no `model: "jev-latest"` setting that turns your coding agent into a Jev-powered agent, because the two systems solve different problems.

Same page, heading `## What you probably want instead`, the row "Replace or swap the model that powers a coding agent":

> Jev isn't the tool for this. Keep using an LLM-based coding agent, and use Jev separately wherever your product needs a fast, calibrated, structured decision.

Same page, heading `## When Jev is worth reaching for`. Use it inside the app the coding agent is building, when the code needs a fixed-set route with a confidence, a rubric score, a true/false check, or a replacement for a prompt that asks an LLM to "return JSON."

What to install so the coding agent writes that call correctly is section 10, not a Jev model setting.

## 2. The request

`api.md`, heading `## Evaluation endpoint`.

```
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

`api.md`, heading `## Request body`. Three required fields.

| Field | Required | What the page says |
| --- | --- | --- |
| `state` | yes | "The content to evaluate. A plain string for text, or structured data (object/array)." |
| `model` | yes | "The model that handles the request. Use `"jev-latest"`, TypeSafe's flagship model." Pinning is in section 8. |
| `questions` | yes | "A map of typed Question objects. You choose each key; answers come back under the same keys." |

There is no other top-level field in that section.

### Question ids

`api.md`, heading `## Request body`, the expandable under `questions`.

> A key you choose. The matching Answer is returned under this same id. The key is not sent to the underlying model and is not used in inference.

`primitives.md`, heading `## Define a question`, the Tip.

> Question IDs are for your code. They are not sent to the model. Write the complete question in `instructions`, even when the ID seems self-explanatory.

`primitives/choice.md`, heading `## Request structure`.

> The model never sees the question id. The option names and their descriptions are both sent to the model, so write descriptions that separate the options from each other.

`primitives/noul.md`, heading `## Request structure`, says the same about ids: "The ids are not sent to the model."

`official-skill/SKILL.md`, heading `## Design the judgments`.

> Question IDs are for code and are not sent to the model; include complete meaning in the question.

An id such as `refund_requested` does not ask the question. The instructions do.

### Instructions and criteria

`api.md`, heading `## Question types`.

> A Question is one of three types, set by its `type` field. All three share `type` and `instructions`; each adds its own `criteria`.

`instructions` on that page: `string | object | array`, required for every type.

`primitives.md`, heading `## Define a question`.

- ID. The key, such as `refund_requested`.
- `type`. One of `choice`, `score`, or `noul`.
- `instructions`. "The question you are asking about the state. This is where your evaluation logic goes."
- `criteria`. Options for Choice, ordered levels for Score, optional yes/no meanings for Noul.

Structure, when a string is not enough: section 5. `primitives/advanced.md`, heading `## Where structure is allowed`, also lists `null` as an accepted shape for `instructions`. `api.md` does not. Do not send null instructions. The disagreement is in section 12.

### What one request does not do

`primitives.md`, heading `### When one question depends on another`.

> Questions in the same request are independent: one answer does not become context for another question.

A second request is for a real dependency only: the code cannot build the next state, or the next options, until it has the first answer. Otherwise ask together and ignore what you do not need.

`concepts/how-to-build-with-system-one.md`, heading `## What makes System One composable`, card "Parallel".

> One primitive's result does not become hidden context that changes another primitive's result.

`introduction.md`, heading `## Atomic questions, composed in code`. One specific judgment per question. "If the question you want to ask would require extended reasoning or weighs multiple independent factors, decompose it." Combine in code. "When priorities shift, change a coefficient in your code rather than rewriting a prompt."

## 3. Choice, Score, and Noul

`primitives.md`, heading `## Choose a question type`.

> Pick the type that matches the shape of the answer you need.

> If two types both seem to fit, prefer the one whose answer your code can act on directly.

| Need | Type | Use it when the page says | Do not use it when |
| --- | --- | --- | --- |
| One of a set, no order | Choice | "routing a ticket to a department, classifying a document type, detecting a programming language" | The answer is a degree |
| A position on a spectrum you can describe | Score | "bug severity, customer frustration, skill level" | The answer is yes or no, or an unordered label |
| Yes or no, and the probability is the signal | Noul | "does this message contain personally identifiable information, is the customer requesting a refund" | You wanted a medium amount of something |

### The trap the docs name

`primitives.md`, heading `## Choose a question type`, the Note.

> Use Noul for a yes/no judgment and Score to measure a position on a spectrum. "Is this candidate strong in Python?" needs a clear definition of "strong". A Noul value of 0.5 means the model gives yes and no equal probability. It does not mean the candidate has a medium skill level.

`primitives/noul.md`, heading `## Reading a Noul`.

> A value near 1 is a strong yes. A value near 0 is a strong no. A value near 0.5 means the model gives yes and no similar probability.

> A Noul value runs from 0 to 1, but it's not a scale of the thing you asked about. It is the probability that the answer is yes. If the question is really about degree, the value does not measure the degree.

The same section: "You could create levels in the 0 to 1 range in your code, such as 0.3 to 0.7 for 'some experience', but the model will not see them, so nothing in the answer was judged against them."

`official-skill/SKILL.md`, heading `## Compose and verify`.

> A Noul near 0.5 means similar probability for yes and no, not medium intensity.

### Choice

`primitives/choice.md`, the paragraph before `## Request structure`.

> A Choice answer is the selected option in `choice`. The model also returns a probability for every option in `probabilities`, and a `confidence` value for the selected option.

Read the next heading before treating "for the selected option" as "the probability of that option." `## Response structure` on the same page:

> `choice`: The option with the highest probability.
>
> `probabilities`: The full probability distribution across every option. The sum of all values is 1.
>
> `confidence`: A number from 0 to 1 computed from how `probabilities` is spread. A flat shape, with probability spread across several options, means low confidence. A single peak on one option means high confidence.

`api.md`, heading `### Choice answer`. `choice` is "The highest-probability option." `probabilities` "floats that sum to 1." `confidence` is "How certain the model is, derived from probabilities."

Request, `api.md` heading `### Choice` and `primitives/choice.md` heading `## Request structure`.

- `type`: `"choice"`.
- `instructions`: required.
- `criteria`: required map. Key is the option name. Value is a description, or null "when an option needs no extra detail."
- Maximum 255 options. `api.md` heading `### Choice`, and `primitives/choice.md` heading `## Good practice: ask more than one question per call`.

Same Choice section: add `other` or `none of the above` when the list might not cover every input. Give the full list. Option names are sent to the model. Descriptions are sent. The id is not.

`primitives.md`, heading `## What comes back`. "`confidence` summarizes how peaked that distribution is."

### Score

`primitives/score.md`, the paragraph before `## Request structure`.

> A Score answer is a position along your levels in `score`, which can fall between two levels. The model also returns a probability for every level in `probabilities`, and a `confidence` value for the answer.

Request, `api.md` heading `### Score`, and `primitives/score.md` heading `## Request structure`.

- `type`: `"score"`.
- `instructions`: required. What it is rating.
- `criteria`: required ordered array, low end first. "A Score should have at least two levels; the API accepts up to 10."

`primitives/score.md`, heading `### Levels`.

> A level's number is its position in the `criteria` array, starting at 0.

> The model gets the descriptions and nothing else, and each level is judged on its own against the state.

The score formula, heading `## Response structure`, in the page's words:

> `score`: The position on the level number line, from 0 to the top level number, which is 2 here. It's each level number multiplied by its probability, added up: 0 x 0.0 + 1 x 0.57 + 2 x 0.43 = 1.43.

So `score` is the probability-weighted mean of the level indexes. It can sit between levels. `legend` maps the index strings back to the descriptions you sent. `probabilities` keys are those index strings in JSON. The Python SDK "keys `probabilities` and `legend` by integer level rather than by string" (`primitives/score.md`, end of `## Response structure`).

`primitives/score.md`, heading `## Reading a Score`.

> Different distributions can produce the same score. A score of 1.0 can mean all probability is on level 1, or half is on each of levels 0 and 2. Read `probabilities` and `confidence` alongside the score to distinguish these cases.

> In these examples, confidence 1.0 means the returned distribution puts all its probability on one level. This describes the model's answer, not a guarantee that the answer is correct.

Heading `## Writing good levels`, rules in the page's words:

> Describe situations, not degrees.

> Every level is evaluated separately. The model doesn't see a level's number or its neighbours, so "worse than the previous level" means nothing to it, and numbers in the descriptions or the instructions don't help.

The page shows the same bug report scoring 0.0 at confidence 1.0 with descriptive levels, and 0.55 at confidence 0.33 when the criteria are `["0", "1", "2"]` and the instruction is "Rate severity from 0 to 2, where 2 is worst."

> Keep each Score question to one dimension.

> Use as many levels as you can describe distinctly, up to 10. Three is fine. Don't add levels you can't describe distinctly.

`model-jaggedness/jev-1.13.md`, heading `### Math using score`. Do not interpolate a Score to recover an exact magnitude between two levels. "You can use the expectation to check if it passes a particular threshold, but `jev-1.13`'s score levels are weak in numerical calibration."

### Noul

`primitives/noul.md`, the paragraphs before `## Request structure`.

> Use a Noul when the answer is yes or no.

> A Noul answer is a single number representing the probability that the answer is yes where 0 means no and 1 means yes.

Request, `api.md` heading `### Noul`.

- `type`: `"noul"`.
- `instructions`: required. The yes/no question, or a statement to judge.
- `criteria`: optional object. `true` is "What a yes (value near 1) means." `false` is "What a no (value near 0) means."

Response, `api.md` heading `### Noul answer`. One field besides `type`: `noul`, "The yes/no answer on a scale from 0 (no) to 1 (yes)." No `confidence`. No `probabilities` map.

`primitives/noul.md`, heading `## Reading a Noul`.

> There is no separate `confidence` value for a Noul, unlike a Choice or a Score. A Noul's probability distribution has only two outcomes, yes and no, so the single `noul` value describes it completely.

Same page, heading `## Writing a Noul question`.

> Ask one yes/no question per Noul. If a question has two conditions, such as "Is the customer angry and asking for a refund?", the model has to judge both at once and the value means less. Ask two Nouls and combine them in code.

> Phrase the question so that a high value means yes.

A statement is allowed. "For 'The customer is requesting a refund', a value near 1 means the statement is true."

Where to threshold, same Reading section: "Use 0.5 when yes and no are equally easy to act on. Raise it when acting on a false yes is expensive, such as paging someone or issuing a refund. Lower it when missing a true yes is expensive, such as failing to flag a safety issue." Those are this page's examples, not a default for every Noul.

### Several may apply

`official-skill/SKILL.md`, heading `## Design the judgments`, the table.

> Whether a condition holds | Noul | Probability of yes; no separate confidence; use one per label when several may apply

A Choice is relative: it settles which one option. A Noul per option is absolute, and every Noul can be low, or more than one can be high. `model-jaggedness/jev-1.13.md`, heading `## Common-sense structural invariants`, says the same and shows the numbers. Do not treat `noul` and `probabilities["yes"]` on a yes/no Choice as the same measurement. Do not assume `P(question) + P(negation) = 1`. The page's own pair sums to 1.19.

### What comes back, one table

`primitives.md`, heading `## What comes back`, plus `api.md` heading `## Response body`.

| Type | Fields | How to read it |
| --- | --- | --- |
| Choice | `choice`, `probabilities`, `confidence` | `choice` is the highest-probability option. `probabilities` covers every option and sums to 1. `confidence` summarizes the shape. |
| Score | `score`, `legend`, `probabilities`, `confidence` | `score` is the weighted mean of level indexes. `legend` repeats your descriptions. `probabilities` sums to 1. |
| Noul | `noul` | Probability the answer is yes. No separate confidence. |

Top-level response, `api.md` heading `## Response body`: `model` (the versioned id that answered, such as `jev-1.13.0` in the examples), `answers` keyed by your ids, `usage.input_tokens`, `usage.output_tokens`.

`primitives.md`, same heading. Two properties the page states as what makes answers composable:

> Every answer is constrained to the options you supplied.

> Every answer is independent.

The model does not return a label you did not list. For a Choice, an omitted value cannot be selected. The skill says to check candidate coverage for that reason (`official-skill/SKILL.md`, heading `## Design the judgments`).

## 4. Confidence versus probability

Probability is the distribution. Confidence is a second number, and only on Choice and Score.

`confidence.md`, the prose after the demo component, before `## Confidence is derived from the probabilities`.

> All Score and Choice answers from TypeSafe include a `probabilities` property representing the probability distribution across the options (for Choice) or levels (for Score). The shape of that distribution is what tells you how certain the model is: concentrated on one outcome means a confident answer, spread out means an uncertain one.

> The answer's `confidence` property collapses that shape into a single number from 0 to 1, so you can threshold on it without doing the math yourself. (Noul answers don't carry one.)

Same page, heading `## Confidence is derived from the probabilities`.

> `confidence` is a statistic computed from the probability distribution the answer already gives you.

The Note on that heading: confidence "fits most use-cases, but you are never locked into our definition." The full `probabilities` are there so you can compute another measure. The page says the comparison of measures will be a cookbook, and the link is not on the page yet.

Same page, still that heading. Low confidence on a Choice "often means none of the options are a clear winner." Low confidence on a Score "often means the levels are ambiguous, multi-dimensional, or the state doesn't contain enough to go on."

`official-skill/SKILL.md`, heading `## Compose and verify`.

> Choice/Score confidence summarizes distribution concentration, not overall workflow correctness or permission to act.

> Several acceptable alternatives can also spread probability; low confidence need not invalidate a harmless preference choice. Ignore uncertainty on unused branches.

`confidence.md`, heading `## Three paths for using confidence in your code`. High: act. Medium: confirm, review, or gather more. Low: do not act. "Where you draw those boundaries depends on the stakes."

Heading `## Thresholds scale with risk`. "A confidence threshold is not one number." The code sample on that page uses `< 0.5` as a floor and `> 0.9` before `approve_transfer`. The Note: "The correct threshold values depend on your domain and the performance of the model for your use case. Start with conservative thresholds, test with your own data, and adjust as you observe results."

`patterns/confidence-routing.md` uses 0.6 and 0.85 in its example. `patterns/intent-routing.md` uses 0.5. `concepts/how-to-build-with-system-one.md`, step "Route on uncertainty", uses 0.8. Do not promote any of those to a default. Section 6 says what each pattern is for.

### Do not pick "the highest confidence"

`agent-skill.md`, heading `### You're using confidence thresholds everywhere`.

> If all you care about is choosing the best option, you just need to choose the option with the highest confidence (rather than setting a confidence threshold). If you have a specific statistical algorithm in mind, you should probably be using probabilities instead of confidence.

The second sentence matches the API. The first does not. `confidence` is one number on the answer, not a number on each option. The option to take, if you only want the mode, is `choice`, which the Choice page defines as the highest-probability option. Section 12 records this.

### The formula the docs state

`confidence.md`, inside the demo, the details element "How this demo calculates Confidence."

> TypeSafe computes confidence from how the probability is spread across the options. All of it on one option gives 1.0; the more evenly it spreads, the lower the confidence. This demo uses `(3 × largest probability − 1) / 2` to approximate confidence for three options.

The same page's demo source defines the general form it actually evaluates. Probabilities in that function are on a 0–100 scale, then divided by 100:

```
(count * peak - 1) / (count - 1)
```

clamped to `[0, 1]`. For three options that is `(3 × largest probability − 1) / 2`. The prose calls the three-option form an approximation. The page does not print a separate Score formula.

Check against numbers the snapshot itself prints. Choice-shaped formula `(n * p_max - 1) / (n - 1)`:

| Printed distribution | Printed confidence | Formula on the printed probabilities |
| --- | --- | --- |
| Choice 0.88, 0.12, 0.0 (`api.md`, `### Choice answer`) | 0.81 | 0.82 |
| Score 0.0, 0.95, 0.05 (`api.md`, `### Score answer`) | 0.92 | 0.925 |
| Score 0.0, 0.57, 0.43 (`primitives/score.md`, `## Response structure`) | 0.35 | 0.355 |
| Choice 0.85, 0.0, 0.15 (`introduction/quickstart.md`, `### Response body`) | 0.78 | 0.775 |

The gaps are about 0.01, which is what rounded probabilities produce. This map does not claim the demo formula was verified against the server. The printed probabilities are already rounded.

### The formula the official adapter states

Fetched 2026-10-01, after the snapshot was read. Saved at `adapter/confidence_metrics.py`. Repo `typesafe-ai/system-one-adapter-python`, HEAD `e1d4cc938204b22fc5a3c3aca7044072fe3f712d` (Release v0.2.1, committer date 2026-09-22). The file's last commit, from the commits API filtered to this path, is `fb52b1030b7fc1f4f1cf39910afa5da54f9835e3` (Release v0.1.3, 2026-09-15). This map does not prove the API server calls these functions. It proves the official adapter source defines them.

`choice_confidence`. Docstring: "Scale peak choice probability from uniform to certainty." One option returns 1.0. Otherwise normalize, then:

```
(max(probs) - 1/n) / (1 - 1/n)
```

That is the same algebra as `(n * max(probs) - 1) / (n - 1)`. It matches the docs demo, including the three-option form. The adapter does not clamp; after normalize the peak is at least `1/n`, so the result is in `[0, 1]` aside from float error. The docs demo does clamp, and its formula divides by `count - 1`, so it is not defined for one option. The adapter returns 1.0 for one option.

`score_confidence`. Docstring: "Measure score concentration around its modal score." This is not the choice formula. One level returns 1.0. Otherwise:

- normalize
- mode index = index of the largest probability (first max if tied, because `max` walks the range)
- `distance_from_mode` = sum of `probability * abs(index - mode_index)`
- `uniform_center` = `(n - 1) / 2`
- `uniform_mean_absolute_deviation` = mean of `abs(index - uniform_center)` over the indexes
- return `max(0, 1 - distance_from_mode / uniform_mean_absolute_deviation)`

On the printed three-level examples above, `score_confidence` and `choice_confidence` land on the same 0.01 neighborhood, so those examples do not tell you which function produced `confidence`. They come apart when mass sits far from the mode. For probabilities `[0.5, 0.0, 0.5]`, `choice_confidence` is 0.25 and `score_confidence` is 0.0. Do not use the choice formula on a Score if you are trying to reproduce the adapter.

`_normalize`: divide by the sum. If the sum is 0, return a uniform list.

## 5. How to structure state

`concepts/state.md`, heading `# State`.

> State is the content you ask a System One model to evaluate.

> Each request evaluates one state against one or more questions. All questions see the same state and are evaluated independently.

Heading `## State can be a simple string or a structured JSON value`.

| Shape | The page's use |
| --- | --- |
| String | "A message, article, or passage." |
| Object | "Named fields, related records, or application state." "Use an object for most requests." |
| Array | "A sequence of messages or records." |

> Think of state as the material you would present to a panel of experts before asking them to make a judgment.

The Note: text only. No images, audio, or video.

Heading `## Separate content from questions`.

> The state contains the content and supporting facts. Questions define the judgments the model should make about that material.

`concepts/how-to-build-with-system-one.md`, step "Decompose the input state" under `## Design a System One workflow`.

> Include only the context relevant to the current questions. This helps the model avoid distractions and context rot. Do not rely on knowledge stored in model weights when current information can come from your own knowledge base.

Put the policy, the order, and the message in the state when the decision compares them. Do not leave the policy in the model's weights.

### Backtick paths

`primitives.md`, heading `## Reference specific fields`.

> When a question is about one of those parts, name it in the `instructions` with a dot-and-index path to its key, including the backticks.

The path on that page, against the ticket object in the same section:

```
Does `ticket.messages[0].text` request a refund?
```

and

```
Does `refund_policy` support the refund requested in `ticket.messages[0].text`, given `order.charges`?
```

`concepts/how-to-build-with-system-one.md`, step "Use structure in the input state".

> Use nested JSON for the `state` and `questions` fields. Point questions at specific values when that removes ambiguity, and include the backtick characters around each path inside the question.

The example path on that step is `` `support.tickets[0].message` ``. A later example on the same page uses `` `trace.tool_calls[1].arguments` `` and `` `trace.tool_calls[1].arguments.date` ``. The syntax the pages demonstrate is a dotted path, with `[index]` for arrays, wrapped in backticks. `ticket.messages[0].text` is one example of that syntax, not a special field name.

`official-skill/SKILL.md`, heading `## Design the judgments`.

> Reference nested state with backticked paths such as `ticket.messages[0].text`.

### Structure inside the question

`api.md`, heading `## Question types`, before `### Noul`.

> The `instructions` property can be a string, an object, or an array. You can break up a long question that has extra context, or data it needs to reference, into a structured object. Put the question in one field and the data in the others, and refer to the data fields by name in backticks, the same way you point a question at a nested `state` value.

The page's object:

```
"instructions": {
  "potential_duplicate": { "name": "John Smith", "location": "Oakland, California", "last_employer": "Google" },
  "question": "Is the resume for the same person as `potential_duplicate`?"
}
```

`concepts/how-to-build-with-system-one.md`, step "Use structure in the questions". Start with a string. Use an object or array when the question needs examples, when part of the question is data from your code, or when several questions would otherwise blur together. "When a value comes from a database, put it in its own field instead of splicing it into a string template."

Choice criteria can be objects with the same field names on every option, so the model can compare them. The pages use `what`, `not_for`, and `examples` (`primitives/advanced.md`, heading `### JSON rubric for boundary clarification`). Those names are the example, not a required schema.

Score levels can be objects. `primitives/advanced.md`, heading `## Structured Score levels`, uses `summary` and `signals`. Again, that is the example.

Noul `criteria.true` and `criteria.false` can be objects. `primitives/advanced.md`, heading `## Structured Noul criteria`.

`primitives/advanced.md`, heading `## Where structure is allowed`.

| Field | Question | Shapes the table lists |
| --- | --- | --- |
| `instructions` | all three | string, object, array, or null |
| `criteria` values | Choice | string, object, array, or null |
| `criteria` entries | Score | string, object, array, or null |
| `criteria.true` and `criteria.false` | Noul | string, object, array, or null |

`api.md` marks `instructions` required and types it `string | object | array`, without null. Choice criteria values may be null, and the API says to use null when the option needs no extra detail. Score criteria on `api.md` are `array<string | object | array>`, without null. See section 12.

## 6. The four patterns

`patterns.md`, heading `# Patterns`.

> TypeSafe is designed to sit within a larger system, powering decisions with AI.

The table under `## The patterns`:

| Pattern | What it does, in the page's words | Benefits the page names |
| --- | --- | --- |
| Speculative fan-out | "Send many questions in a single call, including speculative ones, and let your code decide what's relevant" | Cost, Speed |
| Confidence-gated routing | "Utilize confidence as a second decision axis to build safer systems" | Reliability, Safety |
| Composite scoring | "Combine several dimensions of analysis into a single score" | Cost, Reliability, Speed |
| Intent routing | "Classify a user's intent and route to the appropriate handler" | Cost, Speed |

The pattern pages assume you already know the primitives and confidence.

### Fan-out

`patterns/fan-out.md`, the paragraph after the compressor, before `## Example: support ticket triage`.

> Because TypeSafe supports sending many questions in a single API call, we recommend putting all of the questions your system needs in a single request, and then using code to decide what is relevant after the fact. All questions are evaluated in parallel, so adding more questions usually has little effect on response time.

What it is for: one state, many questions, including questions that only matter on some branches. The example asks category, bug severity, reproducible steps, refund requested, and frustration together. If the ticket is not a bug, the code ignores severity. The Note calls `bug_severity` and `has_reproducible_steps` speculative.

Cost is not zero. `primitives/choice.md`, heading `## Good practice: ask more than one question per call`: "Extra questions still cost tokens." `models.md` charges input tokens. The state is ingested once (`models.md`, heading `## Current models`, the context-length bullet).

`primitives.md`, heading `### Ask speculative questions`, points at the parallel-questions cookbook for a measured speedup. The number on that sentence does not match the cookbook. Section 12.

A second round trip is not fan-out. It is the dependency case in section 2.

### Confidence-gated routing

`patterns/confidence-routing.md`, the paragraph before `## Example: voice banking commands`.

> By being intentional with the way you gate decisions on confidence, you can build systems that are both reliable and safe.

The page's own subtitle:

> Use confidence as a second axis. The answer tells you what; confidence tells you whether to act.

What it is for: the Choice (or Score) tells you the label. A separate threshold, higher for a destructive action than for a read, tells you whether to act, confirm, or hand off. The worked example is a voice-banking Choice (`check_balance`, `approve_transfer`, `other`). Its code uses `< 0.6` to a human, balance at 0.6, and transfer only above 0.85. Those numbers are this example. `confidence.md` uses 0.5 and 0.9 for a similar story.

Noul has no `confidence`. Gate a Noul on the `noul` value itself (`primitives/noul.md`, heading `## Reading a Noul`).

### Composite scoring

`patterns/composite-scoring.md`, the paragraph before `## Example: resume screening`.

> Oftentimes we want to rank a set of items based on several criteria at once. Composite scoring is an easy way to think about this: break the judgment into independent dimensions, score each one separately, and combine them with weights you control in code.

What it is for: a judgment that is several Scores, not one prompt that "rates the pitch." The example scores Python depth, team leadership, system design, and generalism, each on five levels (indexes 0 through 4). The code divides each `score` by 4, then applies two weight vectors (senior IC, engineering manager) without a second model call.

`primitives.md`, heading `### Split a complex judgment into several questions`, names this pattern and points at `primitives/score.md` heading `## Splitting a complex judgment into several Score questions`.

`official-skill/SKILL.md`, heading `## Compose and verify`.

> Weighted scores suit compensating preferences; an "any serious violation" rule needs separate conditions. Changing a weight or display filter need not rerun inference when evidence and question meanings are unchanged.

Do not use a weighted mean as a substitute for "any of these is disqualifying." That is a separate Noul, or a rule in code.

### Intent routing

`patterns/intent-routing.md`, the paragraph before `## Example: customer service routing`.

> Not every user request needs the same kind of handler. Some can be answered with a database lookup. Some need an LLM with domain-specific context. Some need a human. TypeSafe can sit in front of all of these as a fast, cheap classifier that determines which handler to invoke.

What it is for: classify first, then call the expensive handler only for the branch that needs it. The example asks a Choice (`order_status`, `product_question`, `return_exchange`, `complaint`) and a Score (`complexity`) in one request. Order status goes to deterministic code. Product and returns go to specialist LLMs. A complaint goes to a human when `complexity.score > 1` or `complexity.confidence < 0.5`, otherwise to an LLM. Intent confidence below 0.5 goes to a human. Those cutoffs are this example.

The page's last paragraph: the meaning of a low confidence "in the context of the system and the stakes of the decision" still has to be decided by you.

## 7. Jev 1.13 jaggedness, failure by failure

`model-jaggedness/jev-1.13.md`, heading `# Jev 1.13 jaggedness`.

> Jev isn't perfect. Here are some jagged edges we are aware of with jev-1.13. Many of these will be fixed in later versions.

The Note: "Applies to `jev-1.13`." "Last reviewed 2026-09-17."

> `jev-1.13` is fast, calibrated, and good at common-sense judgment but it is not perfect. `jev-1.13` does the best on System One tasks. It may struggle with tasks that require additional levels of indirection. It can be quite literal in its understanding. It struggles with tasks that require numeric precision.

The table under `## The failure modes in detail` is the "do this instead" column. The paragraph under each heading is the page's expansion. Both are the contract.

| # | Failure mode | Do this instead |
| --- | --- | --- |
| 1 | Literal reading | Write the exact condition, criteria for each available options |
| 2 | Math and Numbers | Keep the arithmetic in code |
| 3 | Date and time comparison | Extract components; compare in code |
| 4 | Indirection | Reduce hops; point to the relevant state |
| 5 | Large state full of irrelevant detail | Filter first; send only what the question needs |
| 6 | Adversarial content | Write precise prompts, and test edge cases before deploying |
| 7 | Contradictory instructions and criteria | Align the criteria and instruction |
| 8 | Common-sense structural invariants | Ask each decision one way; enforce identities in code |
| 9 | Generation | Use a generative model |

### 1. Literal reading

Heading `## Literal reading`.

> `jev-1.13` answers the question you wrote, not the one you meant. Scoping words, negations, and implied conditions are read at face value.

Instead, same heading: "state the exact condition in the `instructions`. Be specific. Put boundary cases in the criteria. When you look at a wrong answer and find yourself explaining what you really meant, that explanation is the missing half of the instruction. Where interpretation is unavoidable, split it into two literal questions and combine them in code."

### 2. Math and numbers

Heading `## Math and Numbers`.

> Jev is not a calculator. We strongly recommend implementing any mathematical logic in code. Jev will perform better on semantic questions than mathematical ones.

Counting, heading `### Counting`.

> `jev-1.13` does not count reliably. This covers characters in a word, occurrences of a term in a passage, and items in a long list. The model recognizes the shape of an answer rather than tallying, and the error grows with the size of the thing being counted.

Instead: "count in code. When you want to count items matching some criteria, iterate in code over the candidates and ask one question for each, then add up the answers yourself." The sample on the page sets `YES = 0.5` and comments "up to you on what you want the threshold to be, depends on your usecase." The 0.5 there is a Noul cutoff the caller chooses, not a statement that 0.5 means medium.

Numeric form, heading `### Numeric representations`.

> `jev-1.13` will perform better on semantic representations than numeric. For example, questions about colors using hex values will underperform compared to those using the English names.

Instead: "do the conversion in code and pass in either the computed number or a named bucket. Keep the model for the part that is genuinely a judgment, such as whether a color reads as a warning."

Score as a ruler, heading `### Math using score`.

> Please do not use score outputs (e.g., expectations and probability) to compute the exact magnitude of a number between two levels of a criterion.

A threshold on the expectation is allowed. Reconstructing the exact number by interpolation is not. "`jev-1.13`'s score levels are weak in numerical calibration."

### 3. Date and time comparison

Heading `## Date and time comparison`.

> `jev-1.13` reads dates as text, not as ordered quantities. Asking which of two dates comes first, how far apart they are, or whether one falls inside a window is unreliable.

Instead: "split the work. Extraction is a judgment, so give it to the model. Arithmetic is not, so keep it in code." Turn each date part into a Choice over a closed set, with an explicit "not stated" option. "Code assembles the parts into a real date and owns everything after that, including ordering, duration, offset, and weekday." The worked version is `cookbooks/date_extraction_cookbook.md`.

### 4. Indirection

Heading `## Indirection`.

> Instructions carrying double negatives or complex indirection are answered less reliably. A question about a property of a property or something that requires multiple hops of reasoning costs accuracy.

Instead: "write your instructions as directly as possible. When possible, identify the relevant parts of state by name."

### 5. Large state full of irrelevant detail

Heading `## Large state full of irrelevant detail`.

> Accuracy falls as the state grows with content unrelated to the decision. Unrelated detail acts as a distractor, and a large state makes it harder to tell which part of the input produced a wrong answer.

Instead: "retrieve and filter in code first, and send only the fields the question needs. When it's not possible to filter in state, you can use a Noul to filter for relevance."

The Note points at `models.md` for the token cap. The Info at the bottom of the page: "Jev suffers from context rot, so unrelated material in the `state` costs you accuracy." That does not cancel the introduction's claim about extra questions. Questions are isolated. Extra unused state is not free.

### 6. Adversarial content

Heading `## Adversarial content`.

> State is data, and `jev-1.13` does not treat it as hostile by default. Content written to adversarially steer the model, whether that is an injected instruction, a deliberately misleading framing, or text that argues for its own classification, can move the answer.

Instead: "be explicit in the criteria. Test your integration thoroughly before deploying it to many users."

### 7. Contradictory instructions and criteria

Heading `## Contradictory instructions and criteria`.

> When the `instructions` and the `criteria` ask for different things, `jev-1.13` might get confused.

The page's example of a bad Noul: `true` mapped to no, and `false` mapped to yes. Instead: "treat the criteria as an extension of the instruction. Align the two using clear and precise language." This is the same rule as `primitives/noul.md` heading `## Writing a Noul question`: a high value means yes.

### 8. Common-sense structural invariants

Heading `## Common-sense structural invariants`.

> `jev-1.13` is extremely consistent, meaning you should expect quantitatively similar outputs for semantically similar inputs. However there are many structural invariants one might imagine to hold that simply aren't guaranteed by the model.

The page prints two failures.

Same ticket, "Is the customer asking for a refund?", as a Noul and as a yes/no Choice. Noul `0.22`. Choice probabilities `yes 0.01`, `no 0.99`, confidence `0.97`. "The comparable numbers are `noul` and `probabilities["yes"]`, and it is not obvious how to interpret either the Choice output and confidence for the Noul question or vice versa."

A Noul and its negation. `refund` 0.72, `not_refund` 0.47, sum 1.19. "There are many reasons that `P(noul)` and `1 - P(not noul)` may not be directly comparable."

Instead: "don't rely on expected structural invariance, and word questions to mean directly what you want. Don't carry a threshold tuned on a Noul over to a Choice, and don't hold the model to arithmetic identities between separate questions. A Choice over options and one Noul per option answer different questions: the Choice is relative, settling which option, while each Noul is absolute and can be low for all of them."

### 9. Generation

Heading `## Generation`.

> `jev-1.13` is not trained to generate text. While you can force it to by chaining choices, this will not work well and will be very slow. For data extraction, it is better to extract possible options using regex or a generative model and let `jev-1.13` pick the correct extraction.

Instead: "when the answer space is bounded, turn extraction into a Choice over the options rather than asking for the value itself. If you really need to generate text... there are other models for that."

### The page's own avoid-list

The Info at the bottom of `model-jaggedness/jev-1.13.md`:

> Asking the model something code can compute exactly.
>
> Hiding several judgments inside one question.
>
> System Two tasks: more layers of indirections
>
> Giving it more context in `state` than the question needs.

## 8. Models, as printed

`models.md`, heading `# Models`. Every model on the page is served by `POST /v1/systemone`. The `model` field selects it.

Heading `## Current models`. The table, as printed:

| | |
| --- | --- |
| Jev 1.13 | `jev-1.13.0` |
| Price (per Btok / per Mtok) | $42 / $0.042 |
| Rate limits | 100K tokens per second / 40 requests per second |
| Context length | 64k tokens per request; 32k tokens for `state` plus the longest question |
| Input | Text only. String, JSON object, or array of text values. No image, audio, or video input. |

The bullets under the table, same heading:

> Price: Charged per input token. Output tokens are free. A Btok is a billion tokens and an Mtok is a million tokens.

> Rate limits: Measured in tokens per second and requests per second. A request over either limit returns `429 Too Many Requests`.

> Context length: Jev ingests the `state` once and evaluates every question against it in parallel. The 64k budget covers the `state` plus all questions combined; the 32k budget applies to the `state` plus the single longest question.

The Warning on that heading:

> Rate limits are adjusting dynamically. We are serving a very large volume of demand, and the limits above can change without notice while we do, as upcoming large GPU deals land and we let in more users. Once things settle down more, we'll be able to offer more stable limits. Higher limits are available on custom and enterprise plans.

Do not replace the 100K / 40 figures with a number from a secondary writeup. This snapshot prints these, and the same paragraph says they can change without notice.

Heading `## Aliases`.

| Alias | Points to | Meaning, as printed |
| --- | --- | --- |
| `jev-latest` | `jev-1.13.0` | "The most recent stable, official release. The default in our client SDKs, and the name the examples in these docs use." |
| `jev-preview` | `jev-1.13.0` | "The most recent release, whether or not it is an official one. Moves ahead of `jev-latest` when a preview build is available." |

The Warning:

> `jev-preview` currently points to the same model as `jev-latest`. There is no preview build available right now.

> An alias moves when a new release ships, so the answers behind it can change without a change on your side. The response's `model` field reports the versioned ID that answered, so you can log which model produced each result. If you have tuned confidence thresholds against a specific version, pin that version's ID instead of the alias and move to the new one on your own schedule.

`sdk/python/api/constants.md` prints `DEFAULT_MODEL = 'jev-latest'`, `DEFAULT_BASE_URL = 'https://api.typesafe.ai'`, `DEFAULT_TIMEOUT = 10.0` seconds, `API_KEY_ENV = 'TYPESAFE_API_KEY'`, `BASE_URL_ENV = 'TYPESAFE_BASE_URL'`, `DEFAULT_MODEL_ENV = 'TYPESAFE_DEFAULT_MODEL'`.

Heading `## Listing models`. `GET /v1/models` with `Authorization: Bearer $TYPESAFE_API_KEY`. It "currently lists the aliases. Versioned IDs such as `jev-1.13.0` are accepted by the `model` field whether or not they appear in the list." Each entry has `name`, `description`, `release_date`.

Heading `## Language support` and `## Data handling`: section 1.

## 9. API reference

### Endpoint and auth

`api.md`, heading `## Evaluation endpoint`, and `introduction/quickstart.md`, heading `## Call it: the API`.

```
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

The quickstart curl reads the key from `$TYPESAFE_API_KEY`. Keys are created at the dashboard the quickstart links, `https://console.typesafe.ai/keys`. `official-skill/SKILL.md`, heading `## Compose and verify`: "Keep API credentials server-side in web apps."

`GET /v1/models` is the other endpoint this snapshot's models page documents. Section 8.

### Required fields

`api.md`, heading `## Request body`. `state`, `model`, and `questions` are marked required. A question's `type` and `instructions` are required. Choice `criteria` is required. Score `criteria` is required. Noul `criteria` is not required.

Empty questions, extra top-level fields, and a JSON schema for the error body are not printed. Do not invent them.

### Answer shapes

Section 3. Short form from `api.md` headings `### Noul answer`, `### Choice answer`, `### Score answer`.

Noul: `{ "type": "noul", "noul": <0 to 1> }`.

Choice: `{ "type": "choice", "choice": "<option>", "probabilities": { "<option>": <float> }, "confidence": <0 to 1> }`. Probabilities sum to 1.

Score: `{ "type": "score", "score": <weighted index>, "legend": { "<index>": "<description>" }, "probabilities": { "<index>": <float> }, "confidence": <0 to 1> }`. Probabilities sum to 1. `score` may fall between indexes.

The response `model` in the worked examples is `jev-1.13.0` when the request asked for `jev-latest`.

### Errors, as the API page prints them

`api.md`, heading `## Errors`.

> Errors use standard HTTP status codes with a JSON body describing what went wrong.

The table:

| Status | Meaning, as printed |
| --- | --- |
| `401 Unauthorized` | "Missing or invalid API key. Check the `Authorization` header." |
| `422 Unprocessable Entity` | "The request body failed validation — for example a missing required field or a malformed question. The body details the offending field." |
| `429 Too Many Requests` | "You have exceeded your rate limit. Back off and retry after a short delay." |
| `529 Overloaded` | "TypeSafe is temporarily overloaded. Retry after a short delay." |

The page does not print the JSON keys of that body. "The body details the offending field" is all `## Errors` says about the 422 shape. Do not invent `error.message` or `detail`.

Heading `### Handling rate limits`. On 429 or 529, "retry the request with exponential backoff instead of retrying immediately." SDKs "handle this automatically" under the default retry policy. `models.md` says the SDKs "honor the `retry-after` header when the response carries one."

The Python SDK page prints more statuses than that table. `sdk/python/api/exceptions.md`:

| Exception | Status the heading states |
| --- | --- |
| `TypeSafeBadRequestError` | 400 |
| `TypeSafeAuthenticationError` | 401 |
| `TypeSafePermissionDeniedError` | 403 |
| `TypeSafeNotFoundError` | 404 |
| `TypeSafeUnprocessableEntityError` | 422 |
| `TypeSafeRateLimitError` | 429 |
| `TypeSafeInternalServerError` | 5xx |

`TypeSafeAPIError.body` is "The server's JSON error body, plain response text, or `None` for an empty body." `request_id` is the `x-typesafe-request-id` header, or `None`. `TypeSafeRateLimitError.retry_after_ms` is "The server's requested wait in milliseconds, or `None` if unavailable."

`TypeSafeAPIResponseValidationError` is a successful HTTP response whose body failed the SDK's own checks. `field_path` is "Dotted path to the offending field, such as `answers.tone.confidence`." That example path is the SDK's illustration, not a field you send.

`sdk/javascript/api/classes/APIError.md`, heading `### body`. `body` is "Parsed JSON, response text, or `undefined` for an empty body." `requestId` is `x-typesafe-request-id` or `undefined`.

Default Python retry set, `sdk/python/api/retries.md`, the `RetryPolicy` signature: `http_statuses` defaults to `{408, 429, *range(500, 600)}`. That range includes 529. It does not include 422. `max_retries` defaults to 2. `respect_retry_after` defaults to true, and the property text says it honors `Retry-After` and `retry-after-ms`. `timeout` on the policy defaults to 30.0 seconds, which is the retry budget, not the 10.0 second HTTP timeout in `constants.md`.

408, 400, 403, and 404 are on the SDK pages and not in the `api.md` error table. 529 is on the API page and falls inside the SDK's 500–599 retry range, but it has no exception class of its own on the Python exceptions page. Section 12.

## 10. The official agent skill

### Where it was copied from

Repo: https://github.com/typesafe-ai/skills

Commit used: `65a39f393687675ce170e6094757de20370365b9`

That is `main` as of the GitHub API call on 2026-10-01. Committer date 2026-09-12. Subject `Release v0.5.7`. The raw `SKILL.md` at that commit is byte-identical to the copy in `official-skill/SKILL.md` (sha256 `71ea90d7906c6554c4f4c460ef7361b2d26f59116ccdae986dc6d997b9389f52`). `official-skill/COMMIT.txt` records the same facts.

The contents API for `skills/typesafe-ai` at `main` listed two files: `LICENSE`, `SKILL.md`. There is no `references/` directory at this commit. `agent-skill.md` tells you to copy the directory "including its reference files." That sentence does not match the tree. Section 12.

### Install paths, from the docs page

`agent-skill.md`, heading `## Installation`.

Claude Code, two commands:

```
claude plugin marketplace add typesafe-ai/skills
claude plugin install typesafe@typesafe-ai
```

Other agents:

```
npx skills add typesafe-ai/skills --skill typesafe-ai
```

"Installation is project-local by default; add `-g` to install globally."

Manual: "copy the entire skills/typesafe-ai directory, including its reference files, into your agent's skills directory." At this commit that directory is `SKILL.md` plus `LICENSE`.

"Choose one installation method to avoid duplicate copies."

The raw URL the page prints: `https://raw.githubusercontent.com/typesafe-ai/skills/main/skills/typesafe-ai/SKILL.md`.

Updates, heading `### Updates`. Claude Code: `claude plugin marketplace update typesafe-ai`, then `claude plugin update typesafe@typesafe-ai`, then restart or `/reload-plugins`. skills.sh: `npx skills update`. Manual: replace the directory.

Invoke, heading `## Example prompts`. Say "use the TypeSafe skill", or in Claude Code `/typesafe:typesafe-ai`.

Heading `## Good vibe coding principles`. The operative ones: put questions and thresholds in one place; "Agents aren't great at writing questions, so expect to edit collaboratively"; do not take assertions at face value.

Heading `### The agent invents request or response fields`. "A stale skill can cause this. Update it."

### Rules inside SKILL.md

The file's own rule, heading `## Read the live docs`:

> The live TypeSafe docs are the source of truth. Read them as part of the task.

> This skill gives direction; the docs carry current concepts, prompting guidance, API contracts, SDK usage, models, limits, and worked examples.

If the index is down, use the direct links in the skill. If live access is down, "use available local docs or installed SDK types, state that limitation, and avoid inventing version-dependent details." This map is that local reading. It is not a substitute the skill told you to invent past.

The skill's table tells the agent to start at System One and the building guide, the use-case map, State and primitives, Confidence, the HTTP or SDK page, and, for an older integration, `https://docs.typesafe.ai/migrating-to-v1.md`. That migration URL returned 404 on 2026-10-01. The body is saved at `evals/migrating-to-v1.response.txt` and says "Page Not Found." The snapshot index does not list the page. Do not invent a migration.

Heading `## Find the useful shape`. Code keeps "known rules, calculations, exact lookups, and execution." The shapes it names: route and fill known arguments; select a candidate the code already found instead of generating it; judge retrieved evidence; turn judgments into reusable weighted data; verify and escalate; respond to changing state, and "check freshness before applying a result to a changed situation." "Keep inferred state distinct from observed facts."

Heading `## Design the judgments`. The table:

| Need | Primitive | Distinction the skill states |
| --- | --- | --- |
| One of a defined set | Choice | "Picks one option; its distribution compares competing options" |
| Whether a condition holds | Noul | "Probability of yes; no separate confidence; use one per label when several may apply" |
| Degree along a described dimension | Score | "Probability-weighted position on ordered levels; use comparable per-item Scores for graded ranking" |

Also from that heading, in the skill's words:

> Give each question enough relevant state to answer.

> Prefer named JSON fields when context has several parts. Put the judgment in instructions and define its possible answers in criteria.

> Ask one narrow, coherent judgment per question. Split independently useful dimensions, without destroying the relationship being judged. A bounded action selection or contextual interpretation is valid; atomic does not mean literal fact extraction or a one-sentence limit.

> Score levels must describe concrete situations and stand on their own.

> Include a no-match outcome when nothing may fit.

> For source-value selection, check candidate coverage: the model cannot choose an omitted value.

Heading `## Compose and verify`.

> Ask independent questions over the same state together, including useful speculative questions. They run in parallel and cannot see one another's answers. State each speculative premise explicitly; code consumes the applicable answers.

A second request "when an earlier answer is needed to fetch evidence, construct new state, or determine the next options."

> Extra questions still use tokens; measure actual request budgets, cost, and end-to-end latency.

> Typed output guarantees the interface, not truth. System One models are trained for calibrated decisions; validate their performance in the target domain.

> Treat cookbook thresholds and demo results as examples to evaluate, not universal rules or permanent model limitations.

> Keep API credentials server-side in web apps.

The Noul-0.5 sentence and the confidence sentence from this heading are in sections 3 and 4. They match the snapshot. Follow them.

## 11. Workflow evals, what the site says

The launch post claims these evals. The site does not print the homepage multipliers. Read `evals/SITE-TEXT.md` for the transcript. The HTML captures are `evals/index.html` and the four workflow files. Retrieval date 2026-10-01.

Method, from the overview, heading-level prose "How we evaluate" / "Decompose the work, build a harness":

> we ask independent narrow questions and defer to code where possible. We use three types: Noul, yes or no; Choice, one option among several; Score, a level on a scale.

Caveat, "Assume the harness is correct":

> Instead of debating the correctness of the harness and labels, we assume that the code is correct, and measure against the current smartest large models. For this eval, the reference labels are generated via an average of the responses of GPT-6 Astra and Claude Fable 5.1, both at high thinking, answering every question in the harness. All other models are evaluated using the provider's default reasoning settings.

That is agreement with two models, not a human-labeled accuracy. The mean chart caption: each point averages accuracy, cost, and time "over the four workflows with equal weight, against the consensus labels."

Jev's mean point, as labeled: 67.8%, $0.0004 per case, 0.4 s. Sol workflow is labeled 74.1%. Opus 5 workflow is labeled 73.1%. Terra workflow is labeled 67.9%. The chart says nothing is both cheaper and more accurate, and nothing is both faster and more accurate. It does not say Jev is the most accurate.

Jev has no prompt point. Other models have both.

Per workflow, Jev's labeled workflow points: Security Incidents 61.7% / $0.0001 / 0.3 s; Agent Trace Observability 71.6% / $0.0003 / 0.5 s; Invoice Processing 61.8% / $0.0011 / 0.5 s; Customer Service 76.0% / $0.0001 / 0.4 s. On invoices, several models are labeled more accurate than Jev. The full grids are in `evals/SITE-TEXT.md`.

The overview says that, averaged across the four tasks, every model is more accurate, cheaper, and faster as a workflow than as a prompt. Individual charts break that for some cells. DS v4 flash on security incidents is the clear accuracy reversal (37.9% workflow, 44.6% prompt). Details in the transcript.

The four pages describe the workflows in prose and name five cases each (one model differs, all three miss, all three agree). They do not add a second method section. Sums, dates, account numbers, and statuses in the invoice workflow "are computed in code rather than asked."

### What the launch post adds, and where it disagrees

Fetched later the same day: https://typesafe.ai/blog/introducing-system-one-models-and-jev. Capture: `evals/launch-introducing-system-one-models-and-jev.html`. Byline Sep 15, 2026. HTML comment: Published Sep 28, 2026, 7:32 PM UTC.

The post says the homepage claims "193.6x faster, 444.6x cheaper" come from these evals, "and we expect that these are on the higher end of real world gains." The homepage HTML contains `193.6x Faster, 444.6x Cheaper.` The evals HTML does not contain `193.6` or `444.6`.

The post also says the reference is "the average of GPT-6 Astra and Fable 5.1", that this "biases answers towards OpenAI and Anthropic's models", that the workflows were written by the model capabilities team so "some bias could exist", and that comparison LLMs "use our System One LLM wrapper." The evals site says "Claude Fable 5.1" and "high thinking", and it does not print the bias sentence or the wrapper sentence.

Do not quote 193.6x or 444.6x as a figure the evals site measured in public. Quote the labeled points.

## 12. Disagreements

Quoted so a later reader does not average them.

### Inside the 2026-10-01 docs snapshot

Parallel-questions speedup. `primitives.md`, heading `### Ask speculative questions`:

> batching 13 questions into one call is 11.5x cheaper and 9.6x faster than 13 separate calls, with no change in the answers.

`cookbooks/parallel_questions.md`, the opening blockquote, and the printed result line near the end of that file:

> batching every question into one TypeSafe call is 12.2x cheaper and 10.0x faster with no change in answers.

The index line in `originals/pages/docs.typesafe.ai-llms.txt` matches the cookbook: "12.2x cheaper and 10.0x faster." The cookbook is the page that computes the figure. The primitives page, in the same snapshot, still says 11.5x and 9.6x. This map did not re-download either page.

"Highest confidence." `agent-skill.md`, heading `### You're using confidence thresholds everywhere`, says to "choose the option with the highest confidence." `primitives/choice.md`, heading `## Response structure`, says `choice` is "The option with the highest probability" and `confidence` is computed from the spread. There is one `confidence` per Choice answer. Obey the Choice page.

Context rot. `introduction.md`, heading `## TypeSafe primitives`: adding questions "does not create context-rot." `model-jaggedness/jev-1.13.md`, the Info under `## Generation`: unrelated material in `state` is context rot and costs accuracy. Extra questions are not extra unused state.

Null instructions. `primitives/advanced.md`, heading `## Where structure is allowed`, lists `null` for `instructions` and for Score level entries. `api.md`, heading `## Question types`, types `instructions` as `string | object | array` and required, and Score `criteria` as `array<string | object | array>`. Choice null descriptions are allowed on both pages. Do not send null instructions.

Status codes. `api.md` heading `## Errors` lists 401, 422, 429, 529. `sdk/python/api/exceptions.md` also names 400, 403, 404, and 5xx. The Python retry default includes 408 and 500–599, which covers 529, and excludes 422. Neither page prints an error JSON schema.

Example thresholds. 0.5 and 0.9 on `confidence.md`. 0.6 and 0.85 on `patterns/confidence-routing.md`. 0.5 on `patterns/intent-routing.md`. 0.8 on `concepts/how-to-build-with-system-one.md`, step "Route on uncertainty". The skill says these are examples.

### Snapshot versus a later fetch

Skill tree. `agent-skill.md`, heading `## Installation`: copy `skills/typesafe-ai` "including its reference files." GitHub contents API on 2026-10-01, commit `65a39f393687675ce170e6094757de20370365b9`: `LICENSE` and `SKILL.md` only. No references directory. The local clone at `originals/github/typesafe-ai-skills` is that same commit.

Migration page. `official-skill/SKILL.md`, heading `## Read the live docs`, links `https://docs.typesafe.ai/migrating-to-v1.md`. Fetched 2026-10-01: HTTP 404, body "Page Not Found", saved at `evals/migrating-to-v1.response.txt`. The snapshot index does not list that path.

Confidence formula. The snapshot demo states `(3 × largest probability − 1) / 2` as an approximation for three options, and its source uses `(count * peak - 1) / (count - 1)`. The adapter file fetched later states that choice formula exactly, and states a different `score_confidence`. Section 4. The snapshot never prints the mean-absolute-deviation formula.

Evals multipliers. The launch post fetched 2026-10-01 attributes `193.6x faster, 444.6x cheaper` to the workflow evals. `evals/index.html` and the four workflow pages do not contain those strings. They do contain the labeled points in `evals/SITE-TEXT.md`. The launch post says `Fable 5.1`. The evals page says `Claude Fable 5.1`, "both at high thinking."

Speed. `concepts/how-to-build-with-system-one.md`, heading `## What makes System One composable`: "Most queries complete in about 100 ms." The launch post, not the docs snapshot: "End-to-end response time is 70ms-500ms for TypeSafe." The evals site's per-case times are whole workflows, not one call. Jev's mean workflow point is labeled 0.4 s. That is not a contradiction of a 100 ms single call, and it is also not evidence for 100 ms.

## What this map does not prove

- It does not prove the API server executes `adapter/confidence_metrics.py`. It proves the adapter source defines those two functions, and it shows how they sit next to the docs demo.
- It does not prove a live rate limit. The snapshot prints 100K tokens per second and 40 requests per second, and warns that those numbers move.
- It does not prove an error JSON schema. None is printed.
- It does not re-measure the evals. The labels are what the HTML contained on 2026-10-01.
- It does not replace `official-skill/SKILL.md`. The skill still says to read the live docs for the task in front of you.
