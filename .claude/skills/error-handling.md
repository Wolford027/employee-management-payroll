# Error Handling Skill

## Backend (Laravel)

### API errors — always return JSON

`bootstrap/app.php` forces JSON for `api/*`:
```php
$exceptions->shouldRenderJsonWhen(fn($r) => $r->is('api/*') || $r->expectsJson());
```

### Standard error shapes

```json
// Validation (422)
{ "message": "The email field is required.", "errors": { "email": ["The email field is required."] } }

// Auth (401)
{ "message": "Unauthenticated." }

// Permission (403)
{ "message": "This action is unauthorized." }

// Not found (404)
{ "message": "No query results for model [...]" }

// Server error (500)
{ "message": "Server Error" }
```

### Service layer — throw, never return null

```php
// BAD
public function find(int $id): ?Employee { return Employee::find($id); }

// GOOD
public function find(int $id): Employee { return Employee::findOrFail($id); }
```

### Transactions

Wrap multi-step writes in `DB::transaction()`. Always.

## Frontend (Next.js)

### apiErrorMessage() — normalize all errors

```ts
import { apiErrorMessage } from "@/lib/api";
onError: (err) => toast.error(apiErrorMessage(err, "Something went wrong"))
```

It extracts the first validation field error, then `message`, then falls back.

### Form field errors — show inline

```tsx
{form.formState.errors.email && (
  <p className="mt-1 text-xs text-red-400">{form.formState.errors.email.message}</p>
)}
```

### 401 auto-redirect

The Axios response interceptor in `lib/api.ts` handles this globally. Don't add per-request 401 handling.

### Loading / empty states

```tsx
if (isLoading) return <LoadingBlock label="Loading employees…" />;
if (!data?.data.length) return <p className="text-slate-400 text-sm">No records found.</p>;
```

### Mutations — always invalidate on success

```ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["employees"] });
  toast.success("Employee created");
  setOpen(null);
}
```
