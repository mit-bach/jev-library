<!-- source: https://docs.typesafe.ai/api -->
<!-- crawled: 2026-09-17 via grub-crawler -->

# API reference

Evaluate a`state`against a map of typed`questions`and get back structured`answers`, one per question. For a guided introduction, start with the[primitives](primitives.md).

## Evaluation endpoint

```
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

## Request body

The top-level shape of every request. Each entry in the`questions`map is a typed question you name.[](api.md#param-state)string | object | arrayrequiredThe content to evaluate. A plain string for text, or structured data (object/array) for things like chat logs, records, or the current state of your application. See[State](concepts/state.md)for formats and best practices.[](api.md#param-model)stringrequiredThe model that handles the request. Use`"jev-latest"`, TypeSafe’s flagship model.[](api.md#param-questions)map<string, Question>requiredA map of typed[Question](api.md#question-types)objects. You choose each key; answers come back under the same keys.Showmap entries

[](api.md#param-question-id)QuestionA key you choose. The matching[Answer](api.md#answer-types)is returned under this same id. The key is not sent to the underlying model and is not used in inference.Example request```

{
 "state": "Help! My payouts have been failing for 3 days.",
 "model": "jev-latest",
 "questions": {
 "is_urgent": {
 "type": "noul",
 "instructions": "Does this convey urgency?"
 }
 }
}
```

## Question types

A`Question`is one of three types, set by its`type`field. All three share`type`and`instructions`; each adds its own`criteria`.

### Noul

A yes/no question. Returns the probability the answer is yes.[](api.md#param-type)"noul"required[](api.md#param-instructions)string | object | arrayrequiredThe yes/no question to evaluate.[](api.md#param-criteria)objectOptional descriptions of what a yes and a no mean.Showproperties

[](api.md#param-true)stringWhat a yes (value near 1) means.[](api.md#param-false)stringWhat a no (value near 0) means.Example request```

{
 "state": "Help! My payouts have been failing for 3 days.",
 "model": "jev-latest",
 "questions": {
 "is_urgent": {
 "type": "noul",
 "instructions": "Does this convey urgency?",
 "criteria": {
 "true": "Explicitly time-sensitive",
 "false": "No urgency expressed"
 }
 }
 }
}
```

### Choice

Picks one option from a set you define. Returns the chosen option and the full probability distribution.[](api.md#param-type-1)"choice"required[](api.md#param-instructions-1)string | object | arrayrequiredWhat the model should decide.[](api.md#param-criteria-1)map<string, string | null>requiredA map of option to rubric description; use null when an option needs no extra detail.Showmap entries

[](api.md#param-option)string | nullA key you choose. A description of this option.Example request```

{
 "state": "Help! My payouts have been failing for 3 days.",
 "model": "jev-latest",
 "questions": {
 "department": {
 "type": "choice",
 "instructions": "Which team should handle this?",
 "criteria": {
 "billing": "Payments, invoicing, refunds",
 "technical": "Bugs, outages, integrations",
 "sales": "Pricing, upgrades, new accounts"
 }
 }
 }
}
```

### Score

Rates the state along a rubric you define. Returns a probability-weighted value across your levels.[](api.md#param-type-2)"score"required[](api.md#param-instructions-2)string | object | arrayrequiredWhat the model should rate.[](api.md#param-criteria-2)arrayrequiredAn ordered array of level descriptions. You must include at least two levels.Example request```

{
 "state": "Help! My payouts have been failing for 3 days.",
 "model": "jev-latest",
 "questions": {
 "frustration": {
 "type": "score",
 "instructions": "How frustrated is the customer?",
 "criteria": ["Calm", "Frustrated", "Very angry"]
 }
 }
}
```

## Response body

One answer per question, returned under the same ids you provided.[](api.md#param-model-1)stringrequiredThe model that performed the evaluation.[](api.md#param-answers)map<string, Answer>requiredOne[Answer](api.md#answer-types)per question, keyed by the same ids you used in questions.Showmap entries

[](api.md#param-question-id-1)AnswerThe same id you chose in questions.[](api.md#param-usage)objectrequiredToken usage for the request.Showproperties

[](api.md#param-input-tokens)integer[](api.md#param-output-tokens)integerExample response```

{
 "model": "jev-latest",
 "answers": {
 "is_urgent": {
 "type": "noul",
 "noul": 0.92
 }
 },
 "usage": { "input_tokens": 312, "output_tokens": 48 }
}
```

## Answer types

Every answer carries a`type`matching its question. Choice and Score answers also carry a`confidence`between 0 to 1, derived from the answer’s probability distribution. See[Confidence](confidence.md).

### Noul answer

[](api.md#param-type-3)"noul"required[](api.md#param-noul)numberrequiredThe yes/no answer on a scale from 0 (no) to 1 (yes).Example response```

{
 "model": "jev-latest",
 "answers": {
 "is_urgent": {
 "type": "noul",
 "noul": 0.92
 }
 },
 "usage": { "input_tokens": 312, "output_tokens": 48 }
}
```

### Choice answer

[](api.md#param-type-4)"choice"required[](api.md#param-choice)stringrequiredThe highest-probability option.[](api.md#param-probabilities)map<string, number>requiredEvery option mapped to its probability (floats that sum to 1).Showmap entries

[](api.md#param-option-1)numberAn option you defined in criteria.[](api.md#param-confidence)numberrequiredHow certain the model is, derived from probabilities.Example response```

{
 "model": "jev-latest",
 "answers": {
 "department": {
 "type": "choice",
 "choice": "technical",
 "probabilities": { "billing": 0.08, "technical": 0.85, "sales": 0.07 },
 "confidence": 0.82
 }
 },
 "usage": { "input_tokens": 312, "output_tokens": 48 }
}
```

### Score answer

[](api.md#param-type-5)"score"required[](api.md#param-score)numberrequiredThe probability-weighted answer across the levels; can land between levels.[](api.md#param-legend)map<string, string>requiredEach level number mapped back to its description.[](api.md#param-probabilities-1)map<string, number>requiredEach level (string key) mapped to its probability (floats that sum to 1).Showmap entries

[](api.md#param-level)numberA level index, as a string key matching legend.[](api.md#param-confidence-1)numberrequiredHow certain the model is, derived from probabilities.Example response```

{
 "model": "jev-latest",
 "answers": {
 "frustration": {
 "type": "score",
 "score": 1.6,
 "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
 "probabilities": { "0": 0.05, "1": 0.3, "2": 0.65 },
 "confidence": 0.78
 }
 },
 "usage": { "input_tokens": 312, "output_tokens": 48 }
}
```

## Errors

Errors use standard HTTP status codes with a JSON body describing what went wrong.| Status | Meaning |
| --- | --- |
| 401 Unauthorized | Missing or invalid API key. Check the Authorization header. |
| 422 Unprocessable Entity | The request body failed validation — for example a missing required field or a malformed question. The body details the offending field. |
| 429 Too Many Requests | You have exceeded your rate limit. Back off and retry after a short delay. |
| 529 Overloaded | TypeSafe is temporarily overloaded. Retry after a short delay. |

### Handling rate limits

When you receive a`429 Too Many Requests`or`529 Overloaded`response, retry the request with exponential backoff instead of retrying immediately. Our client SDKs handle this automatically, so no extra handling is needed if you use one of our SDKs with its default retry policy.
