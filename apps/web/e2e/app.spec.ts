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

    await expect(page.getByRole("heading", { level: 1, name: "Quality you can prove." })).toBeVisible();
    await expect(page.getByText("Demo dataset", { exact: false }).first()).toBeVisible();
    await revealLandingSections(page);
    await expect(page.getByRole("heading", { name: "A method you can inspect." })).toBeVisible();

    await page.screenshot({ path: testInfo.outputPath("landing.png"), fullPage: true });
    await Promise.all([
      page.waitForURL(/\/dashboard\/demo$/, { timeout: 15_000 }),
      page.getByRole("link", { name: "Explore the 87.6 score" }).click(),
    ]);
    await expect(page.getByRole("heading", { level: 1, name: "Evaluation overview" })).toBeVisible();
  });

  test("dashboard exposes the demo dataset and evaluation workflow", async ({ page }, testInfo) => {
    await page.goto("/dashboard");

    await expect(page.getByText("Live audit not run", { exact: false }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Overall quality" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Priority findings" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sample snapshots" })).toBeVisible();
    await expect(page.locator('[data-chart="dimensions"] [data-current-bar]')).toHaveCount(6);
    await expect(page.locator('[data-chart="trend"] .recharts-area-area')).toBeVisible();
    await expect(page.locator("[data-priority-finding]").first()).toHaveCSS("opacity", "1");
    await page.locator('[data-chart="trend"]').scrollIntoViewIfNeeded();
    await expect(page.locator("[data-chart-mask]")).not.toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");

    await page.screenshot({ path: testInfo.outputPath("dashboard.png"), fullPage: true });
    await page.getByRole("link", { name: "Evaluate my website" }).first().click();

    await expect(page.getByRole("heading", { name: "New evaluation" })).toBeVisible();
    await expect(page.getByText("creates a real queue job", { exact: false })).toBeVisible();
  });

  test("demo findings stay in the sample route and retain a real conversion path", async ({ page }) => {
    await page.goto("/dashboard/demo");
    await page.getByRole("link", { name: /Open finding: Primary action loses contrast/ }).click();
    await expect(page).toHaveURL(/\/dashboard\/demo\/findings\/issue-contrast$/);
    await expect(page.getByRole("heading", { name: "Primary action loses contrast in the lightest hero state" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Run this check on my website" })).toHaveAttribute("href", "/dashboard/evaluations/new");
  });

  test("dashboard uses the compact navigation rail at 1024px", async ({ page }) => {
    test.skip(test.info().project.name === "mobile-chromium", "Desktop responsive assertion");
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto("/dashboard/demo");
    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeVisible();
    expect((await sidebar.boundingBox())?.width).toBe(72);
    await expect(page.getByRole("heading", { name: "Priority findings" })).toBeVisible();
  });

  test("creates, persists, and cancels a real queued evaluation", async ({ page }) => {
    const suffix = `${Date.now()}-${test.info().project.name}`;
    await page.goto("/dashboard/evaluations/new");
    await page.getByLabel("Project name").fill(`E2E ${suffix}`);
    await page.getByLabel("Target label").fill("Example target");
    await page.getByLabel("Public URL").fill("https://example.com");
    await page.getByRole("button", { name: "Create evaluation" }).click();

    await expect(page).toHaveURL(/\/dashboard\/evaluations\/[a-z0-9]+$/);
    await expect(page.getByText("Input stored", { exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Evaluation progress" }).getByText("Technical evaluation", { exact: true })).toBeVisible();
    await expect(page.getByText("Overall score unavailable", { exact: false })).toBeVisible();
    const evaluationId = page.url().split("/").at(-1)!;
    const status = await page.request.get(`/api/evaluations/${evaluationId}/status`);
    expect(status.status()).toBe(200);
    expect((await status.json()).snapshot.evaluationStatus).toBe("QUEUED");
    await page.getByRole("button", { name: "Cancel queued evaluation" }).click();
    await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
    const pdf = await page.request.get(`/api/reports/${evaluationId}/pdf`);
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()["content-type"]).toBe("application/pdf");
    expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");
    await page.getByRole("button", { name: "Delete evaluation" }).click();
    const confirm = page.getByRole("dialog", { name: "Permanently delete this evaluation?" });
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "Permanently delete" }).click();
    await expect(page).toHaveURL(/\/dashboard\/history$/);
    expect((await page.request.get(`/api/evaluations/${evaluationId}`)).status()).toBe(404);
  });

  test("switches to Japanese and persists the locale", async ({ page }) => {
    await page.goto("/");
    if (test.info().project.name === "mobile-chromium") await page.locator("summary").click();
    await page.getByRole("button", { name: "日本語" }).filter({ visible: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    await expect(page.getByRole("heading", { level: 1, name: "AIのWeb品質を、根拠から判断する。" })).toBeVisible();
    await page.goto("/dashboard/evaluations/new");
    await expect(page.getByRole("heading", { name: "新しい評価" })).toBeVisible();
  });

  test("switches to Simplified Chinese and persists the locale", async ({ page }) => {
    await page.goto("/");
    if (test.info().project.name === "mobile-chromium") await page.locator("summary").click();
    await page.getByRole("button", { name: "简体中文" }).filter({ visible: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.getByRole("heading", { level: 1, name: "让 AI 网页质量有据可证。" })).toBeVisible();
    await page.goto("/dashboard/evaluations/new");
    await expect(page.getByRole("heading", { name: "新建评估" })).toBeVisible();
    await expect(page.getByLabel("内容语言")).toHaveValue("zh");
    await page.goto("/dashboard/demo");
    await expect(page.getByRole("heading", { name: "优先处理的问题" })).toBeVisible();
    await expect(page.getByText("首屏最亮状态下，主按钮对比度不足")).toBeVisible();
    await expect(page.getByText("示例分数分布")).toBeVisible();
  });

  test("creates and persists an evidence-backed brand profile", async ({ page }) => {
    const suffix = `${Date.now()}-${test.info().project.name}`;
    await page.goto("/dashboard/brands/new");
    await page.getByLabel("Project name").fill(`Brand E2E ${suffix}`);
    await page.getByLabel("Brand name").fill(`Measured brand ${suffix}`);
    await page.getByLabel("Target audience").fill("Research teams reviewing AI-generated web content");
    await page.getByLabel("Personalities (comma separated)").fill("Professional, Measured");
    await page.getByLabel("Description").fill("A measured and professional brand used to verify evidence-backed evaluation workflows.");
    await page.getByLabel(/Example copy/).fill("First measured example.\n---\nSecond measured example.\n---\nThird measured example.");
    await page.getByRole("button", { name: "Save brand" }).click();
    await expect(page).toHaveURL(/\/dashboard\/brands$/);
    await expect(page.getByText(`Measured brand ${suffix}`)).toBeVisible();
  });

  test("creates immutable rubric and research experiment records", async ({ page }) => {
    const suffix = `${Date.now()}-${test.info().project.name}`.toLowerCase();
    await page.goto("/dashboard/rubrics");
    await page.getByLabel("Name", { exact: true }).fill(`Research rubric ${suffix}`);
    await page.getByLabel("Version").fill(`research-${suffix}`);
    await page.getByRole("button", { name: "Create version" }).click();
    await expect(page.getByText("Saved a new immutable version.")).toBeVisible();
    await page.goto("/dashboard/research");
    const experimentName = page.getByLabel("Experiment name");
    await expect(experimentName).toHaveCount(1);
    await experimentName.fill(`Experiment ${suffix}`);
    await page.getByLabel("Runs").fill("1");
    await page.getByRole("button", { name: "Create", exact: true }).click();
    await expect(page.getByText(`Experiment ${suffix}`)).toBeVisible();
  });

  test("landing and dashboard have no serious or critical axe violations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of ["/", "/dashboard/demo", "/dashboard/evaluations/new", "/dashboard/logo", "/dashboard/technical", "/dashboard/brands", "/dashboard/brands/new", "/dashboard/history", "/dashboard/compare", "/dashboard/rubrics", "/dashboard/research", "/dashboard/analytics", "/dashboard/privacy", "/dashboard/github"]) {
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

    const hero = page.getByRole("heading", { level: 1, name: "Quality you can prove." });
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

    await expect(page).toHaveURL(/\/dashboard\/demo$/);
  });

  test("mobile dashboard drawer traps navigation and closes with Escape", async ({ page }) => {
    test.skip(test.info().project.name !== "mobile-chromium", "Mobile-only dashboard drawer assertion");
    await page.goto("/dashboard/demo");

    await page.getByRole("button", { name: "Open dashboard navigation" }).click();
    const drawer = page.getByRole("dialog", { name: "Dashboard navigation" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Technical" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Open dashboard navigation" })).toBeFocused();
  });
});
