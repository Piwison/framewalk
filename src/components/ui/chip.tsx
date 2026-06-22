import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  /** Render as a toggle (selectable filter) vs a static label. */
  selected?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

export function Chip({ children, selected, onClick, ariaLabel }: ChipProps) {
  const interactive = typeof onClick === "function";
  const tone = selected
    ? "bg-ink text-paper border-ink"
    : "bg-transparent text-ink-soft border-line";
  const cls =
    "inline-flex items-center rounded-full border px-3 py-1 text-sm " +
    `transition-colors duration-(--motion-fast) ${tone}`;

  if (!interactive) {
    return <span className={cls}>{children}</span>;
  }
  return (
    <button
      type="button"
      className={cls}
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
