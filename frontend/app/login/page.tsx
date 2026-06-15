"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Suspense } from "react";
import { Eye, EyeOff, Zap } from "lucide-react";
import { useState } from "react";
import { authService } from "@/services/auth";
import { apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@example.com", password: "password" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => authService.login(values.email, values.password),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push(params.get("redirect") || "/dashboard");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Login failed")),
  });

  return (
    <div className="glass-strong rounded-2xl w-full max-w-md p-8">
      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
          <Zap className="w-7 h-7 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">EMS Payroll</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Sign in to your account
        </p>
      </div>

      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register("email")}
            className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 transition-all outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
            placeholder="you@example.com"
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              {...form.register("password")}
              className="w-full rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder-slate-400 transition-all outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: mutation.isPending
              ? "rgba(234,179,8,0.4)"
              : "linear-gradient(135deg, #eab308, #ca8a04)",
            color: "#0a1628",
            boxShadow: "0 4px 16px rgba(234,179,8,0.3)",
          }}
        >
          {mutation.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {/* Footer links */}
      <div className="mt-6 flex justify-between text-sm" style={{ color: "var(--muted)" }}>
        <Link
          href="/forgot-password"
          className="hover:text-blue-400 transition-colors"
        >
          Forgot password?
        </Link>
        <Link
          href="/register"
          className="hover:text-blue-400 transition-colors"
        >
          Create account
        </Link>
      </div>

      {/* Demo hint */}
      <p className="mt-6 text-center text-xs rounded-lg py-2 px-3"
        style={{
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.2)",
          color: "#93c5fd",
        }}>
        Demo: <span className="font-medium">admin@example.com</span> / <span className="font-medium">password</span>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
