import { Wallet, Users, CalendarOff, BarChart3 } from "lucide-react";

const NAV = [
  { label: "Payroll", icon: Wallet, active: true },
  { label: "Employees", icon: Users, active: false },
  { label: "Time off", icon: CalendarOff, active: false },
  { label: "Reports", icon: BarChart3, active: false },
];

const ROWS = [
  { initials: "AM", name: "Amara Mensah", dept: "Design", status: "Paid", amount: "$5,400" },
  { initials: "DC", name: "Daniel Cole", dept: "Engineering", status: "Paid", amount: "$7,200" },
  { initials: "PN", name: "Priya Nair", dept: "Sales", status: "Pending", amount: "$4,150" },
  { initials: "TI", name: "Tom Iverson", dept: "Ops", status: "Paid", amount: "$3,800" },
];

const KPIS = [
  { label: "Total payout", value: "$284,920" },
  { label: "Employees", value: "148" },
  { label: "Net pay", value: "$214,300" },
];

/**
 * Decorative dark-glass preview of the payroll app, shown in the landing hero.
 * Purely presentational — mirrors the APBS reference layout in the EMS brand.
 */
export function ProductMockup() {
  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: "rgba(13,27,52,0.75)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
          <span className="w-3 h-3 rounded-full" style={{ background: "#eab308" }} />
          <span className="w-3 h-3 rounded-full" style={{ background: "#22c55e" }} />
        </div>
        <span className="text-xs font-medium text-slate-400">EMS Payroll — Payroll</span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className="hidden sm:flex w-36 shrink-0 flex-col gap-1 p-3"
          style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}
        >
          {NAV.map(({ label, icon: Icon, active }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium"
              style={
                active
                  ? { background: "rgba(59,130,246,0.18)", color: "#fde047", border: "1px solid rgba(59,130,246,0.3)" }
                  : { color: "#94a3b8" }
              }
            >
              <Icon className="w-3.5 h-3.5" style={{ color: active ? "#60a5fa" : "#64748b" }} />
              {label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-4 space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white">June 2026 payroll</p>
              <p className="text-[11px] text-slate-500">Pay date · June 30</p>
            </div>
            <span
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-950"
              style={{ background: "linear-gradient(135deg,#facc15,#eab308)" }}
            >
              Run payroll
            </span>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-2.5">
            {KPIS.map((k) => (
              <div
                key={k.label}
                className="rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-[10px] text-slate-500 truncate">{k.label}</p>
                <p className="text-sm font-bold text-white">{k.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="grid grid-cols-[1.6fr_1fr_0.9fr_0.8fr] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <span>Employee</span>
              <span>Dept</span>
              <span>Status</span>
              <span className="text-right">Amount</span>
            </div>
            {ROWS.map((r) => {
              const paid = r.status === "Paid";
              return (
                <div
                  key={r.name}
                  className="grid grid-cols-[1.6fr_1fr_0.9fr_0.8fr] gap-2 items-center px-3 py-2.5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: "rgba(59,130,246,0.25)", border: "1px solid rgba(59,130,246,0.35)" }}
                    >
                      {r.initials}
                    </span>
                    <span className="text-xs text-white truncate">{r.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate">{r.dept}</span>
                  <span>
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={
                        paid
                          ? { background: "rgba(34,197,94,0.15)", color: "#86efac", border: "1px solid rgba(34,197,94,0.25)" }
                          : { background: "rgba(245,158,11,0.15)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.25)" }
                      }
                    >
                      {r.status}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-white text-right">{r.amount}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
