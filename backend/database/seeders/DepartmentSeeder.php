<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'IT', 'code' => 'IT', 'description' => 'Information Technology & Engineering'],
            ['name' => 'HR', 'code' => 'HR', 'description' => 'Human Resources'],
            ['name' => 'Accounting', 'code' => 'ACC', 'description' => 'Finance & Accounting'],
            ['name' => 'Sales', 'code' => 'SLS', 'description' => 'Sales & Business Development'],
            ['name' => 'Marketing', 'code' => 'MKT', 'description' => 'Marketing & Communications'],
        ];

        foreach ($departments as $data) {
            Department::firstOrCreate(['code' => $data['code']], $data + ['status' => 'active']);
        }
    }
}
