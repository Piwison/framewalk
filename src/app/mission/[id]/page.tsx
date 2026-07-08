import Link from "next/link";
import { notFound } from "next/navigation";
import { findMission } from "@/lib/mission-select";
import { MISSIONS } from "@/lib/missions";
import { APPROACH_SCRIPTS, ETHICS_SPINE } from "@/lib/approach";
import { PlateMarginalia, plateSpread } from "@/components/plate-marginalia";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { primaryAction } from "@/components/ui/action";

export function generateStaticParams() {
  return MISSIONS.map((m) => ({ id: m.id }));
}

export default async function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mission = findMission(MISSIONS, id);
  if (!mission) notFound();

  return (
    <article aria-labelledby="mission-title">
      <Link href="/" className="text-sm text-ink-soft hover:text-ink">
        ← Today
      </Link>

      {/* Same plate treatment as Today: on wide screens the wall labels move
          into a margin column (shared PlateMarginalia — never drifts). */}
      <div className={`mt-6 ${plateSpread}`}>
        <PlateMarginalia
          plateNumber={MISSIONS.findIndex((m) => m.id === mission.id) + 1}
          difficulty={mission.difficulty}
          involvesPeople={mission.involvesPeople}
        />

        <div>
          <h1
            id="mission-title"
            className="mt-5 font-serif text-3xl font-semibold leading-(--leading-tight) text-ink lg:mt-0"
          >
            {mission.title}
          </h1>
          <div className="mt-5 h-px w-10 bg-line-strong" />
          <p className="mt-5 max-w-prose font-serif text-xl leading-(--leading-prose) text-ink-soft">
            {mission.invitation}
          </p>

          {/* Themes as wall labels — the vocabulary the weekly reflection tallies. */}
          <div className="mt-6 flex flex-wrap gap-2">
            {mission.themes.map((theme) => (
              <Chip key={theme}>{theme}</Chip>
            ))}
          </div>
        </div>
      </div>

      {mission.involvesPeople ? (
        <section aria-labelledby="approach-heading" className="mt-8 space-y-4">
          <h2
            id="approach-heading"
            className="text-sm uppercase tracking-(--tracking-label) text-ink-faint"
          >
            Approaching people, kindly
          </h2>
          <Card>
            <h3 className="font-medium text-ink">The spine</h3>
            <ul className="mt-3 space-y-2 text-ink-soft">
              {ETHICS_SPINE.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="font-medium text-ink">A few things to say</h3>
            <ul className="mt-3 space-y-2 font-serif text-ink-soft">
              {APPROACH_SCRIPTS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Card>
        </section>
      ) : null}

      <div className="mt-10">
        <Link href={`/cull?mission=${mission.id}`} className={primaryAction}>
          Back from shooting? Start the cull →
        </Link>
        <p className="mt-3 text-sm text-ink-faint">
          Your photos stay on this device. Nothing is uploaded.
        </p>
      </div>
    </article>
  );
}
