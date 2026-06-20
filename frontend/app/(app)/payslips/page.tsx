"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye } from "lucide-react";
import { payslipsApi, previewPayslip } from "@/services";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadPayslipButton } from "@/components/payslip/DownloadPayslipButton";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PayslipsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ["payslips", page], queryFn: () => payslipsApi.list({ page, per_page: 15 }) });

  return (
    <>
      <PageHeader title="Payslips" description="Generated payslips" />
      <Card className="p-4">
        {isLoading ? <TableSkeleton cols={6} rows={8} hasPagination /> : (
          <>
            <Table>
              <THead><TR><TH>Payslip #</TH><TH>Employee</TH><TH>Period</TH><TH>Net Pay</TH><TH>Generated</TH><TH className="text-right">Actions</TH></TR></THead>
              <TBody>
                {data?.data.map((p) => (
                  <TR key={p.id}>
                    <TD className="font-mono text-xs">{p.payslip_number}</TD>
                    <TD className="font-medium">{p.employee?.full_name ?? `#${p.employee_id}`}</TD>
                    <TD>{p.payroll?.period ?? "—"}</TD>
                    <TD>{formatCurrency(p.payroll?.net_pay ?? 0)}</TD>
                    <TD>{formatDate(p.generated_at)}</TD>
                    <TD>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Preview" onClick={() => previewPayslip(p.id)}><Eye className="h-4 w-4" /></Button>
                        <DownloadPayslipButton payslipId={p.id} filename={`${p.payslip_number}.pdf`} size="icon"><Download className="h-4 w-4" /></DownloadPayslipButton>
                      </div>
                    </TD>
                  </TR>
                ))}
                {data?.data.length === 0 && <TR><TD colSpan={6} className="py-8 text-center text-slate-500">No payslips yet.</TD></TR>}
              </TBody>
            </Table>
            {data && <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} total={data.meta.total} onChange={setPage} />}
          </>
        )}
      </Card>
    </>
  );
}
