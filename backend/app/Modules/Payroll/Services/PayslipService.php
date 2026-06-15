<?php

namespace App\Modules\Payroll\Services;

use App\Models\Payroll;
use App\Models\Payslip;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as PdfInstance;
use Illuminate\Support\Facades\Storage;

class PayslipService
{
    /** Ensure a payslip record exists for a payroll, then (re)render and store its PDF. */
    public function generate(Payroll $payroll): Payslip
    {
        $payroll->loadMissing('employee.department', 'employee.position', 'period', 'items');

        $payslip = Payslip::firstOrCreate(
            ['payroll_id' => $payroll->id],
            [
                'employee_id' => $payroll->employee_id,
                'payslip_number' => $this->nextNumber($payroll),
                'generated_at' => now(),
            ]
        );

        $pdf = $this->render($payslip);
        $path = "payslips/{$payslip->payslip_number}.pdf";
        Storage::disk('public')->put($path, $pdf->output());

        $payslip->update(['file_path' => $path, 'generated_at' => now()]);

        return $payslip->fresh();
    }

    /** Build the dompdf instance for a payslip (used by download/preview). */
    public function render(Payslip $payslip): PdfInstance
    {
        $payroll = $payslip->payroll()->with('employee.department', 'employee.position', 'period', 'items')->firstOrFail();

        return Pdf::loadView('payslips.payslip', $this->viewData($payslip, $payroll))
            ->setPaper('a4');
    }

    public function fileName(Payslip $payslip): string
    {
        return "{$payslip->payslip_number}.pdf";
    }

    /** @return array<string,mixed> */
    private function viewData(Payslip $payslip, Payroll $payroll): array
    {
        return [
            'payslip' => $payslip,
            'payroll' => $payroll,
            'employee' => $payroll->employee,
            'period' => $payroll->period,
            'allowances' => $payroll->items->whereIn('type', ['allowance', 'earning'])->values(),
            'deductions' => $payroll->items->where('type', 'deduction')->values(),
            'company' => [
                'name' => env('COMPANY_NAME', config('app.name')),
                'address' => env('COMPANY_ADDRESS', '123 Business Ave, Suite 100'),
                'email' => env('COMPANY_EMAIL', 'payroll@example.com'),
                'currency' => env('COMPANY_CURRENCY', 'USD'),
            ],
        ];
    }

    private function nextNumber(Payroll $payroll): string
    {
        $periodCode = optional($payroll->period?->start_date)->format('Ym') ?? now()->format('Ym');

        return 'PS-'.$periodCode.'-'.str_pad((string) $payroll->id, 5, '0', STR_PAD_LEFT);
    }
}
