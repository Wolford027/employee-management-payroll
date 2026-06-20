"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { departmentsApi, positionsApi } from "@/services";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Position } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/common/Field";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(1, "Required"),
  level: z.enum(["Junior", "Mid", "Senior"]),
  department_id: z.coerce.number().optional(),
  base_salary: z.coerce.number().min(0),
  status: z.enum(["active", "inactive"]),
});
type FormValues = z.infer<typeof schema>;

export default function PositionsPage() {
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("create position");
  const [editing, setEditing] = useState<Position | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["positions", "list"], queryFn: () => positionsApi.list({ per_page: 100 }) });
  const { data: departments } = useQuery({ queryKey: ["departments", "all"], queryFn: () => departmentsApi.list({ per_page: 100 }) });

  const form = useForm<FormValues>({ resolver: zodResolver(schema) as unknown as Resolver<FormValues>, defaultValues: { level: "Junior", status: "active", base_salary: 0 } });

  const save = useMutation({
    mutationFn: (v: FormValues) => (editing ? positionsApi.update(editing.id, v) : positionsApi.create(v)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
      toast.success(editing ? "Position updated" : "Position created");
      setOpen(false);
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
  const del = useMutation({
    mutationFn: (id: number) => positionsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["positions"] }); toast.success("Position deleted"); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const openCreate = () => { setEditing(null); form.reset({ title: "", level: "Junior", department_id: undefined, base_salary: 0, status: "active" }); setOpen(true); };
  const openEdit = (p: Position) => { setEditing(p); form.reset({ title: p.title, level: p.level, department_id: p.department_id ?? undefined, base_salary: Number(p.base_salary), status: p.status as "active" | "inactive" }); setOpen(true); };

  return (
    <>
      <PageHeader title="Positions" action={canManage && <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Position</Button>} />
      <Card className="p-4">
        {isLoading ? <TableSkeleton cols={7} rows={7} /> : (
          <Table>
            <THead><TR><TH>Title</TH><TH>Level</TH><TH>Department</TH><TH>Base Salary</TH><TH>Employees</TH><TH>Status</TH><TH className="text-right">Actions</TH></TR></THead>
            <TBody>
              {data?.data.map((p) => (
                <TR key={p.id}>
                  <TD className="font-medium">{p.title}</TD>
                  <TD>{p.level}</TD>
                  <TD>{p.department?.name ?? "—"}</TD>
                  <TD>{formatCurrency(p.base_salary)}</TD>
                  <TD>{p.employees_count ?? 0}</TD>
                  <TD><Badge status={p.status}>{p.status}</Badge></TD>
                  <TD>
                    <div className="flex justify-end gap-1">
                      {canManage && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => confirm(`Delete ${p.title}?`) && del.mutate(p.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                        </>
                      )}
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit Position" : "Add Position"}>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <Field label="Title" error={form.formState.errors.title?.message}><Input {...form.register("title")} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Level"><Select {...form.register("level")}><option>Junior</option><option>Mid</option><option>Senior</option></Select></Field>
            <Field label="Base Salary" error={form.formState.errors.base_salary?.message}><Input type="number" step="0.01" {...form.register("base_salary")} /></Field>
          </div>
          <Field label="Department">
            <Select {...form.register("department_id")}>
              <option value="">— None —</option>
              {departments?.data.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </Field>
          <Field label="Status"><Select {...form.register("status")}><option value="active">Active</option><option value="inactive">Inactive</option></Select></Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
