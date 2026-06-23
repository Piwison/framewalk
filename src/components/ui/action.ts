/** Shared action (button/link/label) classes — the single source so a primary or
 *  quiet CTA rendered as a <button>, <a>/<Link>, or <label> can never drift apart. */
const actionBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 " +
  "text-base transition-colors duration-(--motion-fast) " +
  "disabled:opacity-50 disabled:pointer-events-none select-none";

export const primaryAction = `${actionBase} bg-ink text-on-ink hover:opacity-90`;
export const quietAction = `${actionBase} border border-line text-ink hover:border-line-strong`;
export const ghostAction = `${actionBase} text-ink-soft hover:text-ink`;
