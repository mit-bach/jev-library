# jevqa

Test web and mobile apps by writing the steps in plain English.

You write a checklist, run one command, and watch your app get tested while the checklist ticks off. Each step ends as Passed, Failed, or Needs review, along with the evidence that decided it.

> **Status:** early development. `jevqa run` works for web apps at desktop size, run from this repo. It is not on npm yet. See [the roadmap](docs/ROADMAP.md) for progress.

## How it works

1. You write a test file in Markdown. Each list item is one step.
2. jevqa opens your app in a real browser (or, later, a phone emulator).
3. For each step it reads what is on screen and asks [Jev](https://console.typesafe.ai), a model from TypeSafe AI, a narrow question such as "which button matches Continue?"
4. Jev answers with a probability. jevqa's own code turns that number into an action or a verdict.

jevqa reads what your app shows on screen, never its source code. So it works with any framework that renders to a browser or a native screen.

## A test file

```md
---
target: web
devices: [desktop]
---

- Open /login
- Type "{{env.TEST_EMAIL}}" into the email field
- Type "{{env.TEST_PASSWORD}}" into the password field
- Tap "Sign in"
- Check the dashboard shows
```

- Quoted text is used exactly as written.
- `{{env.NAME}}` pulls a value from your environment.
- Values you mark as secret are hidden in logs, reports, and anything sent to a model.

## Usage

Start your app, then point jevqa at it in `jevqa.config.ts`:

```ts
import { defineConfig } from 'jevqa';

export default defineConfig({
  baseUrl: 'http://localhost:3000',
  secrets: ['TEST_EMAIL', 'TEST_PASSWORD'],
});
```

You need a Jev API key from [console.typesafe.ai](https://console.typesafe.ai). Put it in a `.env` file:

```sh
TYPESAFE_API_KEY=your-key-here
```

Then build and run:

```sh
pnpm install && pnpm build
pnpm exec jevqa run                 # run every test file in tests/
pnpm exec jevqa run tests/tour.md   # run one test file
pnpm exec jevqa run --headed        # show the browser window
```

Each step prints its verdict as it runs. The command exits with code 1 if a step failed or was skipped. Everything that happened is saved to `.jevqa/runs/<run id>/run.jsonl`.

`npx jevqa init` and installing from npm are planned for later phases.

## Docs

- [Architecture](docs/ARCHITECTURE.md): how jevqa works inside, and what every package does.
- [Roadmap](docs/ROADMAP.md): what is done, what is in progress, and what comes next.

## Contributing

jevqa is at an early stage. The architecture doc is the best place to start. Issues and ideas are welcome.

You need Node 24 or newer and pnpm 10.

```sh
pnpm install     # install dependencies
pnpm build       # compile every package
pnpm test        # run the tests
pnpm lint        # check the code, including which packages may import which
pnpm format      # format every file
```

The code lives in `packages/`, one folder per package:

| Package   | What it does                                                  |
| --------- | ------------------------------------------------------------- |
| `core`    | Shared rules and types used by every other package.           |
| `drivers` | Controls devices: Playwright for web, Appium for native apps. |
| `judge`   | Asks Jev questions.                                           |
| `runner`  | Runs test files step by step and writes the event log.        |
| `server`  | Sends live run events to the harness page.                    |
| `ui`      | The harness page.                                             |
| `cli`     | The `jevqa` command.                                          |
