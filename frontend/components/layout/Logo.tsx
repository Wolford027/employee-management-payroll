import Link from "next/link";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const MARK: Record<Size, string> = {
  sm: "w-8 h-8 rounded-lg",
  md: "w-9 h-9 rounded-xl",
  lg: "w-14 h-14 rounded-2xl",
};

const ICON: Record<Size, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-7 h-7",
};

const TEXT: Record<Size, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

/**
 * The EMS Payroll brand mark — a yellow lightning bolt on a blue gradient tile.
 * Single source of truth for the logo used across nav, sidebar, auth, and footer.
 */
export function Logo({
  size = "sm",
  showText = true,
  href = "/",
  className,
}: {
  size?: Size;
  showText?: boolean;
  href?: string | null;
  className?: string;
}) {
  const inner = (
    <>
      <div
        className={cn("flex items-center justify-center shrink-0", MARK[size])}
        style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
      >
        <Zap className={cn("text-yellow-400", ICON[size])} />
      </div>
      {showText && (
        <span className={cn("font-bold text-white", TEXT[size])}>EMS Payroll</span>
      )}
    </>
  );

  if (href === null) {
    return <div className={cn("flex items-center gap-2.5", className)}>{inner}</div>;
  }

  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      {inner}
    </Link>
  );
}
