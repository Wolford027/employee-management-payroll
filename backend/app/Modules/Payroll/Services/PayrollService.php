<?php

namespace App\Modules\Payroll\Services;

use App\Models\Allowance;
use App\Models\Deduction;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\PayrollPeriod;
use App\Repositories\PayrollRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PayrollService
{
    /** Number of pay periods per year, used to prorate annual salary. */
    private const CYCLE_DIVISORS = [
        'weekly' => 52,
        'biweekly' => 26,
        'semi_monthly' => 24,
        'monthly' => 12,
    ];

    public function __construct(private readonly PayrollRepository $repository) {}

    /** @param  array<string,mixed>  $params */
    public function list(array $params): LengthAwarePaginator
    {
        return $this->repository->paginate($params);
    }

    /**
     * Create a payroll manually with explicit line items.
     *
     * @param  array<string,mixed>  $data
     */
    public function create(array $data): Payroll
    {
        return DB::transaction(function () use ($data) {
            $items = $data['items'] ?? [];
            unset($data['items']);

            $payroll = Payroll::create($this->withComputedTotals($data, $items));

            foreach ($items as $item) {
                $payroll->items()->create($item);
            }

            return $payroll->load('employee', 'period', 'items');
        });
    }

    /** @param  array<string,mixed>  $data */
    public function update(Payroll $payroll, array $data): Payroll
    {
        return DB::transaction(function () use ($payroll, $data) {
            $items = $data['items'] ?? null;
            unset($data['items']);

            if ($items !== null) {
                $payroll->items()->delete();
                foreach ($items as $item) {
                    $payroll->items()->create($item);
                }
            }

            $base = array_merge($payroll->toArray(), $data);
            $payroll->update($this->withComputedTotals($base, $items ?? $payroll->items->toArray()));

            return $payroll->fresh(['employee', 'period', 'items']);
        });
    }

    public function delete(Payroll $payroll): void
    {
        $payroll->delete();
    }

    /**
     * Generate payrolls for a period using simple manual computation.
     * Scope: all | employee | department.
     *
     * @param  array<string,mixed>  $data
     * @return array{generated:int, skipped:int}
     */
    public function generate(array $data): array
    {
        $period = PayrollPeriod::findOrFail($data['payroll_period_id']);
        $employees = $this->resolveEmployees($data);

        $allowances = Allowance::where('status', 'active')->get();
        $deductions = Deduction::where('status', 'active')->get();
        $divisor = self::CYCLE_DIVISORS[$period->cycle] ?? 12;

        $generated = 0;
        $skipped = 0;

        DB::transaction(function () use ($period, $employees, $allowances, $deductions, $divisor, &$generated, &$skipped) {
            foreach ($employees as $employee) {
                $exists = Payroll::where('payroll_period_id', $period->id)
                    ->where('employee_id', $employee->id)
                    ->exists();

                if ($exists) {
                    $skipped++;

                    continue;
                }

                $basic = round(((float) $employee->salary) / $divisor, 2);
                $totalAllowances = (float) $allowances->sum('amount');
                $totalDeductions = (float) $deductions->sum('amount');
                $gross = $basic + $totalAllowances;
                $net = $gross - $totalDeductions;

                $payroll = Payroll::create([
                    'payroll_period_id' => $period->id,
                    'employee_id' => $employee->id,
                    'basic_salary' => $basic,
                    'total_allowances' => $totalAllowances,
                    'total_deductions' => $totalDeductions,
                    'gross_pay' => $gross,
                    'net_pay' => $net,
                    'status' => 'draft',
                ]);

                foreach ($allowances as $allowance) {
                    $payroll->items()->create([
                        'type' => 'allowance',
                        'label' => $allowance->name,
                        'amount' => $allowance->amount,
                    ]);
                }

                foreach ($deductions as $deduction) {
                    $payroll->items()->create([
                        'type' => 'deduction',
                        'label' => $deduction->name,
                        'amount' => $deduction->amount,
                    ]);
                }

                $generated++;
            }
        });

        return ['generated' => $generated, 'skipped' => $skipped];
    }

    /**
     * Recompute gross/net from basic salary and line items.
     *
     * @param  array<string,mixed>  $data
     * @param  array<int,array<string,mixed>>  $items
     * @return array<string,mixed>
     */
    private function withComputedTotals(array $data, array $items): array
    {
        $basic = (float) ($data['basic_salary'] ?? 0);

        $totalAllowances = collect($items)
            ->where('type', 'allowance')
            ->sum(fn ($i) => (float) $i['amount']);

        $totalDeductions = collect($items)
            ->where('type', 'deduction')
            ->sum(fn ($i) => (float) $i['amount']);

        $earnings = collect($items)
            ->where('type', 'earning')
            ->sum(fn ($i) => (float) $i['amount']);

        $gross = $basic + $totalAllowances + $earnings;

        $data['total_allowances'] = $totalAllowances + $earnings;
        $data['total_deductions'] = $totalDeductions;
        $data['gross_pay'] = $gross;
        $data['net_pay'] = $gross - $totalDeductions;

        return $data;
    }

    /**
     * @param  array<string,mixed>  $data
     * @return Collection<int,Employee>
     */
    private function resolveEmployees(array $data): Collection
    {
        $query = Employee::where('status', 'active');

        return match ($data['scope']) {
            'employee' => $query->where('id', $data['employee_id'])->get(),
            'department' => $query->where('department_id', $data['department_id'])->get(),
            default => $query->get(),
        };
    }
}
