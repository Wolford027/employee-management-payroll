# Architectural Decisions

## Token-based auth (not SPA cookie auth)
- Auth uses Bearer tokens stored in Zustand + `ems_token` cookie
- `statefulApi()` is NOT used — API routes have `validateCsrfTokens(except: ['api/*'])`
- **Why**: Avoids CSRF complexity; simpler for token-first APIs

## MySQL for tests (not SQLite)
- `phpunit.xml` uses `DB_CONNECTION=mysql, DB_DATABASE=nextjs_test`
- **Why**: `pdo_sqlite` not available in the PHP installation; MySQL tests are more production-faithful anyway

## Modular folder structure
- Backend: `app/Modules/{Name}/Controllers|Requests|Resources/`
- Not Laravel's default, but matches team's existing convention
- **Why**: Easier to locate all files for a feature in one place

## super-admin bypass
- `Gate::before` in `AppServiceProvider` gives super-admin all permissions
- Role check: `user.roles.includes('super-admin')` on frontend too
- **Why**: Avoids seeding/managing every permission for the top admin

## Employee portal (`/me/*` routes)
- Separate `MeController` with endpoints `/me/employee`, `/me/payrolls`, etc.
- Scoped to `$request->user()->employee->id`
- **Why**: `employee` role lacks `viewAny payroll` permission — portal bypasses it by design

## DepartmentFactory uses `fake()->unique()->company()`
- NOT `fake()->unique()->randomElement([...5 items...])` which exhausts in tests
- **Why**: Fixed list causes "Maximum retries of 10000 reached" in feature tests

## Zod coerce + RHF resolver cast
- `zodResolver(schema) as unknown as Resolver<FormValues>` in all forms with `z.coerce.number()`
- **Why**: Zod coerce makes input type `unknown`, clashing with RHF's strict generic

## PayslipService stores PDF at `storage/public/payslips/`
- PDF is generated on demand via `POST /payrolls/{id}/payslip`
- **Why**: Avoids re-generating on every download; cheap storage

## UserEmployeeSeeder uses department codes, not names
- `['IT', 'SLS', 'MKT']` — matches DepartmentSeeder codes
- **Why**: Names differ ('Sales', 'Marketing') but codes are stable
