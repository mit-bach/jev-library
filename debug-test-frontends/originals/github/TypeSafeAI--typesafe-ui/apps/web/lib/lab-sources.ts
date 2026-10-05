import "server-only"

import { readFile } from "node:fs/promises"
import path from "node:path"
import { highlight } from "@/lib/highlight"
import type { Snippet } from "@/lib/sources"

// Literal paths keep production tracing scoped to these source files.
const files: Record<string, () => Promise<string>> = {
  "components/labs/typed-preview.tsx": () =>
    readFile(
      path.join(process.cwd(), "components/labs/typed-preview.tsx"),
      "utf8"
    ),
  "components/labs/workspace-workbench.tsx": () =>
    readFile(
      path.join(process.cwd(), "components/labs/workspace-workbench.tsx"),
      "utf8"
    ),
  "components/labs/rebuild-workbench.tsx": () =>
    readFile(
      path.join(process.cwd(), "components/labs/rebuild-workbench.tsx"),
      "utf8"
    ),
  "components/labs/action-workbench.tsx": () =>
    readFile(
      path.join(process.cwd(), "components/labs/action-workbench.tsx"),
      "utf8"
    ),
  "components/labs/classic-scenes.tsx": () =>
    readFile(
      path.join(process.cwd(), "components/labs/classic-scenes.tsx"),
      "utf8"
    ),
  "lib/lab-preview.ts": () =>
    readFile(path.join(process.cwd(), "lib/lab-preview.ts"), "utf8"),
  "../../packages/ui/src/components/jev-contract.tsx": () =>
    readFile(
      path.join(
        process.cwd(),
        "../../packages/ui/src/components/jev-contract.tsx"
      ),
      "utf8"
    ),
  "../../packages/ui/src/components/jev-result.tsx": () =>
    readFile(
      path.join(
        process.cwd(),
        "../../packages/ui/src/components/jev-result.tsx"
      ),
      "utf8"
    ),
}

export type LabSources = { files: Record<string, Snippet>; install: Snippet }

export async function loadLabSources(): Promise<LabSources> {
  const entries = await Promise.all(
    Object.entries(files).map(async ([file, read]) => {
      const code = await read()
      return [file, { code, html: await highlight(code, "tsx") }] as const
    })
  )
  const code =
    "git clone https://github.com/TypeSafeAI/typesafe-ui.git\ncd typesafe-ui\n# Use the packageManager version in package.json\npnpm install --frozen-lockfile\npnpm dev"
  return {
    files: Object.fromEntries(entries),
    install: { code, html: await highlight(code, "bash") },
  }
}
