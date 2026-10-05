# Integration

This harness is deliberately easy to attach and easy to detach. Attachment
touches **one** call site in the caller, and the original direct route stays
intact.

## The attachment point

The only change needed in a classifier or routing host is to hand the harness
a bounded view of the decision and let it record. Concretely:

```python
from jev_shadow.harness import JevShadowHarness
from jev_shadow.metrics import ShadowMetrics

metrics = ShadowMetrics()
harness = JevShadowHarness(settings, metrics=metrics, redactor=hermes_redactor)

# After your own routing decision is already made and your response is
# complete, hand the turn to an asynchronous, non-blocking shadow pipeline.
# Never use the event to select or change the live model.
```

Two rules govern this attachment:

1. **The shadow capture runs after the caller's response is complete.** It must
   never delay or rewrite the original classifier response.
2. **The harness's return value is discarded.** It is observation, not input.

## Boundary discipline

- Bind the harness to loopback and keep the decision endpoint reachable only
  from the host that needs it.
- Keep the decision plane separate from the execution plane. Use the decision
  model only for narrow typed judgments; policy code chooses a known execution
  target and retains all permissions, approvals, and deterministic validation.
- Minimize and gate cloud-bound state before enqueueing it. Export only the
  specific fields required for the decision, reject oversized or malformed
  captures, and enforce textual limits in UTF-8 bytes at schema validation
  time — not later in the decision path — so every over-limit request has the
  documented validation result.
- Bypass export entirely for local-only or private controls and for
  credential-like content.

## Metrics

`ShadowMetrics` is opt-in and standard-library only. It observes the derived
event *after* Jev finishes; if observation fails, the existing route is
unchanged. State stays bounded in memory.

```python
server = metrics.serve()  # loopback only; free port by default
# Run server.serve_forever() in a worker thread; call shutdown() on exit.
# Scrape http://127.0.0.1:<server.server_port>/metrics with Prometheus.
```

Import `grafana/jev-shadow-dashboard.json` into Grafana and select its
Prometheus datasource. This is a standalone dashboard JSON — no provisioned
Grafana instance, no Prometheus target, and no Hermes production hook is
installed by this spike.

!!! warning "Namespace collision"

    `jev_shadow_*` names collide with the separate, already-public
    [`ianlintner/jev-router`](https://github.com/ianlintner/jev-router)
    project, which exports some of the same names with *different* label
    schemas. Prometheus rejects a scrape whose metric name is registered with a
    conflicting label set, so pointing both exporters at one Prometheus breaks
    scrapes instead of merging series. Enable **one** per Prometheus, or rename
    here first.

## Running a trial

Read a JSON/JSONL file of turns, run the harness, and write one shadow event
per turn:

```sh
HERMES_AGENT_ROOT=/path/to/hermes-agent \
python -m jev_shadow.trial --turns examples/turns.jsonl --out /tmp/jev-shadow-events.jsonl
```

Dry run is the default and makes **no network call** — a local deterministic
simulator stands in for the real Jev response so redaction and tier mapping
still run end-to-end. It still requires resolving the *real* Hermes redactor.

A live run is explicit opt-in:

```sh
export TYPESAFE_API_KEY=...   # or rely on ~/.hermes/.env
python -m jev_shadow.trial --turns examples/turns.jsonl --out events.jsonl \
  --live --hermes-agent-root /path/to/hermes-agent
```

| Flag | Effect |
|---|---|
| `--live` | Required for any real network call. |
| `--dry-run` | Documents intent; already the default without `--live`. |
| `--limit N` | Cap how many turns run. |
| `--hermes-agent-root PATH` | Resolve the redactor from a specific checkout. |

If no redactor can be resolved, dry-run is a hard configuration error: it
prints a one-line diagnostic to stderr naming the fix and exits non-zero,
writing **no** events file, rather than writing skipped-only events that make it
look like something ran. `--live` stays fail-open instead and records every
turn as `skipped` / `redaction_unavailable` in the written events file.

See [run the example locally](example-service.md) for a synthetic-only
container walkthrough.
