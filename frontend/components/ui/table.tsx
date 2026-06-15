import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(className)}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.10)", background: "rgba(59,130,246,0.08)" }}
      {...props}
    />
  );
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("", className)} {...props} />;
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-colors", className)}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
      {...props}
    />
  );
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-blue-300", className)}
      {...props}
    />
  );
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 text-slate-300", className)} {...props} />;
}
