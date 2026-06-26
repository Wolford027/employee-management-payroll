<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Position;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Position>
 */
class PositionFactory extends Factory
{
    protected $model = Position::class;

    public function definition(): array
    {
        $level = fake()->randomElement(['Junior', 'Mid', 'Senior']);
        $base = match ($level) {
            'Junior' => fake()->numberBetween(28000, 40000),
            'Mid' => fake()->numberBetween(45000, 70000),
            'Senior' => fake()->numberBetween(75000, 120000),
        };

        return [
            'title' => $level.' '.fake()->randomElement(['Developer', 'Analyst', 'Specialist', 'Officer', 'Associate']),
            'level' => $level,
            'department_id' => Department::factory(),
            'base_salary' => $base,
            'description' => fake()->sentence(),
            'status' => 'active',
        ];
    }

    public function forTenant(Tenant $tenant): static
    {
        return $this->state(['tenant_id' => $tenant->id]);
    }
}
