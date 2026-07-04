import { getDashboardSnapshot } from "@/lib/dashboard/context";
import { FindingsTable } from "@/components/app/FindingsTable";
import { isAnnualBillingConfigured } from "@/lib/billing/pricing";
import { timeAgo } from "@/lib/time";

const SEV_RANK = { high: 0, medium: 1, low: 2 } as const;

export default async function FindingsPage() {
  const { scan, summary, isPro, dtos, tenantLabel } = await getDashboardSnapshot();
  const annualAvailable = isAnnualBillingConfigured();

  const lockedPreview = {
    total: summary.total,
    high: summary.high,
    usd: summary.usd,
    items: [...dtos]
      .sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity])
      .map(({ id, severity, category, title }) => ({ id, severity, category, title })),
  };

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
        <FindingsTable lockedPreview={lockedPreview} annualAvailable={annualAvailable} />
      )}
    </div>
  );
}
