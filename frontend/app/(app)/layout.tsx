"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth, useAuthBootstrap } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, hydrated, user } = useAuth();
  useAuthBootstrap();

  useEffect(() => {
    if (!hydrated) return;
    if (!token) { router.replace("/login"); return; }
    if (user?.force_password_change && pathname !== "/change-password") {
      router.replace("/change-password");
    }
  }, [hydrated, token, user, pathname, router]);

  if (!hydrated || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-slate-400 text-sm">
        <Spinner className="h-5 w-5" />
        Loading session…
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
