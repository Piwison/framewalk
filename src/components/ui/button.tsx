import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { ghostAction, primaryAction, quietAction } from "./action";

type Variant = "primary" | "quiet" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  /** React 19 passes refs as a normal prop on function components. */
  ref?: Ref<HTMLButtonElement>;
}

const variants: Record<Variant, string> = {
  primary: primaryAction,
  quiet: quietAction,
  ghost: ghostAction,
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
      className={`${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
