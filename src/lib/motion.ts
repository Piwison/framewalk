/** Shared reduced-motion guard. Motion-driven components should call this
 *  before attaching pointer/observer effects — not just shorten a duration,
 *  but skip the effect outright, since some effects (e.g. a static tilt) are
 *  disorienting regardless of how fast they transition into place. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
