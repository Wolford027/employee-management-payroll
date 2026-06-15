"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { departmentsApi, positionsApi } from "@/services";
import type { Employee } from "@/types";
import { Field } from "@/components/common/Field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const schema = z.object({
  employee_code: z.string().min(1, "Required"),
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  salary: z.coerce.number().min(0, "Must be ≥ 0"),
  date_hired: z.string().optional(),
  employment_type: z.enum(["full_time", "part_time", "contract"]),
  status: z.enum(["active", "inactive", "archived"]),
  department_id: z.coerce.number().optional(),
  position_id: z.coerce.number().optional(),
});

export type EmployeeFormValues = z.infer<typeof schema>;

export function EmployeeForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Employee;
  onSubmit: (values: EmployeeFormValues) => void;
  submitting: boolean;
}) {
  const { data: departments } = useQuery({
    queryKey: ["departments", "all"],
    queryFn: () => departmentsApi.list({ per_page: 100 }),
  });
  const { data: positions } = useQuery({
    queryKey: ["positions", "all"],
    queryFn: () => positionsApi.list({ per_page: 100 }),
  });

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<EmployeeFormValues>,
    defaultValues: {
      employee_code: initial?.employee_code ?? "",
      first_name: initial?.first_name ?? "",
      last_name: initial?.last_name ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      salary: initial ? Number(initial.salary) : 0,
      date_hired: initial?.date_hired ?? "",
      employment_type: (initial?.employment_type as EmployeeFormValues["employment_type"]) ?? "full_time",
      status: (initial?.status as EmployeeFormValues["status"]) ?? "active",
      department_id: initial?.department_id ?? undefined,
      position_id: initial?.position_id ?? undefined,
    },
  });

  const e = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Employee Code" error={e.employee_code?.message}>
          <Input {...form.register("employee_code")} />
        </Field>
        <Field label="Status" error={e.status?.message}>
          <Select {...form.register("status")}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </Select>
        </Field>
        <Field label="First Name" error={e.first_name?.message}>
          <Input {...form.register("first_name")} />
        </Field>
        <Field label="Last Name" error={e.last_name?.message}>
          <Input {...form.register("last_name")} />
        </Field>
        <Field label="Email" error={e.email?.message}>
          <Input type="email" {...form.register("email")} />
        </Field>
        <Field label="Phone" error={e.phone?.message}>
          <Input {...form.register("phone")} />
        </Field>
        <Field label="Salary (annual)" error={e.salary?.message}>
          <Input type="number" step="0.01" {...form.register("salary")} />
        </Field>
        <Field label="Date Hired" error={e.date_hired?.message}>
          <Input type="date" {...form.register("date_hired")} />
        </Field>
        <Field label="Employment Type" error={e.employment_type?.message}>
          <Select {...form.register("employment_type")}>
            <option value="full_time">Full time</option>
            <option value="part_time">Part time</option>
            <option value="contract">Contract</option>
          </Select>
        </Field>
        <Field label="Department" error={e.department_id?.message}>
          <Select {...form.register("department_id")}>
            <option value="">— None —</option>
            {departments?.data.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Position" error={e.position_id?.message}>
          <Select {...form.register("position_id")}>
            <option value="">— None —</option>
            {positions?.data.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.level})
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Employee"}
        </Button>
      </div>
    </form>
  );
}
