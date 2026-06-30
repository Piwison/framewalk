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

type Phase = "import" | "review" | "compose" | "story" | "done";

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
  // Frames the user chose to keep, accumulating across the review (the "tray").
  const [kept, setKept] = useState<Shot[]>([]);
  // While composing, did the user choose to save each kept frame on its own?
  const [singles, setSingles] = useState(false);
  const [singleIndex, setSingleIndex] = useState(0);
  const [story, setStory] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const keepBtn = useRef<HTMLButtonElement>(null);
  const composeHeading = useRef<HTMLHeadingElement>(null);
  const storyField = useRef<HTMLTextAreaElement>(null);
  const doneHeading = useRef<HTMLParagraphElement>(null);

  // Revoke object URLs on unmount so preview blobs don't linger in memory.
  // Kept frames live in the tray until saved, so revoke those too.
  useEffect(() => {
    return () => {
      shots.forEach((s) => URL.revokeObjectURL(s.url));
      kept.forEach((s) => URL.revokeObjectURL(s.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move focus to the primary control of each new step (keyboard users, B4).
  useEffect(() => {
    if (phase === "review") keepBtn.current?.focus();
    if (phase === "compose") composeHeading.current?.focus();
    if (phase === "story") storyField.current?.focus();
    if (phase === "done") doneHeading.current?.focus();
  }, [phase, index, singleIndex]);

  const current = shots[index];

  function onPick(files: FileList | null) {
    if (!files || files.length === 0) return;
    const picked: Shot[] = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setShots(picked);
    setIndex(0);
    setKept([]);
    setPhase("review");
    setStatus(`${picked.length} photos to look through.`);
  }

  // Finished reviewing — branch on how many frames were kept (FR-R1/R3).
  function finishReview(tray: Shot[]) {
    if (tray.length === 0) {
      setPhase("done");
      setStatus("That's the last one.");
    } else if (tray.length === 1) {
      setStory("");
      setPhase("story"); // a roll of 1 — straight to one story, as before.
      setStatus("Kept — add a line if you like.");
    } else {
      setPhase("compose");
      setStatus(
        `${tray.length} frames kept. Save them as one roll, or each on its own?`,
      );
    }
  }

  // Advance to the next frame to review, or finish when the roll is exhausted.
  function nextFrame(tray: Shot[]) {
    const next = index + 1;
    if (next >= shots.length) {
      finishReview(tray);
    } else {
      setIndex(next);
      setPhase("review");
    }
  }

  function letGo() {
    if (current) URL.revokeObjectURL(current.url);
    setStatus("Let go.");
    nextFrame(kept);
  }

  function keep() {
    if (!current) return;
    const tray = [...kept, current];
    setKept(tray);
    setStatus("Kept.");
    nextFrame(tray);
  }

  // Save one entry (a roll of `images`) with one story.
  async function saveRoll(images: Shot[], withStory: boolean) {
    if (images.length === 0 || saving) return false;
    const thumbnails = await Promise.all(
      images.map((s) => makeThumbnail(s.file)),
    );
    await addKeeper({
      id: newId(),
      missionId,
      missionTitle,
      story: withStory ? story.trim() : "",
      images: thumbnails,
      coverIndex: 0,
      createdAt: Date.now(),
    });
    images.forEach((s) => URL.revokeObjectURL(s.url));
    return true;
  }

  // The single Story step writes either the whole roll or the current single.
  async function saveStory(withStory: boolean) {
    if (saving) return;
    setSaving(true);
    try {
      if (singles) {
        const shot = kept[singleIndex];
        if (!shot) return;
        const ok = await saveRoll([shot], withStory);
        if (!ok) return;
        setSavedCount((c) => c + 1);
        const next = singleIndex + 1;
        if (next >= kept.length) {
          setStatus("Saved to your diary.");
          setPhase("done");
        } else {
          setSingleIndex(next);
          setStory("");
          setStatus("Saved — and on to the next.");
        }
      } else {
        const ok = await saveRoll(kept, withStory);
        if (!ok) return;
        setSavedCount(1);
        setStatus("Saved to your diary.");
        setPhase("done");
      }
    } catch {
      setStatus("Couldn't save that one — it stays on your device, untouched.");
    } finally {
      setSaving(false);
    }
  }

  function saveAsOneRoll() {
    setSingles(false);
    setStory("");
    setStatus("One roll, one story.");
    setPhase("story");
  }

  function saveEachOnItsOwn() {
    setSingles(true);
    setSingleIndex(0);
    setStory("");
    setStatus("Saving each frame on its own.");
    setPhase("story");
  }

  // The frame currently being storied (single mode walks the tray; roll mode shows the cover).
  const storyShot = singles ? kept[singleIndex] : kept[0];

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
            Pick the photos from this walk. They never leave your device — we
            keep only a small thumbnail of the ones you keep.
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
          <p className="mb-3 text-sm text-ink-faint">
            {index + 1} of {shots.length}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={`Photo ${index + 1} from this walk`}
            className="max-h-[60dvh] w-full rounded-lg border border-line bg-paper-raised object-contain transition-opacity duration-(--motion-base)"
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

      {phase === "compose" ? (
        <div className="mt-6">
          <h2
            ref={composeHeading}
            tabIndex={-1}
            className="font-serif text-xl text-ink outline-none"
          >
            {kept.length} frames from this walk
          </h2>
          <p className="mt-2 text-ink-soft">
            These belong together? Keep them as one roll with a single story —
            or save each on its own.
          </p>
          <ul className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {kept.map((s, i) => (
              <li key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.url}
                  alt={`Kept frame ${i + 1}`}
                  className="aspect-square w-full rounded-md border border-line bg-paper-raised object-cover"
                />
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={saveAsOneRoll}>
              Save as one roll
            </Button>
            <Button variant="ghost" onClick={saveEachOnItsOwn}>
              Save each on its own
            </Button>
          </div>
        </div>
      ) : null}

      {phase === "story" && storyShot ? (
        <div className="mt-6">
          {singles ? (
            <p className="mb-3 text-sm text-ink-faint">
              {singleIndex + 1} of {kept.length}
            </p>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={storyShot.url}
            alt={
              singles ? `Kept frame ${singleIndex + 1}` : "Cover of this roll"
            }
            className="max-h-[40dvh] w-full rounded-lg border border-line bg-paper-raised object-contain"
          />
          {!singles && kept.length > 1 ? (
            <p className="mt-2 text-sm text-ink-faint">
              A roll of {kept.length} frames · one story.
            </p>
          ) : null}
          <label
            htmlFor="story"
            className="mt-6 block font-serif text-lg text-ink"
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
            className="mt-2 w-full resize-none rounded-md border border-line bg-paper-raised p-3 text-ink placeholder:text-ink-faint"
          />
          <div className="mt-4 flex items-center gap-3">
            <Button
              variant="primary"
              disabled={saving}
              onClick={() => saveStory(true)}
            >
              {saving ? "Saving…" : singles ? "Save frame" : "Save roll"}
            </Button>
            <Button
              variant="ghost"
              disabled={saving}
              onClick={() => saveStory(false)}
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
            {savedCount === 0
              ? "Nothing kept this time — that's a good edit too."
              : `${savedCount} ${savedCount === 1 ? "entry" : "entries"} saved.`}
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
    </section>
  );
}
