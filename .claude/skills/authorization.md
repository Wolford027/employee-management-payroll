# Authorization Skill

## Roles (Spatie Laravel Permission)

| Role | Description |
|---|---|
| `super-admin` | Bypasses all permissions via `Gate::before` |
| `hr-manager` | Full CRUD on employees, leave, attendance, payroll |
| `manager` | View team + approve leave (future) |
| `employee` | Own portal only (`/me/*` endpoints) |

## Permission format

`"{action} {resource}"` — e.g. `"viewAny employee"`, `"delete payroll"`

Actions: `viewAny | view | create | update | delete`

Resources: `employee | department | position | attendance | leave | payroll | payslip | report`

## Backend — per-action authorization

```php
// In every controller method:
$this->authorize('viewAny', Employee::class);  // index
$this->authorize('create', Employee::class);   // store
$this->authorize('view', $employee);           // show
$this->authorize('update', $employee);         // update
$this->authorize('delete', $employee);         // destroy
```

**Never use** `authorizeResource()` — it's not available on the bare Laravel 12 Controller.

## Super-admin bypass

```php
// AppServiceProvider::boot()
Gate::before(function (User $user, string $ability): ?bool {
    if ($user->hasRole('super-admin')) return true;
    return null; // fall through to normal policy check
});
```

## Route-level middleware (double-check)

```php
Route::middleware('permission:viewAny employee')->group(function () {
    Route::get('/employees', [EmployeeController::class, 'index']);
});
```

## Frontend permission gates

```ts
const { hasPermission, hasRole } = useAuth();

// Show/hide UI elements
{hasPermission('create employee') && <Button>Add Employee</Button>}
{hasRole('super-admin', 'hr-manager') && <AdminPanel />}
```

## Employee portal (no-permission endpoint)

The `employee` role does NOT have `viewAny payroll`. Instead, use the `/me/*` routes:

```
GET /api/me/employee    ← own profile
GET /api/me/payrolls    ← own payrolls
GET /api/me/payslips    ← own payslips
GET /api/me/leaves      ← own leave requests
GET /api/me/attendance  ← own attendance (last 60 days)
```

These are in `MeController` and scope queries to `$request->user()->employee->id`.

## RolePermissionSeeder

Add any new permissions here. Must run first in `DatabaseSeeder`.

Pattern:
```php
$permissions = ['viewAny','view','create','update','delete'];
$resources   = ['employee','department','position','attendance','leave','payroll','payslip','report'];
foreach ($resources as $r) {
    foreach ($permissions as $p) {
        Permission::firstOrCreate(['name' => "$p $r"]);
    }
}
// Assign to roles...
$hrRole->syncPermissions($allPermissions);
$managerRole->syncPermissions($viewPermissions);
// super-admin gets no explicit permissions (Gate::before handles it)
```
