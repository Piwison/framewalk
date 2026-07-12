"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion";

interface TiltFrameProps {
  children: ReactNode;
  className?: string;
}

/** A print held up to the light: the frame tilts a few degrees toward the
 *  pointer, like turning a photograph in your hands to catch it at an angle.
 *  Mouse/trackpad only (touch scrolling shouldn't fight a tilt), and it never
 *  engages at all under prefers-reduced-motion — not just a faster snap-back,
 *  a static tilted rest state is itself unwanted motion for some people. */
export function TiltFrame({ children, className = "" }: TiltFrameProps) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--tilt-x", `${(-py * 6).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(px * 6).toFixed(2)}deg`);
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.removeProperty("--tilt-x");
    el.style.removeProperty("--tilt-y");
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`tilt-frame ${className}`}
    >
      {children}
    </div>
  );
}
