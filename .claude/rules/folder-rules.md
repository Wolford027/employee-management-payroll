# Folder Rules

## Backend (`backend/`)

```
app/
  DTOs/                    ← readonly PHP classes (no logic)
  Http/Controllers/        ← ONLY the base Controller
  Models/                  ← Eloquent models (fillable, casts, relations, scopes)
  Modules/
    {Name}/
      Controllers/         ← thin controller (authorize + call service + return resource)
      Requests/            ← Create{Name}Request, Update{Name}Request
      Resources/           ← {Name}Resource, {Name}Collection if needed
      Services/            ← {Name}Service (business logic, transactions)
  Providers/               ← AppServiceProvider only (gate::before, etc.)
  Repositories/
    BaseRepository.php     ← DO NOT MODIFY (generic paginate/search/filter/sort)
    {Name}Repository.php   ← extend Base, set $searchable/$filterable/$sortable

config/                    ← no custom config files unless required
database/
  factories/               ← {Name}Factory for every model
  migrations/              ← numbered chronologically
  seeders/                 ← {Name}Seeder + DatabaseSeeder (calls them in order)
resources/views/payslips/  ← ONLY blade: payslip PDF template
routes/
  api.php                  ← includes all sub-files
  api/
    auth.php
    employee.php
    department.php
    position.php
    attendance.php
    leave.php
    payroll.php
    report.php
tests/Feature/             ← Pest test files, one per module
```

## Frontend (`frontend/`)

```
app/
  (app)/                   ← route group: all auth-required pages
    layout.tsx             ← ONLY: auth guard + AppShell wrapper
    {module}/
      page.tsx             ← main list page
      [id]/page.tsx        ← detail/edit page (if needed)
      new/page.tsx         ← create page (if form is too large for modal)
      _components/         ← page-specific components (not reusable)
  login/page.tsx
  register/page.tsx
  forgot-password/page.tsx
  reset-password/page.tsx
  layout.tsx               ← root: fonts + Providers + bg orbs
  globals.css              ← brand tokens, glass utilities, scrollbar

components/
  layout/AppShell.tsx      ← sidebar navigation (blue/yellow glass)
  layout/PageHeader.tsx    ← page title + optional action slot
  ui/                      ← design system (all themed for dark glass)
  common/Field.tsx         ← label + input + error message wrapper

lib/
  api.ts                   ← axios instance (1 file, no subfolders)
  cookies.ts               ← setTokenCookie / clearTokenCookie
  utils.ts                 ← cn(), formatCurrency(), formatDate()

stores/
  authStore.ts             ← ONLY auth state

services/
  auth.ts                  ← auth endpoints
  crud.ts                  ← createResource<T>() factory
  index.ts                 ← all resource instances export

hooks/
  useAuth.ts               ← useAuth, useAuthBootstrap, useLogout
  modules/                 ← per-module TanStack hooks

types/index.ts             ← ALL TypeScript types in ONE file
providers/Providers.tsx    ← QueryClientProvider + Toaster
proxy.ts                   ← Next.js 16 route protection (NOT middleware.ts)
```

## Do not create
- `pages/` directory — App Router only
- `middleware.ts` — use `proxy.ts` in Next.js 16
- `config/` folder in frontend
- Barrel files (`index.ts`) that re-export everything from a folder — import directly
