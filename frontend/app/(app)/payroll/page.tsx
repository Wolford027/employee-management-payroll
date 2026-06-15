"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Zap, Eye } from "lucide-react";
import { toast } from "sonner";
import { departmentsApi, employeesApi, generatePayroll, payrollPeriodsApi, payrollsApi } from "@/services";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/common/Field";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { PeriodsSkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

const periodSchema = z.object({
  name: z.string().min(1, "Required"),
  cycle: z.enum(["weekly", "biweekly", "semi_monthly", "monthly"]),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  pay_date: z.string().optional(),
  status: z.enum(["draft", "processing", "completed", "closed"]),
});
type PeriodForm = z.infer<typeof periodSchema>;

const genSchema = z.object({
  payroll_period_id: z.coerce.number().min(1, "Select a period"),
  scope: z.enum(["all", "department", "employee"]),
  department_id: z.coerce.number().optional(),
  employee_id: z.coerce.number().optional(),
});
type GenForm = z.infer<typeof genSchema>;

export default function PayrollPage() {
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("create payroll");
  const [periodModal, setPeriodModal] = useState(false);
  const [genModal, setGenModal] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<string>("");

  const periodsQ = useQuery({ queryKey: ["payroll-periods"], queryFn: () => payrollPeriodsApi.list({ per_page: 100 }) });
  const payrollsQ = useQuery({
    queryKey: ["payrolls", filterPeriod],
    queryFn: () => payrollsApi.list({ payroll_period_id: filterPeriod || undefined, per_page: 15 }),
  });
  const { data: departments } = useQuery({ queryKey: ["departments", "all"], queryFn: () => departmentsApi.list({ per_page: 100 }) });
  const { data: employees } = useQuery({ queryKey: ["employees", "all"], queryFn: () => employeesApi.list({ per_page: 100 }) });

  const periodForm = useForm<PeriodForm>({ resolver: zodResolver(periodSchema) as unknown as Resolver<PeriodForm>, defaultValues: { cycle: "monthly", status: "draft" } });
  const genForm = useForm<GenForm>({ resolver: zodResolver(genSchema) as unknown as Resolver<GenForm>, defaultValues: { scope: "all" } });
  const scope = genForm.watch("scope");

  const savePeriod = useMutation({
    mutationFn: (v: PeriodForm) => payrollPeriodsApi.create(v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payroll-periods"] }); toast.success("Period created"); setPeriodModal(false); periodForm.reset(); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const generate = useMutation({
    mutationFn: (v: GenForm) => generatePayroll(v),
    onSuccess: (res) => { qc.invalidateQueries({ queryKey: ["payrolls"] }); toast.success(res.message); setGenModal(false); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
    <>
      <PageHeader
        title="Payroll"
        description="Manage payroll periods and process payroll"
        action={
          canManage && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPeriodModal(true)}><Plus className="h-4 w-4" /> New Period</Button>
              <Button onClick={() => setGenModal(true)}><Zap className="h-4 w-4" /> Generate Payroll</Button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Periods</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {periodsQ.isLoading ? <PeriodsSkeleton /> : periodsQ.data?.data.map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterPeriod(String(p.id))}
                className={`w-full rounded-md border p-3 text-left text-sm ${filterPeriod === String(p.id) ? "border-gray-900 bg-gray-50" : "border-gray-200"}`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{p.name}</span>
                  <Badge status={p.status}>{p.status}</Badge>
                </div>
                <div className="mt-1 text-xs text-gray-500">{p.cycle.replace("_", " ")} · {p.payrolls_count ?? 0} payrolls</div>
              </button>
            ))}
            <button onClick={() => setFilterPeriod("")} className="w-full rounded-md p-2 text-left text-xs text-gray-500 hover:bg-gray-50">Show all payrolls</button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 p-4">
          {payrollsQ.isLoading ? <TableSkeleton cols={6} rows={6} /> : (
            <Table>
              <THead><TR><TH>Employee</TH><TH>Period</TH><TH>Gross</TH><TH>Net</TH><TH>Status</TH><TH className="text-right">View</TH></TR></THead>
              <TBody>
                {payrollsQ.data?.data.map((p) => (
                  <TR key={p.id}>
                    <TD className="font-medium">{p.employee?.full_name ?? `#${p.employee_id}`}</TD>
                    <TD>{p.period?.name ?? "—"}</TD>
                    <TD>{formatCurrency(p.gross_pay)}</TD>
                    <TD className="font-semibold">{formatCurrency(p.net_pay)}</TD>
                    <TD><Badge status={p.status}>{p.status}</Badge></TD>
                    <TD className="text-right">
                      <Link href={`/payroll/${p.id}`}><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></Link>
                    </TD>
                  </TR>
                ))}
                {payrollsQ.data?.data.length === 0 && <TR><TD colSpan={6} className="py-8 text-center text-gray-500">No payrolls. Generate some for a period.</TD></TR>}
              </TBody>
            </Table>
          )}
        </Card>
      </div>

      {/* New Period */}
      <Dialog open={periodModal} onClose={() => setPeriodModal(false)} title="New Payroll Period">
        <form onSubmit={periodForm.handleSubmit((v) => savePeriod.mutate(v))} className="space-y-4">
          <Field label="Name" error={periodForm.formState.errors.name?.message}><Input placeholder="e.g. July 2026 Payroll" {...periodForm.register("name")} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cycle"><Select {...periodForm.register("cycle")}><option value="weekly">Weekly</option><option value="biweekly">Bi-weekly</option><option value="semi_monthly">Semi-monthly</option><option value="monthly">Monthly</option></Select></Field>
            <Field label="Status"><Select {...periodForm.register("status")}><option value="draft">Draft</option><option value="processing">Processing</option><option value="completed">Completed</option><option value="closed">Closed</option></Select></Field>
            <Field label="Start Date" error={periodForm.formState.errors.start_date?.message}><Input type="date" {...periodForm.register("start_date")} /></Field>
            <Field label="End Date" error={periodForm.formState.errors.end_date?.message}><Input type="date" {...periodForm.register("end_date")} /></Field>
            <Field label="Pay Date"><Input type="date" {...periodForm.register("pay_date")} /></Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setPeriodModal(false)}>Cancel</Button>
            <Button type="submit" disabled={savePeriod.isPending}>Create</Button>
          </div>
        </form>
      </Dialog>

      {/* Generate Payroll */}
      <Dialog open={genModal} onClose={() => setGenModal(false)} title="Generate Payroll" description="Simple manual computation: basic salary + allowances − deductions">
        <form onSubmit={genForm.handleSubmit((v) => generate.mutate(v))} className="space-y-4">
          <Field label="Period" error={genForm.formState.errors.payroll_period_id?.message}>
            <Select {...genForm.register("payroll_period_id")}>
              <option value="">— Select period —</option>
              {periodsQ.data?.data.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Scope"><Select {...genForm.register("scope")}><option value="all">All employees</option><option value="department">By department</option><option value="employee">Single employee</option></Select></Field>
          {scope === "department" && (
            <Field label="Department"><Select {...genForm.register("department_id")}><option value="">— Select —</option>{departments?.data.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></Field>
          )}
          {scope === "employee" && (
            <Field label="Employee"><Select {...genForm.register("employee_id")}><option value="">— Select —</option>{employees?.data.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}</Select></Field>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setGenModal(false)}>Cancel</Button>
            <Button type="submit" disabled={generate.isPending}>{generate.isPending ? "Generating..." : "Generate"}</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
