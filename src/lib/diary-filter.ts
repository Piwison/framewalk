import type { Keeper, Mission } from "./types";

/**
 * Pure diary filtering (SPEC-diary-filters, FR-DF1..DF10). Client-only, no storage, no network:
 * a view over keepers already loaded, joined to their mission by `missionId` — the same join
 * `reflection.ts` uses. A free-walk keeper (no matching mission) appears only under "All".
 */

export type DiaryFilter =
  | { readonly kind: "all" }
  | { readonly kind: "theme"; readonly theme: string }
  | { readonly kind: "people" };

export const ALL_FILTER: DiaryFilter = { kind: "all" };

/** Diary must be big/varied enough before a filter bar earns its place (FR-DF1). */
const MIN_KEEPERS = 6;
const MIN_THEMES = 2;

function missionsById(missions: readonly Mission[]): Map<string, Mission> {
  return new Map(missions.map((m) => [m.id, m]));
}

/**
 * Distinct themes present across the user's own keepers (via joined missions), ordered by
 * descending keeper count with an alphabetical tiebreak — strongest thread nearest "All",
 * deterministic so the bar never reshuffles (design spec §2).
 */
export function availableThemes(
  keepers: readonly Keeper[],
  missions: readonly Mission[],
): string[] {
  const byId = missionsById(missions);
  const counts = new Map<string, number>();
  for (const k of keepers) {
    const m = byId.get(k.missionId);
    if (!m) continue;
    for (const t of m.themes) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([theme]) => theme);
}

/** Whether to render the filter bar at all (FR-DF1) — hidden below the threshold. */
export function shouldShowFilterBar(
  keepers: readonly Keeper[],
  missions: readonly Mission[],
): boolean {
  return (
    keepers.length >= MIN_KEEPERS &&
    availableThemes(keepers, missions).length >= MIN_THEMES
  );
}

/** Apply a filter to keepers, preserving order. "All" returns every keeper (FR-DF6). */
export function filterKeepers(
  keepers: readonly Keeper[],
  missions: readonly Mission[],
  filter: DiaryFilter,
): Keeper[] {
  if (filter.kind === "all") return [...keepers];
  const byId = missionsById(missions);
  return keepers.filter((k) => {
    const m = byId.get(k.missionId);
    if (!m) return false; // free walk: excluded from every filter except "all" (FR-DF5)
    return filter.kind === "theme"
      ? m.themes.includes(filter.theme)
      : m.involvesPeople; // kind === "people" (FR-DF4)
  });
}
