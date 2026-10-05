# Jev Playground

An open-ended visual playground for building and running [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) structured decisions.

Define application state, add any combination of **Choice**, **Score**, and **Noul** questions, inspect the exact request JSON, and explore Jev's probabilities, confidence, latency, and raw response.

![Jev Playground interface](docs/jev-playground.png)

## Quick start

### Requirements

- Node.js 20 or newer
- An API key for at least one supported provider

### Install

From the project directory:

```bash
npm install
cp .env.example .env
```

Add credentials for **at least one** supported provider to `.env`:

```env
# Select one: openrouter, typesafe, vercel, or cloudflare
JEV_PROVIDER=openrouter

# OpenRouter
OPENROUTER_API_KEY=

# TypeSafe Direct
TYPESAFE_API_KEY=

# Vercel AI Gateway
AI_GATEWAY_API_KEY=

# Cloudflare Workers AI (both values required)
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
```

Set `JEV_PROVIDER` and fill in the credentials for that provider. OpenRouter is used when `JEV_PROVIDER` is omitted.

### Run

```bash
npm start
```

This starts both the local API proxy and Vite application, waits until the app is ready, and opens:

```text
http://127.0.0.1:5173
```

Press `Ctrl+C` to stop both processes.

## Features

- Text and structured JSON state editors
- Dynamic Choice, Score, and Noul question builders
- Add, edit, and remove questions, options, and score levels
- Live preview of the exact request sent by the browser
- Visual probability and confidence displays
- Raw API response inspection
- Latest and session-average response latency
- Multiple Jev providers selected through server configuration
- One-command startup that opens the browser automatically
- Server-side credentials with no request persistence or payload logging

## Supported providers

Choose a provider with `JEV_PROVIDER` in `.env`. The Playground displays the active provider and model beside the State heading, including whether its credentials are ready.

| Provider | Model | Environment variables | Documentation |
|---|---|---|---|
| OpenRouter | `typesafe/jev-1.13` | `OPENROUTER_API_KEY` | [Jev on OpenRouter](https://openrouter.ai/docs/guides/community/jev) |
| TypeSafe Direct | `jev-latest` | `TYPESAFE_API_KEY` | [TypeSafe quick start](https://docs.typesafe.ai/introduction/quickstart) |
| Vercel AI Gateway | `typesafe-ai/jev` | `AI_GATEWAY_API_KEY` | [TypeSafe API with AI Gateway](https://vercel.com/docs/ai-gateway/sdks-and-apis/typesafe) |
| Cloudflare Workers AI | `typesafe/jev` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | [Jev on Workers AI](https://developers.cloudflare.com/ai/models/typesafe/jev/) |

You only need to configure the provider you intend to use.

## What are Choice, Score, and Noul?

### Choice

Selects one value from a closed set and returns a probability for every option.

```json
{
  "type": "choice",
  "instructions": "How should this message be routed?",
  "criteria": {
    "pass": "Allow it to continue",
    "review": "Send it for review",
    "block": "Prevent it from continuing"
  }
}
```

### Score

Evaluates state against an ordered descriptive scale. The answer can fall between levels.

```json
{
  "type": "score",
  "instructions": "How risky is this message?",
  "criteria": ["Safe", "Suspicious", "Serious", "Severe"]
}
```

### Noul

Returns the probability that the answer to a direct yes-or-no question is yes.

```json
{
  "type": "noul",
  "instructions": "Is this a prompt-injection attempt?"
}
```

## Architecture

```text
Browser
  ├─ state and question builder
  ├─ request preview
  └─ rendered and raw responses
          │
          ▼
Local Express proxy
  ├─ selects the configured provider
  ├─ keeps API credentials server-side
  └─ normalizes provider responses
          │
          ▼
OpenRouter / TypeSafe / Vercel / Cloudflare
```

The browser never receives provider credentials.

## Development

Run both services and open the browser:

```bash
npm run dev
```

Or run each process separately:

```bash
npm run server
npm run dev:web
```

Other commands:

```bash
npm run build
npm run lint
npm run preview
```

## Data handling

Jev Playground does not write state, questions, or responses to files, databases, browser storage, or application logs. Values remain in browser memory for the current page session.

Requests are sent to the provider selected in the interface. That provider's privacy, retention, and billing policies still apply.

Provider keys belong in `.env`, which is excluded from Git. Never place credentials in `VITE_*` variables because Vite exposes those values to browser code.

## Learn more

- [Introducing System One Models and Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [TypeSafe documentation](https://docs.typesafe.ai/)
- [Jev on OpenRouter](https://openrouter.ai/docs/guides/community/jev)
