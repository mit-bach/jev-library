import { expect, test } from "./fixtures"

test("Lab provides catalog navigation and reuse tabs", async ({ page }) => {
  await page.goto("/lab")
  await expect(
    page.getByRole("navigation", { name: "Lab navigation", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("tab", { name: "Source", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("tab", { name: "Install", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("tab", { name: "Import", exact: true })
  ).toBeVisible()
})

test("Jev catalog example keeps its contract and local response explicit", async ({
  page,
}) => {
  await page.goto("/lab#social-feature-question")
  await expect(
    page.getByRole("heading", {
      name: "A real question in the replies",
      exact: true,
    })
  ).toBeVisible()
  await page.getByText("Typed question contract", { exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Reply intent", exact: true })
  ).toBeVisible()
  await page
    .getByRole("button", { name: "Run local preview", exact: true })
    .click()
  await expect(
    page.getByRole("status").filter({ hasText: "Local preview complete" })
  ).toBeVisible()
  await expect(
    page.getByText("Illustrative response", { exact: true }).first()
  ).toBeVisible()
})

test("sidebar filtering, source, import, and hash history preserve the selected Lab", async ({
  page,
  context,
}) => {
  // The supplemental outline is reserved for wide workspaces.
  await page.setViewportSize({ width: 1600, height: 1000 })
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await page.goto("/lab")
  const nav = page.getByRole("navigation", {
    name: "Lab navigation",
    exact: true,
  })
  await nav
    .getByRole("searchbox", { name: "Find a Lab" })
    .fill("invoice candidate")
  await nav
    .getByRole("link", { name: "Invoice candidate extraction", exact: true })
    .click()
  await expect(page).toHaveURL(/#extraction$/)
  const input = page.getByRole("textbox", { name: "Example input" })
  await input.fill("Edited invoice: $1,250.00")
  await page.getByRole("tab", { name: "Source", exact: true }).click()
  await page
    .getByRole("combobox", { name: "Source file", exact: true })
    .selectOption("example")
  await expect(page.locator("#lab-preview pre")).toContainText(
    '"id": "extraction"'
  )
  await page.getByRole("tab", { name: "Import", exact: true }).click()
  await page.getByRole("button", { name: "Copy Lab import" }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'labById("extraction")'
  )
  await page.getByRole("tab", { name: "Preview", exact: true }).click()
  await expect(input).toHaveValue("Edited invoice: $1,250.00")
  await page
    .getByRole("navigation", { name: "Lab outline" })
    .getByRole("link", { name: "Installation" })
    .click()
  await expect(page).toHaveURL(/#extraction$/)
  await page.goBack()
  await expect(page.locator("#lab-title")).toHaveText("Composer")
})

test("invalid, unknown, edited, and failed results stay distinct", async ({
  page,
}) => {
  await page.goto("/lab#social-feature-question")
  const input = page.getByRole("textbox", { name: "Example input" })
  const run = page.getByRole("button", {
    name: "Run local preview",
    exact: true,
  })
  await input.fill("{")
  await run.click()
  await expect(
    page.getByRole("alert").filter({ hasText: "Fix the JSON" })
  ).toBeVisible()
  await page.getByRole("button", { name: "Reset example" }).click()
  await page
    .getByRole("combobox", { name: "Reply intent fixture", exact: true })
    .selectOption("__unknown")
  await run.click()
  await expect(
    page.getByRole("region", { name: "Typed response" })
  ).toContainText("Unknown")
  await input.fill("{}")
  await expect(
    page.getByRole("region", { name: "Typed response" })
  ).toContainText("No response yet")
  await page
    .getByRole("checkbox", { name: "Simulate provider failure" })
    .check()
  await run.click()
  await expect(
    page.getByRole("alert").filter({ hasText: "Simulated provider failure" })
  ).toBeVisible()
  await expect(
    page.getByRole("region", { name: "Request inspector" })
  ).toHaveCount(0)
})

test("A/B refuses a missing comparison field", async ({ page }) => {
  await page.goto("/lab#fairness-pronouns")
  await page.getByRole("textbox", { name: "Example input" }).fill("{}")
  await page.getByRole("button", { name: "Compare A/B" }).click()
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "comparison field requester.pronouns is missing" })
  ).toBeVisible()
})

test("routing policy blocks secrets and requires explicit mock approval", async ({
  page,
}) => {
  await page.goto("/lab#tool-router-2")
  await page
    .getByRole("button", { name: "Run local preview", exact: true })
    .click()
  await expect(
    page.getByRole("region", { name: "Policy checkpoint" })
  ).toContainText("Approval required")
  await page.getByRole("button", { name: "Approve simulation" }).click()
  await expect(
    page.getByRole("region", { name: "Policy checkpoint" })
  ).toContainText("Executed: false")
  await page.evaluate(() => {
    window.location.hash = "tool-router-3"
  })
  await page
    .getByRole("button", { name: "Run local preview", exact: true })
    .click()
  await expect(
    page.getByRole("region", { name: "Policy checkpoint" })
  ).toContainText("Blocked by policy")
  await expect(
    page.getByRole("button", { name: "Approve simulation" })
  ).toHaveCount(0)
})

test("clean-room previews exercise search, contact lifecycle, and ticket confirmation", async ({
  page,
}) => {
  await page.goto("/lab#rebuild-catalog")
  await page
    .getByRole("button", { name: "Run local preview", exact: true })
    .click()
  await page.getByRole("textbox", { name: "Search products" }).fill("Cloud")
  const rebuilt = page.getByRole("region", {
    name: "Rebuilt interface preview",
  })
  await expect(
    rebuilt.getByText("Cloud notebook", { exact: true })
  ).toBeVisible()
  await expect(
    rebuilt.getByText("Studio keyboard", { exact: true })
  ).toHaveCount(0)
  await page.evaluate(() => {
    window.location.hash = "rebuild-contacts"
  })
  await page
    .getByRole("button", { name: "Run local preview", exact: true })
    .click()
  await page.getByRole("textbox", { name: "New contact name" }).fill("Grace")
  await page.getByRole("button", { name: "Add contact", exact: true }).click()
  await page.getByRole("textbox", { name: "Contact 1 name" }).fill("Katherine")
  await page.getByRole("button", { name: "Delete Grace" }).click()
  await expect(
    page.getByRole("textbox", { name: "Contact 1 name" })
  ).toHaveValue("Katherine")
  await expect(
    page.getByRole("textbox", { name: "Contact 2 name" })
  ).toHaveCount(0)
  await page.evaluate(() => {
    window.location.hash = "rebuild-support"
  })
  await page
    .getByRole("button", { name: "Run local preview", exact: true })
    .click()
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("val@example.test")
  await page
    .getByRole("textbox", { name: "Issue", exact: true })
    .fill("Account access")
  await page.getByRole("button", { name: "Submit sample ticket" }).click()
  await expect(
    page.getByRole("status").filter({ hasText: "S-101" })
  ).toBeVisible()
})

test("global search discovers a Jev Lab", async ({ page }) => {
  await page.goto("/")
  await page.keyboard.press("ControlOrMeta+k")
  await page
    .getByPlaceholder("Type a component or page…")
    .fill("impossible bounds")
  await page.getByRole("option", { name: "Impossible bounds" }).click()
  await expect(page).toHaveURL(/\/lab#smt-1$/)
  await expect(page.locator("#lab-title")).toHaveText("Impossible bounds")
})

test("action previews preserve wait semantics and consume the observation once", async ({
  page,
}) => {
  await page.goto("/lab#microduck")
  await page
    .getByRole("combobox", { name: "Allowed action fixture" })
    .selectOption("wait")
  await page
    .getByRole("button", { name: "Run local preview", exact: true })
    .click()
  await page.getByRole("button", { name: "Step illustration" }).click()
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Waited; observation unchanged." })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Step illustration" })
  ).toBeDisabled()
})

test("ranking keeps unscored values unknown and sorts only fixture scores", async ({
  page,
}) => {
  await page.goto("/lab#youtube-extract")
  await page
    .getByRole("button", { name: "Run local preview", exact: true })
    .click()
  await page
    .getByRole("combobox", { name: "Candidate 2 fixture score", exact: true })
    .selectOption("0.75")
  await page.getByRole("button", { name: "Compare ranking" }).click()
  const ranking = page.getByRole("region", { name: "Ranking comparison" })
  await expect(ranking.getByRole("listitem").first()).toContainText(
    "Your code decides"
  )
  await expect(
    page.getByRole("combobox", {
      name: "Candidate 1 fixture score",
      exact: true,
    })
  ).toHaveValue("")
})

test("local Labs do not send provider or API requests", async ({ page }) => {
  const mutations: string[] = []
  page.on("request", (request) => {
    if (request.url().includes("/api/") || request.method() === "POST")
      mutations.push(request.url())
  })
  await page.goto("/lab#social-feature-question")
  await page
    .getByRole("button", { name: "Run local preview", exact: true })
    .click()
  await expect(
    page.getByRole("status").filter({ hasText: "Local preview complete" })
  ).toBeVisible()
  expect(mutations).toEqual([])
})
