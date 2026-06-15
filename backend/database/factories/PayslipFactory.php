<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\Payslip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payslip>
 */
class PayslipFactory extends Factory
{
    protected $model = Payslip::class;

    public function definition(): array
    {
        return [
            'payroll_id' => Payroll::factory(),
            'employee_id' => Employee::factory(),
            'payslip_number' => 'PS-'.fake()->unique()->numerify('########'),
            'file_path' => null,
            'generated_at' => now(),
        ];
    }
}
