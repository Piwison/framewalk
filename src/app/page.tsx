import { TodayMission } from "@/components/today-mission";

/** Today (home). Server shell; the mission itself is chosen client-side because
 *  it depends on the device clock and the on-device served-log. */
export default function TodayPage() {
  return (
    <section aria-labelledby="today-heading">
      <header className="mb-10 mt-2">
        <div className="flex items-baseline justify-between">
          <h1
            id="today-heading"
            aria-label="Today"
            className="font-serif text-2xl text-ink"
          >
            今日
          </h1>
          <span className="text-xs uppercase text-ink-faint tracking-(--tracking-label)">
            FrameWalk · 街拍日課
          </span>
        </div>
        <div className="mt-4 h-px bg-line" />
      </header>
      <TodayMission />
    </section>
  );
}
