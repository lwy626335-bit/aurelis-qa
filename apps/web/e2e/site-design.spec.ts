import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["demo", "evaluations", "evaluations/new", "logo", "analytics", "history", "technical", "compare", "brands", "brands/new", "rubrics", "research", "github", "privacy", "documentation", "demo/findings/issue-contrast"];

test("all workspace pages share the redesign and remain accessible", async ({ page }, testInfo) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of routes) {
    const response = await page.goto(`/dashboard/${route}`);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page).toHaveTitle(/AURELIS/);
    await expect(page.locator("[data-workspace]")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth), `${route} horizontal overflow`).toBeLessThanOrEqual(page.viewportSize()!.width);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })), `${route} accessibility`).toEqual([]);
    if (["demo", "evaluations/new", "logo", "research", "privacy"].includes(route)) {
      await page.screenshot({ path: testInfo.outputPath(`${route.replaceAll("/", "-")}.png`), animations: "disabled", style: "nextjs-portal { display: none; }" });
    }
  }
  for (const listRoute of ["evaluations", "history"]) {
    await page.goto(`/dashboard/${listRoute}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const detailLinks = await page.locator('main a[href^="/dashboard/evaluations/"], main a[href^="/dashboard/logo/"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")!).filter((href) => !href.endsWith("/new")));
    if (detailLinks[0]) {
      await page.goto(detailLinks[0]);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("[data-workspace]")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
    }
  }
});

test("workspace navigation and evaluation controls retain their behavior", async ({ page }, testInfo) => {
  await page.goto("/dashboard/evaluations/new");
  await page.addStyleTag({ content: "nextjs-portal { display: none; }" });
  await expect(page.getByRole("heading", { name: "New evaluation" })).toBeVisible();
  await page.getByRole("button", { name: "HTML / CSS / JavaScript", exact: true }).click();
  await expect(page.getByRole("button", { name: "HTML / CSS / JavaScript", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('textarea[name="html"]')).toBeVisible();
  await page.getByRole("checkbox", { name: "This website was generated with AI" }).check();
  await expect(page.locator('input[name="aiGenerator"]')).toBeVisible();
  await page.getByRole("button", { name: "Website URL", exact: true }).click();
  await expect(page.locator('input[name="url"]')).toBeVisible();

  if (testInfo.project.name === "mobile-chromium") {
    const trigger = page.getByRole("button", { name: "Open dashboard navigation" });
    await trigger.click();
    const drawer = page.getByRole("dialog", { name: "Dashboard navigation" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Technical", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await drawer.getByRole("link", { name: "Logo review" }).click();
    await expect(drawer).not.toBeVisible();
  } else {
    await page.locator('nav[data-compact="true"]').getByRole("link", { name: "Logo review" }).click();
  }
  await expect(page).toHaveURL(/\/dashboard\/logo$/);
  await expect(page.getByRole("heading", { name: "Evaluate a logo" })).toBeVisible();
  await page.getByRole("button", { name: "简体中文" }).filter({ visible: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("heading", { name: "评价 Logo" })).toBeVisible();
});
