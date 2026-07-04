import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <header className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--th-text)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[var(--th-text-muted)]">{description}</p>
        ) : null}
      </header>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
