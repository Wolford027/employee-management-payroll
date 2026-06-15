# Testing Skill

## Stack & config

- **Framework**: Pest 3.8 (wrapper over PHPUnit)
- **DB**: MySQL `nextjs_test` (NOT SQLite — `pdo_sqlite` unavailable)
- **phpunit.xml overrides**:
  ```xml
  <env name="DB_CONNECTION" value="mysql"/>
  <env name="DB_DATABASE"   value="nextjs_test"/>
  ```
- All feature tests use `RefreshDatabase` (drops + recreates tables each run)

## Test helpers — `tests/Pest.php`

```php
function actingAsSuperAdmin(): User
{
    (new RolePermissionSeeder)->run();
    $user = User::factory()->create();
    $user->assignRole('super-admin');
    Sanctum::actingAs($user);
    return $user;
}

function actingAsRole(string $role): User
{
    (new RolePermissionSeeder)->run();
    $user = User::factory()->create();
    $user->assignRole($role);
    Sanctum::actingAs($user);
    return $user;
}
```

Always call one of these in `beforeEach()` — never write tests without an authenticated user.

## File structure

```
tests/
  Feature/
    AuthTest.php
    DepartmentTest.php
    EmployeeTest.php
    PayrollTest.php
    SeederTest.php
  Pest.php       ← helpers + global uses
  TestCase.php
```

One file per module. File name matches the module controller.

## Standard test pattern

```php
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(fn () => actingAsSuperAdmin());

// Index
it('lists departments with pagination', function () {
    Department::factory()->count(5)->create();

    getJson('/api/departments')
        ->assertOk()
        ->assertJsonCount(5, 'data')
        ->assertJsonStructure(['data', 'meta']);
});

// Store
it('creates a department', function () {
    postJson('/api/departments', [
        'name'   => 'Engineering',
        'code'   => 'ENG',
        'status' => 'active',
    ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Engineering')
        ->assertJsonPath('data.code', 'ENG');
});

// Show
it('shows a department', function () {
    $dept = Department::factory()->create();

    getJson("/api/departments/{$dept->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $dept->id);
});

// Update
it('updates a department', function () {
    $dept = Department::factory()->create(['name' => 'Old Name']);

    putJson("/api/departments/{$dept->id}", ['name' => 'New Name'])
        ->assertOk()
        ->assertJsonPath('data.name', 'New Name');
});

// Delete (soft)
it('soft deletes a department', function () {
    $dept = Department::factory()->create();

    deleteJson("/api/departments/{$dept->id}")->assertNoContent();

    assertSoftDeleted('departments', ['id' => $dept->id]);
});

// Validation
it('rejects a department without a name', function () {
    postJson('/api/departments', [])->assertUnprocessable();
});

// Permission gate
it('forbids employee role from creating departments', function () {
    actingAsRole('employee');

    postJson('/api/departments', ['name' => 'X', 'code' => 'X'])
        ->assertForbidden();
});
```

## Auth tests pattern

```php
it('logs in with valid credentials', function () {
    $user = User::factory()->create(['password' => bcrypt('secret'), 'status' => 'active']);

    postJson('/api/auth/login', ['email' => $user->email, 'password' => 'secret'])
        ->assertOk()
        ->assertJsonStructure(['data' => ['user', 'token']]);
});

it('rejects inactive users', function () {
    $user = User::factory()->create(['password' => bcrypt('secret'), 'status' => 'inactive']);

    postJson('/api/auth/login', ['email' => $user->email, 'password' => 'secret'])
        ->assertUnprocessable(); // or assertForbidden depending on your impl
});
```

## Seeder smoke test

```php
it('seeds the database without errors', function () {
    $this->artisan('db:seed')->assertExitCode(0);
    expect(User::count())->toBeGreaterThan(0);
    expect(Employee::count())->toBeGreaterThan(0);
});
```

## Factory best practices

- Use `fake()->unique()->company()` for department/company names — NOT a fixed array (exhausts after N calls)
- Use `fake()->unique()->email()` for users
- Keep factory states minimal: only `active` / `inactive` states if needed

```php
// BAD — exhausts after 5 uses in tests with many records
'name' => fake()->unique()->randomElement(['HR','IT','Finance','Sales','Marketing']),

// GOOD — unbounded pool
'name' => fake()->unique()->company(),
```

## Running tests

```bash
# All tests
cd backend && php artisan test

# Specific file
php artisan test tests/Feature/DepartmentTest.php

# Specific test
php artisan test --filter="lists departments"

# With coverage (optional)
php artisan test --coverage
```

## What to test

- CRUD success cases (201/200/204)
- Validation rejection (422) with missing/invalid fields
- Permission gates: employee role → 403 on admin endpoints
- Soft delete: `assertSoftDeleted()` not `assertDatabaseMissing()`
- Seeder: smoke test that seed runs and creates records

## What NOT to test

- Internal service methods directly (test via HTTP)
- Factory internals
- Framework behaviour (Eloquent, Sanctum internals)
- Frontend TypeScript (use `tsc --noEmit` + Next.js build)
