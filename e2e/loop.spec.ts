import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("FrameWalk core loop", () => {
  test("Today shows a mission and 'another plate' changes it", async ({
    page,
  }) => {
    await page.goto("/");
    const title = page.getByRole("heading", { level: 2 });
    await expect(title).toBeVisible();
    const first = (await title.textContent())?.trim() ?? "";
    await page.getByRole("button", { name: "another plate" }).click();
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

  // The AXE_ROUTES scan of /cull only sees the import screen. Drive a frame in so
  // the darkroom review + story surfaces (buttons, textarea, grease-pencil) get a
  // real contrast check too — in both schemes, since the darkroom overrides both.
  async function axeSerious(page: import("@playwright/test").Page) {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    return results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
  }

  for (const scheme of ["light", "dark"] as const) {
    test(`darkroom cull review + story pass axe (${scheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/cull?mission=one-stranger-one-yes");

      // Generate a JPEG frame in-page and hand it to the file input.
      const bytes = await page.evaluate(async () => {
        const c = document.createElement("canvas");
        c.width = 400;
        c.height = 300;
        const g = c.getContext("2d")!;
        g.fillStyle = "#888";
        g.fillRect(0, 0, 400, 300);
        const blob: Blob = await new Promise((res) =>
          c.toBlob((b) => res(b!), "image/jpeg", 0.8),
        );
        return Array.from(new Uint8Array(await blob.arrayBuffer()));
      });
      await page.setInputFiles('input[type="file"]', {
        name: "frame.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from(bytes),
      });

      // Review phase.
      await expect(page.getByRole("button", { name: "Keep" })).toBeVisible();
      expect(await axeSerious(page)).toEqual([]);

      // Story phase (after the grease-pencil draw).
      await page.getByRole("button", { name: "Keep" }).click();
      await expect(page.getByRole("textbox", { name: /story/i })).toBeVisible();
      expect(await axeSerious(page)).toEqual([]);
    });
  }
});
