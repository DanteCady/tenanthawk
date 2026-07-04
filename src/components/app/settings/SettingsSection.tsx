import type { ReactNode } from "react";

export function SettingsSection({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="surface-card scroll-mt-24 p-6">
      <h2 className="text-lg font-semibold text-[var(--th-text)]">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-[var(--th-text-muted)]">{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
