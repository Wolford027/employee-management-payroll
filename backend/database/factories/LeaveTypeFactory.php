<?php

namespace Database\Factories;

use App\Models\LeaveType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<LeaveType>
 */
class LeaveTypeFactory extends Factory
{
    protected $model = LeaveType::class;

    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'name' => Str::title($name),
            'code' => Str::upper(Str::substr($name, 0, 4)).fake()->unique()->numberBetween(1, 99),
            'default_days' => fake()->numberBetween(5, 20),
            'description' => fake()->sentence(),
            'status' => 'active',
        ];
    }
}
