import { Spinner } from "@/components/ui/spinner";

/**
 * Full-screen loading state shown right after a successful auth action
 * (login/register/password-set) while we navigate into the app. Covers the
 * gap between "request succeeded" and the dashboard actually mounting, so no
 * intermediate frame is visible.
 */
export function RedirectingOverlay({ label = "Taking you to your dashboard…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center gap-3 text-slate-400 text-sm">
      <Spinner className="h-5 w-5" />
      {label}
    </div>
  );
}
