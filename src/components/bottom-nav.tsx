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
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/90 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-around">
        {ITEMS.map((it) => {
          const active =
            it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={
                  "relative flex flex-col items-center gap-1 px-2 py-3 text-sm transition-colors duration-(--motion-fast) " +
                  (active ? "text-ink" : "text-ink-soft hover:text-ink")
                }
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-0.5 w-6 rounded-full bg-accent"
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
