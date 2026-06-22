import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Ma surface: a quiet hairline-bounded panel that leans on whitespace, not
 * shadow. Generous padding; near-zero elevation.
 */
export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={
        "rounded-lg bg-paper-raised border border-line shadow-[var(--shadow-card)] " +
        `p-7 ${className}`
      }
    >
      {children}
    </div>
  );
}
