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
// Grease-pencil state for the REVIEW image: hidden, or drawing on Keep. The
// story step renders <GreasePencil state="drawn" /> directly (a static mark),
// so "drawn" is only ever used as that literal, never set via setPencil.
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

/** The grease-pencil draw duration, read from the --motion-slow token so the
 *  phase transition never hardcodes a motion value — and collapses to 0ms under
 *  reduced motion, because the token itself does. */
function drawDurationMs(): number {
  if (typeof window === "undefined") return 0;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--motion-slow")
    .trim();
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return 0;
  return raw.endsWith("ms") ? n : n * 1000;
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
  // Mirror the live shots into a ref so the mount-only cleanup revokes the
  // CURRENT blobs, not the empty array an [] effect closure would capture.
  const shotsRef = useRef(shots);
  shotsRef.current = shots;

  // On unmount, revoke any still-live preview blobs so they don't linger in
  // memory, and clear a pending grease-pencil timer so it can't fire post-teardown.
  useEffect(() => {
    return () => {
      shotsRef.current.forEach((s) => URL.revokeObjectURL(s.url));
      if (drawTimer.current) window.clearTimeout(drawTimer.current);
    };
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
    // Draw the grease-pencil circle, then move to the story step (where it is
    // rendered `drawn`, so the mark persists). The delay is the draw duration
    // from the --motion-slow token, so nothing here hardcodes a motion value.
    setPencil("drawing");
    drawTimer.current = window.setTimeout(
      () => setPhase("story"),
      drawDurationMs(),
    );
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
      className="darkroom safelight relative -mx-4 -mt-6 -mb-28 min-h-svh bg-paper px-4 pt-6 pb-28 text-ink lg:-mx-8 lg:-mt-10 lg:px-8 lg:pt-10"
    >
      {/* .safelight (globals.css) paints the room's only light as a ::before
          amber glow. Every negative margin above cancels one of <main>'s
          paddings (px-4/lg:px-8, pt-6/lg:pt-10, pb-28) so the dark surface is
          seamless on all edges at every breakpoint — if layout.tsx's <main>
          padding changes, change the pairs here too. */}
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
              {/* aria-disabled (not disabled) during the draw: the guard makes
                  the click a no-op without pulling focus off Keep mid-gesture. */}
              <Button
                ref={keepBtn}
                variant="primary"
                aria-disabled={pencil === "drawing"}
                onClick={keep}
              >
                Keep
              </Button>
              <Button
                variant="quiet"
                aria-disabled={pencil === "drawing"}
                onClick={letGo}
              >
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
