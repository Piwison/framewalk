import { roman } from "@/lib/roman";
import type { Difficulty } from "@/lib/types";

/** The plate "spread" grid — on wide screens the wall labels sit in a margin
 *  column beside the text block. Single-sourced so Today and the mission page
 *  can never drift apart (same discipline as ui/action.ts).
 *
 *  NOTE: no `items-start` on this grid. The default `stretch` is what lets the
 *  marginalia's lg:border-r run the full height of the row; adding items-start
 *  would shrink the rule to the short label column. The 9rem track is the
 *  marginalia width — change it here only. */
export const plateSpread = "lg:grid lg:grid-cols-[9rem_1fr] lg:gap-10";

interface PlateMarginaliaProps {
  /** 1-based position of the mission in the library. */
  plateNumber: number;
  difficulty: Difficulty;
  involvesPeople: boolean;
}

/** Wall labels for a plate: inline dotted row on mobile, stacked margin
 *  column (hairline-ruled) inside the plateSpread grid on wide screens. */
export function PlateMarginalia({
  plateNumber,
  difficulty,
  involvesPeople,
}: PlateMarginaliaProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-(--tracking-label) text-ink-faint lg:flex-col lg:items-start lg:gap-2 lg:border-r lg:border-line lg:pt-2 lg:pr-6">
      <span>Plate {roman(plateNumber)}</span>
      <span aria-hidden="true" className="lg:hidden">
        ·
      </span>
      <span>{difficulty}</span>
      {involvesPeople ? (
        <>
          <span aria-hidden="true" className="lg:hidden">
            ·
          </span>
          <span>with people</span>
        </>
      ) : null}
    </div>
  );
}
