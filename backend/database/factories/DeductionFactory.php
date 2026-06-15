<?php

namespace Database\Factories;

use App\Models\Deduction;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Deduction>
 */
class DeductionFactory extends Factory
{
    protected $model = Deduction::class;

    public function definition(): array
    {
        $name = fake()->unique()->randomElement(['Tax', 'Insurance', 'Pension', 'Loan', 'Union Due']);

        return [
            'name' => $name,
            'code' => 'DED-'.Str::upper(Str::substr($name, 0, 3)),
            'calculation_type' => 'fixed',
            'amount' => fake()->numberBetween(20, 400),
            'status' => 'active',
        ];
    }
}
