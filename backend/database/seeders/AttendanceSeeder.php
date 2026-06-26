<?php

namespace Database\Seeders;

use App\Models\AttendanceRecord;
use App\Models\Employee;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('slug', 'demo')->firstOrFail();
        $employees = Employee::where('tenant_id', $tenant->id)->get();

        // Last 14 calendar days, weekdays only.
        $days = collect(range(0, 13))
            ->map(fn ($i) => Carbon::today()->subDays($i))
            ->filter(fn (Carbon $d) => ! $d->isWeekend())
            ->values();

        $rows = [];
        $now = now();

        foreach ($employees as $employee) {
            foreach ($days as $day) {
                $status = fake()->randomElement(['present', 'present', 'present', 'present', 'late', 'absent']);

                $timeIn = null;
                $timeOut = null;
                $hours = 0;

                if ($status !== 'absent') {
                    $inHour = $status === 'late' ? 9 : 8;
                    $timeIn = sprintf('%02d:%02d:00', $inHour, fake()->numberBetween(0, 59));
                    $timeOut = sprintf('%02d:%02d:00', fake()->numberBetween(17, 18), fake()->numberBetween(0, 59));
                    $hours = fake()->randomFloat(2, 7.5, 9);
                }

                $rows[] = [
                    'tenant_id' => $tenant->id,
                    'employee_id' => $employee->id,
                    'date' => $day->format('Y-m-d'),
                    'time_in' => $timeIn,
                    'time_out' => $timeOut,
                    'hours_worked' => $hours,
                    'status' => $status,
                    'notes' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // Bulk insert in chunks (idempotent-ish: table is empty on fresh seed).
        foreach (array_chunk($rows, 500) as $chunk) {
            AttendanceRecord::insert($chunk);
        }
    }
}
