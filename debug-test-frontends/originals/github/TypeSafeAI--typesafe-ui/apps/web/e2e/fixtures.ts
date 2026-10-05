import { test as base, expect } from "@playwright/test"

/**
 * Every test fails if the page throws or logs a runtime error. Two of the bugs
 * fixed in this repo (a menu label outside its group, a command input without
 * its root) only surfaced as uncaught errors when an overlay opened.
 */
export const test = base.extend<{ runtimeErrors: string[] }>({
  runtimeErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on("pageerror", (error) => errors.push(error.message))
      page.on("console", (message) => {
        if (message.type() !== "error") return
        const text = message.text()
        // Network failures for missing assets are reported elsewhere.
        if (text.startsWith("Failed to load resource")) return
        errors.push(text)
      })
      await use(errors)
      expect(errors, "no runtime errors during the test").toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

/** Pixels the document is wider than the viewport. Zero means no horizontal scroll. */
export function horizontalOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth
  )
}
