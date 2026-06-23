"use client";

import { useEffect, useState } from "react";
import {
  ensurePersistentStorage,
  storageEstimate,
  type PersistResult,
} from "@/lib/storage";
import { allKeepers } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function mb(bytes: number): string {
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

export function SettingsPanel() {
  const [persist, setPersist] = useState<PersistResult | null>(null);
  const [usage, setUsage] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    ensurePersistentStorage()
      .then(setPersist)
      .catch(() => setPersist("best-effort"));
    storageEstimate()
      .then((e) => {
        if (e) setUsage(`${mb(e.usedBytes)} used of ~${mb(e.quotaBytes)} available`);
      })
      .catch(() => undefined);
  }, []);

  async function exportDiary() {
    setExporting(true);
    try {
      const keepers = await allKeepers();
      const entries = await Promise.all(
        keepers.map(async (k) => ({
          missionId: k.missionId,
          missionTitle: k.missionTitle,
          story: k.story,
          createdAt: k.createdAt,
          thumbnail: await blobToDataUrl(k.thumbnail),
        })),
      );
      const payload = {
        app: "framewalk",
        version: 1,
        exportedAt: Date.now(),
        keepers: entries,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `framewalk-diary-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-medium text-ink">Appearance</h2>
        <p className="mt-2 text-ink-soft">
          Follow your device, or pick light or dark yourself.
        </p>
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </Card>

      <Card>
        <h2 className="font-medium text-ink">What we send</h2>
        <p className="mt-2 text-ink-soft">
          Nothing. FrameWalk has no account and no server for your photos. Your
          images and stories stay in this browser, on this device. The app works
          fully offline.
        </p>
      </Card>

      <Card>
        <h2 className="font-medium text-ink">Where your diary lives</h2>
        <p className="mt-2 text-ink-soft">
          {persist === "persisted"
            ? "Your browser has agreed to keep your diary stored on this device."
            : persist === "unsupported"
              ? "This browser can't promise to keep stored data. Export regularly to be safe."
              : "Your diary lives only on this device and your browser may clear it if storage runs low or the app goes unused. Export regularly to keep a copy."}
        </p>
        {usage ? <p className="mt-2 text-sm text-ink-faint">{usage}</p> : null}
      </Card>

      <Card>
        <h2 className="font-medium text-ink">Export your diary</h2>
        <p className="mt-2 text-ink-soft">
          Save a single file (stories + thumbnails) to your device. No upload.
        </p>
        <div className="mt-4">
          <Button variant="primary" disabled={exporting} onClick={exportDiary}>
            {exporting ? "Preparing…" : "Export as file"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
