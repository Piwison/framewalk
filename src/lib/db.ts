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
    throw new Error("IndexedDB is unavailable (server or unsupported runtime).");
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

export async function recordServed(missionId: string, now: number): Promise<void> {
  await db().served.put({ missionId, servedAt: now });
}

export async function servedLog(): Promise<ServedMission[]> {
  return db().served.toArray();
}

export async function keeperCount(): Promise<number> {
  return db().keepers.count();
}
