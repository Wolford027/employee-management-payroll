"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users, Building2, Wallet, CalendarOff, FileText,
  CalendarCheck, Clock,
} from "lucide-react";
import { getDashboard, portal } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton, EmployeeDashboardSkeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

/* ─── Admin / Manager dashboard ──────────────────────────────── */

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}
        >
          <Icon className="h-5 w-5" style={{ color: "#60a5fa" }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-white leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  if (isLoading || !data) return <DashboardSkeleton />;

  const c = data.counts;

  return (
    <>
      <PageHeader title="Dashboard" description="System overview" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Employees"       value={c.employees}       icon={Users}         />
        <StatCard label="Departments"     value={c.departments}     icon={Building2}     />
        <StatCard label="Payrolls"        value={c.payrolls}        icon={Wallet}        />
        <StatCard label="Pending Leave"   value={c.leave_pending}   icon={CalendarOff}   />
        <StatCard label="Payslips"        value={c.payslips}        icon={FileText}      />
        <StatCard label="Attendance Today" value={c.attendance_today} icon={CalendarCheck} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Employees by Department</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.employees_by_department.map((row) => {
              const pct = c.employees ? Math.round((row.count / c.employees) * 100) : 0;
              return (
                <div key={row.department}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-400">{row.department}</span>
                    <span className="text-slate-400">{row.count}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#2563eb,#3b82f6)" }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Latest Payroll Period</CardTitle></CardHeader>
          <CardContent>
            {data.latest_period ? (
              <div className="space-y-2 text-sm">
                {[
                  ["Period",      data.latest_period.name],
                  ["Payrolls",    data.latest_period.payroll_count],
                  ["Total Gross", formatCurrency(data.latest_period.total_gross)],
                  ["Total Net",   formatCurrency(data.latest_period.total_net)],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="text-slate-400">{k}</span>
                    <span className="font-medium text-white">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No payroll periods yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

/* ─── Employee personal dashboard ────────────────────────────── */

function EmpStat({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  iconBorder,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconColor: string;
  iconBg: string;
  iconBorder: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 mb-0.5 truncate">{label}</p>
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
      </div>
    </div>
  );
}

function EmployeeDashboard() {
  const { user } = useAuth();

  const profileQ    = useQuery({ queryKey: ["me", "employee"],   queryFn: portal.employee   });
  const leavesQ     = useQuery({ queryKey: ["me", "leaves"],     queryFn: portal.leaves     });
  const attendanceQ = useQuery({ queryKey: ["me", "attendance"], queryFn: portal.attendance });
  const payrollsQ   = useQuery({ queryKey: ["me", "payrolls"],   queryFn: portal.payrolls   });

  const loading = profileQ.isLoading || leavesQ.isLoading || attendanceQ.isLoading || payrollsQ.isLoading;
  if (loading) return <EmployeeDashboardSkeleton />;

  const emp        = profileQ.data;
  const leaves     = leavesQ.data     ?? [];
  const attendance = attendanceQ.data ?? [];
  const payrolls   = payrollsQ.data   ?? [];

  const thisMonth    = new Date().toISOString().slice(0, 7);
  const monthAtt     = attendance.filter((a) => a.date?.startsWith(thisMonth));
  const presentDays  = monthAtt.filter((a) => a.status === "present").length;
  const lateDays     = monthAtt.filter((a) => a.status === "late").length;
  const pendingLeave = leaves.filter((l) => l.status === "pending").length;
  const latestPay    = payrolls[0] ?? null;

  const firstName  = user?.name?.split(" ")[0] ?? user?.name ?? "Employee";
  const subTitle   = emp ? `${emp.position?.title ?? ""} · ${emp.department?.name ?? ""}`.replace(/^·\s*/, "").trim() : "Employee Dashboard";

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName}`} description={subTitle} />

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <EmpStat
          label="Present This Month" value={presentDays}
          icon={CalendarCheck}
          iconColor="#86efac" iconBg="rgba(34,197,94,0.10)" iconBorder="rgba(34,197,94,0.2)"
        />
        <EmpStat
          label="Late This Month" value={lateDays}
          icon={Clock}
          iconColor="#fde68a" iconBg="rgba(234,179,8,0.10)" iconBorder="rgba(234,179,8,0.2)"
        />
        <EmpStat
          label="Pending Leave" value={pendingLeave}
          icon={CalendarOff}
          iconColor="#93c5fd" iconBg="rgba(59,130,246,0.10)" iconBorder="rgba(59,130,246,0.2)"
        />
        <EmpStat
          label="Latest Net Pay" value={latestPay ? formatCurrency(latestPay.net_pay) : "—"}
          icon={Wallet}
          iconColor="#fcd34d" iconBg="rgba(234,179,8,0.10)" iconBorder="rgba(234,179,8,0.2)"
        />
      </div>

      {/* Bottom 2 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent attendance */}
        <Card>
          <CardHeader><CardTitle>Recent Attendance</CardTitle></CardHeader>
          <CardContent className="pb-3">
            {attendance.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No attendance records yet.</p>
            ) : (
              <div>
                {attendance.slice(0, 8).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 py-2.5 text-sm"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="text-slate-400 w-28 shrink-0">{formatDate(a.date)}</span>
                    <span className="text-slate-300 flex-1 text-xs">
                      {a.time_in ?? "—"} → {a.time_out ?? "—"}
                    </span>
                    <Badge status={a.status}>{a.status.replace("_", " ")}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave summary */}
        <Card>
          <CardHeader><CardTitle>Leave Requests</CardTitle></CardHeader>
          <CardContent className="pb-3">
            {/* mini counts */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Pending",  filter: "pending",  color: "#fde68a", bg: "rgba(234,179,8,0.10)",   border: "rgba(234,179,8,0.2)"   },
                { label: "Approved", filter: "approved", color: "#86efac", bg: "rgba(34,197,94,0.10)",   border: "rgba(34,197,94,0.2)"   },
                { label: "Total",    filter: null,       color: "#93c5fd", bg: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.2)"  },
              ].map(({ label, filter, color, bg, border }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <p className="text-xl font-bold" style={{ color }}>
                    {filter ? leaves.filter((l) => l.status === filter).length : leaves.length}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Recent leave list */}
            {leaves.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No leave requests yet.</p>
            ) : (
              <div>
                {leaves.slice(0, 5).map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-2 py-2.5 text-sm"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="text-slate-300 flex-1 truncate">{l.leave_type?.name ?? "—"}</span>
                    <span className="text-slate-400 text-xs shrink-0">
                      {formatDate(l.start_date)} – {formatDate(l.end_date)}
                    </span>
                    <Badge status={l.status}>{l.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

/* ─── Page entry point ────────────────────────────────────────── */

export default function DashboardPage() {
  const { hasPermission } = useAuth();
  const canViewReports = hasPermission("viewAny report");

  return canViewReports ? <AdminDashboard /> : <EmployeeDashboard />;
}
