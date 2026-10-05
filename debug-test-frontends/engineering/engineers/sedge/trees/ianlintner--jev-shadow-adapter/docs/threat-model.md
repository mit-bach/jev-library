# Threat model

This page states what this harness is defending against, and — just as
importantly — what it is **not** defending against. Everything on this page is
a design claim; the [measurement limits](measurement-limits.md) page covers
what has actually been observed.

## The assets

| Asset | Why it matters here |
|---|---|
| The user's conversation state | It is the payload a naive shadow adapter would ship to a third party. |
| Credentials in state or environment | A TypeSafe key, or anything credential-shaped that leaked into a prompt. |
| The caller's routing decision | A shadow experiment must not silently become the live policy. |
| The caller's latency budget | An observational add-on must not slow the request it observes. |

## Threats and controls

### 1. Raw state egress

**Threat.** The adapter serializes a task and POSTs it to a cloud decision
model, shipping raw user text, tool output, or identifiers.

**Control.** The entire serialized outbound state is passed through Hermes'
existing `agent.redact.redact_for_egress` before any bytes leave the process.
The redactor is resolved in a documented order: an explicitly injected
callable (tests), `hermes_agent_root` / `HERMES_AGENT_ROOT` (imported from that
specific checkout), then an already-importable `agent.redact` when
`Settings.allow_ambient` is true (the default). If none resolve, or the
resolved redactor raises, the export is **skipped**. There is deliberately no
fallback path that sends unredacted state.

### 2. Redactor regression

**Threat.** The upstream redactor has a gap, and the adapter's belt-and-braces
check is mistaken for real DLP.

**Control.** A second scan of the *already-redacted* text looks for credential
shapes: `Bearer ...`, `sk-...`, `ghp_...`, `AKIA...`, PEM key blocks, and
`password=` / `secret=` / `api_key=` / `token=` assignments whose value is long
enough and not purely numeric. A hit skips the export with reason
`redaction_insufficient`.

**This is a heuristic, not DLP.** It only fires when the keyword sits
immediately before `=` — `secret_name=my-app` is left alone — and the value
looks credential-shaped, so `api_key=42` passes. It can miss a short real
secret such as a six-character password, and it can flag a long benign
identifier. It exists because the real Hermes redactor deliberately leaves a
bare `password=...` in conversational prose untouched, verified against a real
redactor run. It is a second check, not a replacement.

### 3. Shadow influence

**Threat.** The experiment quietly starts deciding.

**Control.** The return value never overrides the caller's model choice, and
`current_heuristic_tier` always reflects the existing unmodified heuristic.
There is no code path from a Jev response to a routing decision in this
package.

### 4. Availability coupling

**Threat.** A slow or dead decision API takes the classifier down with it, or a
synchronous call is offloaded to a thread pool whose submission is not gated,
so the pool's queue grows without bound.

**Control.** Every branch fails open with a bounded reason code: success,
timeout, HTTP error, malformed response, missing credential, missing redactor,
disabled, kill-switched. The original classifier response is never delayed or
rewritten, and shadow capture runs after the caller's response is complete.
Where a synchronous HTTP call is offloaded to a thread, submission is gated by
a nonblocking slot held until the socket thread actually exits, because
cancelling an async timeout does not stop that thread.

### 5. Credential handling

**Threat.** The TypeSafe key ends up in a log, an event, an exception message,
or a committed file.

**Control.** The key is resolved from an explicit argument, `TYPESAFE_API_KEY`,
then `~/.hermes/.env` (overridable via `JEV_SHADOW_HERMES_HOME` or the
`hermes_home` argument), then `$HERMES_HOME/.env` as a fallback when it names a
different file. It is wrapped in a `SecretKey` whose `repr`/`str` are always
the fixed placeholder `<typesafe-api-key>`, never logged or written, and read
once at the single HTTP call site. `HERMES_HOME` alone is not trusted for the
primary lookup: in a real Hermes profile session it points at a profile
directory, not the Hermes home, so trusting it would hide the documented file
and silently skip every turn.

### 6. Observability as an exfiltration channel

**Threat.** Metrics and logs become the leak the redactor was preventing.

**Control.** `ShadowEvent` records derived metrics and decisions only:
timestamps, tier suggestions, confidences, cost, latency, outcome/reason codes.
They never contain the raw user message, the raw or redacted state, the
outbound payload, or any tool output. Prometheus labels are fixed enums
(outcome, tier, comparison) — never IDs, raw text, model strings, or exception
messages. See the [privacy boundary](privacy-boundary.md).

### 7. Namespace collision

**Threat.** Enabling a second exporter silently breaks scraping.

**Control.** The `jev_shadow_*` metric names **collide** with the separate
already-public [`ianlintner/jev-router`](https://github.com/ianlintner/jev-router)
project, which exports some of the same names with *different* label schemas.
Prometheus rejects a scrape whose metric name is registered with a conflicting
label set, so pointing both exporters at one Prometheus breaks scrapes rather
than merging series. Enable one per Prometheus, or rename here first. Details
and the reserved-name list are in the [README](https://github.com/ianlintner/jev-shadow-adapter#readme).

## Explicit non-goals

- **Not DLP.** The credential scan is narrow and best-effort.
- **Not an authorization system.** Jev never decides access here.
- **Not a validated routing policy.** The tier thresholds in `decision.py` are
  an explicit, uncalibrated, conservative choice for a shadow trial.
- **Not an audit trail.** No event bus, no durability guarantee, no
  tamper-evidence.
- **Not an inline gate.** This package observes; it does not enforce. See
  [future enforcement](future-enforcement.md).
