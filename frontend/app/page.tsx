import Link from "next/link";
import {
  Users,
  Building2,
  CalendarCheck,
  CalendarOff,
  FileText,
  ShieldCheck,
  Check,
  ArrowRight,
  Zap,
} from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { PRICING_TIERS } from "@/lib/pricing";

const FEATURES = [
  {
    icon: Users,
    title: "Employee Management",
    desc: "Full CRUD for employee profiles, departments, and positions with role-based access.",
    color: "#3b82f6",
  },
  {
    icon: Building2,
    title: "Department & Positions",
    desc: "Organize your org chart with departments, positions, and manager assignments.",
    color: "#eab308",
  },
  {
    icon: CalendarCheck,
    title: "Attendance Tracking",
    desc: "Daily attendance records with status tracking — present, absent, late, on leave.",
    color: "#3b82f6",
  },
  {
    icon: CalendarOff,
    title: "Leave Management",
    desc: "Configurable leave types, request workflows, and team-wide visibility.",
    color: "#eab308",
  },
  {
    icon: FileText,
    title: "PDF Payslips",
    desc: "Generate, preview, and download professional payslips as PDF on demand.",
    color: "#3b82f6",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    desc: "Super admin, HR manager, manager, and employee roles with granular permissions.",
    color: "#eab308",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <PublicNav />

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-40 pb-28">
        {/* Glow behind heading */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(37,99,235,0.25), transparent)",
          }}
        />

        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-6"
          style={{
            background: "rgba(234,179,8,0.12)",
            border: "1px solid rgba(234,179,8,0.25)",
            color: "#fde047",
          }}
        >
          <Zap className="w-3.5 h-3.5" /> MVP — Built with Laravel 12 + Next.js 16
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
          Employee Management{" "}
          <span
            style={{
              background: "linear-gradient(90deg,#3b82f6,#eab308)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            &amp; Payroll
          </span>{" "}
          in one place
        </h1>

        <p className="mt-6 text-lg text-slate-400 max-w-xl">
          Manage your workforce, track attendance, process payroll, and generate payslips —
          all from a single, beautifully crafted platform.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-blue-950 hover:opacity-90 transition-all"
            style={{
              background: "linear-gradient(135deg,#eab308,#ca8a04)",
              boxShadow: "0 4px 20px rgba(234,179,8,0.35)",
            }}
          >
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.18)" }}
          >
            Sign in to demo
          </Link>
        </div>

        {/* Demo hint */}
        <p className="mt-6 text-xs text-slate-500">
          Demo credentials:{" "}
          <span className="text-slate-400 font-medium">admin@example.com</span> /{" "}
          <span className="text-slate-400 font-medium">password</span>
        </p>
      </section>

      {/* ── Features ── */}
      <section className="px-4 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white">Everything your HR team needs</h2>
          <p className="mt-3 text-slate-400">
            Six core modules. One system. No bloat.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="rounded-2xl p-6 transition-all hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4"
                style={{ background: `${color}22`, border: `1px solid ${color}44` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-4 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white">Simple, transparent pricing</h2>
          <p className="mt-3 text-slate-400">
            Start free. Scale as you grow. No hidden fees.
          </p>
        </div>

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
                      boxShadow: "0 0 40px rgba(37,99,235,0.15)",
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
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {tier.name}
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-slate-500 text-sm mb-1.5">/ {tier.period}</span>
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
          ))}
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="px-4 py-24 text-center">
        <div
          className="max-w-2xl mx-auto rounded-3xl px-8 py-14"
          style={{
            background: "rgba(37,99,235,0.10)",
            border: "1px solid rgba(59,130,246,0.25)",
            backdropFilter: "blur(16px)",
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to streamline your HR?
          </h2>
          <p className="text-slate-400 mb-8">
            Join teams already using EMS Payroll to manage their workforce effortlessly.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-blue-950 hover:opacity-90 transition-all"
            style={{
              background: "linear-gradient(135deg,#eab308,#ca8a04)",
              boxShadow: "0 4px 20px rgba(234,179,8,0.3)",
            }}
          >
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="text-center py-8 text-xs text-slate-600"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        © {new Date().getFullYear()} EMS Payroll. Built with Laravel 12 & Next.js 16.
      </footer>
    </div>
  );
}
