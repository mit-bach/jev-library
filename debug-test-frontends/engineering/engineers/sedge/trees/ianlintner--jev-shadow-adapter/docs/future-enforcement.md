# Future enforcement

This package **observes**. It does not gate, trim, block, or route. This page
exists so that the distance between "observational" and "enforcement" is stated
explicitly rather than implied by a green test suite.

## What inline enforcement would additionally require

Nothing below is implemented, and none of it is claimed to be close.

### 1. An idempotency model

Automatic retries are only safe with a demonstrated idempotency model. Without
one, a timeout mid-request is indistinguishable from a timeout before the
provider saw it, and retrying duplicates work. This harness never retries
automatically, and an enforcing version could not either until that model
exists.

### 2. Hard resource bounds under load

An inline call sits in the user's latency budget. That needs, at minimum:

- fixed concurrency and a finite queue with a short TTL,
- a short request timeout and a response-size ceiling,
- a cache with a bounded TTL,
- a kill switch and a circuit breaker,
- and, where a synchronous HTTP call is offloaded to a thread, nonblocking
  submission gating that holds the slot until the socket thread actually exits
  — because cancelling an async timeout does not stop that thread, and an
  ungated thread pool's queue grows without bound.

### 3. A defined failure policy that is not "fail open forever"

Fail-open is correct for observation and wrong for a gate that is supposed to
enforce. Enforcement requires deciding, per failure mode, whether the request is
allowed or denied — and then measuring how often that branch fires.

### 4. Evidence that inline latency is acceptable

Shadow latency proves nothing about inline latency: the observed call was
off the critical path and could be dropped at any time. A hypothetical inline
budget must be measured **separately**, under load, with the same bounds as
production.

### 5. Evaluation on labeled data

Enforcement quality needs false positives, false negatives, abstains, queue
drops, calibration, and event-to-alert latency, all measured on labeled
synthetic or consented data. This harness reports none of those.

### 6. An explicit denial policy that is not a model's job

Model outputs are advisory alerts, not access decisions. A lone
event-kind/severity/outcome tuple cannot establish intent; `other` and abstain
must survive, ambiguous cases must be evaluated on labels, and a likely
category must never become an automatic denial.

### 7. Separation of planes

The decision plane stays separate from the execution plane. Policy code chooses
a known execution target and retains all permissions, approvals, and
deterministic validation. A decision model is not a calculator and not an
authorization system.

## Why this page is separate from the results

The rest of this site describes something that has been built, tested, and
measured. This page describes something that has not. Keeping them apart is
deliberate: conflating an enforcement roadmap with a working policy is exactly
the failure this harness was designed to avoid.
