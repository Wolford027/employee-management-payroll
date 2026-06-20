"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { apiErrorMessage } from "@/lib/api";
import { AuthCard } from "@/components/auth/AuthCard";
import { Field } from "@/components/common/Field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });
type FormValues = z.infer<typeof schema>;

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (v: FormValues) =>
      authService.resetPassword({ token, email, password: v.password, password_confirmation: v.password_confirmation }),
    onSuccess: () => {
      toast.success("Password reset. Please sign in.");
      router.push("/login");
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <AuthCard title="Reset password" subtitle={email ? `For ${email}` : "Set a new password"}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <Field label="New password" error={form.formState.errors.password?.message}>
          <Input type="password" autoComplete="new-password" className="h-11" {...form.register("password")} />
        </Field>
        <Field label="Confirm password" error={form.formState.errors.password_confirmation?.message}>
          <Input type="password" autoComplete="new-password" className="h-11" {...form.register("password_confirmation")} />
        </Field>
        <Button
          type="submit"
          variant="yellow"
          size="lg"
          className="w-full mt-2"
          disabled={mutation.isPending || !token}
        >
          {mutation.isPending ? "Resetting…" : "Reset password"}
        </Button>
        {!token && <p className="text-xs text-red-400 text-center">Missing reset token in URL.</p>}
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
