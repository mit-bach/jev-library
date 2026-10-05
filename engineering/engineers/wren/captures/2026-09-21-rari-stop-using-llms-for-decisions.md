author: rari
handle: @0xwhrrari
post id: 2102020016539324501
timestamp: 2026-09-21T13:00:00Z
url: https://x.com/0xwhrrari/status/2102020016539324501
engagement: likes 505, reposts 49, quotes 25, replies 46, bookmarks 1175, views 764239
article url: https://x.com/i/article/2101963175180582912
article title: Jev Engineering: Stop Using LLMs for Every Decision
_disclaimer: This is a saved post, not an official TypeSafe document.
This is a saved post, not an official TypeSafe document.

Retrieval note: fxtwitter article body. This is a community essay. It is not the jev-engineering paper in the codejunkie99 repository, which is saved separately. The closing follow line is part of the post.

# Jev Engineering: Stop Using LLMs for Every Decision

The fast decision layer that makes AI agents cheaper, faster, and easier to control

Most AI agents are built around one expensive assumption

Every intelligent decision needs another LLM call

Which worker should act next

Is this source relevant

Is the result safe to publish

Does the task look finished

Should the system retry, escalate, or stop

None of those decisions require a paragraph

Yet most agent stacks still ask a generative model to reason in prose, emit JSON, wait for a parser, and hope the schema survives

That is not intelligence architecture

It is a chatbot being used as a switch statement

Jev changes the primitive

It does not generate text

It reads the current state of a system, evaluates typed questions, and returns probabilities that software can act on directly

> The gains aren’t free: Jev can't generate text

Diogo Almeida, TypeSafe AI's founder

That limitation is the entire point

When a model gives up open-ended strings, it can become a much faster and more composable decision layer inside code

The important launch is not another model

It is a new division of labor inside an agent

```
LLM   creates the work
JEV   decides what happens next
CODE  executes and enforces the decision
```

This article is about how to engineer that split properly

> I publish practical breakdowns of AI agents, workflows, and production systems on Substack Join the newsletter here

Links: https://whrrari.substack.com/subscribe?next=https%3A%2F%2Fsubstack.com%2F%40whrrari%2Fnotes&utm_source=profile-page&utm_medium=web&utm_campaign=substack_profile&just_signed_up=true

---

# The expensive mistake inside most agents

An agent loop looks simple from the outside

```
goal -> model -> tool -> observation -> model -> tool -> result

```

But zoom in and you find dozens of small judgments hidden between the large actions

```
Is the request clear enough
Which tool should run
Which model should receive this task
Which source should survive retrieval
Is the tool call risky
Did the action actually work
Is the evidence strong enough to stop
```

The usual response is to send every question back to the same frontier LLM

That creates four problems

## Latency compounds

One extra model call does not feel expensive

Twenty sequential calls do

An agent can spend more time deciding whether to continue than doing the work itself

## Cost moves into invisible branches

The final answer may be short

The internal routing, scoring, checking, and retry decisions can consume most of the token budget

## Strings create integration work

The model returns prose or JSON

Your code validates it, repairs it, retries it, or quietly accepts a malformed edge case

## Confidence is improvised

An LLM can say it is 95% confident

That number is usually another generated token, not a calibrated operating signal

The deeper problem is architectural

Generation and decision-making have been collapsed into the same call

Jev engineering begins by separating them

---

# Jev is not a smaller chatbot

TypeSafe calls Jev its first System One Model

The interface is closer to a frontier-intelligence function than a conversation

```
INPUT
current state + typed questions

OUTPUT
typed answers + probability distributions
```

Jev does not draft the email

It can decide which queue should receive the email

It does not write the research report

It can score whether the collected evidence is sufficient

It does not execute the shell command

It can estimate whether the proposed command requires approval

It does not explain itself in a long chain of thought

It returns a constrained answer your code already knows how to handle

TypeSafe built the model around a training method it calls Reinforcement Learning for Calibrated Decisions, or RLCD

The goal is not prettier language

The goal is decision quality plus useful uncertainty

TypeSafe reports end-to-end latency of roughly 70–500ms for Jev-shaped queries and pricing of $0.042 per million input tokens, with no metered output-token cost

Its larger speed and cost claims come from favorable workflow evaluations and should be treated as ceilings, not promises for every application

That nuance matters

Jev is valuable even when it is not 200x faster

The deeper win is that a decision becomes an explicit, typed, testable component

---

# The three-layer agent stack

[Image omitted.]

The cleanest architecture has three different owners

```
GENERATE  ->  LLM
DECIDE    ->  JEV
ENFORCE   ->  CODE
```

## The LLM generates

Use a generative model when the output itself must be created

- Research

- Writing

- Planning

- Code

- Explanations

- Open-ended synthesis

## Jev decides

Use Jev when the meaning is fuzzy but the possible answer shape is known

- Route to one worker

- Score against a rubric

- Estimate yes or no

- Choose whether to retry

- Select whether to escalate

## Code enforces

Use deterministic code when the rule must be exact

- Permissions

- Budgets

- Retry limits

- Account access

- Database writes

- Publishing

- Deletion

- Money movement

This creates a useful rule

> If the system must create language, use an LLM

If it must interpret meaning and choose from known outcomes, use Jev

If it must obey an exact invariant, use code

The most dangerous mistake is to let a confidence score become permission

Jev can recommend an action

Only the harness should authorize it

---

# Jev has three decision primitives

Jev keeps the interface deliberately small

The three primitives are enough to build most semantic branches inside an agent

## Choice

Use Choice when exactly one option should win

```python
from typesafe_sdk import Choice

next_worker = Choice(
    instructions="Which worker should act next?",
    criteria={
        "research": "Important evidence is still missing",
        "write": "Enough evidence exists to draft the answer",
        "review": "The request is unclear, complete, or consequential",
        "none": "No listed worker is appropriate",
    },
)
```

The result includes the selected option, a probability distribution over the options, and confidence

Do not design a closed menu when reality is open

If the options might be incomplete, include 'none', 'other', or 'escalate'

Otherwise probability mass is forced onto the least-wrong answer

## Score

Use Score when the decision lives on an ordered rubric

```python
from typesafe_sdk import Score

evidence_quality = Score(
    instructions="How well does the evidence support the requested conclusion?",
    criteria=[
        "No direct support",
        "Partial support with important gaps",
        "Strong support from multiple independent sources",
    ],
)
```

The output can fall between levels

That does not turn an ordinal rubric into an exact measurement

A score of 1.6 is not "80% good"

It is a position between descriptions you defined

## Noul

Use Noul for a yes-or-no probability

```python
from typesafe_sdk import Noul

requires_approval = Noul(
    instructions=(
        "Would executing the proposed action publish, purchase, delete, "
        "change permissions, or represent the user externally?"
    ),
)
```

A result near 1.0 means likely yes

A result near 0.0 means likely no

A result near 0.5 means the model cannot distinguish confidently

It does not mean medium approval risk

If you need low, medium, and high risk, use Score

---

# The question is part of the program

Many builders will treat Jev questions like casual prompts

That wastes the entire advantage

A production question is a decision contract

It defines what evidence matters, which outcomes exist, and how the result enters code

```
DECISION CONTRACT

state fields
question instructions
option descriptions or rubric
fallback outcome
confidence thresholds
allowed action
escalation path
version
```

One subtle detail matters immediately

Jev does not learn the task from your internal question ID

Calling a field safe_to_publish does not instruct the model what safe means

The actual rule must appear in the instructions and criteria

```python
# weak
"safe_to_publish": Noul(
    instructions="Is this safe?"
)

# stronger
"safe_to_publish": Noul(
    instructions=(
        "Does the draft contain only verified claims with citations, avoid "
        "private information, and require no unresolved legal or financial approval?"
    )
)

```

The key name helps your code

The instructions help the model

Confusing the two creates invisible bugs

---

# State engineering matters more than prompt decoration

Jev can only judge the state you provide

Do not send a giant conversation and expect the model to reconstruct your workflow

Give it the compact evidence required for the decision

```python
state = {
    "goal": "Prepare a cited briefing on three new agent tools",
    "constraints": {
        "publish": False,
        "deadline": "09:00 UTC",
        "max_sources": 12,
    },
    "completed_work": {
        "sources_collected": 7,
        "draft_exists": True,
        "fact_check_complete": False,
    },
    "evidence": [
        {"id": "s1", "kind": "official_docs", "supports": ["pricing"]},
        {"id": "s2", "kind": "launch_post", "supports": ["availability"]},
    ],
    "available_workers": ["research", "write", "fact_check", "review"],
}
```

Good state is separated by function

```
GOAL          what success means
FACTS         what the system knows
ARTIFACTS     what already exists
EVIDENCE      what supports the next judgment
CONSTRAINTS   what the system may not cross
OPTIONS       what can happen now
```

Bad state mixes claims, instructions, old attempts, and irrelevant history into one text blob

The model may still return a valid type

It can still choose the wrong valid option

This is the most important correction to the “zero hallucination” headline

Jev cannot break the declared output schema

It can still be semantically wrong

Type safety removes one failure class

It does not remove the need for evidence, thresholds, tests, and review

---

# Ask independent questions in parallel

Most agent decisions are evaluated sequentially because LLM generation is sequential

Jev is designed to evaluate multiple typed questions against the same state in one request

```python
client = TypeSafeClient(model="jev-latest")

response = client.system_one(
    state=state,
    questions={
        "next_worker": Choice(
            instructions="Which available worker should act next?",
            criteria={
                "research": "Evidence gaps remain",
                "write": "Evidence is sufficient for drafting",
                "fact_check": "A draft exists but claims need verification",
                "review": "The work is complete, unclear, or consequential",
            },
        ),
        "urgency": Score(
            instructions="How urgent is the request?",
            criteria=[
                "No time pressure",
                "Time-sensitive but can wait",
                "Immediate business impact",
            ],
        ),
        "requires_approval": Noul(
            instructions="Would the next action create an external side effect?"
        ),
    },
)

```

The three questions inspect one snapshot of reality

That makes the decision record easier to understand

```json
{
  "state_version": "run_184:step_7",
  "next_worker": "fact_check",
  "next_worker_confidence": 0.91,
  "urgency_score": 1.24,
  "approval_probability": 0.82
}
```

Parallel does not mean dependent

One question cannot consume another question's fresh answer inside the same call

If the second decision depends on a search result, perform the search first, update state, then ask again

The boundary is simple

```
SAME EVIDENCE     -> ask together
NEW EVIDENCE      -> update state first
```

---

# Confidence is a routing signal

[Image omitted.]

Most systems flatten probability into a label too early

```
0.51 -> YES
0.99 -> YES
```

Those answers should not receive the same authority

The probability distribution should change the route

```python
def route_decision(choice, confidence, consequence):
    if consequence == "irreversible":
        return "human_review"

    if confidence >= 0.90 and consequence == "low":
        return choice

    if confidence >= 0.70:
        return "collect_more_evidence"

    return "human_review"
```

This creates three operating zones

## High confidence, low consequence

Automate the branch

Examples: choose a worker, sort an internal queue, rank a shortlist

## Medium confidence

Improve the state

Fetch another source

Ask a stronger model

Run a deterministic check

Narrow the options

## Low confidence or high consequence

Escalate

Do not make the system repeat the same uncertain decision with the same evidence

Confidence without a different next action is decoration

Calibration only becomes useful when the harness routes uncertainty somewhere

---

# Jev belongs inside the harness

[Image omitted.]

The best Jev integrations do not put the model at the center of everything

They place small decision nodes at expensive or risky transitions

## Before the model: route the task

```
simple classification  -> Jev or code
routine drafting       -> fast LLM
ambiguous research     -> stronger LLM
high-stakes request    -> human review
```

The router should know the models currently available, their capabilities, and the cost or latency budget

Do not hard-code yesterday's model menu into a permanent prompt

## Before the tool: gate the action

The LLM proposes a tool call

Jev classifies its semantic risk

Code decides whether the action can proceed

```python
decision = classify_tool_call(proposed_call)

if decision == "allow":
    execute(proposed_call)
elif decision == "review":
    queue_for_human(proposed_call)
else:
    block(proposed_call)
```

Jev does not receive the authority to publish, purchase, delete, or change permissions

It only supplies judgment to the policy engine

## After the tool: verify the outcome

A successful HTTP response is not proof that the goal was achieved

The verifier should inspect new evidence

```
ACTION
create the report

EVIDENCE
file exists
required sections exist
claims have citations
output path is correct

DECISION
pass / repair / escalate
```

The builder and verifier should not share a vague feeling of completion

They should share an artifact and a rubric

## Around retrieval: filter and rank context

Embeddings find things that are topically close

They do not always identify evidence that is decision-relevant

A useful retrieval pipeline is

```
cheap deterministic filter
        ↓
embedding shortlist
        ↓
Jev relevance score
        ↓
small evidence packet
        ↓
generative model
```

The generative model receives less noise

The trace shows why each item survived

---

# Rebuild the menu after every action

One of the strongest patterns appears in browser agents

The available actions change after every click

The decision layer should choose from what exists now, not from a static list written before the run

```python
controls = observe_current_page()

criteria = {
    control.id: control.semantic_description
    for control in controls
    if control.is_visible and control.is_enabled
}

question = Choice(
    instructions="Which available control best advances the current goal?",
    criteria={**criteria, "stop": "The goal is complete or no safe action exists"},
)
```

This pattern generalizes beyond browsers

Workers come online and go offline

Sources become stale

Budgets shrink

Files appear

Permissions change

Queues fill

A decision model choosing from a stale menu is not making a bad inference

It is operating on an invalid graph

For very large option sets, pre-filter obvious mismatches in code

Then score the survivors

Then make one explicit Choice

Use Jev for semantic ambiguity

Do not make it rediscover facts your program already knows

---

# What Jev should not do

New tools are usually overused before they are understood

Jev has clear boundaries

## Do not use it to generate the artifact

If you need an explanation, email, plan, program, or report, use an LLM

Jev returns decisions, not prose

## Do not use it for exact rules

```python
# use code
if attempts >= 3:
    stop()

if spend_usd > budget_usd:
    block()
```

Semantic judgment should not replace arithmetic, date comparison, exact strings, allowlists, or permission checks

## Do not ask it to invent unknown values

Jev can choose from declared possibilities

It is not an extraction engine for arbitrary names, URLs, IDs, or numbers that are absent from the schema

## Do not hide a multi-step plan inside one label

If a decision requires new evidence, run the tool that creates the evidence

Then ask the next question

## Do not confuse type safety with truth

Jev can guarantee that the answer matches the declared type

It cannot guarantee that the chosen valid answer is correct

The system still needs evaluation

---

# The production rollout

Do not replace every decision at once

Start with one high-volume, low-consequence branch where the correct answer can be labeled later

```
GOOD FIRST DECISION
route an internal support ticket

BAD FIRST DECISION
approve a payment with no human review
```

## Step 1: define the contract

Write the state fields, options, criteria, fallback, threshold, and allowed action before integrating the model

## Step 2: build a representative set

Include normal examples, ambiguous cases, missing evidence, adversarial language, and cases where no option fits

## Step 3: run in shadow mode

Let the existing production path make the real decision

Log what Jev would have chosen

```json
{
  "decision_contract": "ticket-router@3",
  "state_hash": "b476...",
  "jev_model": "jev-latest",
  "answer": "technical",
  "confidence": 0.87,
  "production_answer": "technical",
  "human_label": null,
  "action_taken": false
}

```

## Step 4: plot accuracy against confidence

Do not ask only whether the average answer is correct

Ask whether high-confidence answers are actually more reliable than low-confidence answers in your workload

That determines where automation is safe

## Step 5: automate one branch

Start with the safest outcome

Keep uncertain, rare, or consequential cases behind the existing review path

## Step 6: monitor drift

Your options, users, tools, and language change

Version the decision contract separately from application code

```
router@1  broad options
router@2  adds none-of-the-above
router@3  separates billing from account access
```

A semantic decision is production logic

Treat changes like code changes

Review them

Test them

Roll them back when necessary

---

# Failure modes that look like model problems

## The state contains conclusions instead of evidence

```
BAD
the research is probably enough

BETTER
7 sources collected · 3 official · pricing verified · security claim unresolved
```

The model should judge the evidence

It should not inherit the previous agent's confidence as a fact

## The menu has no escape hatch

The answer is forced into one of several wrong options

Add other, none, stop, or review

## One threshold controls every consequence

Routing an internal note and publishing a public statement should not share an automation threshold

Thresholds belong to the action class, not only the model output

## The option list is stale

The selected worker is unavailable

The chosen button disappeared

The cited source changed

Rebuild the choice set from live state

## The same state is retried

Nothing new was learned

The model is asked again anyway

Retries should spend new evidence, not just more tokens

## The decision has no receipt

The system stores only the winning label

Keep the contract version, state reference, full distribution, threshold, route, and resulting action

## The policy lives inside the classifier

The question says what should be allowed

The code blindly executes the answer

This turns probabilistic judgment into unbounded authority

The safe order is

```
JEV JUDGES
CODE CHECKS POLICY
TOOL EXECUTES
TRACE RECORDS
```

---

# The Jev engineering playbook

Use this sequence for the first integration

```
01  Map the agent loop
02  Mark every hidden yes / no / route / score decision
03  Keep exact rules in code
04  Keep open-ended creation in the LLM
05  Choose one repeated semantic decision for Jev
06  Define state, rubric, options, and escape hatch
07  Ask independent questions in parallel
08  Route confidence into auto / improve / human paths
09  Run shadow mode and measure calibration
10  Automate the safest branch first
```

Then expand one boundary at a time

```
FIRST
internal routing

THEN
retrieval filtering
completion verification
model selection
low-risk tool gating

LATER
consequential actions with explicit policy and approval

```

The point is not to maximize the number of Jev calls

It is to remove expensive generative calls from places where generation was never needed

---

# The economics are downstream

TypeSafe's published price makes the decision itself extremely cheap

But cost per call is not the metric that matters

Cost per completed task is

A cheap router that sends a worker down the wrong branch can create more cost than it saves

A fast verifier that passes weak work can create more latency later

Track the whole system

```
decision latency
decision cost
branch accuracy
downstream tool cost
recovery cost
human review rate
completed-task rate
```

This is where Jev engineering becomes more important than Jev itself

The model provides a new primitive

The graph decides where that primitive sits

The loop decides what happens after uncertainty

The harness decides what the system is allowed to do

The trace tells you whether the architecture worked

---

# The Jev launch checklist

Before a Jev decision controls a production branch, ask

```
[ ] Is this truly a semantic decision rather than generation or an exact rule
[ ] Is the state compact, current, and evidence-based
[ ] Are the instructions explicit instead of hidden in the question ID
[ ] Does every Choice include an escape hatch when the menu may be incomplete
[ ] Are Score levels ordered descriptions rather than fake measurements
[ ] Is a Noul probability interpreted as yes / no uncertainty
[ ] Are independent questions batched against the same state
[ ] Are dependent questions separated by a state update
[ ] Does confidence change the route
[ ] Are thresholds specific to the consequence of the action
[ ] Does code retain authority over permissions, budgets, and side effects
[ ] Is the decision contract versioned
[ ] Is the full distribution logged with the resulting action
[ ] Has the decision run in shadow mode on representative examples
[ ] Can the system escalate when no safe option exists
[ ] Does every retry add new evidence

```

If several answers are no, the system is not ready for more automation

It is ready for a better decision contract

---

# The real shift

Jev is not a replacement for the LLM

It is a missing layer beside it

```
LLM
turns context into new work

JEV
turns state into typed judgment

CODE
turns judgment into controlled action
```

Most builders will continue asking one expensive model to generate, classify, route, verify, authorize, and explain

Their agents will spend frontier-model time on decisions that never needed a sentence

The better stack is smaller and more explicit

Use the LLM where open-ended intelligence creates value

Use Jev where software needs a fast semantic branch

Use code where the rule cannot be negotiable

That is Jev engineering

Not a smarter prompt

A better boundary between intelligence and execution

---

# If you read this far

-> Subscribe to my Substack

Links: https://whrrari.substack.com/subscribe?next=https%3A%2F%2Fsubstack.com%2F%40whrrari%2Fnotes&utm_source=profile-page&utm_medium=web&utm_campaign=substack_profile&just_signed_up=true

-> Join my Telegram

Links: https://t.me/+qqS3Qn-x1305ZmUy

-> Bookmark this article before you add another LLM call to your agent loop

-> Follow @0xwhrrari

Links: https://x.com/@0xwhrrari
