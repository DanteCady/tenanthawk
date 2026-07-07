import "server-only";
import { redirect } from "next/navigation";
import type { RemediationEnriched } from "@/lib/remediation/types";
import type { FindingDTO } from "@/components/app/FindingsTable";
import { getSession } from "@/lib/session";
import { getPlan, hasProFeatures } from "@/lib/entitlements";
import { getMspConsoleAccess } from "@/lib/entitlements/msp-console";
import {
  getActiveConnection,
  getLatestScan,
  getFindings,
  getScanTrend,
  getScanHistory,
} from "@/lib/queries";
import { resolveReportConcealment } from "@/lib/scan/report-settings";
import { summarize } from "@/lib/summary";
import { getFindingStatuses, isFindingHidden } from "@/lib/findings/status";
import { findingStatusKey } from "@/lib/findings/key";
import { connectionLabel } from "@/lib/connection/label";

function parseRemediationEnriched(raw: unknown): RemediationEnriched | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as RemediationEnriched;
  if (!Array.isArray(o.steps) || !Array.isArray(o.links)) return null;
  return o;
}

/** Shared tenant + scan context for dashboard routes. Redirects when unauthenticated or not onboarded. */
export async function getDashboardSnapshot() {
  const session = await getSession();
  if (!session) redirect("/login");

  const conn = await getActiveConnection(session.user.id);
  if (!conn) redirect("/onboarding");

  const scan = await getLatestScan(conn.id);
  if (!scan) redirect("/onboarding");

  const findings = await getFindings(scan.id);
  const plan = await getPlan(session.user.id);
  const isPro = hasProFeatures(plan);
  const mspAccess = await getMspConsoleAccess(session.user.id, session.user.email);
  const statuses = isPro ? await getFindingStatuses(conn.id) : new Map();

  const activeFindings = findings.filter((f) => {
    const tracking = statuses.get(findingStatusKey(f.check_id, f.entity_ref));
    return !isFindingHidden(tracking);
  });

  const summary = summarize(activeFindings, scan.category_scores);
  const trend = await getScanTrend(conn.id);
  const history = isPro ? await getScanHistory(conn.id) : [];

  const dtos: FindingDTO[] = findings.map((f) => {
    const tracking = statuses.get(findingStatusKey(f.check_id, f.entity_ref));
    return {
      id: f.id,
      checkId: f.check_id,
      category: f.category,
      severity: f.severity,
      title: f.title,
      description: f.description,
      impact: f.impact,
      remediation: f.remediation,
      entityRef: f.entity_ref,
      remediationEnriched: isPro
        ? parseRemediationEnriched(f.remediation_enriched)
        : null,
      tracking: tracking?.status ?? "open",
      snoozedUntil: tracking?.snoozedUntil?.toISOString() ?? null,
      trackingNote: tracking?.note ?? null,
    };
  });

  const tenantLabel = connectionLabel(conn);
  const reportConcealment = await resolveReportConcealment(conn, scan);

  return {
    session,
    conn,
    scan,
    findings,
    activeFindings,
    summary,
    trend,
    history,
    isPro,
    plan,
    mspAccess,
    dtos,
    tenantLabel,
    reportConcealment,
  };
}
