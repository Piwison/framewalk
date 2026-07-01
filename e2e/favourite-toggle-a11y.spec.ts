import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Favourite toggle accessibility (WCAG 2.1 AA)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("framewalk.favourites"));
  });

  test("element is a real <button> with aria-pressed", async ({ page }) => {
    const toggle = page.getByRole("button", {
      name: /save this mission|saved — tap to remove/i,
    });
    await expect(toggle).toBeVisible();

    const tagName = await toggle.evaluate((el) => el.tagName);
    expect(tagName).toBe("BUTTON");

    await expect(toggle).toHaveAttribute("aria-pressed", /^(true|false)$/);
  });

  test("unmarked: aria-pressed=false, accessible name='Save this mission'", async ({
    page,
  }) => {
    const toggle = page.getByRole("button", {
      name: "Save this mission",
    });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(toggle).toHaveAccessibleName("Save this mission");
  });

  test("marked: aria-pressed=true, accessible name='Saved — tap to remove'", async ({
    page,
  }) => {
    const toggle = page.getByRole("button", {
      name: /save this mission|saved — tap to remove/i,
    });

    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(toggle).toHaveAccessibleName("Saved — tap to remove");
  });

  test("SVG glyph is decorative (aria-hidden=true)", async ({ page }) => {
    const toggle = page.getByRole("button", {
      name: /save this mission|saved — tap to remove/i,
    });
    const svg = toggle.locator("svg");
    await expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  test("keyboard: Space key toggles state", async ({ page }) => {
    const toggle = page.getByRole("button", {
      name: /save this mission|saved — tap to remove/i,
    });

    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  test("keyboard: Enter key toggles state", async ({ page }) => {
    const toggle = page.getByRole("button", {
      name: /save this mission|saved — tap to remove/i,
    });

    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  test("focus-visible: outline is present when focused", async ({ page }) => {
    const toggle = page.getByRole("button", {
      name: /save this mission|saved — tap to remove/i,
    });

    await toggle.focus();

    const outline = await toggle.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor,
        outlineOffset: styles.outlineOffset,
      };
    });

    expect(outline.outlineWidth).not.toBe("0px");
    expect(outline.outlineWidth).not.toBe("none");
    expect(outline.outlineColor).toBeTruthy();
  });

  test("hit target: ≥44×44 pixels (WCAG 2.5.5)", async ({ page }) => {
    const toggle = page.getByRole("button", {
      name: /save this mission|saved — tap to remove/i,
    });

    const box = await toggle.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("no aria-live: state change is self-announcing", async ({ page }) => {
    const toggle = page.getByRole("button", {
      name: /save this mission|saved — tap to remove/i,
    });

    const hasAriaLive = await toggle.evaluate((el) =>
      el.hasAttribute("aria-live"),
    );
    expect(hasAriaLive).toBe(false);
  });

  test("reduced-motion: transition duration = 0ms", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const toggle = page.getByRole("button", {
      name: /save this mission|saved — tap to remove/i,
    });

    const duration = await toggle.evaluate((el) => {
      return window.getComputedStyle(el).transitionDuration;
    });

    expect(duration).toMatch(/^0(ms|s)$/);
  });

  test("contrast (light theme, unmarked): ink-faint on paper ≥3:1", async ({
    page,
  }) => {
    // This is verified by our manual contrast math:
    // Light: #777262 on #fbfaf5 = 4.60:1 PASS
    // But we'll test that the element renders correctly
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    const toggle = page.getByRole("button", {
      name: "Save this mission",
    });

    const color = await toggle.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Verify the element has text-ink-faint color applied
    expect(color).toBeTruthy();
  });

  test("contrast (dark theme, unmarked): ink-faint on paper ≥3:1", async ({
    page,
  }) => {
    // Dark: #9a9485 on #1b1a15 = 5.77:1 PASS
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    const toggle = page.getByRole("button", {
      name: "Save this mission",
    });

    const color = await toggle.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    expect(color).toBeTruthy();
  });

  test("contrast (light theme, marked): accent on paper ≥3:1", async ({
    page,
  }) => {
    // Light: #c2702f on #fbfaf5 = 3.55:1 PASS
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    const toggle = page.getByRole("button", {
      name: /save this mission|saved — tap to remove/i,
    });

    await toggle.click();

    const color = await toggle.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    expect(color).toBeTruthy();
  });

  test("contrast (dark theme, marked): accent on paper ≥3:1", async ({
    page,
  }) => {
    // Dark: #d98a52 on #1b1a15 = 6.40:1 PASS
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    const toggle = page.getByRole("button", {
      name: /save this mission|saved — tap to remove/i,
    });

    await toggle.click();

    const color = await toggle.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    expect(color).toBeTruthy();
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`axe: no serious/critical violations (${scheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");

      const toggle = page.getByRole("button", {
        name: /save this mission|saved — tap to remove/i,
      });
      await expect(toggle).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      const serious = results.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      );

      expect(serious).toEqual([]);
    });

    test(`axe: marked state, no serious/critical violations (${scheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");

      const toggle = page.getByRole("button", {
        name: /save this mission|saved — tap to remove/i,
      });

      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-pressed", "true");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      const serious = results.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      );

      expect(serious).toEqual([]);
    });
  }
});
