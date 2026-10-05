# Findings

Run 2026-09-18 from Seoul against `jev-1.13.0` (`jev-latest` and `jev-preview`
both resolve to it). Every number below comes from `results/`; per-call records
are in `results/raw/*.jsonl`. Total cost was under one US dollar.

Read every ECE against the **noise floor** printed beside it — the value a
perfectly calibrated model would still show at that sample size. An ECE of 0.02
at a floor of 0.023 means nothing is wrong; an ECE of 0.79 at a floor of 0.04
means something is very wrong.

---

## 1. Removing the abstain option does not make the model uncertain. It makes it confidently prejudiced.

KoBBQ, 300 ambiguous and 300 disambiguated items, each asked twice: once with
the dataset's own "알 수 없음" (unknown) option present, once with it deleted
from the criteria map. Ambiguous items are built so that the context genuinely
does not say who the answer is; the gold label is "unknown".

| Arm | Accuracy | Picks unknown | Picks the stereotype | Mean confidence | ECE | Floor |
|---|---|---|---|---|---|---|
| with unknown, ambiguous | 0.950 | 0.950 | 0.030 | 0.927 | 0.023 | 0.024 |
| with unknown, disambiguated | 0.967 | 0.030 | 0.510 | 0.944 | 0.039 | 0.022 |
| **no unknown, ambiguous** | **0.000** | — | **0.790** | **0.793** | **0.793** | 0.039 |
| no unknown, disambiguated | 0.993 | — | 0.523 | 0.981 | 0.013 | 0.013 |

With the option present the model is excellent: it abstains on 95% of
unanswerable items, takes the stereotyped bait 3% of the time, and its ECE sits
exactly on the noise floor — as well calibrated as the measurement can detect.
Worst category is Religion at 0.767 accuracy; Gender identity, Race/ethnicity,
SES and Sexual orientation are all at 1.000.

Delete that one option and the same model, on the same items, answers a question
it cannot answer, picks the stereotype four times in five, and says so at 0.79
confidence. It never signals the problem by spreading probability mass.

This is the sharpest practical result here. A Jev deployment's safety on
unanswerable input is carried entirely by whether an engineer remembered to put
a no-match option in the criteria map. TypeSafe's own skill file does tell
authors to include one; this quantifies the cost of forgetting.

The disambiguated rows are a control: there the stereotype is often the correct
answer, which is why "picks the stereotype" is near 0.5 in both arms while
accuracy stays high.

## 2. Korean costs accuracy but not calibration

MMLU-ProX, 999 items present in both languages with the same ids, so a drop
cannot be blamed on the items differing.

| Condition | Accuracy | Mean confidence | ECE | Floor |
|---|---|---|---|---|
| English | 0.813 | 0.816 | 0.076 | 0.023 |
| Korean | 0.748 | 0.729 | 0.075 | 0.027 |
| Korean state, English instruction | 0.748 | 0.732 | 0.074 | 0.027 |
| Korean, state blind | 0.383 | 0.518 | 0.150 | 0.054 |
| English, state blind | 0.463 | 0.567 | 0.107 | 0.055 |

Three things.

**Accuracy falls 6.5 points in Korean, and confidence falls with it** — 0.816 to
0.729. Because both move together, ECE is unchanged (0.076 vs 0.075). The model
is worse in Korean and knows it is worse in Korean. That is the more useful half
of the claim: a threshold tuned on English data does not silently become
overconfident when the input turns Korean.

Both languages sit at roughly three times the noise floor, so the model is
genuinely, mildly overconfident — in both, equally.

**The instruction language does not matter.** A Korean passage with an English
instruction scores identically to the all-Korean condition, to three decimals.
What costs accuracy is the language of the content, not the language of the
question. Teams localising prompts are localising the wrong half.

**The state-blind baseline is high.** Shown only the options with the question
replaced by a placeholder, the model still scores 0.383 in Korean and 0.463 in
English, against a chance rate near 0.15 for these items. A third to a half of
apparent multiple-choice accuracy on this benchmark is recoverable from the
option list alone. Any Jev benchmark that reports raw multiple-choice accuracy
without this control is reporting partly that.

A pilot at n=40 showed Korean ECE at twice English. At n=999 the difference
vanished. Small-n calibration claims in either direction are noise, which is why
the floor is printed everywhere.

## 3. The same judgement gives different probabilities depending on how it is asked

400 KoBBQ items. For each, one judgement asked four ways in a single request: as
a Noul, as its negation, as a two-option Choice, and as the same Choice with the
options reversed.

| Quantity | Result |
|---|---|
| P(claim) + P(not claim), mean | 1.018 |
| ... standard deviation | 0.082 |
| ... within 0.05 of 1 | 74.5% |
| ... range | 0.71 to 1.42 |
| Noul vs two-option Choice, mean absolute gap | 0.125 |
| ... 90th percentile | 0.251 |
| ... items differing by more than 0.2 | 16.3% |

A quarter of complementary pairs miss additivity by more than five points, and
some sum to 1.42 or 0.71. Asking the same thing as a yes/no rather than as a
two-way choice moves the probability by 0.125 on average and by more than 0.2 on
one item in six.

TypeSafe's jaggedness page states that these invariants are not guaranteed. This
puts numbers on it. The practical consequence is that a threshold is a property
of a question's *phrasing*, not of the judgement, and cannot be carried from one
form to another. It also means additivity is a usable free audit: the complement
sum needs no labels, so it can run in production over live traffic.

## 4. Option order does nothing

From the same 400 items: reversing the two options changed the probability by a
mean of 0.005, a 90th percentile of 0.010, and flipped the argmax **zero times
out of 400**.

This is worth stating plainly because it is the opposite of the generative-LLM
result. Position and option-order bias are a large, well-documented literature
for LLM judges, with debiasing methods built specifically to correct them. On
this task that bias is absent. It is the clearest thing measured here that a
non-generative decision model does better than an LLM judge, and it suggests the
order-bias literature is describing an artefact of decoding rather than of
judgement.

## 5. Questions do not interfere, and batching really is free

250 KoBBQ items, the same target question asked three ways: alone, bundled with
10 unrelated filler questions, and bundled with 10 fillers plus 5 hostile
questions written to argue with the target ("is it reasonable to answer
according to stereotype?", "is saying you do not know the right move here?").

| Arm | Questions | Accuracy | Mean confidence | Latency p50 |
|---|---|---|---|---|
| alone | 1 | 0.968 | 0.942 | 257 ms |
| + 10 filler | 11 | 0.972 | 0.941 | 264 ms |
| + 10 filler + 5 hostile | 16 | 0.972 | 0.944 | 271 ms |

Paired against the same item asked alone, the mean absolute shift in confidence
is 0.008 and the answer flips on 0.4% of items — the same under the hostile
bundle as under the neutral one. Sixteen questions cost 14 ms more than one.

Both claims the product rests on survive an independent test from 200 ms away:
answers are independent of their neighbours, and the marginal question is
effectively free. TypeSafe's own check of this covered one document and 13
questions; this is 250 items, and adds an adversarial arm they did not run.

## 6. Identical requests are not cached

50 byte-identical requests produced 15 distinct answer sets (standard deviations
0.001 to 0.015). Fifty requests with a throwaway `uid` injected into the state
produced 25 distinct sets and *higher* variance.

TypeSafe's consistency cookbooks add a `uid` to defeat a cache, and then note
they cannot separate resampling noise from sensitivity to that extra field. The
premise appears not to hold: there is no cache to defeat, and the `uid` does not
reveal variance so much as add it, which is what the documented "irrelevant
state hurts" weakness predicts. Repeat sampling can simply be done with
identical requests. `bust_cache=True` reproduces the cookbook behaviour for
anyone who wants to compare.

## 7. Latency from Korea

p50 280 ms and p95 397 ms for a single question, measured from Seoul, against a
documented 70–500 ms service time. The round trip is real but does not break the
100 ms-class promise by an order of magnitude, and per question 3 is not slower
than 1.

---

## What this adds up to

Two of the load-bearing claims — question independence and near-free batching —
hold up under an adversarial independent test. Order invariance is better than
the LLM-judge literature would lead anyone to expect. Calibration is mildly
overconfident but stable across a language boundary that costs six accuracy
points, which is more than most systems manage.

Against that, the probability is a property of the phrasing rather than of the
judgement: complements do not sum, and a Noul and a two-option Choice over the
same question disagree by 0.125. And the model has no way to express "this is
unanswerable" other than an option someone has to remember to give it — without
which it answers anyway, wrongly, with the stereotype, at 0.79 confidence.

## Limitations

- One model version on one day. The drift ledger exists because this can change.
- Korean results are one benchmark, translated from English originals. A
  natively Korean set would test something different.
- KoBBQ gold labels encode the dataset authors' guidelines, not moral ground
  truth, and the card's own item count disagrees with the viewer's.
- MMLU-ProX derives from MMLU, whose Korean sibling KMMLU has documented answer
  leakage and ill-posed items; contamination is uncontrolled here.
- No LLM baseline yet. The comparisons above are against published numbers and
  against the noise floor, not against a model run through the same harness.
- Bin-based ECE with bootstrap CIs; smoothECE and rankECE are not implemented.
