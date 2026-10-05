# jev-shadow

An experimental **shadow-mode** adapter that calls TypeSafe Jev ("System One")
alongside Hermes' existing model-tier logic, purely for observation.

## The shadow-only guarantee

- Jev **never** determines a production decision in this package. Every call
  is observational: it produces a `ShadowEvent` that is logged, and nothing
  else. The harness's return value never overrides the caller's own model
  choice, and the event's `current_heuristic_tier` field always reflects the
  existing, unmodified Hermes heuristic.
- Every branch — success, timeout, HTTP error, malformed response, missing
  credential, missing redactor, disabled, kill-switched — **fails open**: the
  harness never raises, and the caller's behavior is byte-identical whether or
  not the shadow call ran or succeeded.

## The privacy model

- The **entire** serialized outbound state is passed through Hermes'
  `agent.redact.redact_for_egress` before anything leaves the process. The
  redactor is resolved in this order: an explicitly injected callable (tests),
  `hermes_agent_root` / `HERMES_AGENT_ROOT` (imported from that specific
  checkout), then — when `Settings.allow_ambient` is true, which is the
  default — an already-importable `agent.redact` (the normal case when this
  harness runs in-process inside Hermes). If none of those resolve, or the
  resolved redactor raises, the export is skipped — the harness never falls
  back to sending unredacted state. Set `JEV_SHADOW_ALLOW_AMBIENT=0` to
  disable the ambient fallback and require an explicit root.
- A belt-and-braces check scans the *already-redacted* text for credential
  shapes that shouldn't be there: `Bearer ...`, `sk-...`, `ghp_...`,
  `AKIA...`, PEM key blocks, and a `password=`/`secret=`/`api_key=`/`token=`
  assignment whose value is long enough and not purely numeric. **This last
  check is a heuristic, not DLP**: it only fires when the keyword sits
  immediately before `=` (so `token_limit=100` or `secret_name=my-app`, where
  another identifier separates the keyword from `=`, are left alone) and the
  value looks credential-shaped (so `api_key=42` or `max_tokens=4096` pass
  too) — it exists because the real Hermes redactor deliberately leaves a bare
  `password=...` in conversational prose untouched, verified against a real
  redactor run, but it can still miss a short real secret (e.g. a 6-character
  password) or flag a long benign identifier. If a credential shape survives,
  the export is skipped with reason `redaction_insufficient` — this is a
  second check, not a replacement for the real redactor.
- `ShadowEvent` records are derived metrics and decisions only: timestamps,
  tier suggestions, confidences, cost, latency, outcome/reason codes. They
  never contain the raw user message, the raw or redacted state, the outbound
  payload, or any tool output.
- The TypeSafe API key is resolved from an explicit argument, the
  `TYPESAFE_API_KEY` environment variable, then `~/.hermes/.env` (the real
  Hermes home, overridable via `JEV_SHADOW_HERMES_HOME` or the `hermes_home`
  argument), and finally `$HERMES_HOME/.env` as a fallback when it names a
  different file. `HERMES_HOME` alone is deliberately *not* trusted for the
  primary lookup: in a real Hermes profile session it points at a profile
  directory (`~/.hermes/profiles/<name>`), not the Hermes home, so trusting it
  would hide the documented file and silently skip every turn. The key is
  wrapped in a `SecretKey` object whose
  `repr`/`str` are always the fixed placeholder `<typesafe-api-key>` — it is
  never logged, printed, or written anywhere, and the raw value is only read
  once, at the single HTTP call site.

**This is not DLP.** The belt-and-braces credential check is a narrow,
best-effort safety net on top of Hermes' real redactor, not a general-purpose
data-loss-prevention system. And the tier-suggestion thresholds in
`decision.py` are an explicit, uncalibrated, conservative choice for this
shadow trial — not a validated routing policy.

## Install

```sh
pip install -e ".[test]"
```

Pure standard library at runtime (`urllib`, `json`, `logging`, etc.); `pytest`
is the only test dependency.

## Run the tests

```sh
python -m pytest -q
```

Tests never touch the network — HTTP-level tests spin up a local
`http.server` on `127.0.0.1` with an OS-assigned port and shut it down in
teardown.

## Run a local shadow trial

The trial CLI reads a JSON/JSONL file of turns, runs the harness over them,
and writes one shadow event per turn to a JSONL file, then prints an
aggregate-only summary (tier counts, match rate, skip/error counts, total
cost, p50/p95 latency — never prompts or state).

### Dry run (default, no network)

```sh
HERMES_AGENT_ROOT=/path/to/hermes-agent \
python -m jev_shadow.trial --turns examples/turns.jsonl --out /tmp/jev-shadow-events.jsonl
```

Dry-run makes **no network call**. A local, deterministic simulator stands in
for the real Jev response so the redaction and tier-mapping code paths still
run end-to-end — it still requires resolving the *real* Hermes redactor first
(only the Jev API call itself is simulated). The redactor is resolved exactly
like `--live` does: `--hermes-agent-root PATH` or `HERMES_AGENT_ROOT`, then an
ambient `agent.redact` if already importable (e.g. running in-process inside
Hermes).

If no redactor can be resolved at all, that's a hard configuration error for
dry-run: the trial prints a one-line diagnostic to stderr naming the fix and
exits non-zero, writing **no** events file, rather than silently writing
skipped-only events that make it look like something ran. Running this repo
standalone with neither flag set will hit exactly that error — either pass
`--hermes-agent-root`/`HERMES_AGENT_ROOT` pointing at a Hermes checkout, or run
the trial in-process inside Hermes.

### Live run (explicit opt-in, real API calls)

```sh
export TYPESAFE_API_KEY=...   # or rely on ~/.hermes/.env
python -m jev_shadow.trial --turns examples/turns.jsonl --out events.jsonl --live \
  --hermes-agent-root /path/to/hermes-agent
```

`--live` is required for any real network call; without it, the trial never
talks to `api.typesafe.ai`. Unlike dry-run, `--live` never hard-fails on a
missing redactor — it stays fail-open and prints the same one-line diagnostic
to stderr, then every turn shows up as `skipped` / `redaction_unavailable` in
the (still-written) events file and aggregate summary.

Other flags: `--limit N` to cap how many turns run; `--hermes-agent-root PATH`
to resolve the redactor from a specific Hermes checkout (falls back to
`HERMES_AGENT_ROOT`, then an ambient `agent.redact`, for both `--live` and
dry-run); `--dry-run` as a no-op flag documenting intent (dry-run is already
the default whenever `--live` is absent).

## Credential resolution

In order: an explicit `api_key` argument, the `TYPESAFE_API_KEY` process
environment variable, then `~/.hermes/.env` — the real Hermes home, overridable
via `JEV_SHADOW_HERMES_HOME` or the `hermes_home` argument — parsed as
`KEY=VALUE` lines, and finally `$HERMES_HOME/.env` when it names a different
file. `HERMES_HOME` is not trusted for the primary lookup because a real Hermes
profile session sets it to the profile directory, which would hide the
documented `~/.hermes/.env` and skip every turn as `missing_credential`. The key
is never written anywhere by this package, never appears in an error message,
and never appears in a `ShadowEvent`.

## Optional Prometheus telemetry and Grafana panel

`ShadowMetrics` is an opt-in, standard-library-only in-process accumulator. It
observes the derived event after Jev finishes; if observation fails, the
existing route is unchanged. Labels are fixed enums (outcome, Jev tier,
baseline tier, match/different/unknown), never IDs, raw text, model strings,
or exception messages. Histograms expose confidence, provider-reported cost
and round-trip latency. The cost counter is a reported charge, not a savings
estimate. Skipped/error events have `comparison="unknown"`, not a false
disagreement. State stays bounded in memory.

```python
from jev_shadow.metrics import ShadowMetrics

metrics = ShadowMetrics()
harness = JevShadowHarness(settings, metrics=metrics, redactor=hermes_redactor)
# Attach the harness to a caller-owned *asynchronous*, non-blocking shadow
# pipeline. Never use the event to select or change the live model.
server = metrics.serve()  # loopback only; chooses a free port by default
# Run server.serve_forever() in a worker thread; call shutdown() on exit.
# Scrape http://127.0.0.1:<server.server_port>/metrics with Prometheus.
```

The import above also needs `from jev_shadow.harness import JevShadowHarness`.
Import `grafana/jev-shadow-dashboard.json` in Grafana and select its Prometheus
datasource. This is a standalone dashboard JSON, not a provisioned Grafana
instance; neither a Prometheus target nor a Hermes production hook is installed
by this spike. In particular, `current_heuristic_tier` is the package's static
mapping of the existing selected model, not an observed dynamic routing policy;
agreement measures classification delta, **not** downstream task quality or
realized savings. See the decision record for the model-tier-first rationale.

### Telemetry namespace collision (read before enabling both exporters)

The metric names exported here (`jev_shadow_*`) **collide** with the separate,
already-public [`ianlintner/jev-router`](https://github.com/ianlintner/jev-router)
project, which exports some of the same names with *different* label schemas:

| Metric | This harness | `jev-router` |
|---|---|---|
| `jev_shadow_decisions_total` | labels `outcome,jev_tier,baseline_tier,comparison` | label `recommendation` |
| `jev_shadow_cost_usd_total` | no labels | no labels |

Prometheus rejects a scrape whose metric name is registered with a conflicting
label set, so pointing both exporters at one Prometheus instance will break
scrapes rather than merge the series. Enable **one** of them per Prometheus, or
rename this harness's metrics (a one-line change in `metrics.py::render`) before
scraping both. The `jev_shadow_requests_total`, `jev_shadow_queue_depth`,
`jev_shadow_inflight`, `jev_shadow_input_tokens_total`, `jev_shadow_circuit_open`,
`jev_shadow_last_success_timestamp_seconds` and `jev_shadow_reasons_total` names
are additionally reserved by `jev-router` and should not be reused here.

## Documentation site

A rendered documentation site — threat model, privacy boundary, integration,
rollback, measurement limits, and future enforcement — is built and deployed by
GitHub Actions:

<https://ianlintner.github.io/jev-shadow-adapter/>

Its sources are in `docs/`, configured by `mkdocs.yml`. Build locally with
`python -m mkdocs build --strict` (install `requirements.txt` first).

## License

MIT — see `LICENSE`. Third-party attribution and the "independent spike, not
affiliated with any vendor" disclaimer are in `NOTICE`.
