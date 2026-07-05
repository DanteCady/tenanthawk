import { History, Lock } from "lucide-react";
import { getDashboardSnapshot } from "@/lib/dashboard/context";
import { getJournalEntries } from "@/lib/journal/queries";
import { JournalTimeline } from "@/components/app/journal/JournalTimeline";
import { ProUpgradeOptions } from "@/components/app/UpgradeButton";
import { isAnnualBillingConfigured } from "@/lib/billing/pricing";
import { timeAgo } from "@/lib/time";

export default async function JournalPage() {
  const { conn, scan, isPro, tenantLabel } = await getDashboardSnapshot();

  if (!isPro) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Journal</h1>
          <p className="text-sm text-slate-600">
            Every config change in your tenant - who, what, and when.
          </p>
        </div>
        <div className="surface-card flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Lock className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-slate-900">The Journal is a Pro feature</p>
          <p className="mt-2 max-w-sm text-sm text-slate-600">
            Tenant Hawk records Conditional Access, named location, authentication, and Intune
            policy changes on every scan - with before/after diffs and who made them. Your
            history is already being captured; upgrade to see it.
          </p>
          <div className="mt-6 w-full max-w-sm">
            <ProUpgradeOptions
              annualAvailable={isAnnualBillingConfigured()}
              compact
              buttonClassName="btn-primary w-full px-5 py-2.5 text-sm shadow-none hover:shadow-md"
            />
          </div>
        </div>
      </div>
    );
  }

  const entries = await getJournalEntries(conn.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Journal</h1>
        <p className="text-sm text-slate-600">
          {tenantLabel} · last scan {timeAgo(scan.started_at)} · {entries.length} recorded change
          {entries.length === 1 ? "" : "s"}
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="surface-card flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <History className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-slate-900">Baseline captured - watching for changes</p>
          <p className="mt-2 max-w-sm text-sm text-slate-600">
            Your tenant&apos;s current configuration is recorded. From the next scan onward,
            any change to Conditional Access, named locations, authentication methods, or
            Intune policies shows up here with a before/after diff.
          </p>
        </div>
      ) : (
        <JournalTimeline entries={entries} />
      )}

      <p className="text-xs text-slate-500">
        The journal records changes detected between scans. Actors are resolved from the Entra
        audit log when available.
      </p>
    </div>
  );
}
