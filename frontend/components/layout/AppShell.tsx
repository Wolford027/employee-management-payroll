"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  CalendarCheck,
  CalendarOff,
  Wallet,
  FileText,
  UserCircle,
  LogOut,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/employees", icon: Users, permission: "viewAny employee" },
  { label: "Departments", href: "/departments", icon: Building2, permission: "viewAny department" },
  { label: "Positions", href: "/positions", icon: Briefcase, permission: "viewAny position" },
  { label: "Attendance", href: "/attendance", icon: CalendarCheck, permission: "viewAny attendance" },
  { label: "Leave", href: "/leave", icon: CalendarOff, permission: "viewAny leave" },
  { label: "Payroll", href: "/payroll", icon: Wallet, permission: "viewAny payroll" },
  { label: "Payslips", href: "/payslips", icon: FileText, permission: "viewAny payslip" },
  { label: "My Portal", href: "/portal", icon: UserCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();
  const logout = useLogout();

  const visibleNav = NAV.filter((item) => !item.permission || hasPermission(item.permission));

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="glass-sidebar hidden w-64 shrink-0 flex-col md:flex sticky top-0 h-screen overflow-hidden">
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-white/8">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <span className="text-lg font-bold text-white">EMS Payroll</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-3 pt-4 overflow-y-auto">
          {visibleNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "text-yellow-400"
                    : "text-slate-400 hover:text-white",
                )}
                style={
                  active
                    ? {
                        background: "rgba(59,130,246,0.15)",
                        border: "1px solid rgba(59,130,246,0.25)",
                      }
                    : {
                        border: "1px solid transparent",
                      }
                }
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300",
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {active && (
                  <ChevronRight className="h-3 w-3 text-yellow-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-white/8">
          <div
            className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 font-bold text-sm text-blue-900"
              style={{ background: "linear-gradient(135deg, #facc15, #eab308)" }}>
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize truncate">
                {user?.roles?.[0]?.replace("-", " ")}
              </p>
            </div>
            <button
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="text-slate-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header
          className="flex h-14 md:hidden items-center justify-between px-4 border-b"
          style={{
            background: "rgba(10,22,40,0.9)",
            borderColor: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white">EMS Payroll</span>
          </div>
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="text-slate-400 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
