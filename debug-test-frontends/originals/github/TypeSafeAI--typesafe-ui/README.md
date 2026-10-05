# TypeSafe UI

Reusable React components and interactive interface patterns for TypeSafe AI projects, built with shadcn/ui, Base UI, and Tailwind CSS.

**Small parts. Clear interfaces.** This is an independent community project under `TypeSafeAI`, not an official TypeSafe AI component library or SDK. The community organization was created by VC Moderator [@BunsDev](https://github.com/BunsDev).

[Developer guide](docs/discovery/README.md) · [Contributing](CONTRIBUTING.md) · [Agent instructions](AGENTS.md) · [Jev Labs](docs/jev-labs.md) · [Official API documentation](https://docs.typesafe.ai/introduction/quickstart)

![TypeSafe UI: an unofficial community component workspace](docs/discovery/assets/social-preview.svg)

## What is here

A Turborepo and pnpm workspace with a Next.js component browser, source previews, install/import examples, and an interactive Lab. It uses the shadcn `base-nova` style, Base UI primitives, Tailwind v4, and RTL-aware components. The interface supports light/dark themes and TypeSafe-inspired pink/teal styling.

`@workspace/ui` is a **private workspace package**, not a published npm package. Imports work inside this monorepo. For another application, deliberately port the components, styles, dependencies, and aliases you need; do not assume `npm install typesafe-ui` or a hosted registry exists.

The Jev Labs guide describes the upstream catalog examples, workspace scenarios, and interface patterns. Outputs in these previews are local fixtures. A visual live-state indicator is not proof of a Jev API call.

## Run locally

Use the exact pnpm version declared in [package.json](package.json). The manifest declares Node.js `>=20`; use a version supported by the checked-in Next.js dependency as well. Node.js 22+ is a practical development baseline.

```sh
git clone https://github.com/TypeSafeAI/typesafe-ui.git
cd typesafe-ui
# Activate the pnpm version declared in package.json.
# Corepack can enable package-manager shims where it is installed.
pnpm install --frozen-lockfile
pnpm dev
```

Open the address printed by the development server, normally `http://localhost:3000`. The library is at `/` and the interactive scenes are at `/lab`. Press `d` to toggle dark mode and `Cmd+K` to search components. No provider credentials are needed to browse local fixtures.

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run the web application through Turborepo |
| `pnpm build` | Build the workspace |
| `pnpm lint` | Run workspace lint tasks |
| `pnpm typecheck` | Run workspace TypeScript checks |
| `pnpm test:e2e` | Run Playwright browser checks |
| `node --test scripts/social-metadata.test.mjs` | Check sharing-source invariants without installing dependencies |
| `pnpm format` | Format source files; this writes changes |

There is no root `pnpm test` script. The E2E suite uses local Google Chrome, or bundled Chromium in CI. Source checks do not prove that a deployed image loads, and browser automation does not establish complete accessibility.

## Project map

```text
apps/web/
  app/                 routes, layout, fonts, and social metadata
  components/          shell, component cards, previews, and Lab scenes
  lib/                 site configuration, registries, source loader, and shiki
packages/
  ui/                  @workspace/ui components, hooks, utilities, and styles
  eslint-config/       shared lint configuration
  typescript-config/   shared TypeScript configuration
```

## Add a component or lab

1. Add a component against the web app; the shadcn configuration places reusable components in `packages/ui/src/components`.

   ```sh
   pnpm dlx shadcn@latest add popover -c apps/web
   ```

   This is a generator operation that can modify source and dependencies. Review its complete diff and lockfile changes; it is not a read-only command.

2. Register the component in `apps/web/lib/registry.ts` with its ID, group, description, exports, and supported states.
3. Add its demo using the same ID in `apps/web/components/demos.tsx`.
4. Verify preview, displayed source, imports, keyboard behavior, themes, narrow layout, and RTL.

For a Jev Lab, follow [the Lab guide](docs/jev-labs.md) and preserve upstream IDs, declared A/B differences, local-fixture labels, and attribution. The library reads component source at build time and highlights it with shiki; keep registry IDs, source paths, exports, and demos aligned.

## Use components

```tsx
import { Button } from "@workspace/ui/components/button"
```

Base UI triggers compose through `render`, rather than Radix-style `asChild`. A Button rendered as a link needs `nativeButton={false}`. Keep provider credentials and application-specific network clients out of reusable client components.

## Themes and RTL

Tokens live in `packages/ui/src/styles/globals.css`: light values in `:root` and dark values in `.dark`. TypeSafe-oriented tokens include `--teal`, `--success`, `--warning`, and `--dot`. Fonts are wired through `next/font` in `apps/web/app/layout.tsx` and exposed as `--font-sans` and `--font-mono`.

Site identity, links, navigation, language, and direction live in `apps/web/lib/site.ts`. The shadcn configuration has `rtl: true`. Set `dir` and `lang` deliberately for a locale, preserve DirectionProvider, and prefer logical CSS properties.

## Sharing and screenshots

`apps/web/app/opengraph-image.tsx` renders a public editorial PNG. Twitter metadata uses the same route. Verify the rendered tags and image response after building and deploying; do not claim production publication from a source diff alone. The SVG shown above is editable artwork, not an application screenshot.

The [developer guide](docs/discovery/README.md) links publishing and screenshot protocols. Use synthetic local previews, keep fixture labels visible, and record the source revision, viewport, theme, direction, and capture environment. Review media for private data. `repository-metadata.json` documents proposed About text/topics; it does not apply GitHub settings.

## Related community projects

| Repository | Role |
| --- | --- |
| [typesafe-playground](https://github.com/TypeSafeAI/typesafe-playground) | Interactive Jev experiments and integration demos |
| [clarity-judge](https://github.com/TypeSafeAI/clarity-judge) | Separate named writing-quality checks |
| [typesafe-router](https://github.com/TypeSafeAI/typesafe-router) | Closed-set selection, separate from authorization and execution |
| [jev-harness](https://github.com/TypeSafeAI/jev-harness) | Proposal-review evidence and synthetic fixtures |

These are independent community projects, not an automatically integrated or officially supported suite. Preserve shadcn/ui and Base UI attribution, TypeSafe-inspired branding, the OpenCoven layout inspiration, and existing source/license notices. Review the applicable licenses before reusing code; this change does not alter licensing.
