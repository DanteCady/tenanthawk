import Link from "next/link";
import { Lock } from "lucide-react";
import { getDashboardSnapshot } from "@/lib/dashboard/context";
import { buildCompliancePosture } from "@/lib/compliance/posture";
import { CompliancePosture } from "@/components/app/CompliancePosture";
import { ProUpgradeOptions } from "@/components/app/UpgradeButton";
import { isAnnualBillingConfigured } from "@/lib/billing/pricing";
import { timeAgo } from "@/lib/time";

export default async function CompliancePage() {
  const { scan, activeFindings, isPro, tenantLabel } = await getDashboardSnapshot();

  const annualAvailable = isAnnualBillingConfigured();

  if (!isPro) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Compliance
          </h1>
          <p className="text-sm text-slate-600">CIS and NIST control mapping for your tenant.</p>
        </div>
        <div className="surface-card flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Lock className="h-6 w-6" />
          </div>
          <p className="mt-4 font-semibold text-slate-900">Compliance mapping is a Pro feature</p>
          <p className="mt-2 max-w-sm text-sm text-slate-600">
            See which open findings map to CIS Controls and NIST SP 800-53 — with every
            affected finding listed per control.
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

  const posture = buildCompliancePosture(
    activeFindings.map((f) => ({
      id: f.id,
      check_id: f.check_id,
      title: f.title,
      severity: f.severity,
    })),
  );

  const failingCount = posture.controls.filter((c) => c.openFindings > 0).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Compliance</h1>
        <p className="text-sm text-slate-600">
          {tenantLabel} · last scan {timeAgo(scan.started_at)} · {failingCount} control
          {failingCount === 1 ? "" : "s"} with open findings
        </p>
      </div>

      <CompliancePosture posture={posture} />

      <p className="text-xs text-slate-500">
        Need the full printable report?{" "}
        <Link href="/dashboard/reports" className="font-medium text-blue-600 hover:text-blue-700">
          Go to Reports
        </Link>
        .
      </p>
    </div>
  );
}
