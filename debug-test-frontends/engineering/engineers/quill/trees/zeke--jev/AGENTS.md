# AGENTS.md

Research notes and a working demo for Jev (TypeSafe AI's structured decision model), accessed through Cloudflare AI Gateway.

## What's here

- `README.md` — research notes: what Jev is, what's unique about it, where it breaks, what people are building with it
- `example/` — a Cloudflare Worker with an interactive HTML UI ("Jev Triage Playground") that calls `typesafe/jev` via `env.AI.run()` through the default AI Gateway, renders probability bars/confidence, and computes a confidence-gated routing verdict client-side
- `example/sample-response.json` — a real captured response from a live call

## Stack

- Cloudflare Workers, TypeScript, Wrangler 4 (JSONC config, not TOML)
- AI binding (`env.AI`) with default AI Gateway (`gateway: { id: "default" }`)
- Model: `typesafe/jev` (third-party model on Cloudflare's Workers AI catalog)

## Running the example

```sh
cd example
npx wrangler types   # regenerate Env types after any wrangler.jsonc change
npx wrangler dev      # local
npx wrangler deploy   # deploy — no separate API key needed, uses AI Gateway unified billing
```

Worker name: `jev-triage-playground`. Live at **https://jev-triage-playground.ziki.workers.dev** (account: Sikelianos@gmail.com's Account). Tear down with `npx wrangler delete --name jev-triage-playground` if no longer needed.

Structure:
- `src/index.ts` serves the HTML/CSS/JS UI at `GET /`, and handles `POST /api/analyze`, which calls `env.AI.run("typesafe/jev", { state, questions }, { gateway: { id: "default" } })` with three fixed questions (department Choice, urgency Noul, frustration Score) and returns the Jev response plus measured latency.
- All rendering (probability bars, confidence tags, the confidence-gated verdict) happens client-side in vanilla JS embedded in the `PAGE` template string. No build step, no framework.
- The verdict logic mirrors the confidence-gating pattern from TypeSafe's own docs: confidence below 0.5 routes to a human, 0.5 to 0.8 (or borderline urgency) auto-routes with a flag, 0.8 and above auto-routes with no human needed. These thresholds are illustrative, not tuned on real data. See the "skeptical take" section in README.md before treating them as production defaults.

An earlier version of this demo (`jev-test`, plain JSON output) was deployed and then deleted in favor of this interactive one.

## Gotcha: stray Cloudflare env vars

This session had multiple `CLOUDFLARE_ACCOUNT_ID*` / `CLOUDFLARE_API_TOKEN*` variants set, and the bare `CLOUDFLARE_ACCOUNT_ID`/`CLOUDFLARE_API_TOKEN` did not match the OAuth-authenticated wrangler session (confirmed via `wrangler whoami`). Direct REST calls to `api.cloudflare.com` with those env vars returned `10000 Authentication error` / `1000 Invalid API Token`. Wrangler's OAuth session worked fine. When this happens again, unset the stray vars and use wrangler directly:

```sh
env -u CLOUDFLARE_API_KEY -u CLOUDFLARE_ACCOUNT_ID -u CLOUDFLARE_SUPERTOKEN -u CLOUDFLARE_API_TOKEN npx wrangler <command>
```

Or deploy a tiny Worker with the `AI` binding and call the model via `env.AI.run(...)` instead of hitting the REST API directly with a manually-supplied token.

## Jev API shape (for reference)

```ts
const response = await env.AI.run(
  "typesafe/jev",
  {
    state: "...",              // string, object, or array
    questions: {
      key: {
        type: "noul" | "choice" | "score",
        instructions: "...",
        criteria: { ... } | [ ... ],
      },
    },
  },
  { gateway: { id: "default" } }
);
```

Response includes `answers` (one entry per question, each with probabilities and confidence) plus `usage`.

## Self-updating

Update this file whenever the example project's structure, dependencies, or gotchas change. This file is for agents (technical/setup detail); `README.md` is for humans (what Jev is and why it matters).
