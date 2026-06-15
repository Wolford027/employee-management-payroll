"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = user?.name?.[0]?.toUpperCase() ?? "U";
  const role = user?.roles?.[0]?.replace("-", " ") ?? "user";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all hover:bg-white/8"
        style={{ border: "1px solid rgba(255,255,255,0.10)" }}
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-blue-950 shrink-0"
          style={{ background: "linear-gradient(135deg,#facc15,#eab308)" }}
        >
          {initial}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-white leading-tight max-w-[100px] truncate">
            {user?.name}
          </p>
          <p className="text-[10px] text-slate-400 capitalize leading-tight">{role}</p>
        </div>
        <ChevronDown
          className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-xl py-1.5 z-50"
          style={{
            background: "rgba(10,22,40,0.97)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          }}
        >
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/6 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            Go to Dashboard
          </Link>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "4px 0" }} />
          <button
            onClick={() => { clear(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-white/4 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function GuestButtons() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
      >
        Sign in
      </Link>
      <Link
        href="/register"
        className="text-sm font-semibold rounded-lg px-4 py-1.5 text-blue-950 transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg,#eab308,#ca8a04)", boxShadow: "0 2px 12px rgba(234,179,8,0.3)" }}
      >
        Get started
      </Link>
    </div>
  );
}

export function PublicNav() {
  const pathname = usePathname();
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);

  // Don't flash the wrong state during hydration
  const isLoggedIn = hydrated && !!token;

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 flex h-16 items-center px-6"
      style={{
        background: "rgba(10,22,40,0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 shrink-0">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
        >
          <Zap className="w-4 h-4 text-yellow-400" />
        </div>
        <span className="text-base font-bold text-white">EMS Payroll</span>
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1 ml-10">
        {LINKS.map(({ label, href }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                active ? "text-yellow-400" : "text-slate-400 hover:text-white",
              )}
              style={active ? { background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" } : {}}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right side — avatar if logged in, buttons if not */}
      <div className="ml-auto">
        {!hydrated ? (
          // Placeholder while Zustand rehydrates to avoid layout shift
          <div className="w-24 h-8 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
        ) : isLoggedIn ? (
          <UserMenu />
        ) : (
          <GuestButtons />
        )}
      </div>
    </header>
  );
}
