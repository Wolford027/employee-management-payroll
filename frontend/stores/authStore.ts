import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "@/types";
import { clearTokenCookie, setTokenCookie } from "@/lib/cookies";

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
  setHydrated: () => void;
  hasRole: (...roles: Role[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hydrated: false,

      setAuth: (user, token) => {
        setTokenCookie(token);
        set({ user, token });
      },

      setUser: (user) => set({ user }),

      clear: () => {
        clearTokenCookie();
        set({ user: null, token: null });
      },

      setHydrated: () => set({ hydrated: true }),

      hasRole: (...roles) => {
        const user = get().user;
        return !!user && roles.some((r) => user.roles.includes(r));
      },

      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        if (user.roles.includes("super-admin")) return true;
        return user.permissions.includes(permission);
      },
    }),
    {
      name: "ems-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        // Re-sync the cookie from persisted token after rehydration.
        if (state?.token) setTokenCookie(state.token);
        state?.setHydrated();
      },
    },
  ),
);
