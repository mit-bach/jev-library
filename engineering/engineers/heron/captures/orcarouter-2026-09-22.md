# OrcaRouter, 22 September 2026

Source: X post https://x.com/OrcaRouter/status/2102318172577911068, fetched 2026-10-01 as a thread.
The post links no repository, protocol, or data file. The numbers are the author's. They describe the author's own small-model experiments. They are not a measurement of TypeSafe's training run, and they are not a file behind the word RLCD.

## Post

We spent the last few days testing JEV internally. We tried to reproduce it, break it, and improve it.

5 things we learned:

1. JEV’s core insight is simple - and probably right. If the answer space is bounded, don’t generate the answer token by token. Remove autoregressive decoding and you can remove 1–2 orders of magnitude of inference work.

2. RLCD isn’t the moat. Data might be. Laya already open-sourced the implementation + weights. The missing piece is the synthetic data recipe. And our experiments strongly point in the same direction.

3. “Open source already beat JEV” is a benchmark illusion.

Same checkpoint:
In-distribution: 0.769
OOD: 0.541

Change the distribution and the apparent breakthrough largely disappears.

4. Compute-optimal ≠ learnability-optimal.

We moved state outside the problem sequence to save compute. Result: -27 points. Likely because we saved FLOPs while throwing away useful MLM pretraining priors.

Then we tested 6 more ideas in one night: anchor selection, continuity smoothing, asymmetric windows, bucketed temperature, two-stage retrieval, full RLCD.

All failed or failed to generalize. Only one thing consistently worked: More data.

1,200 → 123,475 examples
OOD: 0.4069 → 0.5498

5. The weirdest result: A decoder with zero additional training still beat every trained small encoder:

0.5671 vs 0.5628 / 0.5411 / 0.4069

Our takeaway: JEV’s breakthrough may not be a particular architecture or training algorithm.

It may be a much simpler idea: When the answer space is bounded, search it. Don’t generate it. And right now, the biggest bottleneck to making that work broadly doesn’t look like architecture.

It looks like data.

## Reply in the same thread

One interesting thing about JEV/decision models for cyber: agents often don’t have a reasoning problem. They have a branching problem.

Every action creates more possible next states. Over long horizons, that tree explodes, and autoregressive reasoning becomes an expensive, slow way to search it.

JEV suggests a different architecture: Search cheap. Branch wide. Reason only when necessary.

In theory, this should become more valuable as the horizon gets longer.

The irony: so far, long-horizon planning is exactly where JEV has impressed us the least. That gap is probably the most interesting thing to work on.
