# Moderation Guard — TypeSafe Jev demo

Text moderation demo: one TypeSafe `systemOne` call screens 7 Noul hazards + 1 severity Score in parallel. Verdict computed in code via policy thresholds.

## Run

```sh
bun install
cp .env.example .env.local   # add TYPESAFE_API_KEY (optional — mock mode without it)
bun dev
```

Open http://localhost:3000.

## API

`POST /api/moderate` `{ "text": "...", "policy": "strict" | "permissive" }`

- Max 1000 chars, 10 req/min per IP (in-memory; use Redis for multi-instance prod).
- Without `TYPESAFE_API_KEY` returns keyword-heuristic mock with `mock: true`.
- With key: live Jev (`jev-latest`) via `@typesafe-ai/sdk`, server-side only.

## Deploy (Vercel)

```sh
vercel --prod
# set TYPESAFE_API_KEY in Vercel env vars
```

## Tune

Edit `lib/moderation.ts`: `HAZARDS`, `POLICIES`, `route()`. Thresholds should be fit on labeled traffic, not taken as universal.
