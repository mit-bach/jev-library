# Optical studio design review

## Direction

TypeSafe UI is a working component library for developers. Make reusable interface parts feel like precision optical instruments: a photographic glass sculpture introduces the library, then recedes behind readable, interactive workspaces.

Palette: graphite #0c1015, porcelain #f7f7f8, blush #f386a1, deep pink #bb305f, teal #19bcae, silver #a2a9b5. Keep IBM Plex Sans for expressive display and body; IBM Plex Mono for source and utility labels. Large tightly tracked display, quiet body, compact labels. Avoid continuous ambient animation.

Layout: full-width photographic introduction → grouped component workspace with persistent rail and outline. Lab: compact introduction → illuminated demo stage → direct scene navigation. Dark and light share geometry; the photographic intro is a deliberate dark art panel in both.

## Audit and execution

- [x] Inspect current shell, registry, previews, Lab, themes, and existing E2E suite.
- [x] Generate original photorealistic optical artwork.
- [x] Implement introduction, catalog surfaces, and Lab studio treatment.
- [x] Correct Lab's misleading claims about real requests and stored keys.
- [x] Verify preview/source/install/import, search, navigation, and all Lab scenes.
- [x] Inspect desktop, narrow layouts, light/dark, RTL, keyboard, and reduced motion.
- [x] Run lint, typecheck, build, and existing browser suite; record evidence.

## Asset provenance

`apps/web/public/images/optical-study.webp` uses the built-in imagegen tool; optimized to WebP for delivery. Prompt: a photorealistic studio photograph of three interlocking thick precision-cut glass rounded rectangular frames; smoked borosilicate, polished silver edges, pink and teal refraction, dark graphite floor; sculpture right with negative space left; realistic softbox lighting and tactile details; no text, logos, or interface overlays.

## Verification — 2026-09-20

- Used the manifest-pinned pnpm 10.33.4 through `npx --yes pnpm@10.33.4`; the machine default is a different version. No dependency or lockfile changes.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`: passed after the final implementation changes.
- `pnpm --filter web test:e2e --workers=3`: 27 passed, including mobile, search, overlays, Lab, theme persistence/cross-fade, and reduced motion.
- Browser inspection exercised Source, Import, and Preview for all 18 components; confirmed nonempty source and workspace imports. Install rendering/copy is covered by the suite and inspected on Button.
- Inspected desktop and mobile artwork, light/dark Lab, component source, and RTL. Catalog and all three Lab scenes measured zero horizontal overflow at 320 px. RTL catalog measured zero overflow at 360 px; RTL Lab inspected at 1440 px.
- Browser-driven keyboard checks verified skip-link focus to main, hero action navigation, command-palette opening and Escape dismissal. These are automated browser interactions, not human keyboard-only or screen-reader acceptance.
- Production smoke at localhost:3102 loaded the image successfully, toggled themes, and ran the Decision scene with no page errors or HTTP errors observed.
- Final screenshots: `/tmp/typesafe-studio-final-desktop.png`, `/tmp/typesafe-studio-final-mobile.png`. Additional light/RTL/source inspection screenshots are in `/tmp/typesafe-review-*.png`.

The review found two existing interaction problems: theme transition suppression conflicted with the icon cross-fade (removed suppression and frame scheduling), and the tooltip test hovered before hydration (now waits for the existing scroll-spy effect). Both checks pass. Lab settings now clearly distinguish simulation, example credentials, and confirmation previews from real operations.

No commit, push, publication, provider connection, or GitHub settings change was performed. Human screen-reader acceptance and additional browser engines remain outside this Chromium verification.
