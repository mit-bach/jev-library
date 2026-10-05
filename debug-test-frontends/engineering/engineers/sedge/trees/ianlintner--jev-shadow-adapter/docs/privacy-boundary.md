# Privacy boundary

This page is the precise list of what may leave the process and what may never
leave it. It is the operational form of the [threat model](threat-model.md).

## The single egress point

There is exactly one outbound path: the Jev decision request. Nothing else in
this package opens a socket (sending metrics to a remote Prometheus is the
scraper's job, not this package's — `ShadowMetrics.serve()` binds **loopback
only**).

Before that one call, the **entire** serialized outbound state goes through
Hermes' `agent.redact.redact_for_egress`.

## Redactor resolution order

1. An explicitly injected callable (tests).
2. `hermes_agent_root` / `HERMES_AGENT_ROOT` — imported from that specific
   Hermes checkout.
3. An already-importable `agent.redact`, only when `Settings.allow_ambient` is
   true (the default). This is the normal case when the harness runs in-process
   inside Hermes.

**If none of those resolve, or the resolved redactor raises, the export is
skipped.** There is no unredacted fallback. Set `JEV_SHADOW_ALLOW_AMBIENT=0` to
disable the ambient step and require an explicit root.

## Second check on already-redacted text

After redaction, a belt-and-braces scan looks for surviving credential shapes:

| Shape | Example trigger |
|---|---|
| Bearer token | `Bearer abc123...` |
| OpenAI-style key | `sk-...` |
| GitHub PAT | `ghp_...` |
| AWS access key | `AKIA...` |
| PEM block | `-----BEGIN ... PRIVATE KEY-----` |
| Assignment | `password=` / `secret=` / `api_key=` / `token=` with a long, non-numeric value |

A hit skips the export with reason `redaction_insufficient`.

The check is a heuristic, not DLP. It requires the keyword immediately before
`=`, so `token_limit=100` and `secret_name=my-app` are left alone; and it
requires a credential-shaped value, so `api_key=42` and `max_tokens=4096` pass.
It can still miss a short real secret or flag a long benign identifier.

## What a `ShadowEvent` contains

Derived values only:

- timestamps and latencies,
- tier suggestion and baseline tier,
- confidences,
- provider-reported cost,
- outcome and bounded reason codes,
- a comparison enum (`match` / `different` / `unknown`).

Skipped and error events carry `comparison="unknown"`, never a false
disagreement.

## What a `ShadowEvent` never contains

- the raw user message,
- the raw state,
- the redacted state,
- the outbound payload,
- any tool output,
- any credential, in any form.

## What Prometheus labels may contain

Fixed enums only: outcome, Jev tier, baseline tier, comparison, and bounded
reason codes. Never IDs, session or tenant identifiers, raw text, model
strings, prompts, provider responses, request headers, or exception messages —
because observability systems become a data-export channel the moment a label
carries free text.

## Credential handling summary

The TypeSafe key is resolved from an explicit argument, `TYPESAFE_API_KEY`,
then `~/.hermes/.env` (overridable via `JEV_SHADOW_HERMES_HOME` or the
`hermes_home` argument), then `$HERMES_HOME/.env` when it names a different
file. `HERMES_HOME` alone is not trusted for the primary lookup, because in a
real Hermes profile session it points at a profile directory, which would hide
the documented file and skip every turn as `missing_credential`.

The key is wrapped in a `SecretKey` whose `repr`/`str` are always
`<typesafe-api-key>`. It is never logged, printed, or written anywhere, and the
raw value is read once, at the single HTTP call site.

## Verifying the boundary yourself

- Run `python -m pytest -q`. The redaction and skip paths are covered by the
  suite, and tests never touch the network.
- Grep the tracked tree for credentials and local paths before you deploy
  anything derived from this code.
- Remember that this is a *published* proof of concept: the boundary described
  here is the harness's contract, not a guarantee about any code you add on
  top of it.
