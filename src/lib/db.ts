import Dexie, { type Table } from "dexie";
import type { Keeper, ServedMission } from "./types";

/**
 * On-device storage only. Nothing here ever touches the network (FR-7, FR-11).
 * The diary lives in IndexedDB; see `storage.ts` for the eviction guard.
 */
class FrameWalkDB extends Dexie {
  keepers!: Table<Keeper, string>;
  served!: Table<ServedMission, string>;

  constructor() {
    super("framewalk");
    this.version(1).stores({
      // Indexed fields only; blobs ride along on the row.
      keepers: "id, createdAt, missionId",
      served: "missionId, servedAt",
    });
  }
}

let _db: FrameWalkDB | null = null;

/** Lazily construct the DB in the browser only (avoids SSR touching IndexedDB). */
export function db(): FrameWalkDB {
  if (typeof indexedDB === "undefined") {
    throw new Error(
      "IndexedDB is unavailable (server or unsupported runtime).",
    );
  }
  _db ??= new FrameWalkDB();
  return _db;
}

export async function addKeeper(keeper: Keeper): Promise<void> {
  await db().keepers.add(keeper);
}

export async function allKeepers(): Promise<Keeper[]> {
  // Reverse-chronological for the diary (FR-9).
  return db().keepers.orderBy("createdAt").reverse().toArray();
}

export async function deleteKeeper(id: string): Promise<void> {
  await db().keepers.delete(id);
}

/** Rewrite a keeper's story in place. The photo and date are never edited —
 *  only the line the diarist chose to add or revise. Dexie's `.update()`
 *  resolves to 0 (not a throw) if the row is already gone — e.g. deleted from
 *  another tab while this one had it open for editing — so a silent 0 is
 *  turned into a throw here rather than reported as a successful save. */
export async function updateKeeperStory(
  id: string,
  story: string,
): Promise<void> {
  const updated = await db().keepers.update(id, { story });
  if (updated === 0) {
    throw new Error(`Keeper ${id} no longer exists.`);
  }
}

export async function recordServed(
  missionId: string,
  now: number,
): Promise<void> {
  await db().served.put({ missionId, servedAt: now });
}

export async function servedLog(): Promise<ServedMission[]> {
  return db().served.toArray();
}

export async function keeperCount(): Promise<number> {
  return db().keepers.count();
}
