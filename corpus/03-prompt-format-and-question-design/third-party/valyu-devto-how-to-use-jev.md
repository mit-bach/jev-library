# How to Use Jev: A practical guide to TypeSafe's System One model

Source: https://dev.to/valyuai/how-to-use-jev-a-practical-guide-to-typesafes-system-one-model-g5e
Author: Prosper Otemuyiwa (@unicodeveloper)
Published: 2026-09-17T12:24:54Z
Retrieved: 2026-10-01
Status: third-party guide on DEV. Not a TypeSafe document.


**Jev is a frontier AI model from TypeSafe AI that returns typed, probabilistic decisions instead of generated text.** You send program state plus typed questions; it answers all of them in one parallel pass in 70 to 500 milliseconds, at $0.042 per million input tokens with output free. It launched September 15, 2026 with $40M led by DCVC, built by Diogo Almeida, who co-invented RLHF and InstructGPT at OpenAI.

This is the practical guide: setup, the three primitives, five patterns worth stealing, the failure modes that will bite you, and what people shipped in the first 48 hours.

---

![Intelligence](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/iq3rhgikjcztwfzddn9p.png)

**TypeSafe AI** calls Jev, this class of model **System One**, after Kahneman's fast, intuitive thinking. The bet is that most decisions inside software are System 1 judgments ("which bucket is this?", "is this urgent?") and we have been renting System 2 to make them.

| | Jev | Frontier LLMs |
|---|---|---|
| End-to-end latency | 70ms to 500ms | 3s to 329s |
| Input price | $0.042 / MTok | $0.20 to $10 / MTok |
| Output price | free | ~5x input |
| Structured-output errors | 0% (by construction) | 0.58% to 45.5% |

Caveat up front, and I come back to it at the end: those are TypeSafe's own numbers, self-run and unreproduced.

---

## Setup

Get a key from [console.typesafe.ai/settings/keys](https://console.typesafe.ai/settings/keys) (early access is waitlisted) or from [Vercel AI gateway](https://vercel.com/ai-gateway/models/jev) and export it:

```bash
export TYPESAFE_API_KEY="sk-..."
```

**Python** (3.10+):

```bash
pip install typesafe-sdk
# or: uv add typesafe-sdk
```

**JavaScript/TypeScript** (Node 20+):

```bash
npm install @typesafe-ai/sdk
```

Both SDKs read `TYPESAFE_API_KEY` from the environment and default to `jev-latest`. There is one endpoint, `POST https://api.typesafe.ai/v1/systemone`, if you would rather call it directly.

---

## The three primitives

![Anatomy of one Jev call](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/wp5zcn8v3zuogrhcs14g.png)

The whole API is three question types. That is not a limitation you route around, it is the design.

### Choice: one option from a set

```python
Choice(
    instructions="Which team should handle this",
    criteria={
        "billing":   "Payment or subscription issues",
        "technical": "Bugs or integration problems",
        "sales":     "Pricing or account questions",
    },
)
```

Returns `.choice`, `.probabilities` (one per option), and `.confidence`. Takes **up to 255 options**, each costing a few tokens, so pass the full list of teams or categories rather than a shortlist. Add an explicit `other` option so the model can say nothing fits instead of picking the closest wrong thing.

### Score: a position on a spectrum

```python
Score(
    instructions="How frustrated the customer appears",
    criteria=[
        "Calm, just stating facts",
        "Frustrated but civil",
        "Very angry, strong language",
    ],
)
```

Two to ten ordered levels, described in words. Returns `.score` as a position that can land **between** levels (`1.035`), plus `.probabilities` and `.confidence`. The level index comes from array order, so level 0 is the first entry.

### Noul: yes or no, as a probability

```python
Noul(instructions="The message conveys urgency or time-sensitivity")
```

Returns `.noul`, a single number from 0 to 1: the probability the answer is yes. No confidence field, because the number already is the belief.

### Putting it together

```python
from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

client = TypeSafeClient()

response = client.system_one(
    state={
        "ticket": {
            "subject": "Duplicate charge",
            "messages": [
                {"from": "customer",
                 "text": "I was charged twice for order A-104. Please refund the duplicate."},
            ],
        },
        "order": {"id": "A-104", "charges": [
            {"amount_usd": 49, "status": "captured"},
            {"amount_usd": 49, "status": "captured"},
        ]},
        "refund_policy": "Duplicate charges are eligible for a refund.",
    },
    questions={
        "department":       Choice(instructions="Which team should handle this",
                                   criteria={"billing": "Payment or subscription issues",
                                             "technical": "Bugs or integration problems",
                                             "sales": "Pricing or account questions"}),
        "frustration":      Score(instructions="How frustrated the customer appears",
                                  criteria=["Calm, just stating facts",
                                            "Frustrated but civil",
                                            "Very angry, strong language"]),
        "refund_requested": Noul(instructions="The customer is explicitly asking for a refund"),
        "policy_supports":  Noul(instructions="The stated refund policy covers this situation"),
    },
)

dept = response.answers["department"]
print(dept.choice, dept.confidence)
print(response.answers["frustration"].score)
print(response.answers["refund_requested"].noul)
```

The same in TypeScript:

```ts
import { choice, noul, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();

const response = await client.systemOne({
  state: { document: "I was charged twice. Please fix this ASAP." },
  questions: {
    category: choice("What is this ticket about?", {
      billing: "Payment or subscription issues",
      technical: "Bugs or integration problems",
      other: "Anything else",
    }),
    urgent: noul("The message conveys urgency"),
  },
});

console.log(response.answers.category.choice);  // types inferred from your questions
```

### State is whatever you need it to be

A string, a JSON object, or an array of text. Use an object when there is more than one piece of context.

```python
state = "My card was charged twice."                               # simple
state = {"message": "...", "order_id": "A-104"}                    # named fields
state = ["Hi", "My customer number is TS1337.", "Charged twice."]   # a conversation
```

Text only. No images, audio or video. Transcribe or caption first.

**Context limits** work differently from an LLM, because state is ingested once and questions run in parallel over it:

- 64k tokens for state and all questions together
- 32k tokens for state plus the single longest question

---

## Five patterns worth stealing

### Pattern 1: speculative fan-out

Questions are evaluated in parallel, so **a tenth question costs tokens but almost no time**. This inverts the usual instinct to make a cheap call first and a follow-up only if needed. Ask everything up front and let code decide what was relevant.

```python
response = client.system_one(
    state=ticket,
    questions={
        "category":       Choice(instructions="Broad category of this ticket",
                                 criteria={"bug_report": "Something is broken or erroring",
                                           "billing": "Charges, invoices, refunds",
                                           "feature_request": "Asking for new functionality",
                                           "account": "Login, permissions, security"}),
        # only meaningful if it IS a bug report. Ask anyway.
        "bug_severity":   Score(instructions="How severe is the reported issue",
                                criteria=["Cosmetic; no impact",
                                          "Degraded feature; workaround exists",
                                          "Blocking; no workaround"]),
        "has_repro":      Noul(instructions="The user describes steps to reproduce"),
        # only meaningful if it IS billing. Ask anyway.
        "refund_wanted":  Noul(instructions="The user explicitly asks for a refund or credit"),
        "frustration":    Score(instructions="How frustrated the user appears",
                                criteria=["Calm", "Frustrated but civil", "Very angry"]),
    },
)

cat = response.answers["category"]

if cat.choice == "bug_report":
    if response.answers["bug_severity"].score > 1.5 and response.answers["has_repro"].noul > 0.6:
        escalate_to_engineering(ticket_id, severity="high")
    else:
        add_to_bug_backlog(ticket_id)
elif cat.choice == "billing" and response.answers["refund_wanted"].noul > 0.7:
    start_refund_flow(ticket_id)
```

TypeSafe's cookbook runs a 13-question regulatory briefing over a long Wikipedia article and reports that batching every question into one call is **12.2x cheaper and 10.0x faster** with identical answers, versus asking one at a time.

### Pattern 2: Confidence-gated routing

![Confidence is the second axis](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/t8s5yc3nsoj1cvamp96r.png)

This is the one that changes your architecture. Jev is trained with **RLCD** (Reinforcement Learning for Calibrated Decisions), which optimises probabilities against outcomes rather than human preference. Confidence is therefore meaningful in aggregate: higher confidence really does mean higher accuracy.

So stop writing one threshold for the whole system. Write one per action, scaled to what being wrong costs.

```python
action = response.answers["intent"]

if action.confidence < 0.5:
    route_to_human(user_message)                  # floor: genuinely unsure

elif action.choice == "check_balance":
    show_balance(account_id)                      # read-only, low bar

elif action.choice == "approve_transfer":
    if action.confidence > 0.85:                  # moves money, high bar
        approve_transfer(account_id)
    else:
        ask_user_to_confirm("Approve this transfer?")

else:
    route_to_human(user_message)
```

You also get the raw `.probabilities` if TypeSafe's confidence statistic is not the measure you want. A flat distribution means the options were not distinguishable from the state you gave it, which is frequently a signal that your criteria are wrong rather than that the model is confused.

### Pattern 3: composite scoring

Break a fuzzy judgment into independent dimensions, score each atomically, and combine with weights **you** control. This beats asking "how good is this candidate," which hides several judgments inside one answer.

```python
response = client.system_one(
    state=resume_text,
    questions={
        "python_depth":    Score(instructions="Depth of Python experience shown",
                                 criteria=["None mentioned", "Mentioned, no detail",
                                           "Used in projects", "Primary language",
                                           "Deep expertise: architecture, performance"]),
        "team_leadership": Score(instructions="Experience leading engineering teams",
                                 criteria=["None", "Informal mentorship", "Led a small team",
                                           "Managed direct reports", "Managed multiple teams"]),
        "system_design":   Score(instructions="Experience designing distributed systems",
                                 criteria=["None mentioned", "Contributed to discussions",
                                           "Designed components", "Owned a system's architecture",
                                           "Designed at scale across domains"]),
    },
)

a = response.answers
composite = (
    0.40 * (a["python_depth"].score / 4) +
    0.25 * (a["team_leadership"].score / 4) +
    0.35 * (a["system_design"].score / 4)
)
```

Re-weighting is now a code change, not a re-prompt. You can A/B it.

### Pattern 4: The Cascade

![The cascade](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/xr271amyaqhjodxrhs07.png)

Jev is not a replacement for Opus 5 or GPT-5.6. It is the thing that decides which requests deserve one.

```python
def handle(message):
    r = client.system_one(
        state=message,
        questions={
            "intent":     Choice(instructions="Primary intent of this message",
                                 criteria={"order_status": "Asking about an existing order",
                                           "product_question": "Asking about a product",
                                           "return_exchange": "Wants to return or exchange",
                                           "complaint": "Unhappy, wants resolution"}),
            "complexity": Score(instructions="How complex is this to resolve",
                                criteria=["Simple lookup or standard procedure",
                                          "Requires judgment or multiple steps",
                                          "Unusual edge case, escalation needed"]),
        },
    )
    intent, complexity = r.answers["intent"], r.answers["complexity"]

    if intent.confidence < 0.5:
        return route_to_human(message)

    if intent.choice == "order_status":
        return lookup_order(message)                      # pure code, no LLM at all
    if intent.choice == "product_question":
        return handle_with_llm(message, PRODUCT_SPECIALIST)
    if intent.choice == "return_exchange":
        return handle_with_llm(message, RETURNS_SPECIALIST)
    if intent.choice == "complaint":
        if complexity.score > 1 or complexity.confidence < 0.5:
            return route_to_human(message)
        return handle_with_llm(message, COMPLAINT_RESOLUTION)
```

One branch never touches a model. Two load different specialists. One escalates.

On a million tickets, using TypeSafe's per-case figures, that is roughly **$6,480 instead of $30,400**, with around 800,000 answered in under half a second instead of ten.

### Pattern 5: Retrieve, then judge

There is a step in that cascade Jev does not perform, and it sets the ceiling on everything after it.

Jev has no knowledge of the world beyond the state you hand it. It cannot look anything up. And the jaggedness page is blunt that accuracy falls as state fills with material the question does not need: **"retrieve and filter in code first, and send only the fields the question needs."**

Read those together and the consequence is sharp. Whatever assembles the state decides what Jev is allowed to know. Pad it and you lose accuracy to context rot. Ground it in a weak source and Jev returns a well-calibrated judgment about bad material, because the state is the only world it has.

So the full pattern is two layers: fetch precisely, then judge cheaply.

```python
from valyu import Valyu
from typesafe_sdk import Noul, Score, TypeSafeClient

valyu = Valyu()          # reads VALYU_API_KEY
jev = TypeSafeClient()   # reads TYPESAFE_API_KEY

# 1. Retrieval: primary sources, filtered before anything reaches the model.
hits = valyu.search(
    "GLP-1 receptor agonists cardiovascular outcomes",
    included_sources=["valyu/valyu-pubmed", "valyu/valyu-arxiv"],
    start_date="2024-01-01",
    max_num_results=20,
    relevance_threshold=0.5,
)

# 2. Judgment: one bounded call per paper, roughly $0.0004 each.
shortlist = []
for paper in hits.results:
    verdict = jev.system_one(
        state={"title": paper.title, "source": paper.url, "content": paper.content},
        questions={
            "is_rct": Noul(
                instructions="This paper reports a randomised controlled trial"),
            "reports_mace": Noul(
                instructions="The paper reports major adverse cardiovascular events as an outcome"),
            "evidence_strength": Score(
                instructions="How strong is the causal evidence presented",
                criteria=["Anecdotal or preclinical",
                          "Observational",
                          "Single randomised trial",
                          "Meta-analysis of randomised trials"],
            ),
        },
    )
    a = verdict.answers
    if a["is_rct"].noul > 0.7 and a["evidence_strength"].score > 1.5:
        shortlist.append((paper, a["evidence_strength"].confidence))
```

Twenty papers screened on four dimensions for well under a cent, against primary literature rather than whatever a general crawl surfaced.

This generalises past literature review. It is the same shape as TypeSafe's own [RAG passage classification](https://docs.typesafe.ai/cookbooks/classifying_rag_passages) and [citation check](https://docs.typesafe.ai/cookbooks/citation_check) cookbooks: retrieve wide, then use a Noul per passage to filter for relevance *before* anything expensive sees it. At $0.042/MTok with free output, the filter costs less than the context window it saves.

---

## What people shipped in the first 48 hours

Jev launched September 15. So treat these as launch-week artefacts, not production case studies, and note that all figures are self-reported by their authors. Be discretionary in your adoption.

### 1,018 research papers classified for $0.08

[**1kpapers.com**](https://1kpapers.com) by Hassan El Mghari ([thread](https://x.com/nutlope/status/2100426999546184123))

The clearest demonstration of the economics, because it runs a generative model and a decision model in the same pipeline and shows the bill for each:

1. Summarise 1,018 papers with DeepSeek V4 Flash
2. Send title + summary + 24 candidate topics to Jev
3. Classify with one Choice
4. Visualise

**Summaries: $3.99. Classifications: $0.08.** Median end-to-end latency 256ms per paper.

> "I think this is where things are heading: different models for different parts of the workflow, instead of using one model for everything."

He also notes he is running evals on the Jev classifications before replacing the existing ones, which is the right instinct and the one most launch-week demos skip.

### A browser agent that books a flight in 7.1 seconds

[**browser-use/jev-ultrafast**](https://github.com/browser-use/jev-ultrafast) · 641 stars · Python

Gregor Zunic (Browser Use) built a browser agent with a dynamic, indexed action space. Each observation turns the page into a numbered element table. One Jev request picks both the operation (`CLICK`, `TYPE_TEXT`, `SELECT`, `SCROLL`, `WAIT`, `DONE`, `BLOCKED`) and its target. A small LLM runs only when the operation is `TYPE_TEXT`.

**Zürich to London on real Google Flights in 7.1 seconds, $0.0039**, page loads included.

The design trick is speculative fan-out applied to actions: click, type and select targets are all asked in the same round trip, and only the one matching the chosen operation executes. Two decisions, one network call.

### Computer use at $0.0002 per step

[**awlevin/typesafe-computer-use**](https://github.com/awlevin/typesafe-computer-use)

Drives a Mac toward a plain-English goal without sending screenshots to a large model. OCR reads the screen, Jev picks the next action, a writing model is called only for free text.

| | Jev | Opus 5 (bare screenshot) |
|---|---|---|
| Cost per decision | $0.0002 | $0.032 |
| Cost per 12-step task | $0.003 | $0.40 to $0.90 |
| Model latency | 0.13 to 0.38s | 5.2s |
| End-to-end step | ~1.5s | ~5.5s |

The author's caveat is the most useful line in the repo: the frontier model read event dates off the pixels and compared them unaided, while the classifier needed explicit date parsing built around it. **"Every piece of reasoning the frontier model does for free has to be rebuilt here as deterministic state."**

### A market maker deciding every ~300ms block

[**jarrodwatts/jev-trader**](https://github.com/jarrodwatts/jev-trader)

One decision per Monad block. Jev reads the Kuru MON-USDC order book and answers buy or sell; the bot posts a post-only limit order one tick inside the touch, so it earns the spread instead of paying it. Reported model latency in the event stream is around 81ms, and the hot loop makes exactly two RPC round trips to fit the block budget. Ships with a dry-run mode using real book data and simulated fills.

### An autonomous drone with judgment at 2.5Hz

[**RomanSlack/jev-drone**](https://github.com/RomanSlack/jev-drone)

Worth studying for how carefully it puts Jev in its place:

| Rate | Layer | Owner |
|---|---|---|
| 500 Hz | Geometric flight controller | Code |
| 50 Hz | Guidance and safety reflex | Code, always owns safety |
| 15 Hz | Camera to symbolic scene | Classical CV |
| ~2.5 Hz | Tactical judgment | **Jev, advisory only** |

Classical CV compresses depth and segmentation into range sectors, obstacle height and target bearing. Jev answers three questions in one call: a Choice over manoeuvres, a Score for risk, a Noul for whether the target is genuinely lost or briefly occluded. As the README says, Jev "cannot be the perception layer, and it cannot run at control rate."

### Others worth a look

- [**fhshaik/typesafe-mario**](https://github.com/fhshaik/typesafe-mario) (73★) plays Super Mario Bros from emulator RAM translated to object-centric JSON. No screenshots.
- [**devagrawal09/jev-review**](https://github.com/devagrawal09/jev-review) (48★) is a staged code reviewer: Noul risk matrix, then Choice/Score file profiles, evidence selection, severity, conditional routing.
- [**TheoLeeCJ/openjev**](https://github.com/TheoLeeCJ/openjev) (166★) reads typed option probabilities off a 4B open model's logits in one forward pass. It is explicit that it reproduces the *interface pattern*, not Jev's model or training.
- [**phyous/tsai-sc**](https://github.com/phyous/tsai-sc) has Jev complete the first StarCraft shareware mission across 421 decisions, with a verification report.
- [**AbdelStark/awesome-typesafe**](https://github.com/AbdelStark/awesome-typesafe) indexes the ecosystem and labels which results rest on private data or single runs.

**The pattern across every one of these:** keep the loop, the safety and the arithmetic in ordinary code, and use Jev for the narrow judgment in the middle that code finds hard to phrase.

---

## The failure modes (read this before you ship)

TypeSafe publishes a page called ["jaggedness"](https://docs.typesafe.ai/model-jaggedness/jev-1.13) listing what `jev-1.13` is bad at. It is unusually honest for a launch and it will save you a week.

**It reads literally.** Jev answers the question you wrote, not the one you meant. Negations, scoping words and implied conditions land at face value. The tell: you look at a wrong answer and catch yourself explaining what you really meant. That explanation is the missing half of your instruction.

**It is not a calculator.** It does not count reliably, and error grows with the size of the thing counted. Iterate in code and ask one Noul per item:

```python
result = client.system_one(
    {"items": items},
    {f"item_{i}": Noul(instructions=f"Is `items[{i}]` the name of a fruit?")
     for i in range(len(items))},
)
count = sum(result.nouls[f"item_{i}"].noul > 0.5 for i in range(len(items)))
```

**Dates are text to it, not ordered quantities.** Which date came first, how far apart, whether one falls in a window: all unreliable. Extraction is judgment, so use a Choice over enumerated months and days with an explicit "not stated" option. Assembly and ordering are arithmetic, so keep them in code.

**Context rot is real.** Accuracy falls as state fills with material the question does not need. Retrieve and filter first.

**State is not treated as hostile.** Text engineered to argue for its own classification can move the answer. If you put user-controlled content into state, that is your threat model to handle. Test it.

**Contradictory instructions and criteria confuse it.** A Noul where `true` maps to "no" will underperform. Treat criteria as an extension of the instruction.

**It does not generate.** No text, no code, no summaries. If you need a value extracted from free text, get candidates with a regex or a generative model and let Jev pick.

The meta-rule from their docs, which is good design advice generally:

> Avoid asking the model something code can compute exactly. Avoid hiding several judgments inside one question.

---

## Operational notes

**Rate limits** for `jev-1.13` are 250,000 tokens/second and 1,200 requests/minute. Over either returns `429`. Both SDKs retry with exponential backoff and honour `retry-after`. TypeSafe warns these limits are moving without notice while GPU capacity lands.

**Pin your version if you tune thresholds.** `jev-latest` currently resolves to `jev-1.13.0` and will move when a new release ships, which can change answers under you. The response's `model` field reports the versioned ID that answered, so log it.

```python
client = TypeSafeClient(model="jev-1.13.0")   # pin
```

**Billing is input-only.** Output tokens are free, which is why speculative fan-out is cheap and why adding options to a Choice costs almost nothing.

**There is an agent skill** if you build with a coding agent:

```bash
claude plugin marketplace add typesafe-ai/skills
claude plugin install typesafe@typesafe-ai
# or, for other agents:
npx skills add typesafe-ai/skills --skill typesafe-ai
```

---

## The honest scorecard

![What the trade actually is](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/y1uqwdbvohpnidn078p0.png)

On TypeSafe's four-workflow evaluation, Jev scores 67.8%, level with GPT-5.6 Terra (67.9%), behind Sol (74.1%) and Opus 5 (73.1%), at roughly 1/200th the cost and 1/50th the latency.

The line that lands hardest: **Claude Sonnet 5 scores exactly 67.8% too**, at 293x the cost per case and 195x the latency.

Four things to hold onto:

1. **That column is not accuracy.** There is no ground truth. TypeSafe builds consensus labels by averaging GPT-6 Astra and Claude Fable 5.1 at high thinking, then scores everyone against those. It measures *agreement with two frontier models*, which is why neither appears in the results. TypeSafe says this biases toward OpenAI and Anthropic.
2. **It is self-run.** TypeSafe designed the workflows, built the harness, ran it. No independent reproduction exists. Evaluate on your own traffic.
3. **"Cannot hallucinate" is narrower than it sounds.** Jev cannot return an invalid value. It can return the *wrong* valid one. The 0% is asserted, not measured: "Our number is not empirical. Schema matching is guaranteed, thus we can confidently add 0% into the plots." The 45.5% comparison is a single outlier (Haiku 4.5); most models sit between 0.58% and 13.2%.
4. **The price may move.** TypeSafe cannot prove it is not subsidised, though it says it expects the price to fall rather than rise.

---

## When I would actually use this


![Good and bad fits](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/l1ifarkdfnktj750sgqc.png)

**Yes:** routing and triage, moderation, relevance filtering before an expensive context window, scoring or guardrailing LLM output, tagging at volumes that were previously uneconomic, anything sub-second inside a request handler.

**No:** generating anything, arithmetic or counting or date math, decisions needing a written rationale for an auditor, one-off complex reasoning, genuinely open answer spaces.

The useful mental shift is that this is not a cheaper LLM. It is a different primitive: a function call that happens to be intelligent, returns a type, and tells you how much to trust it. Once you have that, a lot of code that exists only to survive string output stops needing to exist.

## FAQ

**What is Jev?** A frontier model that returns typed, probabilistic decisions instead of text, in 70 to 500ms.

**How much does it cost?** $0.042 per million input tokens, output free. About $0.0004 per case on TypeSafe's benchmark.

**Can it hallucinate?** It cannot return a value outside your schema. It can return the wrong valid value.

**Can it write code or prose?** No. Not trained to generate text at all.

**What are Choice, Score and Noul?** The three question types: one-of-N (up to 255), a position on a 2 to 10 level scale, and a yes/no probability.

**How do I get access?** Waitlisted early access at typesafe.ai; keys at console.typesafe.ai.

**Should I replace my LLM?** No. Cascade: Jev classifies and routes cheaply, code handles what it can, a frontier model takes the hard minority.
