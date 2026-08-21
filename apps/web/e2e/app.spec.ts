import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function revealLandingSections(page: Page) {
  const sections = page.locator("[data-reveal]");
  for (let index = 0; index < (await sections.count()); index += 1) {
    const section = sections.nth(index);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toHaveCSS("opacity", "1");
  }
}

test.describe("AURELIS Phase 1", () => {
  test("landing page presents the method and opens the demo", async ({ page }, testInfo) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: "Measure what AI creates." })).toBeVisible();
    await expect(page.getByText("Demo dataset", { exact: false }).first()).toBeVisible();
    await revealLandingSections(page);
    await expect(page.getByRole("heading", { name: "A method you can inspect." })).toBeVisible();

    await page.screenshot({ path: testInfo.outputPath("landing.png"), fullPage: true });
    await page.getByRole("link", { name: "Open demo" }).first().click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { level: 1, name: "Evaluation overview" })).toBeVisible();
  });

  test("dashboard exposes the demo dataset and future-phase boundaries", async ({ page }, testInfo) => {
    await page.goto("/dashboard");

    await expect(page.getByText("Demo dataset", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("No URL, Lighthouse, validator, or AI evaluation ran in Phase 1.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Overall quality" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recent evaluations" })).toBeVisible();
    await expect(page.locator('[data-chart="radar"] .recharts-radar-polygon')).toHaveCount(2);
    await expect(page.locator('[data-chart="trend"] .recharts-area-area')).toBeVisible();

    await page.screenshot({ path: testInfo.outputPath("dashboard.png"), fullPage: true });
    await page.getByRole("link", { name: "New evaluation" }).click();

    await expect(page.getByRole("heading", { name: "Not implemented" })).toBeVisible();
    await expect(page.getByText("Phase 2", { exact: false }).first()).toBeVisible();
  });

  test("landing and dashboard have no serious or critical axe violations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of ["/", "/dashboard"]) {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const materialViolations = results.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      );
      expect(materialViolations, `${route} accessibility violations`).toEqual([]);
    }
  });

  test("reduced motion keeps landing content immediately available", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const hero = page.getByRole("heading", { level: 1, name: "Measure what AI creates." });
    await expect(hero).toBeVisible();
    await expect(hero).toHaveCSS("opacity", "1");
    await expect(page.getByRole("heading", { name: "The score is only the start." })).toBeVisible();
  });

  test("mobile navigation opens, closes, and reaches the dashboard", async ({ page }) => {
    test.skip(test.info().project.name !== "mobile-chromium", "Mobile-only navigation assertion");
    await page.goto("/");

    const menuButton = page.locator("summary");
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
    await page.getByRole("link", { name: "Open demo" }).last().click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
