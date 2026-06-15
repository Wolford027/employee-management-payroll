import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "yellow";
type Size = "default" | "sm" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  default: "bg-blue-600 text-white hover:bg-blue-500 shadow-sm",
  yellow: "text-blue-950 font-semibold hover:opacity-90",
  secondary: "text-slate-200 hover:text-white hover:bg-white/10",
  outline: "border text-slate-200 hover:text-white hover:bg-white/10",
  ghost: "text-slate-400 hover:text-white hover:bg-white/8",
  destructive: "bg-red-600 text-white hover:bg-red-500",
};

const variantStyles: Partial<Record<Variant, React.CSSProperties>> = {
  yellow: { background: "linear-gradient(135deg,#eab308,#ca8a04)", boxShadow: "0 2px 10px rgba(234,179,8,0.3)" },
  outline: { borderColor: "rgba(255,255,255,0.18)" },
  secondary: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" },
};

const sizeClasses: Record<Size, string> = {
  default: "h-9 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-10 px-6 text-sm",
  icon: "h-9 w-9",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", style, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    />
  ),
);
Button.displayName = "Button";
