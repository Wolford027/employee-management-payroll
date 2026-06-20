"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Download, User, Wallet, CalendarOff, CalendarCheck,
  Building2, Briefcase, Mail, Phone, Calendar, DollarSign,
  Hash, Clock, Pencil, X,
} from "lucide-react";
import { toast } from "sonner";
import { portal } from "@/services";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { DownloadPayslipButton } from "@/components/payslip/DownloadPayslipButton";
import { Field } from "@/components/common/Field";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Employee } from "@/types";

/* ─── Tab config ──────────────────────────────────────────────── */
const TABS = [
  { id: "Profile",     icon: User          },
  { id: "Payroll",    icon: Wallet        },
  { id: "Leave",      icon: CalendarOff   },
  { id: "Attendance", icon: CalendarCheck },
] as const;
type Tab = (typeof TABS)[number]["id"];

/* ─── Edit form schema ────────────────────────────────────────── */
const editSchema = z.object({
  phone:                   z.string().max(30).optional().or(z.literal("")),
  address:                 z.string().max(255).optional().or(z.literal("")),
  city:                    z.string().max(100).optional().or(z.literal("")),
  country:                 z.string().max(100).optional().or(z.literal("")),
  emergency_contact_name:  z.string().max(100).optional().or(z.literal("")),
  emergency_contact_phone: z.string().max(30).optional().or(z.literal("")),
  bank_name:               z.string().max(100).optional().or(z.literal("")),
  bank_account_number:     z.string().max(50).optional().or(z.literal("")),
  tax_id:                  z.string().max(50).optional().or(z.literal("")),
});
type EditValues = z.infer<typeof editSchema>;

/* ─── Sub-components ──────────────────────────────────────────── */

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      className="h-20 w-20 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shrink-0"
      style={{ background: "linear-gradient(135deg, #eab308, #d97706)", boxShadow: "0 0 24px rgba(234,179,8,0.3)" }}
    >
      {initials}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "rgba(59,130,246,0.12)" }}>
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <span className="text-slate-400 text-sm flex-1">{label}</span>
      <span className="text-white text-sm font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-5 mb-6">
          <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" style={{ opacity: 0.6 }} />
            <Skeleton className="h-6 w-24 rounded-lg" style={{ opacity: 0.5 }} />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-20" style={{ opacity: 0.5 }} />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", opacity: 1 - i * 0.08 }}>
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <Skeleton className="h-3.5 w-24" style={{ opacity: 0.6 }} />
            <Skeleton className="h-3.5 w-36 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Edit Dialog ─────────────────────────────────────────────── */
function EditDialog({
  emp,
  onClose,
}: {
  emp: Employee;
  onClose: () => void;
}) {
  const qc = useQueryClient();

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      phone:                   emp.phone                      ?? "",
      address:                 emp.profile?.address           ?? "",
      city:                    emp.profile?.city              ?? "",
      country:                 emp.profile?.country           ?? "",
      emergency_contact_name:  emp.profile?.emergency_contact_name  ?? "",
      emergency_contact_phone: emp.profile?.emergency_contact_phone ?? "",
      bank_name:               emp.profile?.bank_name         ?? "",
      bank_account_number:     emp.profile?.bank_account_number ?? "",
      tax_id:                  emp.profile?.tax_id            ?? "",
    },
  });

  const update = useMutation({
    mutationFn: (values: EditValues) => portal.updateEmployee(values as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "employee"] });
      toast.success("Profile updated");
      onClose();
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
    <Dialog open onClose={onClose} title="Edit My Profile" description="Update your contact and personal details">
      <form onSubmit={form.handleSubmit((v) => update.mutate(v))} className="space-y-5">

        {/* Contact */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Contact</p>
          <Field label="Phone" error={form.formState.errors.phone?.message}>
            <Input placeholder="+1-555-000-0000" {...form.register("phone")} />
          </Field>
        </div>

        {/* Address */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Address</p>
          <div className="space-y-3">
            <Field label="Street address" error={form.formState.errors.address?.message}>
              <Input {...form.register("address")} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" error={form.formState.errors.city?.message}>
                <Input {...form.register("city")} />
              </Field>
              <Field label="Country" error={form.formState.errors.country?.message}>
                <Input {...form.register("country")} />
              </Field>
            </div>
          </div>
        </div>

        {/* Emergency contact */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Emergency contact</p>
          <div className="space-y-3">
            <Field label="Full name" error={form.formState.errors.emergency_contact_name?.message}>
              <Input {...form.register("emergency_contact_name")} />
            </Field>
            <Field label="Phone" error={form.formState.errors.emergency_contact_phone?.message}>
              <Input {...form.register("emergency_contact_phone")} />
            </Field>
          </div>
        </div>

        {/* Banking */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Banking</p>
          <div className="space-y-3">
            <Field label="Bank name" error={form.formState.errors.bank_name?.message}>
              <Input {...form.register("bank_name")} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Account number" error={form.formState.errors.bank_account_number?.message}>
                <Input {...form.register("bank_account_number")} />
              </Field>
              <Field label="Tax ID" error={form.formState.errors.tax_id?.message}>
                <Input {...form.register("tax_id")} />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button type="submit" variant="yellow" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function PortalPage() {
  const { user } = useAuth();
  const [tab, setTab]         = useState<Tab>("Profile");
  const [editing, setEditing] = useState(false);

  const profile    = useQuery({ queryKey: ["me", "employee"],   queryFn: portal.employee });
  const payrolls   = useQuery({ queryKey: ["me", "payrolls"],   queryFn: portal.payrolls,   enabled: tab === "Payroll"    });
  const leaves     = useQuery({ queryKey: ["me", "leaves"],     queryFn: portal.leaves,     enabled: tab === "Leave"      });
  const attendance = useQuery({ queryKey: ["me", "attendance"], queryFn: portal.attendance, enabled: tab === "Attendance" });

  const roleName = user?.roles?.[0]?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Employee";

  return (
    <>
      <PageHeader title="My Portal" description={roleName} />

      {/* Pill tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {TABS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all",
              tab === id ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
            )}
            style={tab === id ? { background: "rgba(37,99,235,0.55)", backdropFilter: "blur(8px)", boxShadow: "0 2px 12px rgba(37,99,235,0.25)" } : {}}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{id}</span>
          </button>
        ))}
      </div>

      {/* ── Profile ── */}
      {tab === "Profile" && (
        profile.isLoading ? <ProfileSkeleton /> :
        !profile.data ? (
          <div className="rounded-2xl p-10 flex flex-col items-center text-center gap-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-1"
              style={{ background: "rgba(59,130,246,0.12)" }}>
              <User className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-white font-medium">No employee record linked</p>
            <p className="text-slate-400 text-sm">Contact HR to link your account to an employee record.</p>
          </div>
        ) : (
          <>
            {/* Hero card */}
            <div className="rounded-2xl p-6 mb-4"
              style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(15,34,72,0.6))", border: "1px solid rgba(59,130,246,0.25)", backdropFilter: "blur(24px)" }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <Avatar name={profile.data.full_name} />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">{profile.data.full_name}</h2>
                  <p className="text-blue-300 text-sm mt-0.5">{profile.data.position?.title ?? "Employee"}</p>
                  <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg text-xs font-mono"
                    style={{ background: "rgba(234,179,8,0.12)", color: "#fde68a", border: "1px solid rgba(234,179,8,0.25)" }}>
                    <Hash className="w-3 h-3" />
                    {profile.data.employee_code}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={profile.data.status}>{profile.data.status}</Badge>
                  <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-6 pt-5"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                {[
                  { label: "Base Salary", value: formatCurrency(profile.data.salary) },
                  { label: "Department",  value: profile.data.department?.name },
                  { label: "Type",        value: profile.data.employment_type?.replace("_", " ") },
                  { label: "Date Hired",  value: formatDate(profile.data.date_hired) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400 mb-1">{label}</p>
                    <div className="text-sm font-semibold text-white">{value ?? "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact details */}
            <Card>
              <CardHeader>
                <CardTitle>Contact & Details</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <InfoRow icon={Mail}       label="Email"       value={profile.data.email} />
                <InfoRow icon={Phone}      label="Phone"       value={profile.data.phone} />
                <InfoRow icon={Building2}  label="Department"  value={profile.data.department?.name} />
                <InfoRow icon={Briefcase}  label="Position"    value={profile.data.position?.title} />
                <InfoRow icon={DollarSign} label="Base Salary" value={formatCurrency(profile.data.salary)} />
                <InfoRow icon={Calendar}   label="Date Hired"  value={formatDate(profile.data.date_hired)} />
              </CardContent>
            </Card>

            {/* Profile extras */}
            {profile.data.profile && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Address & Emergency</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <InfoRow icon={Building2} label="Address"           value={[profile.data.profile.address, profile.data.profile.city, profile.data.profile.country].filter(Boolean).join(", ")} />
                  <InfoRow icon={User}      label="Emergency Contact" value={profile.data.profile.emergency_contact_name} />
                  <InfoRow icon={Phone}     label="Emergency Phone"   value={profile.data.profile.emergency_contact_phone} />
                </CardContent>
              </Card>
            )}
          </>
        )
      )}

      {/* ── Payroll ── */}
      {tab === "Payroll" && (
        payrolls.isLoading ? <TableSkeleton cols={5} rows={6} /> : (
          <>
            {payrolls.data && payrolls.data.length > 0 && (
              <div className="rounded-2xl p-5 mb-4 flex items-center gap-5"
                style={{ background: "rgba(37,99,235,0.10)", border: "1px solid rgba(37,99,235,0.22)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(37,99,235,0.25)" }}>
                  <Wallet className="w-6 h-6 text-blue-300" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-0.5">Latest net pay</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(payrolls.data[0].net_pay)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{payrolls.data[0].period?.name ?? "—"}</p>
                </div>
                <Badge status={payrolls.data[0].status}>{payrolls.data[0].status}</Badge>
              </div>
            )}
            <Card className="p-4">
              <Table>
                <THead><TR><TH>Period</TH><TH>Gross</TH><TH>Net</TH><TH>Status</TH><TH className="text-right">Payslip</TH></TR></THead>
                <TBody>
                  {payrolls.data?.map((p) => (
                    <TR key={p.id}>
                      <TD>{p.period?.name ?? "—"}</TD>
                      <TD>{formatCurrency(p.gross_pay)}</TD>
                      <TD className="font-semibold">{formatCurrency(p.net_pay)}</TD>
                      <TD><Badge status={p.status}>{p.status}</Badge></TD>
                      <TD className="text-right">
                        {p.payslip ? (
                          <DownloadPayslipButton
                            payslipId={p.payslip.id}
                            filename={`${p.payslip.payslip_number}.pdf`}
                          >
                            <Download className="h-3.5 w-3.5" /> PDF
                          </DownloadPayslipButton>
                        ) : <span className="text-xs text-slate-500">—</span>}
                      </TD>
                    </TR>
                  ))}
                  {payrolls.data?.length === 0 && <TR><TD colSpan={5} className="py-10 text-center text-slate-500">No payroll records yet.</TD></TR>}
                </TBody>
              </Table>
            </Card>
          </>
        )
      )}

      {/* ── Leave ── */}
      {tab === "Leave" && (
        leaves.isLoading ? <TableSkeleton cols={5} rows={6} /> : (
          <>
            {leaves.data && leaves.data.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Pending",  filter: "pending",  bg: "rgba(234,179,8,0.10)",  border: "rgba(234,179,8,0.25)",  color: "#fde68a" },
                  { label: "Approved", filter: "approved", bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.25)",  color: "#86efac" },
                  { label: "Rejected", filter: "rejected", bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.25)",  color: "#fca5a5" },
                ].map(({ label, filter, bg, border, color }) => (
                  <div key={label} className="rounded-xl p-4 text-center" style={{ background: bg, border: `1px solid ${border}` }}>
                    <p className="text-2xl font-bold" style={{ color }}>{leaves.data!.filter((l) => l.status === filter).length}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
            <Card className="p-4">
              <Table>
                <THead><TR><TH>Type</TH><TH>From</TH><TH>To</TH><TH>Days</TH><TH>Status</TH></TR></THead>
                <TBody>
                  {leaves.data?.map((l) => (
                    <TR key={l.id}>
                      <TD>{l.leave_type?.name ?? "—"}</TD>
                      <TD>{formatDate(l.start_date)}</TD>
                      <TD>{formatDate(l.end_date)}</TD>
                      <TD>{l.days}</TD>
                      <TD><Badge status={l.status}>{l.status}</Badge></TD>
                    </TR>
                  ))}
                  {leaves.data?.length === 0 && <TR><TD colSpan={5} className="py-10 text-center text-slate-500">No leave requests yet.</TD></TR>}
                </TBody>
              </Table>
            </Card>
          </>
        )
      )}

      {/* ── Attendance ── */}
      {tab === "Attendance" && (
        attendance.isLoading ? <TableSkeleton cols={5} rows={8} /> : (
          <>
            {attendance.data && attendance.data.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Present",  filter: "present",  color: "#86efac", bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.22)"  },
                  { label: "Absent",   filter: "absent",   color: "#fca5a5", bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.22)"  },
                  { label: "Late",     filter: "late",     color: "#fde68a", bg: "rgba(234,179,8,0.10)",  border: "rgba(234,179,8,0.22)"  },
                  { label: "On Leave", filter: "on_leave", color: "#93c5fd", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.22)" },
                ].map(({ label, filter, color, bg, border }) => (
                  <div key={label} className="rounded-xl p-4 text-center" style={{ background: bg, border: `1px solid ${border}` }}>
                    <p className="text-2xl font-bold" style={{ color }}>{attendance.data!.filter((a) => a.status === filter).length}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
            <Card className="p-4">
              <Table>
                <THead><TR><TH>Date</TH><TH>Time In</TH><TH>Time Out</TH><TH>Hours</TH><TH>Status</TH></TR></THead>
                <TBody>
                  {attendance.data?.map((a) => (
                    <TR key={a.id}>
                      <TD>{formatDate(a.date)}</TD>
                      <TD>{a.time_in ? <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" />{a.time_in}</span> : "—"}</TD>
                      <TD>{a.time_out ? <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" />{a.time_out}</span> : "—"}</TD>
                      <TD>{a.hours_worked ?? "—"}</TD>
                      <TD><Badge status={a.status}>{a.status.replace("_", " ")}</Badge></TD>
                    </TR>
                  ))}
                  {attendance.data?.length === 0 && <TR><TD colSpan={5} className="py-10 text-center text-slate-500">No attendance records yet.</TD></TR>}
                </TBody>
              </Table>
            </Card>
          </>
        )
      )}

      {/* Edit dialog */}
      {editing && profile.data && (
        <EditDialog emp={profile.data} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
