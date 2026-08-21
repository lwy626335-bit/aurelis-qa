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

test.describe("AURELIS", () => {
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

  test("dashboard exposes the demo dataset and Phase 2 evaluation workflow", async ({ page }, testInfo) => {
    await page.goto("/dashboard");

    await expect(page.getByText("Demo dataset", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("No URL, Lighthouse, validator, or AI evaluation ran in Phase 1.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Overall quality" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recent evaluations" })).toBeVisible();
    await expect(page.locator('[data-chart="radar"] .recharts-radar-polygon')).toHaveCount(2);
    await expect(page.locator('[data-chart="trend"] .recharts-area-area')).toBeVisible();

    await page.screenshot({ path: testInfo.outputPath("dashboard.png"), fullPage: true });
    await page.getByRole("link", { name: "New evaluation" }).click();

    await expect(page.getByRole("heading", { name: "New evaluation" })).toBeVisible();
    await expect(page.getByText("creates a real queue job", { exact: false })).toBeVisible();
  });

  test("creates, persists, and cancels a real queued evaluation", async ({ page }) => {
    const suffix = `${Date.now()}-${test.info().project.name}`;
    await page.goto("/dashboard/evaluations/new");
    await page.getByLabel("Project name").fill(`E2E ${suffix}`);
    await page.getByLabel("Target label").fill("Example target");
    await page.getByLabel("Public URL").fill("https://example.com");
    await page.getByRole("button", { name: "Create evaluation" }).click();

    await expect(page).toHaveURL(/\/dashboard\/evaluations\/[a-z0-9]+$/);
    await expect(page.getByText("Input and reproducibility metadata stored")).toBeVisible();
    await expect(page.getByText("Technical evaluation queued or unavailable")).toBeVisible();
    await expect(page.getByText("Overall score unavailable", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "Cancel queued evaluation" }).click();
    await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
  });

  test("switches to Japanese and persists the locale", async ({ page }) => {
    await page.goto("/");
    if (test.info().project.name === "mobile-chromium") await page.locator("summary").click();
    await page.getByRole("button", { name: "日本語" }).filter({ visible: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    await expect(page.getByRole("heading", { level: 1, name: "AIが作ったWebを、基準で測る。" })).toBeVisible();
    await page.goto("/dashboard/evaluations/new");
    await expect(page.getByRole("heading", { name: "新しい評価" })).toBeVisible();
  });

  test("landing and dashboard have no serious or critical axe violations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of ["/", "/dashboard", "/dashboard/evaluations/new", "/dashboard/technical"]) {
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
