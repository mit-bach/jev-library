import { expect, test } from "./fixtures"
import { labRegistry } from "../lib/lab-registry"
import catalog from "../lib/playground/catalog.json" with { type: "json" }
import provenance from "../lib/playground/provenance.json" with { type: "json" }
import scenarios from "../lib/playground/scenarios.json" with { type: "json" }

test("coverage matches the pinned upstream inventory", () => {
  expect(new Set(labRegistry.map((entry) => entry.id)).size).toBe(
    labRegistry.length
  )
  const entries = labRegistry.filter((entry) => entry.kind === "catalog")
  expect(entries.map((entry) => entry.id).sort()).toEqual(
    [...provenance.catalogIds].sort()
  )
  for (const pack of catalog.packs)
    for (const example of pack.examples) {
      const entry = entries.find((candidate) => candidate.id === example.id)!
      expect(entry.state).toEqual(example.state)
      expect(entry.questions).toEqual(
        "questions" in example ? example.questions : pack.questions
      )
      expect(entry.comparison).toEqual(
        "comparison" in example ? example.comparison : undefined
      )
      expect(entry.reference).toEqual(
        "test" in example ? example.test : undefined
      )
    }
  expect(
    [...new Set(labRegistry.map((entry) => entry.upstream))].sort()
  ).toEqual([...provenance.workspaceRoutes].sort())
  expect(
    labRegistry.filter((entry) => entry.id.startsWith("workflow-")).length
  ).toBe(
    scenarios.workflow.reduce((sum, entry) => sum + entry.starters.length, 0)
  )
  expect(
    labRegistry.filter((entry) => entry.id.startsWith("smt-")).length
  ).toBe(scenarios.solver.length)
  expect(
    labRegistry.filter((entry) => entry.id.startsWith("meme-")).length
  ).toBe(scenarios.memes.length)
  expect(
    labRegistry.filter((entry) => entry.id.startsWith("rebuild-")).length
  ).toBe(scenarios.cleanRoom.length)
  expect(
    labRegistry.filter((entry) => entry.id.startsWith("chat-")).length
  ).toBe(
    Object.values(scenarios.chat).reduce(
      (sum, entry) => sum + entry.prompts.length,
      0
    )
  )
  for (const prefix of ["tool-router-", "langchain-"])
    expect(
      labRegistry.filter((entry) => entry.id.startsWith(prefix)).length
    ).toBe(scenarios.router.length)
})

for (const pack of catalog.packs) {
  test(`every catalog example runs: ${pack.title}`, async ({ page }) => {
    await page.goto(`/lab#${pack.examples[0]!.id}`)
    await expect(page.locator("#lab-title")).toHaveText(pack.examples[0]!.title)
    for (const example of pack.examples) {
      await page.evaluate((id) => {
        window.location.hash = id
      }, example.id)
      await expect(page.locator("#lab-title")).toHaveText(example.title)
      await page
        .getByRole("button", { name: "Run local preview", exact: true })
        .click()
      await expect(
        page.getByRole("status").filter({ hasText: "Local preview complete" })
      ).toBeVisible()
      const result = page.locator("[data-slot=jev-result]")
      await expect(
        result.getByRole("heading", { name: "Illustrative response" })
      ).toBeVisible()
      const request = JSON.parse(
        await page
          .getByRole("region", { name: "Request inspector" })
          .locator("pre")
          .first()
          .innerText()
      )
      expect(request.state).toEqual(example.state)
      expect(Object.keys(request.questions).length).toBeGreaterThan(0)
      if ("comparison" in example && example.comparison) {
        await page
          .getByRole("button", { name: "Compare A/B", exact: true })
          .click()
        const pair = page
          .getByRole("region", { name: "Request inspector" })
          .locator("pre")
        await expect(pair).toHaveCount(2)
        const a = JSON.parse(await pair.nth(0).innerText())
        const b = JSON.parse(await pair.nth(1).innerText())
        const expected = structuredClone(a)
        let target = expected.state
        for (const key of example.comparison.path.slice(0, -1))
          target = target[key]
        target[example.comparison.path.at(-1)!] = example.comparison.value
        expect(b).toEqual(expected)
      }
    }
  })
}

const workspaceGroups = [
  ...new Set(
    labRegistry
      .filter((entry) => !["classic", "catalog"].includes(entry.kind))
      .map((entry) => entry.group)
  ),
]
for (const group of workspaceGroups) {
  test(`every workspace scenario runs: ${group}`, async ({ page }) => {
    test.setTimeout(90_000)
    const first = labRegistry.find((entry) => entry.group === group)!
    await page.goto(`/lab#${first.id}`)
    await expect(page.locator("#lab-title")).toHaveText(first.title)
    for (const entry of labRegistry.filter((entry) => entry.group === group)) {
      await page.evaluate((id) => {
        window.location.hash = id
      }, entry.id)
      await expect(page.locator("#lab-title")).toHaveText(entry.title)
      await page
        .getByRole("button", { name: "Run local preview", exact: true })
        .click()
      await expect(
        page.getByRole("status").filter({ hasText: "Local preview complete" })
      ).toBeVisible()
      await expect(
        page.getByRole("region", { name: "Typed response" })
      ).toContainText("Local fixture")
      await expect(
        page.getByRole("region", { name: "Request inspector" })
      ).toBeVisible()
    }
  })
}
