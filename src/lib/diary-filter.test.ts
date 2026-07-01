import { describe, it, expect } from "vitest";
import {
  availableThemes,
  shouldShowFilterBar,
  filterKeepers,
} from "./diary-filter";
import type { Keeper, Mission } from "./types";

const M = (
  over: Partial<Mission> & Pick<Mission, "id" | "themes">,
): Mission => ({
  title: over.id,
  invitation: "…",
  timesOfDay: ["morning"],
  locationTypes: ["street"],
  difficulty: "gentle",
  involvesPeople: false,
  ...over,
});

const missions: Mission[] = [
  M({ id: "a", themes: ["light", "colour"] }),
  M({ id: "b", themes: ["light"], involvesPeople: true }),
  M({ id: "c", themes: ["shadow"] }),
];

const K = (id: string, missionId: string): Keeper => ({
  id,
  missionId,
  missionTitle: missionId,
  story: "",
  images: [new Blob()],
  coverIndex: 0,
  createdAt: 0,
});

describe("availableThemes", () => {
  it("orders themes by descending keeper count, alphabetical tiebreak", () => {
    // light: a + b = 2; colour: a = 1; shadow: c = 1 → light first, then colour/shadow by name.
    const keepers = [K("1", "a"), K("2", "b"), K("3", "c")];
    expect(availableThemes(keepers, missions)).toEqual([
      "light",
      "colour",
      "shadow",
    ]);
  });

  it("ignores free-walk keepers with no matching mission", () => {
    const keepers = [K("1", "a"), K("2", "free")];
    expect(availableThemes(keepers, missions)).toEqual(["colour", "light"]);
  });
});

describe("shouldShowFilterBar (FR-DF1)", () => {
  it("is hidden below 6 keepers", () => {
    const keepers = [K("1", "a"), K("2", "c")]; // 2 themes but too few keepers
    expect(shouldShowFilterBar(keepers, missions)).toBe(false);
  });

  it("is hidden with fewer than 2 distinct themes", () => {
    // 6 keepers but all from mission "b" → only the "light" theme
    const keepers = Array.from({ length: 6 }, (_, i) => K(String(i), "b"));
    expect(shouldShowFilterBar(keepers, missions)).toBe(false);
  });

  it("shows once ≥6 keepers and ≥2 themes are present", () => {
    const keepers = [
      K("1", "a"),
      K("2", "a"),
      K("3", "b"),
      K("4", "c"),
      K("5", "c"),
      K("6", "b"),
    ];
    expect(shouldShowFilterBar(keepers, missions)).toBe(true);
  });
});

describe("filterKeepers", () => {
  const keepers = [K("1", "a"), K("2", "b"), K("3", "c"), K("4", "free")];

  it("returns every keeper (incl. free walk) under 'all' (FR-DF6)", () => {
    const ids = filterKeepers(keepers, missions, { kind: "all" }).map(
      (k) => k.id,
    );
    expect(ids).toEqual(["1", "2", "3", "4"]);
  });

  it("filters by theme, excluding free walks (FR-DF3/DF5)", () => {
    const ids = filterKeepers(keepers, missions, {
      kind: "theme",
      theme: "light",
    }).map((k) => k.id);
    expect(ids).toEqual(["1", "2"]); // a + b carry "light"; free walk excluded
  });

  it("filters to with-people missions (FR-DF4)", () => {
    const ids = filterKeepers(keepers, missions, { kind: "people" }).map(
      (k) => k.id,
    );
    expect(ids).toEqual(["2"]); // only b involves people
  });

  it("yields an empty list when nothing matches (FR-DF7 territory)", () => {
    const ids = filterKeepers(keepers, missions, {
      kind: "theme",
      theme: "nonexistent",
    });
    expect(ids).toEqual([]);
  });
});
