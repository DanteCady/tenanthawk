"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Building2, Loader2, Plus } from "lucide-react";
import { ScoreRing } from "@/components/app/ScoreRing";
import { GradeBadge } from "@/components/app/GradeBadge";
import { timeAgo } from "@/lib/time";
import { formatUsd } from "@/lib/format";
import type { ClientPortfolioRow } from "@/lib/connection/portfolio";

export function MspOverviewDashboard({
  overview,
}: {
  overview: {
    clientCount: number;
    avgScore: number | null;
    totalOpenHigh: number;
    totalRecoverableUsd: number;
    staleCount: number;
    unhealthyCount: number;
    attentionClients: ClientPortfolioRow[];
    portfolio: ClientPortfolioRow[];
  };
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            MSP overview
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Roll-up across {overview.clientCount} workspaces — open a workspace for tenant detail.
          </p>
        </div>
        <Link
          href="/dashboard/workspaces"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
        >
          <Building2 className="h-4 w-4" />
          All workspaces
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface-highlight flex items-center gap-4 p-4 sm:col-span-2 xl:col-span-1">
          {overview.avgScore != null ? (
            <ScoreRing score={overview.avgScore} size={88} />
          ) : (
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-slate-100 text-sm text-slate-500">
              —
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-slate-900">Avg. health score</p>
            <p className="text-xs text-slate-500">Across scanned workspaces</p>
          </div>
        </div>
        <StatCard label="Workspaces" value={String(overview.clientCount)} />
        <StatCard label="Open high findings" value={String(overview.totalOpenHigh)} />
        <StatCard
          label="Recoverable / mo"
          value={`$${formatUsd(overview.totalRecoverableUsd)}`}
          accent
        />
      </div>

      {(overview.staleCount > 0 || overview.unhealthyCount > 0) && (
        <div className="flex flex-wrap gap-2">
          {overview.staleCount > 0 && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
              {overview.staleCount} stale scan{overview.staleCount === 1 ? "" : "s"}
            </span>
          )}
          {overview.unhealthyCount > 0 && (
            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-800">
              {overview.unhealthyCount} connection issue
              {overview.unhealthyCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
      )}

      {overview.attentionClients.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Needs attention</h2>
            <Link
              href="/dashboard/workspaces"
              className="text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              Manage workspaces
            </Link>
          </div>
          <div className="grid gap-3">
            {overview.attentionClients.map((client) => (
              <AttentionRow key={client.id} client={client} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">All workspaces</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {overview.portfolio.map((client) => (
            <WorkspaceMiniCard key={client.id} client={client} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="surface-card p-4">
      <p className={`text-2xl font-semibold ${accent ? "text-green-700" : "text-slate-900"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-600">{label}</p>
    </div>
  );
}

function AttentionRow({ client }: { client: ClientPortfolioRow }) {
  return (
    <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="font-medium text-slate-900">{client.label}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {client.openHigh} high · ${formatUsd(client.recoverableUsd)}/mo recoverable
          {client.stale ? " · stale scan" : ""}
        </p>
      </div>
      <OpenWorkspaceButton connectionId={client.id} label="Open" compact />
    </div>
  );
}

function WorkspaceMiniCard({ client }: { client: ClientPortfolioRow }) {
  return (
    <div className="surface-card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{client.label}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {client.lastScanAt ? `Scanned ${timeAgo(client.lastScanAt)}` : "Not scanned"}
          </p>
        </div>
        {client.score != null ? (
          <GradeBadge letter={client.grade ?? "—"} size="sm" />
        ) : null}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{client.openHigh} high</span>
        <span className="font-medium text-green-700">
          ${formatUsd(client.recoverableUsd)}/mo
        </span>
      </div>
      <OpenWorkspaceButton connectionId={client.id} label="Open workspace" />
    </div>
  );
}

export function OpenWorkspaceButton({
  connectionId,
  label,
  compact,
}: {
  connectionId: string;
  label: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    await fetch("/api/connection/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId }),
    });
    router.push(`/dashboard/client?connection=${connectionId}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={loading}
      className={
        compact
          ? "inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          : "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
      }
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
      {!compact && !loading ? <ArrowRight className="h-4 w-4" /> : null}
    </button>
  );
}
