/**
 * Eviction guard (grill fix B2). IndexedDB is best-effort and can be wiped by
 * the browser — especially on iOS Safari — which would silently destroy the
 * user's diary. We request persistent storage and report the honest result so
 * the UI can tell the truth instead of implying the diary is permanent.
 */

export type PersistResult = "persisted" | "best-effort" | "unsupported";

export async function ensurePersistentStorage(): Promise<PersistResult> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) {
    return "unsupported";
  }
  try {
    if (await navigator.storage.persisted()) return "persisted";
    const granted = await navigator.storage.persist();
    return granted ? "persisted" : "best-effort";
  } catch {
    return "best-effort";
  }
}

export interface StorageEstimate {
  readonly usedBytes: number;
  readonly quotaBytes: number;
}

export async function storageEstimate(): Promise<StorageEstimate | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
    return null;
  }
  const { usage, quota } = await navigator.storage.estimate();
  return { usedBytes: usage ?? 0, quotaBytes: quota ?? 0 };
}
