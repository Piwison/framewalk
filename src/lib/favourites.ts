/**
 * Favourite missions — a tiny on-device preference (SPEC-mission-favouriting, FR-F1..F8).
 * A favourite is just a mission id. This is UI preference, not diary content, so it lives in
 * `localStorage` (no Dexie, no export, no schema migration). Never touches the network.
 *
 * SSR-safe (guards `localStorage`) and corruption-safe (bad/missing JSON → empty), so first
 * run and private mode behave exactly as today with no error surfaced (FR-F8).
 */

const KEY = "framewalk.favourites";

export function readFavourites(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function isFavourite(id: string): boolean {
  return readFavourites().includes(id);
}

/** Toggle a mission's favourite state; returns the new list. No-op on write failure. */
export function toggleFavourite(id: string): string[] {
  const current = readFavourites();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(next));
    }
  } catch {
    /* private mode / quota: keep the in-memory result, surface nothing (FR-F8) */
  }
  return next;
}
