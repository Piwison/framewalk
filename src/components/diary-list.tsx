"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { allKeepers, deleteKeeper } from "@/lib/db";
import type { Keeper } from "@/lib/types";
import { Button } from "@/components/ui/button";

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
    setRows((prev) => prev?.filter((r) => r.keeper.id !== row.keeper.id) ?? null);
  }

  if (rows === null) {
    return <p className="text-ink-soft">Opening your diary…</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-paper-raised p-8 text-center">
        <p className="font-serif text-lg text-ink">Your diary is empty — for now.</p>
        <p className="mt-2 text-ink-soft">
          Take a walk, keep one frame, and it will live here.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 font-medium text-on-ink hover:opacity-90"
        >
          Find today&rsquo;s mission →
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-6">
      {rows.map((row) => (
        <li
          key={row.keeper.id}
          className="overflow-hidden rounded-lg border border-line bg-paper-raised"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.url}
            alt={row.keeper.story || `Keeper from ${row.keeper.missionTitle}`}
            className="max-h-[50dvh] w-full object-contain"
          />
          <div className="p-5">
            <p className="text-sm text-ink-faint">
              {formatDate(row.keeper.createdAt)} · {row.keeper.missionTitle}
            </p>
            {row.keeper.story ? (
              <p className="mt-2 font-serif text-lg leading-[var(--leading-prose)] text-ink">
                {row.keeper.story}
              </p>
            ) : null}
            <div className="mt-4">
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
