import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, style, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-lg px-3 py-1 text-sm text-white placeholder:text-slate-500 transition-all outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    style={{
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.14)",
      ...style,
    }}
    {...props}
  />
));
Input.displayName = "Input";
