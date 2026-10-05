# Scope

This file is the shared rule for the 2026-10-02 Jev debug-and-test shelf. A mission that names this path makes it authority for that child.

## What this shelf is

Jev is TypeSafe AI's System One model. The official request in the 2026-10-01 docs snapshot is `POST https://api.typesafe.ai/v1/systemone`. You send a state and typed questions. You get structured answers and probabilities. Jev does not write the page, write the test, or replace the coding model.

The operator is building a system that uses Jev and will debug and test that system. This shelf collects tools a person can open for that work.

## In

A project is in when its job is one of these:

- A frontend, desktop window, or local page where a person edits a Jev state and questions and sees the typed answer, the probabilities, and the raw request.
- A dashboard, HTML report, or trace viewer for Jev decisions, test runs, or browser steps.
- A browser or frontend test loop where Jev judges the page or picks the next action, and the project leaves evidence a person can open: video, screenshot, trace, probability, or a report.
- An eval harness or fixture format a builder would rerun while debugging question design, with a CLI or a UI, and with the cases in the repo.

## Out

Leave these out of the kept set. You may name one in a sentence if a seed turned out to be one of them.

- A Jev application whose job is mail, hiring, trading, games, or another product, unless that repo also contains a reusable debug or test UI. If it does, keep only the UI.
- An awesome-list as a kept tree. Mine the list for links. Do not clone the list as a product.
- A third-party door that only resells a playground (`jevtypesafeai.com`, `thejevai.com`, `jevmodel.org`). One short note on the request shape is enough. Do not treat that host as TypeSafe.
- Anything already cloned for the 2026-10-01 library. Do not clone it again. If it matters, cite the path:
  - `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/originals/github/WillKelly-jev-evaluation`
  - `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/originals/github/system-one-adapter-python`
  - `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/corpus/05-examples-repos-and-outputs/cobble/trees/`
- The closed desk `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/engineering/`. Do not open it.

## How you take a project

Open the code that draws the answer or the report. A README sentence is not enough for a kept project. Name the file and the symbol.

Record the commit from `git rev-parse HEAD` or from the GitHub commit API. Record the license, the default branch, and the `pushed_at` date from the API.

Say which door the code posts to. Official is `https://api.typesafe.ai/v1/systemone`. OpenRouter, Vercel AI Gateway, and any other host are different doors. Quote the URL from the source file.

Say whether the page can run on recorded fixtures with no key. Say whether the repo's own tests exist, and name the test file. Do not call the live Jev API. Do not spend a key.

If GitHub reports `size` over 50000 (that field is kilobytes), do not full-clone. Take the README, the UI entry, and the test listing through the API or raw URLs.

The parent may already have a shallow clone at `/Users/dominikbach/olympus/GROK/GROK-ARCHIVES/JEV-library/debug-test-frontends/originals/github/<owner>--<repo>`. If that directory contains `.git`, read it and do not clone a second copy. Do not write in `originals/`. If the clone is absent, shallow-clone into your own `trees/` directory.

Do not copy a secret. If a committed env file holds a real-looking key, say that a secret is committed and omit the value. Placeholder names in `.env.example` are fine to name.

A grade in your survey is evidence for the parent. It is not the shelf's final judgment.

- **use** — a person debugging a Jev system should open this. You opened the UI or report code and it shows the decision, not a mock screenshot only.
- **study** — the idea is worth keeping and the code is thin, mock-only, unofficial, or hard to run.
- **skip** — it is not a debug or test tool, or the UI is a stub.

Stars are a hint that people looked. Stars are not the grade.
