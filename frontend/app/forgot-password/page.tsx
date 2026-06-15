"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { authService } from "@/services/auth";
import { apiErrorMessage } from "@/lib/api";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (v: FormValues) => authService.forgotPassword(v.email),
    onSuccess: (res) => toast.success(res.message ?? "Reset link sent"),
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-strong rounded-2xl w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
            <Zap className="w-7 h-7 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
          <p className="mt-1 text-sm text-slate-400">We&apos;ll email you a reset link.</p>
        </div>

        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1.5">Email address</label>
            <input
              id="email"
              type="email"
              {...form.register("email")}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
              placeholder="you@example.com"
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.email.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-blue-950 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#eab308,#ca8a04)", boxShadow: "0 4px 16px rgba(234,179,8,0.3)" }}
          >
            {mutation.isPending ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
