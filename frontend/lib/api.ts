import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/stores/authStore";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Attach bearer token from the auth store on every request.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear auth and bounce to login (client-side only).
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const { clear } = useAuthStore.getState();
      clear();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Normalize Laravel validation / error messages.
export function apiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (first?.[0]) return first[0];
    }
    if (data?.message) return data.message;
  }
  return fallback;
}
