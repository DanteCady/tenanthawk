import Link from "next/link";
import type { ConnectionHealth } from "@/lib/connect/health";
import { formatCheckedAt } from "@/lib/time";

const STATUS_STYLE: Record<
  ConnectionHealth["status"],
  { dot: string; chip: string; text: string }
> = {
  connected: {
    dot: "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]",
    chip: "border-[color-mix(in_srgb,#34d399_35%,var(--th-border))] bg-[color-mix(in_srgb,#34d399_12%,var(--th-surface))]",
    text: "text-emerald-600",
  },
  demo: {
    dot: "bg-[var(--th-brand)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--th-brand)_25%,transparent)]",
    chip: "border-[var(--th-brand-muted-border)] bg-[var(--th-brand-muted)]",
    text: "text-[var(--th-brand-text)]",
  },
  app_removed: {
    dot: "bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.25)]",
    chip: "border-[color-mix(in_srgb,#ef4444_35%,var(--th-border))] bg-[color-mix(in_srgb,#ef4444_12%,var(--th-surface))]",
    text: "text-red-600",
  },
  consent_revoked: {
    dot: "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.25)]",
    chip: "border-[color-mix(in_srgb,#f59e0b_35%,var(--th-border))] bg-[color-mix(in_srgb,#f59e0b_12%,var(--th-surface))]",
    text: "text-amber-700",
  },
  error: {
    dot: "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.25)]",
    chip: "border-[color-mix(in_srgb,#f59e0b_35%,var(--th-border))] bg-[color-mix(in_srgb,#f59e0b_12%,var(--th-surface))]",
    text: "text-amber-700",
  },
};

export function ConnectionStatusBlip({
  health,
  tenantLabel,
}: {
  health: ConnectionHealth;
  tenantLabel?: string | null;
}) {
  const style = STATUS_STYLE[health.status];
  const title = [tenantLabel, health.detail, `Checked ${formatCheckedAt(health.checkedAt)}`]
    .filter(Boolean)
    .join(" · ");

  const inner = (
    <>
      <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} aria-hidden />
      <span className="hidden sm:inline">{health.label}</span>
    </>
  );

  const className = `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${style.chip} ${style.text}`;

  if (health.reconnect) {
    return (
      <Link
        href="/api/connect/start"
        className={`${className} transition-opacity hover:opacity-90`}
        title={title}
      >
        {inner}
      </Link>
    );
  }

  return (
    <span className={className} title={title}>
      {inner}
    </span>
  );
}
