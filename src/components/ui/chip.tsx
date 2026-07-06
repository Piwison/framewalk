import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  /** Selectable (radio) vs a static label. */
  selected?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

/** Wall label: wide-tracked caps on a hairline plaque, like a museum placard.
 *  Selected = the placard inverts to plate ink. */
export function Chip({ children, selected, onClick, ariaLabel }: ChipProps) {
  const interactive = typeof onClick === "function";
  const tone = selected
    ? "bg-ink text-paper border-ink"
    : "bg-transparent text-ink-soft border-line";
  const cls =
    "inline-flex items-center rounded-sm border px-3 py-1.5 text-xs uppercase " +
    `tracking-(--tracking-label) transition-colors duration-(--motion-fast) ${tone}`;

  if (!interactive) {
    return <span className={cls}>{children}</span>;
  }
  // Single-select filter -> radio semantics (a parent sets role="radiogroup").
  return (
    <button
      type="button"
      role="radio"
      aria-checked={Boolean(selected)}
      className={cls}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
