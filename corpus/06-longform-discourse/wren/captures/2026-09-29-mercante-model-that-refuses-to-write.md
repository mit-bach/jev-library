author: mercante
handle: @merccante
post id: 2105040815537971408
timestamp: 2026-09-29T21:03:34Z
url: https://x.com/merccante/status/2105040815537971408
engagement: likes 11, reposts 0, quotes 1, replies 1, bookmarks 11, views 1218
article url: https://x.com/i/article/2105040337903456257
article title: Jev: the model that refuses to write on purpose
_disclaimer: This is a saved post, not an official TypeSafe document.
This is a saved post, not an official TypeSafe document.

Retrieval note: fxtwitter article body. Company facts and prices are the author's retelling of TypeSafe's public claims.

# Jev: the model that refuses to write on purpose

A company spent two years saying nothing, then shipped a model that still says nothing, on purpose. Within three days strangers had it finding flights for less than half a cent and sorting five hundred emails for the price of a stick of gum.

The company is TypeSafe AI. The model is Jev, launched 15 September 2026. It cannot write an email, summarize a document, or generate a line of code. Ask it to write anything and it will not. That is not a gap someone forgot to close. It is the product.

## The founder who kept asking the wrong question, then found the right one

Jev's creator, Diogo Almeida, co-invented RLHF, the technique that turned raw language models into something like ChatGPT, during his time at OpenAI. He left with two colleagues, Erik Gafni and Sasha Sheng, carrying a question that should bother anyone who reads agent bills instead of launch videos: if chat models are this good, why has superhuman conversation not produced software you can leave running without standing next to it?

His answer, now backed by a $40M seed round led by DCVC, is that the industry has been renting a Ferrari to sit in traffic. Most of what software needs is not language. It is judgment. Is this ticket urgent? Which of five workers handles this? Did the test pass? Is this shell command dangerous? None of that needs a paragraph. It needs a fast, calibrated yes.

Every one of those questions was still being routed through a full language model, because that was the only tool anyone had. Jev is built for the other half of the job.

## A three-question test before you touch any code

A decision belongs to Jev only if you can answer yes to all three.

1. Can you write down every valid answer in advance? If the list of acceptable outputs is open-ended, this is not a Jev decision. It is a writing task.

1. Would a fast human glance settle it? If judging the situation correctly requires actually thinking, not just recognizing, a classifier is the wrong tool no matter how cheap it is.

1. Does this happen often enough for milliseconds and fractions of a cent to matter? A decision you make five times a week does not need a 200x speedup. A decision made five thousand times a day does.

Three yeses, and the decision is a real candidate. One no, and the honest move is leaving it exactly where it is. Run it once on something real. "Is this support ticket urgent." Every valid answer fits in two words. A person glances at the ticket for three seconds and knows. It happens hundreds of times a day. Three yeses. That decision has been costing a full generation call for something that never needed one.

## What actually happens when you send it a question

You give Jev two things: state, and typed questions. State is just the situation — a JSON blob, a log, a transcript, whatever text describes what is happening right now. The questions come in exactly three shapes.

Choice picks one option out of a list you define, up to 255 of them, and returns a probability for every single one. Score places the input on an ordered scale you define and returns a probability-weighted position, which can land between two levels rather than snapping to one. Noul, TypeSafe's own name for a yes/no primitive, returns a number between 0 and 1 representing how true the answer is.

That is the entire vocabulary. No prose to parse. No JSON repair when the model decides to explain itself first. You ask which team should own this ticket, define engineering, billing, and sales as the only three valid answers, and you get back a probability for each one, in one round trip, evaluated in parallel rather than one token at a time.

The response time TypeSafe reports: 70 to 500 milliseconds. The price: $0.042 per million input tokens, with output tokens free, because there is no output in the usual sense. A chat model reasoning through the same classification out loud first sits, in the company's own comparisons, between 3 and 329 seconds.

The name is not decoration. William Stanley Jevons described the paradox in which making a resource cheaper increases consumption instead of shrinking it. TypeSafe's bet is the same shape: if a decision costs a fraction of a cent, an agent will start making it on every step, not only on the steps that already set the bill on fire.

## Setting it up, and why ordinary code owns everything after the answer

Python 3.10 or newer, a key from TypeSafe's dashboard, one call. Several questions against the same state travel in a single request, which is why a fourth or fifth question barely moves latency. Your code decides what happens with the answer.

```
client.decide(state=ticket, questions=[
  Choice('owner', options=['engineering','billing','sales']),
  Noul('urgent'),
  Score('severity', levels=['low','med','high'])
])
```

That last block is the architecture in miniature. Jev answers the fuzzy question. Ordinary code, the kind you can unit test, owns every branch after that. Each kind of decision gets its own acceptance threshold. A high number back from Jev tells you it is sure. It does not tell you it is right. That gap between certainty and correctness is the entire reason the threshold exists.

## The numbers that made this land within 72 hours

Marketing claims are cheap. What made people pay attention was developers testing it in public within three days of launch, and posting the receipts.

Browser Use wired Jev into an agent that reads a live webpage, decides the next click, and executes it. It found flight results in 7 seconds for $0.0039. Not simulated. A public video, timestamped, at real speed.

A developer named Hassan fed Jev 1,018 real AI research papers and asked it to classify each one into a topic. Total cost: $0.08. Median time per paper: 256 milliseconds.

Riley Brown ran 500 real emails through it for triage, deciding reply, research, wait, or review for each one. Total cost: 3.5 cents.

Jarrod Watts went further and built a live market-making bot on the Monad blockchain, having Jev decide buy or sell against a real on-chain order book every 300-millisecond block. The repository crossed 1,000 GitHub stars in three days, with a public dashboard streaming decisions landing in 81 milliseconds each.

Separately, someone ran Jev as a plugin inside Claude, using it to review which tool calls in a session were actually necessary. It compacted a Claude session from nearly 1 million tokens down to 86,000, in one second. Not a summarization pass. A relevance filter running at Jev speed.

By the end of the first week the picture was already larger than the launch post. Hermes Agent picked up native jev_* tools and a community plugin that treats decisions as a nervous system instead of scoring every token. Skills appeared for model routing, memory selection, context compaction, and the next browser click — the small pauses an agent makes all day that used to be billed as thought. An open replica, NanoJev, showed up on the same field of zero text output. This is no longer one lab's demo. It is a fork in the road: either a decision stays a paragraph, or it becomes a function call.

## The honest part almost nobody selling the ceiling mentions

TypeSafe's published range is roughly 20 to 200x faster and 40 to 400x cheaper. Those numbers are a ceiling, not a typical result, and treating them as a target instead of a description is how people end up building the wrong architecture.

The real multiplier does not come from Jev being 200x faster than an LLM on one call versus one call. It comes from decision density. Picture an agent working through a support ticket end to end: reading the complaint, checking whether it matches a known bug, deciding which team owns it, scoring how urgent it is, and confirming the fix actually resolved things before closing the ticket. Four of those five steps have a bounded, short answer. Only one of them, reading the complaint itself, genuinely needs language. In a standard setup, all five get routed through the same generative model anyway, each one writing out a paragraph of reasoning before landing on an answer that only ever had two or three valid shapes. Pull the four bounded steps out and route them to Jev instead, and you are not making one call faster. You are removing four full-cost generation calls from every single ticket, at volume, all day.

Most agent bills are not expensive because the work is hard. They are expensive because four out of five steps were never asked to be cheap.

A workflow that is mostly generation — writing a long document from scratch — gets nowhere near the advertised ceiling. A workflow dense with bounded decisions gets close to it. The actual skill is auditing your own agent first to find which decisions were never decisions the language model needed to make.

## What it genuinely cannot do, stated plainly

Jev cannot break its own answer schema. If you define three valid categories, it will never invent a fourth. TypeSafe describes this as an inability to hallucinate, and that is true, but only under a narrow definition worth being precise about.

It can absolutely choose the wrong valid option, confidently, and there is no error message for that, because returning a confident answer is exactly what it is built to do. Picture a schema built to sort support tickets into "needs a refund," "needs an apology," and "needs escalation," three categories that sound distinct but overlap constantly in practice. A model forced to pick exactly one from three options that were never truly separate will pick one anyway, every time, with a confidence score that looks identical whether the pick was obvious or a coin flip. The fix is not a better model. It is rewriting the three categories so they do not secretly describe the same ticket from three different angles.

TypeSafe is fairly direct about where the line sits, once you look past the headline numbers. Jev does not generate text or design a strategy from nothing. It cannot chain one judgment into the next inside a single call, because every question in a request gets answered in isolation, so a decision that depends on a different decision still needs two separate round trips. It has no business competing at microsecond latency, the kind colocated trading infrastructure runs at. And none of its speed changes whether an answer was actually correct. A genuine emergency sorted into the wrong queue in 90 milliseconds is not a smaller mistake because it arrived fast. It just got expensive faster, and nobody found out until someone went looking for why the ticket sat untouched.

Two more limits that are easy to miss behind the storefront. Input is text for now: strings, JSON, arrays of text. Images, audio, and video are not supported. Context is about 64k per request. Arithmetic, counting, date ordering, and multi-hop reasoning stay with code and with the language model. Jev is not a replacement for Claude, GPT, or Hermes. It is the layer that decides when those models are worth waking up.

## Where this is already shipping

LangChain shipped middleware that runs every proposed tool call through Jev before it executes, blocking risky actions and approving safe ones at a fraction of a cent, instead of trusting the same model that wrote the command to also judge whether the command is safe. Coding tools like Claude Code, Codex, and Cursor have quietly shipped some version of this classifier gate for a while now, buried in the closed-source parts of their own harness. What changed on 15 September is that the same pattern is no longer locked away.

Hermes puts the same layer closer to the operating loop: which model is good enough for this turn, which retrieved passages are worth reading, which turns survive a summary, which installed skill this turn actually needs. The point is the same as the support ticket. Leave writing and real reasoning with the expensive model. Hand the pauses that only dressed up as reasoning to the cheap one.

## The actual shift underneath the launch

Jev is not a smarter chat model, and it never tried to be one. It is a bet that most of what software calls intelligence was classification wearing a paragraph as a disguise, billed at generation prices for an answer that only ever had two or three valid shapes.

Before you build anything, open the last agent session you actually ran and count. Every place it paused to decide something, not write something, run it through the three questions from earlier. Most sessions have more of those moments hiding in them than anyone notices on the first pass, right up until they go looking specifically for the pause.

You are still paying for a paragraph every time your agent could have just said yes.
