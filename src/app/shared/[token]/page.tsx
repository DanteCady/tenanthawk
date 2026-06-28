import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PrintableReport } from "@/components/app/PrintableReport";
import { CompliancePosture } from "@/components/app/CompliancePosture";
import { getActiveShareByToken } from "@/lib/report-share";
import { getLatestScan, getFindings } from "@/lib/queries";
import { db } from "@/db";
import { summarize } from "@/lib/summary";
import { buildReportCustomer } from "@/lib/export/report-customer";
import { buildCompliancePosture } from "@/lib/compliance/posture";
import { getFindingStatuses, isFindingHidden } from "@/lib/findings/status";
import { findingStatusKey } from "@/lib/findings/key";

export const metadata: Metadata = {
  title: "Tenant Health Report — Tenant Hawk",
  robots: { index: false, follow: false },
};

export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const share = await getActiveShareByToken(token);
  if (!share) notFound();

  const conn = await db
    .selectFrom("connection")
    .selectAll()
    .where("id", "=", share.connection_id)
    .executeTakeFirst();

  if (!conn) notFound();

  const scan = await getLatestScan(conn.id);
  if (!scan) notFound();

  const findings = await getFindings(scan.id);
  const statuses = await getFindingStatuses(conn.id);
  const activeFindings = findings.filter((f) => {
    const tracking = statuses.get(findingStatusKey(f.check_id, f.entity_ref));
    return !isFindingHidden(tracking);
  });

  const summary = summarize(activeFindings, scan.category_scores);
  const posture = buildCompliancePosture(
    activeFindings.map((f) => ({
      id: f.id,
      check_id: f.check_id,
      title: f.title,
      severity: f.severity,
    })),
  );

  const tenant =
    conn.tenant_domain ??
    conn.display_name ??
    (conn.mode === "demo" ? "Contoso (demo)" : "Microsoft 365");

  return (
    <div className="light-surface min-h-screen py-8 print:py-0">
      <div className="mx-auto max-w-[816px] space-y-6 px-4 print:max-w-none print:px-0">
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-center text-xs text-blue-800 print:hidden">
          Read-only shared report · Latest scan · Powered by Tenant Hawk
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
          findings={activeFindings.map((f) => ({
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

        <div className="print:break-before-page">
          <CompliancePosture posture={posture} />
        </div>

        <p className="pb-8 text-center text-xs text-slate-500 print:hidden">
          This link is read-only and may expire. Do not share publicly.
        </p>
      </div>
    </div>
  );
}
