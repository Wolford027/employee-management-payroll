<?php

namespace Database\Factories;

use App\Models\Allowance;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Allowance>
 */
class AllowanceFactory extends Factory
{
    protected $model = Allowance::class;

    public function definition(): array
    {
        $name = fake()->unique()->randomElement(['Transport', 'Meal', 'Housing', 'Communication', 'Medical']);

        return [
            'name' => $name.' Allowance',
            'code' => 'ALW-'.Str::upper(Str::substr($name, 0, 3)),
            'calculation_type' => 'fixed',
            'amount' => fake()->numberBetween(50, 500),
            'is_taxable' => fake()->boolean(30),
            'status' => 'active',
        ];
    }

    public function forTenant(Tenant $tenant): static
    {
        return $this->state(['tenant_id' => $tenant->id]);
    }
}
