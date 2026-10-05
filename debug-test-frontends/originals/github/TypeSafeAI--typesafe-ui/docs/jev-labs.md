# Jev Labs

Open `/lab` to explore 169 local examples: 110 catalog examples, 56 workspace scenarios, and the original Composer, Decision, and Settings patterns. Use the sidebar search, the mobile **Browse Labs** panel, or the global command palette. Every example has a stable `/lab#example-id` link.

Use a Lab inside this workspace:

```tsx
import { TypedPreview } from "@/components/labs/typed-preview"
import { labById } from "@/lib/lab-registry"

export function Example() {
  return <TypedPreview entry={labById("social-feature-question")!} />
}
```

These are app imports. `@workspace/ui` is a private workspace package, and neither the Labs nor the custom Jev primitives have a public npm or shadcn registry installation.

## Inspect and reuse an example

1. Select a Lab and edit its text or JSON input.
2. Choose illustrative output values, including **Unknown / unscored**.
3. Run the local preview. Inspect the typed output and the request shape.
4. Open **Source** to inspect the actual renderer, helper, shared components, or example data. Switching tabs preserves the preview state.
5. Open **Install** for workspace setup and **Import** for the selected Lab's import example.

A/B examples preserve the upstream mutation path and value. **Compare A/B** changes only that field. Both outputs use your fixture settings; they are not two model predictions. Removing the comparison field produces an error instead of inventing a replacement.

Editing input or fixture values invalidates the previous result. Failure simulation clears results and produces a visible error. Reference notes apply to the original input and are teaching aids, not execution evidence.

## Reusable Jev components

```tsx
import { JevContract } from "@workspace/ui/components/jev-contract"
import { JevResult } from "@workspace/ui/components/jev-result"
```

`JevContract` displays `choice`, `noul`, and `score` questions, instructions, and criteria. `JevResult` displays typed values, unknowns, empty/error states, and explicit response provenance. Their source, previews, and import examples are also available in the main component library.

Keep provider credentials and request handling on your application's server. These components do not create a provider connection or authorize downstream actions.

## Coverage and provenance

The input snapshot comes from [TypeSafeAI/typesafe-playground at `9d3d990`](https://github.com/TypeSafeAI/typesafe-playground/tree/9d3d990604c4680a397db813a9058bd40597cc67). It includes all 110 entries in `web/catalog.json` and covers all 19 workspace routes at that revision.

| Upstream workspace | Local Labs |
| --- | --- |
| Example builder | All 110 original IDs, states, question sets, 41 A/B variants, and available reference notes |
| Workflow chat | Six starting cases across five playbooks, with rules and follow-up evidence |
| Tool router and LangChain | Read settings, change production, and request a secret in each workspace |
| SMT solver | All five named constraint cases and their reference outcomes |
| Clean-room rebuild | Searchable catalog, contacts CRUD, and support ticket interactions |
| Meme lab | All four named text/context examples |
| Jev Chat | All 12 starter prompts across Story studio, Meet Jev, Support desk, and Your notes |
| Conversation lab | Default transcript and both legacy follow-up/chatter samples |
| Ask gate | Original context/docs, the single-question example, and all six incoming sample questions |
| Document extraction | Original synthetic invoice with exact-source candidate inspection |
| PR review | Original authentication-bypass diff and repository rules |
| AST governance | Original organization-membership diff and caller/test manifest |
| Vector reranker | All 200 generated sample candidates with their original vector scores |
| YouTube extract | A synthetic caption fixture with original-text evidence and relevance controls |
| Browser agent | Both PC-build and flight task presets with mock policy checkpoints |
| Chess, MicroDuck, JevDoom | Bounded action-selection components and one-observation illustrations for each game |

The canonical catalog content is preserved. Workspace Labs adapt the upstream interaction patterns into reusable component previews; they do not duplicate every upstream engine, benchmark, backend, or integration. Z3 does not run here. No browser automation, OCR, LangChain adapter, provider call, real game engine, purchase, review posting, or business action runs from these previews.

The snapshot and upstream MIT notice live in `apps/web/lib/playground/`. Credit remains with TypeSafe AI Playground contributors and @nickthompson480's original playground.

## Refresh the snapshot

The sync script reads immutable Git objects without importing or executing code from the sibling repository. It does not modify that checkout or consume its uncommitted edits.

```sh
node scripts/sync-playground.mjs ../typesafe-playground
```

To adopt a newer upstream revision, update the pinned revision deliberately, inspect the changed catalog and scenario sets, and add any missing workspace coverage before running verification. `provenance.json` records every canonical ID and workspace route.

## Verify changes

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm test:e2e
```

For a direct web-workspace run, use `pnpm --filter web test:e2e --workers=3`. `playground-coverage.spec.ts` compares the registry to the pinned inventory and exercises every catalog example, A/B variant, and workspace scenario. `jev-labs.spec.ts` checks navigation, source/import state, error handling, local-only execution, policy gates, ranking, action freshness, and rebuild interactions. Mobile coverage includes the searchable Lab drawer and Preview/Source/Import overflow checks.

Inspect light/dark themes, RTL, narrow screens, and keyboard focus as well. Chromium automation does not establish human screen-reader acceptance or coverage of every browser engine.
