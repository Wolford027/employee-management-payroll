// Lightweight cookie helpers so the Proxy (middleware) can read the auth token
// for optimistic route protection. Token is non-HttpOnly by design (SPA token auth).

const TOKEN_COOKIE = "ems_token";

export function setTokenCookie(token: string) {
  if (typeof document === "undefined") return;
  // 7 days; SameSite=Lax is fine for same-site dev.
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export const TOKEN_COOKIE_NAME = TOKEN_COOKIE;
