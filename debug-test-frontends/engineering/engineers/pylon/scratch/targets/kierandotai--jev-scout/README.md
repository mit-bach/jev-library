# jev-scout

MCP stdio server exposing `guarded_search`, `guarded_fetch`, and
`research_report`, where every query, result, and fetched page is scored by
Jev (TypeSafe's System One decision model) with atomic, observable-signal
criteria — and every decision streams to a live local dashboard.

## What it is

Agents research the web through opaque built-in tools: nobody sees which
sources they trusted, what they skipped, or what junk steered them. Jev's
economics (per-decision cost around $0.0001, latency 70–500ms) make it viable
to judge *every* research step rather than sampling a few. jev-scout wraps a
pluggable search backend and a page fetcher with one Jev call per result
(relevance, credibility, worth-fetching) and one Jev call per fetched page
(answered, content class, steering risk), then writes every decision to a
JSONL ledger and streams it to a same-process dashboard over SSE.

jev-scout is built on [TypeSafe](https://typesafe.ai)'s Jev via the
`jev-client` sibling library (`../jev-client`), which isolates the
OpenRouter/TypeSafe provider wiring so jev-scout only talks to a small
`Judge` interface.

jev-scout is deliberately **not** a research agent. There is no multi-hop
planning, no synthesis, no answer-writing — it is a thin decision layer in
front of existing search that annotates (or, optionally, gates) what an
agent sees, and makes the whole process visible. The dashboard shows three
things while an agent works: a live decision feed grouped by search (with
confidence, and an explicit "unscored" badge instead of a misleading 0%
whenever Jev couldn't be reached), a running cost/call ticker, and a
per-domain credibility table.

**Measured, not vibes:** the judging rubrics are validated against a
hand-labeled golden set — relevance 88%, credibility 96% on the first live
checkpoint. Full methodology, miss analysis, and caveats:
[docs/accuracy/2026-09-19-jev-golden-set-study.md](docs/accuracy/2026-09-19-jev-golden-set-study.md).

## Quickstart

**1. Start SearXNG** (the default free backend) — a JSON search API isn't
enabled by default, so it needs one settings change:

```sh
docker run -d --name searxng -p 8080:8080 -v "$PWD/searxng:/etc/searxng" searxng/searxng
```

Edit `searxng/settings.yml` (created on first run) and set:

```yaml
search:
  formats:
    - html
    - json
server:
  limiter: false
```

Then restart the container so the config takes effect:

```sh
docker restart searxng
```

**2. Install dependencies:**

```sh
# jev-scout consumes jev-client as a file: dependency — clone them side by side
git clone https://github.com/kierandotai/jev-client.git
git clone https://github.com/kierandotai/jev-scout.git
cd jev-client && npm install && npm run build && cd ../jev-scout
npm install
```

**3. Register the MCP server with Claude Code** (replace `/ABS/PATH` with
this repo's absolute path):

```sh
claude mcp add --scope project --transport stdio jev-scout -- node --experimental-strip-types /ABS/PATH/jev-scout/src/server-mcp.ts
```

**4. Set up environment variables** — copy `.env.example` to `.env` (or export
the variables another way) and fill in at least `SEARXNG_URL=http://localhost:8080`
plus a Jev key (see [Jev access](#jev-access) below). See the
[env vars table](#env-vars) for every variable and its default.

## Recommended agent setup

jev-scout only sees what an agent actually routes through it. If the agent's
built-in `WebSearch`/`WebFetch` tools are still available, the agent can (and
sometimes will) bypass jev-scout entirely — coverage is voluntary by design,
not enforced. To make jev-scout the agent's only research path, deny the
built-in tools in Claude Code's settings:

```json
{
  "permissions": {
    "deny": ["WebSearch", "WebFetch"]
  }
}
```

With this in place, an agent that wants to search or fetch a page has no
alternative but `guarded_search` / `guarded_fetch` — every research step gets
judged, and `research_report` reflects the agent's *entire* research
activity, not a sample of it.

## Backends

| Backend | Cost | Config | Notes |
|---|---|---|---|
| SearXNG | Free, self-hosted | `SEARXNG_URL` | Default. Requires `search.formats: [html, json]` in `settings.yml` (off by default upstream) — see Quickstart. |
| Brave | Paid, $5/mo prepaid (as of Sept 2026) | `BRAVE_API_KEY` | Brave dropped its free tier in Feb 2026. |
| DuckDuckGo | Free, keyless | none | Best-effort only. DDG serves anomaly-challenge blocks (HTTP 202 / `anomaly.js` markers) from datacenter IPs — expect failures in cloud/CI environments. Requests are serialized one at a time with jittered delay to reduce (not eliminate) blocking. Always available, so it's the zero-config fallback — but never load-bearing by design. |

Backend resolution: if `JEV_SCOUT_BACKEND` is set, jev-scout uses **only**
that backend — its errors surface directly, with no fallback. If unset,
jev-scout auto-resolves a chain: SearXNG (if `SEARXNG_URL` is set) → Brave
(if `BRAVE_API_KEY` is set) → DuckDuckGo (always available). A zero-config
startup (no `SEARXNG_URL`, no `BRAVE_API_KEY`) lands on DDG — which is why
the quickstart above leads with the SearXNG docker one-liner rather than
skipping it.

## Jev access

jev-scout reaches Jev through `jev-client`, which needs one of:

- `OPENROUTER_API_KEY` — routes through OpenRouter's alpha Decisions
  endpoint (`/api/alpha/...`) to `typesafe/jev-1.13`. This is an alpha route
  and may move; a path change is isolated to `jev-client`'s provider code.
- `TYPESAFE_API_KEY` — direct TypeSafe access (currently waitlisted).

**Without either key**, jev-scout still runs end to end — search, fetch, and
`research_report` all work — but every relevance/credibility/steering_risk
score comes from a mock heuristic (simple keyword matching), not a real Jev
decision. This is loud on purpose: a stderr warning is printed at startup and
every score's provenance is effectively "not to be trusted." Set a key before
relying on any score for a real decision.

## Env vars

All variables live in `.env.example`, with defaults shown below.

| Variable | Default | Meaning |
|---|---|---|
| `JEV_SCOUT_BACKEND` | unset | `searxng`\|`brave`\|`ddg`. Set to pin one backend with no fallback; unset to auto-resolve the chain. |
| `SEARXNG_URL` | unset | SearXNG instance base URL, e.g. `http://localhost:8080`. Must have `formats: [html, json]` enabled. |
| `BRAVE_API_KEY` | unset | Brave Search API key. |
| `OPENROUTER_API_KEY` | unset | OpenRouter key for Jev via the alpha Decisions API. |
| `TYPESAFE_API_KEY` | unset | Direct TypeSafe key (alternative to OpenRouter, currently waitlisted). |
| `JEV_SCOUT_MODE` | `annotate` | `annotate`\|`gate`. See [Modes](#modes). |
| `JEV_SCOUT_MAX_CALLS` | `300` | Hard cap on Jev calls per process session. |
| `JEV_SCOUT_MAX_SPEND_USD` | `0.05` | Hard cap on Jev spend per process session. |
| `JEV_SCOUT_MAX_JUDGED` | `8` | Max results judged per single `guarded_search` call (top-k by backend rank). |
| `JEV_SCOUT_MIN_RELEVANCE` | `1.0` | Gate-mode relevance threshold (0–2). Ignored in annotate mode. |
| `JEV_SCOUT_MIN_CREDIBILITY` | `1.0` | Gate-mode credibility threshold (0–2). Ignored in annotate mode. |
| `JEV_SCOUT_DASHBOARD_PORT` | `0` | Dashboard HTTP port; `0` binds an ephemeral port on `127.0.0.1`, printed to stderr at startup. |

**Calls vs. spend cap:** at roughly $0.0001/call, the call cap binds first —
300 calls × $0.0001 ≈ $0.03, comfortably under the $0.05 default spend cap.
Both limits are enforced independently and atomically (no concurrent-call
overspend); whichever fires first is what `research_report`'s
`budget.exhausted.limit` names (`"calls"` or `"spend"`), and it's also what
gets logged to stderr at the moment it fires. Once usage crosses 80% of
either limit, every tool response starts carrying remaining-budget fields
even before exhaustion.

## Modes

- **`annotate`** (default): every result and fetch is scored and returned
  as-is — nothing is dropped. This is the mode to use while trusting the
  agent to read the scores itself.
- **`gate`**: results below `JEV_SCOUT_MIN_RELEVANCE` / `JEV_SCOUT_MIN_CREDIBILITY`
  are dropped at read time (thresholds are re-evaluated on every call, never
  baked into the cache — a threshold change between two calls can flip a
  cached score from drop to pass). `guarded_fetch` additionally runs a
  deterministic pre-fetch check: if the target domain already carries a
  cached below-threshold credibility judgment this session, the fetch is
  refused with a reason, before any network I/O or Jev call.

  **Fail-open semantics apply in both modes**: if Jev fails, the result or
  fetch still passes through, marked `scored: false`. If the session budget
  is exhausted, it also passes through, marked `budget_exhausted: true` —
  distinct from a Jev failure, since it means "not judged because we ran out
  of budget," not "Jev errored."

  **Gate decisions are never invisible.** Every `guarded_search` response
  carries a `dropped` array — one entry per gate-dropped result (threshold
  drops and beyond-cap truncation alike), each with its `url`, `domain`, and
  `reasons`. `research_report` additionally carries the live `mode` and
  `thresholds` (`min_relevance`/`min_credibility`) it evaluated against, and
  every tool's own description is generated with the process's current mode
  and thresholds baked in at startup — so an agent (or a human reading tool
  descriptions) never has to guess what got filtered or why.

## Security notes

- **SSRF guard scope.** `guarded_fetch` resolves and classifies a hostname's
  address(es) *before* any connection is opened, on the initial URL and again
  on every redirect hop's `Location` header (manual redirects, capped).
  Forbidden ranges include loopback, RFC1918 private, link-local (including
  the `169.254.169.254` cloud metadata address), CGNAT (`100.64.0.0/10`),
  IPv6 unique-local, NAT64 (`64:ff9b::/96`), and IPv4-mapped/-compatible IPv6
  addresses that decode to any of the above. The guard runs fresh on each
  hop, not just the first.
- **DNS-rebinding window (documented, residual).** Immediately before the
  actual network call, the guard re-resolves and re-classifies the same
  hostname and rejects if the fresh address set is disjoint from (or itself
  forbidden relative to) what was just vetted — this narrows, but does not
  close, the window between "we checked this address" and "the platform
  `fetch()` call resolves it again to actually connect." Fully closing that
  window would require pinning the connection to the exact vetted address via
  a custom HTTP dispatcher (e.g. undici) — out of scope under this project's
  zero-dependency constraint. See `src/fetcher.ts`'s `revalidateBeforeFetch`
  for the exact mechanics.
- **Gate-mode visibility.** See "Gate decisions are never invisible" above —
  the SSRF guard's own refusals (reason `ssrf`) surface through the same
  `guarded_fetch` error payload as any other refusal, and gate-mode's
  pre-fetch domain refusal (reason `gate_refused`) never makes a network call
  at all.

## Golden set & drift

> **Free-tier pacing:** the Vercel AI Gateway free window rate-limits Jev with a small, slowly-refilling quota — bursts make it worse. Run the checkpoint paced: `DRIFT_PACE_MS=60000 npm run drift` (~30 min for 25 items). Paid credits or OpenRouter remove the need for pacing.


```sh
npm run drift
```

Runs a live accuracy pass over `fixtures/golden/results.json` (~25 hand-labeled
real search results spanning docs, blogs, forums, and content-farm pages) and
compares it to a pinned baseline:

- **No live Jev key present** → exits **2** with a `BLOCKED ON KEY` message.
  Nothing is written.
- **First run** (no `fixtures/golden/baseline.json` yet) → runs accuracy,
  writes this run as the new baseline, and says so.
- **Rubric bumped since the baseline was written** (`RUBRIC_VERSION` in
  `src/judge.ts` differs from the baseline's) → exits **3** with explicit
  re-baseline instructions. This is deliberate: drift can't be measured
  across a rubric change, so it's never silently absorbed as "drift."
  Review the change, then delete `fixtures/golden/baseline.json` and re-run.
- **Otherwise** → prints a two-part report: accuracy vs. the hand labels, and
  per-item drift vs. the baseline (items whose relevance or credibility score
  moved by more than 0.25 are flagged drifted).

## Cost

| Scope | Cost |
|---|---|
| Per search (default `JEV_SCOUT_MAX_JUDGED=8`) | Up to 8 Jev calls — one per judged result (capped at `JEV_SCOUT_MAX_JUDGED`, cache hits make no call at all) ≈ $0.0001 total at the default cap |
| Per fetch | 1 Jev call (answered + content_class + steering_risk in one call), skipped on budget exhaustion |
| Per session (defaults: 300 calls / $0.05) | Capped at whichever limit fires first — the call cap, in practice |
| Dashboard | Free — it's a local static HTML page over SSE, no external calls |

`judge.ts` also defines `judgeQuery`/`on_task` (a query-level "is this search
on task for the goal" judgment) — it exists as a documented, tested part of
the `Judge` interface, but `pipeline.ts`'s `runSearch` does not currently call
it. No query-level Jev call happens per search today; the cost table above
reflects only the per-result and per-fetch calls the pipeline actually makes.

## Known jaggedness

Inherited from TypeSafe's own documentation of jev-1.13's failure modes:

- **Literal reading.** Rubric criteria name observable signals (exact-entity
  match, docs-domain patterns) rather than asking Jev to infer intent — this
  works with the model's jaggedness rather than against it, but it also means
  wording matters: any rubric change is a `RUBRIC_VERSION` bump.
- **Counting and dates stay in code.** Jev is not asked to count things or
  reason about dates — those checks (excerpt truncation length, TTL
  expiry) are ordinary code, never a Jev question.
- **Noisy state is filtered before it reaches Jev.** Only a small whitelist
  of fields (goal, query, title, snippet, domain, or a pre-truncated excerpt)
  is ever sent — never a whole page, never an arbitrary object.
- **Adversarial steering is narrowed, not eliminated.** Untrusted text
  (titles, snippets, page excerpts) is wrapped in explicit delimiters with an
  instruction that delimited content is data to score, never instructions to
  follow. This is a real mitigation against prompt injection from fetched
  pages, but it is not a guarantee — which is why `steering_risk` stays an
  advisory flag (shown before the content, never a hard block) rather than a
  gate.
