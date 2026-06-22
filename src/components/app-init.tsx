"use client";

import { useEffect } from "react";
import { ensurePersistentStorage } from "@/lib/storage";

/**
 * One-time browser bootstrap: register the offline service worker and ask the
 * browser to keep our IndexedDB data (eviction guard, grill fix B2). Renders
 * nothing. Failures are non-fatal — the app still works online.
 */
export function AppInit() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline support is an enhancement, not a requirement */
      });
    }
    void ensurePersistentStorage();
  }, []);

  return null;
}
