<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        $first = fake()->firstName();
        $last = fake()->lastName();

        return [
            'employee_code' => 'EMP-'.fake()->unique()->numerify('#####'),
            'user_id' => null,
            'department_id' => Department::factory(),
            'position_id' => Position::factory(),
            'first_name' => $first,
            'last_name' => $last,
            'email' => Str::lower($first.'.'.$last.fake()->unique()->numberBetween(1, 9999).'@example.com'),
            'phone' => fake()->numerify('+1-###-###-####'),
            'salary' => fake()->numberBetween(28000, 120000),
            'date_hired' => fake()->dateTimeBetween('-6 years', '-1 month')->format('Y-m-d'),
            'employment_type' => fake()->randomElement(['full_time', 'full_time', 'part_time', 'contract']),
            'status' => 'active',
        ];
    }

    public function archived(): static
    {
        return $this->state(fn () => ['status' => 'archived']);
    }

    public function forTenant(Tenant $tenant): static
    {
        return $this->state(['tenant_id' => $tenant->id]);
    }
}
