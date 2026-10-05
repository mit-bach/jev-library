# Contributing to TypeSafe UI

Small, focused improvements are welcome: reusable components, clearer examples, accessibility fixes, and documentation corrections. This is an independent community project, not an official TypeSafe AI library.

Read [README.md](README.md) for setup and [AGENTS.md](AGENTS.md) for workspace conventions. Use the pnpm version pinned in `package.json` and install with `pnpm install --frozen-lockfile`.

## Scope a change

Keep reusable components in `packages/ui`; keep site-specific demos in `apps/web`. Add or update the registry entry, demo, displayed source, and import example together. Preserve Base UI composition, shared tokens, both themes, and RTL-aware layout. Review generated shadcn changes before committing them.

Do not bundle dependency upgrades, package publication, licensing changes, or new provider integrations into a component or documentation fix. Keep credentials and private data out of examples and screenshots.

## Add a Jev Lab

Read [Jev Labs](docs/jev-labs.md). Add its entry to `apps/web/lib/lab-registry.ts`, reuse the preview components under `apps/web/components/labs`, and keep source/import examples aligned. Preserve upstream IDs, exact question criteria, declared A/B changes, and the MIT attribution. Update the coverage map when refreshing the pinned playground revision. Keep local fixtures visibly distinct from provider results.

## Validate and submit

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm test:e2e
```

There is no root unit-test script. The E2E suite uses local Google Chrome, or bundled Chromium in CI. For visual changes, check desktop and narrow layouts, light/dark themes, RTL, keyboard focus, labels, and the Preview/Source and Install/Import tabs. Include screenshots or a short recording when helpful.

Open a focused pull request describing the change, the affected component or route, the checks actually run, and any unverified behavior. Do not call simulated UI state a live Jev result or claim checks passed when they were skipped.
