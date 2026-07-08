"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { allKeepers, deleteKeeper } from "@/lib/db";
import { roman } from "@/lib/roman";
import type { Keeper } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { primaryAction } from "@/components/ui/action";

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

  async function remove(row: Row) {
    await deleteKeeper(row.keeper.id);
    URL.revokeObjectURL(row.url);
    setRows(
      (prev) => prev?.filter((r) => r.keeper.id !== row.keeper.id) ?? null,
    );
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
    <ul className="space-y-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 lg:space-y-0">
      {rows.map((row, i) => (
        <li
          key={row.keeper.id}
          className="rounded-sm border border-line bg-paper-raised p-3 shadow-[var(--shadow-card)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.url}
            alt={row.keeper.story || `Keeper from ${row.keeper.missionTitle}`}
            className="max-h-[50dvh] w-full bg-paper object-contain"
          />
          <div className="px-2 pt-4 pb-2">
            <p className="text-xs uppercase tracking-(--tracking-label) text-ink-faint">
              Plate {roman(rows.length - i)} ·{" "}
              {formatDate(row.keeper.createdAt)} · {row.keeper.missionTitle}
            </p>
            {row.keeper.story ? (
              <p className="mt-2 font-serif text-xl leading-(--leading-prose) text-ink">
                {row.keeper.story}
              </p>
            ) : null}
            <div className="mt-3">
              <Button
                variant="ghost"
                className="px-0 text-sm"
                aria-label={`Remove keeper from ${row.keeper.missionTitle}`}
                onClick={() => remove(row)}
              >
                Remove
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
