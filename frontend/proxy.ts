import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16 renamed Middleware to Proxy. Performs optimistic auth gating
// based on the presence of the auth token cookie (full authz is enforced by the API).

// Anyone can visit these — authenticated or not. No redirects applied.
const FULLY_PUBLIC = ["/", "/pricing", "/about"];

// Unauthenticated users can visit; authenticated users get redirected to dashboard.
const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

const TOKEN_COOKIE = "ems_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  const isFullyPublic = FULLY_PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Landing / marketing pages — always pass through.
  if (isFullyPublic) return NextResponse.next();

  // Authenticated user hitting login/register → send to dashboard.
  if (token && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Unauthenticated user hitting a protected page → send to login.
  if (!token && !isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)"],
};
