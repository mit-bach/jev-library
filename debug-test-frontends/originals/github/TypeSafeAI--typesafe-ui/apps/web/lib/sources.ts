import "server-only"

import { readFile } from "node:fs/promises"
import path from "node:path"

import { highlight } from "@/lib/highlight"
import { importStatement, installCommand, registry } from "@/lib/registry"
import { site } from "@/lib/site"

export type Snippet = { code: string; html: string }
export type EntrySources = { source: Snippet; install: Snippet; import: Snippet }
export type SourceMap = Record<string, EntrySources>

const componentsDir = path.join(process.cwd(), "..", "..", "packages", "ui", "src", "components")

/** Reads every registry component from disk and highlights it. Runs at build time. */
export async function loadSources(): Promise<SourceMap> {
  const entries = await Promise.all(
    registry.map(async (entry) => {
      const code = await readFile(path.join(componentsDir, `${entry.id}.tsx`), "utf8")
      const install = installCommand(entry.id)
      const importCode = importStatement(entry, site.packageName)
      const [sourceHtml, installHtml, importHtml] = await Promise.all([
        highlight(code, "tsx"),
        highlight(install, "bash"),
        highlight(importCode, "tsx"),
      ])
      return [
        entry.id,
        {
          source: { code, html: sourceHtml },
          install: { code: install, html: installHtml },
          import: { code: importCode, html: importHtml },
        },
      ] as const
    })
  )
  return Object.fromEntries(entries)
}
