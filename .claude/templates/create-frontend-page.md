# Template: Create Frontend Page

Replace `{Name}` / `{name}` / `{names}` with your module name.

## 1. Hook — `hooks/modules/use{Names}.ts`

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api";
import { services } from "@/services";
import type { {Name}, PaginatedResponse } from "@/types";

const KEY = ["{names}"];

export function use{Names}(params: Record<string, unknown>) {
  return useQuery<PaginatedResponse<{Name}>>({
    queryKey: [...KEY, params],
    queryFn: () => services.{names}.list(params),
  });
}

export function useCreate{Name}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => services.{names}.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("{Name} created"); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
}

export function useUpdate{Name}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      services.{names}.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("{Name} updated"); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
}

export function useDelete{Name}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => services.{names}.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("{Name} deleted"); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
}
```

## 2. Form — `app/(app)/{names}/_components/{Name}Form.tsx`

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/common/Field";
import { Input } from "@/components/ui/input";
import type { {Name} } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Required"),
  // add more fields
});
type FormValues = z.infer<typeof schema>;

export function {Name}Form({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<{Name}>;
  onSubmit: (data: Record<string, unknown>) => void;
  isPending: boolean;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: defaultValues ?? {},
  });

  return (
    <form onSubmit={form.handleSubmit((v) => onSubmit(v))} className="space-y-4">
      <Field label="Name" error={form.formState.errors.name?.message}>
        <Input {...form.register("name")} placeholder="Enter name" />
      </Field>
      <Button type="submit" variant="yellow" className="w-full" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
```

## 3. Page — `app/(app)/{names}/page.tsx`

```tsx
"use client";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { LoadingBlock } from "@/components/ui/spinner";
import { use{Names}, useCreate{Name}, useUpdate{Name}, useDelete{Name} } from "@/hooks/modules/use{Names}";
import { {Name}Form } from "./_components/{Name}Form";
import type { {Name} } from "@/types";

export default function {Names}Page() {
  const [params, setParams] = useState({ page: 1, search: "", per_page: 15 });
  const [open, setOpen] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<{Name} | null>(null);

  const { data, isLoading } = use{Names}(params);
  const create = useCreate{Name}();
  const update = useUpdate{Name}();
  const remove = useDelete{Name}();

  return (
    <>
      <PageHeader
        title="{Names}"
        action={
          <Button variant="yellow" onClick={() => { setSelected(null); setOpen("create"); }}>
            <Plus className="h-4 w-4" /> Add {Name}
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search…"
            className="pl-9"
            value={params.search}
            onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingBlock />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Status</TH>
                  <TH />
                </TR>
              </THead>
              <TBody>
                {data?.data.map((item) => (
                  <TR key={item.id}>
                    <TD className="font-medium text-white">{item.name}</TD>
                    <TD><Badge status={item.status}>{item.status}</Badge></TD>
                    <TD className="text-right">
                      <button
                        className="text-blue-400 hover:text-blue-300 text-xs mr-3"
                        onClick={() => { setSelected(item); setOpen("edit"); }}
                      >Edit</button>
                      <button
                        className="text-red-400 hover:text-red-300 text-xs"
                        onClick={() => { if (confirm("Delete?")) remove.mutate(item.id); }}
                      >Delete</button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {data && (
        <Pagination
          page={data.meta.current_page}
          lastPage={data.meta.last_page}
          total={data.meta.total}
          onChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        />
      )}

      <Dialog
        open={open === "create"}
        onClose={() => setOpen(null)}
        title="Add {Name}"
      >
        <{Name}Form
          onSubmit={(d) => create.mutate(d, { onSuccess: () => setOpen(null) })}
          isPending={create.isPending}
        />
      </Dialog>

      <Dialog
        open={open === "edit"}
        onClose={() => setOpen(null)}
        title="Edit {Name}"
      >
        <{Name}Form
          defaultValues={selected ?? undefined}
          onSubmit={(d) => update.mutate({ id: selected!.id, data: d }, { onSuccess: () => setOpen(null) })}
          isPending={update.isPending}
        />
      </Dialog>
    </>
  );
}
```
