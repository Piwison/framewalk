"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MISSIONS } from "@/lib/missions";
import {
  anotherMission,
  missionOfTheDay,
  recentMissionIds,
} from "@/lib/mission-select";
import { recordServed, servedLog } from "@/lib/db";
import { roman } from "@/lib/roman";
import type { LocationType, Mission } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

const LOCATIONS: readonly { value: LocationType | "any"; label: string }[] = [
  { value: "any", label: "Anywhere" },
  { value: "street", label: "Street" },
  { value: "nature", label: "Nature" },
  { value: "home", label: "Home" },
  { value: "travel", label: "Travel" },
];

export function TodayMission() {
  const router = useRouter();
  const [location, setLocation] = useState<LocationType | "any">("any");
  const [recent, setRecent] = useState<string[]>([]);
  const [mission, setMission] = useState<Mission | null>(null);
  const [ready, setReady] = useState(false);
  const [nonce, setNonce] = useState(1);

  useEffect(() => {
    let active = true;
    servedLog()
      .then((log) => {
        if (active) setRecent(recentMissionIds(log, new Date()));
      })
      .catch(() => {
        /* first run / private mode: just proceed without history */
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const ctx = {
      now: new Date(),
      locationType: location === "any" ? undefined : location,
      recentIds: recent,
    };
    setMission(missionOfTheDay(MISSIONS, ctx) ?? null);
  }, [ready, location, recent]);

  function showAnother() {
    if (!mission) return;
    const next = nonce + 1;
    const picked = anotherMission(
      MISSIONS,
      {
        now: new Date(),
        locationType: location === "any" ? undefined : location,
        recentIds: recent,
      },
      mission.id,
      next,
    );
    setNonce(next);
    if (picked) setMission(picked);
  }

  async function go() {
    if (!mission) return;
    try {
      await recordServed(mission.id, Date.now());
    } catch {
      /* non-fatal */
    }
    router.push(`/mission/${mission.id}`);
  }

  return (
    <div>
      <div
        className="mb-8 flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Location"
      >
        {LOCATIONS.map((l) => (
          <Chip
            key={l.value}
            selected={location === l.value}
            ariaLabel={`Show ${l.label.toLowerCase()} missions`}
            onClick={() => setLocation(l.value)}
          >
            {l.label}
          </Chip>
        ))}
      </div>

      {/* Dedicated, quiet status — announces only the mission title on change. */}
      <p className="sr-only" aria-live="polite">
        {mission ? `Today's mission: ${mission.title}` : "Finding a mission."}
      </p>

      {!mission ? (
        <p className="py-10 text-ink-faint">Finding a mission for right now…</p>
      ) : (
        // Keyed by mission so each plate fades up in place (the "plate turn").
        // On wide screens the plate opens like a book spread: the wall labels
        // move into a margin column, the text block keeps its reading measure.
        <article
          key={mission.id}
          className="plate-in lg:grid lg:grid-cols-[9rem_1fr] lg:gap-10"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-(--tracking-label) text-ink-faint lg:flex-col lg:items-start lg:gap-2 lg:border-r lg:border-line lg:pt-2 lg:pr-6">
            <span>
              Plate {roman(MISSIONS.findIndex((m) => m.id === mission.id) + 1)}
            </span>
            <span aria-hidden="true" className="lg:hidden">
              ·
            </span>
            <span>{mission.difficulty}</span>
            {mission.involvesPeople ? (
              <>
                <span aria-hidden="true" className="lg:hidden">
                  ·
                </span>
                <span>with people</span>
              </>
            ) : null}
          </div>

          <div>
            <h2 className="mt-5 font-serif text-3xl font-semibold leading-(--leading-tight) text-ink lg:mt-0">
              {mission.title}
            </h2>
            <div className="mt-5 h-px w-10 bg-line-strong" />

            <p className="mt-5 max-w-prose font-serif text-xl leading-(--leading-prose) text-ink-soft">
              {mission.invitation}
            </p>

            <div className="mt-10 flex items-center gap-5">
              <Button variant="primary" onClick={go}>
                I&rsquo;m going
              </Button>
              <Button variant="ghost" onClick={showAnother}>
                another plate
              </Button>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
