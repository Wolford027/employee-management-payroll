<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('slug', 'demo')->firstOrFail();

        $types = [
            ['name' => 'Sick', 'code' => 'SICK', 'default_days' => 10, 'description' => 'Sick leave'],
            ['name' => 'Vacation', 'code' => 'VAC', 'default_days' => 15, 'description' => 'Paid vacation leave'],
            ['name' => 'Emergency', 'code' => 'EMG', 'default_days' => 5, 'description' => 'Emergency leave'],
        ];

        foreach ($types as $data) {
            LeaveType::firstOrCreate(
                ['code' => $data['code'], 'tenant_id' => $tenant->id],
                $data + ['status' => 'active', 'tenant_id' => $tenant->id],
            );
        }
    }
}
