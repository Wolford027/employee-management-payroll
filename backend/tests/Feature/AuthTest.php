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
