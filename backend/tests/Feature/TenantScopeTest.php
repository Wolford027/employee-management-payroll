<?php

use App\Models\Department;
use App\Models\Tenant;
use App\Models\User;

it('auto-assigns tenant_id on create when authenticated', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create(['tenant_id' => $tenant->id]);

    actingAs($user);

    $dept = Department::factory()->create(['name' => 'Scoped Dept']);

    expect($dept->tenant_id)->toBe($tenant->id);
});

it('scopes queries to the authenticated user tenant', function () {
    $tenantA = Tenant::factory()->create();
    $tenantB = Tenant::factory()->create();

    $userA = User::factory()->create(['tenant_id' => $tenantA->id]);
    $userB = User::factory()->create(['tenant_id' => $tenantB->id]);

    Department::factory()->create(['tenant_id' => $tenantA->id, 'name' => 'Dept A']);
    Department::factory()->create(['tenant_id' => $tenantB->id, 'name' => 'Dept B']);

    actingAs($userA);
    $results = Department::all();

    expect($results)->toHaveCount(1)
        ->and($results->first()->name)->toBe('Dept A');
});

it('super-admin with null tenant_id sees all records', function () {
    $tenant = Tenant::factory()->create();

    Department::factory()->create(['tenant_id' => $tenant->id, 'name' => 'Dept X']);
    Department::factory()->create(['tenant_id' => $tenant->id, 'name' => 'Dept Y']);

    $superAdmin = User::factory()->create(['tenant_id' => null]);

    actingAs($superAdmin);

    expect(Department::count())->toBe(2);
});
