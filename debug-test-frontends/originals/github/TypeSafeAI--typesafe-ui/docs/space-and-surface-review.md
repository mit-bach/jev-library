# Space and surface review

The component collection should work as a designer's workbench: a distinct optical-glass introduction, compact navigation, and calm card surfaces that make interactive examples easy to inspect. Preserve IBM Plex typography, pink actions, teal response values, light/dark themes, and logical RTL layout.

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| Medium | `apps/web/components/component-card.tsx` | Separate floating headers, tall previews, and installation rows | One card groups title, preview, reuse instructions, and supported states; container queries place preview and code side by side | Clear surface hierarchy and less repeated vertical travel |
| Medium | `apps/web/components/library.tsx` | 248px rail, early secondary outline, narrow content cap, large section gaps | 224px rail, outline at 1536px, wider content, tighter section spacing | Preserve room for actual examples on laptop screens |
| Medium | `apps/web/app/studio.css` | 540px desktop and 610px mobile hero minimums, 224px mobile bottom padding | 400px and 470px minimums, 80px mobile bottom padding | Keep the glass composition while bringing the catalog into view sooner |
| Medium | `apps/web/components/lab.tsx` | Wide gutters, expansive tabs, stacked setup and notes | Compact gutters/tabs; setup and notes share a row when room permits | Use available width without compressing controls |
| Medium | `apps/web/components/labs/typed-preview.tsx` | Every input fixed at 288px; single requests occupy half a two-column row | Content-sized input bounded at 144–256px; single requests use the full row; fixture controls wrap into columns | Remove empty editor and inspector space while retaining scrolling for large inputs |
| Medium | `apps/web/components/labs/workspace-workbench.tsx`, `action-workbench.tsx`, `rebuild-workbench.tsx` | Transparent or inconsistent panel surfaces | Explicit shared card backgrounds | Separate editable controls, outputs, and domain workbenches |
| Low | `packages/ui/src/components/jev-result.tsx`, `packages/ui/src/styles/globals.css` | Browser-default green meter styling | Teal values, muted tracks, retained native meter semantics | Match the TypeSafe palette in both themes |

## Verification

- Root lint, typecheck, and production build passed with pnpm 10.33.4.
- Final E2E run: **72 passed** (3.8 minutes), including all 110 catalog examples, 56 workspace scenarios, A/B variants, overlays, themes, and reduced motion. Log: `/tmp/typesafe-density-final-e2e.log`.
- Production preview: `http://localhost:3104/`. Build log: `/tmp/typesafe-density-build.log`.
- Both routes measured zero horizontal overflow at 320, 768, 1024, 1280, 1440, and 1920px in Chromium.
- Reviewed desktop and mobile screenshots, light/dark themes, and RTL. Production checks exercised Preview/Source/Import on all 20 component cards, mobile drawer keyboard opening and Escape/focus return, arrow-key Lab tabs, and Source/Import at 320px RTL. All passed.
- The supplemental-outline E2E check now uses a 1600px viewport, matching its intentional wide-screen breakpoint.
- No dependencies, provider calls, or credentials added. Prior uncommitted work preserved.

Human screen-reader and physical touch-device acceptance are not established by these browser checks. Award recognition is subjective; this review records concrete improvements and verification rather than claiming it.

**Approve** for the inspected surfaces and Chromium flows. No high-severity findings remain in that scope.
