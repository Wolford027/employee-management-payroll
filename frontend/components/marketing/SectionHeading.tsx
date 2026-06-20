import { cn } from "@/lib/utils";

/**
 * Centered marketing section heading: optional eyebrow label, title, and subtitle.
 * Used by every marketing section so spacing/typography stay consistent.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "center" ? "text-center mx-auto max-w-2xl" : "text-left max-w-xl",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-400 leading-relaxed">{subtitle}</p>}
    </div>
  );
}
