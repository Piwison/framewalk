import Link from "next/link";
import { notFound } from "next/navigation";
import { findMission } from "@/lib/mission-select";
import { MISSIONS } from "@/lib/missions";
import { APPROACH_SCRIPTS, ETHICS_SPINE } from "@/lib/approach";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";

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

      <div className="mt-4 mb-3 flex flex-wrap gap-2">
        <Chip>{mission.difficulty}</Chip>
        {mission.involvesPeople ? <Chip>with people</Chip> : null}
      </div>

      <h1 id="mission-title" className="font-serif text-3xl leading-tight text-ink">
        {mission.title}
      </h1>
      <p className="mt-4 font-serif text-lg leading-[var(--leading-prose)] text-ink-soft">
        {mission.invitation}
      </p>

      {mission.involvesPeople ? (
        <section aria-labelledby="approach-heading" className="mt-8 space-y-4">
          <h2 id="approach-heading" className="text-sm uppercase tracking-wide text-ink-faint">
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
        <Link
          href={`/cull?mission=${mission.id}`}
          className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-base font-medium text-on-ink transition-opacity duration-(--motion-fast) hover:opacity-90"
        >
          Back from shooting? Start the cull →
        </Link>
        <p className="mt-3 text-sm text-ink-faint">
          Your photos stay on this device. Nothing is uploaded.
        </p>
      </div>
    </article>
  );
}
