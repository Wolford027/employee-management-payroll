"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { AuthCard } from "@/components/auth/AuthCard";
import { RedirectingOverlay } from "@/components/auth/RedirectingOverlay";
import { Field } from "@/components/common/Field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    company_name: z.string().min(2, "Company name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type FormValues = z.infer<typeof schema>;

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

  if (mutation.isSuccess) return <RedirectingOverlay />;

  return (
    <AuthCard
      title="Create your workspace"
      subtitle="One account for you and your whole team."
    >
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-4"
      >
        <Field label="Your name" error={form.formState.errors.name?.message}>
          <Input type="text" autoComplete="name" className="h-11" {...form.register("name")} />
        </Field>
        <Field
          label="Company name"
          error={form.formState.errors.company_name?.message}
        >
          <Input
            type="text"
            autoComplete="organization"
            className="h-11"
            placeholder="Acme Corp"
            {...form.register("company_name")}
          />
        </Field>
        <Field label="Work email" error={form.formState.errors.email?.message}>
          <Input type="email" autoComplete="email" className="h-11" {...form.register("email")} />
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            className="h-11"
            {...form.register("password")}
          />
        </Field>
        <Field
          label="Confirm password"
          error={form.formState.errors.password_confirmation?.message}
        >
          <Input
            type="password"
            autoComplete="new-password"
            className="h-11"
            {...form.register("password_confirmation")}
          />
        </Field>
        <Button
          type="submit"
          variant="yellow"
          size="lg"
          className="w-full mt-2"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Creating…" : "Create workspace"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
