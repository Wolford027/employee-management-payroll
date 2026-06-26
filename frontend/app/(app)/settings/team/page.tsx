"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
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
import {
  useTeamMembers,
  useInviteTeamMember,
  useRemoveTeamMember,
} from "@/hooks/modules/useTeam";
import { useAuth } from "@/hooks/useAuth";

const inviteSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  role: z.enum(["hr", "manager", "employee"]),
});
type InviteValues = z.infer<typeof inviteSchema>;

export default function TeamPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useTeamMembers(page);
  const invite = useInviteTeamMember();
  const remove = useRemoveTeamMember();
  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "employee" },
  });

  const canManage = user?.is_owner || user?.roles?.includes("hr");

  return (
    <>
      <PageHeader
        title="Team Members"
        action={
          canManage ? (
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Invite Member
            </Button>
          ) : undefined
        }
      />
      <Card className="p-4">
        {isLoading ? (
          <TableSkeleton cols={5} rows={8} hasPagination />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Role</TH>
                  <TH>Status</TH>
                  {canManage && <TH className="text-right">Actions</TH>}
                </TR>
              </THead>
              <TBody>
                {data?.data.map((member) => (
                  <TR key={member.id}>
                    <TD className="font-medium">
                      {member.name}
                      {member.is_owner && (
                        <span className="ml-2 text-xs text-yellow-400">(owner)</span>
                      )}
                    </TD>
                    <TD>{member.email}</TD>
                    <TD>
                      <Badge status={member.roles[0] ?? "employee"}>
                        {member.roles[0] ?? "—"}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge
                        status={member.force_password_change ? "pending" : "active"}
                      >
                        {member.force_password_change
                          ? "password pending"
                          : member.status}
                      </Badge>
                    </TD>
                    {canManage && (
                      <TD>
                        <div className="flex justify-end">
                          {!member.is_owner && member.id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("Remove this member?")) {
                                  remove.mutate(member.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          )}
                        </div>
                      </TD>
                    )}
                  </TR>
                ))}
                {data?.data.length === 0 && (
                  <TR>
                    <TD colSpan={canManage ? 5 : 4} className="py-8 text-center text-slate-500">
                      No team members found.
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
            {data && (
              <Pagination
                page={data.meta.current_page}
                lastPage={data.meta.last_page}
                total={data.meta.total}
                onChange={setPage}
              />
            )}
          </>
        )}
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Invite Team Member"
        description="They will receive a temporary password and be prompted to change it on first login."
      >
        <form
          onSubmit={form.handleSubmit((v) => {
            invite.mutate(v, {
              onSuccess: () => {
                setOpen(false);
                form.reset();
              },
            });
          })}
          className="space-y-4"
        >
          <Field label="Full name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} placeholder="Jane Smith" />
          </Field>
          <Field
            label="Email address"
            error={form.formState.errors.email?.message}
          >
            <Input
              type="email"
              {...form.register("email")}
              placeholder="jane@example.com"
            />
          </Field>
          <Field label="Role" error={form.formState.errors.role?.message}>
            <Select {...form.register("role")}>
              <option value="hr">HR</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </Select>
          </Field>
          <p className="text-xs text-slate-500">
            Default password is <code>12345678</code>. The user will be prompted
            to change it on first login.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={invite.isPending}>
              {invite.isPending ? "Inviting…" : "Send Invite"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
