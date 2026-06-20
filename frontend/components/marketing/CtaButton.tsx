import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "blue" | "outline" | "dark";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60 disabled:pointer-events-none";

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

const variantClasses: Record<Variant, string> = {
  primary: "text-blue-950 hover:opacity-90",
  blue: "text-white hover:opacity-90",
  outline: "text-white hover:bg-white/10",
  dark: "text-white hover:bg-white/10",
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg,#eab308,#ca8a04)",
    boxShadow: "0 4px 20px rgba(234,179,8,0.32)",
  },
  blue: {
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
  },
  outline: { border: "1px solid rgba(255,255,255,0.18)" },
  dark: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
  },
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

/** Marketing CTA as a Next.js Link. */
export function CtaLink({
  href,
  variant = "primary",
  size = "lg",
  className,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(base, sizes[size], variantClasses[variant], className)}
      style={variantStyles[variant]}
    >
      {children}
    </Link>
  );
}

/** Marketing CTA as a <button> (for client actions / toggles). */
export function CtaButton({
  variant = "primary",
  size = "lg",
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, sizes[size], variantClasses[variant], className)}
      style={variantStyles[variant]}
      {...props}
    >
      {children}
    </button>
  );
}
