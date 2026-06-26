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
            // Must be first — all other seeders resolve the demo tenant.
            TenantSeeder::class,
            RolePermissionSeeder::class,
            DepartmentSeeder::class,
            PositionSeeder::class,
            LeaveTypeSeeder::class,
            CompensationSeeder::class,
            UserEmployeeSeeder::class,
            AttendanceSeeder::class,
            LeaveRequestSeeder::class,
            PayrollSeeder::class,
        ]);

        $this->command->newLine();
        $this->command->info('Demo tenant: Demo Company (slug: demo)');
        $this->command->info('Demo logins (password: "password"):');
        $this->command->line('  Super Admin : admin@example.com  (no tenant — system account)');
        $this->command->line('  Owner       : owner@example.com');
        $this->command->line('  HR          : hr1@example.com / hr2@example.com');
        $this->command->line('  Manager     : manager1@example.com … manager3@example.com');
        $this->command->line('  Employee    : employee@example.com');
    }
}
