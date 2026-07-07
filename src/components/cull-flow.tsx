"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { findMission } from "@/lib/mission-select";
import { MISSIONS } from "@/lib/missions";
import { makeThumbnail } from "@/lib/thumbnail";
import { addKeeper } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { primaryAction, quietAction } from "@/components/ui/action";

type Phase = "import" | "review" | "story" | "done";
type Pencil = "hidden" | "drawing" | "drawn";

interface Shot {
  readonly file: File;
  readonly url: string;
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `k_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** The keeper's mark: an amber grease-pencil ellipse over the frame. `drawing`
 *  animates the stroke on; `drawn` shows it finished (carried into the story
 *  step). preserveAspectRatio="none" lets the oval hug a non-square photo; a
 *  non-scaling stroke keeps the pencil weight even as it stretches. */
function GreasePencil({ state }: { state: Pencil }) {
  if (state === "hidden") return null;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
    >
      <ellipse
        cx="50"
        cy="50"
        rx="45"
        ry="43"
        transform="rotate(-4 50 50)"
        vectorEffect="non-scaling-stroke"
        strokeWidth="2.5"
        strokeLinecap="round"
        className={`fill-none stroke-accent ${
          state === "drawing" ? "grease-draw" : "grease-drawn"
        }`}
      />
    </svg>
  );
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
  const [pencil, setPencil] = useState<Pencil>("hidden");

  const keepBtn = useRef<HTMLButtonElement>(null);
  const storyField = useRef<HTMLTextAreaElement>(null);
  const doneHeading = useRef<HTMLParagraphElement>(null);
  const drawTimer = useRef<number | null>(null);

  // Revoke object URLs on unmount so preview blobs don't linger in memory, and
  // clear any pending grease-pencil timer so it can't fire after teardown.
  useEffect(() => {
    return () => {
      shots.forEach((s) => URL.revokeObjectURL(s.url));
      if (drawTimer.current) window.clearTimeout(drawTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move focus to the primary control of each new step (keyboard users, B4).
  useEffect(() => {
    if (phase === "review") keepBtn.current?.focus();
    if (phase === "story") storyField.current?.focus();
    if (phase === "done") doneHeading.current?.focus();
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
    setStatus(`${picked.length} frames to look through.`);
  }

  function advance(saved: boolean) {
    if (current) URL.revokeObjectURL(current.url);
    setPencil("hidden");
    const next = index + 1;
    if (next >= shots.length) {
      setPhase("done");
      setStatus(saved ? "Saved. That's the last one." : "That's the last one.");
    } else {
      setIndex(next);
      setStory("");
      setPhase("review");
    }
  }

  function letGo() {
    if (pencil === "drawing") return;
    setStatus("Let go.");
    advance(false);
  }

  function keep() {
    if (pencil === "drawing") return;
    setStatus("Kept — add a line if you like.");
    // Draw the grease-pencil circle, then move to the story step. The circle is
    // carried into that step (rendered `drawn`), so the mark persists.
    setPencil("drawing");
    const delay = prefersReducedMotion() ? 0 : 620;
    drawTimer.current = window.setTimeout(() => setPhase("story"), delay);
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
    <section
      aria-labelledby="cull-heading"
      className="darkroom relative -mx-4 -mt-6 min-h-svh bg-paper px-4 pt-6 pb-24 text-ink"
    >
      {/* Safelight: a low amber glow from the top corner, the room's only light. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-48"
        style={{
          background:
            "radial-gradient(120% 100% at 82% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 68%)",
        }}
      />

      <div className="relative">
        <p className="text-xs uppercase tracking-(--tracking-label) text-accent">
          Darkroom
        </p>
        <h1
          id="cull-heading"
          className="mt-2 font-serif text-2xl font-semibold text-ink"
        >
          Cull · <span className="text-ink-soft">{missionTitle}</span>
        </h1>

        {/* Screen-reader feedback for every keep/let-go/save (B4). */}
        <p aria-live="polite" className="sr-only">
          {status}
        </p>

        {phase === "import" ? (
          <div className="mt-8">
            <p className="text-ink-soft">
              Bring the frames from this walk into the darkroom. They never
              leave your device — we keep only a small thumbnail of the ones you
              keep.
            </p>
            <label className={`${primaryAction} mt-6 cursor-pointer`}>
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
            <p className="mb-3 text-xs uppercase tracking-(--tracking-label) text-accent">
              Frame {index + 1} of {shots.length}
            </p>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.url}
                alt={`Photo ${index + 1} from this walk`}
                className="max-h-[56dvh] w-full rounded-sm border border-line bg-paper-raised object-contain"
              />
              <GreasePencil state={pencil} />
            </div>
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
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.url}
                alt={`Kept photo ${index + 1}`}
                className="max-h-[38dvh] w-full rounded-sm border border-line bg-paper-raised object-contain"
              />
              <GreasePencil state="drawn" />
            </div>
            <label
              htmlFor="story"
              className="mt-6 block font-serif text-xl text-ink"
            >
              What&rsquo;s the story?
            </label>
            <textarea
              id="story"
              ref={storyField}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="One line is plenty. Or skip it."
              className="mt-2 w-full resize-none rounded-sm border border-line bg-paper-raised p-3 text-ink placeholder:text-ink-faint"
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
            <p
              ref={doneHeading}
              tabIndex={-1}
              className="font-serif text-xl text-ink outline-none"
            >
              {keptCount === 0
                ? "Nothing kept this time — that's a good edit too."
                : `${keptCount} keeper${keptCount === 1 ? "" : "s"} saved.`}
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/diary" className={primaryAction}>
                Open your diary →
              </Link>
              <Link href="/" className={quietAction}>
                Back to Today
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
