<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    /** Base salary per level. */
    private const LEVELS = [
        'Junior' => 32000,
        'Mid' => 55000,
        'Senior' => 85000,
    ];

    /** Representative job title per department. */
    private const TITLES = [
        'IT' => 'Software Engineer',
        'HR' => 'HR Officer',
        'Accounting' => 'Accountant',
        'Sales' => 'Sales Executive',
        'Marketing' => 'Marketing Specialist',
    ];

    public function run(): void
    {
        foreach (Department::all() as $department) {
            $title = self::TITLES[$department->code] ?? 'Associate';

            foreach (self::LEVELS as $level => $baseSalary) {
                Position::firstOrCreate(
                    [
                        'department_id' => $department->id,
                        'level' => $level,
                        'title' => "{$level} {$title}",
                    ],
                    [
                        'base_salary' => $baseSalary,
                        'description' => "{$level} level role in {$department->name}",
                        'status' => 'active',
                    ]
                );
            }
        }
    }
}
