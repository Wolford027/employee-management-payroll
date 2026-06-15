export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
