# JEV Bot

A self-hosted **Feishu bot + web decision workbench** powered by TypeSafe Jev. Ask a question, compare options and their probabilities, or experiment with writing by repeatedly choosing the next word or character.

[中文部署说明](bot/README.md) · [TypeSafe API](https://docs.typesafe.ai/) · [License](LICENSE)

## Features

- **Automatic decisions:** a text model turns a question into 2–5 concrete alternatives; Jev independently chooses among them. Every candidate is shown and can be edited.
- **Manual choices:** supply 2–8 options and receive a probability distribution directly from Jev. No extra “unknown / none” option is inserted.
- **Word writing (experimental):** choose a function word or letter bucket, then a complete word. Default temperature 0.7; selectable greedy decoding. No EOS or model-driven stop; default 24 words/punctuation, up to 48 on the web.
- **Character writing (experimental):** choose the highest-probability character from a–z and space. Original mode retained, up to 64 characters.
- **Feishu:** private messages and group @mentions, per-user guided input, cancellation, durable event deduplication, probability cards.
- **Web:** dark responsive UI, editable options, copy results and in-page history. Browser keys and history are cleared on reload.

Writing remains an experiment: outputs may repeat, be ungrammatical, or factually wrong. It is a finite-vocabulary decision loop, not a general chat model. Probability is a model preference among candidates, not proof of correctness.

## Quick start

Requires **Node.js 22.22+** and npm. No frontend build step.

```sh
git clone https://github.com/nssmd/jev-bot.git
cd jev-bot
npm ci
cp .env.example .env
chmod 600 .env
npm start
```

Open http://localhost:8787 and connect your TypeSafe key from https://console.typesafe.ai/keys . For a Jev-only setup select **手动选择** or **写作**. Automatic decisions require the additional configuration below.

### Automatic candidate generation

In `.env`, set `STRUCTURER_URL`, `STRUCTURER_MODEL`, `STRUCTURER_KEY`, and `STRUCTURER_ALLOWED_KEY`. The last value is the TypeSafe key authorized to invoke your paid text backend; use the same key in the browser or bot. This prevents arbitrary visitors from consuming the text model using unrelated credentials.

The text backend must support the OpenAI **Responses API**, JSON-object output, and the configured reasoning setting. `STRUCTURER_REASONING` defaults to empty (omitted); use `low` for compatible reasoning models. The text model proposes candidates only; Jev supplies the decision and probabilities. Automatic mode is limited to 30 requests per minute per server process. Request content is sent to both providers.

### Feishu

Configure `FEISHU_APP_ID`, `FEISHU_APP_SECRET`, `FEISHU_BOT_OPEN_ID`, `TYPESAFE_API_KEY` and `FEISHU_ALLOWED_USERS`. Set the latter to `*` if all users in the app's Feishu availability range should be allowed. Group messages still require an @mention of this bot.

```sh
npm run bot
```

The backend and bot are separate processes. Detailed app permissions and event setup: [bot/README.md](bot/README.md).

```text
@JEV 明天需要去实验室吗？
背景：上午有必须现场操作的实验。
```

```text
@JEV 明天怎么安排？
A. 上午去，下午远程
B. 全天去实验室
背景：上午有实验，下午可以远程。
```

```text
@JEV 写作 Write a short sentence about a robot
@JEV 停止
```

Without user-supplied options, questions use automatic mode. `帮助` displays the menu. `/judge`, `/choose`, `/write` are also recognized as text; optional native slash commands must be registered in your own app.

## Deployment

Run behind HTTPS and configure `PUBLIC_URL` / `ALLOWED_ORIGINS` with your actual origin. Set `JUDGE_URL` if the bot connects on a nondefault address. Origins must not end in `/`. The `Origin` allowlist is a browser check, not user authentication; the paid upstream APIs still require keys. Use a process manager to restart the two services. Keep `runtime/bot-events/` persistent across restarts to preserve deduplication.

Docker example:

```sh
docker compose up -d --build web
# After filling in the Feishu variables:
docker compose --profile bot up -d
```

This is a Node application, not a static-only site. Keys are forwarded through the backend because browser CORS access to TypeSafe may not be enabled. Backend code does not log credentials, prompts or responses. Local `.env` secrets are stored as configuration; do not publish them. Avoid request-body logging in your reverse proxy. Web history stays only in page memory. The bot stores message IDs and processing states, not message bodies; guided input is held in memory for up to 10 minutes.

## Tests

```sh
npm test
npx playwright install --with-deps chromium
npm run test:browser
```

Automated tests use mocked model responses and send no Feishu messages. They cover routing, validation, candidate generation, rendering/XSS handling, deduplication, mentions, cancellation and decoding. An optional GitHub Actions template in `ci/github-actions.yml.example` runs both suites. Copy it to `.github/workflows/test.yml` using a GitHub credential with workflow permissions.

Scripts under `scripts/` cover real API experiments, recordings and manual card delivery. **Live scripts use paid APIs**; `send-bot-menu.mjs` and `test-bot-card.mjs` send a message to `TEST_USER_OPEN_ID`. Set it deliberately. Scripts use environment variables; no credentials or private recipients are embedded. Artifacts and recordings are ignored by Git. `record-demo.mjs` records UI only, with no API request. `record-live.mjs` records actual model calls and preserves responses without authorization headers.

## Source map

| Path | Purpose |
| --- | --- |
| `gateway.mjs`, `server.mjs` | API validation, routing, bounded upstream calls and static server |
| `structurer.mjs` | Optional question-to-options text model |
| `word-decoder.mjs`, `word-inventory.json` | Word-level decision loop and vocabulary |
| `public/` | UI, word/character loops, styling |
| `bot/` | Feishu long connection, message parser and cards |
| `tests/` | Unit/integration and browser tests |
| `scripts/` | Reproduction, recording and deployment helpers |

The repository includes the current implementation, tests, deployment templates and utilities. It does not bundle credentials, personal app IDs, live journals, historical private release copies, dependency installs or model weights. See [THIRD_PARTY.md](THIRD_PARTY.md) for the inspirations and inventory provenance.
