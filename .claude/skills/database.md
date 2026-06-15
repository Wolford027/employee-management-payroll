# Database Skill

## Engine & version
MySQL 8.0.43, InnoDB, utf8mb4_unicode_ci

## Core tables (18)

```
users                   ← Auth (Sanctum), roles via Spatie
  └─ employees          ← Personal employment record
       └─ employee_profiles  ← Extended info (address, emergency contact)
departments
positions               ← belongs to department
attendance_records      ← daily per employee (date unique with employee_id)
leave_types
leave_requests          ← belongs to employee + leave_type
allowances              ← global salary additions
deductions              ← global salary deductions
payroll_periods         ← billing cycle (weekly/biweekly/semi_monthly/monthly)
payrolls                ← one per employee per period
payroll_items           ← line items per payroll (type: allowance|deduction|earning)
payslips                ← generated PDF metadata (belongs to payroll)
notifications           ← polymorphic (notifiable)
audit_logs              ← polymorphic (auditable)
```

## Migration conventions

```php
// Always include:
$table->id();
$table->softDeletes();
$table->timestamps();

// FKs: constrained + cascadeOnDelete for required relations
$table->foreignId('department_id')->constrained()->cascadeOnDelete();

// FKs: nullable for optional relations
$table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();

// Unique composite indexes
$table->unique(['employee_id', 'date']); // attendance
$table->unique(['employee_id', 'payroll_period_id']); // payroll
```

## Payroll computation (MVP)

```
basic_salary = employee.salary / cycle_divisor
  cycle_divisors: weekly=52, biweekly=26, semi_monthly=24, monthly=12

total_allowances = SUM(allowance.amount WHERE status=active)
total_deductions = SUM(deduction.amount WHERE status=active)
gross_pay = basic_salary + total_allowances
net_pay   = gross_pay - total_deductions
```

## Query best practices

- Always paginate with `paginate()` from BaseRepository — never `->get()` on large tables
- Eager load relations for lists: `with(['employee', 'department'])` in Repository `query()`
- Use `withCount()` for counters: `withCount(['employees', 'positions'])`
- Scope active records: `scopeActive($q) { return $q->where('status', 'active'); }`
- Use `whereHas` for filtering by relation — never join manually
- Soft-delete aware: `withTrashed()` / `onlyTrashed()` for admin tools

## Seeder order (dependency order)

```
1. RolePermissionSeeder   ← must be first (roles/permissions)
2. DepartmentSeeder
3. PositionSeeder         ← needs departments
4. LeaveTypeSeeder
5. CompensationSeeder     ← allowances + deductions
6. UserEmployeeSeeder     ← needs departments, positions
7. AttendanceSeeder       ← needs employees
8. LeaveRequestSeeder     ← needs employees + leave types
9. PayrollSeeder          ← needs employees, periods, allowances, deductions
```

## Test database

- Connection: MySQL, database: `nextjs_test`
- Set in `phpunit.xml` (not `.env`)
- `RefreshDatabase` trait is used in all Feature tests
- Do NOT use SQLite — `pdo_sqlite` is unavailable in this environment
