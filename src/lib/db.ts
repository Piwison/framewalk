import Dexie, { type Table } from "dexie";
import type { Keeper, ServedMission } from "./types";

/**
 * On-device storage only. Nothing here ever touches the network (FR-7, FR-11).
 * The diary lives in IndexedDB; see `storage.ts` for the eviction guard.
 */

/**
 * A mutable view of a keeper row during the v1→v2 upgrade. Dexie's `modify`
 * mutates rows in place, so this deliberately drops the `readonly` markers and
 * keeps both the old (`thumbnail`) and new (`images`/`coverIndex`) fields optional.
 */
export interface KeeperUpgradeRow {
  thumbnail?: Blob;
  images?: Blob[];
  coverIndex?: number;
}

/**
 * Rolls migration (FR-R5): turn a v1 single-image keeper into a roll of 1,
 * in place and without data loss. Idempotent — a row already carrying `images`
 * is left untouched. Pure and exported so the upgrade can be unit-tested.
 */
export function migrateKeeperV1ToV2(row: KeeperUpgradeRow): void {
  if (row.thumbnail && !row.images) {
    row.images = [row.thumbnail];
    row.coverIndex = 0;
    delete row.thumbnail;
  }
}

class FrameWalkDB extends Dexie {
  keepers!: Table<Keeper, string>;
  served!: Table<ServedMission, string>;

  constructor() {
    super("framewalk");
    // Indexed fields only; blobs ride along on the row (not indexed).
    this.version(1).stores({
      keepers: "id, createdAt, missionId",
      served: "missionId, servedAt",
    });
    // v2 — Rolls: a keeper holds 1..N frames with one story (SPEC-rolls, FR-R5).
    // Non-destructive: every existing single-image row becomes a roll of 1.
    this.version(2)
      .stores({
        keepers: "id, createdAt, missionId",
        served: "missionId, servedAt",
      })
      .upgrade((tx) =>
        tx
          .table<KeeperUpgradeRow>("keepers")
          .toCollection()
          .modify(migrateKeeperV1ToV2),
      );
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
