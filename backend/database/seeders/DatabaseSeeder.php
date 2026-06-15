<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database in dependency order.
     */
    public function run(): void
    {
        $this->call([
            // Foundation
            RolePermissionSeeder::class,
            DepartmentSeeder::class,
            PositionSeeder::class,
            LeaveTypeSeeder::class,
            CompensationSeeder::class,

            // People (users + employees + profiles)
            UserEmployeeSeeder::class,

            // Operational demo data
            AttendanceSeeder::class,
            LeaveRequestSeeder::class,
            PayrollSeeder::class,
        ]);

        $this->command->newLine();
        $this->command->info('Demo logins (password: "password"):');
        $this->command->line('  Super Admin : admin@example.com');
        $this->command->line('  HR          : hr1@example.com / hr2@example.com');
        $this->command->line('  Manager     : manager1@example.com … manager3@example.com');
        $this->command->line('  Employee    : employee@example.com');
    }
}
