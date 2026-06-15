import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, style, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-lg px-3 py-1 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50",
      className,
    )}
    style={{
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.14)",
      ...style,
    }}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
