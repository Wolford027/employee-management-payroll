<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\PayrollPeriod;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payroll>
 */
class PayrollFactory extends Factory
{
    protected $model = Payroll::class;

    public function definition(): array
    {
        $basic = fake()->numberBetween(2500, 10000);
        $allowances = fake()->numberBetween(100, 1200);
        $deductions = fake()->numberBetween(100, 1500);
        $gross = $basic + $allowances;
        $net = $gross - $deductions;

        return [
            'payroll_period_id' => PayrollPeriod::factory(),
            'employee_id' => Employee::factory(),
            'basic_salary' => $basic,
            'total_allowances' => $allowances,
            'total_deductions' => $deductions,
            'gross_pay' => $gross,
            'net_pay' => $net,
            'status' => 'finalized',
            'remarks' => null,
        ];
    }
}
