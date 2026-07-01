import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * E2E for SPEC-diary-filters (FR-DF1..DF10). The live diary is empty by default and the
 * bar is threshold-gated (≥6 keepers, ≥2 themes), so we seed rows straight into the app's
 * Dexie-backed IndexedDB ("framewalk" v2, "keepers" store) before each test that needs the
 * bar, using real mission ids (see src/lib/missions.ts) spanning ≥2 themes + a people mission.
 *
 * A Keeper row (SPEC-rolls v2 shape): { id, missionId, missionTitle, story, images: Blob[],
 * coverIndex, createdAt }. We open the DB at version 2 directly (matching db.ts) rather than
 * loading Dexie in the page, so seeding has no dependency on the app's bundle internals.
 */

interface SeedKeeper {
  id: string;
  missionId: string;
  missionTitle: string;
  story: string;
  coverIndex: number;
  createdAt: number;
}

// Real missions (src/lib/missions.ts): spans light/shadow/colour themes + one people mission,
// plus one free-walk id with no matching mission (FR-DF5). Timestamps are anchored to "now"
// (each a few minutes apart, most-recent-first is irrelevant here) so ReflectionCard's
// "this week" window (reflection.ts, last 7 days) actually includes every seeded keeper —
// using near-epoch timestamps would silently fall outside the window and read as "0 walks".
const NOW = Date.now();
const MIN = 60_000;
const SEED: SeedKeeper[] = [
  {
    id: "seed-1",
    missionId: "first-light-edges",
    missionTitle: "Where the first light lands",
    story: "",
    coverIndex: 0,
    createdAt: NOW - 6 * MIN,
  },
  {
    id: "seed-2",
    missionId: "first-light-edges",
    missionTitle: "Where the first light lands",
    story: "",
    coverIndex: 0,
    createdAt: NOW - 5 * MIN,
  },
  {
    id: "seed-3",
    missionId: "blue-hour-warmth",
    missionTitle: "Blue hour warmth",
    story: "",
    coverIndex: 0,
    createdAt: NOW - 4 * MIN,
  },
  {
    id: "seed-4",
    missionId: "the-colour-of-the-day",
    missionTitle: "The colour of the day",
    story: "",
    coverIndex: 0,
    createdAt: NOW - 3 * MIN,
  },
  {
    id: "seed-5",
    missionId: "hands-at-work",
    missionTitle: "Hands at work",
    story: "",
    coverIndex: 0,
    createdAt: NOW - 2 * MIN,
  },
  {
    id: "seed-6",
    missionId: "negative-space-walk",
    missionTitle: "Mostly nothing",
    story: "",
    coverIndex: 0,
    createdAt: NOW - 1 * MIN,
  },
  {
    id: "seed-7",
    missionId: "solo-free-walk-not-a-mission",
    missionTitle: "Free walk",
    story: "",
    coverIndex: 0,
    createdAt: NOW,
  },
];

async function seedKeepers(page: Page, rows: SeedKeeper[]) {
  await page.goto("/"); // establish an origin before touching indexedDB
  await page.evaluate((seedRows) => {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.open("framewalk", 2);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("keepers")) {
          const store = db.createObjectStore("keepers", { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
          store.createIndex("missionId", "missionId");
        }
        if (!db.objectStoreNames.contains("served")) {
          const served = db.createObjectStore("served", {
            keyPath: "missionId",
          });
          served.createIndex("servedAt", "servedAt");
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("keepers", "readwrite");
        const store = tx.objectStore("keepers");
        for (const row of seedRows) {
          // A 1x1 transparent PNG blob stands in for a real thumbnail — small, valid image bytes.
          const bytes = Uint8Array.from(
            atob(
              "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
            ),
            (c) => c.charCodeAt(0),
          );
          const blob = new Blob([bytes], { type: "image/png" });
          store.put({ ...row, images: [blob] });
        }
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
  }, rows);
}

async function clearKeepers(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase("framewalk");
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      req.onblocked = () => resolve();
    });
  });
}

test.describe("Diary filters (SPEC-diary-filters)", () => {
  test.afterEach(async ({ page }) => {
    await clearKeepers(page);
  });

  test("below threshold: no radiogroup, diary shows every keeper (FR-DF1)", async ({
    page,
  }) => {
    await seedKeepers(page, SEED.slice(0, 3)); // 3 keepers, below the 6-keeper floor
    await page.goto("/diary");

    await expect(
      page.getByRole("radiogroup", { name: /filter diary/i }),
    ).toHaveCount(0);
    await expect(page.locator("main").getByRole("listitem")).toHaveCount(3);
  });

  test("above threshold: radiogroup appears with All selected, theme narrows, All restores (FR-DF2/DF3/DF5/DF6)", async ({
    page,
  }) => {
    await seedKeepers(page, SEED); // 7 keepers, ≥2 themes -> bar appears
    await page.goto("/diary");

    const group = page.getByRole("radiogroup", { name: /filter diary/i });
    await expect(group).toBeVisible();
    await expect(
      group.getByRole("radio", { name: /show all keepers/i }),
    ).toBeChecked();
    await expect(page.locator("main").getByRole("listitem")).toHaveCount(7);

    // "light" (first-light-edges x2 + blue-hour-warmth x1 = 3) is the top-count theme chip.
    const lightChip = group.getByRole("radio", {
      name: /show keepers themed light/i,
    });
    await lightChip.click();
    await expect(lightChip).toBeChecked();
    await expect(page.locator("main").getByRole("listitem")).toHaveCount(3);

    // The free-walk keeper never appears under a theme filter.
    await expect(page.getByText(/free walk/i)).toHaveCount(0);

    // "All" restores the full pile.
    await group.getByRole("radio", { name: /show all keepers/i }).click();
    await expect(page.locator("main").getByRole("listitem")).toHaveCount(7);
  });

  test('"With people" narrows to the people mission (FR-DF4)', async ({
    page,
  }) => {
    await seedKeepers(page, SEED);
    await page.goto("/diary");

    const group = page.getByRole("radiogroup", { name: /filter diary/i });
    const peopleChip = group.getByRole("radio", {
      name: /show keepers with people/i,
    });
    await peopleChip.click();
    await expect(peopleChip).toBeChecked();
    // Only "hands-at-work" (involvesPeople: true) is in the seeded set.
    await expect(page.locator("main").getByRole("listitem")).toHaveCount(1);
    await expect(page.getByText(/hands at work/i)).toBeVisible();
  });

  test("Reflection tallies above the list are unchanged by the active filter (FR-DF8)", async ({
    page,
  }) => {
    await seedKeepers(page, SEED); // 7 keepers seeded, all createdAt within "this week"
    await page.goto("/diary");

    // ReflectionCard renders a "Reflection" label + "N walks this week, N keepers kept."
    // (reflection-card.tsx) — capture its exact text while the filter is "All". All 7 seeded
    // keepers land on the same calendar day, so this reads "1 walk this week, 7 keepers kept."
    // (weekWalks counts distinct days, weekKeepers counts rows — see reflection.ts).
    const reflectionLabel = page.getByText("Reflection", { exact: true });
    await expect(reflectionLabel).toBeVisible();
    const card = reflectionLabel.locator("..");
    const before = await card.innerText();
    expect(before).toContain("7 keepers kept");

    // Narrow the visible list to just the one people keeper.
    const group = page.getByRole("radiogroup", { name: /filter diary/i });
    await group
      .getByRole("radio", { name: /show keepers with people/i })
      .click();
    await expect(page.locator("main").getByRole("listitem")).toHaveCount(1);

    // FR-DF8: ReflectionCard reads allKeepers() independently of the diary filter —
    // its text must be byte-identical whether "All" or a narrow filter is active.
    const after = await card.innerText();
    expect(after).toBe(before);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`axe: no serious/critical violations on /diary with the filter bar present (${scheme})`, async ({
      page,
    }) => {
      await seedKeepers(page, SEED);
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/diary");

      await expect(
        page.getByRole("radiogroup", { name: /filter diary/i }),
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
