"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: readonly { href: string; label: string }[] = [
  { href: "/", label: "Today" },
  { href: "/diary", label: "Diary" },
  { href: "/settings", label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  // On the cull route the content is a full-bleed darkroom; the nav joins it so
  // its translucent bar doesn't let the dark surface bleed through a light bg
  // (which dropped the inactive labels below AA). Tokens do the rest.
  const inDarkroom = pathname === "/cull" || pathname.startsWith("/cull/");
  return (
    <nav
      aria-label="Primary"
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/90 backdrop-blur ${
        inDarkroom ? "darkroom" : ""
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-around lg:max-w-4xl">
        {ITEMS.map((it) => {
          const active =
            it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={
                  "relative flex flex-col items-center gap-1 px-2 py-4 text-xs uppercase tracking-(--tracking-label) transition-colors duration-(--motion-fast) " +
                  (active ? "text-ink" : "text-ink-faint hover:text-ink")
                }
              >
                {/* The seal marks where you are — the nav's only colour. */}
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 size-1.5 rounded-full bg-accent"
                  />
                ) : null}
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
