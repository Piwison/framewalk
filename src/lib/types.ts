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

/** A kept photo with its story — the diary's unit. Stored in IndexedDB. */
export interface Keeper {
  readonly id: string;
  readonly missionId: string;
  readonly missionTitle: string;
  /** One-line story. May be empty — encouraged, never forced (FR-8). */
  readonly story: string;
  /**
   * A small, locally generated thumbnail. This is the ONLY image bytes we keep.
   * There is no durable handle to the original after the OS picker closes, so
   * the thumbnail IS the saved keeper by design (documented, intentional).
   */
  readonly thumbnail: Blob;
  readonly createdAt: number;
}

/** Record of a mission having been served, for no-repeat-in-7-days (FR-2). */
export interface ServedMission {
  readonly missionId: string;
  readonly servedAt: number;
}
