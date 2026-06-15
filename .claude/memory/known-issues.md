# Known Issues & Fixes

## CSRF error on login (FIXED)
- **Symptom**: POST /api/auth/login returns 419 "CSRF token mismatch"
- **Cause**: `statefulApi()` was present in `bootstrap/app.php`, enabling cookie+CSRF middleware for API routes
- **Fix**: Replaced with `$middleware->validateCsrfTokens(except: ['api/*'])` — API routes are now CSRF-exempt
- **When to revisit**: Never, unless switching to cookie-based SPA auth

## AuthorizesRequests not found (FIXED)
- **Symptom**: `Call to undefined method authorize()` in controllers
- **Cause**: Laravel 12 base Controller is bare — no traits
- **Fix**: Added `use AuthorizesRequests, ValidatesRequests;` to `app/Http/Controllers/Controller.php`

## Register returned `"status": null` (FIXED)
- **Symptom**: Newly registered users have null status
- **Cause**: `'status'` was missing from `User::$fillable`
- **Fix**: Added `'status'` to fillable

## DepartmentFactory unique exhaustion in tests (FIXED)
- **Symptom**: "Maximum retries of 10000 reached without finding a unique value" in Pest tests
- **Cause**: `fake()->unique()->randomElement([...5 items...])` exhausts after 5 uses
- **Fix**: Changed to `fake()->unique()->company()` (unbounded Faker pool)

## `intl` extension missing (non-breaking)
- `php artisan db:show` crashes with intl-related formatting error
- App works fine — `intl` is only used by artisan display formatting
- Do NOT add `intl` just for this; use `number_format()` for currency in app code

## `modules/employee/hooks.ts` type error (FIXED)
- `payload: Partial<Employee>` fails because `salary` is `string` in the type but forms send `number`
- Fix: use `Record<string, unknown>` as payload type in mutation functions

## Next.js middleware naming (permanent)
- File MUST be `proxy.ts` with `export function proxy()` in Next.js 16
- `middleware.ts` is a compile-time error — never create it
