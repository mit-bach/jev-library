# system1 — field guide & playground

A single-page explainer and live playground for **System One models** — models that
answer *typed questions* (`noul`, `choice`, `score`) about application state and return
probabilities instead of prose.

**Live site:** https://luongnv.com/system1/

## What's inside

- **Playground first** — the hero *is* a live form: point it at any `/v1/systemone`
  endpoint, edit the state, build typed questions, inspect real probabilities.
  Boots on a review classifier (sentiment choice + recommend noul); presets load
  phishing and refund demos.
- What a System One model is, and how it differs from a general LLM
- When to use one (routing, detection, policy, triage) — and when not to
- The `POST /v1/systemone` request/response contract, annotated
- Rules for writing good questions + three worked examples
- Copy-paste curl / Python / JavaScript integration snippets

## Backends the playground speaks to

| Endpoint | Base URL | Auth | Model |
|---|---|---|---|
| Kev (local, OSS) | `http://localhost:8009/v1` | none | `kev-latest` |
| Ollama 0.35+ (local, Nimble) | `http://localhost:11434/v1` | none (needs `OLLAMA_ORIGINS`) | `nimble` |

Jev (TypeSafe's hosted model, `https://api.typesafe.ai/v1`, `jev-latest`) speaks the same
contract but its API rejects browser calls from other sites (`Disallowed CORS origin`), so it
isn't offered in the playground — call it from curl / Python / Node with `Authorization: Bearer KEY`.

Run a local Kev backend:

```bash
uv sync --extra serve   # in a clone of github.com/jaredpalmer/kev
python -m kev.serve --run jaredpalmer/kev-4b --port 8009
```

Or run Nimble on Ollama (0.35+ serves `/v1/systemone` natively; only Nimble/Tev models):

```bash
ollama pull nimble          # ~9 GB, 9B Q8_0
```

To call it from **https://luongnv.com**, Ollama must trust that origin — exactly
`https://luongnv.com` (no path, no trailing slash; comma-separate several):

| How Ollama runs | Set the origin |
|---|---|
| macOS app | `launchctl setenv OLLAMA_ORIGINS "https://luongnv.com"`, then quit & reopen Ollama (cleared on reboot) |
| Linux service | `sudo systemctl edit ollama.service` → `[Service]` / `Environment="OLLAMA_ORIGINS=https://luongnv.com"`, then `sudo systemctl daemon-reload && sudo systemctl restart ollama` |
| Windows | quit Ollama from the tray, `setx OLLAMA_ORIGINS "https://luongnv.com"`, start Ollama again |
| Terminal | `OLLAMA_ORIGINS="https://luongnv.com" ollama serve` |

Check it — a browser-style preflight should return `204` with
`Access-Control-Allow-Origin: https://luongnv.com` (a `403` means the variable wasn't picked up):

```bash
curl -i -X OPTIONS http://localhost:11434/v1/systemone \
  -H "Origin: https://luongnv.com" -H "Access-Control-Request-Method: POST"
```

The playground's **Setup guide** walks through all of this (per OS) and fills in the right origin
for wherever the page is served.

Browser gotchas:

- **Local network permission**: luongnv.com is HTTPS; calling `http://localhost` or a LAN IP from it
  makes Chrome/Edge 142+ ask once for local network access — click Allow (or re-enable it under the
  site-info icon → Local network access). Fallback: serve this page locally (`git clone` →
  `python3 -m http.server` → `http://localhost:8000`) — localhost pages need no permission and
  Ollama trusts them by default.
- **LAN access**: Kev and Ollama bind `127.0.0.1` by default — use `--host 0.0.0.0` /
  `OLLAMA_HOST=0.0.0.0:11434` to reach them from other devices. `kev.serve` allows every origin.

## Measured numbers cited on the page

From machine-local benchmarks ([m-bench](https://github.com/luongnv89/m-bench), DGX
Spark / GB10): Jev 98.0 % and Kev-27B 98.0 % on the `system1` suite (98 generations);
Jev, Kev-4B and Kev-27B all F1 1.000 on a 16-email adjudicated phishing corpus.

## License

MIT — see [LICENSE](LICENSE).
