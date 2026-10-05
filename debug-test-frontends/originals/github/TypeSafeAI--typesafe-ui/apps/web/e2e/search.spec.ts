import { expect, test } from "./fixtures"

test.describe("search palette", () => {
  test("opens with the keyboard and jumps to a component", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("button", { name: "Search components" }).first()).toBeEnabled()
    await page.keyboard.press("ControlOrMeta+k")
    const dialog = page.getByRole("dialog", { name: "Search" })
    await expect(dialog).toBeVisible()

    await page.getByPlaceholder("Type a component or page…").fill("dialog")
    await expect(dialog.getByRole("option").first()).toContainText("Dialog")
    await page.keyboard.press("Enter")
    await expect(dialog).toBeHidden()
    await expect(page).toHaveURL(/#dialog$/)
    await expect(page.locator("#dialog")).toBeInViewport()
  })

  test("opens from the header button and closes on Escape", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(page.getByRole("button", { name: "Search components" }).first()).toBeEnabled()
    await page
      .getByRole("button", { name: "Search components" })
      .first()
      .click()
    const dialog = page.getByRole("dialog", { name: "Search" })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole("option", { name: /Library/ })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
  })

  test("shows an empty state for unknown queries", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("button", { name: "Search components" }).first()).toBeEnabled()
    await page.keyboard.press("ControlOrMeta+k")
    await page.getByPlaceholder("Type a component or page…").fill("zzzz")
    await expect(page.getByText("No matches.")).toBeVisible()
  })

  test("runs actions", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("button", { name: "Search components" }).first()).toBeEnabled()
    await page.keyboard.press("ControlOrMeta+k")
    await page.getByRole("option", { name: /Toggle theme/ }).click()
    await expect(page.locator("html")).not.toHaveClass(/dark/)
  })
})
