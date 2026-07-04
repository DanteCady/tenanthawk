"use client";

export function SidebarTooltip({
  label,
  enabled,
  children,
}: {
  label: string;
  enabled: boolean;
  children: React.ReactNode;
}) {
  if (!enabled) return <>{children}</>;

  return (
    <div className="sidebar-tooltip-wrap group/tooltip relative">
      {children}
      <span className="sidebar-tooltip" role="tooltip">
        {label}
      </span>
    </div>
  );
}
