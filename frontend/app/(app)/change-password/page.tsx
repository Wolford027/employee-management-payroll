"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";
import { apiErrorMessage } from "@/lib/api";
import { RedirectingOverlay } from "@/components/auth/RedirectingOverlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      const updated = await authService.updateProfile({ password, password_confirmation: confirm });
      setUser(updated);
      toast.success("Password updated. Welcome!");
      setDone(true);
      router.replace("/dashboard");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  if (done) return <RedirectingOverlay />;

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{
          background: "rgba(15,34,72,0.85)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
          >
            <KeyRound className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set your password</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Your account uses a temporary password. Choose a new one to continue.
          </p>
        </div>

        {/* Requirements badge */}
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 mb-6 text-sm"
          style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: "#fcd34d" }} />
          <span className="text-slate-300">Must be at least 8 characters.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField
            id="new-password"
            label="New password"
            value={password}
            onChange={setPassword}
          />
          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            value={confirm}
            onChange={setConfirm}
          />

          <Button
            type="submit"
            variant="yellow"
            className="w-full"
            disabled={pending || !password || !confirm}
          >
            {pending ? "Saving…" : "Set password & continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
