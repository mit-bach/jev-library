author: Edward Irby
handle: @edwardirby
post id: 2105695667486355848
timestamp: 2026-10-01T16:25:43Z
url: https://x.com/edwardirby/status/2105695667486355848
engagement: likes 23, reposts 8, quotes 4, replies 10, bookmarks 13, views 11910
article url: https://x.com/i/article/2105364784459997184
article title: Building a Reliable Background Agent Without a Frontier Model
_disclaimer: This is a saved post, not an official TypeSafe document.
This is a saved post, not an official TypeSafe document.

Retrieval note: logged-out Chrome opened the article URL and got "Hmm...this page doesn't exist." The body below is the article content returned by the public fxtwitter status API, including the tables and code blocks that the X thread tool left blank. Images are marked omitted. Numbers are the author's, not checked here.

# Building a Reliable Background Agent Without a Frontier Model

Reviewed by @typesafeai

Links: https://x.com/@typesafeai

---

I ran three live, escalated risk sweeps through this system. Each sweep made six calls to Qwen3.8 27B through OpenRouter: five tool-calling turns and one report-synthesis call. Measured across those runs, the model bill came to about two cents of inference per escalated sweep — and the complete invoice, every provider on it, is below. Its biggest line is not the model.

Links: https://openrouter.ai/qwen/qwen3.8-27b

The reason was not a clever prompt. It was a separation of responsibilities.

- @youdotcom supplied current web results, page contents, and licensed Knowledge facts.

Links: https://x.com/@youdotcom

- @typesafeai Jev made bounded decisions that returned typed values rather than prose — and still does, now behind a pluggable Judge interface.

- @Alibaba_Qwen  27B proposed searches and synthesized the final briefing.

- Application code owned thresholds, budgets, persistence, and failure handling.

- MCP made the finished workflow available to compatible clients without tying it to one chat application.

Because these responsibilities are strictly separated, we can swap out individual components to test the architecture directly: the judgment engine swapped out behind the same interface, the same model judging in Jev's place. Report quality held exactly; calibration, coverage, cost, and latency did not.

This article explains the architecture, including where it failed before it became reliable — and where, by measurement rather than assertion, it still needs work.

## Reliability comes from separation, not model size

The system watches user-defined risk profiles. A profile contains a topic, locations, and policy triggers. One of the live profiles was:

- Profile: PNW data center buildout

- Locations: Oregon, Washington, Northern California

- Triggers: permitting pauses, grid-capacity constraints, and the current electricity price

A manual or scheduled sweep searches for current signals, decides whether they justify a deeper investigation, retrieves and ranks evidence, and persists a source-linked Markdown briefing.

The tempting implementation is one large prompt: give a model the profile, let it search freely, and ask for a report. That design makes one probabilistic component responsible for retrieval, relevance, control flow, context management, and writing. It is also difficult to tell which layer failed.

I split those jobs instead:

[Image omitted. Caption: The core architecture: Application code owns orchestration and state, Jev handles typed judgments, You.com provides search and licensed data, and Qwen is reserved strictly for proposal and synthesis.]

This is the central design principle: use generation only where generated language is actually needed.

## One sweep, stage by stage

The complete implementation is in the open-source risk-analysis-server repository. The orchestration is deliberately ordinary TypeScript:

Links: https://github.com/youdotcom-oss/risk-analysis-server

```typescript
const highlights = await deps.fetchHighlights(profile)
const threat = await deps.triage(profile, highlights)

if (threat < TRIAGE_THRESHOLD) {
  return persistCleanSweep(profile, highlights, threat)
}

const report = await deps.deepDive(profile)
return persistReport(profile, report)
```

That small branch hides four bounded stages:

1. Surface triage. A code-invoked you-search call requests compact highlights. Jev decides whether the evidence indicates a material threat. Below the threshold, the pipeline stops and records a low-severity clean sweep. The raw probability rides out on the outcome — every escalation decision is auditable after the fact.

1. Query proposal. Qwen gets at most five tool-calling steps, but its tool no longer searches — it only records candidate queries. Jev then ranks every proposal in a single batched call, and only the top-ranked slice (a code-owned budget, default 8) reaches search. An earlier version executed searches inside the loop and spent 19–26 searches per sweep; ranking first cut that to a flat 12.

1. Retrieval and scoring. The budgeted proposals and the profile's raw triggers run as deterministic searches. Results are deduplicated and scored against the profile. Only the top evidence advances, and only fetchable URLs go to you-contents.

1. Severity and synthesis. Jev chooses low, medium, or critical from fixed definitions while Qwen writes a concise Markdown briefing from the bounded evidence. Application code adds the report header and licensed-data provenance before saving it.

The sweep orchestration and deep-dive implementation are separate on purpose. The first owns escalation and persistence; the second owns the expensive path.

Links: https://github.com/youdotcom-oss/risk-analysis-server/blob/f153e039db56b8e5374da638c0090be0585d98cd/src/pipeline/sweep.ts https://github.com/youdotcom-oss/risk-analysis-server/blob/f153e039db56b8e5374da638c0090be0585d98cd/src/pipeline/deep-dive.ts

For the PNW profile, the stored report classified the situation as low severity and opened with:

> PNW data-center buildout is facing rising Oregon permitting and utility-cost pressure, with Clackamas County initiating a data-center moratorium process and a 45-day notice window creating a narrow application gap. A new large-user electricity rate action in Oregon is increasing community scrutiny and operating-cost uncertainty for high-power facilities.

That is agent output, not independently verified ground truth. Its value is that readers can inspect the linked evidence and the inputs that crossed each gate rather than trusting an unsupported paragraph.

## Jev turns judgment into a typed interface

Jev is TypeSafe AI's System One model. It evaluates state against typed questions and returns structured decisions instead of generating text. The pipeline uses all three Jev primitives:

Links: https://docs.typesafe.ai/concepts/system-one

- Noul returns a value from 0 to 1 for a true-or-false judgment. I use it for threat triage and for ranking candidate queries.

- Score evaluates evidence against an ordered rubric. I use not relevant, marginally relevant, and highly relevant.

- Choice selects from a fixed set. I use it for the final low | medium | critical severity.

The code looks more like calling a decision primitive than prompting a chatbot:

```typescript
const triage = await jev.systemOne({
  state: { profile, highlights },
  questions: {
    threat: noul(
      'Does this evidence indicate a material supply-chain threat ' +
        'for the profile given its policy triggers?',
    ),
  },
})

const relevance = score('How relevant is this result?', [
  'Not relevant to the profile or its policy triggers',
  'Marginally relevant: touches the locations or triggers, but not both',
  'Highly relevant: concrete disruption at a profile location matching a trigger',
])

const severity = choice('How severe is the current situation?', {
  low: 'Routine monitoring suffices',
  medium: 'Mitigation planning recommended',
  critical: 'Active disruption; immediate action needed',
})
```

The actual gate implementation batches independent questions into one systemOne request — triage, query ranking, all thirty result scores, and the severity choice each cost one call. More importantly, Jev does not own policy. Code still owns the escalation threshold, the query budget, the relevance rubric, the severity options, and what happens after each answer.

Links: https://github.com/youdotcom-oss/risk-analysis-server/blob/f153e039db56b8e5374da638c0090be0585d98cd/src/services/jev.ts

The state payload is arbitrary JSON scoped strictly to what each gate needs: { profile, highlights } at triage, and { profile, results } at scoring. Each scoring question includes inline provenance ("this is a licensed Fiscal.ai data result as of 2026-08-31"), keeping licensed facts explicitly labeled throughout evaluation. Batching maps by position (r0–r29 map back to 30 results), which makes the interface easy to unit test—a regression test verifies that real profile records reach Gate 3 instead of empty literals. I didn't measure whether this structure improved accuracy, but it guarantees every judgment input remains inspectable after the fact.

That boundary is what makes the judgments useful in production: the model supplies a constrained answer; the program decides what that answer means. It also makes Jev nearly free — measured below, the entire judgment layer came to less than a cent for all three sweeps.

Links: https://docs.google.com/document/d/12ddt2lTnrKIgV-XyRx74fAEyg0yXTkfQWFhrrAZm3ew/edit#what-three-live-sweeps-cost

## Current evidence needs more than web links

The pipeline reaches You.com through the hosted You.com MCP server, scoped to you-search and you-contents. The same MCP client supports two modes:

Links: https://you.com/docs/agents/mcp-server

- Application code calls tools directly for deterministic triage, retrieval, and page fetching.

- Qwen receives a propose_query tool during the proposal loop — it proposes, it does not search.

Every search that can affect the report requests knowledge: "core". According to the Search API documentation, that asks for licensed-data answers in results.knowledge alongside web and news results. When no licensed record matches, the Knowledge section may be omitted rather than returned as an empty array.

Links: https://you.com/docs/guides/search

This distinction matters for risk monitoring. Breaking news can explain a disruption, while licensed sources can answer fact-shaped questions such as a current price, rate, revenue, or weather observation. Knowledge results can carry provider attribution and an as_of date, but they do not necessarily carry a URL. The normalizer therefore preserves URL-less facts, sends them directly to synthesis, and excludes them from page crawling.

The pipeline also applies a one-point relevance boost to licensed facts, capped at the top of the rubric, and reserves room for them in the final 15 evidence slots. That is an explicit application policy—not a claim that licensed data is automatically relevant or correct.

The runs behind this article demonstrate the tradeoff from both sides. The PNW report received six licensed facts, including a current U.S. electricity-price observation (0.196 USD/kWh, August 2026, per the Bureau of Labor Statistics) — but five of the six were company-profile records that matched the generic phrase "data center" without helping answer the regional permitting question. And the Gulf profile — the day's most volatile signal, scoring critical — attracted zero licensed facts at all. Provider provenance established where those facts came from; it did not establish their relevance, and their absence did not mean their absence of signal.

That leaves a clear upgrade path: replace the blunt boost with trigger-aware provenance rules or a second domain-specific relevance pass. A reliable pipeline should expose this limitation, not hide it behind an authoritative provider name.

## Bound the model's job and its context

Qwen has two responsibilities here: propose queries and write the report. It does not decide whether the sweep escalates, assigns relevance policy, control payload sizes, or persist state.

The model is accessed through the Vercel AI SDK and OpenRouter, with qwen/qwen3.8-27b as the default. Because the provider sits behind a small model factory, RISK_MODEL can select another OpenRouter model without changing the pipeline.

The expensive path has hard ceilings:

- 5 proposal-loop steps

- 8 model-proposed queries executed, after Jev ranks them (RISK_MAX_QUERIES)

- 30 results sent to Jev for scoring

- 15 results sent to synthesis

- 10 pages fetched for full content

- 12,000 characters per page

- 100,000 characters of page content in total

Every one of these ceilings exists because something ran without it. The failures that set them are the next section's story; the structural fix lives here. In short: the crawler left the model-visible toolset, search responses are projected down to URL, title, and description, pages are fetched in code only after ranking, every handoff is capped — and the proposal loop no longer executes searches at all. The generative model generates proposals, Jev ranks them, and application code controls execution and spending. A larger context window would postpone these failures; it would not make unbounded context a sound design.

## Long-running tools should return handles, not hold connections

The invoice run's sweeps took between 71 and 209 seconds. Making an MCP client hold one tool request open for that entire period proved fragile: the client could time out even while the server continued useful work.

The solution was a plain fire-and-poll contract. At the time of implementation, the target host did not advertise task support, so I used a normal MCP tool with two entry points:

```typescript
// Start
trigger_manual_sweep({ profileId })
// => { task_id, status: 'working' }

// Poll
trigger_manual_sweep({ task_id })
// => { status: 'working' | 'completed' | 'failed', ...outcome }
```

The important implementation detail happens before the first response: the server commits the sweep_tasks row to SQLite, then starts background work, then returns the handle. A second request for the same profile joins the in-flight task rather than creating a duplicate. The completed outcome contains reportId, severity, escalation status, knowledgeHits, the raw triage probability, and a usage ledger — You.com call counts and Jev token counts — so a client can verify not just that licensed evidence reached synthesis but what the sweep cost.

The MCP TypeScript SDK now documents task-based execution as an experimental call-now, fetch-later pattern. The plain-tool protocol remains a useful compatibility layer for hosts that do not negotiate that capability. The full tool implementation is in src/mcp.ts.

Links: https://ts.sdk.modelcontextprotocol.io/v2/documents/Documents.Server_Guide.html https://github.com/youdotcom-oss/risk-analysis-server/blob/f153e039db56b8e5374da638c0090be0585d98cd/src/mcp.ts

MCP is the delivery boundary, not the scheduler. Stdio serves local clients; the HTTP entry can remain supervised and run stored cron schedules after the chat client closes. Both paths share the same tools and SQLite state.

## Three failures that shaped the architecture

The most useful debugging incidents were not syntax errors. They revealed missing boundaries — two from the original build, one from the invoice run below.

1. Client timeouts forced fire-and-poll

A synchronous sweep coupled server work to a client request lifetime. Returning a durable task handle decoupled the two and made the interaction resumable.

2. Unbounded anything became a bill

Two incidents, one lesson. First, tiny mocked search responses never reproduced live payload growth: with you-contents exposed inside the agentic loop, full pages stayed in conversation history across turns, one uncapped synthesis path grew to roughly 212,000 tokens, and other runs crossed the configured model's context limit outright. Second, subtler: the proposal loop's tool used to execute searches directly, and the model's enthusiasm set the retrieval budget — 19 to 26 billable searches per sweep, whatever the report needed or not. Neither showed up until a live bill did. The fix was not another prompt instruction; it was removing the wrong tools from the loop and enforcing limits at every function boundary — the ceiling list earlier in this piece is that fix, itemized.

3. knowledgeHits: 0 exposed an inert feature

The system requested Knowledge in one stage, but those results never reached the report. The retrieval stage did not request them, model-generated queries were often too news-shaped to match fact providers, the normalizer dropped URL-less records, and rank cuts buried late-arriving facts.

Adding knowledgeHits turned "I think Knowledge is wired" into an observable invariant. Raw profile triggers now run as deterministic fact-shaped queries, URL-less facts retain provenance, and licensed evidence has reserved synthesis slots.

The general lesson is simple: ensure that a parameter actively influences pipeline decisions rather than merely checking that it is present in the payload. A parameter can be present in a request while having no effect on the output. The same discipline, applied to cost, produced the usage ledger — and the invoice below.

## What three live sweeps cost

All three of the invoice run's sweeps escalated and made exactly six Qwen calls.

| Profile | Escalated | Severity | Knowledge hits | You.com searches | Wall clock | Jev tokens (in/out) |
| :---- | :---- | :---- | ----: | ----: | ----: | ----: |
| PNW data center buildout | yes | low | 6 | 22 | 71s | 20,658 / 881 |
| US AI lab operations | yes | critical | 1 | 19 | 101s | 18,489 / 797 |
| Gulf AI infrastructure | yes | medium | 0 | 26 | 83s | 19,980 / 902 |

And the invoice, every provider attributed:

|  | Total (3 sweeps) | Per sweep |
| :---- | ----: | ----: |
| Qwen inference | \$0.0619 (18 calls, 66,741 in / 13,632 out tokens) | \$0.0206 |
| You.com retrieval (67 searches, 29 page fetches) | \$0.37 | \$0.12 |
| Jev judgments (59,127 in / 2,580 out tokens) | \$0.0025 | \$0.0008 |
| **Measured total** | **\$0.43** | **\$0.14** |

The reconciliation mattered more than the totals. The obvious story — a cheap model replacing an expensive one — is real but small: a frontier model behind every gate would still be rounding error next to the search bill, because retrieval costs about 6× the model. The dominant expense is evidence, not language, and the way this architecture keeps that bill bounded is that every search in the ledger exists because a judgment gate let it through. Where generation money does go is telling: the three report-synthesis calls cost 6.4× a proposal step each and carried 56% of the Qwen spend — the expensive generation is exactly where generated language is unavoidable. And the judgment layer, the part doing the gating, cost a quarter of a cent across all three sweeps — 0.7% of the retrieval bill, less than half of one synthesis call. At $0.042 per million input tokens with output free. Given the low cost of structured judgment calls, routing bounded decisions through a generative LLM adds unnecessary expense and latency.

Two bookkeeping traps are worth naming because they will bite anyone reproducing this. First, You.com bills Contents per URL, not per tool call: three you-contents invocations arrived on the invoice as 29 API calls (~10 URLs each), while the 67 search calls matched 67-to-67 — counting tool invocations would have under-reported retrieval cost by nearly 10×. Second, the search count itself turned out to be a policy choice: a follow-up run under a query budget (described above) cut retrieval from 67 searches to 36 — roughly $0.21 instead of $0.37 — without changing anything else.

Methodology: I grouped rows from an OpenRouter activity export by the corresponding task's creation and completion timestamps in the local SQLite database. Token counts and cost_total come from the export; wall-clock duration comes from sweep_tasks.created_at and updated_at. You.com costs come from the fresh key's dashboard, cross-checked against the ledger's call counts (search calls matched exactly; contents bills per URL, not per tool call). Jev tokens come from the SDK's usage field on every gate call, persisted on the task outcome, priced at TypeSafe's listed $0.042 per million input tokens. The figures include OpenRouter's actual routing, caching, and discounts. They are an observed result, not a latency or quality benchmark.

I also did not compare report quality against a frontier model. The supported conclusion is narrower: the 27B open-weight model was sufficient for query proposal and bounded synthesis in this pipeline. Retrieval and typed judgment did much of the work that a monolithic agent would otherwise ask one model to do.

## Testing the escalation threshold: adding a knob

Every gate in this pipeline encodes a decision, and Gate 1's decision — escalate or stop — is the one that spends the money. Its threshold shipped as 0.5, picked early, and nothing in the system forced anyone to defend it. So we made it a knob: RISK_TRIAGE_THRESHOLD, read at startup, with invalid values failing loudly rather than silently running at some other cutoff. And runSweep now returns the raw triage noul — threatProbability — on every outcome, escalated or clean, so each arm of the experiment leaves an auditable record.

Then we ran the same three profiles at 0.5 and at 0.7, minutes apart, on fresh dedicated keys:

| threshold | profile | noul | escalated | severity | searches | wall clock |
| :---- | :---- | ----: | :---- | :---- | ----: | ----: |
| 0.5 | Gulf AI infrastructure | 0.56 | yes | **critical** | 12 | 104s |
| 0.5 | PNW data center buildout | 0.63 | yes | medium | 12 | 209s |
| 0.5 | US AI lab operations | 0.83 | yes | medium | 12 | 100s |
| 0.7 | Gulf AI infrastructure | 0.58 | **no — clean sweep** | low | 1 | 3s |
| 0.7 | PNW data center buildout | 0.63 | **no — clean sweep** | low | 1 | 3s |
| 0.7 | US AI lab operations | 0.85 | yes | medium | 12 | 86s |

The table holds three lessons.

First, raising the threshold directly reduces execution costs, with scores clustering right around the cutoff point. Gulf and PNW landed at 0.56–0.63 — above 0.5, below 0.7. At 0.7 they become clean sweeps costing about 3 seconds and ~1.5k Jev tokens instead of full deep dives; the 0.7 arm spent about 40% of what the 0.5 arm spent (14 searches against 36). And because the budget caps every escalated sweep at 12 searches, the threshold's cost effect is no longer about how much a deep dive searches — it decides whether one happens at all.

Second, and this is the point: the 0.7 arm suppressed the run's strongest signal. In the 0.5 arm, Gulf scored critical — gas-turbine shortages, moratorium risk, permitting friction, all live. At 0.7 that never becomes a briefing. The clean-sweep run returns “No action required”, resulting in a false negative where critical signals go unreported without triggering an explicit system error.

Third, the marginal profiles live inside the band. Gulf scored 0.56 and 0.58 in its two runs, PNW 0.63 twice, US AI lab 0.83 and 0.85 — two of three profiles sit tightly inside the 0.5-to-0.7 gap, and noul barely moves between runs. Jev's noul is directionally calibrated, not a precise probability, and the band between two thresholds is exactly where a monitoring pipeline's whole personality gets decided: which day counts as news. That is a data-backed reason to sit at the conventional 0.5 rather than feel one's way upward.

Jev's own documentation adds a caution worth taking seriously: nouls are least certain near 0.5 — exactly where Gulf (0.56–0.58) and PNW (0.63) live — so the escalation band is where decision thrash concentrates; the judge ablation below shows a generative judge thrashing across precisely this line. The principled response is to price both error types and cut at c_fp / (c_fp + c_fn), acting only above the ratio of false-alarm cost to total error cost. A false alarm here is measured at $0.14; a miss is silence — and pricing silence above a wasted briefing puts that ratio at or below 0.5, equal only when a wasted briefing costs as much as a missed one. On that arithmetic, 0.5 is already the escalation-shy side of the optimum and the 0.7 arm moved further against the grain; and since a noul is directional rather than calibrated, the ratio picks the neighborhood, not the decimal.

So we kept 0.5, and the asymmetry decides it: a wasted deep dive costs about $0.14 and produces an inspectable briefing; a missed escalation produces silence. At 0.7 you trade roughly 2.3× more misses for fewer escalations — and with the search budget in place, the escalations 0.7 avoids are no longer noisy: each one costs a bounded 12 searches. A reasonable trade for a system whose misses are cheap, and the wrong one here. The knob ships anyway, because a threshold you can defend with data is worth more than a default you inherited.

## Removing Jev: same pipeline, different judge

Everything above argues that judgment should be structurally separate from generation. That is a testable claim, so we tested it: we removed Jev.

The four gate decisions now sit behind a Judge interface — triage, ranking, scoring, severity — and RISK_JUDGE=jev|qwen selects the engine. The qwen arm is deliberately not a strawman: the sweep model answers the same four questions, in the same batches, with the same rubric text, in strict JSON that code parses. Jev's answers arrive typed; Qwen's arrive as JSON that could fail to parse. That is the difference under test, and a fairness requirement: parse failures were counted and would have been reported as findings. Zero occurred across every completed sweep.

Same profiles, same news day, same threshold, same query budget. The Jev arm ran nine completed sweeps across three runs and escalated nine times, its triage nouls stable within ±0.05 per profile across every run that recorded them. The Qwen arm attempted eleven and escalated six. Its Gulf triage read 0.35, then 0.68, then 0.50 across consecutive runs — the same profile, the same day, straddling the escalation cutoff. PNW is worse, because it is not noise: the Qwen judge read PNW at 0.35–0.40 while the Jev arm, interleaved with it within the same hour (Jev escalated PNW at 22:06 and 22:29; Qwen skipped it at 22:22, 22:30, and 22:42), read the same landscape at 0.63–0.65 and escalated every time. While the typed judge produces consistent metrics across runs, the generative judge produces erratic scores on identical inputs.

Then the part we could not grade ourselves: report quality. Fifteen deep-dive reports — nine Jev, six Qwen — were stripped of dates, shuffled with a recorded seed, and read blind by a human against a rubric frozen before the read: factual grounding, signal capture, actionability, false-signal avoidance, 1–5 each. The identity key stayed sealed until the scores were in.

| axis (blind, 1–5) | Jev (n=9) | Qwen (n=6) |
| :---- | ----: | ----: |
| factual grounding | 4.44 | **4.83** |
| signal capture | 4.00 | 4.17 |
| actionability | **4.22** | 3.67 |
| false-signal avoidance | 4.33 | 4.33 |
| **mean** | **4.25** | **4.25** |
| floor / ceiling (total /20) | **14 / 20** | 11 / 19 |
| perfect / weak reports | **3 / 0** | 0 / 1 |

The means tie — exactly, 4.25 against 4.25. The distributions do not: Jev never produced a report the reader scored weak; Qwen never produced a perfect one. Qwen actually wins factual grounding. When the Qwen gate said yes, its reports were fine — its single PNW deep dive scored 19/20. The reports were never the problem. The gate was. A judge whose escalate-or-skip verdict wanders across the 0.5 line run-to-run makes coverage a coin flip, and on PNW that cost three or four deep dives — forfeiting material signals that the Jev arm's same-evening reports demonstrably found. The blind reader judged each skip defensible on the evidence the stub cited, and it still wasn't free: a skipped sweep is indistinguishable from a quiet day.

Cost and latency differ significantly. Jev's judgment calls cost ~$0.0005 per deep-dive sweep (~13k input tokens at $0.042/1M with free output). In contrast, Qwen judge calls average 9k input and 22–41k output tokens. Because output tokens are billed at ~$4.43/1M, Qwen costs $0.10–0.18 per deep dive—roughly 250× the cost of Jev, and higher than the total cost of a full Jev-based sweep ($0.14 all-in). The Qwen judge alone spends more to judge a sweep than the Jev pipeline spends to run one. Even the no-op path — a triage verdict that skips the deep dive — bills 8–27× a full Jev-judged sweep. And each Qwen-judged deep dive ran 7–12 minutes against Jev's ~2, with four large serialized generations sitting on the critical path where Jev's answers arrived typed in a fraction of the time.

One reader, one news day, six reports against nine, and a Qwen pool containing only the sweeps its own gate allowed through — this does not settle generative judges. It settles something narrower and more useful: in this pipeline, swapping the typed judge for the generative one left report quality unchanged and broke the properties the system exists for — calibration stability, coverage, bounded latency, sub-penny judgment. Merging judgment back into the generative model yields no cost savings; running a dedicated, typed evaluation layer costs fractions of a cent while keeping calibration stable.

## What "reliable" means here

Reliable does not mean infallible. The Gulf and PNW licensed-match records alone show why that distinction matters.

Here, reliability means the system has operational properties I can inspect:

- Bounded execution: step, query, result, URL, and character ceilings constrain context and spend.

- Durable task state: a returned handle already exists in SQLite.

- Failure isolation: one profile's failure does not crash a scheduled batch.

- Evidence provenance: reports retain web links and licensed-provider attribution.

- Code-owned policy: thresholds, budgets, rubrics, and boosts live in version-controlled TypeScript — and the important ones are configurable knobs that can be tested.

- Pluggable judgment: the four gate decisions sit behind one Judge interface, so the engine itself is a knob (RISK_JUDGE) — judgment quality is something you can measure, not assume.

- Observable influence: knowledgeHits reports whether licensed facts actually reached synthesis; threatProbability reports what the escalation gate actually saw; usage reports what the sweep actually spent.

- Portable delivery: MCP clients consume the same tools and Markdown reports over stdio or HTTP.

It does not mean every source is correct, every licensed fact is relevant, or every generated conclusion should trigger an automated business action. High-impact decisions still need domain-specific evaluation and, where appropriate, human review.

## Try one profile

The repository is MIT-licensed and runs on Bun:

```typescript
git clone https://github.com/youdotcom-oss/risk-analysis-server.git
cd risk-analysis-server
bun install

export YDC_API_KEY=...
export TYPESAFE_API_KEY=...
export OPENROUTER_API_KEY=...

bun src/stdio.ts
```

Connect it to an MCP client, create one narrow profile, run a sweep, and inspect which evidence survived each gate. The most useful first question is not "Did the report sound good?" It is "Can I explain why every item reached the report?"

That question is what turned this project from a model demo into a background system I could reason about.
