"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmployeeForm } from "@/modules/employee/EmployeeForm";
import { useSaveEmployee } from "@/modules/employee/hooks";
import { apiErrorMessage } from "@/lib/api";

interface Credentials {
  name: string;
  email: string;
  password: string;
}

function CredentialsModal({ creds, onDone }: { creds: Credentials; onDone: () => void }) {
  const [copied, setCopied] = useState<"email" | "password" | null>(null);

  const copy = (text: string, field: "email" | "password") => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open onClose={onDone} title="Account created">
      <div className="space-y-5">
        {/* Icon + message */}
        <div className="flex items-center gap-3 rounded-xl p-4"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <UserCheck className="w-5 h-5 shrink-0" style={{ color: "#86efac" }} />
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-white">{creds.name}</span> now has a login.
            Share these credentials — the password won&apos;t be shown again.
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Email
          </label>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 rounded-lg px-3 py-2.5 text-sm font-mono text-blue-300"
              style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              {creds.email}
            </code>
            <button
              onClick={() => copy(creds.email, "email")}
              className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {copied === "email" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Temp password */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Temporary password
          </label>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 rounded-lg px-3 py-2.5 text-sm font-mono text-yellow-300"
              style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}
            >
              {creds.password}
            </code>
            <button
              onClick={() => copy(creds.password, "password")}
              className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {copied === "password" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          The employee should change their password after first login.
        </p>

        <Button variant="yellow" className="w-full" onClick={onDone}>
          Done
        </Button>
      </div>
    </Dialog>
  );
}

export default function NewEmployeePage() {
  const router = useRouter();
  const save = useSaveEmployee();
  const [creds, setCreds] = useState<Credentials | null>(null);

  return (
    <>
      <PageHeader title="Add Employee" description="Create a new employee record and login account" />
      <Card>
        <CardContent className="pt-5">
          <EmployeeForm
            submitting={save.isPending}
            onSubmit={(values) =>
              save.mutate(values, {
                onSuccess: (result) => {
                  // Show credentials modal before navigating away.
                  if (result?.account?.temp_password) {
                    setCreds({
                      name:     result.data?.full_name ?? "Employee",
                      email:    result.account.email,
                      password: result.account.temp_password,
                    });
                  } else {
                    toast.success("Employee created");
                    router.push("/employees");
                  }
                },
                onError: (e) => toast.error(apiErrorMessage(e)),
              })
            }
          />
        </CardContent>
      </Card>

      {creds && (
        <CredentialsModal
          creds={creds}
          onDone={() => {
            setCreds(null);
            router.push("/employees");
          }}
        />
      )}
    </>
  );
}
