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
import type { LocationType, Mission } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PlateMarginalia, plateSpread } from "@/components/plate-marginalia";

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
  // True only for the mission "another plate" just picked — never for the
  // initial pick or a location-filter change, so the 3D page-turn stays
  // scoped to the exact interaction it's a flourish for.
  const [justTurned, setJustTurned] = useState(false);

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
    setJustTurned(false);
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
    if (picked) {
      setJustTurned(true);
      setMission(picked);
    }
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
        // Keyed by mission so each plate re-enters on change. The initial
        // pick and any location-filter change settle in quietly (.plate-in);
        // only an explicit "another plate" click (justTurned) gets the full
        // 3D page-turn — a flourish reserved for the moment the reader asked
        // for it. On wide screens it also opens as a spread.
        <article
          key={mission.id}
          className={`${justTurned ? "page-turn" : "plate-in"} ${plateSpread}`}
        >
          <PlateMarginalia
            plateNumber={MISSIONS.findIndex((m) => m.id === mission.id) + 1}
            difficulty={mission.difficulty}
            involvesPeople={mission.involvesPeople}
          />

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
