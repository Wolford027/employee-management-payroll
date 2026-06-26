<?php

namespace Database\Factories;

use App\Models\Payroll;
use App\Models\PayrollItem;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PayrollItem>
 */
class PayrollItemFactory extends Factory
{
    protected $model = PayrollItem::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['allowance', 'deduction']);

        return [
            'payroll_id' => Payroll::factory(),
            'type' => $type,
            'label' => $type === 'allowance'
                ? fake()->randomElement(['Transport Allowance', 'Meal Allowance', 'Housing Allowance'])
                : fake()->randomElement(['Tax', 'Insurance', 'Pension']),
            'amount' => fake()->numberBetween(50, 600),
        ];
    }

    public function forTenant(Tenant $tenant): static
    {
        return $this->state(['tenant_id' => $tenant->id]);
    }
}
