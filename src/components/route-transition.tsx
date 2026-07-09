"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Every route eases up into place on navigation (.route-settle, transform-
 *  only — see globals.css for why it never touches opacity). Keyed on the
 *  pathname so client-side state changes on the SAME route (e.g. Today's
 *  "another plate", a chip selection) never retrigger it — only an actual
 *  navigation does. */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="route-settle">
      {children}
    </div>
  );
}
