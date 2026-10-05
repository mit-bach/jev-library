import { expect, test } from "./fixtures"

test.describe("theme", () => {
  test("defaults to dark and the header toggle flips it", async ({ page }) => {
    await page.goto("/")
    const html = page.locator("html")
    await expect(html).toHaveClass(/dark/)

    const toggle = page.getByRole("button", { name: "Use light scheme" })
    await toggle.click()
    await expect(html).not.toHaveClass(/dark/)
    await expect(
      page.getByRole("button", { name: "Use dark scheme" })
    ).toBeVisible()

    await page.reload()
    await expect(html).not.toHaveClass(/dark/)
  })

  test("the D hotkey toggles the scheme except while typing", async ({
    page,
  }) => {
    await page.goto("/lab")
    const html = page.locator("html")
    await expect(html).toHaveClass(/dark/)

    await page.keyboard.press("d")
    await expect(html).not.toHaveClass(/dark/)

    await page.getByRole("textbox", { name: "Request" }).fill("")
    await page.keyboard.press("d")
    await expect(html).not.toHaveClass(/dark/)
    await expect(page.getByRole("textbox", { name: "Request" })).toHaveValue(
      "d"
    )
  })

  test("the toggle icon cross-fades instead of snapping", async ({ page }) => {
    await page.goto("/lab")
    const toggle = page.getByRole("button", { name: /scheme$/ })
    await expect(toggle.locator("svg")).toHaveCount(2)

    // Sample icon opacity across the swap. A snap would only ever show 0 or 1.
    const samples = await toggle.evaluate(async (button) => {
      const [sun] = Array.from(button.querySelectorAll("svg"))
      const seen: number[] = []
      ;(button as HTMLButtonElement).click()
      await new Promise<void>((resolve) => {
        const start = performance.now()
        const tick = () => {
          seen.push(Number(getComputedStyle(sun!).opacity))
          if (performance.now() - start < 800) requestAnimationFrame(tick)
          else resolve()
        }
        requestAnimationFrame(tick)
      })
      return seen
    })
    expect(
      samples.some((value) => value > 0.05 && value < 0.95),
      `samples: ${samples.join(",")}`
    ).toBe(true)
    expect(samples.at(-1)).toBe(0)
  })
})
