"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { attendanceApi, employeesApi } from "@/services";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { AttendanceRecord } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/common/Field";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  employee_id: z.coerce.number().min(1, "Required"),
  date: z.string().min(1, "Required"),
  time_in: z.string().optional(),
  time_out: z.string().optional(),
  status: z.enum(["present", "absent", "late", "on_leave", "half_day"]),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function AttendancePage() {
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("create attendance");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["attendance", page], queryFn: () => attendanceApi.list({ page, per_page: 12 }) });
  const { data: employees } = useQuery({ queryKey: ["employees", "all"], queryFn: () => employeesApi.list({ per_page: 100 }) });

  const form = useForm<FormValues>({ resolver: zodResolver(schema) as unknown as Resolver<FormValues>, defaultValues: { status: "present" } });

  const save = useMutation({
    mutationFn: (v: FormValues) => (editing ? attendanceApi.update(editing.id, v) : attendanceApi.create(v)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance"] }); toast.success("Saved"); setOpen(false); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  const del = useMutation({
    mutationFn: (id: number) => attendanceApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance"] }); toast.success("Deleted"); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const openCreate = () => { setEditing(null); form.reset({ employee_id: undefined, date: "", time_in: "", time_out: "", status: "present", notes: "" }); setOpen(true); };
  const openEdit = (r: AttendanceRecord) => { setEditing(r); form.reset({ employee_id: r.employee_id, date: r.date, time_in: r.time_in ?? "", time_out: r.time_out ?? "", status: r.status as FormValues["status"], notes: r.notes ?? "" }); setOpen(true); };

  return (
    <>
      <PageHeader title="Attendance" action={canManage && <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Record</Button>} />
      <Card className="p-4">
        {isLoading ? <TableSkeleton cols={7} rows={8} hasPagination /> : (
          <>
            <Table>
              <THead><TR><TH>Date</TH><TH>Employee</TH><TH>Time In</TH><TH>Time Out</TH><TH>Hours</TH><TH>Status</TH><TH className="text-right">Actions</TH></TR></THead>
              <TBody>
                {data?.data.map((r) => (
                  <TR key={r.id}>
                    <TD>{formatDate(r.date)}</TD>
                    <TD className="font-medium">{r.employee?.full_name ?? `#${r.employee_id}`}</TD>
                    <TD>{r.time_in ?? "—"}</TD>
                    <TD>{r.time_out ?? "—"}</TD>
                    <TD>{r.hours_worked}</TD>
                    <TD><Badge status={r.status}>{r.status.replace("_", " ")}</Badge></TD>
                    <TD>
                      <div className="flex justify-end gap-1">
                        {canManage && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => confirm("Delete record?") && del.mutate(r.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                          </>
                        )}
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            {data && <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} total={data.meta.total} onChange={setPage} />}
          </>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit Attendance" : "Add Attendance"}>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <Field label="Employee" error={form.formState.errors.employee_id?.message}>
            <Select {...form.register("employee_id")}>
              <option value="">— Select —</option>
              {employees?.data.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date" error={form.formState.errors.date?.message}><Input type="date" {...form.register("date")} /></Field>
            <Field label="Status"><Select {...form.register("status")}><option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option><option value="on_leave">On Leave</option><option value="half_day">Half Day</option></Select></Field>
            <Field label="Time In"><Input type="time" {...form.register("time_in")} /></Field>
            <Field label="Time Out"><Input type="time" {...form.register("time_out")} /></Field>
          </div>
          <Field label="Notes"><Input {...form.register("notes")} /></Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
