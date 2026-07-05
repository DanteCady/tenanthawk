import Link from "next/link";
import { Lock } from "lucide-react";
import { getDashboardSnapshot } from "@/lib/dashboard/context";
import { buildCategoryTrend } from "@/lib/charts/category-trend";
import { CategoryTrendChart } from "@/components/app/CategoryTrendChart";
import { ShareReportPanel } from "@/components/app/ShareReportPanel";
import { ScanHistory } from "@/components/app/ScanHistory";
import { ExportMenu } from "@/components/app/ExportMenu";
import { ProUpgradeOptions } from "@/components/app/UpgradeButton";
import { isAnnualBillingConfigured } from "@/lib/billing/pricing";
import { timeAgo } from "@/lib/time";

export default async function ReportsPage() {
  const { scan, history, isPro, tenantLabel } = await getDashboardSnapshot();

  const annualAvailable = isAnnualBillingConfigured();

  if (!isPro) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reports</h1>
          <p className="text-sm text-slate-600">Exports, trends, and shareable links.</p>
        </div>
        <div className="surface-card flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Lock className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-slate-900">Reports are a Pro feature</p>
          <p className="mt-2 max-w-sm text-sm text-slate-600">
            Export PDF, Excel, and CSV, share read-only links with leadership, and track
            category score trends over time.
          </p>
          <div className="mt-6 w-full max-w-sm">
            <ProUpgradeOptions
              annualAvailable={annualAvailable}
              compact
              buttonClassName="btn-primary w-full px-5 py-2.5 text-sm shadow-none hover:shadow-md"
            />
          </div>
        </div>
      </div>
    );
  }

  const categoryTrend = buildCategoryTrend([...history].reverse());

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reports</h1>
          <p className="text-sm text-slate-600">
            {tenantLabel} · last scan {timeAgo(scan.started_at)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportMenu isPro />
          <Link
            href="/dashboard/report"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
          >
            Print report
          </Link>
        </div>
      </div>

      <ShareReportPanel />

      <div className="surface-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Category score trends</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Scores and changes across your recent scans.
        </p>
        <div className="mt-5">
          <CategoryTrendChart points={categoryTrend} />
        </div>
      </div>

      {history.length > 0 && <ScanHistory scans={history} />}

      <p className="text-xs text-slate-500">
        Full print layout with branding at{" "}
        <Link href="/dashboard/report" className="font-medium text-blue-600 hover:text-blue-700">
          /dashboard/report
        </Link>
        .
      </p>
    </div>
  );
}
