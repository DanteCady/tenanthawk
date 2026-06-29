import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, FileText, Plus } from "lucide-react";
import { requireVerifiedSession } from "@/lib/session";
import { getActiveConnection } from "@/lib/queries";
import { getClientPortfolio } from "@/lib/connection/portfolio";
import { getMspConsoleAccess } from "@/lib/entitlements/msp-console";
import { getEnterpriseClientLimit } from "@/lib/billing/enterprise-limits";
import { connectionLabel } from "@/lib/connection/label";
import { ScoreRing } from "@/components/app/ScoreRing";
import { timeAgo } from "@/lib/time";
import { formatUsd } from "@/lib/format";
import { OpenClientButton } from "@/components/dashboard/MspOverviewDashboard";
import { ClientRescanButton } from "@/components/dashboard/ClientRescanButton";
import { EnterpriseConsoleUpsell } from "@/components/dashboard/EnterpriseConsoleUpsell";

export default async function ClientsPage() {
  const session = await requireVerifiedSession();
  const mspAccess = await getMspConsoleAccess(session.user.id, session.user.email);
  const clientLimit = await getEnterpriseClientLimit(session.user.id, session.user.email);

  if (!mspAccess.entitled) {
    return <EnterpriseConsoleUpsell />;
  }

  if (mspAccess.connectionCount <= 1) {
    redirect("/dashboard");
  }

  const portfolio = await getClientPortfolio(session.user.id);
  const activeConn = await getActiveConnection(session.user.id);
  const activeId = activeConn?.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Clients
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Each client is a connected Microsoft 365 tenant. {clientLimit.count} of{" "}
            {clientLimit.cap} included on your plan.
          </p>
        </div>
        {clientLimit.canAdd ? (
          <Link
            href="/onboarding?mode=add-client"
            className="btn-primary inline-flex items-center gap-2 text-sm shadow-none hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add client
          </Link>
        ) : (
          <p className="text-sm text-amber-800">
            Plan limit reached —{" "}
            <a
              href="mailto:support@tenanthawk.io?subject=Enterprise%20volume%20pricing"
              className="font-medium text-violet-700 hover:text-violet-800"
            >
              contact support
            </a>{" "}
            for more clients.
          </p>
        )}
      </div>

      <div className="grid gap-4">
        {portfolio.map((client) => {
          const isActive = client.id === activeId;
          return (
            <div
              key={client.id}
              className={`surface-card p-5 ${
                isActive ? "ring-2 ring-blue-200 ring-offset-2" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-slate-900">
                        {client.label}
                      </p>
                      {isActive ? (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-blue-800">
                          Selected
                        </span>
                      ) : null}
                      <span
                        className={
                          client.mode === "live"
                            ? "rounded-full border border-[var(--th-brand-muted-border)] bg-[var(--th-brand-muted)] px-2 py-0.5 text-[0.65rem] font-medium text-[var(--th-brand-text)]"
                            : "badge-free text-[0.65rem]"
                        }
                      >
                        {client.mode === "live" ? "Live" : "Demo"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {client.lastScanAt
                        ? `Last scan ${timeAgo(client.lastScanAt)}`
                        : "Not scanned yet"}
                      {client.stale && client.lastScanAt ? " · stale" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  {client.score != null ? (
                    <ScoreRing score={client.score} size={52} />
                  ) : (
                    <span className="text-sm text-slate-500">No scan</span>
                  )}

                  <div className="text-right text-sm">
                    <p className="font-semibold text-slate-900">{client.openHigh} high</p>
                    <p className="text-slate-500">open findings</p>
                  </div>

                  <div className="text-right text-sm">
                    <p className="font-semibold text-green-700">
                      {formatUsd(client.recoverableUsd)}
                    </p>
                    <p className="text-slate-500">recoverable / mo</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <ClientRescanButton connectionId={client.id} compact />
                    {client.score != null ? (
                      <Link
                        href={`/dashboard/client/scorecard?connection=${client.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Scorecard
                      </Link>
                    ) : null}
                    <OpenClientButton
                      connectionId={client.id}
                      label={isActive ? "Open" : "Select & open"}
                      compact
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeConn ? (
        <p className="text-center text-xs text-slate-500">
          Selected client: {connectionLabel(activeConn)} — findings and exports use this
          tenant until you switch.
        </p>
      ) : null}
    </div>
  );
}
