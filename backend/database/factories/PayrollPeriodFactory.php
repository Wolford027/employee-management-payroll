<?php

namespace Database\Factories;

use App\Models\PayrollPeriod;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PayrollPeriod>
 */
class PayrollPeriodFactory extends Factory
{
    protected $model = PayrollPeriod::class;

    public function definition(): array
    {
        $start = Carbon::instance(fake()->dateTimeBetween('-4 months', 'now'))->startOfMonth();
        $end = (clone $start)->endOfMonth();

        return [
            'name' => $start->format('F Y').' Payroll',
            'cycle' => 'monthly',
            'start_date' => $start->format('Y-m-d'),
            'end_date' => $end->format('Y-m-d'),
            'pay_date' => (clone $end)->addDays(3)->format('Y-m-d'),
            'status' => 'completed',
        ];
    }
}
