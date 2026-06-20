"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { departmentsApi } from "@/services";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Department } from "@/types";
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
import { TableSkeleton } from "@/components/ui/skeleton";

const schema = z.object({
  name: z.string().min(1, "Required"),
  code: z.string().min(1, "Required"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});
type FormValues = z.infer<typeof schema>;

export default function DepartmentsPage() {
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("create department");
  const [editing, setEditing] = useState<Department | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["departments", "list"],
    queryFn: () => departmentsApi.list({ per_page: 100 }),
  });

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { status: "active" } });

  const save = useMutation({
    mutationFn: (values: FormValues) =>
      editing ? departmentsApi.update(editing.id, values) : departmentsApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      toast.success(editing ? "Department updated" : "Department created");
      setOpen(false);
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const del = useMutation({
    mutationFn: (id: number) => departmentsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department deleted");
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", code: "", description: "", status: "active" });
    setOpen(true);
  };
  const openEdit = (d: Department) => {
    setEditing(d);
    form.reset({ name: d.name, code: d.code, description: d.description ?? "", status: d.status as "active" | "inactive" });
    setOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Departments"
        action={canManage && <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Department</Button>}
      />
      <Card className="p-4">
        {isLoading ? (
          <TableSkeleton cols={6} rows={7} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Code</TH>
                <TH>Name</TH>
                <TH>Employees</TH>
                <TH>Positions</TH>
                <TH>Status</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {data?.data.map((d) => (
                <TR key={d.id}>
                  <TD className="font-mono text-xs">{d.code}</TD>
                  <TD className="font-medium">{d.name}</TD>
                  <TD>{d.employees_count ?? 0}</TD>
                  <TD>{d.positions_count ?? 0}</TD>
                  <TD><Badge status={d.status}>{d.status}</Badge></TD>
                  <TD>
                    <div className="flex justify-end gap-1">
                      {canManage && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(d)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirm(`Delete ${d.name}?`) && del.mutate(d.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
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

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit Department" : "Add Department"}>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <Field label="Name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="Code" error={form.formState.errors.code?.message}>
            <Input {...form.register("code")} />
          </Field>
          <Field label="Description">
            <Textarea {...form.register("description")} />
          </Field>
          <Field label="Status">
            <Select {...form.register("status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
