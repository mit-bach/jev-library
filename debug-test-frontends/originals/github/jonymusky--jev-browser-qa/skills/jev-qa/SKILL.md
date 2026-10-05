---
name: jev-qa
description: Run end-to-end browser QA flows with the jev-qa CLI. Playwright drives and records the browser; TypeSafe Jev (via Vercel AI Gateway) judges natural-language assertions, picks controls by intent and drives bounded click loops. Use when asked to test a web flow in a real browser, verify a UI change, reproduce a bug visually, or produce a pass/fail verdict with a video and a final screenshot. Returns machine-readable JSON.
---

# jev-qa: browser QA flows judged by Jev

The CLI is the `qa` script of the jev-browser-qa repository. This skill works in Claude Code, Codex, Cursor, Grok Build and any Agent Skills host. When the current directory is not that repository, resolve it from the `JEV_QA_DIR` environment variable (ask the user for the path if it is unset) and run:

```bash
pnpm --dir "$JEV_QA_DIR" -s qa run <flow.json> --json
pnpm --dir "$JEV_QA_DIR" -s qa run --steps '<json array>' --name <flow-name> --json
pnpm --dir "$JEV_QA_DIR" -s qa steps      # prints the step schema
```

- `--json` keeps stdout clean: the only output is the result JSON. Progress goes to stderr.
- Exit code: `0` passed, `1` failed, `2` usage or configuration error.
- `--base-url <url>` overrides the target (default: `BASE_URL` in the project's `.env`, usually `http://localhost:3000`). `--headed` shows the browser.
- Credentials and the gateway key are read from that project's `.env` (`AI_GATEWAY_API_KEY`, `QA_EMAIL`, `QA_PASSWORD`). Reference them in steps as `${QA_EMAIL}`; never paste secrets into a flow.

## Writing a flow

A flow is `{ "name": string, "baseUrl"?: string, "steps": Step[] }`. One key per step, executed in order; the first failure skips the rest.

| Step | Who executes | Use for |
|---|---|---|
| `{"goto": "/path"}` | Playwright | navigate (relative to base URL) |
| `{"fill": "<selector>", "value": "..."}` | Playwright | type text. **Text entry is always deterministic**, never delegated to Jev |
| `{"press": "<selector>", "key": "Enter"}` | Playwright | submit forms |
| `{"clickSelector": "<selector>"}` | Playwright | click when a stable selector is known |
| `{"click": "<intent in plain language>"}` | Jev picks among visible controls | click when you know *what*, not *which selector* ("the button that creates a new job position") |
| `{"expect": "<claim>", "threshold"?: 0.7, "criteria"?: {"true": "...", "false": "..."}}` | Jev judges | assert an expected result the way a QA engineer would state it |
| `{"goal": "<goal>", "maxSteps"?: 8, "denyNames"?: ["regex", ...], "allowNames"?: [...]}` | Jev chooses each click/scroll | reach a screen without knowing the path. Always deny destructive controls |
| `{"waitForUrl": "!/auth/login", "timeoutMs"?: 30000}` | Playwright | `!` prefix waits until the URL no longer contains the text |
| `{"waitForSelector": "<selector>"}` | Playwright | wait for an element to be visible |
| `{"wait": 1500}` | Playwright | fixed pause (last resort) |
| `{"screenshot": "name"}` | Playwright | extra PNG at `artifacts/flows/name.png` |

Rules for good flows:
1. Start with `goto`. For authenticated flows, reuse the login prefix from `flows/login.json` in the repository (adapt selectors to the app under test).
2. One `expect` per claim. Phrase claims as observable outcomes ("A list of job positions is displayed, or an empty state inviting to create the first one"). Add `criteria` when the claim is subtle. Jev only sees text and the aria tree, not pixels.
3. Prefer `click` (intent) over `clickSelector` unless the selector is stable (`#id`, `name=`). Prefer explicit steps over `goal`; use `goal` for exploratory navigation and always pass `denyNames` such as `["cerrar sesi", "logout", "eliminar", "delete", "guardar", "save"]`.
4. After any action that navigates, add a `waitForUrl` or `waitForSelector` before the next `expect`.
5. Save reusable flows under `flows/` in the jev-browser-qa project; use `--steps` for one-off checks.

## Reading the result

```json
{
  "status": "passed" | "failed",
  "finalUrl": "...",
  "video": "/abs/path/artifacts/flows/<runId>/video.webm",
  "finalScreenshot": "/abs/path/artifacts/flows/<runId>/final.png",
  "steps": [{ "index": 0, "step": {...}, "status": "passed|failed|skipped", "ms": 1077, "probability": 0.96, "error": "..." }],
  "jev": { "calls": 3, "inputTokens": 2100, "apiMs": 2400 }
}
```

- Report the verdict, the failing step (its `error` and `url`), and the paths of `video` and `finalScreenshot`. Read the PNG to describe what the page showed.
- A failed `expect` reports Jev's probability against the threshold. A probability near the threshold is a signal to sharpen the claim or add `criteria`, not to lower the threshold.
- A `click` that fails with `NONE` means no visible control matched the intent: check the final screenshot, the page may not have loaded or the intent may name a control that is not on screen.
- Every run also appears in the local dashboard: `pnpm --dir "$JEV_QA_DIR" dashboard` then open http://localhost:4310.

## Example: verify a bug fix end to end

```bash
pnpm --dir "$JEV_QA_DIR" -s qa run --name "billing-banner" --json --steps '[
  {"goto": "/auth/login"},
  {"fill": "#email", "value": "${QA_EMAIL}"}, {"press": "#email", "key": "Enter"},
  {"waitForSelector": "#password"},
  {"fill": "#password", "value": "${QA_PASSWORD}"}, {"press": "#password", "key": "Enter"},
  {"waitForUrl": "!/auth/login"},
  {"click": "the navigation entry that opens settings"},
  {"click": "the billing or subscription tab"},
  {"expect": "A billing section shows the current plan and a way to manage payment", "criteria": {"false": "A loading shell, an error, or no billing information is shown"}}
]'
```
