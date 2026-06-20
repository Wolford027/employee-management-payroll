"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  q: string;
  a: string;
}

function FaqRow({ item, defaultOpen }: { item: FaqItem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-sm sm:text-base font-semibold text-white">{item.q}</span>
        <Plus
          className={cn(
            "w-5 h-5 shrink-0 text-blue-400 transition-transform duration-200",
            open && "rotate-45",
          )}
        />
      </button>
      <div
        className="grid transition-all duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm text-slate-400 leading-relaxed">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {items.map((item, i) => (
        <FaqRow key={item.q} item={item} defaultOpen={i === 0} />
      ))}
    </div>
  );
}
