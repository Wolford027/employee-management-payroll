<?php

namespace Database\Factories;

use App\Models\AttendanceRecord;
use App\Models\Employee;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AttendanceRecord>
 */
class AttendanceRecordFactory extends Factory
{
    protected $model = AttendanceRecord::class;

    public function definition(): array
    {
        $status = fake()->randomElement(['present', 'present', 'present', 'late', 'absent']);

        $timeIn = null;
        $timeOut = null;
        $hours = 0;

        if ($status !== 'absent') {
            $inHour = $status === 'late' ? fake()->numberBetween(9, 10) : 8;
            $timeIn = sprintf('%02d:%02d:00', $inHour, fake()->numberBetween(0, 59));
            $timeOut = sprintf('%02d:%02d:00', fake()->numberBetween(17, 19), fake()->numberBetween(0, 59));
            $hours = fake()->randomFloat(2, 7, 9);
        }

        return [
            'employee_id' => Employee::factory(),
            'date' => fake()->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'time_in' => $timeIn,
            'time_out' => $timeOut,
            'hours_worked' => $hours,
            'status' => $status,
            'notes' => null,
        ];
    }

    public function forTenant(Tenant $tenant): static
    {
        return $this->state(['tenant_id' => $tenant->id]);
    }
}
