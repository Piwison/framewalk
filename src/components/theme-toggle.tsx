"use client";

import { useEffect, useState } from "react";

type Choice = "system" | "light" | "dark";
const KEY = "framewalk-theme";

function apply(choice: Choice) {
  const el = document.documentElement;
  if (choice === "system") delete el.dataset.theme;
  else el.dataset.theme = choice;
}

const OPTIONS: readonly { value: Choice; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

/** Lets the user override the OS colour scheme (the only way to force light on a
 *  dark device). Single-select, so it uses radiogroup semantics. */
export function ThemeToggle() {
  const [choice, setChoice] = useState<Choice>("system");

  useEffect(() => {
    let saved: Choice = "system";
    try {
      const v = localStorage.getItem(KEY);
      if (v === "light" || v === "dark") saved = v;
    } catch {
      /* private mode: stay on system */
    }
    setChoice(saved);
  }, []);

  function pick(next: Choice) {
    setChoice(next);
    try {
      if (next === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      /* non-fatal */
    }
    apply(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className="inline-flex rounded-full border border-line p-1"
    >
      {OPTIONS.map((o) => {
        const active = choice === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => pick(o.value)}
            className={
              "rounded-full px-4 py-1.5 text-sm transition-colors duration-(--motion-fast) " +
              (active ? "bg-ink text-on-ink" : "text-ink-soft hover:text-ink")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
