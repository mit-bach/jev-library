import { expect, test } from "./fixtures"
import { registry } from "../lib/registry"

test.describe("library", () => {
  test("renders every registered component with preview, source, and install", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(
      page.getByRole("heading", { level: 1, name: "Interfaces, in a different light." })
    ).toBeVisible()
    for (const entry of registry) {
      const article = page.locator(`#${entry.id}`)
      await expect(
        article.getByRole("heading", { level: 3, name: entry.title })
      ).toBeAttached()
      await expect(article.getByRole("tab", { name: "Source" })).toBeAttached()
      await expect(
        article.getByRole("button", { name: `Copy Install ${entry.title}` })
      ).toBeAttached()
    }
  })

  test("the source view keeps the live preview mounted", async ({ page }) => {
    await page.goto("/#button")
    const article = page.locator("#button")
    await article.getByRole("tab", { name: "Source" }).click()
    await expect(article.getByText("buttonVariants").first()).toBeVisible()
    await expect(
      article.getByRole("button", { name: "Copy button.tsx" })
    ).toBeVisible()
    // Preview is inert but still in the DOM, so its state survives the switch.
    await expect(
      article.locator("button", { hasText: "Decide" })
    ).toBeAttached()
    await expect(article.locator("button", { hasText: "Decide" })).toBeHidden()
    await article.getByRole("tab", { name: "Preview" }).click()
    await expect(article.getByRole("button", { name: "Decide" })).toBeVisible()
  })

  test("copy buttons confirm and reset", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.goto("/#button")
    const copy = page
      .locator("#button")
      .getByRole("button", { name: "Copy Install Button" })
    await copy.click()
    await expect(copy).toHaveText(/Copied/)
    await expect(copy).toHaveText(/^Copy$/, { timeout: 4000 })
    const clipboard = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboard).toContain("shadcn@latest add button")
  })

  test("the rail tracks the section in view", async ({ page }) => {
    await page.goto("/")
    const rail = page.getByRole("navigation", { name: "Component navigation" })
    await expect(rail.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "location"
    )
    await rail.getByRole("link", { name: "Select" }).click()
    await expect(page).toHaveURL(/#select$/)
    await expect(rail.getByRole("link", { name: "Select" })).toHaveAttribute(
      "aria-current",
      "location"
    )
  })

  test.describe("overlays open without errors", () => {
    test("dropdown menu", async ({ page }) => {
      await page.goto("/#dropdown-menu")
      await page
        .locator("#dropdown-menu")
        .getByRole("button", { name: "Account" })
        .click()
      const menu = page.getByRole("menu")
      await expect(
        menu.getByRole("menuitem", { name: "Profile" })
      ).toBeVisible()
      await menu.getByRole("menuitem", { name: "Copy link" }).hover()
      await expect(
        page.getByRole("menuitem", { name: "Public link" })
      ).toBeVisible()
      // First Escape closes the submenu, the second closes the menu.
      await page.keyboard.press("Escape")
      await expect(
        page.getByRole("menuitem", { name: "Public link" })
      ).toBeHidden()
      await page.keyboard.press("Escape")
      await expect(page.getByRole("menuitem", { name: "Profile" })).toBeHidden()
    })

    test("dialog", async ({ page }) => {
      await page.goto("/#dialog")
      await page
        .locator("#dialog")
        .getByRole("button", { name: "Edit profile" })
        .click()
      const dialog = page.getByRole("dialog", { name: "Edit profile" })
      await expect(dialog).toBeVisible()
      await expect(dialog.getByLabel("Name", { exact: true })).toHaveValue(
        "Val Alexander"
      )
      await dialog.getByRole("button", { name: "Cancel" }).click()
      await expect(dialog).toBeHidden()
    })

    test("sheet", async ({ page }) => {
      await page.goto("/#sheet")
      await page
        .locator("#sheet")
        .getByRole("button", { name: /^right$/i })
        .click()
      const sheet = page.getByRole("dialog", { name: "API key" })
      await expect(sheet).toBeVisible()
      await sheet.getByRole("button", { name: "Cancel" }).click()
      await expect(sheet).toBeHidden()
    })

    test("select", async ({ page }) => {
      await page.goto("/#select")
      const trigger = page
        .locator("#select")
        .getByRole("combobox", { name: "Model", exact: true })
      await trigger.click()
      await page.getByRole("option", { name: "jev-2" }).click()
      await expect(trigger).toContainText("jev-2")
    })

    test("tooltip", async ({ page }) => {
      await page.goto("/#tooltip")
      // Hover is not replayed during hydration. Wait for the scroll spy's
      // client effect before sending the pointer into the server-rendered demo.
      await expect(
        page.getByRole("navigation", { name: "Component navigation" })
          .getByRole("link", { name: "Tooltip", exact: true })
      ).toHaveAttribute("aria-current", "location")
      await page
        .locator("#tooltip")
        .getByRole("button", { name: "Hover me" })
        .hover()
      await expect(page.locator("[data-slot=tooltip-content]")).toHaveText(
        "Jev decides, your code executes."
      )
    })
  })
})
