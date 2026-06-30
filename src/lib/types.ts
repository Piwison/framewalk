/** Shared domain types for FrameWalk. Type the boundaries; no `any`. */

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export type LocationType = "street" | "nature" | "home" | "travel";

export type Difficulty = "gentle" | "stretch" | "bold";

export interface Mission {
  readonly id: string;
  /** Short, warm title. */
  readonly title: string;
  /** Editorial prose — an invitation, never an order. Rendered in the serif. */
  readonly invitation: string;
  /** When this mission tends to land best. */
  readonly timesOfDay: readonly TimeOfDay[];
  readonly locationTypes: readonly LocationType[];
  readonly difficulty: Difficulty;
  /** If true, the Mission detail surfaces approach + ethics cards. */
  readonly involvesPeople: boolean;
  /** Light thematic tags for reflections, e.g. ["light","colour"]. */
  readonly themes: readonly string[];
}

/**
 * A diary entry — a "roll" of one or more kept frames with a single story.
 * A roll of 1 is the everyday single-photo case; rolls of N group the frames of
 * a themed walk that mean something together (SPEC-rolls, FR-R1..R5). Stored in
 * IndexedDB.
 */
export interface Keeper {
  readonly id: string;
  readonly missionId: string;
  readonly missionTitle: string;
  /** One-line story for the whole roll. May be empty — encouraged, never forced (FR-8). */
  readonly story: string;
  /**
   * The kept frames as small, locally generated thumbnails (1..N). These are the
   * ONLY image bytes we keep: there is no durable handle to the originals after
   * the OS picker closes, so the thumbnails ARE the saved keeper, by design.
   */
  readonly images: readonly Blob[];
  /** Which frame represents the roll in the diary. Defaults to 0 (Phase 1 never changes it). */
  readonly coverIndex: number;
  readonly createdAt: number;
}

/** Record of a mission having been served, for no-repeat-in-7-days (FR-2). */
export interface ServedMission {
  readonly missionId: string;
  readonly servedAt: number;
}
