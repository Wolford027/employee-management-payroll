"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRICING_TIERS, priceFor, type Billing } from "@/lib/pricing";

function BillingToggle({
  billing,
  onChange,
}: {
  billing: Billing;
  onChange: (b: Billing) => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full p-1"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
    >
      {(["monthly", "annual"] as const).map((opt) => {
        const active = billing === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all capitalize",
              active ? "text-blue-950" : "text-slate-300 hover:text-white",
            )}
            style={active ? { background: "linear-gradient(135deg,#facc15,#eab308)" } : {}}
          >
            {opt}
            {opt === "annual" && (
              <span className={cn("ml-1.5 text-xs", active ? "text-blue-900/70" : "text-yellow-400")}>
                –20%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function PricingCards({ showToggle = true }: { showToggle?: boolean }) {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <div>
      {showToggle && (
        <div className="flex justify-center mb-12">
          <BillingToggle billing={billing} onChange={setBilling} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {PRICING_TIERS.map((tier) => {
          const { price, period } = priceFor(tier, billing);
          return (
            <div
              key={tier.name}
              className={cn("rounded-2xl p-7 flex flex-col relative", tier.highlight && "md:-mt-3")}
              style={
                tier.highlight
                  ? {
                      background: "rgba(37,99,235,0.12)",
                      border: "1.5px solid rgba(59,130,246,0.5)",
                      backdropFilter: "blur(16px)",
                      boxShadow: "0 0 48px rgba(37,99,235,0.18)",
                    }
                  : {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      backdropFilter: "blur(12px)",
                    }
              }
            >
              {tier.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-blue-950 whitespace-nowrap"
                  style={{ background: "linear-gradient(90deg,#eab308,#ca8a04)" }}
                >
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {tier.name}
                </p>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-extrabold text-white">{price}</span>
                  <span className="text-slate-500 text-sm mb-2">/ {period}</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">{tier.description}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: tier.highlight ? "#60a5fa" : "#eab308" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="w-full text-center rounded-xl py-2.5 text-sm font-semibold transition-all hover:opacity-90"
                style={
                  tier.highlight
                    ? {
                        background: "linear-gradient(135deg,#eab308,#ca8a04)",
                        color: "#0a1628",
                        boxShadow: "0 4px 16px rgba(234,179,8,0.3)",
                      }
                    : {
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#e2e8f0",
                      }
                }
              >
                {tier.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
