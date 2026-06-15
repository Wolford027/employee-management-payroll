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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>{email ? `For ${email}` : "Set a new password"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" {...form.register("password")} />
            {form.formState.errors.password && (
              <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password_confirmation">Confirm password</Label>
            <Input id="password_confirmation" type="password" {...form.register("password_confirmation")} />
            {form.formState.errors.password_confirmation && (
              <p className="text-xs text-red-600">{form.formState.errors.password_confirmation.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending || !token}>
            {mutation.isPending ? "Resetting..." : "Reset password"}
          </Button>
          {!token && <p className="text-xs text-red-600">Missing reset token in URL.</p>}
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
