import { cn } from "@/lib/utils";

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg", className)}
      style={{ background: "rgba(255,255,255,0.08)", ...style }}
    />
  );
}

/** Replaces a table body while data is loading. Drop it inside a Card in place of <LoadingBlock />. */
export function TableSkeleton({
  cols = 5,
  rows = 8,
  hasPagination = false,
}: {
  cols?: number;
  rows?: number;
  hasPagination?: boolean;
}) {
  return (
    <div>
      {/* fake header row */}
      <div
        className="flex gap-4 px-4 py-3 mb-1 rounded-lg"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-3 flex-1"
            style={{ opacity: i === cols - 1 ? 0.35 : 0.55 }}
          />
        ))}
      </div>

      {/* fake data rows */}
      <div className="space-y-px">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 px-4 py-3.5 rounded-lg"
            style={{
              background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
              opacity: 1 - i * 0.06,
            }}
          >
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton
                key={j}
                className="h-3.5 flex-1"
                style={{
                  maxWidth: j === 0 ? "6rem" : undefined,
                  opacity: j === cols - 1 ? 0.5 : 0.7,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* fake pagination */}
      {hasPagination && (
        <div className="flex items-center justify-between pt-4 mt-1">
          <Skeleton className="h-3.5 w-40" style={{ opacity: 0.45 }} />
          <div className="flex gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-7 rounded-lg" style={{ opacity: 0.5 }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Skeleton for the payroll periods sidebar list. */
export function PeriodsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl p-3"
          style={{ border: "1px solid rgba(255,255,255,0.07)", opacity: 1 - i * 0.1 }}
        >
          <div className="flex justify-between mb-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" style={{ opacity: 0.6 }} />
          </div>
          <Skeleton className="h-3 w-28" style={{ opacity: 0.4 }} />
        </div>
      ))}
    </div>
  );
}

/** Full-page skeleton for the employee personal dashboard. */
export function EmployeeDashboardSkeleton() {
  return (
    <>
      <div className="flex items-start mb-6">
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-44" style={{ opacity: 0.6 }} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" style={{ opacity: 0.6 }} />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[7, 5].map((rows, i) => (
          <div
            key={i}
            className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Skeleton className="h-5 w-40 mb-5" />
            <div className="space-y-3">
              {Array.from({ length: rows }).map((_, j) => (
                <div key={j} className="flex justify-between items-center" style={{ opacity: 1 - j * 0.08 }}>
                  <Skeleton className="h-3.5 w-1/4" style={{ opacity: 0.6 }} />
                  <Skeleton className="h-3.5 w-1/3" style={{ opacity: 0.5 }} />
                  <Skeleton className="h-5 w-16 rounded-full" style={{ opacity: 0.5 }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** Full-page skeleton for the dashboard (replaces the early-return LoadingBlock). */
export function DashboardSkeleton() {
  return (
    <>
      {/* PageHeader */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-28" style={{ opacity: 0.6 }} />
        </div>
      </div>

      {/* 6 stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-24" style={{ opacity: 0.6 }} />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2 info cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[5, 4].map((rowCount, i) => (
          <div
            key={i}
            className="rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Skeleton className="h-5 w-44 mb-5" />
            <div className="space-y-3.5">
              {Array.from({ length: rowCount }).map((_, j) => (
                <div key={j} className="flex justify-between">
                  <Skeleton className="h-3.5 w-1/3" style={{ opacity: 0.6 }} />
                  <Skeleton className="h-3.5 w-1/4" style={{ opacity: 0.5 }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
