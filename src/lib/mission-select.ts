import type { LocationType, Mission, TimeOfDay } from "./types";

/** Pure mission-selection logic. No globals, no Date.now() -- `now` is passed in
 *  so every branch is deterministic and unit-testable (FR-1, FR-2, FR-3). */

const DAY_MS = 86_400_000;
const NO_REPEAT_WINDOW_DAYS = 7;

export function timeOfDayFor(date: Date): TimeOfDay {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export interface SelectionContext {
  readonly now: Date;
  /** Optional location filter (PRD FR-1). Omit to match any location. */
  readonly locationType?: LocationType;
  /** Mission ids served within the no-repeat window (FR-2). */
  readonly recentIds?: readonly string[];
}

/**
 * Eligible missions for the moment, applying filters with graceful fallback so
 * the user is never left with an empty Today screen:
 *   1. time-of-day + location + not-recently-served
 *   2. drop the no-repeat constraint (pool exhausted, per FR-2)
 *   3. drop the location constraint
 *   4. last resort: the whole library
 */
export function eligibleMissions(
  missions: readonly Mission[],
  ctx: SelectionContext,
): readonly Mission[] {
  const tod = timeOfDayFor(ctx.now);
  const recent = new Set(ctx.recentIds ?? []);
  const loc = ctx.locationType;

  const byTime = missions.filter((m) => m.timesOfDay.includes(tod));
  const byLocation = loc
    ? byTime.filter((m) => m.locationTypes.includes(loc))
    : byTime;

  const fresh = byLocation.filter((m) => !recent.has(m.id));
  if (fresh.length > 0) return fresh;
  if (byLocation.length > 0) return byLocation;
  if (byTime.length > 0) return byTime;
  return missions;
}

/** Deterministic index for a list given a seed, so "today" is stable on reload. */
function pickIndex(length: number, seed: number): number {
  if (length <= 0) return -1;
  let x = seed | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return Math.abs(x) % length;
}

/**
 * The mission for right now -- stable for a given calendar day within the same
 * time-of-day window and filters (so it does not reshuffle on reload), but it
 * intentionally changes as the day moves from morning to evening (FR-1).
 */
export function missionOfTheDay(
  missions: readonly Mission[],
  ctx: SelectionContext,
): Mission | undefined {
  const pool = eligibleMissions(missions, ctx);
  const daySeed = Math.floor(ctx.now.getTime() / DAY_MS);
  const idx = pickIndex(pool.length, daySeed);
  return idx >= 0 ? pool[idx] : undefined;
}

/** "Show me another" -- a different eligible mission than the current one (FR-2). */
export function anotherMission(
  missions: readonly Mission[],
  ctx: SelectionContext,
  currentId: string,
): Mission | undefined {
  const pool = eligibleMissions(missions, ctx).filter((m) => m.id !== currentId);
  if (pool.length === 0) {
    return missions.find((m) => m.id === currentId);
  }
  const idx = pickIndex(pool.length, Math.floor(ctx.now.getTime() / 60_000));
  return idx >= 0 ? pool[idx] : undefined;
}

/** Filter a served-log down to ids still inside the no-repeat window. */
export function recentMissionIds(
  served: readonly { readonly missionId: string; readonly servedAt: number }[],
  now: Date,
): string[] {
  const cutoff = now.getTime() - NO_REPEAT_WINDOW_DAYS * DAY_MS;
  const ids: string[] = [];
  for (const entry of served) {
    if (entry.servedAt >= cutoff) ids.push(entry.missionId);
  }
  return ids;
}

export function findMission(
  missions: readonly Mission[],
  id: string,
): Mission | undefined {
  return missions.find((m) => m.id === id);
}
