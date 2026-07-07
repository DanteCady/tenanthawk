import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { requireVerifiedSession } from "@/lib/session";
import { getActiveConnection } from "@/lib/queries";
import { getClientPortfolio } from "@/lib/connection/portfolio";
import { getMspConsoleAccess } from "@/lib/entitlements/msp-console";
import { getEnterpriseClientLimit } from "@/lib/billing/enterprise-limits";
import { connectionLabel } from "@/lib/connection/label";
import { GradeBadge } from "@/components/app/GradeBadge";
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
            Plan limit reached -{" "}
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

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium text-right">Score</th>
                <th className="px-5 py-3 font-medium text-right">High</th>
                <th className="px-5 py-3 font-medium text-right">Recoverable / mo</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((client) => {
                const isActive = client.id === activeId;
                return (
                  <tr
                    key={client.id}
                    className={`border-b border-slate-100 last:border-0 ${
                      isActive ? "bg-blue-50/50" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="font-medium text-slate-900">{client.label}</p>
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
                        {client.mode === "live" && client.reportNamesConcealed === true ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-medium text-amber-900">
                            Report names hidden
                          </span>
                        ) : null}
                        {client.mode === "live" && client.reportNamesConcealed === false ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-medium text-emerald-900">
                            Report names visible
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {client.lastScanAt
                          ? `Last scan ${timeAgo(client.lastScanAt)}`
                          : "Not scanned yet"}
                        {client.stale && client.lastScanAt ? " · stale" : ""}
                      </p>
                    </td>

                    <td className="px-5 py-3 text-right">
                      {client.score != null ? (
                        <div className="inline-flex items-center justify-end gap-2">
                          <span className="font-semibold tabular-nums text-slate-900">
                            {client.score}
                          </span>
                          <GradeBadge letter={client.grade ?? "-"} size="sm" />
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-slate-900">
                      {client.openHigh}
                    </td>

                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-green-700">
                      {formatUsd(client.recoverableUsd)}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {activeConn ? (
        <p className="text-center text-xs text-slate-500">
          Selected client: {connectionLabel(activeConn)} - findings and exports use this
          tenant until you switch.
        </p>
      ) : null}
    </div>
  );
}
