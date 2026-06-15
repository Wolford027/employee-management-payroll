"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pencil, ArrowLeft, UserPlus, Copy, Check, UserCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { useEmployee, useCreateEmployeeAccount } from "@/modules/employee/hooks";
import { useAuth } from "@/hooks/useAuth";
import { apiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { LoadingBlock } from "@/components/ui/spinner";
import { formatCurrency, formatDate } from "@/lib/utils";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex justify-between py-2.5 text-sm"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-white text-right">{value ?? "—"}</span>
    </div>
  );
}

interface Credentials { name: string; email: string; password: string }

function CredentialsModal({ creds, onClose }: { creds: Credentials; onClose: () => void }) {
  const [copied, setCopied] = useState<"email" | "password" | null>(null);
  const copy = (text: string, field: "email" | "password") => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open onClose={onClose} title="Account created">
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl p-4"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <UserCheck className="w-5 h-5 shrink-0" style={{ color: "#86efac" }} />
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-white">{creds.name}</span> now has a login account.
            Share these credentials — the password won&apos;t be shown again.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Email</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg px-3 py-2.5 text-sm font-mono text-blue-300"
              style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
              {creds.email}
            </code>
            <button onClick={() => copy(creds.email, "email")}
              className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              {copied === "email" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Temporary password</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg px-3 py-2.5 text-sm font-mono text-yellow-300"
              style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
              {creds.password}
            </code>
            <button onClick={() => copy(creds.password, "password")}
              className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              {copied === "password" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500">The employee should change their password after first login.</p>
        <Button variant="yellow" className="w-full" onClick={onClose}>Done</Button>
      </div>
    </Dialog>
  );
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { hasPermission } = useAuth();
  const { data: emp, isLoading } = useEmployee(id);
  const createAccount = useCreateEmployeeAccount();
  const [creds, setCreds] = useState<Credentials | null>(null);

  if (isLoading || !emp) return <LoadingBlock />;

  const canManage = hasPermission("update employee");

  const handleCreateAccount = () => {
    createAccount.mutate(emp.id, {
      onSuccess: (result) => {
        setCreds({
          name:     emp.full_name,
          email:    result.account.email,
          password: result.account.temp_password,
        });
      },
      onError: (e) => toast.error(apiErrorMessage(e)),
    });
  };

  return (
    <>
      <PageHeader
        title={emp.full_name}
        description={emp.employee_code}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/employees">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
            {canManage && !emp.has_account && (
              <Button
                variant="secondary"
                onClick={handleCreateAccount}
                disabled={createAccount.isPending}
              >
                <UserPlus className="h-4 w-4" />
                {createAccount.isPending ? "Creating…" : "Create Account"}
              </Button>
            )}
            {canManage && (
              <Link href={`/employees/${emp.id}/edit`}>
                <Button variant="yellow">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employment</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Status" value={<Badge status={emp.status}>{emp.status}</Badge>} />
            <Row label="Department" value={emp.department?.name} />
            <Row label="Position" value={emp.position?.title} />
            <Row label="Salary" value={formatCurrency(emp.salary)} />
            <Row label="Employment Type" value={emp.employment_type?.replace("_", " ")} />
            <Row label="Date Hired" value={formatDate(emp.date_hired)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Email" value={emp.email} />
            <Row label="Phone" value={emp.phone} />
            <Row label="Gender" value={emp.profile?.gender} />
            <Row label="City" value={emp.profile?.city} />
            <Row label="Address" value={emp.profile?.address} />
            <Row label="Emergency Contact" value={emp.profile?.emergency_contact_name} />
          </CardContent>
        </Card>

        {/* Account status card */}
        <Card>
          <CardHeader>
            <CardTitle>System Account</CardTitle>
          </CardHeader>
          <CardContent>
            {emp.has_account ? (
              <div className="flex items-center gap-3 rounded-xl p-4"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <UserCheck className="w-5 h-5 shrink-0" style={{ color: "#86efac" }} />
                <div>
                  <p className="text-sm font-medium text-white">Account active</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Can log in, time-in, request leave, and download payslips.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl p-4"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <ShieldOff className="w-5 h-5 shrink-0" style={{ color: "#fcd34d" }} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">No account yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Employee cannot log in until an account is created.
                  </p>
                </div>
                {canManage && (
                  <Button size="sm" variant="secondary" onClick={handleCreateAccount} disabled={createAccount.isPending}>
                    <UserPlus className="w-3.5 h-3.5" />
                    Create
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {creds && <CredentialsModal creds={creds} onClose={() => setCreds(null)} />}
    </>
  );
}
