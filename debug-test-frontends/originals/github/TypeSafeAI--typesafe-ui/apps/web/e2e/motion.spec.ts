import { expect, test } from "./fixtures"

test.describe("motion", () => {
  test("buttons scale to 0.96 while pressed", async ({ page }) => {
    await page.goto("/lab")
    const send = page.getByRole("button", { name: "Send" })
    await send.scrollIntoViewIfNeeded()
    const box = await send.boundingBox()
    if (!box) throw new Error("Send button has no box")
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await expect
      .poll(() => send.evaluate((el) => getComputedStyle(el).scale))
      .toBe("0.96")
    await page.mouse.up()
    await expect
      .poll(() => send.evaluate((el) => getComputedStyle(el).scale))
      .toBe("none")
  })

  test("transitions name their properties", async ({ page }) => {
    await page.goto("/")
    const all = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<HTMLElement>(
          "button, a, [role=tab], [role=switch]"
        )
      )
        // `all` is the CSS default; only flag it where a transition actually runs.
        .filter((el) => {
          const style = getComputedStyle(el)
          return (
            style.transitionProperty === "all" &&
            parseFloat(style.transitionDuration) > 0
          )
        })
        .map((el) => el.outerHTML.slice(0, 80))
    )
    expect(all).toEqual([])
  })

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" })

    test("scene changes and overlays do not animate", async ({ page }) => {
      await page.goto("/lab")
      const scene = page.locator(".scene-enter").first()
      await expect(scene).toBeVisible()
      expect(
        await scene.evaluate((el) => getComputedStyle(el).animationName)
      ).toBe("none")

      await page.getByRole("navigation", { name: "Lab navigation", exact: true }).getByRole("link", { name: "Decision", exact: true }).click()
      await expect(
        page.getByRole("heading", { level: 2, name: "Decision" })
      ).toBeVisible()

      await page.keyboard.press("ControlOrMeta+k")
      const dialog = page.getByRole("dialog", { name: "Search" })
      await expect(dialog).toBeVisible()
      const duration = await dialog.evaluate(
        (el) => getComputedStyle(el).animationDuration
      )
      expect(parseFloat(duration)).toBeLessThanOrEqual(0.01)
    })
  })
})
