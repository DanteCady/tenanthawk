import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import {
  getPrimaryConnection,
  getLatestScan,
  getFindings,
} from "@/lib/queries";
import { summarize } from "@/lib/summary";
import { PrintableReport } from "@/components/app/PrintableReport";
import { PrintReportButton } from "@/components/app/PrintReportButton";
import { buildReportCustomer } from "@/lib/export/report-customer";

export default async function ReportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await isPro(session.user.id))) redirect("/dashboard/billing");

  const conn = await getPrimaryConnection(session.user.id);
  if (!conn) redirect("/onboarding");
  const scan = await getLatestScan(conn.id);
  if (!scan) redirect("/onboarding");

  const findings = await getFindings(scan.id);
  const summary = summarize(findings, scan.category_scores);
  const tenant =
    conn.tenant_domain ??
    conn.display_name ??
    (conn.mode === "demo" ? "Contoso (demo)" : "Microsoft 365");

  return (
    <div className="mx-auto max-w-[816px] print:max-w-none">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 print:hidden">
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to dashboard
        </Link>
        <PrintReportButton />
      </div>

      <PrintableReport
        customer={buildReportCustomer({
          tenant,
          displayName: conn.display_name,
          tenantDomain: conn.tenant_domain,
          tenantId: conn.tenant_id,
          mode: conn.mode,
          scannedAt: scan.started_at,
          provider: conn.provider,
        })}
        score={scan.score}
        summary={summary}
        findings={findings.map((f) => ({
          id: f.id,
          category: f.category,
          severity: f.severity,
          title: f.title,
          description: f.description,
          remediation: f.remediation,
          entity_ref: f.entity_ref,
          impact: f.impact,
        }))}
      />
    </div>
  );
}
