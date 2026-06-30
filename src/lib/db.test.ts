import { describe, it, expect } from "vitest";
import { migrateKeeperV1ToV2, type KeeperUpgradeRow } from "./db";

describe("migrateKeeperV1ToV2 (Rolls v1→v2, FR-R5)", () => {
  it("turns a single-image keeper into a roll of 1 with no data loss", () => {
    const thumb = new Blob(["x"]);
    const row: KeeperUpgradeRow = { thumbnail: thumb };
    migrateKeeperV1ToV2(row);
    expect(row.images).toEqual([thumb]);
    expect(row.coverIndex).toBe(0);
    expect(row.thumbnail).toBeUndefined();
  });

  it("is idempotent — leaves an already-migrated roll untouched", () => {
    const a = new Blob(["a"]);
    const b = new Blob(["b"]);
    const row: KeeperUpgradeRow = { images: [a, b], coverIndex: 0 };
    migrateKeeperV1ToV2(row);
    expect(row.images).toEqual([a, b]);
    expect(row.coverIndex).toBe(0);
  });
});
