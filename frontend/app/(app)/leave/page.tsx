"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { employeesApi, leavesApi, lookups } from "@/services";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { LeaveRequest } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/common/Field";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  employee_id: z.coerce.number().min(1, "Required"),
  leave_type_id: z.coerce.number().min(1, "Required"),
  start_date: z.string().min(1, "Required"),
  end_date: z.string().min(1, "Required"),
  reason: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "cancelled"]),
});
type FormValues = z.infer<typeof schema>;

export default function LeavePage() {
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("create leave");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveRequest | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["leaves", page], queryFn: () => leavesApi.list({ page, per_page: 12 }) });
  const { data: employees } = useQuery({ queryKey: ["employees", "all"], queryFn: () => employeesApi.list({ per_page: 100 }) });
  const { data: leaveTypes } = useQuery({ queryKey: ["leave-types"], queryFn: lookups.leaveTypes });

  const form = useForm<FormValues>({ resolver: zodResolver(schema) as unknown as Resolver<FormValues>, defaultValues: { status: "pending" } });

  const save = useMutation({
    mutationFn: (v: FormValues) => (editing ? leavesApi.update(editing.id, v) : leavesApi.create(v)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leaves"] }); toast.success("Saved"); setOpen(false); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  const del = useMutation({
    mutationFn: (id: number) => leavesApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leaves"] }); toast.success("Deleted"); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const openCreate = () => { setEditing(null); form.reset({ employee_id: undefined, leave_type_id: undefined, start_date: "", end_date: "", reason: "", status: "pending" }); setOpen(true); };
  const openEdit = (l: LeaveRequest) => { setEditing(l); form.reset({ employee_id: l.employee_id, leave_type_id: l.leave_type_id, start_date: l.start_date, end_date: l.end_date, reason: l.reason ?? "", status: l.status as FormValues["status"] }); setOpen(true); };

  return (
    <>
      <PageHeader title="Leave Requests" action={canManage && <Button onClick={openCreate}><Plus className="h-4 w-4" /> New Request</Button>} />
      <Card className="p-4">
        {isLoading ? <TableSkeleton cols={7} rows={8} hasPagination /> : (
          <>
            <Table>
              <THead><TR><TH>Employee</TH><TH>Type</TH><TH>From</TH><TH>To</TH><TH>Days</TH><TH>Status</TH><TH className="text-right">Actions</TH></TR></THead>
              <TBody>
                {data?.data.map((l) => (
                  <TR key={l.id}>
                    <TD className="font-medium">{l.employee?.full_name ?? `#${l.employee_id}`}</TD>
                    <TD>{l.leave_type?.name ?? "—"}</TD>
                    <TD>{formatDate(l.start_date)}</TD>
                    <TD>{formatDate(l.end_date)}</TD>
                    <TD>{l.days}</TD>
                    <TD><Badge status={l.status}>{l.status}</Badge></TD>
                    <TD>
                      <div className="flex justify-end gap-1">
                        {canManage && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => confirm("Delete request?") && del.mutate(l.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
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

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit Leave" : "New Leave Request"}>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <Field label="Employee" error={form.formState.errors.employee_id?.message}>
            <Select {...form.register("employee_id")}>
              <option value="">— Select —</option>
              {employees?.data.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </Select>
          </Field>
          <Field label="Leave Type" error={form.formState.errors.leave_type_id?.message}>
            <Select {...form.register("leave_type_id")}>
              <option value="">— Select —</option>
              {leaveTypes?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" error={form.formState.errors.start_date?.message}><Input type="date" {...form.register("start_date")} /></Field>
            <Field label="End Date" error={form.formState.errors.end_date?.message}><Input type="date" {...form.register("end_date")} /></Field>
          </div>
          <Field label="Status"><Select {...form.register("status")}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="cancelled">Cancelled</option></Select></Field>
          <Field label="Reason"><Textarea {...form.register("reason")} /></Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
