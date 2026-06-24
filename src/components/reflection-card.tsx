"use client";

import { useEffect, useState } from "react";
import { allKeepers } from "@/lib/db";
import { MISSIONS } from "@/lib/missions";
import { buildReflection, type Reflection, type ThemeCount } from "@/lib/reflection";
import { Card } from "@/components/ui/card";

function themeList(themes: readonly ThemeCount[]): string {
  const names = themes.map((t) => t.theme);
  if (names.length === 0) return "";
  return new Intl.ListFormat(undefined, {
    style: "long",
    type: "conjunction",
  }).format(names);
}

/**
 * A gentle, private reflection computed entirely from the user's own diary
 * (no AI, no network). Warm tone, no streak guilt; absence is met kindly.
 * Renders nothing until there's at least one keeper.
 */
export function ReflectionCard() {
  const [r, setR] = useState<Reflection | null>(null);

  useEffect(() => {
    let active = true;
    allKeepers()
      .then((keepers) => {
        if (active) {
          setR(buildReflection({ now: new Date(), keepers, missions: MISSIONS }));
        }
      })
      .catch(() => {
        if (active) setR(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!r || r.totalKeepers === 0) return null;

  const walkLine =
    r.weekWalks === 0
      ? "No walks yet this week — whenever you're ready."
      : `${r.weekWalks} ${r.weekWalks === 1 ? "walk" : "walks"} this week, ` +
        `${r.weekKeepers} ${r.weekKeepers === 1 ? "keeper" : "keepers"} kept.`;
  const themes = themeList(r.topThemes);

  return (
    <Card className="mb-8">
      <p className="text-xs uppercase tracking-(--tracking-label) text-ink-faint">
        Reflection
      </p>
      <p className="mt-3 font-serif text-xl leading-(--leading-tight) text-ink">
        {walkLine}
      </p>
      {themes ? (
        <p className="mt-3 text-ink-soft">
          Lately you&rsquo;ve leaned into <span className="text-ink">{themes}</span>.
        </p>
      ) : null}
      {r.monthKeepers > 0 ? (
        <p className="mt-1 text-sm text-ink-faint">
          {Math.round(r.storyRate * 100)}% of this month&rsquo;s keepers carry a story
          {r.peopleKeepers > 0
            ? ` · ${r.peopleKeepers} with people`
            : ""}
          .
        </p>
      ) : null}
    </Card>
  );
}
