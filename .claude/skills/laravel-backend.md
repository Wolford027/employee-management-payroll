# Laravel Backend Skill

## Stack
- Laravel 12, PHP 8.5, MySQL 8.0
- Sanctum (Bearer token auth — no cookie SPA auth)
- Spatie Laravel Permission (roles + permissions)
- barryvdh/laravel-dompdf (payslip PDF)
- Pest 3 (testing)

## Architecture — always follow this chain

```
Route → FormRequest → Controller → Service → DTO → Repository → Model
                                         ↓
                                      Resource (API response)
```

- **FormRequest** — all validation lives here, never in controller
- **Controller** — thin: call service, return resource
- **Service** — business logic, DB transactions
- **DTO** — typed data transfer between layers (readonly class)
- **Repository extends BaseRepository** — paginate/search/filter/sort
- **Resource** — JSON shape (never expose raw model)

## Module folder structure

```
app/Modules/{Name}/
  Controllers/{Name}Controller.php
  Requests/{Create|Update}{Name}Request.php
  Resources/{Name}Resource.php
```
```
app/
  DTOs/{Name}DTO.php
  Models/{Name}.php
  Repositories/{Name}Repository.php
  Modules/{Name}/Services/{Name}Service.php
```

## BaseRepository API

```php
$repo->paginate($params);  // ?search=&filter[status]=&sort=name&direction=asc&per_page=15
```

Override in subclass:
```php
protected array $searchable = ['name', 'email'];
protected array $filterable = ['status', 'department_id'];
protected array $sortable   = ['name', 'created_at'];
protected string $defaultSort = 'created_at';
protected string $defaultDirection = 'desc';
protected function query(): Builder { return parent::query()->with('department'); }
```

## API response conventions

| Scenario | Shape |
|---|---|
| Single resource | `{ data: { ... } }` via `Resource::make($model)->response()` |
| Paginated list | `{ data: [...], meta: { current_page, last_page, total, per_page } }` |
| Success message | `{ message: '...' }` |
| Validation error | 422 with `{ message: '...', errors: { field: ['msg'] } }` |
| Auth error | 401 `{ message: 'Unauthenticated.' }` |
| Permission error | 403 `{ message: 'This action is unauthorized.' }` |

## Auth guard

All protected routes use `auth:sanctum`. Token-based only — no `statefulApi()`, no CSRF on API routes.

## Permissions

Format: `"{action} {resource}"` — e.g. `"viewAny employee"`, `"create department"`, `"delete payroll"`.

Actions: `viewAny | view | create | update | delete`

## Generate checklist for a new module

- [ ] Migration (with softDeletes, timestamps, indexes)
- [ ] Model (fillable, casts, relations, scopes)
- [ ] Factory
- [ ] Seeder
- [ ] DTO (readonly class)
- [ ] Repository extends BaseRepository
- [ ] FormRequests (Create + Update)
- [ ] Resource
- [ ] Service
- [ ] Controller
- [ ] Route file at `routes/api/{module}.php`
- [ ] Include in `routes/api.php`
- [ ] Pest feature test
