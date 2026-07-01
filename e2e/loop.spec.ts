import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("FrameWalk core loop", () => {
  test("Today shows a mission and 'Another' changes it", async ({ page }) => {
    await page.goto("/");
    const title = page.getByRole("heading", { level: 2 });
    await expect(title).toBeVisible();
    const first = (await title.textContent())?.trim() ?? "";
    await page.getByRole("button", { name: "Another" }).click();
    await expect(title).not.toHaveText(first);
  });

  test("location filter is a radiogroup; selection moves on click", async ({
    page,
  }) => {
    await page.goto("/");
    const group = page.getByRole("radiogroup", { name: "Location" });
    await expect(group).toBeVisible();
    // Scope the single-checked assertion to THIS group (T4).
    await expect(group.getByRole("radio", { checked: true })).toHaveCount(1);
    await expect(group.getByRole("radio", { name: /anywhere/i })).toBeChecked();
    // Behaviour, not snapshot: clicking another option moves the checked state.
    await group.getByRole("radio", { name: /street/i }).click();
    await expect(group.getByRole("radio", { name: /street/i })).toBeChecked();
    await expect(group.getByRole("radio", { checked: true })).toHaveCount(1);
  });

  test("mission detail surfaces approach + ethics cards for people missions", async ({
    page,
  }) => {
    await page.goto("/mission/one-stranger-one-yes");
    await expect(
      page.getByRole("heading", { name: /Approaching people/i }),
    ).toBeVisible();
    await expect(page.getByText("The spine")).toBeVisible();
  });

  test("theme toggle forces light on a dark device", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/settings");
    // Scope to the Appearance radiogroup so the selector can't catch a stray radio (T3).
    const appearance = page.getByRole("radiogroup", { name: "Appearance" });
    await appearance.getByRole("radio", { name: "Light" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  // axe across the routes that carry the new radiogroup + shared CTAs (T6),
  // in both colour schemes — fails on serious/critical only.
  const AXE_ROUTES = [
    "/",
    "/settings",
    "/diary",
    "/mission/one-stranger-one-yes",
    "/cull?mission=one-stranger-one-yes",
  ];
  for (const route of AXE_ROUTES) {
    for (const scheme of ["light", "dark"] as const) {
      test(`no serious/critical axe violations: ${route} (${scheme})`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(route);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa"])
          .analyze();
        const serious = results.violations.filter((v) =>
          ["serious", "critical"].includes(v.impact ?? ""),
        );
        expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
      });
    }
  }
});

test.describe("Mission favouriting (SPEC-mission-favouriting)", () => {
  test.beforeEach(async ({ page }) => {
    // Start clean: favourites are localStorage-only, but Playwright's browser
    // context can carry state across tests in the same worker.
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("framewalk.favourites"));
  });

  test("saving the shown mission flips the toggle and persists across reload (FR-F1/F5)", async ({
    page,
  }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", {
      name: /save this mission|saved — tap to remove/i,
    });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(toggle).toHaveAccessibleName("Saved — tap to remove");

    // Persistence check: the mission id landed in localStorage, no network call.
    const stored = await page.evaluate(() =>
      localStorage.getItem("framewalk.favourites"),
    );
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored ?? "[]")).toHaveLength(1);

    // Reload — the same mission (deterministic within the time-of-day window,
    // FR-1) should still show as saved (FR-F1/F5: survives offline/reload).
    await page.reload();
    const toggleAfterReload = page.getByRole("button", {
      name: /save this mission|saved — tap to remove/i,
    });
    await expect(toggleAfterReload).toHaveAttribute("aria-pressed", "true");
  });

  test("un-saving removes the mission id and updates the control immediately (FR-F2)", async ({
    page,
  }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", {
      name: /save this mission|saved — tap to remove/i,
    });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    const stored = await page.evaluate(() =>
      localStorage.getItem("framewalk.favourites"),
    );
    expect(JSON.parse(stored ?? "[]")).toEqual([]);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`no serious/critical axe violations with the favourite toggle present: / (${scheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");
      await expect(
        page.getByRole("button", {
          name: /save this mission|saved — tap to remove/i,
        }),
      ).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      const serious = results.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      );
      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    });
  }
});
