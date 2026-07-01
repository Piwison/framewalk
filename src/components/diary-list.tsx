"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { allKeepers, deleteKeeper } from "@/lib/db";
import { MISSIONS } from "@/lib/missions";
import {
  ALL_FILTER,
  availableThemes,
  filterKeepers,
  shouldShowFilterBar,
  type DiaryFilter,
} from "@/lib/diary-filter";
import type { Keeper } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { primaryAction } from "@/components/ui/action";

interface Row {
  readonly keeper: Keeper;
  /** Object URLs for every frame in the roll (urls[coverIndex] is the cover). */
  readonly urls: readonly string[];
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Display-only Title-case for a theme tag ("colour" → "Colour"); the filter value stays raw. */
function titleCase(theme: string): string {
  return theme.charAt(0).toUpperCase() + theme.slice(1);
}

export function DiaryList() {
  const [rows, setRows] = useState<Row[] | null>(null);
  // Which rolls have their full grid expanded (keyed by keeper id).
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  // Active diary filter (view-only, non-persistent — resets on reload, FR-DF9).
  const [filter, setFilter] = useState<DiaryFilter>(ALL_FILTER);

  useEffect(() => {
    let created: string[] = [];
    allKeepers()
      .then((keepers) => {
        const mapped = keepers.map((keeper) => ({
          keeper,
          urls: keeper.images.map((blob) => URL.createObjectURL(blob)),
        }));
        created = mapped.flatMap((r) => r.urls);
        setRows(mapped);
      })
      .catch(() => setRows([]));
    return () => created.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function remove(row: Row) {
    await deleteKeeper(row.keeper.id);
    row.urls.forEach((u) => URL.revokeObjectURL(u));
    setRows(
      (prev) => prev?.filter((r) => r.keeper.id !== row.keeper.id) ?? null,
    );
  }

  if (rows === null) {
    return <p className="text-ink-soft">Opening your diary…</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-paper-raised p-8 text-center">
        <p className="font-serif text-lg text-ink">
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

  const keepers = rows.map((r) => r.keeper);
  const showBar = shouldShowFilterBar(keepers, MISSIONS);
  const themes = showBar ? availableThemes(keepers, MISSIONS) : [];
  const visibleIds = new Set(
    filterKeepers(keepers, MISSIONS, filter).map((k) => k.id),
  );
  const visibleRows = rows.filter((r) => visibleIds.has(r.keeper.id));

  return (
    <div>
      {showBar ? (
        <div
          className="mb-8 flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Filter diary"
        >
          <Chip
            selected={filter.kind === "all"}
            ariaLabel="Show all keepers"
            onClick={() => setFilter(ALL_FILTER)}
          >
            All
          </Chip>
          {themes.map((t) => (
            <Chip
              key={t}
              selected={filter.kind === "theme" && filter.theme === t}
              ariaLabel={`Show keepers themed ${titleCase(t)}`}
              onClick={() => setFilter({ kind: "theme", theme: t })}
            >
              {titleCase(t)}
            </Chip>
          ))}
          <Chip
            selected={filter.kind === "people"}
            ariaLabel="Show keepers with people"
            onClick={() => setFilter({ kind: "people" })}
          >
            With people
          </Chip>
        </div>
      ) : null}

      {visibleRows.length === 0 ? (
        <div className="rounded-lg border border-line bg-paper-raised p-8 text-center">
          <p className="font-serif text-lg text-ink">
            No frames with people yet — they&rsquo;ll gather here when you walk
            toward them.
          </p>
        </div>
      ) : (
        <ul className="space-y-6">
          {visibleRows.map((row) => {
            const { keeper } = row;
            const frameCount = keeper.images.length;
            const isRoll = frameCount > 1;
            const cover = row.urls[keeper.coverIndex] ?? row.urls[0];
            const isOpen = expanded.has(keeper.id);

            return (
              <li
                key={keeper.id}
                className="overflow-hidden rounded-lg border border-line bg-paper-raised"
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={isOpen ? row.urls[0] : cover}
                    alt={keeper.story || `Keeper from ${keeper.missionTitle}`}
                    className="max-h-[50dvh] w-full object-contain"
                  />
                  {isRoll && !isOpen ? (
                    <span
                      className="absolute right-3 top-3 inline-flex items-center rounded-full border border-line bg-paper px-2 py-0.5 text-sm text-ink-soft"
                      aria-hidden="true"
                    >
                      {frameCount}
                    </span>
                  ) : null}
                </div>

                {isRoll && isOpen ? (
                  <ul className="grid grid-cols-3 gap-1 p-1 sm:grid-cols-4">
                    {row.urls.map((u, i) => (
                      <li key={i}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={u}
                          alt={`Frame ${i + 1} of ${frameCount}`}
                          className="aspect-square w-full object-cover"
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="p-5">
                  <p className="text-sm text-ink-faint">
                    {formatDate(keeper.createdAt)} · {keeper.missionTitle}
                    {isRoll ? ` · ${frameCount} frames` : ""}
                  </p>
                  {keeper.story ? (
                    <p className="mt-2 font-serif text-lg leading-(--leading-prose) text-ink">
                      {keeper.story}
                    </p>
                  ) : null}
                  <div className="mt-4 flex items-center gap-4">
                    {isRoll ? (
                      <Button
                        variant="ghost"
                        className="px-0 text-sm"
                        aria-expanded={isOpen}
                        onClick={() => toggle(keeper.id)}
                      >
                        {isOpen
                          ? "Hide frames"
                          : `View all ${frameCount} frames`}
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      className="px-0 text-sm"
                      aria-label={`Remove keeper from ${keeper.missionTitle}`}
                      onClick={() => remove(row)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
