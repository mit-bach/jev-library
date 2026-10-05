# Jev

My research notes on Jev, TypeSafe AI's new structured decision model, plus a working demo running through Cloudflare AI Gateway.

See [AGENTS.md](./AGENTS.md) for the technical details on the example project. This file is the human-readable version: what Jev is, what it's good for, and where it falls apart.

**Try the live demo:** https://jev-triage-playground.ziki.workers.dev. Paste a support message, and Jev triages it (department, urgency, frustration) in one call. The page renders the probability bars, the confidence scores, and a routing decision, live.

## What is Jev

Jev is the first "System One Model" from TypeSafe AI, a stealth startup that came out of hiding on September 15, 2026 with $40M led by DCVC. Co-founder and CEO Diogo Almeida co-invented RLHF and InstructGPT at OpenAI, the work that led to ChatGPT and GPT-4.

The name comes from two places. "System One" is a nod to Daniel Kahneman's *Thinking, Fast and Slow*: fast, intuitive System 1 thinking versus slow, deliberate System 2 reasoning. Jev is System 1. Reasoning models are System 2. And "Jev" itself is short for William Stanley Jevons, the economist behind the Jevons paradox: make something more efficient and people use more of it, not less. TypeSafe is betting the same thing happens with intelligence. Make a decision cost a fraction of a cent and you'll put decisions in places you'd never have called an LLM before.

Here's the one-sentence version I keep coming back to: **Jev is a smart `if` statement.** Regular code branches on values it can compute, like `if order.total > 100`. That falls apart the moment the condition is a judgment call, like "is this message angry?" Jev fills that gap without generating a word of text.

## What it does

You send it two things:

- **state**: the situation, as a string, object, or array. A support ticket, an order, an account history, a list of items.
- **questions**: a set of typed questions about that state, all answered in parallel in one request.

There are three question types:

- **Noul** — a yes/no question. Returns a probability.
- **Choice** — pick one of up to 255 labels. Returns the winner, the full probability distribution, and a confidence score.
- **Score** — a position on an ordered rubric, 2 to 10 levels. Returns a probability-weighted mean plus the full distribution and confidence.

Nothing gets generated. A successful answer can't contain a value outside the schema you gave it, which TypeSafe calls a 0% structural type-error rate. That's not the same as always correct, though. The model can still pick the wrong option from the set you allowed.

## What's actually different about it

A few things stack up here:

**No text generation.** It samples all the answers in parallel instead of decoding tokens one at a time. That's the whole speed story: TypeSafe quotes 70–500ms end to end, usually around 100ms, against 3 to 329 seconds for a frontier LLM asked the same kind of question.

**Adding questions is nearly free.** Every question in a request runs against the same shared state at the same time, so 13 questions cost about the same latency as 1. TypeSafe calls this "speculative fan-out": ask everything you might need in a single call and let your code sort out which answers matter.

**Calibrated confidence.** Jev was trained with what TypeSafe calls Reinforcement Learning for Calibrated Decisions, not RLHF. The goal is that a "90% confident" answer is actually right about 90% of the time across many predictions. Not that any single answer is guaranteed correct, just that the confidence number means something you can act on.

**Cheap.** $0.042 per million input tokens, output basically free. TypeSafe claims up to 193.6x faster and 444.6x cheaper than LLM-based structured output, measured on its own internal workflows. Treat that as a ceiling, not a promise.

It also has a 32,000 token context window and roughly a 64,000 token budget shared across state and all your questions.

## Where it breaks

TypeSafe actually publishes a page for each model version listing what it's bad at, and they call it "jaggedness." The pattern across all of it: Jev reads your words literally, and it can't do arithmetic.

- **No math.** It can't reliably count characters, count occurrences, or tell whether two hex colors are close. Do the arithmetic in code, or ask one Noul per item and sum the results yourself.
- **No real date or time reasoning.** Comparing `18.17.1` against `24.15.0`, or figuring out which of two dates comes first, is unreliable, especially with mixed formats. Extract the pieces with a Choice, then build a real date object in code and compare there.
- **Scores aren't measurements.** A score of 1.3 doesn't mean "40% of the way from level 1 to level 2." Each level gets judged on its own, so the space between levels isn't well calibrated. Use scores to threshold or rank, not to interpolate.
- **Indirection hurts it.** Double negatives, a property of a property, anything with more than one hop. Point straight at the relevant part of the state instead.
- **Too much irrelevant context hurts it too.** Jev gets context rot like any other LLM. Filter the state down to what the question actually needs.
- **It's not hardened against adversarial input yet.** State is treated as data, but text written to steer the model can still move the answer. Test with hostile inputs before you put this in front of the public.
- **It can't write anything.** No prose, no code, no summaries, no explanations. If you need text, you still need an LLM. The whole pattern is Jev decides, an LLM writes.

Here's a real example of that jaggedness in action, from someone testing it in the wild. @GoSailGlobal ran Jev against 3,448 articles from Microsoft's MIND news dataset, giving it only the title and abstract, no click data, and asked it to judge whether each article seemed "useful." The correlation between "judged useful" and the article's actual click-through rate in its first 100 impressions came back negative, ρ ≈ -0.129. A nice reminder that Jev will happily give you a confident-sounding answer to a question the input can't actually answer.

## What people are building with it

Pulled from TypeSafe's own docs, third-party write-ups, and posts I found on X.

**Labeling and classification at volume.** The first thing everyone reaches for. One demo classified 1,018 summarized AI papers across 24 topics for $0.08 total, around 256ms median per paper. Another ran 98,000 listing classifications in ten minutes. Resume screening, inbox triage, support ticket routing: all the same shape.

**Routing and verification.** One Jev call in front of a support flow or an agent decides which handler, which model, or which human gets the message. The flip side of routing is checking: does this generated claim actually match the transcript it was summarized from, or should this coding agent's shell command run at all before you let it (read-only, reversible, irreversible)?

**Retrieval.** Re-ranking BM25 shortlists with one Noul per query-passage pair, scoring passages for relevance and for hidden prompt injection before they reach the answering model, checking whether a citation actually backs up the claim it's attached to.

**Real-time interfaces.** A call takes a few hundred milliseconds, so it can run on every keystroke pause. One editor demo scored tone, conviction, and "reads as AI-written" while the user was still typing. A browser extension hides rage-bait, crypto promotion, and political arguments in a feed, using categories the user defines instead of a fixed platform filter.

**Games and agents, which is where this gets fun.** Tetris and driving-sim demos used Jev to pick the next move from structured game state. TypeSafe's own launch demos include a Doom bot running at about 10 queries a second for roughly $7 an hour, and a Wikiracing bot that picks among hundreds of links per step without ever choosing one that doesn't exist. One chatbot demo skipped a generative LLM entirely: Jev picks which tool answers the message and fills in the arguments as Choices, about 300ms end to end. Browser automation demos have Jev choose which page element to click next while a separate LLM sets the goal; one booked a flight in about seven seconds.

The best example I found: Steve Faulkner at Cloudflare (@southpolesteve) built [**Probably**](https://probably-lang.southpolesteve.workers.dev), a toy programming language with Jev baked in as an actual keyword. `feels` asks a yes/no question with a confidence threshold. `match` routes between 2 to 8 labeled branches. `while ... feels` loops until a judgment flips. His description: "Jev makes the decisions, an LLM does the writing, and a little program ties it together." It got 328K views. Someone joked it was smart not to call it JevaScript, and at least one person now calls themselves a Jeveloper.

And then there's @DanFrmSpace, who got Jev to play Pokémon: up to 5 parallel Pokémon Showdown battles, Jev picking every move and switch itself. 41 completed games, 2.6M+ input tokens, about $0.11 in total inference cost.

**Feature engineering.** Turning free text into numeric features for a classical model. One cookbook went from 18 questions to 38 over five rounds and ended up with 67 numeric columns feeding a CatBoost regressor.

## The skeptical take

A few write-ups (the-decoder, InfoWorld, flaviocopes.com) pushed back on the launch hype, and I think they're right to:

- TypeSafe's headline speed and cost numbers come from its own workflow evaluations, and the company itself says those sit at the high end of what you'd see in practice.
- "Can't hallucinate" only covers the shape of the answer. A wrong-but-valid choice from your allowed set is still entirely possible.
- The comparisons in TypeSafe's launch materials pit its own four workflows against other models' structured-output paths, not an independent benchmark, and newer frontier models weren't included.
- The number that actually matters is cost per solved task, not cost per token. If the cheap path needs more retries or more human review to hit the same reliability, the savings shrink fast at the workflow level.
- And for anything plain deterministic code already handles correctly, plain code still wins. An `if` that costs nothing beats an `if` that costs a hundredth of a cent and can still be wrong.

## Where to try it

- TypeSafe direct: waitlisted, keys at console.typesafe.ai/settings/keys, one endpoint (`POST api.typesafe.ai/v1/systemone`)
- Vercel AI Gateway: model ID `typesafe-ai/jev`, through the AI SDK 7 `experimental_evaluate` API
- OpenRouter: added in beta, same $0.042/M input, free output
- **Cloudflare AI Gateway: model ID `typesafe/jev`, via `env.AI.run()` or the REST API.** This is the path the demo in this repo uses. No separate API key needed beyond your Cloudflare account.

## The demo in this repo

[example/](./example) is a Cloudflare Worker deployed at **https://jev-triage-playground.ziki.workers.dev**. Paste a support message, or pick one of the presets (urgent outage, angry billing, casual sales, or a deliberately vague message), and hit Analyze. Jev returns:

- a **department** Choice with a full probability bar chart and a confidence score
- an **urgency** Noul, rendered as a yes/no probability split
- a **frustration** Score with its rubric and probability distribution
- a **verdict**, computed right there in the browser from the confidence values: auto-route, auto-route-with-a-flag, or send it to a human. That's the exact confidence-gating pattern TypeSafe's own docs recommend.

The raw JSON is still there if you want it, tucked into a collapsed `<details>` at the bottom.

## Sources

- https://developers.cloudflare.com/ai/models/typesafe/jev/
- https://typesafe.ai/blog/introducing-system-one-models-and-jev
- https://typesafe.ai/
- https://the-decoder.com/former-openai-researcher-builds-an-ai-model-that-judges-options-instead-of-writing-text/
- https://www.infoworld.com/article/4223468/typesafe-ais-new-models-work-with-machines-not-humans.html
- https://flaviocopes.com/jev/ — the deep dive. Read this one if you only read one.
- https://vercel.com/ai-gateway/models/jev
- https://vercel.com/changelog/typesafe-ai-jev-now-available-on-ai-gateway
- https://vercel.com/docs/ai-gateway/modalities/evaluation
- https://dev.to/valyuai/how-to-use-jev-a-practical-guide-to-typesafes-system-one-model-g5e
- https://x.com/southpolesteve/status/2100767781868150938 — the Probably language
- https://x.com/corywilkerson/status/2100679052860575945 — Jev live on Cloudflare AI Gateway
- @DanFrmSpace on X — Jev playing Pokémon Showdown
- @GoSailGlobal on X — Jev vs. the MIND news dataset
- @nifal_adam on X — OpenRouter adds Jev in beta
