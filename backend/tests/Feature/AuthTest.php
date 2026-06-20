<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

it('registers a new user and returns a token', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $response->assertCreated()
        ->assertJsonStructure(['user' => ['id', 'email', 'roles'], 'token']);

    expect($response->json('user.roles'))->toContain('employee');
    $this->assertDatabaseHas('users', ['email' => 'jane@example.com']);
});

it('logs in with valid credentials', function () {
    User::factory()->create(['email' => 'bob@example.com', 'password' => Hash::make('secret123')]);

    $this->postJson('/api/auth/login', ['email' => 'bob@example.com', 'password' => 'secret123'])
        ->assertOk()
        ->assertJsonStructure(['user' => ['id', 'email'], 'token']);
});

it('rejects invalid credentials with 422', function () {
    User::factory()->create(['email' => 'bob@example.com', 'password' => Hash::make('secret123')]);

    $this->postJson('/api/auth/login', ['email' => 'bob@example.com', 'password' => 'wrong'])
        ->assertStatus(422);
});

it('returns the authenticated user via /me', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/auth/me')
        ->assertOk()
        ->assertJsonPath('data.email', $user->email);
});

it('blocks /me without a token', function () {
    $this->getJson('/api/auth/me')->assertUnauthorized();
});

it('logs out and the response is successful', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/auth/logout')
        ->assertOk()
        ->assertJsonPath('message', 'Logged out successfully.');
});

it('lets a user with a forced password change set a new password without the current one', function () {
    $user = User::factory()->create(['force_password_change' => true]);

    $this->actingAs($user, 'sanctum')
        ->putJson('/api/auth/profile', [
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])
        ->assertOk();

    expect($user->refresh()->force_password_change)->toBeFalse();
    expect(Hash::check('NewPassword123!', $user->password))->toBeTrue();
});

it('requires the current password when a non-forced user changes their password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('OldPassword123!'),
        'force_password_change' => false,
    ]);

    $this->actingAs($user, 'sanctum')
        ->putJson('/api/auth/profile', [
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('current_password');

    $this->actingAs($user, 'sanctum')
        ->putJson('/api/auth/profile', [
            'current_password' => 'OldPassword123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])
        ->assertOk();
});
