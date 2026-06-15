"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
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
 */
export function useAuthBootstrap() {
  const { token, hydrated, setUser, clear } = useAuthStore();

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.me,
    enabled: hydrated && !!token,
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
  const clear = useAuthStore((s) => s.clear);

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clear();
      router.push("/login");
    },
  });
}
