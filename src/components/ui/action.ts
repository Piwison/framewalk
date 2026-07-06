/** Shared action (button/link/label) classes — the single source so a primary or
 *  quiet CTA rendered as a <button>, <a>/<Link>, or <label> can never drift apart.
 *
 *  Monograph button language: square-cornered, editorial. The primary action
 *  carries the hanko seal — a small vermilion dot that swells slightly on hover;
 *  it is the only colour in the chrome. The ghost action is an italic aside. */
const actionBase =
  "inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 " +
  "text-base transition-colors duration-(--motion-fast) " +
  "disabled:opacity-50 disabled:pointer-events-none select-none";

const seal =
  "before:size-1.5 before:rounded-full before:bg-accent " +
  "before:transition-transform before:duration-(--motion-fast) " +
  "hover:before:scale-125";

export const primaryAction = `${actionBase} ${seal} bg-ink text-on-ink hover:opacity-90`;
export const quietAction = `${actionBase} border border-line text-ink hover:border-line-strong`;
export const ghostAction = `${actionBase} font-serif italic text-lg text-ink-soft hover:text-ink`;
