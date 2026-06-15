# Authentication Skill

## Mechanism: Laravel Sanctum — Token-based only

No cookie SPA auth, no sessions on the API. Every request uses:
```
Authorization: Bearer <token>
```

## Token lifecycle

1. `POST /api/auth/login` → returns `{ data: { user, token } }`
2. Frontend stores token in Zustand (`ems-auth` localStorage key) + `ems_token` cookie
3. `proxy.ts` reads `ems_token` cookie to gate routes at the edge
4. `(app)/layout.tsx` reads Zustand `token` + `hydrated` to guard React tree
5. Logout → `POST /api/auth/logout` revokes current token → `useAuthStore.clear()` → redirect `/login`
6. Token refresh: not implemented (MVP) — re-login on expiry

## Backend routes

```php
// Public
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password

// Protected (auth:sanctum)
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/profile
```

## AuthService methods

```php
register(RegisterDTO $dto): array { user, token }
login(LoginDTO $dto): array { user, token }   // checks status=active
logout(User $user): void                       // revokes currentAccessToken()
sendResetLink(string $email): void
resetPassword(array $data): void
```

## Frontend auth store

```ts
useAuthStore.getState()  // → { user, token, hydrated, ... }
store.setAuth(user, token)  // → updates Zustand + writes cookie
store.clear()               // → clears Zustand + deletes cookie
store.hasRole('hr-manager')
store.hasPermission('viewAny employee')
```

## CRITICAL: proxy.ts (NOT middleware.ts)

```ts
// proxy.ts — Next.js 16 route protection
export function proxy(request: NextRequest) {
  const token = request.cookies.get('ems_token')?.value;
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  if (!token && !isPublic) return NextResponse.redirect('/login');
  if (token && isPublic) return NextResponse.redirect('/dashboard');
  return NextResponse.next();
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
```

## Demo credentials

| Email | Password | Role |
|---|---|---|
| admin@example.com | password | super-admin |
| employee@example.com | password | employee (Demo Employee) |
