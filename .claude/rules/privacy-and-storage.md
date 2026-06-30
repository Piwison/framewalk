---
description: On-device privacy model and IndexedDB/Dexie discipline.
paths: ["src/lib/**", "src/components/**"]
---

# Privacy and storage are structural, not aspirational

- **On-device only.** Nothing in the diary path ever touches the network (FR-7, FR-11). The
  CSP in `next.config.ts` (`connect-src 'self'`, `img-src 'self' blob: data:`) is the
  enforcement — never relax it, never add an off-device data path. Zero analytics.
- **Thumbnails are the saved data.** There's no durable handle to the original photo after the
  OS picker closes; the on-device thumbnail(s) ARE the keeper, by design.
- **Eviction guard.** IndexedDB is evictable (esp. iOS) — `src/lib/storage.ts` calls
  `navigator.storage.persist()` and Settings tells the truth about local-only storage + offers
  on-device export.
- **Dexie migrations** are a "Jason sign-off" change. They must be **non-destructive**,
  **idempotent**, and **unit-tested** before shipping (extract the row transform to a pure
  function and test it; seed the prior version and assert no data loss). Bump the version and
  the export `version` together.
- Reads happen client-side only (guard SSR: `db()` throws if `indexedDB` is undefined).
