import { expect, test } from "./fixtures"

test.describe("lab", () => {
  test("navigates scenes with tabs, arrows, and the hash", async ({ page }) => {
    await page.goto("/lab")
    await expect(
      page.getByRole("heading", { level: 2, name: "Composer" })
    ).toBeVisible()
    await expect(page.getByText("01 / 03")).toBeVisible()

    await page.getByRole("navigation", { name: "Lab navigation", exact: true }).getByRole("link", { name: "Decision", exact: true }).click()
    await expect(page).toHaveURL(/#decision$/)
    await expect(
      page.getByRole("heading", { level: 2, name: "Decision" })
    ).toBeVisible()

    await page.getByRole("button", { name: "Next scene" }).click()
    await expect(page.getByText("03 / 03")).toBeVisible()
    await page.getByRole("button", { name: "Next scene" }).click()
    await expect(page.getByText("01 / 03")).toBeVisible()
    await page.getByRole("button", { name: "Previous scene" }).click()
    await expect(page.getByText("03 / 03")).toBeVisible()
  })

  test("loads the scene named in the URL hash", async ({ page }) => {
    await page.goto("/lab#settings")
    await expect(
      page.getByRole("heading", { level: 2, name: "Settings" })
    ).toBeVisible()
    await expect(page.getByText("03 / 03")).toBeVisible()
  })

  test("composer sends and resets", async ({ page }) => {
    await page.goto("/lab")
    const send = page.getByRole("button", { name: "Send" })
    await send.click()
    await expect(
      page.getByText("Received locally. No model connected.")
    ).toBeVisible()
    await expect(send).toBeDisabled()

    await page.getByRole("button", { name: "Remove attachment" }).click()
    await expect(page.getByText("spec.md")).toBeHidden()
    await page.getByRole("button", { name: "Reset" }).click()
    await expect(page.getByText("spec.md")).toBeVisible()
    await expect(send).toBeEnabled()
  })

  test("decision ranks every option and clears", async ({ page }) => {
    await page.goto("/lab#decision")
    await expect(page.getByText("No decision yet.")).toBeVisible()
    await page.getByRole("button", { name: "Decide" }).click()
    await expect(page.getByText("Pick:")).toBeVisible()
    await expect(page.getByText("open_ticket").first()).toBeVisible()
    await page.getByRole("button", { name: "Clear" }).click()
    await expect(page.getByText("No decision yet.")).toBeVisible()
  })

  test("settings switches, tabs, and the delete confirmation", async ({
    page,
  }) => {
    await page.goto("/lab#settings")
    const live = page.getByRole("switch").first()
    await expect(page.getByText("Demo mode")).toBeVisible()
    await live.click()
    await expect(page.getByText("Simulated live")).toBeVisible()

    await page.getByRole("tab", { name: "Danger zone" }).click()
    await page.getByRole("button", { name: "Delete" }).click()
    const dialog = page.getByRole("dialog")
    await expect(dialog.getByText("Delete this workspace?")).toBeVisible()
    await dialog.getByRole("button", { name: "Keep workspace" }).click()
    await expect(dialog).toBeHidden()
  })
})
