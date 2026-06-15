"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { authService } from "@/services/auth";
import { apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });
type FormValues = z.infer<typeof schema>;

const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500";
const inputStyle = { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" };

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => authService.register(values),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Account created!");
      router.push("/dashboard");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Registration failed")),
  });

  const field = (name: keyof FormValues, label: string, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-blue-100 mb-1.5">{label}</label>
      <input id={name} type={type} {...form.register(name)} className={inputCls} style={inputStyle} />
      {form.formState.errors[name] && (
        <p className="mt-1 text-xs text-red-400">{form.formState.errors[name]?.message}</p>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-strong rounded-2xl w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
            <Zap className="w-7 h-7 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create an account</h1>
          <p className="mt-1 text-sm text-slate-400">New accounts get the Employee role by default.</p>
        </div>

        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          {field("name", "Full name")}
          {field("email", "Email address", "email")}
          {field("password", "Password", "password")}
          {field("password_confirmation", "Confirm password", "password")}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-blue-950 disabled:opacity-60 mt-2"
            style={{ background: "linear-gradient(135deg,#eab308,#ca8a04)", boxShadow: "0 4px 16px rgba(234,179,8,0.3)" }}
          >
            {mutation.isPending ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
