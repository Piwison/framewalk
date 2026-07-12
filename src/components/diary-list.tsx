"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { allKeepers, deleteKeeper, updateKeeperStory } from "@/lib/db";
import { roman } from "@/lib/roman";
import type { Keeper } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { primaryAction } from "@/components/ui/action";
import { TiltFrame } from "@/components/ui/tilt-frame";

interface Row {
  readonly keeper: Keeper;
  readonly url: string;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DiaryList() {
  const [rows, setRows] = useState<Row[] | null>(null);
  // Only one plate edits its story at a time, so ids never collide and the
  // page stays calm — editing is a deliberate, singular act. Other rows'
  // Edit/Remove controls are disabled while one is open, so a stray click
  // can never silently discard an in-progress draft.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const storyField = useRef<HTMLTextAreaElement>(null);
  const editBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  // The Edit button for `id` unmounts the instant editing starts (it only
  // renders in the non-editing branch), so its ref is gone long before
  // Save/Cancel run — focusing it there is a no-op. Instead, record which
  // row is closing and restore focus in an effect that fires AFTER that
  // row's non-editing branch (and its button) has remounted.
  const restoreFocusTo = useRef<string | null>(null);

  useEffect(() => {
    let urls: string[] = [];
    allKeepers()
      .then((keepers) => {
        const mapped = keepers.map((keeper) => ({
          keeper,
          url: URL.createObjectURL(keeper.thumbnail),
        }));
        urls = mapped.map((r) => r.url);
        setRows(mapped);
      })
      .catch(() => setRows([]));
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  useEffect(() => {
    if (editingId) {
      storyField.current?.focus();
      return;
    }
    const id = restoreFocusTo.current;
    if (id) {
      editBtnRefs.current.get(id)?.focus();
      restoreFocusTo.current = null;
    }
  }, [editingId]);

  async function remove(row: Row) {
    await deleteKeeper(row.keeper.id);
    URL.revokeObjectURL(row.url);
    setStatus(`Removed the keeper from ${row.keeper.missionTitle}.`);
    setRows(
      (prev) => prev?.filter((r) => r.keeper.id !== row.keeper.id) ?? null,
    );
  }

  function startEdit(row: Row) {
    setEditingId(row.keeper.id);
    setDraft(row.keeper.story);
  }

  function cancelEdit() {
    restoreFocusTo.current = editingId;
    setEditingId(null);
  }

  async function saveEdit(row: Row) {
    if (saving) return;
    setSaving(true);
    const story = draft.trim();
    try {
      await updateKeeperStory(row.keeper.id, story);
      setRows(
        (prev) =>
          prev?.map((r) =>
            r.keeper.id === row.keeper.id
              ? { ...r, keeper: { ...r.keeper, story } }
              : r,
          ) ?? null,
      );
      setStatus("Story updated.");
      restoreFocusTo.current = row.keeper.id;
      setEditingId(null);
    } catch {
      setStatus("Couldn't save that — nothing was changed.");
    } finally {
      setSaving(false);
    }
  }

  if (rows === null) {
    return <p className="text-ink-soft">Opening your diary…</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-sm border border-line bg-paper-raised p-8 text-center shadow-[var(--shadow-card)]">
        <p className="font-serif text-xl text-ink">
          Your diary is empty — for now.
        </p>
        <p className="mt-2 text-ink-soft">
          Take a walk, keep one frame, and it will live here.
        </p>
        <Link href="/" className={`${primaryAction} mt-6`}>
          Find today&rsquo;s mission →
        </Link>
      </div>
    );
  }

  // Reverse-chronological rows; the oldest keeper is Plate I of the monograph.
  // Wide screens hang the plates as a two-column gallery wall.
  return (
    <>
      <p aria-live="polite" className="sr-only">
        {status}
      </p>
      <ul className="space-y-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 lg:space-y-0">
        {rows.map((row, i) => {
          const editing = editingId === row.keeper.id;
          const otherRowEditing = editingId !== null && !editing;
          return (
            <li
              key={row.keeper.id}
              className="rounded-sm border border-line bg-paper-raised p-3 shadow-[var(--shadow-card)] transition-shadow duration-(--motion-base) hover:shadow-[0_1px_0_rgba(33,34,31,0.05),0_16px_36px_rgba(33,34,31,0.1)]"
            >
              <TiltFrame>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.url}
                  alt={
                    row.keeper.story || `Keeper from ${row.keeper.missionTitle}`
                  }
                  className="max-h-[50dvh] w-full bg-paper object-contain"
                />
              </TiltFrame>
              <div className="px-2 pt-4 pb-2">
                <p className="text-xs uppercase tracking-(--tracking-label) text-ink-faint">
                  Plate {roman(rows.length - i)} ·{" "}
                  {formatDate(row.keeper.createdAt)} · {row.keeper.missionTitle}
                </p>

                {editing ? (
                  <div className="mt-3">
                    <label
                      htmlFor={`story-${row.keeper.id}`}
                      className="sr-only"
                    >
                      Story for the keeper from {row.keeper.missionTitle}
                    </label>
                    <textarea
                      id={`story-${row.keeper.id}`}
                      ref={storyField}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={2}
                      maxLength={200}
                      placeholder="One line is plenty. Or leave it blank."
                      className="w-full resize-none rounded-sm border border-line bg-paper p-3 font-serif text-lg text-ink placeholder:font-sans placeholder:text-sm placeholder:text-ink-faint"
                    />
                    <div className="mt-3 flex items-center gap-3">
                      <Button
                        variant="primary"
                        disabled={saving}
                        onClick={() => saveEdit(row)}
                      >
                        {saving ? "Saving…" : "Save"}
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={saving}
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {row.keeper.story ? (
                      <p className="mt-2 font-serif text-xl leading-(--leading-prose) text-ink">
                        {row.keeper.story}
                      </p>
                    ) : null}
                    <div className="mt-3 flex items-center gap-5">
                      <Button
                        ref={(el) => {
                          if (el) editBtnRefs.current.set(row.keeper.id, el);
                          else editBtnRefs.current.delete(row.keeper.id);
                        }}
                        variant="ghost"
                        className="px-0 text-sm"
                        disabled={otherRowEditing}
                        aria-label={
                          row.keeper.story
                            ? `Edit story for the keeper from ${row.keeper.missionTitle}`
                            : `Add a story to the keeper from ${row.keeper.missionTitle}`
                        }
                        onClick={() => startEdit(row)}
                      >
                        {row.keeper.story ? "Edit story" : "Add a story"}
                      </Button>
                      <Button
                        variant="ghost"
                        className="px-0 text-sm"
                        disabled={otherRowEditing}
                        aria-label={`Remove keeper from ${row.keeper.missionTitle}`}
                        onClick={() => remove(row)}
                      >
                        Remove
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
