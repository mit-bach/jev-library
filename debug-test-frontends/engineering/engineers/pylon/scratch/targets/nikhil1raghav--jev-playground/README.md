# jev-playground

Four toy projects built to test **[Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)** — TypeSafe's System One model. Unlike normal LLMs, Jev doesn't generate free-form text: you give it conditions and choices, and it returns the likelihood of each choice, computed in parallel. That makes it extremely fast and cheap for judgment calls inside applications.

**Two days of testing across all projects: ~9.1M tokens, ~9,300 requests — $0.35 total.**

## Projects

| Project | What it does |
|---|---|
| [`snake-2d/`](snake-2d) | Snake game steered by Jev — the game runs at full speed while Jev judgments (direction choice) arrive asynchronously every ~150 ms |
| [`todo-sorter/`](todo-sorter) | Sorts a real Todoist inbox into projects using Jev Choice judgments |
| [`HN-sort/`](HN-sort) | Fetches the Hacker News front page and re-ranks stories by "optimal for learning" using Jev |
| [`dangerous-dave/`](dangerous-dave) | Dangerous Dave (SDL2/C) with a Jev autopilot — the game streams state over UDP/WebSocket, Jev picks moves, an HTML dashboard shows live probability bars. Game logic based on [skoperst/deadly-dave](https://github.com/skoperst/deadly-dave) |

## Setup

1. Get early access to Jev: **https://typesafe.ai/blog/introducing-system-one-models-and-jev**
2. Create a `.env` file in this repo root:

   ```
   TYPESAFE_API_KEY=your-jev-key
   TODOIST_API_TOKEN=your-todoist-token   # only needed for todo-sorter
   ```

3. Each Node project loads the key from `../.env` (the repo root).

## Run

```bash
# Snake (http://localhost:3000)
cd snake-2d && npm install && node server.mjs

# HN re-ranker (http://localhost:3002)
cd HN-sort && npm install && node server.mjs

# Todoist inbox sorter (dry run, then apply)
cd todo-sorter && npm install && node sort.mjs        # preview
cd todo-sorter && node sort.mjs --apply               # actually move tasks

# Dangerous Dave + autopilot dashboard (http://localhost:8678)
cd dangerous-dave && make && node jev-pilot.mjs &     # pilot first
./ddave                                               # then the game
```

## Jev skill for coding agents

The official agent skill (teaches your coding agent the Jev / System One API — `choice()`, `noul()`, `TypeSafeClient`):

👉 **[typesafe-ai/skills · skills/typesafe-ai/SKILL.md](https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md)**
