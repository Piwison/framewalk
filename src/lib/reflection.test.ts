import { describe, it, expect } from "vitest";
import { buildReflection } from "./reflection";
import type { Keeper, Mission } from "./types";

const now = new Date(2026, 5, 23, 12, 0, 0);
const daysAgo = (n: number, h = 12) =>
  new Date(2026, 5, 23 - n, h, 0, 0).getTime();

const M = (over: Partial<Mission> & Pick<Mission, "id" | "themes">): Mission => ({
  title: over.id,
  invitation: "…",
  timesOfDay: ["morning"],
  locationTypes: ["street"],
  difficulty: "gentle",
  involvesPeople: false,
  ...over,
});

const missions: Mission[] = [
  M({ id: "a", themes: ["light", "colour"], difficulty: "gentle" }),
  M({ id: "b", themes: ["light"], difficulty: "bold", involvesPeople: true }),
];

const K = (
  id: string,
  missionId: string,
  createdAt: number,
  story = "",
): Keeper => ({
  id,
  missionId,
  missionTitle: missionId,
  story,
  thumbnail: new Blob(),
  createdAt,
});

describe("buildReflection", () => {
  it("counts week vs month keepers and distinct walks", () => {
    const keepers = [
      K("1", "a", daysAgo(0)),
      K("2", "a", daysAgo(0, 18)), // same day as #1 -> one walk
      K("3", "b", daysAgo(3)),
      K("4", "a", daysAgo(20)), // within month, outside week
      K("5", "a", daysAgo(40)), // outside month
    ];
    const r = buildReflection({ now, keepers, missions });
    expect(r.totalKeepers).toBe(5);
    expect(r.weekKeepers).toBe(3);
    expect(r.weekWalks).toBe(2); // day 0 (x2) + day 3
    expect(r.monthKeepers).toBe(4);
    expect(r.monthWalks).toBe(3);
  });

  it("tallies top themes from originating missions (last 30d)", () => {
    const keepers = [
      K("1", "a", daysAgo(1)), // light, colour
      K("2", "b", daysAgo(2)), // light
      K("3", "b", daysAgo(3)), // light
    ];
    const r = buildReflection({ now, keepers, missions });
    expect(r.topThemes[0]).toEqual({ theme: "light", count: 3 });
    expect(r.topThemes.find((t) => t.theme === "colour")?.count).toBe(1);
  });

  it("computes difficulty mix, people count, and story rate", () => {
    const keepers = [
      K("1", "a", daysAgo(1), "a line"), // gentle, story
      K("2", "b", daysAgo(2)), // bold, people, no story
    ];
    const r = buildReflection({ now, keepers, missions });
    expect(r.difficultyMix).toEqual({ gentle: 1, stretch: 0, bold: 1 });
    expect(r.peopleKeepers).toBe(1);
    expect(r.storyRate).toBeCloseTo(0.5);
  });

  it("is empty-safe and ignores unknown missions for theme tallies", () => {
    const r0 = buildReflection({ now, keepers: [], missions });
    expect(r0.weekKeepers).toBe(0);
    expect(r0.storyRate).toBe(0);
    expect(r0.topThemes).toEqual([]);
    const r1 = buildReflection({
      now,
      keepers: [K("x", "free", daysAgo(1))], // no matching mission
      missions,
    });
    expect(r1.totalKeepers).toBe(1);
    expect(r1.topThemes).toEqual([]);
  });
});
