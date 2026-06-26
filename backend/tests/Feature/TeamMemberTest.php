<?php

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function makeOwner(): User
{
    $tenant = Tenant::factory()->create();
    $owner = User::factory()->create([
        'tenant_id' => $tenant->id,
        'is_owner' => true,
    ]);
    $owner->assignRole('hr');

    return $owner;
}

it('owner can list team members', function () {
    $owner = makeOwner();
    User::factory(3)->create(['tenant_id' => $owner->tenant_id]);

    $this->actingAs($owner)
        ->getJson('/api/team-members')
        ->assertOk()
        ->assertJsonPath('meta.total', 4); // 3 + owner
});

it('owner can invite a new team member', function () {
    $owner = makeOwner();

    $this->actingAs($owner)
        ->postJson('/api/team-members', [
            'name' => 'New HR',
            'email' => 'newhr@acme.com',
            'role' => 'hr',
        ])
        ->assertStatus(201)
        ->assertJsonPath('data.email', 'newhr@acme.com');

    $user = User::where('email', 'newhr@acme.com')->firstOrFail();
    expect($user->tenant_id)->toBe($owner->tenant_id)
        ->and($user->force_password_change)->toBeTrue()
        ->and($user->roles->pluck('name'))->toContain('hr');
});

it('owner cannot delete themselves', function () {
    $owner = makeOwner();

    $this->actingAs($owner)
        ->deleteJson("/api/team-members/{$owner->id}")
        ->assertStatus(422);
});

it('employee cannot access team members', function () {
    $tenant = Tenant::factory()->create();
    $employee = User::factory()->create(['tenant_id' => $tenant->id]);
    $employee->assignRole('employee');

    $this->actingAs($employee)
        ->getJson('/api/team-members')
        ->assertForbidden();
});

it('owner cannot see other tenants members', function () {
    $ownerA = makeOwner();
    $tenantB = Tenant::factory()->create();
    User::factory(2)->create(['tenant_id' => $tenantB->id]);

    $this->actingAs($ownerA)
        ->getJson('/api/team-members')
        ->assertOk()
        ->assertJsonPath('meta.total', 1); // only $ownerA
});

it('owner can delete a non-owner team member', function () {
    $owner = makeOwner();
    $member = User::factory()->create(['tenant_id' => $owner->tenant_id]);
    $member->assignRole('employee');

    $this->actingAs($owner)
        ->deleteJson("/api/team-members/{$member->id}")
        ->assertStatus(200)
        ->assertJsonPath('message', 'Team member removed.');

    expect(User::find($member->id))->toBeNull();
});
