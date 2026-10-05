# jev-trace

**Generate a reviewable requirements-to-code-and-tests matrix, with uncovered clauses, orphan artifacts and exact change impact.**

[![Tests](https://github.com/gbesse/jev-trace/actions/workflows/test.yml/badge.svg)](https://github.com/gbesse/jev-trace/actions/workflows/test.yml) ![MIT](https://img.shields.io/badge/license-MIT-blue) ![Node](https://img.shields.io/badge/node-22%2B-green) ![Public alpha](https://img.shields.io/badge/status-public_alpha-orange)

## 30-second offline quick start
`git clone https://github.com/gbesse/jev-trace.git && cd jev-trace && npm install && npm run demo` uses synthetic matches.

## Call real Jev
Set `TYPESAFE_API_KEY` before a reviewed adapter sends paid candidate-pair requests to `api.typesafe.ai`. The alpha adapter is unwired; `npm run live-smoke` makes zero calls.

## Library and integration
Import clause parsers, artifact splitting, `retrieve`, `questions`, `matrix`, `impact`, `check`, and `htmlReport`. Commit the resulting matrix so human review is a diff.

## How it decides
Identifiers, configured path hints and token overlap retrieve bounded candidates. Source artifacts receive an implements question; tests separately receive implements and verifies questions. Coverage is exactly the share of clauses with one accepted match, never a quality measure. Hash changes identify cells to re-review without inference.

## Boundaries
An accepted relation is retrieval/judgment assistance—not proof of correct implementation. A person signs the matrix. Splitting is deliberately language-agnostic and partial. CSV writing, CLI/git invocation and live provider remain unwired in this alpha. No benchmark is claimed.

## Shareable demo report

Run `npm run demo:report` to capture this repository’s bundled example as one JSON object with the project purpose, version and complete demo output. The command fails if the demo fails, so the report is useful when sharing a reproducible first look or reporting unexpected behavior. The bundled demo’s data and safety boundaries still apply.

## Validation
Run `npm run check && npm run typecheck && npm test && npm run demo`; CI uses Node 22 and 24.

## Related projects
[DecisionPacks](https://github.com/gbesse/decisionpacks), [Question Forge](https://github.com/gbesse/question-forge), and [jev-codebook](https://github.com/gbesse/jev-codebook).

Independent project; not affiliated with TypeSafe AI. [API docs](https://docs.typesafe.ai/api) · [model notes](https://docs.typesafe.ai/model-jaggedness/jev-1.13/)
