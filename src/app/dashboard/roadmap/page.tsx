import Link from "next/link";
import { Lock } from "lucide-react";
import { getDashboardSnapshot } from "@/lib/dashboard/context";
import { RemediationRoadmap } from "@/components/app/RemediationRoadmap";
import { ProUpgradeOptions } from "@/components/app/UpgradeButton";
import { isAnnualBillingConfigured } from "@/lib/billing/pricing";
import {
  buildRoadmapStats,
  buildRoadmapStops,
  type RoadmapFindingInput,
} from "@/lib/remediation/roadmap";
import { timeAgo } from "@/lib/time";

export default async function RoadmapPage() {
  const { scan, dtos, isPro, tenantLabel } = await getDashboardSnapshot();
  const annualAvailable = isAnnualBillingConfigured();

  if (!isPro) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Remediation roadmap
          </h1>
          <p className="text-sm text-slate-600">
            A prioritized path through your open findings.
          </p>
        </div>
        <div className="surface-card flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Lock className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-slate-900">
            Remediation roadmap is a Pro feature
          </p>
          <p className="mt-2 max-w-sm text-sm text-slate-600">
            See a step-by-step route through your findings, ordered by urgency and effort,
            with progress tracking as you resolve each item.
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

  const inputs: RoadmapFindingInput[] = dtos.map((d) => ({
    id: d.id,
    checkId: d.checkId,
    category: d.category,
    severity: d.severity,
    title: d.title,
    description: d.description,
    remediation: d.remediation,
    entityRef: d.entityRef,
    impact: d.impact,
    remediationEnriched: d.remediationEnriched,
    tracking: d.tracking,
  }));

  const stops = buildRoadmapStops(inputs);
  const stats = buildRoadmapStats(stops);
  const openCount = stats.open;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Remediation roadmap
        </h1>
        <p className="text-sm text-slate-600">
          {tenantLabel} · last scan {timeAgo(scan.started_at)} · {openCount} stop
          {openCount === 1 ? "" : "s"} ahead
        </p>
      </div>

      <RemediationRoadmap stops={stops} stats={stats} />

      <p className="text-xs text-slate-500">
        Need filters or bulk actions?{" "}
        <Link href="/dashboard/findings" className="font-medium text-blue-600 hover:text-blue-700">
          Open findings
        </Link>
        .
      </p>
    </div>
  );
}
