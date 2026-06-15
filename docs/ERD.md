# Database ERD — Employee Management with Payroll (V1)

> MySQL 8 · Laravel 12 migrations live in `backend/database/migrations`.
> Roles/permissions are provided by `spatie/laravel-permission` (`roles`, `permissions`,
> `model_has_roles`, `model_has_permissions`, `role_has_permissions`).

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o| employees : "has one"
    departments ||--o{ positions : "has many"
    departments ||--o{ employees : "has many"
    positions ||--o{ employees : "has many"
    employees ||--o| employee_profiles : "has one"
    employees ||--o{ attendance_records : "has many"
    employees ||--o{ leave_requests : "has many"
    leave_types ||--o{ leave_requests : "has many"
    payroll_periods ||--o{ payrolls : "has many"
    employees ||--o{ payrolls : "has many"
    payrolls ||--o{ payroll_items : "has many"
    payrolls ||--o| payslips : "has one"
    employees ||--o{ payslips : "has many"
    users ||--o{ audit_logs : "performs"

    users {
        bigint id PK
        string name
        string email UK
        string password
        string status
        timestamp email_verified_at
        softDeletes deleted_at
    }
    employees {
        bigint id PK
        string employee_code UK
        bigint user_id FK
        bigint department_id FK
        bigint position_id FK
        string first_name
        string last_name
        string email UK
        string phone
        decimal salary
        date date_hired
        string employment_type
        string status
        softDeletes deleted_at
    }
    employee_profiles {
        bigint id PK
        bigint employee_id FK,UK
        date birth_date
        string gender
        string address
        string emergency_contact_name
        string bank_account_number
        string tax_id
    }
    departments {
        bigint id PK
        string name
        string code UK
        string status
        softDeletes deleted_at
    }
    positions {
        bigint id PK
        string title
        string level
        bigint department_id FK
        decimal base_salary
        string status
        softDeletes deleted_at
    }
    attendance_records {
        bigint id PK
        bigint employee_id FK
        date date
        time time_in
        time time_out
        decimal hours_worked
        string status
    }
    leave_types {
        bigint id PK
        string name
        string code UK
        smallint default_days
        string status
    }
    leave_requests {
        bigint id PK
        bigint employee_id FK
        bigint leave_type_id FK
        date start_date
        date end_date
        smallint days
        string status
        softDeletes deleted_at
    }
    allowances {
        bigint id PK
        string name
        string code UK
        string calculation_type
        decimal amount
        bool is_taxable
        string status
    }
    deductions {
        bigint id PK
        string name
        string code UK
        string calculation_type
        decimal amount
        string status
    }
    payroll_periods {
        bigint id PK
        string name
        string cycle
        date start_date
        date end_date
        date pay_date
        string status
    }
    payrolls {
        bigint id PK
        bigint payroll_period_id FK
        bigint employee_id FK
        decimal basic_salary
        decimal total_allowances
        decimal total_deductions
        decimal gross_pay
        decimal net_pay
        string status
    }
    payroll_items {
        bigint id PK
        bigint payroll_id FK
        string type
        string label
        decimal amount
    }
    payslips {
        bigint id PK
        bigint payroll_id FK,UK
        bigint employee_id FK
        string payslip_number UK
        string file_path
        timestamp generated_at
    }
    audit_logs {
        bigint id PK
        bigint user_id FK
        string action
        string auditable_type
        bigint auditable_id
        json changes
    }
```

## Tables (18)

| # | Table | Purpose | Key relationships |
|---|-------|---------|-------------------|
| 1 | `users` | Auth identity (Sanctum + Spatie roles) | hasOne `employees` |
| 2 | `roles` | Spatie roles (Super Admin, HR, Manager, Employee) | — |
| 3 | `permissions` | Spatie permissions | — |
| 4 | `employees` | Core employee record | belongsTo user/department/position |
| 5 | `employee_profiles` | Extended personal/bank details (1:1) | belongsTo employee |
| 6 | `departments` | Org departments | hasMany positions/employees |
| 7 | `positions` | Job positions w/ level + base salary | belongsTo department |
| 8 | `attendance_records` | Daily attendance (unique per employee/day) | belongsTo employee |
| 9 | `leave_types` | Sick / Vacation / Emergency | hasMany leave_requests |
| 10 | `leave_requests` | Leave applications (status only, no engine) | belongsTo employee/leave_type |
| 11 | `payroll_periods` | Pay cycles (weekly…monthly) | hasMany payrolls |
| 12 | `payrolls` | Per-employee payroll for a period | belongsTo period/employee |
| 13 | `payroll_items` | Allowance/deduction/earning line items | belongsTo payroll |
| 14 | `allowances` | Master allowance catalogue | — |
| 15 | `deductions` | Master deduction catalogue | — |
| 16 | `payslips` | Generated payslip (PDF metadata) | belongsTo payroll/employee |
| 17 | `notifications` | Laravel database notifications | morph notifiable |
| 18 | `audit_logs` | Action audit trail | belongsTo user, morph auditable |

## Indexing & integrity highlights

- **Unique:** `employees.employee_code`, `employees.email`, `departments.code`, `leave_types.code`,
  `allowances.code`, `deductions.code`, `payslips.payslip_number`.
- **Composite unique:** `attendance_records(employee_id, date)`, `payrolls(payroll_period_id, employee_id)`,
  one profile/payslip per parent.
- **Indexed:** all `status` columns, foreign keys, and common date filters.
- **Soft deletes:** users, employees, departments, positions, leave_requests (archive-friendly).
- **FK cleanup:** cascade on dependent rows (profiles, items), `nullOnDelete` on optional links
  (employee.user_id, position.department_id).
```
