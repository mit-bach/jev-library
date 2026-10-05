import { writeFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"

// All previews in this workspace are local fixtures; no provider keys are used.
test("public sharing metadata resolves to a real PNG", async ({ page, request }, testInfo) => {
  await page.goto("/")
  const og = page.locator('meta[property="og:image"]').first()
  const twitter = page.locator('meta[name="twitter:image"]').first()
  await expect(og).toHaveAttribute("content", /opengraph-image/)
  await expect(twitter).toHaveAttribute("content", /opengraph-image/)
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image")
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /unofficial/i)

  for (const [name, metadata] of [["og", og], ["twitter", twitter]] as const) {
    const image = new URL((await metadata.getAttribute("content"))!)
    // Fetch this build, not the configured production origin.
    const response = await request.get(image.pathname + image.search)
    expect(response.status()).toBe(200)
    expect(response.headers()["content-type"]).toContain("image/png")
    const body = await response.body()
    expect(body.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a")
    expect(body.readUInt32BE(16)).toBe(1200)
    expect(body.readUInt32BE(20)).toBe(630)
    const path = testInfo.outputPath(`generated-${name}.png`)
    await writeFile(path, body)
    await testInfo.attach(name, { path, contentType: "image/png" })
  }

  await page.setViewportSize({ width: 1440, height: 960 })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: testInfo.outputPath("library-desktop.png"), animations: "disabled" })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: testInfo.outputPath("library-mobile.png"), animations: "disabled" })
  const provenance = testInfo.outputPath("capture-provenance.json")
  await writeFile(provenance, JSON.stringify({
    commit: process.env.GITHUB_SHA ?? "local-unrecorded",
    route: "/", mode: "local fixtures; no provider key",
    environment: "Playwright local server, not production",
    desktop: { width: 1440, height: 960 }, mobile: { width: 390, height: 844 },
    note: "Viewport captures from the existing default theme; not an accessibility certification."
  }, null, 2))
  await testInfo.attach("capture provenance", { path: provenance, contentType: "application/json" })
})
