<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\PayrollPeriod;
use App\Models\Position;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function makeTenantWithHr(): array
{
    $tenant = Tenant::factory()->create();
    $hr = User::factory()->create(['tenant_id' => $tenant->id, 'is_owner' => true]);
    $hr->assignRole('hr');

    return [$tenant, $hr];
}

it('GET /departments does not return other tenants data', function () {
    [$tenantA, $hrA] = makeTenantWithHr();
    [$tenantB, $hrB] = makeTenantWithHr();

    Department::factory(3)->create(['tenant_id' => $tenantA->id]);
    Department::factory(2)->create(['tenant_id' => $tenantB->id]);

    $this->actingAs($hrA)
        ->getJson('/api/departments')
        ->assertOk()
        ->assertJsonPath('meta.total', 3);

    $this->actingAs($hrB)
        ->getJson('/api/departments')
        ->assertOk()
        ->assertJsonPath('meta.total', 2);
});

it('GET /employees scoped to own tenant only', function () {
    [$tenantA, $hrA] = makeTenantWithHr();
    [$tenantB, $hrB] = makeTenantWithHr();

    $deptA = Department::factory()->create(['tenant_id' => $tenantA->id]);
    $posA = Position::factory()->create(['tenant_id' => $tenantA->id, 'department_id' => $deptA->id]);
    Employee::factory(5)->create(['tenant_id' => $tenantA->id, 'department_id' => $deptA->id, 'position_id' => $posA->id]);

    $deptB = Department::factory()->create(['tenant_id' => $tenantB->id]);
    $posB = Position::factory()->create(['tenant_id' => $tenantB->id, 'department_id' => $deptB->id]);
    Employee::factory(3)->create(['tenant_id' => $tenantB->id, 'department_id' => $deptB->id, 'position_id' => $posB->id]);

    $this->actingAs($hrA)
        ->getJson('/api/employees')
        ->assertOk()
        ->assertJsonPath('meta.total', 5);
});

it('cannot GET a department that belongs to another tenant', function () {
    [$tenantA, $hrA] = makeTenantWithHr();
    [$tenantB, $hrB] = makeTenantWithHr();

    $deptB = Department::factory()->create(['tenant_id' => $tenantB->id]);

    $this->actingAs($hrA)
        ->getJson("/api/departments/{$deptB->id}")
        ->assertNotFound();
});

it('cannot DELETE a resource from another tenant', function () {
    [$tenantA, $hrA] = makeTenantWithHr();
    [$tenantB, $hrB] = makeTenantWithHr();

    $deptB = Department::factory()->create(['tenant_id' => $tenantB->id]);

    $this->actingAs($hrA)
        ->deleteJson("/api/departments/{$deptB->id}")
        ->assertNotFound();
});

it('payroll data is scoped per tenant', function () {
    [$tenantA, $hrA] = makeTenantWithHr();
    [$tenantB, $hrB] = makeTenantWithHr();

    PayrollPeriod::factory(2)->create(['tenant_id' => $tenantA->id]);
    PayrollPeriod::factory(4)->create(['tenant_id' => $tenantB->id]);

    $this->actingAs($hrA)
        ->getJson('/api/payroll-periods')
        ->assertOk()
        ->assertJsonPath('meta.total', 2);
});
