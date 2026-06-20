import { Check, X, ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CtaLink } from "@/components/marketing/CtaButton";
import { PricingCards } from "@/components/marketing/PricingCards";
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
  if (value === true) return <Check className="w-4 h-4 mx-auto" style={{ color: "#60a5fa" }} />;
  if (value === false) return <X className="w-4 h-4 mx-auto" style={{ color: "#ef4444" }} />;
  return <span className="text-xs text-slate-300">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* ── Header ── */}
      <section className="relative text-center px-6 pt-36 pb-16">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(37,99,235,0.2), transparent)" }}
        />
        <p className="relative text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Pricing</p>
        <h1 className="relative text-4xl sm:text-5xl font-extrabold text-white max-w-2xl mx-auto leading-tight tracking-tight">
          Simple pricing,{" "}
          <span style={{ background: "linear-gradient(90deg,#3b82f6,#eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            no surprises
          </span>
        </h1>
        <p className="relative mt-4 text-slate-400 max-w-lg mx-auto">
          Start for free. Upgrade when you need more. Cancel anytime.
        </p>
      </section>

      {/* ── Pricing cards ── */}
      <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
        <PricingCards />
      </section>

      {/* ── Comparison table ── */}
      <section className="px-6 pb-28 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Full feature comparison</h2>
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
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
      <section className="px-6 pb-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Still not sure? Try the demo</h2>
        <p className="text-slate-400 mb-7 text-sm">
          Log in with <span className="text-slate-300 font-medium">admin@example.com / password</span> to explore all features.
        </p>
        <CtaLink href="/login" variant="primary">
          Open demo <ArrowRight className="w-4 h-4" />
        </CtaLink>
      </section>

      <SiteFooter />
    </div>
  );
}
