import { api } from "@/lib/api";
import type { AuthResponse, User } from "@/types";

export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data),

  register: (payload: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post<AuthResponse>("/auth/register", payload).then((r) => r.data),

  logout: () => api.post("/auth/logout").then((r) => r.data),

  me: () => api.get<{ data: User }>("/auth/me").then((r) => r.data.data),

  updateProfile: (payload: Record<string, unknown>) =>
    api.put<{ data: User }>("/auth/profile", payload).then((r) => r.data.data),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (payload: { token: string; email: string; password: string; password_confirmation: string }) =>
    api.post<{ message: string }>("/auth/reset-password", payload).then((r) => r.data),
};
