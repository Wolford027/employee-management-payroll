import { Button } from "./button";

export function Pagination({
  page,
  lastPage,
  total,
  onChange,
}: {
  page: number;
  lastPage: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (lastPage <= 1) {
    return (
      <div className="flex items-center justify-between px-1 py-3 text-sm text-slate-500">
        <span>{total} result{total === 1 ? "" : "s"}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-1 py-3 text-sm text-slate-400">
      <span>
        Page {page} of {lastPage} · {total} total
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => onChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
