# Naming Rules

## PHP / Laravel

| Item | Convention | Example |
|---|---|---|
| Classes | PascalCase | `EmployeeService`, `PayrollPeriod` |
| Methods | camelCase | `generatePayroll()`, `findByCode()` |
| DB columns | snake_case | `employee_code`, `start_date` |
| DB tables | snake_case plural | `payroll_periods`, `leave_requests` |
| Routes | kebab-case | `/payroll-periods`, `/leave-types` |
| Permissions | `"{action} {resource}"` | `"viewAny employee"` |
| Roles | kebab-case | `super-admin`, `hr-manager`, `employee` |
| DTOs | `{Name}DTO` | `RegisterDTO`, `PayrollDTO` |
| Repositories | `{Name}Repository` | `EmployeeRepository` |
| Form Requests | `{Action}{Name}Request` | `CreateEmployeeRequest`, `UpdatePayrollRequest` |
| Resources | `{Name}Resource` | `EmployeeResource` |

## TypeScript / Next.js

| Item | Convention | Example |
|---|---|---|
| Components | PascalCase | `AppShell`, `EmployeeForm` |
| Hooks | `use{Name}` camelCase | `useEmployees`, `useAuthStore` |
| Files | kebab-case | `create-employee.ts`, `leave-request.ts` |
| Types/Interfaces | PascalCase | `Employee`, `PaginatedResponse<T>` |
| Services | camelCase singleton | `services.employees.list()` |
| Store state | camelCase | `authStore`, `hasPermission()` |
| CSS classes | kebab-case (Tailwind) or BEM for custom | `glass-sidebar`, `bg-orb-blue` |
| Query keys | kebab-case array | `["employees", params]` |

## Environment variables

- Backend: `UPPER_SNAKE_CASE` — `DB_PASSWORD`, `FRONTEND_URL`, `COMPANY_NAME`
- Frontend (public): `NEXT_PUBLIC_UPPER_SNAKE` — `NEXT_PUBLIC_API_URL`
