# Evidence index

Measured 2026-10-01 by heron. This file separates three layers and does not promote one into another.

**Published.** A sentence TypeSafe, or Diogo Almeida on the record, actually wrote. The local primer snapshot and the live primer markdown were byte-identical on this date (6,693 bytes).

**Observed.** A number in a saved request log, table, or preregistered report, with a model string and a date. The number is about the calls that were made. It is not a property of every future Jev.

**Inferred.** A mechanism that would explain the observations. Archer Hume’s opening diagram is his reconstruction. Sparse experts are in that layer. They are not a fact.

A claim with no method and no file is listed at the end. It is not evidence.

Server time in Archer’s files is the response header `x-envoy-upstream-service-time`. It is not a GPU kernel time. Client wall time includes the network. Those two clocks are not interchangeable.

---

## RLCD, quote against quote

The primer does not state a loss, a reward, a base model, a parameter count, or synthetic data. Third parties often compress it into one of those.

### TypeSafe primer, the local snapshot

File: `corpus/01-primary-typesafe/introduction/machine-learning-primer.md`. Live copy saved as `captures/docs-primer-live.md`. Same bytes.

> Pretrained language models have been adapted in two major ways. TypeSafe adds a third. RLHF and RLVR are shown here for context; TypeSafe's training path is RLCD.

> **Reinforcement learning for calibrated decisions** trains TypeSafe to return decisions and calibrated probabilities instead of generated text.

> RLCD optimizes for a different output contract:
>
> * The model does not generate text.
> * It returns decisions and probabilities.
> * Higher probability should correspond to a greater chance that the answer is correct.

> Outcomes assigned a probability of `0.2` should occur about 20% of the time.
> Outcomes assigned a probability of `0.8` should occur about 80% of the time.
> Outcomes assigned a probability of `1.0` should occur 100% of the time.
>
> These rates describe groups of predictions, not a guarantee about any single answer.

The expansion is **for** calibrated decisions, not “from” them. The contract is an output rule and a group-frequency rule. It is not a recipe.

### TypeSafe launch post, 15 September 2026

Saved HTML: `captures/typesafe-launch.html`. The page is Framer, but the article text is in the HTML. No browser and no Firecrawl.

Diogo Almeida, founder:

> We built a new stack entirely focused on automation: with a new model architecture, parallel sampler for maximum efficiency, and training method we call Reinforcement Learning for Calibrated Decisions (RLCD).

> Jev achieves similar levels of intelligence on System One tasks compared to existing LLMs, while being two orders of magnitude faster and more efficient. While Jev gives up string generation, it’s optimized for structured outputs and can’t hallucinate.

The comparison table on that page:

> Calibrated decisions: answers with epistemically honest probabilities on System One tasks.

> Jev outputs all probabilities in parallel instead of autoregressively generating by token.

> Parallel. Generates all outputs in a single query. Incredibly efficient and hardware-aware.

“Can’t hallucinate” sits next to “gives up string generation.” Read with the later PrimeLine page, a type-valid answer can still be the wrong decision. The launch sentence is about the output contract, not an empirical error rate of zero.

The launch post names three things at once: a new architecture, a parallel sampler, and RLCD. It does not say which of those is the training method and which is the network. It does not say synthetic data.

### TypeSafe docs, fetched 2026-10-01

`captures/docs-system-one.md`:

> System One models are trained for calibrated decisions: their probabilities are optimized against outcomes to reflect uncertainty. Calibration is measured across groups of predictions; it does not guarantee that an individual answer is correct.

`captures/docs-models.md`, model `jev-1.13.0`:

> Jev is not fine-tuned or LoRA-adapted with customer data. It is trained with RLCD to return calibrated decisions, and the same weights serve every account.

> Jev is not trained on customer requests or responses.

> Context length: 64k tokens per request; 32k tokens for `state` plus the longest question.

That context sentence was not what Archer’s 17 September notes record. See the context-limit section. The docs also say `jev-latest` and `jev-preview` both pointed at `jev-1.13.0` on the day this file was fetched, and that versioned ids are accepted even when `GET /v1/models` lists only aliases.

### Almeida, Hacker News, 15 September 2026

`captures/hn-49717558.html`. User `CompleteSkeptic`.

> architecture is close to the chest for now, but we have talked about writing a paper
>
> I don't want to shill my blog too much, but I will say data is probably far most interesting than architecture

Same user, same thread:

> strings (and all sequential data structures) are not allowed at all - this is how we make sure all outputs can be computed in parallel (thus no output token cost)

That is a constraint on outputs. It is the strongest primary sentence that the model does not decode a string. It is not a description of the backbone.

### TechCrunch, 18 September 2026

`captures/techcrunch-2026-09-18.html`. Tim Fernholz. This is the sentence third parties treat as the training method:

> Almeida says Jev is trained exclusively on synthetic data using a technique he calls “reinforcement learning from calibrated decisions.”

Two differences from the primer, in the journalist’s wording: **from** instead of **for**, and “exclusively on synthetic data,” which the primer does not say. The same article says the model is “a new transformer-based model” and then:

> Almeida is tight-lipped about the model’s architecture, which outside observers suspect is built on top of an open-weight LLM.

“Transformer-based” is the reporter’s noun. “Tight-lipped” is the reporter’s description of Almeida. The open-weight suspicion is attributed to outside observers, not to a measurement.

### What third parties then assert

`captures/systemonemodels-jev-architecture.html`, updated 22 September 2026, opens with a compression:

> TypeSafe has said only that the model generates all outputs in a single query rather than one token at a time, returns typed answers with calibrated probabilities, and was trained with RLCD on synthetic data. Parameter count, base architecture, weights and training method are undisclosed as of 20 September 2026.

The same page then separates the pieces. The synthetic-data clause is credited to the TechCrunch sentence above, called “the first on-the-record statement about what Jev learned from.” The page also says everything past five public statements “is inference from behaviour or guesswork.” Its “something small” reading of the $0.042 price and the 70–500 ms claim is that guide’s inference. Price is not a parameter count.

OrcaRouter, 22 September 2026, `captures/orcarouter-2026-09-22.md`, treats “full RLCD” as something they could try in a night on a small model, and says it failed to generalize. No protocol is linked. That use of the word is not TypeSafe’s recipe. It is evidence only that people outside the company use RLCD as a name for their own training attempts.

Archer’s essay, observed against the primer rather than instead of it: “The exact recipe is unpublished. My proposed training recipe adapts the transformer and readout to typed decision tasks using an outcome-based objective.” The proposed recipe is his inference. The primer’s group-frequency contract is the published part.

**Falsifier for the published contract.** A disclosed loss that does not score probabilities against outcomes, or a disclosed decoder that emits the decision as text. A benchmark where stated probabilities do not match frequencies falsifies the calibration claim on that distribution. It does not by itself falsify the name of the training method.

---

## Archer Hume, the essay

**Who.** Archer Hume. **When.** Essay date 17 September 2026. Investigation of `jev-1.13.0`, one early-access account, one service region. **File.** `captures/jevs-architecture-unmasked.md`, a text extract of the HTML already saved by the parent. Charts are omitted.

**The architecture diagram is the author’s reconstruction.**

He keeps three labels in the prose. Published: parallel probabilities, typed outputs, RLCD as a name. Observed: token accounting, latency, isolation behaviour, option-order movement, calibration bins. Inferred, and marked as such: causal decoder, KV sharing, final-position or pointer readout, and sparse experts.

Section 6 says sparse experts “can’t be observed from outside.” The speed argument is that about 30k tokens in roughly 160 ms would be tight for a dense 70B model on 8×H100 and comfortable for a MoE with about 10B active parameters. The rerun file’s median at 29,835 input tokens is 218 ms, not 160. See latency-rerun. The 160 ms sentence is a gloss. Specialised hardware, or a benchmark that overstates stored knowledge, would remove the argument. He says confirming experts needs a disclosure or evidence beyond this API.

His own “what would change my mind”: direct probability outputs are published; question isolation and option order are observed behaviours; KV sharing, causal attention, the readout design, and sparse experts are progressively more specific explanations.

Public GitHub user `ArcherHume` had 22 repositories on 2026-10-01. None is this study. The JSON on the site is the release of the measurements. The scripts named inside the JSON (`probe.py`, `bench_results.jsonl`, and the rest) are not on the site.

---

## `evidence.json`

**Who / when / model.** Archer Hume. Metadata date 2026-09-17. `jev-1.13.0`. Schema `jev-public-evidence.v1`. **File.** `data/archerhume/evidence.json`, 70,157 bytes, SHA-256 `2a1b1d4a15835b8ddd94c0098f484a5e658d6cba57050ac1eebc5dfd46de6bdc`. Last-Modified `Wed, 30 Sep 2026 20:58:32 GMT`.

This is the aggregate bundle, not the raw 1,029 probe rows or the 6,800 benchmark rows. Those counts are stated. The row logs are not in the file. Hashes of local scripts are. They were not checked against a public repo, because no public repo was found.

**Claims the file actually supports.**

- Benchmark aggregates, one item per request. MMLU n=1,200, accuracy 0.9175, mean top probability 0.9366. MMLU-Pro n=800, accuracy 0.84625, mean top probability 0.8226. The file’s own caveat: matching those two averages is not calibration inside bins. ECE is not computed in this file.
- Fresh math, small n. Three-digit multiplication 30 items, accuracy 0.867, mean top probability 0.830. Two-step word problems 25 items, accuracy 0.32, mean top probability 0.304. The file says new items reduce exact reuse and do not prove the training set had nothing like them.
- Ticket option order, three requests each. P(technical) in the original order 0.87, 0.89, 0.84. Reversed 0.94, 0.96, 0.93. Rotated 0.94, 0.95, 0.95. n=3 is a demonstration, not a rate.
- Sibling-question secret. Five requests. Code only in another question: P(code) 0.0 every time. Code in the state: P(code) 0.90 to 0.92. The file’s caveat: the question still asks about “another question” when the code is in the state, and a learned instruction boundary can look like a hard attention mask.
- Adding “Bad weather caused it.” Three requests, forty duplicate questions each, so the forty are not independent. Mean log-odds of customer versus unknown: base 0.485, appended 0.084, prepended 0.456. The file says this conflicts with independent fixed scores plus a softmax, and does not uniquely imply a final-position readout.
- Output tokens move with a question id the docs say is not sent to the model. Short id: input 268, output 21. Long id: input 268, output 32. A 255-option response was billed at 2,714 output tokens and returned with server times 86, 152, and 70 ms.
- Tokenizer screen inside this file: 125 repository candidates, 0 exact matches on the short probes and 0 on the long probes. The file says that is not 125 distinct algorithms, and a mismatch does not prove an in-house tokenizer. Four further tiktoken checks are mentioned and **not stored**. The essay’s “192 tokenizers,” “o200k,” and “Qwen agrees on 348 of 415” are not in this JSON.

**Falsifier.** The raw `calls.jsonl` / `bench_results.jsonl`, if released, disagree with these aggregates. Or a repeat on a later model id fails to show the id-length output-token effect and the sibling-secret effect.

---

## `calibration.json`

**Who / when / model.** Same campaign. The file does not repeat the model string. The essay and `evidence.json` put the MMLU sample on `jev-1.13.0`, 17 September 2026. **File.** `data/archerhume/calibration.json`, 152,269 bytes, SHA-256 `c75a5487779e025ac32b32c66c918b3e3f1f2b4b49a19be1b6ad64f01d21c33e`. Last-Modified `Wed, 30 Sep 2026 23:23:23 GMT`.

1,200 item-level rows from `bench_results.jsonl` (that jsonl 404’d on the site; the hash of the source is in the calibration file). Ten equal-width bins. Empty bins omitted. ECE = 0.031325.

Accuracy 0.9175. Mean probability 0.9366. 990 of 1,200 predictions are in [0.9, 1.0], and 605 are exactly 1. In that top bin, accuracy is 0.963 and mean probability is 0.987. The bin [0.5, 0.6) has n=28, accuracy 0.393, mean probability 0.528. Wilson intervals on the small bins are wide. The ECE is real for this sample and this binning, and it is carried by a mass of near-certain items.

**Falsifier.** Another binning, or the held-out items behind `source_sha256`, moves ECE by more than the top-bin gap. A different task with the same model — Sacco’s difficulty sweep, below — already does that. So this file does not establish calibration as a property of Jev.

---

## `latency-rerun.json`

**Who / when / model.** Archer. Date field `2026-09-17`. `jev-1.13.0`. Seed 20260917. Concurrency 1. Eight shuffled repeats. **File.** `data/archerhume/latency-rerun.json`, 48,958 bytes, SHA-256 `48884eb32cb2766de7ec57afe24d6e33fcd37642ad1f5a11b2c8cbcb7ade506f`. Last-Modified `Wed, 30 Sep 2026 23:23:17 GMT`. 192 trials, all HTTP 200.

Median server time, context sweep, one question:

| state chars | median input tokens | median server ms |
| --- | ---: | ---: |
| 400 | 360 | 57.5 |
| 8,000 | 1,869 | 84 |
| 24,000 | 4,941 | 81 |
| 48,000 | 9,796 | 89 |
| 72,000 | 15,071 | 153 |
| 96,000 | 20,423 | 185 |
| 120,000 | 26,103 | 200 |
| 138,000 | 29,835 | 218 |

The essay chart’s “57.5 ms to 218 ms at 29,835 tokens” matches this file, not the earlier `stateLength` rows in `evidence.json` (those give median 237 ms at 29,835 input tokens, with a 692 ms outlier in the 26,103-token row).

Question sweep, short state of 1,200 characters. Median server time is 86.5 ms at 1 question (538 input tokens, 21 output tokens) and 610 ms at 1,500 questions (26,524 input tokens, 28,894 output tokens). It is not flat. It also does not scale like a decode of those output tokens: 1,000 questions are billed at a median 18,894 output tokens and return in a median 453.5 ms server time.

**Falsifier.** A repeat that holds server load fixed and finds server time scaling in proportion to `output_tokens` at fixed input length. The file does not control load. A minimum in the file is the smallest observation, not an uncontended GPU time. No parameter count follows from the curve.

---

## `option-count-latency.json`

**Who / when / model.** The main meta does not name the model. Payloads in the file are reconstructed by a note, not stored. Server header is the same envoy header. **File.** `data/archerhume/option-count-latency.json`, 1,575,375 bytes, SHA-256 `6e40060518c1802b7787d359f70960746be19b7dae78baf7bafdbcb6d1b30175`. Last-Modified `Wed, 30 Sep 2026 23:23:19 GMT`. Workers: 4. Reps: 8.

One question, short labels: median server time 76 ms at 2 options (35 output tokens) and 75.5 ms at 200 options (1,911 output tokens). That is the essay’s “200 options returned as quickly as two.” Long labels at one question: 86 ms at 2 options, 93 ms at 200.

The cell with 20 questions and 200 long labels is not a speed result. All 8 requests returned HTTP 400 `max_tokens_exceeded`. The median server time of 44.5 ms on that cell is the error path.

A 20-request follow-up contrasts a large state (input tokens 19,319, output tokens 35, server times from 150 to 377 ms) with many short questions (input tokens 20,090, output tokens 654, server times from 140 to 388 ms). Same order of server time. Not a decode of the output-token field.

**Falsifier.** A successful 200-option request whose server time scales with the billed output tokens while input tokens stay in the 2-option range.

---

## `output-token-accounting.json`

**Who / when.** The description says 17 September 2026. Model string in the stored responses is `jev-1.13.0`. **File.** `data/archerhume/output-token-accounting.json`, 321,176 bytes, SHA-256 `ffc46242d3e1f021833161a50949baa6bea5424f7523e7cf12800760dba43890`. Last-Modified `Wed, 30 Sep 2026 21:51:59 GMT`.

122 id trials + 46 batch trials + 40 state trials + 47 word-id trials + 56 matched state/id trials = 311, which is the essay’s count. The file’s note: “Token counts are API accounting, not a neural execution trace.”

Input tokens stay 268 when only the question id changes. Output tokens do not. A fixed question with id `n1` is billed 21 output tokens; id `very` is billed 20. State difficulty changes the probability (a missing integer stays near 0.47; “6 multiplied by 7” goes to 0.98) and does not change the output-token count, which stays 21 on those one-question arms.

**Falsifier.** An id that the server says is not part of inference, placed only in the question id, leaves `output_tokens` unchanged. Or a response body that is long in generated text rather than in the serialised probability object.

---

## `tokenizer-fingerprint.json` and the 125-candidate screen

**Who / when / model.** Schema `jev-tokenizer-fingerprint.v1`. `jev-1.13.0`. **File.** `data/archerhume/tokenizer-fingerprint.json`, 279,399 bytes, SHA-256 `fd0a4b6ab89548c855fe757d25493750ea8d715b492ad3cbfaa1b4f9fe72268d`. Last-Modified `Wed, 30 Sep 2026 23:23:15 GMT`.

421 trials, all HTTP 200. Families: run 188, word 171, pretok 56, control 6. The essay says 445 requests. The file contains 421. I did not find the other 24.

Empty state is 267 input tokens. The file defines `tokens(S) = input_tokens - input_tokens(state="")`.

Observed on that definition: eight `0` characters add 8 tokens. Sixty-four `0` characters add 64. Eight `a` characters add 1. Sixteen `a` characters add 4. Thirty-two spaces add 1. That is the digit-splitting and the run-length behaviour the essay describes, and it is in the file.

The comparison against 192 public tokenizers, the o200k subsumption claim, and “Qwen agrees on 348 of 415” are in the essay and **not** in this JSON or in `evidence.json`. `evidence.json` records a different screen: 125 candidates, 0 exact matches, extra tiktoken results omitted.

YFarmX, 18 September 2026, `captures/yfarmx-jev.html`, ran a different 50-probe catalogue fingerprint on the decisions route. Signature `tk_5e398719`. Nearest catalogue neighbour Hunyuan A13B Instruct at 24 of 50, which they read as the agreement of unrelated tokenizers. That does not confirm or refute Archer’s Qwen/o200k sentence, because the probe sets are not the same and Archer’s comparison table is not in the download.

**Falsifier.** A public tokenizer that matches `tokens(S)` on the 421 stored strings, including the digit runs and the `a`-runs. Publishing that match would retire the “no exact public match” claim. It would still not name the base model. Archer says a replaced vocabulary can hide one.

---

## `context-limit.json`

**Who / when / model.** Schema `jev-context-limit.v1`. `jev-1.13.0`. Sequential, concurrency 1. **File.** `data/archerhume/context-limit.json`, 16,999 bytes, SHA-256 `530a332afcdcc46beab1cb8509f18522145ca6872ce86c886ca175101f6e4983`. Last-Modified `Wed, 30 Sep 2026 23:23:25 GMT`. 35 trials.

The meta quotes `docs.typesafe.ai/llms-full.txt` as of 2026-09-17: no stated context limit, and no `max_tokens_exceeded` in the documented error table. The API nonetheless returned `400` `max_tokens_exceeded`.

Single-question boundary in the file: input tokens 33,002 accepted (16,368 digit-words of state); 16,379 digit-words rejected. Whole-request boundary: 65,572 input tokens and 5,310 questions accepted; 5,339 questions rejected; 8,000 questions rejected. A branch that pushed one question’s instruction to about 0.4 of the limit, on top of a long state, was rejected while a just-under branch at 33,004 input tokens was accepted.

On 2026-10-01 the models page states 64k per request and 32k for state plus the longest question. That published limit matches the boundary he hit. It does not match his note that the 17 September docs stated none. Either the limit was undocumented that day, or the docs changed after the run. The measurement is the 400s. The docs sentence is later.

**Falsifier.** A request with state-plus-longest-question over 32k tokens, or a request over 64k, accepted by `jev-1.13.0` and returned as a normal answer. Or a transcript of the 17 September docs page that already stated the 32k/64k limits.

---

## `option-injection.json`

**Who / when / model.** `jev-1.13.0`. **File.** `data/archerhume/option-injection.json`, 127,175 bytes, SHA-256 `bc4e494509b5db3222264527d181d19992bdacc678f20c04c8edad79751a91b4`. Last-Modified `Thu, 01 Oct 2026 15:57:10 GMT`. Reference state: “Reference status: indigo.”

On a saturated baseline the correct option has mean probability 1.0. Putting the word `indigo` inside a different option, as a fake, moves mean probability onto that host option: about 0.17 for a `key: value` delimiter, about 0.03 for a numbered list, about 0.01 for JSON, and the correct option remains the mode. The fake word `green`, which is not the reference, leaves the correct option at 1.0. The essay calls this 105 requests. The file is organised as phases `pilot`, `main`, `ambig_pilot`, `ambig_pilot2`, `ambig_a5`.

This weighs against a readout that only looks up a reserved label token and never reads option text. It does not identify the head.

**Falsifier.** A fake of the reference string, in the option body, that never moves probability, across the delimiter formats stored here, on this model id.

---

## `option-position.json`

**Who / when / model.** `jev-1.13.0`. **File.** `data/archerhume/option-position.json`, 156,163 bytes, SHA-256 `c10df121afc053e1020c3551cf0b2cdd3b28d6e7dcc63b8d18c06bb6e431dfc0`. Last-Modified `Wed, 30 Sep 2026 23:23:27 GMT`.

256 and above is rejected: “Too many choices. Must have at most 255 choices.” 255 is accepted.

Lexical “find the string” items stay at probability 1.0 at positions 1, 5, 10, 25, 50, 100, 150, 190, and 200, for list lengths 10, 50, and 200, three trials each in the main phase. Reasoning items do not. At 200 options the median probability on the correct option is about 0.01 to 0.035 across positions, with maxima of 0.18. At 50 options the median is 0.32 at position 1 and 0.83 at position 50. Position is not irrelevant on the hard template, and the hard template is also near the floor everywhere, so this file does not separate “the slot cannot see the end of the list” from “the item is too hard.”

The essay says a middling task at 200 options would separate a slot head from a pointer scorer. This file is not that task.

**Falsifier.** A middling item, fixed text, moved from position 1 to position 200, whose probability does not change. Or the reverse: a lexical item whose probability collapses only when it is last.

---

## `followup-trials.json` and `followup-summary.json`

**Who / when / model.** `followup-trials.json` date `2026-09-17T04:04:46Z`, seed 2026091702, script `scripts/jev/followup-probes.py`. 146 planned, 146 stored. Responses say `jev-1.13.0`. 96 relational-order trials, 50 odds-intervention trials. **Files.** `followup-trials.json` 222,083 bytes, SHA-256 `e60dadf8411d5d7a5e245256138ef281140f000f66a4dd7c7dfe4957c7b38045`, Last-Modified `Wed, 30 Sep 2026 23:23:03 GMT`. `followup-summary.json` 15,296 bytes, SHA-256 `35a137ca429c8ec13c056e068046186d501d4a687cb493ecdfc04d3d36da11ea`, Last-Modified `Wed, 30 Sep 2026 19:36:25 GMT`.

When the reference card is in the **state**, every order has accuracy 1.0 and mean P(correct) 1.0, n=8. When the reference card is in an **option**, order matters. Order beta, gamma, alpha: accuracy 1.0, mean P 0.8875. Order gamma, beta, alpha: accuracy 1.0, mean P 0.8725. Order beta, alpha, gamma: accuracy 0.5, mean P 0.4925. The file’s note: an order effect would not uniquely identify a causal mask, and a null would not prove bidirectionality.

Odds, ten randomised blocks. Mean log-odds of customer versus unknown: base4 0.432, append5 0.097. Paired change append5 minus base4: −0.335, standard error across blocks 0.077. The essay chart’s “+0.38 to +0.11” is that contrast, rounded. Replacing the added option instead of appending moves the log-odds back up by about 0.113 (SE 0.056). The fixed-size wording change is smaller than the append. The essay calls the fixed-size intervention inconclusive. The file agrees that the append is the clear paired effect.

**Falsifier.** A new template, new blocks, where appending an irrelevant option does not move the log-odds of the original pair, or where every option order of the reference card is identical within the repeat noise.

---

## Other measurements, September–October 2026

I opened these. I did not re-run them. Each falsifier is what would make that author’s claim fail, not what would make Jev fail.

### Will Kelly, `jev-1.13.0`, run 2026-09-19

`captures/willkelly-report.md` and `captures/willkelly-readme.md`. Preregistered. 123,805 requests, 123,800 succeeded, 5 failed, $12.69, 137.9 minutes, endpoint `https://api.typesafe.ai/v1/systemone`. Latency p50 165 ms, p95 341 ms. Alias requested: `jev-latest`. Response model recorded as `jev-1.13.0`.

Support-ticket routing ECE 0.075. Random 3-SAT: the model’s mean P(satisfiable) at n=20 spans 0.026 across clause ratios whose true rate spans 0 to 1, and the plan’s tier is “doesn’t work” because ECE is above 0.30. Option-order flip rate on his choice task was 0 after subtracting the model’s own repeat noise, and that prediction was scored wrong because he had predicted a 1–3% effect. Probabilities he recorded sat on a 0.01 grid.

This reproduces Archer on two points: many questions are cheap relative to decoding, and probabilities are coarse. It contradicts any reading of Archer’s MMLU ECE as “Jev is calibrated.” Calibration here is a property of the task.

**Falsifier.** The saved run, re-scored with the preregistered code, does not show a flat SAT probability. Or a later model answers 3-SAT with a probability that tracks the clause ratio.

### jujumilk3, calibration audit, 2026-09-18, from Seoul

`captures/jujumilk3-findings.md`. `jev-1.13.0`. `jev-latest` and `jev-preview` both resolved to it that day.

KoBBQ, delete the “unknown” option: accuracy on ambiguous items falls from 0.950 to 0.000, stereotype picks rise from 0.030 to 0.790, mean confidence 0.793, ECE 0.793 against a noise floor of 0.039. With the option present, ECE sits on the floor.

MMLU-ProX, 999 paired items: English accuracy 0.813, ECE 0.076; Korean accuracy 0.748, ECE 0.075. State-blind (options only) still scores 0.463 in English.

Same 400 items, four phrasings. Noul and two-option Choice differ by 0.125 on average. P(claim)+P(not claim) ranges from 0.71 to 1.42. Reversing two options: mean probability shift 0.005, **zero argmax flips in 400**. Batching 1 vs 16 questions, including hostile neighbours: accuracy stays 0.968–0.972, latency p50 257 ms vs 271 ms.

The zero-flip result is on this binary task. It does not erase Archer’s three-request ticket reversal or the reference-card permutation. Order sensitivity is task-dependent. Treating either study as the universal order effect is the mistake.

**Falsifier.** The raw jsonl, re-scored, shows argmax flips on those 400 reversals. Or removing “unknown” does not collapse ambiguous items.

### Samuel Sacco, difficulty tiers, run `20260918T013027Z`

`captures/sacco-tiers-findings.md`. `jev-1.13.0`. 800 items, 4 tiers, 3 passes, 60 calls. Labels frozen first.

ECE 0.115, 0.122, 0.138, 0.147 across trivial to adversarial, each about 2.1–2.5 times the noise floor he computes. Accuracy falls from 97.5% to 90.0%. Bootstrap intervals on the ECE differences between tiers include zero. His decomposition says the curve does not get worse; probability mass moves into the bad middle of one curve. The curve overstates low probabilities and understates high ones.

He also notes that an n=60 ECE near 0.05 cannot be distinguished from the noise floor of that sample size. That warning applies to several small benchmark READMEs in circulation.

**Falsifier.** Re-scoring his committed responses with his `analyse.py` does not produce those ECE ratios. Or a tier design where the calibration curve itself changes and the mass-shift decomposition fails.

### yodablocks, order-by bench

`captures/yodablocks-readme.md`. `jev-1.13.0`. Question set `60658e143af92016`.

2026-09-18, 360 labeled rows, six pre-registered gates passed. Boolean ECE 0.0453 (adaptive, 10 bins), inversion rate 0.0363, 53 of 360 rows tied at 0.99. 2026-09-19, Amazon ESCI, 306 graded pairs: boolean ECE 0.242, inversion 0.255. Choice-confidence ECE 0.279. Passing a gate on topic membership and failing it on graded relevance is the result. A 40-row request breaks a gate that one row per request passes.

**Falsifier.** The pre-registered scorer, on the released rows, does not fail those ESCI gates.

### Qualiteg, Tokyo, 2026-09-28

`captures/qualiteg-readme.md`. `jev-1.13.0`, `typesafe-sdk` 0.7.2, `api.typesafe.ai`. Ground truth on the Japanese sets is the author’s.

Latency, questions per request 1 / 5 / 10 / 20 / 40. In order, five runs: median server-side client times 211 / 176 / 197 / 162 / 152 ms. After three warm-ups, question counts shuffled, six rounds: 159 / 155 / 164 / 149 / 160 ms. Adding questions did not add latency on this range. 218 logged calls, 109,338 input tokens. This is client time from Tokyo, not Archer’s envoy header.

**Falsifier.** A re-run of `05b_latency_shuffled.py` on the same model whose median rises in proportion to question count between 1 and 40.

### Waller Chen, via OpenRouter

`captures/wallerchen-readme.md`. Measured 2026-09-18 (cost, latency, shape) and 2026-09-20 (accuracy). Model id `typesafe/jev-1.13`, which the README says the gateway labels `typesafe/jev-1.13-20260917`. First-party answers as `jev-1.13.0`. `jev-1.13` without the patch is rejected. Raw round trip 458–563 ms; TCP handshake median 198.8 ms; he puts the remainder at 259–364 ms. Across eight fixtures, five runs, median 352 ms. Accuracy on his clear set 27/27, including at temperature 0.

The useful observation for architecture is the id split: gateway alias, dated gateway id, and first-party patch id are not the same string. Latency here is not comparable to Archer’s server header.

**Falsifier.** OpenRouter’s model endpoint, fetched the same day, shows a different upstream id than the README records, or the raw `data/measured.json` in that repo disagrees with the medians.

### themsquared, tool-call risk, Portland

`captures/themsquared-readme.md`. Residential connection, 2026-09-17, with a 2026-09-24 line in the table. n=60 per backend. `jev-latest` and `jev-preview`: accuracy 55/60. Latency p50 421.6 ms and 378.5 ms against Claude Sonnet 5 at 1,371 ms. ECE 0.0712 and 0.0505. The README says the ECE is mostly one bin: 50 of 60 `jev-latest` calls sit in 0.9–1.0. That is the same shape as Archer’s MMLU sample, on a different task, and the README says an n=60 ECE cannot be read finely. Sacco’s noise-floor remark agrees.

The vendor multiple he is answering is 193.6×. His measured latency ratio against Sonnet 5 on this task is about 3.3–3.6×. The tasks are not the vendor’s workflow cases. Both numbers can be true. Neither is an architecture.

**Falsifier.** His `analyze.py` on the released calls does not put 50 of 60 in the top bin, or the p50 ratio against the same Sonnet setup is an order of magnitude larger.

### Zefan Cai and others, Open-Jev latency note, 2026-09-20

`captures/open-jev-inference-latency.md`. Same client, 20 measured calls after 3 warm-ups. Remote Jev 1.13.0 over HTTPS versus a local Open-Jev-2B on one H100. Example: 1,024 state tokens and 32 candidates, local HTTP p50 1,015.9 ms, remote Jev p50 301.4 ms. The authors say this compares two deployments, Jev’s hardware is undisclosed, and the numbers do not establish a hardware-matched speedup or equal quality. They also say not to infer accuracy from latency.

That is the right warning for the sparse-expert inference. A remote p50 is not a parameter count.

**Falsifier.** The released `report.json` for the Jev API run does not contain those p50s. The local 2B numbers are about a different model and are not evidence about Jev’s width.

### Archestra, 100 production tool calls

`captures/archestra-100-calls.html`. 100 calls, four labels, 400 decisions. They report the 337 where three judge families agreed. `jev-latest` 0-shot accuracy 93%, 9-shot 95%. A constant majority baseline is 79% on that set. On their labels, reordering keys flipped no binary decision and flipped 5 to 7 of 100 three-way decisions. After subtracting repeat noise, about 4 in 100 decisions move, and they estimate that costs 1.5 to 2 accuracy points.

Same pattern as the rest of the order literature in this index: binary often quiet, three-way and reference-card order not quiet.

**Falsifier.** Their released calls, re-labeled by the same three judge families, do not show the 5–7 per 100 three-way flips.

### PrimeLine, pre-registered failure-mode test

`captures/primeline-preregistered.html`. About 9,750 calls, zero transport failures, cost they put near $0.38. Twelve probes of TypeSafe’s own failure-mode list, pass bars written first. Their revised count: four real, eight refuted, none left undetermined on that original list. A 40-pair injection test: 22.5% of injected pairs misclassified, mean absolute score move 0.193, not always in the attacker’s direction. The page’s own FAQ: confidence is “not textbook-calibrated and varies significantly by question type,” and a type-valid answer can be confidently wrong.

**Falsifier.** The pre-registered bars, applied to the saved responses, do not yield four-and-eight.

### Gautam Khosla, ChaosNLI, Zenodo record 23032384, 29 September 2026

`captures/zenodo-23032384.html`. Preregistered. `jev-1.13.0`. 750 low-entropy and 750 high-entropy items, 100 annotators each. Choice ECE rose from 0.076 to 0.339. Bias-corrected difference 0.264, interval 0.244 to 0.278. On the hard stratum, mean confidence 0.807 against mean annotator agreement 0.468. Noul from the same calls moved less (corrected difference 0.076, called inconclusive). Confidence still ranked ambiguity (AUROC 0.744). The record says a baseline bug and a search limit were corrected after collection, and that those deviations are reported.

This is not a claim that the probabilities are random. It is a claim that one distribution does not represent human disagreement. The primer already says a probability is about a group of outcomes, not about a single case, and not about a second distribution called “what people would say.”

**Falsifier.** The deposited responses, scored with the preregistered endpoint, do not separate the two entropy strata.

### arXiv 2609.37647, evaluating Jev

`captures/arxiv-2609.37647.html`. HTML fetched 2026-10-01. I read the abstract and the calibration setup, not every table.

`jev-1.13.0`, zero-shot, one frozen template per dataset, 37 datasets, 346,009 requests, under $10. Open-weight references scored by next-token probabilities on the same requests: Qwen3.8-27B and Gemma-4-E4B. Abstract: Jev reaches 95–99% accuracy on IMDB, SST-2, HellaSwag, and ARC, and 86.7% on Belebele across 122 languages. It beats Qwen on 27 of 37 datasets, none of Qwen’s nine leads outside the bootstrap intervals, and beats Gemma on all 37. All three degrade on low-resource languages, fine labels, and rubric judgments. Choice probabilities are described as well calibrated and usable for selective prediction. Binary probabilities rank well and sit badly against a fixed 0.5 threshold; a threshold tuned on training data raises micro-F1 on UNFAIR-ToS from 0.50 to 0.75.

**Falsifier.** The Zenodo dump cited in the paper (DOI in the HTML) does not reproduce the abstract’s 27-of-37 count under the paper’s bootstrap.

### arXiv 2609.29769, Jev as a rubric judge

`captures/arxiv-2609.29769.html`. Delip Rao and coauthors. I read the abstract, not the full result tables. The HTML is 1.6 MB and is kept so the tables can be read later.

Jev against three flash-tier LLM judges, nine panels, seven benchmarks, identical criterion text. Two LLM setups: whole rubric, and one criterion at a time. Cost 16 to 325 times Jev’s. Time 28 to 350 times. Accuracy differs significantly in at most 8 of 27 paired comparisons in each setup. On ordinal criteria the judges and Jev miss the human labels together. On Jev’s most confident errors, about 96% of LLM verdicts repeat the wrong answer. The architectural claim in the abstract is negative: a different output contract did not produce a different error pattern on these panels.

**Falsifier.** The paper’s released judgments, paired the same way, show complementary errors instead of shared ones.

### arXiv 2609.29429, RLCDAlignBench

`captures/arxiv-2609.29429.html`. The title uses RLCD as TypeSafe’s name for the training method. The measurements are of the API, not of the loss.

Pooled Noul ECE 0.047. Median per-benchmark ECE 0.168 against a perfect-calibration null of 0.074. 24 of 31 benchmarks exceed that null’s 95th percentile. Mean probability misses the benchmark base rate by a median of 0.125, while median AUROC is 0.905. Median latency of a call 0.31 s, 11.4 questions on average. A pass over 19 judge-scored benchmarks at $0.30 against $18.96 for the API judges.

Same split as Will Kelly and Sacco: ranking can be real while a probability is not a calibrated frequency on the slice you care about. The primer’s 0.2-means-20% rule is a group rule. These papers say the group has to be the group you deploy on.

**Falsifier.** Per-benchmark ECE on the released cache is not above the null they define, or the base-rate gap is an artifact of the generic question wording and disappears for the question the paper also tried.

### An index, not a measurement

`captures/awesome-jev-robustness-readme.md`. Yifan Lan. Snapshot 2026-10-01. 137 entries, almost all against `jev-1.13.0`, authors’ numbers, not re-run here. I used it to find Kelly, jujumilk3, Sacco, and the order studies. I did not open all 137. A number that appears only in that README is not in this index.

`captures/barglabs-readme.md` is a pointer to a preregistered judge study and a mirror commit. I did not read the result tables. It is not a row above.

`captures/ayautomate.html` is saved and not reduced. I am not carrying a latency or accuracy figure out of it.

`captures/victordibia.html` is saved. The sentences I rely on from Almeida are the Hacker News comments above, not a paraphrase of this essay.

---

## What the measurements agree on, and what they do not

Agreed, as observations of `jev-1.13.0` in September 2026, not as a design document:

- The API returns a distribution over a caller-supplied set. It does not return a sentence. Billed `output_tokens` track the serialised response and the question id, not a decode length. Server time does not track that billed length.
- A single request can hold many questions. On the ranges people actually swept (Qualiteg to 40, jujumilk3 to 16, Archer’s short-label option sweep), extra questions are cheap next to extra state. Archer’s sweep to 1,500 questions is not free: median server time reaches 610 ms, and input tokens have grown with the questions.
- There is a hard cap near 255 choices, and a token cap near 32k for the longest branch and 64k for the request. The cap was enforceable on 17 September. The docs page that states it was fetched on 1 October.
- Probabilities are coarse (hundredths in Kelly’s log) and task-dependent as frequencies. MMLU ECE 0.031 and 3-SAT ECE above 0.30 are both in files. Neither cancels the other.
- Option order sometimes moves the answer (Archer’s ticket, Archer’s reference card, Archestra’s three-way labels, yodablocks on graded relevance) and sometimes does not (jujumilk3’s 400 reversals, Kelly’s preregistered choice test). “Jev is order-invariant” and “Jev is order-sensitive” are both too large.

Not agreed, and not measured:

- Sparse experts, active parameter count, dense versus MoE, and which public base model. The tokenizer files rule out an unchanged public tokenizer on the probes that were stored. They do not name a base model. Almeida said the architecture is unpublished and that data matters more. TechCrunch’s “open-weight LLM” sentence is an outside suspicion.
- That RLCD is a published algorithm. The published text is the name, the output contract, the group-frequency sentence, “optimized against outcomes,” not trained on customer requests, and — in TechCrunch’s wording only — exclusively synthetic data and the preposition “from.”

---

## Claims repeated without a method or a file

These showed up in posts and roundups. I could not tie them to a protocol or a data file.

- “Just a JSON classifier” and “just a fine-tuned BERT.” Repeated as dismissals in the week of the launch. Archer quotes the first. No one published the fine-tune, the data, or a weight file that would make the second a measurement. Jev’s API is closed. A BERT-sized open clone is a different object. Laya at 421M parameters is a clone’s size, which `systemonemodels` correctly refuses to treat as Jev’s size.
- Sparse mixture-of-experts, stated as the architecture rather than as Archer’s inference. The only argument in a file is the latency budget in the essay, and he labels it an inference. Retellings drop the label. No file shows a router or an expert id.
- “193.6× faster,” “444.6× cheaper,” and “zero hallucinations,” repeated without the vendor’s workflow definition. The launch post’s own nearby sentences are “two orders of magnitude,” “70 ms to 500 ms” in the table YFarmX transcribed, and “can’t hallucinate” next to giving up strings. themsquared’s single-decision ratio is about 3.5× against one Claude setup. Both can be quoted. Only one is a file of calls.
- “Open source already beat Jev.” OrcaRouter calls that a benchmark illusion and gives 0.769 in-distribution and 0.541 out of distribution for one checkpoint. The post has no data file. I saved the post and did not treat the numbers as a result.
- “No tokenizer.” One trading post said the pipeline has no tokenizer. Archer’s input-token counter moves with digits one-for-one and with `a`-runs in blocks. That post has no method.
- “Jev fails basic probability,” from a puzzle reply under Archer’s launch thread, with no saved request. A puzzle screenshot is not a calibration study. The calibration studies that do have files are above, and they fail on some tasks and hold on others.
- A trading-loss anecdote (“300% in 14 hours”) and “OpenAI’s 150 ms API killed Jev.” Reactions. No method, no file, no model id.
