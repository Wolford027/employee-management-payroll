import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, style, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none",
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
Textarea.displayName = "Textarea";
