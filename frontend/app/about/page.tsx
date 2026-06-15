import Link from "next/link";
import { ArrowRight, Zap, Code2, Database, Layout, ShieldCheck, FileText, GitBranch } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";

const STACK = [
  {
    category: "Backend",
    color: "#3b82f6",
    items: [
      { name: "Laravel 12", desc: "PHP framework — API only, no Blade (except payslip PDF)" },
      { name: "PHP 8.5", desc: "Modern PHP with readonly classes, enums, match expressions" },
      { name: "MySQL 8.0", desc: "Primary database with soft deletes on all domain models" },
      { name: "Sanctum", desc: "Bearer token authentication — stateless, no cookie/CSRF" },
      { name: "Spatie Permission", desc: "Role & permission management with Gate::before super-admin bypass" },
      { name: "DomPDF", desc: "Server-side PDF generation for payslips" },
    ],
  },
  {
    category: "Frontend",
    color: "#eab308",
    items: [
      { name: "Next.js 16", desc: "App Router with Proxy-based route protection (renamed from middleware)" },
      { name: "TypeScript", desc: "Strict mode — no any, fully typed components and services" },
      { name: "Tailwind CSS v4", desc: "Utility-first CSS with custom glass design system" },
      { name: "TanStack Query v5", desc: "Server state, caching, and background sync" },
      { name: "Zustand", desc: "Lightweight auth store with cookie sync for SSR/proxy" },
      { name: "React Hook Form + Zod", desc: "Type-safe form validation with schema inference" },
    ],
  },
];

const PRINCIPLES = [
  {
    icon: Code2,
    title: "CRUD first",
    desc: "No over-engineering. Every module starts with solid Create, Read, Update, Delete before anything else.",
    color: "#3b82f6",
  },
  {
    icon: GitBranch,
    title: "Modular architecture",
    desc: "Controller → Service → DTO → Repository → Model. Each domain is self-contained and independently testable.",
    color: "#eab308",
  },
  {
    icon: Database,
    title: "Data integrity",
    desc: "Soft deletes on all domain models, composite unique indexes, and DB transactions for multi-step writes.",
    color: "#3b82f6",
  },
  {
    icon: ShieldCheck,
    title: "Security by default",
    desc: "Per-action authorization, Bearer token auth, validated at every boundary, no raw SQL.",
    color: "#eab308",
  },
  {
    icon: Layout,
    title: "Glass design system",
    desc: "A consistent blue + yellow dark theme with frosted-glass components, built without external UI libraries.",
    color: "#3b82f6",
  },
  {
    icon: FileText,
    title: "Full test coverage",
    desc: "Pest 3 feature tests for every module — CRUD, validation, permission gates, and soft deletes.",
    color: "#eab308",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <PublicNav />

      {/* ── Header ── */}
      <section className="relative text-center px-4 pt-36 pb-20">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(37,99,235,0.2), transparent)" }}
        />
        <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">About</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white max-w-2xl mx-auto leading-tight">
          Built for teams who{" "}
          <span style={{ background: "linear-gradient(90deg,#3b82f6,#eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            value simplicity
          </span>
        </h1>
        <p className="mt-5 text-slate-400 max-w-xl mx-auto leading-relaxed">
          EMS Payroll is an open-source Employee Management &amp; Payroll System built as an MVP
          to demonstrate a clean, production-grade full-stack architecture — no bloat, no AI gimmicks,
          just solid CRUD done right.
        </p>
      </section>

      {/* ── Mission ── */}
      <section className="px-4 pb-24 max-w-3xl mx-auto text-center">
        <div
          className="rounded-3xl px-8 py-12"
          style={{
            background: "rgba(37,99,235,0.08)",
            border: "1px solid rgba(59,130,246,0.2)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
            style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
          >
            <Zap className="w-7 h-7 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Our mission</h2>
          <p className="text-slate-400 leading-relaxed">
            To provide a clean, maintainable, and extendable HR platform that small and medium businesses
            can deploy, understand, and own — without vendor lock-in or opaque pricing.
            Every design decision is documented, every module is tested, and every pattern
            is consistent so the next developer can pick it up in minutes.
          </p>
        </div>
      </section>

      {/* ── Design principles ── */}
      <section className="px-4 pb-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white">Design principles</h2>
          <p className="mt-3 text-slate-400">The decisions behind every line of code.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRINCIPLES.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4"
                style={{ background: `${color}20`, border: `1px solid ${color}40` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tech stack ── */}
      <section className="px-4 pb-28 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white">Tech stack</h2>
          <p className="mt-3 text-slate-400">What&apos;s under the hood.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {STACK.map(({ category, color, items }) => (
            <div key={category}>
              <h3
                className="text-sm font-bold uppercase tracking-widest mb-5"
                style={{ color }}
              >
                {category}
              </h3>
              <div className="space-y-3">
                {items.map(({ name, desc }) => (
                  <div
                    key={name}
                    className="flex gap-4 rounded-xl px-5 py-4"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      className="w-1.5 rounded-full shrink-0 mt-0.5"
                      style={{ background: color, minHeight: "100%" }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">{name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 pb-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to try it?</h2>
        <p className="text-slate-400 text-sm mb-8">
          Create a free account or explore the live demo with seeded data.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-blue-950 hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg,#eab308,#ca8a04)", boxShadow: "0 4px 16px rgba(234,179,8,0.3)" }}
          >
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/8"
            style={{ border: "1px solid rgba(255,255,255,0.18)" }}
          >
            View pricing
          </Link>
        </div>
      </section>

      <footer className="text-center py-8 text-xs text-slate-600" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        © {new Date().getFullYear()} EMS Payroll. Built with Laravel 12 & Next.js 16.
      </footer>
    </div>
  );
}
