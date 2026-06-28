import Link from "next/link";
import type { ConnectionHealth } from "@/lib/connect/health";
import { formatCheckedAt } from "@/lib/time";

const STATUS_STYLE: Record<
  ConnectionHealth["status"],
  { dot: string; chip: string; text: string }
> = {
  connected: {
    dot: "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]",
    chip: "border-emerald-200 bg-emerald-50",
    text: "text-emerald-800",
  },
  demo: {
    dot: "bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]",
    chip: "border-blue-200 bg-blue-50",
    text: "text-blue-800",
  },
  app_removed: {
    dot: "bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.25)]",
    chip: "border-red-200 bg-red-50",
    text: "text-red-800",
  },
  consent_revoked: {
    dot: "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.25)]",
    chip: "border-amber-200 bg-amber-50",
    text: "text-amber-900",
  },
  error: {
    dot: "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.25)]",
    chip: "border-amber-200 bg-amber-50",
    text: "text-amber-900",
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
