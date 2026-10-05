# Jev in Practice

A compact developer playground for demonstrating how TypeSafe AI's Jev model turns messy real-world context into typed, probabilistic decisions.

The app includes three configurable examples—fraud detection, sales qualification, and fictional patent screening—with Low, Medium, and High presets. State and Noul questions are editable JSON. The TypeSafe API key stays in the Node process and is never sent to the browser.

## Preview

### Editable evaluation workspace

![The high-fraud scenario with editable state and Noul questions](docs/images/fraud-workspace.png)

### Typed, probabilistic results

![Live Jev results for the high-fraud scenario](docs/images/fraud-results.png)

## Requirements

- Node.js 20 or newer
- A TypeSafe API key with Jev access

## Local development

```bash
cp .env.example .env
# Add TYPESAFE_API_KEY to .env
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to the Node server on port `8787`.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Production deployment

```bash
cp .env.example .env
# Add the production TYPESAFE_API_KEY to .env
npm ci
npm run build
NODE_ENV=production npm start
```

The production server listens on `0.0.0.0:8787` by default and serves both the compiled Vite application and `/api/evaluate`. Point your authenticated reverse proxy at `http://127.0.0.1:8787`. Authentication remains outside this application.

For a persistent process, run `npm start` through the server's existing systemd, Docker, or process-manager setup. Set `PORT` if `8787` is unavailable.

## Environment

| Variable | Required | Default |
| --- | --- | --- |
| `TYPESAFE_API_KEY` | Yes | — |
| `TYPESAFE_MODEL` | No | `jev-latest` |
| `TYPESAFE_API_URL` | No | `https://api.typesafe.ai/v1/systemone` |
| `PORT` | No | `8787` |

Do not use a `VITE_` prefix for the API key; Vite-prefixed variables are exposed to client code.

## API flow

The browser posts edited `state` and `questions` to `POST /api/evaluate`. The Node server validates the payload, adds the configured model, calls TypeSafe with the bearer key, and returns Jev's typed response plus server-measured duration.

Noul results are displayed using the probability of the selected answer. For example, a Noul value of `0.08` is presented as **NO — 92%, high confidence**, not as 8% confidence.

The patent example is fictional and supports triage only. It does not provide a legal opinion or determine infringement.
