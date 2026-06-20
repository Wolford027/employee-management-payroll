"use client";

import Link from "next/link";
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
    <AuthCard title="Forgot password?" subtitle="We'll email you a reset link.">
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
        <Button
          type="submit"
          variant="yellow"
          size="lg"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
          ← Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
