"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";

/** Access current auth state + role/permission helpers. */
export function useAuth() {
  const { user, token, hydrated, hasRole, hasPermission } = useAuthStore();
  return { user, token, hydrated, isAuthenticated: !!token, hasRole, hasPermission };
}

/**
 * Bootstrap: when we have a token but the user object is stale/missing,
 * refresh it from /auth/me. Used by the protected layout.
 *
 * Only runs when `user` is absent (token-only session, e.g. a corrupted/partial
 * persisted store) — login/register already return a full user object, so
 * re-running this on every mount would let a *different* account's cached
 * `/auth/me` response (the query client isn't cleared between sessions other
 * than on logout) briefly clobber the freshly-set, correct one.
 */
export function useAuthBootstrap() {
  const { token, hydrated, user, setUser, clear } = useAuthStore();

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.me,
    enabled: hydrated && !!token && !user,
    retry: false,
  });

  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);

  useEffect(() => {
    if (query.isError) clear();
  }, [query.isError, clear]);

  return query;
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clear = useAuthStore((s) => s.clear);

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clear();
      // Drop every cached query (dashboard stats, employee lists, /me, ...) so
      // the next login can't briefly render the previous account's data.
      queryClient.clear();
      router.push("/login");
    },
  });
}
