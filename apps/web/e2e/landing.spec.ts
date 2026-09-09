import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("video landing keeps content reachable, menus usable, and locales intact", async ({ page }) => {
  await page.goto("/");
  // The development toolbar can otherwise cover the mobile menu button.
  await page.addStyleTag({ content: "nextjs-portal { display: none; }" });
  await page.evaluate(async () => { await Promise.all(document.getAnimations().map((animation) => animation.finished)); });
  await expect(page.locator("[data-count]")).toHaveText(["87.6", "91.4", "81.9", "94.0"]);
  await expect(page.locator("video source")).toHaveAttribute("src", "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4");

  for (const [width, height] of [[1440, 900], [1280, 720], [390, 844], [375, 667], [320, 568], [844, 390]]) {
    await page.setViewportSize({ width, height });
    const dimensions = await page.evaluate(() => {
      const title = document.querySelector("h1")!.getBoundingClientRect();
      const header = document.querySelector("header")!.getBoundingClientRect();
      const cta = document.querySelector("main a")!.getBoundingClientRect();
      const footer = document.querySelector("footer")!.getBoundingClientRect();
      return { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, titleLeft: title.left, titleRight: title.right, headerBottom: header.bottom, ctaTop: cta.top, ctaBottom: cta.bottom, footerTop: footer.top };
    });
    expect(dimensions.width).toBe(width);
    expect(dimensions.titleLeft).toBeGreaterThanOrEqual(0);
    expect(dimensions.titleRight).toBeLessThanOrEqual(width);
    expect(dimensions.ctaTop).toBeGreaterThan(dimensions.headerBottom);
    expect(dimensions.ctaBottom).toBeLessThanOrEqual(dimensions.footerTop);
    if (height >= 640) expect(dimensions.height).toBe(height);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  const trigger = page.locator("summary");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.locator("[data-menu-dismiss]").click({ position: { x: 10, y: 700 } });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(page.locator("[data-mobile-menu]")).not.toHaveAttribute("open");

  for (const [label, lang] of [["简体中文", "zh-CN"], ["日本語", "ja"]]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await trigger.click();
    await page.getByRole("button", { name: label }).filter({ visible: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-count]")).toHaveText(["87.6", "91.4", "81.9", "94.0"]);
  expect(await page.locator("video").evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
  await expect(page).toHaveTitle(/AURELIS QA/);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
  await page.getByRole("main").getByRole("link").click();
  await expect(page).toHaveURL(/\/dashboard\/demo$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflowY)).not.toBe("hidden");
});
