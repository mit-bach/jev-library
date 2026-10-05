# What evals.typesafe.ai said on 2026-10-01

This file is a transcript of visible prose and of the SVG point labels in the HTML saved beside it. It is not a second source. The HTML files are the capture. Strings that are not in those files are not claimed here.

Retrieved 2026-10-01 with plain HTTPS. The pages are HTML documents, not an empty JavaScript shell. `viewer.js` is referenced; the method text, workflow steps, case names, and chart labels below are in the HTML.

The string `193.6` does not occur on the evals site. The string `444.6` does not occur on the evals site. A `193` that appears in `index.html` is an SVG `y` coordinate.

## Overview

Source file: `evals/index.html`. URL: https://evals.typesafe.ai/

Title: Workflow evals.

> Structured workflows for automation tasks
>
> Real world tasks can be executed via structured workflows or standalone prompts. Structure is always better.

Chart annotations, printed twice (cost lens and time lens):

> frontier: nothing is both cheaper and more accurate
>
> frontier: nothing is both faster and more accurate

Caption under the mean charts:

> Each point averages one model configuration's accuracy, cost and time over the four workflows with equal weight, against the consensus labels. Every model runs at its provider's default reasoning setting. Up and to the left is better.

### Mean points, as labeled

Each label is `model · route · accuracy · cost per case USD · seconds per case`. Jev has a workflow point and no prompt point.

| Model | Route | Accuracy | Cost | Time |
| --- | --- | --- | --- | --- |
| haiku 4.5 | workflow | 53.6% | $0.0195 | 12.5 s |
| haiku 4.5 | prompt | 18.1% | $0.0363 | 21.2 s |
| opus 5 | workflow | 73.1% | $0.1761 | 37.8 s |
| opus 5 | prompt | 64.8% | $0.3417 | 70.5 s |
| sonnet 5 | workflow | 67.8% | $0.1174 | 78.1 s |
| sonnet 5 | prompt | 60.4% | $0.2251 | 149.2 s |
| DS v4 flash | workflow | 64.4% | $0.0059 | 51.9 s |
| DS v4 flash | prompt | 59.3% | $0.0132 | 120.1 s |
| DS v4 pro | workflow | 65.5% | $0.0413 | 86.5 s |
| DS v4 pro | prompt | 59.7% | $0.0907 | 192.1 s |
| luna | workflow | 66.8% | $0.0033 | 12.9 s |
| luna | prompt | 51.9% | $0.0079 | 27.3 s |
| sol | workflow | 74.1% | $0.0836 | 23.3 s |
| sol | prompt | 63.4% | $0.2005 | 48.6 s |
| terra | workflow | 67.9% | $0.0304 | 10.1 s |
| terra | prompt | 61.6% | $0.0750 | 25.1 s |
| Jev | workflow | 67.8% | $0.0004 | 0.4 s |

Jev's mean accuracy on this page ties sonnet 5 workflow (67.8%) and sits under sol workflow (74.1%), opus 5 workflow (73.1%), and terra workflow (67.9%). The frontier sentences are Pareto claims (nothing is both cheaper and more accurate; nothing is both faster and more accurate). They are not a claim that Jev is the most accurate point.

## How we evaluate

Heading on the page: How we evaluate.

### Decompose the work, build a harness

> To automate a task, we decompose the decisions into programmatic rules and intelligent judgments. Rather than ask a model to solve the entire problem in one shot (like the prompt examples in the plot), we ask independent narrow questions and defer to code where possible. We use three types: Noul, yes or no; Choice, one option among several; Score, a level on a scale. The results are then used programmatically to produce the output actions. Averaged across the four example tasks, every model is more accurate, cheaper and faster in the workflow than it is with the same policy as a prompt.

Primitive gloss on the same page:

> Noul · yes or no. The model gives a probability.
>
> Choice · one option from a defined set. The model gives a distribution over the choices, as well as confidence.
>
> Score · a continuous rating on a scale. The model gives a score, distribution over the levels, and confidence.

The page links that gloss to https://docs.typesafe.ai/primitives.

The sentence about "every model" is about the four-task average. Individual workflow charts on the same site do not show workflow winning every cell. Examples read off the labels below: on Security Incidents, DS v4 flash workflow accuracy is 37.9% and its prompt accuracy is 44.6%. On Agent Trace Observability, DS v4 pro workflow accuracy is 71.6% and its prompt accuracy is 72.1%, and sol workflow time is 40.3 s against a prompt time of 37.0 s. On Customer Service, haiku 4.5 workflow time is 8.8 s against a prompt time of 7.6 s. On Security Incidents, opus 5 workflow time is 15.1 s against a prompt time of 13.5 s.

### Toy example: expense claims

> A toy example. The policy on the left is the kind of paragraph a team writes down; the chart on the right is the same policy as a workflow. Each sentence became either a question for the model, with a type, or a rule for the code.

Policy, as printed:

1. Every claim comes with a receipt. If the receipt cannot be read, ask the employee for a new one.
2. Work out what kind of expense it is: a meal, travel, or equipment.
3. A meal over $75 needs a manager's sign-off when the description on the claim does not clearly match the receipt.
4. Everything else is approved.

The diagram's code side, as printed: if the receipt cannot be read, the action is NEW RECEIPT. If it is a meal over $75 whose description does not clearly match, the action is MANAGER REVIEW. Anything else is APPROVE. The model side reads the receipt and the claim form, whether the receipt can be read, the kind of expense, and how clearly the description matches the receipt, on four levels.

### Assume the harness is correct

> Instead of debating the correctness of the harness and labels, we assume that the code is correct, and measure against the current smartest large models. For this eval, the reference labels are generated via an average of the responses of GPT-6 Astra and Claude Fable 5.1, both at high thinking, answering every question in the harness. All other models are evaluated using the provider's default reasoning settings.

That paragraph is the site's caveat. It does not say the labels are human ground truth. It does not print a bias warning. It does not mention a System One LLM wrapper. Those sentences are on the launch post, not on this site. See the launch section below.

## The four workflows

Each workflow page repeats this case method:

> A handful of cases: for each model, one where it alone differs from the other two; one where all three miss the reference; one where all three agree. Each model's path is drawn on the chart in its own colour and line style. Where paths share a stretch, the lines run side by side. What no model reached is faded. Underlined questions open below with every model's answer and the state it read.

The per-question answers and the state each question read are inside the saved HTML (flowchart text and the examples view). This transcript records the prose, the case names, and the chart labels. It does not retype every flowchart node.

### Security Incidents

File: `evals/security_incidents.html`. URL: https://evals.typesafe.ai/security_incidents.html

Subtitle: Handling a security incident: close it, queue it, or contain it.

> An alert has fired. What should be done?

Input, as named: the alert; the asset; open tickets; registered devices; scheduled maintenance; standing authorizations.

Output, one of: AUTO CLOSE, NOTIFY USER, ESCALATE TIER2, KILL PROCESS, DISABLE ACCOUNT, ESCALATE URGENT.

Workflow:

1. Read the alert. "Three questions about the alert and the records joined to it: was the activity unauthorized, does a record explain it, and how strong is the evidence?"
2. Close, queue, or act. "The code combines the three answers with how important the machine is and where it runs. Borderline identity alerts also notify the user."
3. The state of the incident. "Acting opens eleven more questions: credentials, live sessions, mail, anything left behind to run later, processes, network traffic, and how far the activity spread."
4. Choose the response. "The playbook takes the first group whose conditions are met, then the strongest step in it that still applies. When no group applies, the alert is escalated."

Cases:

| Case | What the page says about it |
| --- | --- |
| Network sniffing while badge onsite | Opus differs from the other two |
| WinRM access on production server | Sol differs from the other two |
| LSASS memory dump via comsvcs | TypeSafe differs from the other two |
| Amsi.dll renamed as WinAppXRT | All three miss the reference |
| Python startup hook via calc.exe | All three agree |

Point labels:

| Model | Route | Accuracy | Cost | Time |
| --- | --- | --- | --- | --- |
| haiku 4.5 | workflow | 58.8% | $0.0047 | 3.4 s |
| haiku 4.5 | prompt | 17.1% | $0.0068 | 4.6 s |
| opus 5 | workflow | 66.2% | $0.0574 | 15.1 s |
| opus 5 | prompt | 62.9% | $0.0619 | 13.5 s |
| sonnet 5 | workflow | 60.8% | $0.0271 | 18.9 s |
| sonnet 5 | prompt | 51.7% | $0.0506 | 37.5 s |
| DS v4 flash | workflow | 37.9% | $0.0032 | 37.4 s |
| DS v4 flash | prompt | 44.6% | $0.0037 | 41.9 s |
| DS v4 pro | workflow | 41.7% | $0.0234 | 60.0 s |
| DS v4 pro | prompt | 37.1% | $0.0267 | 66.3 s |
| luna | workflow | 52.1% | $0.0013 | 7.0 s |
| luna | prompt | 29.6% | $0.0021 | 13.4 s |
| sol | workflow | 62.5% | $0.0295 | 8.5 s |
| sol | prompt | 45.8% | $0.0472 | 14.0 s |
| terra | workflow | 51.2% | $0.0119 | 5.7 s |
| terra | prompt | 45.4% | $0.0140 | 7.1 s |
| Jev | workflow | 61.7% | $0.0001 | 0.3 s |

### Agent Trace Observability

File: `evals/agent_trace_observability.html`. URL: https://evals.typesafe.ai/agent_trace_observability.html

Subtitle: Watching over finished agent runs: which need attention, and how urgently.

> Analyze an agent trace from a customer support log. What followups are needed?

Input: the agent's instructions; the conversation; tool calls; the final message; customer feedback.

Output, one of: AUTO-CLOSE, NOT A BUG, HUMAN REVIEW, PRIORITY REVIEW, FILE ISSUE · ROUTE, PAGE ON-CALL.

Workflow:

1. Permission on irreversible actions. "Every action the agent took that cannot be undone is measured against what it was permitted to do at that point in the run. A breach pages on-call and the review ends there."
2. Task completion and user satisfaction. "Did the task get done, and was the user satisfied? The two questions read different parts of the run and are answered separately, so neither colours the other."
3. Healthy, expectation gap, or failure. "The two answers select one of four outcomes: healthy, an expectation gap, an overt failure, or a silent failure. Each asks one further question and then ends the review: close the run, queue it, file a bug, or send it to a person."

Cases:

| Case | What the page says about it |
| --- | --- |
| Email update already on file | Opus differs from the other two |
| Frozen schedule board cache purge | Sol differs from the other two |
| Stale database grant cleanup request | TypeSafe differs from the other two |
| Referral booking with cost discrepancy | All three miss the reference |
| Duplicate shifts prompt cache purge | All three agree |

Point labels:

| Model | Route | Accuracy | Cost | Time |
| --- | --- | --- | --- | --- |
| haiku 4.5 | workflow | 57.2% | $0.0100 | 7.1 s |
| haiku 4.5 | prompt | 29.3% | $0.0163 | 9.3 s |
| opus 5 | workflow | 75.2% | $0.1033 | 27.4 s |
| opus 5 | prompt | 63.5% | $0.1642 | 37.5 s |
| sonnet 5 | workflow | 68.0% | $0.0545 | 38.0 s |
| sonnet 5 | prompt | 65.8% | $0.0863 | 53.0 s |
| DS v4 flash | workflow | 73.0% | $0.0043 | 51.7 s |
| DS v4 flash | prompt | 68.5% | $0.0063 | 62.7 s |
| DS v4 pro | workflow | 71.6% | $0.0357 | 90.1 s |
| DS v4 pro | prompt | 72.1% | $0.0424 | 92.6 s |
| luna | workflow | 76.1% | $0.0025 | 14.5 s |
| luna | prompt | 66.2% | $0.0038 | 15.1 s |
| sol | workflow | 76.6% | $0.0575 | 40.3 s |
| sol | prompt | 73.9% | $0.0907 | 37.0 s |
| terra | workflow | 73.0% | $0.0209 | 11.4 s |
| terra | prompt | 72.5% | $0.0350 | 14.9 s |
| Jev | workflow | 71.6% | $0.0003 | 0.5 s |

### Invoice Processing

File: `evals/invoice_processing.html`. URL: https://evals.typesafe.ai/invoice_processing.html

Subtitle: Processing an invoice: whether it can be paid, and what must happen first.

> An invoice was received. Should it be paid?

Input: the invoice; the purchase order; the contract; the vendor record; prior invoices; correspondence; delivery evidence; approvals.

Output, any that apply: PAY, SCHEDULE, SHORT PAY, ROUTE FOR APPROVAL, HOLD FOR DOCUMENTS, REQUEST CORRECTED INVOICE, DISPUTE LINES, FRAUD REVIEW, DUPLICATE.

Workflow:

1. Read the documents. "Seven rounds of questions, one subject at a time. Sums, dates, account numbers and statuses are computed in code rather than asked."
2. Reasons to stop. "Four conditions end the review immediately: a fraud pattern, an invoice already paid, the wrong vendor or company, or a document that is not an invoice."
3. Holds, disputes and corrections. "Three rule lists run side by side. Every rule that applies adds its actions: hold the invoice, dispute particular lines, or request a corrected copy."
4. Releasing the payment. "A sequence of yes-or-no checks decides how the payment leaves: sent for approval, held for a signature, paid in the undisputed part, scheduled, or paid."

Cases:

| Case | What the page says about it |
| --- | --- |
| Prorated equipment support retainer invoice | Opus differs from the other two |
| CPA invoice from lookalike domain | Sol differs from the other two |
| Vulnerability scan invoice courier fee | TypeSafe differs from the other two |
| Photography invoice with cryptic codes | All three miss the reference |
| Tax compliance invoice wrong entity | All three agree |

Point labels:

| Model | Route | Accuracy | Cost | Time |
| --- | --- | --- | --- | --- |
| haiku 4.5 | workflow | 42.9% | $0.0558 | 30.8 s |
| haiku 4.5 | prompt | 6.0% | $0.0763 | 63.4 s |
| opus 5 | workflow | 78.4% | $0.4856 | 92.1 s |
| opus 5 | prompt | 66.9% | $0.7699 | 188.7 s |
| sonnet 5 | workflow | 72.9% | $0.3616 | 241.3 s |
| sonnet 5 | prompt | 62.4% | $0.5548 | 409.4 s |
| DS v4 flash | workflow | 69.8% | $0.0133 | 84.1 s |
| DS v4 flash | prompt | 58.2% | $0.0288 | 281.7 s |
| DS v4 pro | workflow | 72.7% | $0.0830 | 137.4 s |
| DS v4 pro | prompt | 63.8% | $0.2039 | 474.4 s |
| luna | workflow | 67.8% | $0.0081 | 21.4 s |
| luna | prompt | 55.1% | $0.0160 | 61.5 s |
| sol | workflow | 79.1% | $0.2152 | 34.3 s |
| sol | prompt | 65.1% | $0.4338 | 118.4 s |
| terra | workflow | 74.7% | $0.0778 | 17.3 s |
| terra | prompt | 64.0% | $0.1618 | 62.0 s |
| Jev | workflow | 61.8% | $0.0011 | 0.5 s |

On this workflow Jev's labeled accuracy (61.8%) is below sol (79.1%), opus 5 (78.4%), terra (74.7%), sonnet 5 (72.9%), DS v4 pro (72.7%), DS v4 flash (69.8%), and luna (67.8%). The page still draws the same two frontier sentences.

### Customer Service

File: `evals/customer_service.html`. URL: https://evals.typesafe.ai/customer_service.html

Subtitle: Choosing a support assistant's next actions on a customer's turn.

> A customer is actively asking for support. What should the assistant do next?

Input: the conversation; the customer record; the account; a pending proposal.

Output, any that apply, sometimes none: SAY, REFUND, FREEZE CARD, SET INTENT, HAND OFF, FLAG FOR REVIEW, CLOSE.

Workflow:

1. Intent, frustration and risk flags. "Eleven readings of the conversation at once: what the customer wants and how they want it resolved, how frustrated they sound, how urgent it is, and flags such as unauthorized activity, a legal threat, or a request for a person."
2. Consent, fraud, money, retention. "Four follow-ups, plus a tie-break when two intents are close. Each runs only when the first reading calls for it, with the records it needs attached: the pending proposal, the ledger and card status, the refund or fee on file, the subscription."
3. Check the assistant's claims. "The assistant's own messages are compared with the record: did it tell the customer a refund had gone through, or that the card was frozen, when neither had happened?"
4. Safety first, then the issue at hand. "Nine sections run top to bottom: safety, the assistant's claims, a pending proposal, handing off, closing, then the issue itself. The first rule that applies in a section emits its actions; when none applies, the next section runs."

Cases:

| Case | What the page says about it |
| --- | --- |
| Charged again after cancellation | Opus differs from the other two |
| Repeat duplicate charge root cause | Sol differs from the other two |
| Espresso machine impulse return refund | TypeSafe differs from the other two |
| Frustrated customer threatens to cancel | All three miss the reference |
| Overdraft fee hardship referral | All three agree |

Point labels:

| Model | Route | Accuracy | Cost | Time |
| --- | --- | --- | --- | --- |
| haiku 4.5 | workflow | 55.4% | $0.0074 | 8.8 s |
| haiku 4.5 | prompt | 19.9% | $0.0459 | 7.6 s |
| opus 5 | workflow | 72.4% | $0.0579 | 16.6 s |
| opus 5 | prompt | 66.0% | $0.3710 | 42.2 s |
| sonnet 5 | workflow | 69.3% | $0.0264 | 14.3 s |
| sonnet 5 | prompt | 61.6% | $0.2085 | 96.7 s |
| DS v4 flash | workflow | 76.8% | $0.0029 | 34.6 s |
| DS v4 flash | prompt | 65.8% | $0.0139 | 93.9 s |
| DS v4 pro | workflow | 76.1% | $0.0232 | 58.6 s |
| DS v4 pro | prompt | 65.8% | $0.0898 | 134.9 s |
| luna | workflow | 71.4% | $0.0013 | 8.8 s |
| luna | prompt | 56.9% | $0.0094 | 19.2 s |
| sol | workflow | 78.3% | $0.0323 | 10.1 s |
| sol | prompt | 69.0% | $0.2303 | 24.9 s |
| terra | workflow | 72.7% | $0.0111 | 6.0 s |
| terra | prompt | 64.4% | $0.0894 | 16.3 s |
| Jev | workflow | 76.0% | $0.0001 | 0.4 s |

## Launch post, fetched the same day, which is not this site

File: `evals/launch-introducing-system-one-models-and-jev.html`. URL: https://typesafe.ai/blog/introducing-system-one-models-and-jev

The HTML comment says `Published Sep 28, 2026, 7:32 PM UTC`. The visible byline is `Sep 15, 2026`, `Diogo Almeida, founder, TypeSafe`.

The post tells the reader to see the evals site "for all the details: examples, disagreements, full queries, and each workflow." The multipliers are the post's claim about the homepage, not a number printed on the evals site:

> This is where the claims of 193.6x faster, 444.6x cheaper on our home page comes from, and we expect that these are on the higher end of real world gains.

The TypeSafe homepage HTML, fetched the same day from https://typesafe.ai/, contains the visible string `193.6x Faster, 444.6x Cheaper.` It does not, in the fragment around that string, say which two points were divided.

Other launch-post sentences about these evals that the evals pages do not print:

> We don’t optimize for a ground truth classification or allow the harness and model to change (potentially allowing for overfitting via harness engineering). Instead, we assume there is a correct compute graph (a “workflow” represented in code) and use the predictions of the largest, smartest, and most expensive external models as reference probabilities.

> Rephrased: every model gets the same workflow. We test how they compare to the average of the smartest models (in this case, Astra and Fable).

> These content of these workflows were not deliberately chosen nor constructed to make our model look good, and are not in our training distribution. However, they were made by individuals on our model capabilities team, so some bias could exist.

> We use the average of GPT-6 Astra and Fable 5.1 as the reference answer, which biases answers towards OpenAI and Anthropic’s models. We likely underestimate the relative performance of our model and DeepSeek’s models.

> The LLMs use our System One LLM wrapper, which constrains LLMs to output structured decisions compatible with our API. We have found this to be the most accurate way to get decisions from LLMs, but this tends to be slower and more expensive than giving decisions without probabilities.

> We truly are that fast, though our published evals are generally run from our laptops on the West Coast (this is where our service is currently based).

Name disagreement, same fact, later page is more specific: the launch post says `Fable 5.1`. The evals overview says `Claude Fable 5.1` and adds `both at high thinking`. The evals overview also says other models use `the provider's default reasoning setting`. The launch post's workflow section does not say "high thinking" or "default reasoning".

The evals site does not contain `193.6`, `444.6`, `wrapper`, `bias`, or `OpenRouter`.
