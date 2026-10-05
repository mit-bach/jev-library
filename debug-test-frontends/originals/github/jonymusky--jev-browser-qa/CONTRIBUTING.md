# Contributing

Thanks for taking a look. This project is small on purpose; keep changes small too.

## Setup

```bash
pnpm install
pnpm exec playwright install chromium
cp .env.example .env   # fill AI_GATEWAY_API_KEY
pnpm typecheck
pnpm jev:smoke          # one gateway call, no browser
```

## Ground rules

- **Jev never generates.** It judges. If a change needs the model to write text, selectors, code or coordinates, it belongs in code or in a different model, not here.
- **Text entry stays deterministic.** `fill` is always a Playwright step. Do not add a step that lets the model type.
- **Every Jev call goes through `askJev()`** so telemetry, zero-data-retention and the model id stay in one place.
- **New step kinds** go in `src/flow.ts` (type), `src/cli.ts` (`executeStep`) and `skills/jev-qa/SKILL.md` (the table agents read). All three or none.
- Browser-side code passed to `page.evaluate` is kept as a string (see `src/jev/snapshot.ts`). tsx would otherwise inject a `__name` helper that does not exist in the page.

## Before opening a PR

```bash
pnpm typecheck
pnpm -s qa run flows/wrong-password.json --json   # needs a running app and a key
```

Conventional commit messages, please (`feat(cli): ...`, `fix(judge): ...`).
