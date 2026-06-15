"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Archive, Eye } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees, useDeleteEmployee, useArchiveEmployee } from "@/modules/employee/hooks";
import { apiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export default function EmployeesPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);

  const { data, isLoading } = useEmployees({
    search: debounced || undefined,
    status: status || undefined,
    page,
    per_page: 10,
  });
  const del = useDeleteEmployee();
  const archive = useArchiveEmployee();

  const canManage = hasPermission("create employee");

  return (
    <>
      <PageHeader
        title="Employees"
        description="Manage employee records"
        action={
          canManage && (
            <Link href="/employees/new">
              <Button>
                <Plus className="h-4 w-4" /> Add Employee
              </Button>
            </Link>
          )
        }
      />

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search name, code, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="h-9 rounded-md border border-gray-300 px-3 text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {isLoading ? (
          <TableSkeleton cols={7} rows={8} hasPagination />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Code</TH>
                  <TH>Name</TH>
                  <TH>Department</TH>
                  <TH>Position</TH>
                  <TH>Salary</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {data?.data.map((emp) => (
                  <TR key={emp.id}>
                    <TD className="font-mono text-xs">{emp.employee_code}</TD>
                    <TD className="font-medium">{emp.full_name}</TD>
                    <TD>{emp.department?.name ?? "—"}</TD>
                    <TD>{emp.position?.title ?? "—"}</TD>
                    <TD>{formatCurrency(emp.salary)}</TD>
                    <TD>
                      <Badge status={emp.status}>{emp.status}</Badge>
                    </TD>
                    <TD>
                      <div className="flex justify-end gap-1">
                        <Link href={`/employees/${emp.id}`}>
                          <Button variant="ghost" size="icon" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {canManage && (
                          <>
                            <Link href={`/employees/${emp.id}/edit`}>
                              <Button variant="ghost" size="icon" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Archive"
                              onClick={() =>
                                archive.mutate(emp.id, {
                                  onSuccess: () => toast.success("Employee archived"),
                                  onError: (e) => toast.error(apiErrorMessage(e)),
                                })
                              }
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete"
                              onClick={() => {
                                if (!confirm(`Delete ${emp.full_name}?`)) return;
                                del.mutate(emp.id, {
                                  onSuccess: () => toast.success("Employee deleted"),
                                  onError: (e) => toast.error(apiErrorMessage(e)),
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TD>
                  </TR>
                ))}
                {data?.data.length === 0 && (
                  <TR>
                    <TD colSpan={7} className="py-8 text-center text-gray-500">
                      No employees found.
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
    </>
  );
}
