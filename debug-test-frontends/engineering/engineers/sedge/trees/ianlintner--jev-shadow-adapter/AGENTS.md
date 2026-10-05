# Agent guidance for this repository

Experimental spike code for a **shadow-mode** TypeSafe Jev routing adapter for
Hermes (Nous Research). The human reviews every change.

## Hard rules

- Jev never determines a production decision here. Everything is observational:
  a shadow call may log, never mutate, route, trim, or block.
- Every outbound payload goes through the shared redaction path before it leaves
  the process. If redaction is unavailable or a payload still looks like it
  carries a credential, the call is **skipped**, never sent.
- Fail open everywhere: missing key, timeout, HTTP error, malformed or
  unparseable response => record a failure event and keep the caller's behaviour
  byte-identical.
- Never read, print, log, or commit credentials. The Jev key comes from the
  process environment or the user's existing Hermes env file at call time only;
  it must never appear in events, logs, exceptions, or tests.
- Pure stdlib at runtime (urllib, json, logging). `pytest` is the only test
  dependency. Python >= 3.11.

## Verify

```sh
python -m pytest -q           # must be fully green
python -m ruff check .        # if ruff is available
```

## Style

- Small modules with one job each; type hints; no bare `except Exception` that
  swallows silently without recording a bounded reason code.
- Tests never touch the network: they use fake local HTTP servers or injected
  transports.
