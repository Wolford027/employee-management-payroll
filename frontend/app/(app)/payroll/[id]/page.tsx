"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { downloadPayslip, generatePayslip, payrollsApi } from "@/services";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingBlock } from "@/components/ui/spinner";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export default function PayrollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { hasPermission } = useAuth();

  const { data: payroll, isLoading } = useQuery({
    queryKey: ["payrolls", "detail", id],
    queryFn: () => payrollsApi.get(id),
  });

  const genSlip = useMutation({
    mutationFn: () => generatePayslip(Number(id)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payrolls", "detail", id] }); toast.success("Payslip generated"); },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  if (isLoading || !payroll) return <LoadingBlock />;

  const allowances = payroll.items?.filter((i) => i.type !== "deduction") ?? [];
  const deductions = payroll.items?.filter((i) => i.type === "deduction") ?? [];

  return (
    <>
      <PageHeader
        title={`Payroll · ${payroll.employee?.full_name ?? ""}`}
        description={payroll.period?.name}
        action={
          <div className="flex gap-2">
            <Link href="/payroll"><Button variant="outline"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
            {payroll.payslip ? (
              <Button onClick={() => downloadPayslip(payroll.payslip!.id, `${payroll.payslip!.payslip_number}.pdf`)}>
                <Download className="h-4 w-4" /> Download Payslip
              </Button>
            ) : (
              hasPermission("create payslip") && (
                <Button onClick={() => genSlip.mutate()} disabled={genSlip.isPending}>
                  <FileText className="h-4 w-4" /> {genSlip.isPending ? "Generating..." : "Generate Payslip"}
                </Button>
              )
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-4">
          <Table>
            <THead><TR><TH>Type</TH><TH>Label</TH><TH className="text-right">Amount</TH></TR></THead>
            <TBody>
              <TR><TD><Badge>earning</Badge></TD><TD>Basic Salary</TD><TD className="text-right">{formatCurrency(payroll.basic_salary)}</TD></TR>
              {allowances.map((i) => (
                <TR key={i.id}><TD><Badge>{i.type}</Badge></TD><TD>{i.label}</TD><TD className="text-right">{formatCurrency(i.amount)}</TD></TR>
              ))}
              {deductions.map((i) => (
                <TR key={i.id}><TD><Badge status="rejected">{i.type}</Badge></TD><TD>{i.label}</TD><TD className="text-right text-red-600">−{formatCurrency(i.amount)}</TD></TR>
              ))}
            </TBody>
          </Table>
        </Card>

        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Basic</span><span>{formatCurrency(payroll.basic_salary)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Allowances</span><span>{formatCurrency(payroll.total_allowances)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Deductions</span><span className="text-red-600">−{formatCurrency(payroll.total_deductions)}</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-2"><span className="text-gray-500">Gross</span><span>{formatCurrency(payroll.gross_pay)}</span></div>
            <div className="flex justify-between text-base font-bold"><span>Net Pay</span><span>{formatCurrency(payroll.net_pay)}</span></div>
            <div className="pt-2"><Badge status={payroll.status}>{payroll.status}</Badge></div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
