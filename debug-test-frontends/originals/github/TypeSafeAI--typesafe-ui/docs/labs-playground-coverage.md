# Jev Labs expansion

## Goal and acceptance

Audit the UI and give Labs the component catalog's sidebar, Preview/Source, and Install/Import workflow. Include meaningful interactive Jev examples for every catalog example and every workspace/example family in TypeSafeAI/typesafe-playground. Preserve exact typed contracts, A/B changes, attribution, and clear local simulation boundaries. No provider calls or credentials are needed in this component library.

## Execution ledger

- [x] Inventory upstream main, canonical catalog, workspace routes, and additional example sets; pin provenance.
- [x] Define reusable Jev interface components and a complete coverage map.
- [x] Implement searchable grouped Lab navigation and Preview/Source/Install/Import parity.
- [x] Implement all catalog examples and workspace-specific interactive labs.
- [x] Verify every example, invalid/empty states, A/B variants, source/import/install, deep links, search, keyboard, mobile, themes, RTL, and reduced motion.
- [x] Run lint, typecheck, build, and browser checks; record evidence and limits.

Prior design changes are uncommitted and must be preserved. The sibling playground has unrelated dirty work; it is read-only reference material, with committed upstream main as the coverage baseline.

## Verification receipt — 2026-09-20

- Upstream: `9d3d990604c4680a397db813a9058bd40597cc67`; 110 canonical examples, 41 exact A/B mutations, 19 workspace routes. The local registry has 169 entries: 110 catalog + 56 workspace adaptations + 3 interface patterns. See [the coverage map](jev-labs.md#coverage-and-provenance).
- Root `pnpm lint`, `pnpm typecheck`, and `pnpm build` passed using the pinned pnpm 10.33.4. The final build has no broad source-tracing warning.
- `pnpm --filter web test:e2e --workers=2`: 72 passed, including exhaustive catalog/workspace runs, contract parity, local-only requests, mobile navigation, source/import state, invalid inputs, policy, ranking, rebuilds, and reduced motion.
- After that full run, the only runtime change was input direction (`ltr` for JSON, `auto` for text). Lint/typecheck/build passed again. Browser checks verified the corrected direction in RTL, keyboard tab selection, Enter navigation, and mobile drawer Escape/focus return.
- Inspected 1440px light/dark and RTL screenshots. Narrow Preview/Source/Import checks passed; the final production smoke at 320px RTL reported zero horizontal overflow, HTTP 200, a successful local preview, working Source/Import, and no page errors.
- Verification logs: `/tmp/typesafe-ui-labs-final-e2e.log` and `/tmp/typesafe-ui-labs-final-build.log`. Final screenshots: `/tmp/typesafe-jev-labs-{light,dark,rtl}-final.png` (RTL screenshot precedes the verified input-direction correction).

These are Chromium automation and visual inspection results, not human keyboard-only or screen-reader acceptance. Workspace previews intentionally adapt interfaces and fixture interactions; they do not run upstream providers, Z3, real games, browser agents, or business actions. No commit, push, or sibling-repository edits were performed.
