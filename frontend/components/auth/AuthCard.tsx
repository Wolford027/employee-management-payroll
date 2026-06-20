import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

/**
 * Shared shell for the auth screens (login, register, forgot/reset password):
 * centered glass card with the brand mark, title, and subtitle.
 */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-strong rounded-2xl w-full max-w-md p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" aria-label="Home">
            <Logo size="lg" showText={false} href={null} />
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
