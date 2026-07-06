import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Mat board: a near-square plate surface lifted just off the gallery wall —
 * one hairline, one contact shadow, one soft lift (all from tokens).
 */
export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={
        "rounded-sm bg-paper-raised border border-line shadow-[var(--shadow-card)] " +
        `p-6 ${className}`
      }
    >
      {children}
    </div>
  );
}
