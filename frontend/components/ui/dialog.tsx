"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div
        className={cn("relative w-full max-w-lg rounded-2xl shadow-2xl", className)}
        style={{
          background: "rgba(15,34,72,0.95)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(24px)",
        }}
      >
        <div
          className="flex items-start justify-between p-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}
        >
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {description && <p className="text-sm text-slate-400">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
