# Security Rules

## Backend

1. **Never skip authorization** — every controller action must call `$this->authorize()` unless the route is explicitly public.
2. **Validate at the boundary** — use FormRequest for all user input; never trust raw `$request->all()`.
3. **Mass assignment** — always define `$fillable` (not `$guarded = []`).
4. **No raw SQL** — use Eloquent or query builder with bindings. Never string-interpolate user input into queries.
5. **Soft deletes** — use `SoftDeletes` on all domain models (Employee, Payroll, etc.).
6. **Sensitive fields** — `password` must be `hidden` in User model. Never return passwords in resources.
7. **CSRF** — API routes are CSRF-exempt (token auth). Web routes keep CSRF. Do NOT disable CSRF globally.
8. **File uploads** — validate MIME type + size in FormRequest; store outside `public/`.

## Frontend

1. **Never store token in localStorage directly** — use Zustand persist (it goes to localStorage under a namespace) + the `ems_token` cookie for middleware.
2. **XSS** — avoid `dangerouslySetInnerHTML`. Use React's built-in escaping.
3. **No secrets in client code** — only `NEXT_PUBLIC_*` env vars are safe in browser.
4. **Auth guard** — the `(app)/layout.tsx` checks `hydrated && token`; the `proxy.ts` checks the cookie. Both must stay in sync.
5. **API errors** — never expose raw stack traces to users; use `apiErrorMessage()`.
