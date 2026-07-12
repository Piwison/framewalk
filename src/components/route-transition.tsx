"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/** Every route eases up into place on navigation (.route-settle, transform-
 *  only — see globals.css for why it never touches opacity). Keyed on the
 *  pathname so client-side state changes on the SAME route (e.g. Today's
 *  "another plate", a chip selection) never retrigger it — only an actual
 *  navigation does.
 *
 *  That keyed remount tears down whatever had focus a moment ago — usually
 *  the very link that was just clicked to get here — so focus would
 *  otherwise fall to <body> on every navigation. Move it into the new
 *  route's content instead: tabIndex={-1} keeps this div out of the normal
 *  Tab order (it's only ever focused here, programmatically), and its
 *  outline is suppressed since a focus rectangle around the whole page is
 *  visual noise, not information. Skipped on the very first mount (a true
 *  page load) so the "Skip to content" link keeps its place as the first
 *  Tab stop — only actual client-side navigations move focus. */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    ref.current?.focus();
  }, [pathname]);

  return (
    <div
      key={pathname}
      ref={ref}
      tabIndex={-1}
      className="route-settle outline-none"
    >
      {children}
    </div>
  );
}
