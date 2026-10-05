# Using jev-browser-qa from Grok Build

[Grok Build](https://docs.x.ai/build/overview) is xAI's terminal coding agent. It reads Agent Skills from `./.grok/skills/` (walked up to the repo root) and `~/.grok/skills/`, plus `~/.agents/skills/`, and it reads `AGENTS.md` and Claude Code instruction files. This repository ships the `jev-qa` skill in all of those locations, so inside the repo Grok Build needs no setup.

## 0. The shortcut: the QA Engineer bot

If you would rather not set anything up, use the shared Grok bot **[QA Engineer](https://x.ai/bot/IoOXnqvhpn4i_C1TNq9P_)**. It comes with the `jev-qa` skill loaded and does one thing: run browser QA flows with Playwright + Jev and return pass/fail with the video and the screenshot. Tell it the URL of the app and the flow you want verified. The steps below are for running the same thing from your own Grok Build install.

## 1. Install Grok Build

```bash
curl -fsSL https://x.ai/cli/install.sh | bash
export XAI_API_KEY="xai-..."
```

## 2. Give it the skill

Inside this repository nothing is needed: `.grok/skills/jev-qa` is already here.

To use the CLI from another project, install the skill there (the `skills` CLI knows Grok Build as the `grok` agent) and tell the skill where this repository lives:

```bash
npx skills add https://github.com/jonymusky/jev-browser-qa --skill jev-qa --agent grok
export JEV_QA_DIR=/path/to/jev-browser-qa
```

Or globally, once, for every project:

```bash
npx skills add https://github.com/jonymusky/jev-browser-qa --skill jev-qa --agent grok --global
```

## 3. Prepare the QA project

```bash
cd /path/to/jev-browser-qa
pnpm install && pnpm exec playwright install chromium
cp .env.example .env     # AI_GATEWAY_API_KEY, BASE_URL, QA_EMAIL, QA_PASSWORD
pnpm jev:smoke
```

Credentials stay in that `.env`. Flows reference them as `${QA_EMAIL}` and `${QA_PASSWORD}`; the CLI substitutes them, so the agent never handles the values.

## 4. Ask Grok Build to test something

Interactive:

```
grok
> Use the jev-qa skill to test the login flow of the app at http://localhost:3000.
> Report status, the failing step if any, and the video and final screenshot paths.
```

Headless, for scripts and CI:

```bash
grok -p "Use the jev-qa skill. Run the flow at flows/login.json against http://localhost:3010 and summarize the JSON result: status, failing step, video path." --output-format streaming-json
```

What the agent runs under the hood:

```bash
pnpm --dir "$JEV_QA_DIR" -s qa run --steps '[
  {"goto": "/auth/login"},
  {"fill": "#email", "value": "${QA_EMAIL}"}, {"press": "#email", "key": "Enter"},
  {"waitForSelector": "#password"},
  {"fill": "#password", "value": "${QA_PASSWORD}"}, {"press": "#password", "key": "Enter"},
  {"waitForUrl": "!/auth/login"},
  {"expect": "The user is signed in and sees the main application navigation."}
]' --name login --json
```

## Tips

- Grok Build's plan-first loop pairs well with the CLI: let it plan the flow as JSON, review the steps, then let it run.
- Keep `--base-url` explicit when testing a branch on a different port or a preview URL.
- The run also appears in the dashboard (`pnpm dashboard`, http://localhost:4310), so a human can watch the video afterwards.
- Every Jev call is recorded with latency and tokens in the result's `jev` field; an agent can quote it in its summary.
