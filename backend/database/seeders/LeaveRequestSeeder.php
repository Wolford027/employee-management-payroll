<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LeaveRequestSeeder extends Seeder
{
    public function run(): void
    {
        $leaveTypeIds = LeaveType::pluck('id')->all();
        $employees = Employee::inRandomOrder()->take(20)->get();

        foreach ($employees as $employee) {
            $count = fake()->numberBetween(1, 2);

            for ($i = 0; $i < $count; $i++) {
                $start = Carbon::instance(fake()->dateTimeBetween('-2 months', '+1 month'));
                $days = fake()->numberBetween(1, 5);
                $end = (clone $start)->addDays($days - 1);

                LeaveRequest::create([
                    'employee_id' => $employee->id,
                    'leave_type_id' => fake()->randomElement($leaveTypeIds),
                    'start_date' => $start->format('Y-m-d'),
                    'end_date' => $end->format('Y-m-d'),
                    'days' => $days,
                    'reason' => fake()->sentence(),
                    'status' => fake()->randomElement(['pending', 'approved', 'approved', 'rejected']),
                ]);
            }
        }
    }
}
