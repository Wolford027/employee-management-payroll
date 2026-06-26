# Sub-Project 1: Multi-Tenancy Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add row-level multi-tenancy so every domain table is scoped by `tenant_id`, registration creates a tenant + owner, and owners can invite team members.

**Architecture:** Single MySQL database. A `BelongsToTenant` Eloquent trait auto-scopes every domain model query to `auth()->user()->tenant_id`. Registration creates a `Tenant` + `User` in one transaction. Super-admin (`tenant_id = null`) bypasses the scope automatically because the trait's guard checks for non-null. All seeders pass `tenant_id` explicitly.

**Tech Stack:** Laravel 12 · Sanctum · Spatie Permissions · Pest · Next.js 16 · TanStack Query · Zod · React Hook Form

## Global Constraints

- PHP 8.5+ syntax: readonly properties, named args, match expressions
- Run `./vendor/bin/pint` before every PHP commit
- No `any` in TypeScript — use `unknown` for truly unknown types
- Bearer token auth — no cookies/CSRF on API routes
- All API routes start with `/api/`; resources are plural kebab-case
- Roles: `super-admin`, `hr`, `manager`, `employee` (confirmed in `RolePermissionSeeder`)
- Default password for created accounts: `12345678` with `force_password_change = true`
- MySQL for tests — `phpunit.xml` sets `DB_DATABASE=nextjs_test`
- Clean-slate migration: tasks change existing migration files; finish Task 2 before running `migrate:fresh`
- Super-admin's `Gate::before` bypass is already in `AppServiceProvider` — do NOT change it

---

## File Map

### New (backend)
| File | Responsibility |
|---|---|
| `database/migrations/0000_00_00_000001_create_tenants_table.php` | Tenants table — runs before users |
| `app/Models/Tenant.php` | Tenant Eloquent model |
| `database/factories/TenantFactory.php` | Tenant factory for tests/seeders |
| `app/Models/Concerns/BelongsToTenant.php` | Global scope trait for all domain models |
| `database/seeders/TenantSeeder.php` | Creates the demo tenant |
| `app/Policies/UserPolicy.php` | Authorizes team-member CRUD |
| `app/Modules/Team/Controllers/TeamMemberController.php` | List / create / delete team members |
| `app/Modules/Team/Requests/CreateTeamMemberRequest.php` | Validation for invite |
| `app/Modules/Team/Resources/TeamMemberResource.php` | API shape for User-as-member |
| `app/Modules/Team/Services/TeamMemberService.php` | Business logic for team members |
| `routes/api/team.php` | Team member routes |
| `tests/Feature/TenantIsolationTest.php` | Proves cross-tenant data cannot leak |
| `tests/Feature/TeamMemberTest.php` | CRUD tests for team members |

### Modified (backend)
| File | Change |
|---|---|
| `database/migrations/0001_01_01_000000_create_users_table.php` | Add `tenant_id` (nullable FK), `is_owner`, `status`, `force_password_change` |
| `database/migrations/2026_06_14_155934_add_force_password_change_to_users_table.php` | **DELETE** — folded into users migration |
| All `2026_06_13_1400{01-15}` domain migrations | Add `tenant_id` non-nullable FK to each |
| `app/Models/User.php` | Add `tenant_id`, `is_owner`, `belongsTo(Tenant)` |
| `app/Models/Employee.php` + 11 other domain models | Add `use BelongsToTenant` + `tenant_id` to `$fillable` |
| `database/factories/UserFactory.php` | Add `tenant_id` (via `Tenant::factory()`) |
| All 9 domain model factories | Add `tenant_id` (via `Tenant::factory()`) |
| `database/seeders/DatabaseSeeder.php` | Call `TenantSeeder` first; update demo info |
| `database/seeders/DepartmentSeeder.php` | Pass `tenant_id` explicitly |
| `database/seeders/PositionSeeder.php` | Pass `tenant_id` explicitly |
| `database/seeders/LeaveTypeSeeder.php` | Pass `tenant_id` explicitly |
| `database/seeders/CompensationSeeder.php` | Pass `tenant_id` explicitly |
| `database/seeders/UserEmployeeSeeder.php` | Pass `tenant_id`; super-admin gets `null` tenant |
| `database/seeders/AttendanceSeeder.php` | Pass `tenant_id` explicitly |
| `database/seeders/LeaveRequestSeeder.php` | Pass `tenant_id` explicitly |
| `database/seeders/PayrollSeeder.php` | Pass `tenant_id` explicitly |
| `app/DTOs/RegisterDTO.php` | Add `company_name` |
| `app/Modules/Auth/Requests/RegisterRequest.php` | Add `company_name` validation |
| `app/Modules/Auth/Services/AuthService.php` | `register()` creates Tenant + User in transaction |
| `app/Modules/Employee/Services/EmployeeService.php` | `create()` and `createAccount()` set `tenant_id` on new users; `create()` makes user account optional via `create_account` flag |
| `routes/api.php` | Include `api/team.php` |
| `app/Providers/AppServiceProvider.php` | Register `UserPolicy` |

### New (frontend)
| File | Responsibility |
|---|---|
| `hooks/modules/useTeam.ts` | TanStack Query hooks for team members |
| `app/(app)/settings/team/page.tsx` | Team members list + invite dialog |

### Modified (frontend)
| File | Change |
|---|---|
| `types/index.ts` | Add `TeamMember` type; update `User` to include `is_owner` |
| `services/auth.ts` | Add `company_name` to register payload type |
| `services/index.ts` | Add `teamApi` export |
| `app/register/page.tsx` | Add company name field + update Zod schema |
| `components/layout/AppShell.tsx` | Add Settings nav section |

---

## Task 1: Tenants migration, model, and factory

**Files:**
- Create: `backend/database/migrations/0000_00_00_000001_create_tenants_table.php`
- Create: `backend/app/Models/Tenant.php`
- Create: `backend/database/factories/TenantFactory.php`

**Interfaces:**
- Produces: `Tenant::factory()` usable in all later factories; `Tenant` model with `name`, `slug`, `status`

- [ ] **Step 1: Create the tenants migration**

File: `backend/database/migrations/0000_00_00_000001_create_tenants_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
```

- [ ] **Step 2: Create the Tenant model**

File: `backend/app/Models/Tenant.php`

```php
<?php

namespace App\Models;

use Database\Factories\TenantFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    /** @use HasFactory<TenantFactory> */
    use HasFactory;

    protected $fillable = ['name', 'slug', 'status'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
```

- [ ] **Step 3: Create TenantFactory**

File: `backend/database/factories/TenantFactory.php`

```php
<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Tenant> */
class TenantFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name) . '-' . Str::lower(Str::random(4)),
            'status' => 'active',
        ];
    }
}
```

- [ ] **Step 4: Commit**

```bash
cd backend
git add database/migrations/0000_00_00_000001_create_tenants_table.php \
        app/Models/Tenant.php \
        database/factories/TenantFactory.php
git commit -m "feat(tenancy): add Tenant model, migration, and factory"
```

---

## Task 2: Rewrite domain migrations + BelongsToTenant trait + update models

**Files:**
- Create: `backend/app/Models/Concerns/BelongsToTenant.php`
- Modify: `backend/database/migrations/0001_01_01_000000_create_users_table.php`
- Delete: `backend/database/migrations/2026_06_14_155934_add_force_password_change_to_users_table.php`
- Modify: all `2026_06_13_1400{01–15}` migration files (add `tenant_id`)
- Modify: `backend/app/Models/User.php`
- Modify: `backend/app/Models/Employee.php` + 10 other domain models

**Interfaces:**
- Produces: `BelongsToTenant` trait; all domain models with `tenant_id` in `$fillable` and global scope

- [ ] **Step 1: Create BelongsToTenant trait**

File: `backend/app/Models/Concerns/BelongsToTenant.php`

```php
<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check() && ! is_null(auth()->user()->tenant_id)) {
                $builder->where(
                    $builder->getModel()->getTable() . '.tenant_id',
                    auth()->user()->tenant_id,
                );
            }
        });

        static::creating(function (self $model) {
            if (is_null($model->tenant_id)
                && auth()->check()
                && ! is_null(auth()->user()->tenant_id)) {
                $model->tenant_id = auth()->user()->tenant_id;
            }
        });
    }
}
```

- [ ] **Step 2: Rewrite users migration**

Replace the entire `up()` method in `backend/database/migrations/0001_01_01_000000_create_users_table.php`:

```php
public function up(): void
{
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->foreignId('tenant_id')->nullable()->constrained('tenants')->nullOnDelete();
        $table->string('name');
        $table->string('email')->unique();
        $table->timestamp('email_verified_at')->nullable();
        $table->string('password');
        $table->string('status')->default('active');
        $table->boolean('is_owner')->default(false);
        $table->boolean('force_password_change')->default(false);
        $table->rememberToken();
        $table->timestamps();
    });

    Schema::create('password_reset_tokens', function (Blueprint $table) {
        $table->string('email')->primary();
        $table->string('token');
        $table->timestamp('created_at')->nullable();
    });

    Schema::create('sessions', function (Blueprint $table) {
        $table->string('id')->primary();
        $table->foreignId('user_id')->nullable()->index();
        $table->string('ip_address', 45)->nullable();
        $table->text('user_agent')->nullable();
        $table->longText('payload');
        $table->integer('last_activity')->index();
    });
}
```

- [ ] **Step 3: Delete the now-redundant force_password_change migration**

```bash
cd backend
rm database/migrations/2026_06_14_155934_add_force_password_change_to_users_table.php
```

- [ ] **Step 4: Add `tenant_id` to each domain migration**

In each file listed below, add this line **immediately after `$table->id();`**:

```php
$table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
```

Files to update:
- `2026_06_13_140001_create_departments_table.php`
- `2026_06_13_140002_create_positions_table.php`
- `2026_06_13_140003_create_employees_table.php`
- `2026_06_13_140005_create_attendance_records_table.php`
- `2026_06_13_140006_create_leave_types_table.php`
- `2026_06_13_140007_create_leave_requests_table.php`
- `2026_06_13_140008_create_allowances_table.php`
- `2026_06_13_140009_create_deductions_table.php`
- `2026_06_13_140010_create_payroll_periods_table.php`
- `2026_06_13_140011_create_payrolls_table.php`
- `2026_06_13_140012_create_payroll_items_table.php`
- `2026_06_13_140013_create_payslips_table.php`
- `2026_06_13_140015_create_audit_logs_table.php`

> `employee_profiles` does NOT get `tenant_id` — it is always accessed via the `employee` relationship which is already scoped.

- [ ] **Step 5: Update User model**

Add to `backend/app/Models/User.php`:

```php
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// In $fillable, add:
'tenant_id',
'is_owner',

// Add casts:
'is_owner' => 'boolean',

// Add relation:
public function tenant(): BelongsTo
{
    return $this->belongsTo(Tenant::class);
}
```

- [ ] **Step 6: Apply BelongsToTenant to all 11 domain models**

For each model listed, add `use BelongsToTenant;` in the class body and `'tenant_id'` to `$fillable`:

```php
// Add to the use statement at top of each file:
use App\Models\Concerns\BelongsToTenant;

// Add trait to class:
use HasFactory, SoftDeletes, BelongsToTenant; // (adjust existing traits)

// Add to $fillable:
'tenant_id',
```

Models: `Employee`, `Department`, `Position`, `AttendanceRecord`, `LeaveType`, `LeaveRequest`, `Allowance`, `Deduction`, `PayrollPeriod`, `Payroll`, `PayrollItem`, `Payslip`, `AuditLog`

- [ ] **Step 7: Run migrate:fresh to verify the schema is correct**

```bash
cd backend
php artisan migrate:fresh
```

Expected: all tables created, no errors. The `tenants` table is created before `users`.

- [ ] **Step 8: Commit**

```bash
git add app/Models/Concerns/BelongsToTenant.php \
        app/Models/User.php \
        app/Models/Employee.php \
        app/Models/Department.php \
        app/Models/Position.php \
        app/Models/AttendanceRecord.php \
        app/Models/LeaveType.php \
        app/Models/LeaveRequest.php \
        app/Models/Allowance.php \
        app/Models/Deduction.php \
        app/Models/PayrollPeriod.php \
        app/Models/Payroll.php \
        app/Models/PayrollItem.php \
        app/Models/Payslip.php \
        app/Models/AuditLog.php \
        database/migrations/
git commit -m "feat(tenancy): BelongsToTenant trait, rewrite migrations with tenant_id"
```

---

## Task 3: Update all factories with tenant_id

**Files:**
- Modify: `backend/database/factories/UserFactory.php`
- Modify: `backend/database/factories/DepartmentFactory.php`
- Modify: `backend/database/factories/PositionFactory.php`
- Modify: `backend/database/factories/EmployeeFactory.php`
- Modify: `backend/database/factories/AttendanceRecordFactory.php`
- Modify: `backend/database/factories/LeaveTypeFactory.php`
- Modify: `backend/database/factories/LeaveRequestFactory.php`
- Modify: all other domain factories

**Interfaces:**
- Consumes: `Tenant::factory()` from Task 1
- Produces: factories that include `tenant_id` via `Tenant::factory()` as the default state

- [ ] **Step 1: Update UserFactory**

Replace `definition()` in `backend/database/factories/UserFactory.php`:

```php
public function definition(): array
{
    return [
        'tenant_id'              => Tenant::factory(),
        'name'                   => fake()->name(),
        'email'                  => fake()->unique()->safeEmail(),
        'email_verified_at'      => now(),
        'password'               => Hash::make('password'),
        'status'                 => 'active',
        'is_owner'               => false,
        'force_password_change'  => false,
        'remember_token'         => Str::random(10),
    ];
}
```

Add to imports: `use App\Models\Tenant;`

- [ ] **Step 2: Add a `forTenant()` state to each domain factory — do NOT add to `definition()`**

Do NOT add `'tenant_id'` to `definition()` on domain factories. Instead add this state method to each:

```php
use App\Models\Tenant;

public function forTenant(Tenant $tenant): static
{
    return $this->state(['tenant_id' => $tenant->id]);
}
```

Do this for every factory whose model uses `BelongsToTenant`: `DepartmentFactory`, `PositionFactory`, `EmployeeFactory`, `AttendanceRecordFactory`, `LeaveTypeFactory`, `LeaveRequestFactory`, `AllowanceFactory`, `DeductionFactory`, `PayrollPeriodFactory`, `PayrollFactory`, `PayrollItemFactory`, `PayslipFactory`.

> **Why not `definition()`?** If `tenant_id` is set by the factory before `Model::creating` fires, the `BelongsToTenant` hook sees a non-null `tenant_id` and does nothing — so `actingAs($user)` tests would get a random new tenant instead of the auth user's tenant. Keeping `tenant_id` absent from `definition()` lets the hook do the right thing when auth context is present; tests without auth pass `['tenant_id' => $id]` explicitly (as all seeders already do).

- [ ] **Step 3: Write a quick smoke test**

File: `backend/tests/Feature/TenantScopeTest.php`

```php
<?php

use App\Models\Department;
use App\Models\Tenant;
use App\Models\User;

it('auto-assigns tenant_id on create when authenticated', function () {
    $tenant = Tenant::factory()->create();
    $user   = User::factory()->create(['tenant_id' => $tenant->id]);

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
```

- [ ] **Step 4: Run the tests**

```bash
cd backend
php artisan test tests/Feature/TenantScopeTest.php
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add database/factories/ tests/Feature/TenantScopeTest.php
git commit -m "feat(tenancy): add tenant_id to all factories, tenant scope tests pass"
```

---

## Task 4: TenantSeeder + update all seeders

**Files:**
- Create: `backend/database/seeders/TenantSeeder.php`
- Modify: `backend/database/seeders/DatabaseSeeder.php`
- Modify: `backend/database/seeders/DepartmentSeeder.php`
- Modify: `backend/database/seeders/PositionSeeder.php`
- Modify: `backend/database/seeders/LeaveTypeSeeder.php`
- Modify: `backend/database/seeders/CompensationSeeder.php`
- Modify: `backend/database/seeders/UserEmployeeSeeder.php`
- Modify: `backend/database/seeders/AttendanceSeeder.php`
- Modify: `backend/database/seeders/LeaveRequestSeeder.php`
- Modify: `backend/database/seeders/PayrollSeeder.php`

**Interfaces:**
- Consumes: `Tenant` model (slug `'demo'` as the anchor)
- Produces: all seeded data under a single demo tenant; super-admin has `tenant_id = null`

- [ ] **Step 1: Create TenantSeeder**

File: `backend/database/seeders/TenantSeeder.php`

```php
<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        Tenant::firstOrCreate(
            ['slug' => 'demo'],
            ['name' => 'Demo Company', 'status' => 'active'],
        );
    }
}
```

- [ ] **Step 2: Update DatabaseSeeder — call TenantSeeder first**

Replace `DatabaseSeeder::run()` in `backend/database/seeders/DatabaseSeeder.php`:

```php
public function run(): void
{
    $this->call([
        // Must be first — all other seeders resolve the demo tenant.
        TenantSeeder::class,
        RolePermissionSeeder::class,
        DepartmentSeeder::class,
        PositionSeeder::class,
        LeaveTypeSeeder::class,
        CompensationSeeder::class,
        UserEmployeeSeeder::class,
        AttendanceSeeder::class,
        LeaveRequestSeeder::class,
        PayrollSeeder::class,
    ]);

    $this->command->newLine();
    $this->command->info('Demo tenant: Demo Company (slug: demo)');
    $this->command->info('Demo logins (password: "password"):');
    $this->command->line('  Super Admin : admin@example.com  (no tenant — system account)');
    $this->command->line('  Owner       : owner@example.com');
    $this->command->line('  HR          : hr1@example.com / hr2@example.com');
    $this->command->line('  Manager     : manager1@example.com … manager3@example.com');
    $this->command->line('  Employee    : employee@example.com');
}
```

- [ ] **Step 3: Update DepartmentSeeder**

Add `use App\Models\Tenant;` and resolve the demo tenant at the top of `run()`:

```php
public function run(): void
{
    $tenant = Tenant::where('slug', 'demo')->firstOrFail();

    $departments = [
        ['name' => 'IT',         'code' => 'IT',  'description' => 'Information Technology & Engineering'],
        ['name' => 'HR',         'code' => 'HR',  'description' => 'Human Resources'],
        ['name' => 'Accounting', 'code' => 'ACC', 'description' => 'Finance & Accounting'],
        ['name' => 'Sales',      'code' => 'SLS', 'description' => 'Sales & Business Development'],
        ['name' => 'Marketing',  'code' => 'MKT', 'description' => 'Marketing & Communications'],
    ];

    foreach ($departments as $data) {
        Department::firstOrCreate(
            ['code' => $data['code'], 'tenant_id' => $tenant->id],
            $data + ['status' => 'active', 'tenant_id' => $tenant->id],
        );
    }
}
```

- [ ] **Step 4: Update PositionSeeder**

Add `use App\Models\Tenant;` and at the top of `run()`:

```php
$tenant = Tenant::where('slug', 'demo')->firstOrFail();
```

Wherever `Position::firstOrCreate` or `Position::create` is called, add `'tenant_id' => $tenant->id` to the data array.

- [ ] **Step 5: Update LeaveTypeSeeder and CompensationSeeder**

Same pattern: resolve demo tenant, pass `tenant_id` to every `firstOrCreate` / `create` call.

```php
// Add at top of run():
$tenant = Tenant::where('slug', 'demo')->firstOrFail();

// Add to every model create:
'tenant_id' => $tenant->id,
```

- [ ] **Step 6: Update UserEmployeeSeeder — super-admin gets null tenant**

Add a `private ?int $tenantId` property, resolve it at the start of `run()`, and thread it through `makeUserWithEmployee`. The super-admin is created separately WITHOUT an employee record:

```php
// Add at class level:
private int $sequence = 0;
private int $tenantId;

public function run(): void
{
    $this->tenantId = Tenant::where('slug', 'demo')->firstOrFail()->id;

    // Super-admin: system account, no tenant, no employee record.
    $superAdmin = User::firstOrCreate(
        ['email' => 'admin@example.com'],
        [
            'name'              => 'System Administrator',
            'password'          => Hash::make('password'),
            'status'            => 'active',
            'tenant_id'         => null,
            'is_owner'          => false,
            'email_verified_at' => now(),
        ],
    );
    $superAdmin->syncRoles(['super-admin']);

    // Demo tenant owner.
    $this->makeUserWithEmployee(
        name: 'Demo Owner',
        email: 'owner@example.com',
        role: 'hr',
        isOwner: true,
        deptCode: 'IT',
        level: 'Senior',
    );

    // Two HR users.
    for ($i = 1; $i <= 2; $i++) {
        $this->makeUserWithEmployee(
            name: fake()->name(),
            email: "hr{$i}@example.com",
            role: 'hr',
            isOwner: false,
            deptCode: 'HR',
            level: $i === 1 ? 'Senior' : 'Mid',
        );
    }

    // Three managers.
    $managerDepts = ['IT', 'SLS', 'MKT'];
    for ($i = 1; $i <= 3; $i++) {
        $this->makeUserWithEmployee(
            name: fake()->name(),
            email: "manager{$i}@example.com",
            role: 'manager',
            isOwner: false,
            deptCode: $managerDepts[$i - 1],
            level: 'Senior',
        );
    }

    // Demo employee + 29 random.
    $this->makeUserWithEmployee(
        name: 'Demo Employee',
        email: 'employee@example.com',
        role: 'employee',
        isOwner: false,
        deptCode: 'IT',
        level: 'Junior',
    );

    $deptCodes = Department::where('tenant_id', $this->tenantId)->pluck('code')->all();
    for ($i = 1; $i <= 29; $i++) {
        $this->makeUserWithEmployee(
            name: fake()->name(),
            email: "employee{$i}@example.com",
            role: 'employee',
            isOwner: false,
            deptCode: fake()->randomElement($deptCodes),
            level: fake()->randomElement(['Junior', 'Junior', 'Mid', 'Senior']),
        );
    }
}

private function makeUserWithEmployee(
    string $name,
    string $email,
    string $role,
    bool $isOwner,
    string $deptCode,
    string $level,
): void {
    $this->sequence++;

    $department = Department::where('code', $deptCode)->where('tenant_id', $this->tenantId)->firstOrFail();
    $position   = Position::where('department_id', $department->id)->where('level', $level)->where('tenant_id', $this->tenantId)->first();

    $user = User::firstOrCreate(
        ['email' => $email],
        [
            'name'              => $name,
            'password'          => Hash::make('password'),
            'status'            => 'active',
            'tenant_id'         => $this->tenantId,
            'is_owner'          => $isOwner,
            'email_verified_at' => now(),
        ],
    );
    $user->syncRoles([$role]);

    [$first, $last] = $this->splitName($name);
    $salary = (float) $position->base_salary + fake()->numberBetween(0, 8000);

    $employee = Employee::firstOrCreate(
        ['user_id' => $user->id],
        [
            'employee_code'   => 'EMP-' . str_pad((string) $this->sequence, 5, '0', STR_PAD_LEFT),
            'tenant_id'       => $this->tenantId,
            'department_id'   => $department->id,
            'position_id'     => $position?->id,
            'first_name'      => $first,
            'last_name'       => $last,
            'email'           => $email,
            'phone'           => fake()->numerify('+1-###-###-####'),
            'salary'          => $salary,
            'date_hired'      => fake()->dateTimeBetween('-6 years', '-1 month')->format('Y-m-d'),
            'employment_type' => 'full_time',
            'status'          => 'active',
        ],
    );

    EmployeeProfile::firstOrCreate(
        ['employee_id' => $employee->id],
        [
            'birth_date'               => fake()->dateTimeBetween('-55 years', '-22 years')->format('Y-m-d'),
            'gender'                   => fake()->randomElement(['male', 'female']),
            'marital_status'           => fake()->randomElement(['single', 'married']),
            'address'                  => fake()->streetAddress(),
            'city'                     => fake()->city(),
            'country'                  => fake()->country(),
            'emergency_contact_name'   => fake()->name(),
            'emergency_contact_phone'  => fake()->numerify('+1-###-###-####'),
            'bank_name'                => fake()->randomElement(['First National', 'Metro Bank', 'Union Savings']),
            'bank_account_number'      => fake()->numerify('##########'),
            'tax_id'                   => fake()->numerify('TIN-#########'),
        ],
    );
}
```

- [ ] **Step 7: Update AttendanceSeeder, LeaveRequestSeeder, PayrollSeeder**

Same pattern for each:

```php
// At top of run():
$tenant = Tenant::where('slug', 'demo')->firstOrFail();

// When querying employees in these seeders:
$employees = Employee::where('tenant_id', $tenant->id)->get();

// When creating records:
AttendanceRecord::create([
    'tenant_id' => $tenant->id,
    // ... rest of fields
]);
```

- [ ] **Step 8: Run migrate:fresh --seed to verify**

```bash
cd backend
php artisan migrate:fresh --seed
```

Expected: all tables seeded, no errors, final summary prints the demo logins.

- [ ] **Step 9: Commit**

```bash
git add database/seeders/
git commit -m "feat(tenancy): update all seeders to pass tenant_id; super-admin gets null tenant"
```

---

## Task 5: Update register flow (create tenant + owner)

**Files:**
- Modify: `backend/app/DTOs/RegisterDTO.php`
- Modify: `backend/app/Modules/Auth/Requests/RegisterRequest.php`
- Modify: `backend/app/Modules/Auth/Services/AuthService.php`

**Interfaces:**
- Consumes: `Tenant` model (Task 1)
- Produces: `POST /api/auth/register` now accepts `company_name`; creates Tenant + User in one transaction; returns same `{ user, token }` envelope

- [ ] **Step 1: Write failing test**

File: `backend/tests/Feature/RegistrationTest.php`

```php
<?php

use App\Models\Tenant;
use App\Models\User;

it('registration creates a tenant and an owner user', function () {
    $response = $this->postJson('/api/auth/register', [
        'name'                  => 'Jane Owner',
        'email'                 => 'jane@acme.com',
        'company_name'          => 'Acme Corp',
        'password'              => 'secret1234',
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
        'name'                  => 'Jane Owner',
        'email'                 => 'jane@acme.com',
        'password'              => 'secret1234',
        'password_confirmation' => 'secret1234',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['company_name']);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
php artisan test tests/Feature/RegistrationTest.php
```

Expected: FAIL — `company_name` field not in request, register doesn't create tenant.

- [ ] **Step 3: Update RegisterDTO**

Replace `backend/app/DTOs/RegisterDTO.php`:

```php
<?php

namespace App\DTOs;

class RegisterDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $password,
        public readonly string $companyName,
    ) {}

    /** @param array<string,mixed> $data */
    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            password: $data['password'],
            companyName: $data['company_name'],
        );
    }
}
```

- [ ] **Step 4: Update RegisterRequest**

Add `company_name` to rules in `backend/app/Modules/Auth/Requests/RegisterRequest.php`:

```php
public function rules(): array
{
    return [
        'name'         => ['required', 'string', 'max:255'],
        'company_name' => ['required', 'string', 'max:255'],
        'email'        => ['required', 'email', 'max:255', 'unique:users,email'],
        'password'     => ['required', 'confirmed', Password::defaults()],
    ];
}
```

- [ ] **Step 5: Update AuthService::register**

Replace the `register()` method in `backend/app/Modules/Auth/Services/AuthService.php`:

```php
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Register a new owner account, creating a tenant in the same transaction.
 *
 * @return array{user: User, token: string}
 */
public function register(RegisterDTO $dto): array
{
    return DB::transaction(function () use ($dto) {
        $slug = Str::slug($dto->companyName) . '-' . Str::lower(Str::random(6));

        $tenant = Tenant::create([
            'name'   => $dto->companyName,
            'slug'   => $slug,
            'status' => 'active',
        ]);

        $user = User::create([
            'name'      => $dto->name,
            'email'     => $dto->email,
            'password'  => Hash::make($dto->password),
            'status'    => 'active',
            'tenant_id' => $tenant->id,
            'is_owner'  => true,
        ]);

        $user->assignRole('hr');

        $token = $user->createToken('web')->plainTextToken;

        return ['user' => $user->load('roles', 'permissions', 'tenant'), 'token' => $token];
    });
}
```

- [ ] **Step 6: Run tests**

```bash
cd backend
php artisan test tests/Feature/RegistrationTest.php
```

Expected: 2 tests pass.

- [ ] **Step 7: Run pint**

```bash
cd backend
./vendor/bin/pint
```

- [ ] **Step 8: Commit**

```bash
git add app/DTOs/RegisterDTO.php \
        app/Modules/Auth/Requests/RegisterRequest.php \
        app/Modules/Auth/Services/AuthService.php \
        tests/Feature/RegistrationTest.php
git commit -m "feat(tenancy): register creates tenant + owner; add company_name to DTO and request"
```

---

## Task 6: Team Members backend module

**Files:**
- Create: `backend/app/Policies/UserPolicy.php`
- Create: `backend/app/Modules/Team/Controllers/TeamMemberController.php`
- Create: `backend/app/Modules/Team/Requests/CreateTeamMemberRequest.php`
- Create: `backend/app/Modules/Team/Resources/TeamMemberResource.php`
- Create: `backend/app/Modules/Team/Services/TeamMemberService.php`
- Create: `backend/routes/api/team.php`
- Modify: `backend/routes/api.php`
- Modify: `backend/app/Providers/AppServiceProvider.php`
- Create: `backend/tests/Feature/TeamMemberTest.php`

**Interfaces:**
- Consumes: `User` model with `tenant_id` and `is_owner` (Task 2)
- Produces:
  - `GET /api/team-members` — paginated list of users in the same tenant
  - `POST /api/team-members` — create user with `{ name, email, role }`; returns 201
  - `DELETE /api/team-members/{id}` — remove non-owner user; returns 200

- [ ] **Step 1: Write failing tests**

File: `backend/tests/Feature/TeamMemberTest.php`

```php
<?php

use App\Models\Tenant;
use App\Models\User;

function makeOwner(): User
{
    $tenant = Tenant::factory()->create();
    $owner  = User::factory()->create([
        'tenant_id' => $tenant->id,
        'is_owner'  => true,
    ]);
    $owner->assignRole('hr');
    return $owner;
}

it('owner can list team members', function () {
    $owner  = makeOwner();
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
            'name'  => 'New HR',
            'email' => 'newhr@acme.com',
            'role'  => 'hr',
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
    $tenant   = Tenant::factory()->create();
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend
php artisan test tests/Feature/TeamMemberTest.php
```

Expected: FAIL — route does not exist.

- [ ] **Step 3: Create UserPolicy**

File: `backend/app/Policies/UserPolicy.php`

```php
<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $authUser): bool
    {
        return $authUser->is_owner || $authUser->hasRole('hr');
    }

    public function create(User $authUser): bool
    {
        return $authUser->is_owner || $authUser->hasRole('hr');
    }

    public function delete(User $authUser, User $targetUser): bool
    {
        return ($authUser->is_owner || $authUser->hasRole('hr'))
            && ! $targetUser->is_owner
            && $authUser->tenant_id === $targetUser->tenant_id;
    }
}
```

- [ ] **Step 4: Register UserPolicy in AppServiceProvider**

Add inside `boot()` in `backend/app/Providers/AppServiceProvider.php`:

```php
use App\Models\User;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;

// Add inside boot():
Gate::policy(User::class, UserPolicy::class);
```

- [ ] **Step 5: Create TeamMemberResource**

File: `backend/app/Modules/Team/Resources/TeamMemberResource.php`

```php
<?php

namespace App\Modules\Team\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id,
            'name'                   => $this->name,
            'email'                  => $this->email,
            'status'                 => $this->status,
            'is_owner'               => $this->is_owner,
            'force_password_change'  => $this->force_password_change,
            'roles'                  => $this->roles->pluck('name'),
            'created_at'             => $this->created_at?->toISOString(),
        ];
    }
}
```

- [ ] **Step 6: Create CreateTeamMemberRequest**

File: `backend/app/Modules/Team/Requests/CreateTeamMemberRequest.php`

```php
<?php

namespace App\Modules\Team\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateTeamMemberRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role'  => ['required', 'in:hr,manager,employee'],
        ];
    }
}
```

- [ ] **Step 7: Create TeamMemberService**

File: `backend/app/Modules/Team/Services/TeamMemberService.php`

```php
<?php

namespace App\Modules\Team\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class TeamMemberService
{
    /** @param array<string,mixed> $params */
    public function list(array $params): LengthAwarePaginator
    {
        return User::where('tenant_id', auth()->user()->tenant_id)
            ->with('roles')
            ->orderBy('created_at')
            ->paginate((int) ($params['per_page'] ?? 15));
    }

    /** @param array<string,mixed> $data */
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name'                  => $data['name'],
                'email'                 => $data['email'],
                'password'              => Hash::make('12345678'),
                'status'                => 'active',
                'tenant_id'             => auth()->user()->tenant_id,
                'is_owner'              => false,
                'force_password_change' => true,
            ]);

            $user->assignRole($data['role']);

            return $user->load('roles');
        });
    }

    public function delete(User $user): void
    {
        if ($user->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        if ($user->is_owner) {
            throw ValidationException::withMessages([
                'user' => ['Cannot remove the tenant owner.'],
            ]);
        }

        $user->delete();
    }
}
```

- [ ] **Step 8: Create TeamMemberController**

File: `backend/app/Modules/Team/Controllers/TeamMemberController.php`

```php
<?php

namespace App\Modules\Team\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Team\Requests\CreateTeamMemberRequest;
use App\Modules\Team\Resources\TeamMemberResource;
use App\Modules\Team\Services\TeamMemberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TeamMemberController extends Controller
{
    public function __construct(private readonly TeamMemberService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', User::class);

        return TeamMemberResource::collection($this->service->list($request->query()));
    }

    public function store(CreateTeamMemberRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $member = $this->service->create($request->validated());

        return TeamMemberResource::make($member)->response()->setStatusCode(201);
    }

    public function destroy(User $teamMember): JsonResponse
    {
        $this->authorize('delete', $teamMember);

        $this->service->delete($teamMember);

        return response()->json(['message' => 'Team member removed.']);
    }
}
```

- [ ] **Step 9: Create route file and register it**

File: `backend/routes/api/team.php`

```php
<?php

use App\Modules\Team\Controllers\TeamMemberController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/team-members', [TeamMemberController::class, 'index']);
    Route::post('/team-members', [TeamMemberController::class, 'store']);
    Route::delete('/team-members/{teamMember}', [TeamMemberController::class, 'destroy']);
});
```

Add to `backend/routes/api.php`:

```php
require __DIR__ . '/api/team.php';
```

- [ ] **Step 10: Run tests**

```bash
cd backend
php artisan test tests/Feature/TeamMemberTest.php
```

Expected: 5 tests pass.

- [ ] **Step 11: Run pint**

```bash
cd backend
./vendor/bin/pint
```

- [ ] **Step 12: Commit**

```bash
git add app/Policies/UserPolicy.php \
        app/Providers/AppServiceProvider.php \
        app/Modules/Team/ \
        routes/api/team.php \
        routes/api.php \
        tests/Feature/TeamMemberTest.php
git commit -m "feat(tenancy): Team Members module — list, invite, remove"
```

---

## Task 7: Make EmployeeService::create optionally create a user account

**Files:**
- Modify: `backend/app/Modules/Employee/Services/EmployeeService.php`

**Interfaces:**
- Produces: `create(array $data)` accepts optional `create_account: bool`; when false, no User is created and `temp_password` is null; `createAccount()` sets `tenant_id` on the new user

- [ ] **Step 1: Write failing test**

Add to `backend/tests/Feature/EmployeeTest.php` (or create if absent):

```php
it('creates an employee without a user account when create_account is false', function () {
    $tenant = Tenant::factory()->create();
    $owner  = User::factory()->create(['tenant_id' => $tenant->id, 'is_owner' => true]);
    $owner->assignRole('hr');

    $dept = Department::factory()->create(['tenant_id' => $tenant->id]);
    $pos  = Position::factory()->create(['tenant_id' => $tenant->id, 'department_id' => $dept->id]);

    $this->actingAs($owner)->postJson('/api/employees', [
        'first_name'      => 'John',
        'last_name'       => 'Doe',
        'email'           => 'john.doe@acme.com',
        'salary'          => 50000,
        'employment_type' => 'full_time',
        'department_id'   => $dept->id,
        'position_id'     => $pos->id,
        'create_account'  => false,
    ])->assertStatus(201);

    expect(User::where('email', 'john.doe@acme.com')->exists())->toBeFalse();
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend
php artisan test tests/Feature/EmployeeTest.php --filter="creates an employee without a user account"
```

Expected: FAIL (or 201 but user IS created — current behavior always creates one).

- [ ] **Step 3: Update EmployeeService::create**

Replace the `create()` method in `backend/app/Modules/Employee/Services/EmployeeService.php`:

```php
/**
 * Create an employee and optionally provision a user account.
 *
 * @param  array<string,mixed>  $data
 * @return array{employee: Employee, temp_password: string|null}
 */
public function create(array $data): array
{
    return DB::transaction(function () use ($data) {
        $profile       = $data['profile'] ?? null;
        $createAccount = (bool) ($data['create_account'] ?? false);
        unset($data['profile'], $data['create_account']);

        $userId      = null;
        $tempPassword = null;

        if ($createAccount) {
            if (User::where('email', $data['email'])->exists()) {
                throw ValidationException::withMessages([
                    'email' => ['A user account with this email already exists.'],
                ]);
            }

            $tempPassword = '12345678';

            $user = User::create([
                'name'                  => trim("{$data['first_name']} {$data['last_name']}"),
                'email'                 => $data['email'],
                'password'              => Hash::make($tempPassword),
                'status'                => 'active',
                'tenant_id'             => auth()->user()->tenant_id,
                'force_password_change' => true,
            ]);
            $user->assignRole('employee');

            $userId = $user->id;
        }

        $data['user_id'] = $userId;

        /** @var Employee $employee */
        $employee = $this->repository->create($data);

        if ($profile) {
            $employee->profile()->create($profile);
        }

        return [
            'employee'      => $employee->load('department', 'position', 'profile', 'user'),
            'temp_password' => $tempPassword,
        ];
    });
}
```

Also update `createAccount()` to set `tenant_id`:

```php
$user = User::create([
    'name'                  => $employee->full_name,
    'email'                 => $employee->email,
    'password'              => Hash::make($password),
    'status'                => 'active',
    'tenant_id'             => auth()->user()->tenant_id,
    'force_password_change' => true,
]);
```

- [ ] **Step 4: Run test**

```bash
cd backend
php artisan test tests/Feature/EmployeeTest.php
```

Expected: all employee tests pass.

- [ ] **Step 5: Run pint and commit**

```bash
cd backend
./vendor/bin/pint
git add app/Modules/Employee/Services/EmployeeService.php tests/Feature/EmployeeTest.php
git commit -m "feat(tenancy): make employee user-account creation optional; set tenant_id on provisioned users"
```

---

## Task 8: Tenant isolation integration test

**Files:**
- Create: `backend/tests/Feature/TenantIsolationTest.php`

**Interfaces:**
- Consumes: all domain models with `BelongsToTenant` (Tasks 2–7)
- Produces: tests that prove cross-tenant leakage is impossible at the API level

- [ ] **Step 1: Write the tests**

File: `backend/tests/Feature/TenantIsolationTest.php`

```php
<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\PayrollPeriod;
use App\Models\Tenant;
use App\Models\User;

function makeTenantWithHr(): array
{
    $tenant = Tenant::factory()->create();
    $hr     = User::factory()->create(['tenant_id' => $tenant->id, 'is_owner' => true]);
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

    Employee::factory(5)->create(['tenant_id' => $tenantA->id]);
    Employee::factory(3)->create(['tenant_id' => $tenantB->id]);

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
```

- [ ] **Step 2: Run the tests**

```bash
cd backend
php artisan test tests/Feature/TenantIsolationTest.php
```

Expected: 5 tests pass with no cross-tenant leakage.

- [ ] **Step 3: Commit**

```bash
git add tests/Feature/TenantIsolationTest.php
git commit -m "test(tenancy): prove API-level cross-tenant isolation"
```

---

## Task 9: Frontend — types, auth service, register page

**Files:**
- Modify: `frontend/types/index.ts`
- Modify: `frontend/services/auth.ts`
- Modify: `frontend/app/register/page.tsx`

**Interfaces:**
- Consumes: backend `POST /api/auth/register` now requires `company_name`
- Produces: `TeamMember` type; register form with company name field

- [ ] **Step 1: Update types/index.ts**

Add `is_owner` to `User` and add new `TeamMember` type:

```ts
// In User interface, add:
is_owner?: boolean;

// Add new type after User:
export interface TeamMember {
  id: number;
  name: string;
  email: string;
  status: string;
  is_owner: boolean;
  force_password_change: boolean;
  roles: Role[];
  created_at: string;
}
```

- [ ] **Step 2: Update auth service register signature**

In `frontend/services/auth.ts`, update the `register` function:

```ts
register: (payload: {
  name: string;
  company_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) =>
  api.post<AuthResponse>("/auth/register", payload).then((r) => r.data),
```

- [ ] **Step 3: Update register page**

Replace `frontend/app/register/page.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { AuthCard } from "@/components/auth/AuthCard";
import { RedirectingOverlay } from "@/components/auth/RedirectingOverlay";
import { Field } from "@/components/common/Field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    company_name: z.string().min(2, "Company name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => authService.register(values),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Account created!");
      router.push("/dashboard");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Registration failed")),
  });

  if (mutation.isSuccess) return <RedirectingOverlay />;

  return (
    <AuthCard
      title="Create your workspace"
      subtitle="One account for you and your whole team."
    >
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-4"
      >
        <Field label="Your name" error={form.formState.errors.name?.message}>
          <Input type="text" autoComplete="name" className="h-11" {...form.register("name")} />
        </Field>
        <Field
          label="Company name"
          error={form.formState.errors.company_name?.message}
        >
          <Input
            type="text"
            autoComplete="organization"
            className="h-11"
            placeholder="Acme Corp"
            {...form.register("company_name")}
          />
        </Field>
        <Field label="Work email" error={form.formState.errors.email?.message}>
          <Input type="email" autoComplete="email" className="h-11" {...form.register("email")} />
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            className="h-11"
            {...form.register("password")}
          />
        </Field>
        <Field
          label="Confirm password"
          error={form.formState.errors.password_confirmation?.message}
        >
          <Input
            type="password"
            autoComplete="new-password"
            className="h-11"
            {...form.register("password_confirmation")}
          />
        </Field>
        <Button
          type="submit"
          variant="yellow"
          size="lg"
          className="w-full mt-2"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Creating…" : "Create workspace"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
```

- [ ] **Step 4: Add teamApi to services/index.ts**

In `frontend/services/index.ts`, add `TeamMember` and `Paginated` to the **existing** `import type { ... } from "@/types"` block (do not create a second import). Then append the `teamApi` object at the bottom of the file:

```ts
// In the existing import block, add: TeamMember, Paginated
import type {
  AttendanceRecord,
  // ... existing types ...
  Paginated,
  TeamMember,
} from "@/types";

// Append at the bottom of the file:
export const teamApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<TeamMember>>("/team-members", { params }).then((r) => r.data),
  create: (data: { name: string; email: string; role: string }) =>
    api.post<{ data: TeamMember }>("/team-members", data).then((r) => r.data),
  remove: (id: number) =>
    api.delete(`/team-members/${id}`).then((r) => r.data),
};

export const teamApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<TeamMember>>("/team-members", { params }).then((r) => r.data),
  create: (data: { name: string; email: string; role: string }) =>
    api.post<{ data: TeamMember }>("/team-members", data).then((r) => r.data),
  remove: (id: number) =>
    api.delete(`/team-members/${id}`).then((r) => r.data),
};
```

Also import `Paginated` from `@/types` at the top if not already imported.

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
cd frontend
git add types/index.ts services/auth.ts services/index.ts app/register/page.tsx
git commit -m "feat(tenancy): add company_name to register; TeamMember type + teamApi"
```

---

## Task 10: Frontend — Settings/Team page + AppShell nav

**Files:**
- Create: `frontend/hooks/modules/useTeam.ts`
- Create: `frontend/app/(app)/settings/team/page.tsx`
- Modify: `frontend/components/layout/AppShell.tsx`

**Interfaces:**
- Consumes: `teamApi` (Task 9)
- Produces: `/settings/team` page with member list + invite dialog; Settings section in sidebar

- [ ] **Step 1: Create useTeam hook**

File: `frontend/hooks/modules/useTeam.ts`

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { teamApi } from "@/services";
import { apiErrorMessage } from "@/lib/api";

export function useTeamMembers(page = 1) {
  return useQuery({
    queryKey: ["team-members", page],
    queryFn: () => teamApi.list({ page, per_page: 15 }),
  });
}

export function useInviteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teamApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Team member invited.");
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teamApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Team member removed.");
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
}
```

- [ ] **Step 2: Create Settings/Team page**

File: `frontend/app/(app)/settings/team/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/common/Field";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useTeamMembers, useInviteTeamMember, useRemoveTeamMember } from "@/hooks/modules/useTeam";
import { useAuth } from "@/hooks/useAuth";

const inviteSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  role: z.enum(["hr", "manager", "employee"]),
});
type InviteValues = z.infer<typeof inviteSchema>;

export default function TeamPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useTeamMembers(page);
  const invite = useInviteTeamMember();
  const remove = useRemoveTeamMember();
  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "employee" },
  });

  const canManage = user?.is_owner || user?.roles?.includes("hr");

  return (
    <>
      <PageHeader
        title="Team Members"
        action={
          canManage && (
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Invite Member
            </Button>
          )
        }
      />
      <Card className="p-4">
        {isLoading ? (
          <TableSkeleton cols={5} rows={8} hasPagination />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Role</TH>
                  <TH>Status</TH>
                  {canManage && <TH className="text-right">Actions</TH>}
                </TR>
              </THead>
              <TBody>
                {data?.data.map((member) => (
                  <TR key={member.id}>
                    <TD className="font-medium">
                      {member.name}
                      {member.is_owner && (
                        <span className="ml-2 text-xs text-yellow-400">(owner)</span>
                      )}
                    </TD>
                    <TD>{member.email}</TD>
                    <TD>
                      <Badge status={member.roles[0] ?? "employee"}>
                        {member.roles[0] ?? "—"}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge status={member.force_password_change ? "pending" : "active"}>
                        {member.force_password_change ? "password pending" : member.status}
                      </Badge>
                    </TD>
                    {canManage && (
                      <TD>
                        <div className="flex justify-end">
                          {!member.is_owner && member.id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                confirm("Remove this member?") &&
                                remove.mutate(member.id)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          )}
                        </div>
                      </TD>
                    )}
                  </TR>
                ))}
              </TBody>
            </Table>
            {data && (
              <Pagination
                page={data.meta.current_page}
                lastPage={data.meta.last_page}
                total={data.meta.total}
                onChange={setPage}
              />
            )}
          </>
        )}
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Invite Team Member"
      >
        <form
          onSubmit={form.handleSubmit((v) => {
            invite.mutate(v, { onSuccess: () => { setOpen(false); form.reset(); } });
          })}
          className="space-y-4"
        >
          <Field label="Full name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="Email address" error={form.formState.errors.email?.message}>
            <Input type="email" {...form.register("email")} />
          </Field>
          <Field label="Role" error={form.formState.errors.role?.message}>
            <Select {...form.register("role")}>
              <option value="hr">HR</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </Select>
          </Field>
          <p className="text-xs text-slate-500">
            They will receive default password <code>12345678</code> and be
            prompted to change it on first login.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={invite.isPending}>
              {invite.isPending ? "Inviting…" : "Send Invite"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 3: Add Settings section to AppShell**

In `frontend/components/layout/AppShell.tsx`, add `Settings` to the **existing** lucide-react import line (do not add a second import), then add the new nav item to the `NAV` array (after "My Portal"):

```ts
// Existing import — add Settings to it:
import {
  LayoutDashboard, Users, Building2, Briefcase,
  CalendarCheck, CalendarOff, Wallet, FileText,
  UserCircle, LogOut, ChevronRight, Settings,
} from "lucide-react";

// In NAV array, add after My Portal:
{ label: "Team", href: "/settings/team", icon: Settings },
```

Also add a visual separator above the Settings group. After the existing nav loop, add a second section with a divider:

```tsx
{/* In the <nav> element, replace the single loop with: */}
<div className="space-y-0.5">
  {visibleNav
    .filter((i) => !i.href.startsWith("/settings"))
    .map((item) => <NavLink key={item.href} item={item} pathname={pathname} />)}
</div>

{visibleNav.some((i) => i.href.startsWith("/settings")) && (
  <>
    <div className="my-2 border-t border-white/8" />
    <p className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
      Settings
    </p>
    <div className="space-y-0.5">
      {visibleNav
        .filter((i) => i.href.startsWith("/settings"))
        .map((item) => <NavLink key={item.href} item={item} pathname={pathname} />)}
    </div>
  </>
)}
```

Extract the existing link JSX into a `NavLink` inner component to avoid repetition:

```tsx
function NavLink({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
        active ? "text-yellow-400" : "text-slate-400 hover:text-white",
      )}
      style={
        active
          ? { background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)" }
          : { border: "1px solid transparent" }
      }
    >
      <item.icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300",
        )}
      />
      <span className="flex-1">{item.label}</span>
      {active && <ChevronRight className="h-3 w-3 text-yellow-400 shrink-0" />}
    </Link>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd frontend
git add hooks/modules/useTeam.ts \
        app/\(app\)/settings/team/page.tsx \
        components/layout/AppShell.tsx
git commit -m "feat(tenancy): Settings/Team page — list and invite members; Settings nav section"
```

---

## Final verification

- [ ] **Backend: run full test suite**

```bash
cd backend
php artisan test
```

Expected: all tests pass.

- [ ] **Backend: fresh seed**

```bash
cd backend
php artisan migrate:fresh --seed
```

Expected: no errors. Check the printed login table.

- [ ] **Frontend: dev server smoke test**

```bash
cd frontend
npm run dev
```

1. Open `http://localhost:3000/register` — confirm Company Name field is present
2. Register with a company name — confirm redirect to `/dashboard`
3. Open `/settings/team` — confirm current user appears in the list
4. Click "Invite Member" — invite an HR user, confirm they appear in the list with "password pending" status
5. Log out; log in as the invited user with password `12345678` — confirm force-change prompt

- [ ] **Final commit**

```bash
git add .
git commit -m "feat(tenancy): sub-project 1 complete — row-level multi-tenancy"
```

---

## What comes next

After this plan is fully implemented and all tests pass, proceed to:

**`docs/superpowers/plans/2026-06-26-sub-project-2-attendance-clock.md`** — Attendance clock-in/out with camera capture and geolocation (depends on `tenant_id` being on `attendance_records`, which is done in this plan).
