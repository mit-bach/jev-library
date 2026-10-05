# Rollback

Rollback must be trivial, because an observational add-on that is hard to
remove becomes an operational dependency.

## Kill switch

The harness honours a disable switch: when disabled, the decision call is
skipped with a bounded reason code and the caller is unaffected. This is
immediate — no deploy, no restart of the routing host.

## Full rollback

Because attachment touches exactly one call site and the original direct route
is retained:

1. Remove the shadow dispatch from that call site.
2. Leave everything else untouched. There is no schema migration, no state store
   to reconcile, no route to restore.

The caller's behavior returns to byte-identical to the pre-integration state.
That property is the point of the fail-open design: at no time was the shadow
call load-bearing.

## Metrics rollback

`ShadowMetrics` is opt-in and in-process.

- Stop scraping the endpoint, or
- stop constructing the metrics object and pass `metrics=None`.

If observation ever fails, the existing route is already unchanged — the
metrics object wraps its own observation and does not propagate.

## Verifying rollback

After removing the dispatch:

- The routing host's existing tests must pass unchanged. If a test had to be
  modified to remove the shadow path, the integration was load-bearing and that
  is a bug in the integration, not in this harness.
- Confirm no shadow events are written and no trace of the shadow function
  appears in the host's request path.
- Confirm the original direct route still returns the original result for a
  real routed request. Preserve the execution router; this package is not one.

## What rollback cannot undo

Rollback stops future egress. It cannot un-send anything already sent. If a
payload was exported in error, the remediation is credential rotation and a
review of the first check that was supposed to catch it — see the
[privacy boundary](privacy-boundary.md), and note explicitly that the
belt-and-braces credential scan is a heuristic, not DLP.
