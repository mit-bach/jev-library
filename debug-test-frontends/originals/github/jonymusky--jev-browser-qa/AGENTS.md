# Instructions for coding agents

This repository is **jev-browser-qa**: browser QA flows where Playwright drives and records the browser and TypeSafe Jev judges. Read `skills/jev-qa/SKILL.md` before writing or running a flow; it is the contract for the CLI, the step schema and how to read a result. The same file is linked from `.agents/skills/`, `.claude/skills/` and `.grok/skills/`, so Claude Code, Codex, Cursor, Grok Build and other Agent Skills hosts pick it up automatically.

## Commands

```bash
pnpm install && pnpm exec playwright install chromium   # once
pnpm jev:smoke                       # one Jev call, no browser: checks AI_GATEWAY_API_KEY
pnpm -s qa run <flow.json> --json    # run a flow, JSON result on stdout, exit 0/1/2
pnpm -s qa steps                     # step schema
pnpm test                            # Playwright suite in tests/, video on
pnpm dashboard                       # http://localhost:4310
pnpm typecheck
```

## Rules

- Credentials live in `.env` (`AI_GATEWAY_API_KEY`, `QA_EMAIL`, `QA_PASSWORD`). Reference them in flows as `${QA_EMAIL}` placeholders. Never write literal secrets into a flow, a test, a commit or a chat reply.
- Jev judges; it never generates. Do not add steps that let the model type text, write selectors or plan freely. Text entry stays deterministic (`fill`, `press`).
- Prefer `click` by intent over `clickSelector`, and explicit steps over `goal`. Always pass `denyNames` to `goal` (logout, delete, save, and their Spanish equivalents).
- After a run, report the verdict, the failing step with its `error` and `url`, and the absolute paths of `video` and `finalScreenshot`. Read the PNG and describe what the page showed.
- A new step kind touches three files together: `src/flow.ts`, `src/cli.ts` (`executeStep`) and `skills/jev-qa/SKILL.md`.
- Code passed to `page.evaluate` stays a string (see `src/jev/snapshot.ts`); tsx would otherwise inject a `__name` helper that does not exist in the page.
- Run `pnpm typecheck` before committing. Conventional commit messages.
