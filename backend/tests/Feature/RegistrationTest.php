<?php

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

it('registration creates a tenant and an owner user', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'Jane Owner',
        'email' => 'jane@acme.com',
        'company_name' => 'Acme Corp',
        'password' => 'secret1234',
        'password_confirmation' => 'secret1234',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('user.email', 'jane@acme.com');

    $user = User::where('email', 'jane@acme.com')->firstOrFail();
    expect($user->is_owner)->toBeTrue()
        ->and($user->tenant)->not->toBeNull()
        ->and($user->tenant->name)->toBe('Acme Corp')
        ->and($user->roles->pluck('name'))->toContain('hr');

    expect(Tenant::where('name', 'Acme Corp')->exists())->toBeTrue();
});

it('registration fails without company_name', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'Jane Owner',
        'email' => 'jane@acme.com',
        'password' => 'secret1234',
        'password_confirmation' => 'secret1234',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['company_name']);
});
