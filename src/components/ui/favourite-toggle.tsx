interface FavouriteToggleProps {
  /** Marked state — drives the glyph fill and `aria-pressed`. */
  favourited: boolean;
  onToggle: () => void;
}

/**
 * A quiet bookmark toggle (SPEC-mission-favouriting, design spec §1). A real toggle button:
 * state is carried by `aria-pressed` and the outline↔solid glyph shape, never colour alone.
 * Glyph-only (label is SR-only) so it recedes as chrome next to the metadata labels and never
 * competes with the primary CTAs. 44×44 hit target; only the fill/stroke colour transitions.
 * This is a distinct toggle role — deliberately not folded into Chip (radio) or Button (CTA).
 */
export function FavouriteToggle({
  favourited,
  onToggle,
}: FavouriteToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={favourited}
      aria-label={favourited ? "Saved — tap to remove" : "Save this mission"}
      onClick={onToggle}
      className={
        "inline-flex h-11 w-11 items-center justify-center rounded-full " +
        "transition-colors duration-(--motion-fast) " +
        (favourited
          ? "text-accent hover:opacity-90"
          : "text-ink-faint hover:text-ink-soft")
      }
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={favourited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={favourited ? 0 : 1.6}
        strokeLinejoin="round"
      >
        <path d="M6 3.75h12a.75.75 0 0 1 .75.75v15.19a.5.5 0 0 1-.77.42L12 16.2l-5.98 3.91a.5.5 0 0 1-.77-.42V4.5A.75.75 0 0 1 6 3.75Z" />
      </svg>
    </button>
  );
}
