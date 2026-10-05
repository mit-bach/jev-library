# Measurement limits

This page separates **what has been measured** from **what has not**. The
distinction is the point: an observational harness produces observational
numbers, and they are routinely over-read.

## What the metrics do show

`ShadowMetrics` accumulates, over the turns that actually ran:

| Signal | Meaning |
|---|---|
| Outcome counts | How often calls succeeded, timed out, errored, or were skipped, by bounded reason code. |
| Jev tier vs baseline tier | How often the two disagreed. |
| Comparison enum | `match`, `different`, or `unknown` (skipped/error). |
| Confidence histogram | The distribution of reported confidence. |
| Cost counter | Provider-reported charge. |
| Latency histogram | Round-trip latency. |

## What the metrics do not show

!!! danger "Agreement is not quality"

    A high match rate between Jev's suggestion and the existing heuristic
    measures **classification delta**, not downstream task quality. Two
    classifiers can agree on every turn and both be wrong. Nothing in this
    package measures whether the resulting work was better, cheaper, or faster.

Specifically, the numbers here do **not** establish:

- **Task quality.** No downstream evaluation is run or claimed.
- **Realized savings.** The cost counter is a *reported charge*, not a savings
  estimate. The comparison is what was suggested, not what was spent against a
  counterfactual.
- **Savings from agreement.** Agreeing with the baseline does not imply the
  baseline was optimal.
- **Latency safety for inline use.** Shadow latency is measured *off* the
  request path. It says nothing about what the same call would cost inline —
  see [future enforcement](future-enforcement.md).
- **Calibration.** Confidence values are reported, not calibrated against
  outcomes. Counts reflect however many turns the trial ran, which is not a
  sampled population.
- **Robustness.** A shadow trial that ran during good conditions says nothing
  about behavior under provider degradation.

## The static baseline tier is not a policy

`current_heuristic_tier` is this package's **static mapping of the already
selected model**, not an observed dynamic routing policy. Treating it as "what
the router would have done" is a category error: it is a relabeling of the
current selection, frozen for comparison.

## Thresholds are uncalibrated

The tier-suggestion thresholds in `decision.py` are an explicit, conservative,
**uncalibrated** choice for this shadow trial — not a validated routing policy.
Any decision to use them for real routing would require separate calibration on
labeled data that this spike does not have.

## Design guidance for anyone extending the measurement

- Dashboards must distinguish observed data from estimates.
- Never label classifier agreement or projected savings as task quality.
- Instrument before enabling, and export low-cardinality counters only —
  observability systems become a data-export channel once labels carry free
  text.
- Measure on labeled synthetic or consented data, and keep protocol-specific
  inputs behind a common normalized signal schema.

## Read the numbers honestly

If a claim in this repository is not backed by a measurement on this page, it
is a design intention. Design intentions are worth stating — they are on the
[threat model](threat-model.md) and [integration](integration.md) pages — but
they are not evidence.
