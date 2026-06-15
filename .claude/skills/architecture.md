# System Architecture

## Overview

```
Browser (Next.js 16)
    ↕  HTTP/JSON (Axios, Bearer token)
Laravel 12 API (port 8000)
    ↕  Eloquent ORM
MySQL 8.0 (port 3306)
```

## Backend data flow

```
Route
  → FormRequest (validate)
  → Controller (authorize + delegate)
  → Service (business logic, transactions)
  → DTO (typed transfer object)
  → Repository (Eloquent queries)
  → Model (Eloquent)
  → Resource (JSON shape)
```

## Frontend data flow

```
proxy.ts (route guard, reads ems_token cookie)
  → (app)/layout.tsx (Zustand auth guard)
  → AppShell (sidebar nav, blue/yellow glass)
  → Page Component ("use client")
    → TanStack Query (server state cache)
      → services/*.ts (Axios wrappers)
        → Laravel API
    → Zustand authStore (user, token, permissions)
    → React Hook Form + Zod (form state + validation)
```

## Module boundaries

Each domain is a self-contained module:
- **Employee** — personal info, profile, employment details
- **Department** — org structure
- **Position** — job roles per department
- **Attendance** — daily records (clock in/out, status)
- **Leave** — requests with type/date range/status
- **Payroll** — periods + payroll records + items (allowances/deductions)
- **Payslip** — PDF document generated from payroll
- **Report** — admin dashboard aggregates + employee portal (`/me/*`)

## State management

| State type | Tool |
|---|---|
| Server data (lists, CRUD) | TanStack Query |
| Auth (user, token, roles) | Zustand + persist |
| Form input | React Hook Form |
| UI toggles (open/close) | useState |

## Key invariants

1. Backend is API-only — no session views, no web auth pages
2. All protected endpoints require `auth:sanctum`
3. Permissions are checked per action (not per route group)
4. super-admin bypasses all permissions via `Gate::before`
5. Soft-delete on all domain models — never hard-delete
6. API CSRF is always disabled for `api/*` routes (token auth)
