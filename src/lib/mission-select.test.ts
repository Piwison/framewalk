import { describe, it, expect } from "vitest";
import {
  anotherMission,
  eligibleMissions,
  missionOfTheDay,
  recentMissionIds,
  timeOfDayFor,
} from "./mission-select";
import type { Mission } from "./types";

const M = (over: Partial<Mission> & Pick<Mission, "id">): Mission => ({
  title: over.id,
  invitation: "…",
  timesOfDay: ["morning", "afternoon", "evening", "night"],
  locationTypes: ["street", "nature", "home", "travel"],
  difficulty: "gentle",
  involvesPeople: false,
  themes: [],
  ...over,
});

const at = (h: number) => new Date(2026, 5, 22, h, 0, 0);

describe("timeOfDayFor", () => {
  it("buckets the clock into parts of day", () => {
    expect(timeOfDayFor(at(7))).toBe("morning");
    expect(timeOfDayFor(at(13))).toBe("afternoon");
    expect(timeOfDayFor(at(19))).toBe("evening");
    expect(timeOfDayFor(at(23))).toBe("night");
    expect(timeOfDayFor(at(3))).toBe("night");
  });
});

describe("eligibleMissions", () => {
  const lib = [
    M({ id: "morning-only", timesOfDay: ["morning"] }),
    M({ id: "evening-only", timesOfDay: ["evening"] }),
    M({ id: "street-only", locationTypes: ["street"] }),
    M({ id: "home-only", locationTypes: ["home"] }),
  ];

  it("filters by time of day", () => {
    const ids = eligibleMissions(lib, { now: at(7) }).map((m) => m.id);
    expect(ids).toContain("morning-only");
    expect(ids).not.toContain("evening-only");
  });

  it("filters by location when given", () => {
    const ids = eligibleMissions(lib, { now: at(7), locationType: "home" }).map(
      (m) => m.id,
    );
    expect(ids).toContain("home-only");
    expect(ids).not.toContain("street-only");
  });

  it("drops the no-repeat constraint when the pool is exhausted (FR-2)", () => {
    const single = [M({ id: "lonely", timesOfDay: ["morning"] })];
    const result = eligibleMissions(single, {
      now: at(7),
      recentIds: ["lonely"],
    });
    expect(result.map((m) => m.id)).toEqual(["lonely"]);
  });

  it("never returns empty — widens filters rather than showing nothing", () => {
    const onlyNight = [M({ id: "n", timesOfDay: ["night"], locationTypes: ["travel"] })];
    const result = eligibleMissions(onlyNight, { now: at(9), locationType: "home" });
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("missionOfTheDay", () => {
  it("is stable on reload within the same time-of-day window (FR-1)", () => {
    const lib = [M({ id: "a" }), M({ id: "b" }), M({ id: "c" }), M({ id: "d" })];
    // Two morning hours on the same day must yield the same mission.
    const a = missionOfTheDay(lib, { now: at(8) });
    const b = missionOfTheDay(lib, { now: at(10) });
    expect(a?.id).toBe(b?.id);
  });

  it("may change as the day moves between time-of-day windows", () => {
    // Missions tagged to a single window prove the pool shifts with the clock.
    const lib = [
      M({ id: "morning", timesOfDay: ["morning"] }),
      M({ id: "evening", timesOfDay: ["evening"] }),
    ];
    expect(missionOfTheDay(lib, { now: at(8) })?.id).toBe("morning");
    expect(missionOfTheDay(lib, { now: at(19) })?.id).toBe("evening");
  });

  it("respects the no-repeat window", () => {
    const lib = [M({ id: "a" }), M({ id: "b" })];
    const chosen = missionOfTheDay(lib, { now: at(10), recentIds: ["a"] });
    expect(chosen?.id).toBe("b");
  });
});

describe("anotherMission", () => {
  it("returns a different mission than the current one", () => {
    const lib = [M({ id: "a" }), M({ id: "b" }), M({ id: "c" })];
    const next = anotherMission(lib, { now: at(10) }, "a");
    expect(next?.id).not.toBe("a");
  });

  it("keeps the current mission when it is the only eligible one", () => {
    const lib = [M({ id: "a", timesOfDay: ["morning"] })];
    const next = anotherMission(lib, { now: at(7) }, "a");
    expect(next?.id).toBe("a");
  });
});

describe("recentMissionIds", () => {
  it("keeps only ids served within the last 7 days", () => {
    const now = at(12);
    const within = now.getTime() - 2 * 86_400_000;
    const old = now.getTime() - 9 * 86_400_000;
    const ids = recentMissionIds(
      [
        { missionId: "fresh", servedAt: within },
        { missionId: "stale", servedAt: old },
      ],
      now,
    );
    expect(ids).toEqual(["fresh"]);
  });
});
