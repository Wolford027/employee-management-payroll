# API Design Rules

## URL conventions

```
GET    /api/{resources}           → index (paginated)
POST   /api/{resources}           → store
GET    /api/{resources}/{id}      → show
PUT    /api/{resources}/{id}      → update
DELETE /api/{resources}/{id}      → destroy

POST   /api/payrolls/generate     → custom action (verb after resource)
GET    /api/payslips/{id}/download
POST   /api/auth/login
GET    /api/me/employee           → portal (scoped to current user)
```

- Resources are **plural kebab-case**: `leave-types`, `payroll-periods`
- No nesting beyond one level unless there is a strong reason

## Response envelope

```jsonc
// list
{ "data": [...], "meta": { "current_page": 1, "last_page": 3, "per_page": 15, "total": 42 } }

// single
{ "data": { "id": 1, ... } }

// action result
{ "message": "Payroll generated.", "generated": 10, "skipped": 2 }
```

## HTTP status codes

| Code | When |
|---|---|
| 200 | GET, PUT success |
| 201 | POST (resource created) |
| 204 | DELETE success (no body) |
| 422 | Validation errors |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |

## Query parameters (index endpoints)

| Param | Example | Meaning |
|---|---|---|
| `search` | `?search=john` | Full-text across $searchable columns |
| `filter[field]` | `?filter[status]=active` | Exact match on $filterable columns |
| `sort` | `?sort=name` | Column name (from $sortable) |
| `direction` | `?direction=desc` | asc or desc |
| `per_page` | `?per_page=25` | Results per page (default 15) |
| `page` | `?page=2` | Page number |

## Route file pattern

```php
// routes/api/{module}.php
Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('permission:viewAny employee')->group(function () {
        Route::get('/employees', [EmployeeController::class, 'index']);
    });
    Route::middleware('permission:create employee')->post('/employees', [EmployeeController::class, 'store']);
    // ...
});
```
