<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveType;
use App\Models\Payroll;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Spatie\Permission\Models\Role;

it('seeds a complete, usable dataset', function () {
    $this->seed(DatabaseSeeder::class);

    // Roles
    expect(Role::count())->toBe(4);

    // Users by role match the spec.
    expect(User::role('super-admin')->count())->toBe(1);
    expect(User::role('hr')->count())->toBe(3); // owner + hr1 + hr2
    expect(User::role('manager')->count())->toBe(3);
    expect(User::role('employee')->count())->toBe(30);

    // Reference data.
    expect(Department::count())->toBe(5);
    expect(LeaveType::count())->toBe(3);

    // Demo logins exist.
    $this->assertDatabaseHas('users', ['email' => 'admin@example.com']);
    $this->assertDatabaseHas('users', ['email' => 'employee@example.com']);

    // Operational data was generated.
    expect(Employee::count())->toBe(36);
    expect(Payroll::count())->toBeGreaterThan(0);
});

it('lets the seeded admin log in', function () {
    $this->seed(DatabaseSeeder::class);

    $this->postJson('/api/auth/login', ['email' => 'admin@example.com', 'password' => '12345678'])
        ->assertOk()
        ->assertJsonPath('user.roles.0', 'super-admin');
});
