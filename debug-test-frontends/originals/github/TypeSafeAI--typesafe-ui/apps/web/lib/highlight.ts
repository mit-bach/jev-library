import "server-only"

import { createHighlighter, type Highlighter } from "shiki"

let highlighterPromise: Promise<Highlighter> | undefined

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["tsx", "bash"],
  })
  return highlighterPromise
}

export type Lang = "tsx" | "bash"

/** Returns dual-theme HTML. Light colours are inline; `.dark` swaps to the --shiki-dark vars. */
export async function highlight(code: string, lang: Lang) {
  const highlighter = await getHighlighter()
  return highlighter.codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: "light",
  })
}
