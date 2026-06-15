<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Department>
 */
class DepartmentFactory extends Factory
{
    protected $model = Department::class;

    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'name' => $name,
            'code' => Str::upper(Str::substr(preg_replace('/[^A-Za-z]/', '', $name), 0, 3)).fake()->unique()->numberBetween(100, 9999),
            'description' => fake()->sentence(),
            'status' => 'active',
        ];
    }
}
