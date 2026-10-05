# jev-shadow

An experimental **shadow-mode** adapter that calls TypeSafe Jev ("System One")
alongside Hermes' existing model-tier logic, purely for observation.

<div class="grid cards" markdown>

-   :material-eye-outline: **Shadow only**

    ---

    Jev never determines a production decision in this package. Every call
    produces a `ShadowEvent` that is logged and nothing else — the harness's
    return value never overrides the caller's model choice.

    [:octicons-arrow-right-24: Threat model](threat-model.md)

-   :material-shield-lock-outline: **Fail open, always**

    ---

    Success, timeout, HTTP error, malformed response, missing credential,
    missing redactor, disabled, kill-switched — every branch keeps the caller's
    behavior byte-identical. The harness never raises.

    [:octicons-arrow-right-24: Privacy boundary](privacy-boundary.md)

-   :material-chart-box-outline: **Measured, not asserted**

    ---

    Prometheus counters for outcomes, tiers, comparison and latency, with a
    Grafana dashboard. Agreement measures classification delta — **not**
    downstream task quality or realized savings.

    [:octicons-arrow-right-24: Measurement limits](measurement-limits.md)

-   :material-source-branch: **Advisory, not enforcement**

    ---

    Nothing here gates, trims, blocks or routes traffic. What inline
    enforcement would additionally require is documented separately from what
    has actually been measured.

    [:octicons-arrow-right-24: Future enforcement](future-enforcement.md)

</div>

## What this is

A small, dependency-free (stdlib-only at runtime) Python harness that:

1. Takes a bounded, typed view of a routing decision.
2. Passes the **entire** serialized outbound state through Hermes'
   `agent.redact.redact_for_egress` before anything leaves the process.
3. Calls Jev, records a derived `ShadowEvent`, and returns nothing that can
   influence the caller.
4. Optionally accumulates Prometheus metrics for offline analysis.

This is a **public proof of concept**, published from a clean single-commit
tree. It is an independent spike and is **not affiliated with any vendor**.

## Quick start

```sh
pip install -e ".[test]"
python -m pytest -q
```

Tests never touch the network: HTTP-level tests spin up a local `http.server`
on `127.0.0.1` with an OS-assigned port and shut it down in teardown.

Dry-run a trial (no network call, simulator stands in for Jev):

```sh
HERMES_AGENT_ROOT=/path/to/hermes-agent \
python -m jev_shadow.trial --turns examples/turns.jsonl --out /tmp/jev-shadow-events.jsonl
```

## Read next

| Page | Question it answers |
|---|---|
| [Threat model](threat-model.md) | What could go wrong, and what stops it? |
| [Privacy boundary](privacy-boundary.md) | Exactly what leaves the process, and what never does? |
| [Integration](integration.md) | How does this attach to Hermes without changing it? |
| [Rollback](rollback.md) | How do I turn it off right now? |
| [Measurement limits](measurement-limits.md) | What do the numbers actually prove? |
| [Future enforcement](future-enforcement.md) | What inline enforcement would still need? |
| [Run the example locally](example-service.md) | How do I exercise it on my own machine? |

The full design notes live in the repository [README](https://github.com/ianlintner/jev-shadow-adapter#readme).
