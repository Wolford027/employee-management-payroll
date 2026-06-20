import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Demo", href: "/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer
      className="mt-auto"
      style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo size="sm" />
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Employee management &amp; payroll in one place — manage your workforce,
            track attendance, and run payroll with confidence.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-4">
              {col.title}
            </p>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="px-6 py-5 text-center text-xs text-slate-500"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        © {new Date().getFullYear()} EMS Payroll. Built with Laravel 12 &amp; Next.js 16.
      </div>
    </footer>
  );
}
