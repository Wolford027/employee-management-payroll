<?php

namespace Database\Seeders;

use App\Models\Allowance;
use App\Models\Deduction;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class CompensationSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('slug', 'demo')->firstOrFail();

        $allowances = [
            ['name' => 'Transport Allowance', 'code' => 'ALW-TRN', 'amount' => 150, 'is_taxable' => false],
            ['name' => 'Meal Allowance', 'code' => 'ALW-MEA', 'amount' => 120, 'is_taxable' => false],
            ['name' => 'Housing Allowance', 'code' => 'ALW-HOU', 'amount' => 400, 'is_taxable' => true],
        ];

        foreach ($allowances as $data) {
            Allowance::firstOrCreate(
                ['code' => $data['code'], 'tenant_id' => $tenant->id],
                $data + ['calculation_type' => 'fixed', 'status' => 'active', 'tenant_id' => $tenant->id]
            );
        }

        $deductions = [
            ['name' => 'Income Tax', 'code' => 'DED-TAX', 'amount' => 300],
            ['name' => 'Health Insurance', 'code' => 'DED-INS', 'amount' => 150],
            ['name' => 'Pension', 'code' => 'DED-PEN', 'amount' => 200],
        ];

        foreach ($deductions as $data) {
            Deduction::firstOrCreate(
                ['code' => $data['code'], 'tenant_id' => $tenant->id],
                $data + ['calculation_type' => 'fixed', 'status' => 'active', 'tenant_id' => $tenant->id]
            );
        }
    }
}
