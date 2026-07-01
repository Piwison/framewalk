"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MISSIONS } from "@/lib/missions";
import {
  anotherMission,
  missionOfTheDay,
  recentMissionIds,
} from "@/lib/mission-select";
import { recordServed, servedLog } from "@/lib/db";
import { readFavourites, toggleFavourite } from "@/lib/favourites";
import type { LocationType, Mission } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { FavouriteToggle } from "@/components/ui/favourite-toggle";

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
  const [favouriteIds, setFavouriteIds] = useState<readonly string[]>([]);
  // Read via a ref inside selection so toggling a favourite never reshuffles the
  // *current* card — favourites only steer the initial pick and the next "Another".
  const favIdsRef = useRef<readonly string[]>([]);

  useEffect(() => {
    let active = true;
    const favs = readFavourites();
    favIdsRef.current = favs;
    setFavouriteIds(favs);
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
      favouriteIds: favIdsRef.current,
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
        favouriteIds: favIdsRef.current,
      },
      mission.id,
      next,
    );
    setNonce(next);
    if (picked) setMission(picked);
  }

  function toggleFavouriteMission() {
    if (!mission) return;
    const next = toggleFavourite(mission.id);
    favIdsRef.current = next;
    setFavouriteIds(next);
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
        <article>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-(--tracking-label) text-ink-faint">
              <span>{mission.difficulty}</span>
              {mission.involvesPeople ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>with people</span>
                </>
              ) : null}
            </div>
            <FavouriteToggle
              favourited={favouriteIds.includes(mission.id)}
              onToggle={toggleFavouriteMission}
            />
          </div>

          <h2 className="mt-5 font-serif text-3xl leading-(--leading-tight) text-ink">
            {mission.title}
          </h2>
          <div className="mt-5 h-[3px] w-8 rounded-full bg-accent" />

          <p className="mt-5 max-w-prose font-serif text-lg leading-(--leading-prose) text-ink-soft">
            {mission.invitation}
          </p>

          <div className="mt-10 flex items-center gap-5">
            <Button variant="primary" onClick={go}>
              I&rsquo;m going
            </Button>
            <Button variant="ghost" onClick={showAnother}>
              Another
            </Button>
          </div>
        </article>
      )}
    </div>
  );
}
