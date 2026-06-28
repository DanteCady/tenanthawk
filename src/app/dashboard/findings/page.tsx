import { getDashboardSnapshot } from "@/lib/dashboard/context";
import { FindingsTable } from "@/components/app/FindingsTable";
import { isAnnualBillingConfigured } from "@/lib/billing/pricing";
import { timeAgo } from "@/lib/time";

export default async function FindingsPage() {
  const { scan, summary, isPro, dtos, tenantLabel } = await getDashboardSnapshot();
  const annualAvailable = isAnnualBillingConfigured();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Findings</h1>
        <p className="text-sm text-slate-600">
          {tenantLabel} · last scan {timeAgo(scan.started_at)}
        </p>
      </div>

      {isPro ? (
        <FindingsTable findings={dtos} />
      ) : (
        <FindingsTable lockedCount={summary.total} annualAvailable={annualAvailable} />
      )}
    </div>
  );
}
