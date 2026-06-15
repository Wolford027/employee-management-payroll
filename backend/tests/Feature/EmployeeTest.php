<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;

function employeePayload(array $overrides = []): array
{
    $dept = Department::factory()->create();
    $position = Position::factory()->create(['department_id' => $dept->id]);

    return array_merge([
        'employee_code' => 'EMP-T'.fake()->unique()->numberBetween(1000, 9999),
        'first_name' => 'Test',
        'last_name' => 'Person',
        'email' => fake()->unique()->safeEmail(),
        'salary' => 50000,
        'department_id' => $dept->id,
        'position_id' => $position->id,
    ], $overrides);
}

it('lists employees', function () {
    actingAsSuperAdmin();
    Employee::factory()->count(3)->create();

    $this->getJson('/api/employees')
        ->assertOk()
        ->assertJsonStructure(['data' => [['id', 'employee_code', 'full_name']], 'meta']);
});

it('searches employees by name', function () {
    actingAsSuperAdmin();
    Employee::factory()->create(['first_name' => 'Zaphod', 'last_name' => 'Beeblebrox']);
    Employee::factory()->count(2)->create();

    $res = $this->getJson('/api/employees?search=Zaphod')->assertOk();
    expect($res->json('meta.total'))->toBe(1);
});

it('creates an employee with a nested profile', function () {
    actingAsSuperAdmin();

    $payload = employeePayload(['profile' => ['gender' => 'female', 'city' => 'Metro']]);

    $this->postJson('/api/employees', $payload)
        ->assertCreated()
        ->assertJsonPath('data.profile.city', 'Metro');

    $this->assertDatabaseHas('employees', ['employee_code' => $payload['employee_code']]);
    $this->assertDatabaseHas('employee_profiles', ['city' => 'Metro']);
});

it('shows, updates and archives an employee', function () {
    actingAsSuperAdmin();
    $employee = Employee::factory()->create();

    $this->getJson("/api/employees/{$employee->id}")->assertOk();

    $this->putJson("/api/employees/{$employee->id}", ['first_name' => 'Renamed'])
        ->assertOk()
        ->assertJsonPath('data.first_name', 'Renamed');

    $this->patchJson("/api/employees/{$employee->id}/archive")
        ->assertOk()
        ->assertJsonPath('data.status', 'archived');
});

it('deletes an employee', function () {
    actingAsSuperAdmin();
    $employee = Employee::factory()->create();

    $this->deleteJson("/api/employees/{$employee->id}")->assertOk();
    $this->assertSoftDeleted('employees', ['id' => $employee->id]);
});

it('forbids employees from creating employees', function () {
    actingAsRole('employee');

    $this->postJson('/api/employees', employeePayload())->assertForbidden();
});
