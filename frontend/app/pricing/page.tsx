import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { PRICING_TIERS } from "@/lib/pricing";

const COMPARISON = [
  { feature: "Employees", starter: "Up to 10", pro: "Up to 100", enterprise: "Unlimited" },
  { feature: "Employee profiles", starter: true, pro: true, enterprise: true },
  { feature: "Department & position management", starter: true, pro: true, enterprise: true },
  { feature: "Attendance tracking", starter: true, pro: true, enterprise: true },
  { feature: "Leave management", starter: true, pro: true, enterprise: true },
  { feature: "Payroll generation", starter: false, pro: true, enterprise: true },
  { feature: "PDF payslip download", starter: false, pro: true, enterprise: true },
  { feature: "Allowances & deductions", starter: false, pro: true, enterprise: true },
  { feature: "Role-based access control", starter: false, pro: true, enterprise: true },
  { feature: "Custom payroll cycles", starter: false, pro: false, enterprise: true },
  { feature: "Multi-department reporting", starter: false, pro: false, enterprise: true },
  { feature: "Audit logs & compliance", starter: false, pro: false, enterprise: true },
  { feature: "Dedicated account manager", starter: false, pro: false, enterprise: true },
  { feature: "Support", starter: "Email", pro: "Priority email", enterprise: "SLA-backed" },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true)
    return <Check className="w-4 h-4 mx-auto" style={{ color: "#60a5fa" }} />;
  if (value === false)
    return <X className="w-4 h-4 mx-auto" style={{ color: "#ef4444" }} />;
  return <span className="text-xs text-slate-300">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <PublicNav />

      {/* ── Header ── */}
      <section className="relative text-center px-4 pt-36 pb-20">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(37,99,235,0.2), transparent)" }}
        />
        <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Pricing</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white max-w-2xl mx-auto leading-tight">
          Simple pricing,{" "}
          <span style={{ background: "linear-gradient(90deg,#3b82f6,#eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            no surprises
          </span>
        </h1>
        <p className="mt-4 text-slate-400 max-w-lg mx-auto">
          Start for free. Upgrade when you need more. Cancel anytime.
        </p>
      </section>

      {/* ── Pricing cards ── */}
      <section className="px-4 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className="rounded-2xl p-7 flex flex-col relative"
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
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-blue-950"
                  style={{ background: "linear-gradient(90deg,#eab308,#ca8a04)" }}
                >
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{tier.name}</p>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-slate-500 text-sm mb-2">/ {tier.period}</span>
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
                    ? { background: "linear-gradient(135deg,#eab308,#ca8a04)", color: "#0a1628", boxShadow: "0 4px 16px rgba(234,179,8,0.3)" }
                    : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#e2e8f0" }
                }
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="px-4 pb-28 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Full feature comparison</h2>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.10)" }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-4 px-5 py-3.5 text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(59,130,246,0.10)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="text-slate-400">Feature</div>
            {PRICING_TIERS.map((t) => (
              <div key={t.name} className="text-center" style={{ color: t.highlight ? "#93c5fd" : "#94a3b8" }}>
                {t.name}
              </div>
            ))}
          </div>

          {COMPARISON.map((row, i) => (
            <div
              key={row.feature}
              className="grid grid-cols-4 px-5 py-3.5 text-sm"
              style={{
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                borderBottom: i < COMPARISON.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              <div className="text-slate-300">{row.feature}</div>
              <div className="text-center"><Cell value={row.starter} /></div>
              <div className="text-center"><Cell value={row.pro} /></div>
              <div className="text-center"><Cell value={row.enterprise} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 pb-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Still not sure? Try the demo</h2>
        <p className="text-slate-400 mb-6 text-sm">
          Log in with <span className="text-slate-300 font-medium">admin@example.com / password</span> to explore all features.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-blue-950 hover:opacity-90 transition-all"
          style={{ background: "linear-gradient(135deg,#eab308,#ca8a04)", boxShadow: "0 4px 16px rgba(234,179,8,0.3)" }}
        >
          Open demo <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="text-center py-8 text-xs text-slate-600" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        © {new Date().getFullYear()} EMS Payroll. Built with Laravel 12 & Next.js 16.
      </footer>
    </div>
  );
}
