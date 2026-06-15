<?php

use App\Models\Department;

it('lists departments with pagination meta', function () {
    actingAsSuperAdmin();
    Department::factory()->count(3)->create();

    $this->getJson('/api/departments')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta' => ['current_page', 'total', 'last_page']]);
});

it('creates a department', function () {
    actingAsSuperAdmin();

    $this->postJson('/api/departments', [
        'name' => 'Research',
        'code' => 'RND',
        'description' => 'R&D',
    ])->assertCreated()->assertJsonPath('data.code', 'RND');

    $this->assertDatabaseHas('departments', ['code' => 'RND']);
});

it('validates required fields on create', function () {
    actingAsSuperAdmin();

    $this->postJson('/api/departments', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'code']);
});

it('updates a department', function () {
    actingAsSuperAdmin();
    $dept = Department::factory()->create(['name' => 'Old']);

    $this->putJson("/api/departments/{$dept->id}", ['name' => 'New Name'])
        ->assertOk()
        ->assertJsonPath('data.name', 'New Name');
});

it('deletes a department', function () {
    actingAsSuperAdmin();
    $dept = Department::factory()->create();

    $this->deleteJson("/api/departments/{$dept->id}")->assertOk();
    $this->assertSoftDeleted('departments', ['id' => $dept->id]);
});

it('forbids employees from creating departments', function () {
    actingAsRole('employee');

    $this->postJson('/api/departments', ['name' => 'X', 'code' => 'X1'])
        ->assertForbidden();
});

it('requires authentication', function () {
    $this->getJson('/api/departments')->assertUnauthorized();
});
