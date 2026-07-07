import "server-only";

import { getAppToken, isLiveConfigured } from "./graph";
import { fetchMailboxUsage, fetchSharePointSites, fetchTeamsActivity } from "./prefetch";
import {
  inferReportConcealmentFromUsageReports,
  reportConcealmentFromCoverageNotes,
  statusFromSnapshot,
  type ReportConcealmentStatus,
  type ReportSettingsSnapshot,
} from "./report-settings.shared";
import { graphGet } from "./graph";

export type {
  ReportConcealmentState,
  ReportConcealmentStatus,
  ReportSettingsSnapshot,
} from "./report-settings.shared";
export {
  inferReportConcealmentFromUsageReports,
  M365_REPORTS_SETTINGS_URL,
  reportConcealmentFromCoverageNotes,
} from "./report-settings.shared";

/** Optional: read tenant report privacy directly when ReportSettings.Read.All is granted. */
export async function fetchReportSettings(token: string): Promise<ReportSettingsSnapshot> {
  try {
    const [settings] = await graphGet<{ displayConcealedNames?: boolean }>(
      token,
      "/admin/reportSettings",
    );
    return {
      displayConcealedNames: settings?.displayConcealedNames ?? true,
      readable: true,
    };
  } catch (err) {
    const msg = String(err);
    if (msg.includes("403") || msg.includes("Access is denied")) {
      return { displayConcealedNames: null, readable: false };
    }
    console.warn("[scan] report settings unavailable", err);
    return { displayConcealedNames: null, readable: false };
  }
}

async function inferReportConcealmentLive(token: string): Promise<ReportConcealmentStatus | null> {
  const [mailboxUsage, teamsActivity, sharePointSites] = await Promise.all([
    fetchMailboxUsage(token).catch(() => []),
    fetchTeamsActivity(token).catch(() => []),
    fetchSharePointSites(token).catch(() => []),
  ]);

  const inferred = inferReportConcealmentFromUsageReports({
    mailboxUsage,
    teamsActivity,
    sharePointSites,
  });
  return inferred ? { ...inferred, source: "live" as const } : null;
}

/** Resolve concealment for dashboard UI — scan snapshot, then live usage reports. */
export async function resolveReportConcealment(
  conn: { mode: "live" | "demo"; tenant_id: string | null },
  scan: { coverage_notes: unknown } | null | undefined,
): Promise<ReportConcealmentStatus> {
  if (conn.mode === "demo") {
    return { state: "unknown", readable: false, source: "none" };
  }

  const fromScan = reportConcealmentFromCoverageNotes(scan?.coverage_notes);
  if (fromScan.readable) return fromScan;

  if (conn.tenant_id && isLiveConfigured()) {
    try {
      const token = await getAppToken(conn.tenant_id);
      const live = await inferReportConcealmentLive(token);
      if (live?.readable) return live;
    } catch (err) {
      console.warn("[scan] live report concealment inference failed", err);
    }
  }

  return { state: "unknown", readable: false, source: "none" };
}

export function resolveReportConcealmentForScan(
  prefetch: Parameters<typeof inferReportConcealmentFromUsageReports>[0],
  graphSettings: ReportSettingsSnapshot | null,
): { reportDisplayConcealedNames: boolean | null; reportSettingsReadable: boolean } {
  if (graphSettings?.readable && graphSettings.displayConcealedNames != null) {
    return {
      reportDisplayConcealedNames: graphSettings.displayConcealedNames,
      reportSettingsReadable: true,
    };
  }

  const inferred = inferReportConcealmentFromUsageReports(prefetch);
  if (inferred?.readable) {
    return {
      reportDisplayConcealedNames: inferred.state === "concealed",
      reportSettingsReadable: true,
    };
  }

  return { reportDisplayConcealedNames: null, reportSettingsReadable: false };
}
