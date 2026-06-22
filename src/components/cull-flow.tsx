"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { findMission } from "@/lib/mission-select";
import { MISSIONS } from "@/lib/missions";
import { makeThumbnail } from "@/lib/thumbnail";
import { addKeeper } from "@/lib/db";
import { Button } from "@/components/ui/button";

type Phase = "import" | "review" | "story" | "done";

interface Shot {
  readonly file: File;
  readonly url: string;
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `k_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function CullFlow() {
  const params = useSearchParams();
  const missionId = params.get("mission") ?? "";
  const mission = findMission(MISSIONS, missionId);
  const missionTitle = mission?.title ?? "Free walk";

  const [phase, setPhase] = useState<Phase>("import");
  const [shots, setShots] = useState<Shot[]>([]);
  const [index, setIndex] = useState(0);
  const [story, setStory] = useState("");
  const [keptCount, setKeptCount] = useState(0);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const keepBtn = useRef<HTMLButtonElement>(null);
  const storyField = useRef<HTMLTextAreaElement>(null);

  // Revoke object URLs on unmount so preview blobs don't linger in memory.
  useEffect(() => {
    return () => {
      shots.forEach((s) => URL.revokeObjectURL(s.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move focus to the primary control of each new step (keyboard users, B4).
  useEffect(() => {
    if (phase === "review") keepBtn.current?.focus();
    if (phase === "story") storyField.current?.focus();
  }, [phase, index]);

  const current = shots[index];

  function onPick(files: FileList | null) {
    if (!files || files.length === 0) return;
    const picked: Shot[] = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setShots(picked);
    setIndex(0);
    setPhase("review");
    setStatus(`${picked.length} photos to look through.`);
  }

  function advance(saved: boolean) {
    if (current) URL.revokeObjectURL(current.url);
    const next = index + 1;
    if (next >= shots.length) {
      setPhase("done");
      setStatus(
        saved ? "Saved. That's the last one." : "That's the last one.",
      );
    } else {
      setIndex(next);
      setStory("");
      setPhase("review");
    }
  }

  function letGo() {
    setStatus("Let go.");
    advance(false);
  }

  function keep() {
    setStatus("Kept — add a line if you like.");
    setPhase("story");
  }

  async function saveKeeper(withStory: boolean) {
    if (!current || saving) return;
    setSaving(true);
    try {
      const thumbnail = await makeThumbnail(current.file);
      await addKeeper({
        id: newId(),
        missionId,
        missionTitle,
        story: withStory ? story.trim() : "",
        thumbnail,
        createdAt: Date.now(),
      });
      setKeptCount((c) => c + 1);
      setStatus("Saved to your diary.");
      advance(true);
    } catch {
      setStatus("Couldn't save that one — it stays on your device, untouched.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="cull-heading">
      <h1 id="cull-heading" className="font-serif text-2xl text-ink">
        Cull · <span className="text-ink-soft">{missionTitle}</span>
      </h1>

      {/* Screen-reader feedback for every keep/let-go/save (B4). */}
      <p aria-live="polite" className="sr-only">
        {status}
      </p>

      {phase === "import" ? (
        <div className="mt-8">
          <p className="text-ink-soft">
            Pick the photos from this walk. They never leave your device — we keep
            only a small thumbnail of the ones you keep.
          </p>
          <label className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-full bg-ink px-6 py-3 font-medium text-on-ink hover:opacity-90">
            Choose photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => onPick(e.target.files)}
            />
          </label>
        </div>
      ) : null}

      {phase === "review" && current ? (
        <div className="mt-6">
          <p className="mb-3 text-sm text-ink-faint">
            {index + 1} of {shots.length}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={`Photo ${index + 1} from this walk`}
            className="max-h-[60dvh] w-full rounded-lg object-contain transition-opacity duration-(--motion-base)"
          />
          <div className="mt-6 flex items-center gap-3">
            <Button ref={keepBtn} variant="primary" onClick={keep}>
              Keep
            </Button>
            <Button variant="quiet" onClick={letGo}>
              Let go
            </Button>
          </div>
        </div>
      ) : null}

      {phase === "story" && current ? (
        <div className="mt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={`Kept photo ${index + 1}`}
            className="max-h-[40dvh] w-full rounded-lg object-contain"
          />
          <label htmlFor="story" className="mt-6 block font-serif text-lg text-ink">
            What's the story?
          </label>
          <textarea
            id="story"
            ref={storyField}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={2}
            maxLength={200}
            placeholder="One line is plenty. Or skip it."
            className="mt-2 w-full resize-none rounded-md border border-line bg-paper-raised p-3 text-ink placeholder:text-ink-faint"
          />
          <div className="mt-4 flex items-center gap-3">
            <Button
              variant="primary"
              disabled={saving}
              onClick={() => saveKeeper(true)}
            >
              {saving ? "Saving…" : "Save keeper"}
            </Button>
            <Button
              variant="ghost"
              disabled={saving}
              onClick={() => saveKeeper(false)}
            >
              Skip the story
            </Button>
          </div>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="mt-10">
          <p className="font-serif text-xl text-ink">
            {keptCount === 0
              ? "Nothing kept this time — that's a good edit too."
              : `${keptCount} keeper${keptCount === 1 ? "" : "s"} saved.`}
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/diary"
              className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 font-medium text-on-ink hover:opacity-90"
            >
              Open your diary →
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-line px-6 py-3 text-ink hover:border-ink-faint"
            >
              Back to Today
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
