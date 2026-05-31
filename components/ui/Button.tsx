import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
  children: ReactNode;
  className?: string;
}

const base =
  "inline-flex items-center justify-center rounded-lg px-7 py-[13px] text-sm font-medium tracking-[0.01em] transition-all duration-[220ms] ease-out";

const variants: Record<Variant, string> = {
  primary:
    "bg-charcoal text-white hover:-translate-y-0.5 hover:bg-brand-black hover:shadow-[0_12px_32px_rgba(0,0,0,0.22)]",
  secondary:
    "border-[1.5px] border-[var(--border-mid)] bg-transparent text-foreground hover:-translate-y-0.5 hover:bg-[var(--surface-muted-hover)]",
};

export function Button({
  variant = "primary",
  href,
  children,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
