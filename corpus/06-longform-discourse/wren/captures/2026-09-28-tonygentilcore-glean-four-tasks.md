author: Tony Gentilcore
handle: @tonygentilcore
post id: 2104639390266036251
timestamp: 2026-09-28T18:28:27Z
url: https://x.com/tonygentilcore/status/2104639390266036251
engagement: likes 369, reposts 40, quotes 10, replies 12, bookmarks 927, views 188890
article url: https://x.com/i/article/2104627177396588544
article title: Is Jev overhyped? We tested it on 4 real enterprise tasks.
_disclaimer: This is a saved post, not an official TypeSafe document.
This is a saved post, not an official TypeSafe document.

Retrieval note: fxtwitter article body. TypeSafe amplified the post. Every figure is the authors' claim about Glean's internal comparison, not an independent measurement.

# Is Jev overhyped? We tested it on 4 real enterprise tasks.

Authors: @eddiedzhou, @mr_cheu, @MatZhao, @CosmicPegasis19, @manav_ai

Links: https://x.com/@MatZhao

Jev is a model for making typed decisions. You send it context plus a fixed set of questions and options, then it returns choices, scores, and probabilities instead of generating text.  It’s a “System One” model!

Links: https://typesafe.ai/blog/introducing-system-one-models-and-jev

But classification is not new, and neither are structured outputs, small models, or reading probabilities from logits. That history explains some of the split reaction to Jev...

[Image omitted.]

The skeptics have a real point, but Jev has a real place in this ecosystem.  To understand more, we should lay out the full solution space.

# What are the alternatives?

When a system needs a label, score, or yes-or-no answer, there are four reasonable options:

| Approach | Why use it | Tradeoff |
| :---- | :---- | :---- |
| A general-purpose LLM | Zero-shot, flexible, can also generate arguments or explanations.  Arguably “higher intelligence” via inference-time compute (reasoning). | Paying autoregressive-model latency and cost for a small decision |
| An open zero-shot classifier | Cheap, local, and controllable | Variable quality; you own model selection and serving |
| A fine-tuned classifier | Usually the best bet for a stable, high-volume task with good labels | Data collection, training, deployment, drift, and a less flexible taxonomy |
| Jev | Zero-shot flexibility behind a clean, hosted API | Task-dependent quality, no generated text, and provider dependency |

The case for Jev: a team can change the question and options without collecting a new training set, while avoiding the work of serving a model well. No one should turn their nose up at that. “We could build it ourselves” is true of most infrastructure products.

Open reproductions keep the novelty claim in check. Implementations using Qwen and SGLang, DiffusionGemma and vLLM, and Kev recreate much of the API or model shape.

Links: https://github.com/ekzhang/openjev-sglang https://github.com/mmastrac/djev-spark https://github.com/jaredpalmer/kev

[Image omitted. Caption: 85.7% for Jev and 79.6% for Kev-8B on n=764]

Parallel’s external tests likewise found Jev competitive on reranking, while specialized models still won two classification tasks.

Links: https://parallel.ai/blog/testing-jev

# What we’ve seen at Glean

That leaves a practical question: when does Jev’s combination of zero-shot flexibility and hosted inference actually beat the alternatives? We tested four bounded decisions at Glean where we already had a baseline and could compare real enterprise quality.  Most of these baselines are LLM-based systems, so for those experiments we know to expect two orders of magnitude improvement on cost and latency. The results ranged from materially worse than production to both faster and more accurate than an LLM-based router.

## Query classification

Query classification maps a request to a broad task used by downstream systems. It is a natural Jev workload because while on a per-request basis, the label space is known in advance, the taxonomy can still change faster than a fine-tuned classifier can be retrained.

For this experiment, we focus on gauging Jev’s agreement against our production / baseline predictions, which is LLM-based. We expect and observed a large speedup in offline throughput with Jev, so we report agreement as an easy proxy for quality.  We also baselined against Laya, an open-weight decision model as well as a fine-tuned Laya.  This fine-tuning was able to run locally in a few hours, and the model is also small enough to be served on a developer machine.

| Experiment | Broad Task Agreement | Perf |
| :---- | :---- | :---- |
| Jev zero-shot | 66.8% | \~12min (concurrency of 4\) |
| Base Laya | 35.9% | \~90s (local dev machine) |
| Fine-tuned Laya | 74.5% | \~90s (local dev machine) |

As a convenient, no-training off-the-shelf model, Jev clearly outperforms Laya, but somewhat unsurprisingly, fine-tuning makes Laya shine, especially given the performance numbers.  The tradeoff is the effort to get good labels and set up training. Jev likely remains more attractive when a task is new or its labels are changing.

## Model routing: expert transfer

Model routing is a related problem to query classification.  Here, we frame model routing as expert transfer, where our system chooses which expert / model should handle the request. Our production baseline currently asks an LLM to make that decision natively inside the harness's agentic loop. While this is a natural test of whether Jev can replace a generative call with a bounded decision, an important technical limitation is that Jev will strictly add a call in the event of a non-transfer.  This is in contrast to the production baseline, which in non-transfer cases, can begin the tool-calling work via the same single first LLM call.

[Image omitted.]

We used a simplified version of our production routing with only 3 experts, replayed 751 comparable golden entries through the updated Jev router and compared its chosen route with our existing prompt-based router (powered by a traditional LLM), and measuring the accuracy against golden label.

[Image omitted.]

We also isolated 40 entries where the existing path made an actual expert-transfer call (smaller n) and compared call latency on those same entries.

[Image omitted.]

The median per-entry speedup was 8.1×. This is one of the strongest internal Jev results so far: on this bounded routing task, Jev was both more accurate and substantially faster. The magnitude of the delta implies that the “blocking” tax we incur on non-expert-routed requests may be a good tradeoff. Note that it is still an offline golden-set comparison, and the latency sample contains only 40 positive transfers, so there's a lot more to derisk and test!

## Reranking

A problem near and dear to Glean! Below, our production baseline is the order produced by Glean’s existing search stack. This experiment then asked Jev to reorder up to 50 results.

We tried four ways to express relevance through Jev’s typed outputs:

| Formulation | How it expresses relevance |
| :---- | :---- |
| Pointwise Noul | Ask a separate yes-or-no relevance question for each result, then sort by the probability of “yes.” |
| Shared-state Noul | Show Jev the full candidate set as shared context, then ask the same yes-or-no question for each result. |
| Score | Ask Jev to assign each candidate a numerical relevance score. |
| Choice | Treat all candidates as alternatives in one decision, then rank them by their resulting probabilities. |

We ran this on an internal evalset where the user does not have access to all canonicals, so the absolute numbers are not reflective of our production ranking – but the relative numbers are of interest.

Jev “Choice” was the strongest formulation. On a paired control of 4,855 captured search queries, with production-based tie-breaking removed, the result was:

[Image omitted.]

Jev Choice cost roughly $0.00044 per query and took 0.195 seconds at p50 in the offline test. But it assigned identical scores to roughly 37 of the 41 candidates in an average query. Using production order to resolve those ties raised Recall@6 from 40.2% to 44.3%, making the uncorrected result look stronger than Jev’s scores alone warranted. There are many caveats here as per usual, but directionally, Jev is a cheap, efficient baseline, not a replacement for Glean’s production ranker.

## Citation-support judging

Citation judging asks two related questions: do claims that need evidence have adequate citations (citation recall), and do the cited sources actually support the claims attributed to them (citation precision)? At first glance, because the output / label space is bounded (similar to most judge settings) this seems like an obvious fit for Jev.  The rubric is complex, however, and may require decomposing several claims – in addition, Jev doesn’t produce the rationale that we often use for error analysis, so there is some risk to both quality and usability.

We tested Jev on a real 1,448-word production-eval response, holding the response and citation evidence fixed. We compared its shared precision-and-recall pass with GPT-5.6 Luna using no reasoning and xhigh reasoning. To reduce variance, we ran each judge three times.

| Judge | Original measured time per response | Original measured cost per response |
| :---- | ----: | ----: |
| Jev | 6.6 s | \$0.014 |
| GPT-5.6 Luna, no reasoning | 81.3–85.5 s | \$0.030–\$0.047 |
| GPT-5.6 Luna, `xhigh` | 227.4–259.7 s | \$0.047–\$0.060 |

Note that the timing is directional rather than end-to-end: Jev reports sequential client wall time, while the Luna rows sum model-call durations. Costs include observed caching.

We also compared consistency on the same 28 paragraphs. A changed item means the judge changed its verdict on whether a paragraph had adequate citation coverage in at least one of three identical-input runs. Pairwise disagreement counts each paragraph across the three run pairs, for 84 comparisons per judge.

| Judge | Paragraphs with a changed recall verdict | Pairwise recall disagreements |
| :---- | ----: | ----: |
| Jev | 1 of 28 (3.6%) | 2 of 84 (2.4%) |
| GPT-5.6 Luna, no reasoning | 7 of 28 (25.0%) | 15 of 84 (17.9%) |
| GPT-5.6 Luna, `xhigh` | 5 of 28 (17.9%) | 10 of 84 (11.9%) |

Jev’s only change was whether one paragraph counted as needing a citation; its raw recall category did not change. Jev’s paragraph-level citation-coverage verdicts were therefore more repeatable than either Luna configuration.

We're not concluding that this makes Jev the more accurate judge (the systems applied different support criteria and scoring denominators, and we didn't have time to do independent human labels). But even with xhigh reasoning (which roughly tripled Luna’s model time), it remained less consistent than Jev. The result supports Jev as a fast, inexpensive, and comparatively repeatable way to implement a narrow citation policy.

# Experiment Takeaways and Practical Guide

In some cases, Jev shines as a low-friction alternative to both traditional LLMs and fine-tuned classifiers.  When the baseline is strong (reranking), or it’s easy to fine-tune a smaller model (query classification), the upside is weaker. There are signs of stronger quality for some tasks (model routing) as well as indications of better consistency and stability (citation judge). In some of our most important workloads, it delivers the expected cost and latency wins against traditional LLMs.

The above results give good directional leads, and at Glean, we’re very excited about Jev. After a few more steps (mainly, operational readiness like data residency and guarantees) we plan to ship Jev into some of these use cases. Also, Jev will play a big role in our internal hackathon this week and we’re excited to share more results!

Some general advice to conclude – if the output can be listed in advance, benchmark Jev. If the task and labels are stable and volume is high, benchmark a fine-tuned classifier too. If the call needs to generate a query, explanation, or other dynamic text, keep a generative model in the loop. Tool calling is a good example: Jev can help choose a tool, but most Glean tools still need dynamically generated arguments (like search queries).

Jev does not change the fact that classifiers already existed. It makes a good zero-shot classifier much easier to use. That’s a solid product, even if it’s not a new foundation for every AI system.
