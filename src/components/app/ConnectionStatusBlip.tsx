"use client";

import Link from "next/link";
import type { ConnectionHealth } from "@/lib/connect/health";
import { formatCheckedAt } from "@/lib/time";
import { Tooltip } from "@/components/ui/Tooltip";

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

function ConnectionTooltipContent({
  health,
  tenantLabel,
}: {
  health: ConnectionHealth;
  tenantLabel?: string | null;
}) {
  return (
    <span className="block text-left">
      {tenantLabel ? (
        <span className="app-tooltip-title block">{tenantLabel}</span>
      ) : null}
      <span className="app-tooltip-detail block">{health.label}</span>
      {health.detail && health.detail !== health.label ? (
        <span className="app-tooltip-detail block">{health.detail}</span>
      ) : null}
      <span className="app-tooltip-meta block">
        Checked {formatCheckedAt(health.checkedAt)}
      </span>
    </span>
  );
}

export function ConnectionStatusBlip({
  health,
  tenantLabel,
}: {
  health: ConnectionHealth;
  tenantLabel?: string | null;
}) {
  const style = STATUS_STYLE[health.status];

  const inner = (
    <>
      <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} aria-hidden />
      <span className="hidden sm:inline">{health.label}</span>
    </>
  );

  const className = `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${style.chip} ${style.text}`;

  const tooltip = (
    <ConnectionTooltipContent health={health} tenantLabel={tenantLabel} />
  );

  const ariaLabel = [tenantLabel, health.label, health.detail]
    .filter(Boolean)
    .join(" · ");

  if (health.reconnect) {
    return (
      <Tooltip content={tooltip} placement="bottom">
        <Link
          href="/api/connect/start"
          className={`${className} transition-opacity hover:opacity-90`}
          aria-label={ariaLabel}
        >
          {inner}
        </Link>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={tooltip} placement="bottom">
      <span className={className} aria-label={ariaLabel} tabIndex={0}>
        {inner}
      </span>
    </Tooltip>
  );
}
