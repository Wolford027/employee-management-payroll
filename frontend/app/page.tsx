import {
  Users,
  Building2,
  CalendarCheck,
  CalendarOff,
  FileText,
  ShieldCheck,
  ArrowRight,
  Zap,
  Wallet,
  BadgeCheck,
} from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CtaLink } from "@/components/marketing/CtaButton";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { PricingCards } from "@/components/marketing/PricingCards";
import { FaqAccordion, type FaqItem } from "@/components/marketing/FaqAccordion";
import { ProductMockup } from "@/components/marketing/ProductMockup";

const LIFECYCLE = [
  {
    icon: Users,
    title: "Employee records",
    desc: "Profiles, departments, and positions that stay in sync across the whole system.",
    color: "#3b82f6",
  },
  {
    icon: Wallet,
    title: "Automated payroll",
    desc: "Generate a pay run, apply allowances and deductions, and pay your team in minutes.",
    color: "#eab308",
  },
  {
    icon: FileText,
    title: "Payslips & compliance",
    desc: "Professional PDF payslips on demand, with attendance and leave handled in one place.",
    color: "#3b82f6",
  },
];

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

const FAQS: FaqItem[] = [
  {
    q: "How does EMS Payroll handle pay runs?",
    a: "Create a payroll period, generate payrolls for your employees, apply allowances and deductions, then finalize — net pay and payslips are calculated automatically.",
  },
  {
    q: "Can I try it without signing up?",
    a: "Yes. Use the demo credentials admin@example.com / password to sign in and explore every module with seeded data.",
  },
  {
    q: "Does it support roles and permissions?",
    a: "Granular, per-action permissions are built in. Super admin, HR manager, manager, and employee roles each see only what they should.",
  },
  {
    q: "How long does setup take?",
    a: "Minutes. Create your account, add departments and employees, and you're ready to run your first payroll the same day.",
  },
  {
    q: "Is my data secure?",
    a: "Authentication uses Bearer tokens, every request is authorized per action, and all input is validated at the boundary. Domain records use soft deletes so nothing is lost.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* ── Hero ── */}
      <section className="relative px-6 pt-36 pb-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 30% 0%, rgba(37,99,235,0.22), transparent)",
          }}
        />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-6"
              style={{
                background: "rgba(234,179,8,0.12)",
                border: "1px solid rgba(234,179,8,0.25)",
                color: "#fde047",
              }}
            >
              <Zap className="w-3.5 h-3.5" /> Payroll &amp; HR, unified
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
              Payroll and people,{" "}
              <span
                style={{
                  background: "linear-gradient(90deg,#3b82f6,#eab308)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                handled.
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              EMS Payroll brings employee records, attendance, leave, and automated payroll
              into one place — so you can pay your whole team accurately in minutes, not days.
            </p>

            <div className="mt-9 flex flex-wrap justify-center lg:justify-start gap-4">
              <CtaLink href="/register" variant="primary">
                Start free trial <ArrowRight className="w-4 h-4" />
              </CtaLink>
              <CtaLink href="/login" variant="outline">
                Sign in to demo
              </CtaLink>
            </div>

            <p className="mt-6 text-xs text-slate-500 flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-blue-400" /> No card required
              </span>
              <span className="text-slate-700">·</span>
              <span>Set up in a day</span>
              <span className="text-slate-700">·</span>
              <span>Cancel anytime</span>
            </p>
          </div>

          {/* Mockup */}
          <div className="relative">
            <ProductMockup />
          </div>
        </div>
      </section>

      {/* ── About / lifecycle split ── */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <SectionHeading
            align="left"
            eyebrow="About EMS Payroll"
            title="One system for the whole employee lifecycle."
            subtitle="Running payroll shouldn't mean stitching together spreadsheets and disconnected tools. EMS Payroll keeps records, time off, and pay in a single source of truth."
          />
          <div className="space-y-4">
            {LIFECYCLE.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                  style={{ background: `${color}22`, border: `1px solid ${color}44` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Features"
            title="Everything your HR team needs"
            subtitle="Six core modules. One system. No bloat."
          />
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple, transparent pricing"
            subtitle="Start free. Scale as you grow. No hidden fees."
          />
          <div className="mt-12">
            <PricingCards />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeading eyebrow="FAQ" title="Questions, answered." />
          <div className="mt-14">
            <FaqAccordion items={FAQS} />
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="px-6 pb-24">
        <div
          className="max-w-6xl mx-auto rounded-3xl px-8 py-16 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0f2248, #1e3a8a)",
            border: "1px solid rgba(59,130,246,0.35)",
            boxShadow: "0 0 60px rgba(37,99,235,0.2)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(234,179,8,0.12), transparent)",
            }}
          />
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white mb-4">
            Run your first payroll this week.
          </h2>
          <p className="relative text-slate-300 mb-9 max-w-lg mx-auto">
            Join teams already using EMS Payroll to manage their workforce effortlessly.
          </p>
          <div className="relative flex flex-wrap justify-center gap-4">
            <CtaLink href="/register" variant="primary">
              Start free trial <ArrowRight className="w-4 h-4" />
            </CtaLink>
            <CtaLink href="/login" variant="dark">
              Sign in
            </CtaLink>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
