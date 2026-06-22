import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

type Variant = "primary" | "quiet" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 " +
  "text-base transition-colors duration-(--motion-fast) " +
  "disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-on-ink hover:opacity-90",
  quiet: "bg-transparent text-ink border border-line hover:border-line-strong",
  ghost: "bg-transparent text-ink-soft hover:text-ink",
};

export function Button({
  variant = "quiet",
  className = "",
  children,
  ref,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
