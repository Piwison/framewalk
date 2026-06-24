import type { Difficulty, Keeper, Mission } from "./types";

/**
 * Weekly reflection — pure, deterministic aggregation of the user's OWN diary.
 * No AI, no network: just tallies of what they kept. `now` is passed in so every
 * window is testable. Tone is set by the UI; this module only counts.
 */

const DAY_MS = 86_400_000;

export interface ReflectionInput {
  readonly now: Date;
  readonly keepers: readonly Keeper[];
  readonly missions: readonly Mission[];
}

export interface ThemeCount {
  readonly theme: string;
  readonly count: number;
}

export interface Reflection {
  readonly totalKeepers: number;
  /** last 7 days */
  readonly weekKeepers: number;
  readonly weekWalks: number;
  /** last 30 days */
  readonly monthKeepers: number;
  readonly monthWalks: number;
  /** share of last-30-day keepers that carry a story line (0..1) */
  readonly storyRate: number;
  /** top themes practiced in the last 30 days (max 3) */
  readonly topThemes: readonly ThemeCount[];
  readonly difficultyMix: Readonly<Record<Difficulty, number>>;
  /** last-30-day keepers from people missions */
  readonly peopleKeepers: number;
}

/** A "walk" = a distinct local calendar day on which at least one keeper was saved. */
function distinctDays(list: readonly Keeper[]): number {
  const days = new Set<number>();
  for (const k of list) days.add(Math.floor(k.createdAt / DAY_MS));
  return days.size;
}

export function buildReflection({
  now,
  keepers,
  missions,
}: ReflectionInput): Reflection {
  const nowMs = now.getTime();
  const weekCut = nowMs - 7 * DAY_MS;
  const monthCut = nowMs - 30 * DAY_MS;
  const byId = new Map(missions.map((m) => [m.id, m]));

  const inWeek = keepers.filter((k) => k.createdAt >= weekCut);
  const inMonth = keepers.filter((k) => k.createdAt >= monthCut);

  const themeTally = new Map<string, number>();
  const difficultyMix: Record<Difficulty, number> = {
    gentle: 0,
    stretch: 0,
    bold: 0,
  };
  let peopleKeepers = 0;
  let withStory = 0;

  for (const k of inMonth) {
    if (k.story.trim().length > 0) withStory += 1;
    const m = byId.get(k.missionId);
    if (!m) continue; // free-walk keeper with no mission — counts in totals only
    difficultyMix[m.difficulty] += 1;
    if (m.involvesPeople) peopleKeepers += 1;
    for (const t of m.themes) themeTally.set(t, (themeTally.get(t) ?? 0) + 1);
  }

  const topThemes: ThemeCount[] = [...themeTally.entries()]
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count || a.theme.localeCompare(b.theme))
    .slice(0, 3);

  return {
    totalKeepers: keepers.length,
    weekKeepers: inWeek.length,
    weekWalks: distinctDays(inWeek),
    monthKeepers: inMonth.length,
    monthWalks: distinctDays(inMonth),
    storyRate: inMonth.length === 0 ? 0 : withStory / inMonth.length,
    topThemes,
    difficultyMix,
    peopleKeepers,
  };
}
