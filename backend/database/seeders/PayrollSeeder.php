<?php

namespace Database\Seeders;

use App\Models\Allowance;
use App\Models\Deduction;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\PayrollPeriod;
use App\Models\Payslip;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PayrollSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('slug', 'demo')->firstOrFail();
        $allowances = Allowance::where('tenant_id', $tenant->id)->where('status', 'active')->get();
        $deductions = Deduction::where('tenant_id', $tenant->id)->where('status', 'active')->get();
        $employees = Employee::where('tenant_id', $tenant->id)->where('status', 'active')->get();

        // Three most recent completed monthly periods.
        $periods = collect(range(3, 1))->map(function (int $monthsAgo) use ($tenant) {
            $start = Carbon::today()->subMonths($monthsAgo)->startOfMonth();
            $end = (clone $start)->endOfMonth();

            return PayrollPeriod::firstOrCreate(
                ['name' => $start->format('F Y').' Payroll', 'tenant_id' => $tenant->id],
                [
                    'tenant_id' => $tenant->id,
                    'cycle' => 'monthly',
                    'start_date' => $start->format('Y-m-d'),
                    'end_date' => $end->format('Y-m-d'),
                    'pay_date' => (clone $end)->addDays(3)->format('Y-m-d'),
                    'status' => 'completed',
                ]
            );
        });

        $payslipCounter = 0;

        foreach ($periods as $period) {
            foreach ($employees as $employee) {
                $basic = round(((float) $employee->salary) / 12, 2);

                $totalAllowances = 0.0;
                $totalDeductions = 0.0;
                $items = [];

                foreach ($allowances as $allowance) {
                    $totalAllowances += (float) $allowance->amount;
                    $items[] = ['type' => 'allowance', 'label' => $allowance->name, 'amount' => (float) $allowance->amount];
                }

                foreach ($deductions as $deduction) {
                    $totalDeductions += (float) $deduction->amount;
                    $items[] = ['type' => 'deduction', 'label' => $deduction->name, 'amount' => (float) $deduction->amount];
                }

                $gross = $basic + $totalAllowances;
                $net = $gross - $totalDeductions;

                $payroll = Payroll::firstOrCreate(
                    ['payroll_period_id' => $period->id, 'employee_id' => $employee->id],
                    [
                        'tenant_id' => $tenant->id,
                        'basic_salary' => $basic,
                        'total_allowances' => $totalAllowances,
                        'total_deductions' => $totalDeductions,
                        'gross_pay' => $gross,
                        'net_pay' => $net,
                        'status' => 'paid',
                    ]
                );

                if ($payroll->items()->count() === 0) {
                    foreach ($items as $item) {
                        $payroll->items()->create($item + ['tenant_id' => $tenant->id]);
                    }
                }

                $payslipCounter++;
                Payslip::firstOrCreate(
                    ['payroll_id' => $payroll->id],
                    [
                        'tenant_id' => $tenant->id,
                        'employee_id' => $employee->id,
                        'payslip_number' => 'PS-'.$period->start_date->format('Ym').'-'.str_pad((string) $payslipCounter, 5, '0', STR_PAD_LEFT),
                        'file_path' => null,
                        'generated_at' => $period->pay_date,
                    ]
                );
            }
        }
    }
}
