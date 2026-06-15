import * as React from "react";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, React.CSSProperties> = {
  active:     { background: "rgba(34,197,94,0.15)",  color: "#86efac", border: "1px solid rgba(34,197,94,0.25)" },
  inactive:   { background: "rgba(148,163,184,0.12)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.2)" },
  archived:   { background: "rgba(245,158,11,0.15)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.25)" },
  present:    { background: "rgba(34,197,94,0.15)",  color: "#86efac", border: "1px solid rgba(34,197,94,0.25)" },
  absent:     { background: "rgba(239,68,68,0.15)",  color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)" },
  late:       { background: "rgba(245,158,11,0.15)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.25)" },
  on_leave:   { background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.25)" },
  half_day:   { background: "rgba(168,85,247,0.15)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,0.25)" },
  pending:    { background: "rgba(245,158,11,0.15)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.25)" },
  approved:   { background: "rgba(34,197,94,0.15)",  color: "#86efac", border: "1px solid rgba(34,197,94,0.25)" },
  rejected:   { background: "rgba(239,68,68,0.15)",  color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)" },
  cancelled:  { background: "rgba(148,163,184,0.12)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.2)" },
  draft:      { background: "rgba(148,163,184,0.12)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.2)" },
  finalized:  { background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.25)" },
  paid:       { background: "rgba(34,197,94,0.15)",  color: "#86efac", border: "1px solid rgba(34,197,94,0.25)" },
  processing: { background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.25)" },
  completed:  { background: "rgba(34,197,94,0.15)",  color: "#86efac", border: "1px solid rgba(34,197,94,0.25)" },
  closed:     { background: "rgba(148,163,184,0.12)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.2)" },
};

const defaultStyle: React.CSSProperties = {
  background: "rgba(148,163,184,0.12)",
  color: "#94a3b8",
  border: "1px solid rgba(148,163,184,0.2)",
};

export function Badge({
  children,
  className,
  status,
}: {
  children: React.ReactNode;
  className?: string;
  status?: string;
}) {
  const style = status ? (statusStyles[status] ?? defaultStyle) : defaultStyle;
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", className)}
      style={style}
    >
      {children}
    </span>
  );
}
