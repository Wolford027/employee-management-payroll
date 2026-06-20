"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { authService } from "@/services/auth";
import { apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { AuthCard } from "@/components/auth/AuthCard";
import { RedirectingOverlay } from "@/components/auth/RedirectingOverlay";
import { Field } from "@/components/common/Field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  if (mutation.isSuccess) return <RedirectingOverlay />;

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
        <Field label="Email address" error={form.formState.errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            className="h-11"
            placeholder="you@example.com"
            {...form.register("email")}
          />
        </Field>

        <Field label="Password" error={form.formState.errors.password?.message}>
          <div className="relative">
            <Input
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              className="h-11 pr-11"
              placeholder="••••••••"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>

        <Button
          type="submit"
          variant="yellow"
          size="lg"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 flex justify-between text-sm text-slate-400">
        <Link href="/forgot-password" className="hover:text-blue-400 transition-colors">
          Forgot password?
        </Link>
        <Link href="/register" className="hover:text-blue-400 transition-colors">
          Create account
        </Link>
      </div>

      <p
        className="mt-6 text-center text-xs rounded-lg py-2 px-3"
        style={{
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.2)",
          color: "#93c5fd",
        }}
      >
        Demo: <span className="font-medium">admin@example.com</span> /{" "}
        <span className="font-medium">password</span>
      </p>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
