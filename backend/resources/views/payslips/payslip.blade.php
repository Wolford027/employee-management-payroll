<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Payslip {{ $payslip->payslip_number }}</title>
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { font-size: 12px; color: #1f2937; margin: 0; padding: 24px; }
        .header { border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 16px; }
        .company { font-size: 20px; font-weight: bold; }
        .muted { color: #6b7280; }
        .title { font-size: 16px; font-weight: bold; margin: 16px 0 4px; }
        table { width: 100%; border-collapse: collapse; }
        .meta td { padding: 3px 0; vertical-align: top; }
        .meta .label { color: #6b7280; width: 130px; }
        .lines { margin-top: 8px; }
        .lines th { text-align: left; background: #f3f4f6; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
        .lines td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; }
        .right { text-align: right; }
        .totals td { padding: 6px 8px; }
        .totals .grand { font-size: 14px; font-weight: bold; border-top: 2px solid #111827; }
        .cols { width: 100%; }
        .cols td { width: 50%; vertical-align: top; padding-right: 16px; }
        .net-box { margin-top: 18px; border-top: 2px solid #111827; padding: 12px 16px; }
        .net-box .amount { font-size: 22px; font-weight: bold; }
        .footer { margin-top: 28px; font-size: 10px; color: #9ca3af; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <table>
            <tr>
                <td>
                    <div class="company">{{ $company['name'] }}</div>
                    <div class="muted">{{ $company['address'] }}</div>
                    <div class="muted">{{ $company['email'] }}</div>
                </td>
                <td class="right">
                    <div class="title">PAYSLIP</div>
                    <div class="muted">#{{ $payslip->payslip_number }}</div>
                    <div class="muted">Generated {{ optional($payslip->generated_at)->format('M d, Y') }}</div>
                </td>
            </tr>
        </table>
    </div>

    <table class="cols">
        <tr>
            <td>
                <div class="title">Employee</div>
                <table class="meta">
                    <tr><td class="label">Name</td><td>{{ $employee->full_name }}</td></tr>
                    <tr><td class="label">Employee ID</td><td>{{ $employee->employee_code }}</td></tr>
                    <tr><td class="label">Department</td><td>{{ optional($employee->department)->name ?? '—' }}</td></tr>
                    <tr><td class="label">Position</td><td>{{ optional($employee->position)->title ?? '—' }}</td></tr>
                </table>
            </td>
            <td>
                <div class="title">Pay Period</div>
                <table class="meta">
                    <tr><td class="label">Period</td><td>{{ optional($period)->name ?? '—' }}</td></tr>
                    <tr><td class="label">Cycle</td><td>{{ ucfirst(str_replace('_', ' ', optional($period)->cycle ?? '')) }}</td></tr>
                    <tr><td class="label">From</td><td>{{ optional(optional($period)->start_date)->format('M d, Y') }}</td></tr>
                    <tr><td class="label">To</td><td>{{ optional(optional($period)->end_date)->format('M d, Y') }}</td></tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="cols" style="margin-top:12px;">
        <tr>
            <td>
                <table class="lines">
                    <tr><th>Earnings</th><th class="right">Amount</th></tr>
                    <tr><td>Basic Salary</td><td class="right">{{ number_format($payroll->basic_salary, 2) }}</td></tr>
                    @foreach($allowances as $item)
                        <tr><td>{{ $item->label }}</td><td class="right">{{ number_format($item->amount, 2) }}</td></tr>
                    @endforeach
                    <tr class="totals"><td><strong>Gross Pay</strong></td><td class="right"><strong>{{ number_format($payroll->gross_pay, 2) }}</strong></td></tr>
                </table>
            </td>
            <td>
                <table class="lines">
                    <tr><th>Deductions</th><th class="right">Amount</th></tr>
                    @forelse($deductions as $item)
                        <tr><td>{{ $item->label }}</td><td class="right">{{ number_format($item->amount, 2) }}</td></tr>
                    @empty
                        <tr><td class="muted">No deductions</td><td class="right">0.00</td></tr>
                    @endforelse
                    <tr class="totals"><td><strong>Total Deductions</strong></td><td class="right"><strong>{{ number_format($payroll->total_deductions, 2) }}</strong></td></tr>
                </table>
            </td>
        </tr>
    </table>

    <div class="net-box">
        <table>
            <tr>
                <td>NET PAY</td>
                <td class="right amount">{{ $company['currency'] }} {{ number_format($payroll->net_pay, 2) }}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        This is a system-generated payslip and does not require a signature. {{ $company['name'] }}.
    </div>
</body>
</html>
