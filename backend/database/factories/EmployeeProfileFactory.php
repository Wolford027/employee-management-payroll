<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\EmployeeProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmployeeProfile>
 */
class EmployeeProfileFactory extends Factory
{
    protected $model = EmployeeProfile::class;

    public function definition(): array
    {
        return [
            'employee_id' => Employee::factory(),
            'birth_date' => fake()->dateTimeBetween('-55 years', '-22 years')->format('Y-m-d'),
            'gender' => fake()->randomElement(['male', 'female']),
            'marital_status' => fake()->randomElement(['single', 'married']),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'country' => fake()->country(),
            'emergency_contact_name' => fake()->name(),
            'emergency_contact_phone' => fake()->numerify('+1-###-###-####'),
            'bank_name' => fake()->randomElement(['First National', 'Metro Bank', 'Union Savings']),
            'bank_account_number' => fake()->numerify('##########'),
            'tax_id' => fake()->numerify('TIN-#########'),
        ];
    }
}
