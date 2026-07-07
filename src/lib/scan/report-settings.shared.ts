import type { ScanCoverageNotes } from "@/db/types";
import { isReportObfuscated } from "./exchange-mailbox-label";
import {
  isNullReportId,
  isObfuscatedReportToken,
  isSharePointWebUrl,
} from "./sharepoint-site-label";

export interface ReportSettingsSnapshot {
  displayConcealedNames: boolean | null;
  readable: boolean;
}

export type ReportConcealmentState = "concealed" | "visible" | "unknown";

export interface ReportConcealmentStatus {
  state: ReportConcealmentState;
  readable: boolean;
  source: "scan" | "live" | "none";
}

export const M365_REPORTS_SETTINGS_URL =
  "https://admin.microsoft.com/adminportal/home#/Settings/Services/:/Settings/L1/Reports";

export function parseCoverageNotes(raw: unknown): ScanCoverageNotes | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as ScanCoverageNotes;
}

export function statusFromSnapshot(
  snapshot: ReportSettingsSnapshot,
  source: ReportConcealmentStatus["source"],
): ReportConcealmentStatus {
  if (!snapshot.readable || snapshot.displayConcealedNames === null) {
    return { state: "unknown", readable: false, source };
  }
  return {
    state: snapshot.displayConcealedNames ? "concealed" : "visible",
    readable: true,
    source,
  };
}

function teamsRowObfuscated(row: {
  teamId: string;
  reportTeamKey: string;
  displayName: string;
}): boolean {
  if (row.displayName && !isObfuscatedReportToken(row.displayName)) return false;
  if (isNullReportId(row.teamId) && isObfuscatedReportToken(row.reportTeamKey)) return true;
  return isObfuscatedReportToken(row.reportTeamKey);
}

function sharePointRowObfuscated(row: {
  reportSiteKey: string;
  siteUrl: string;
  ownerDisplayName: string;
}): boolean {
  if (row.siteUrl && isSharePointWebUrl(row.siteUrl)) return false;
  if (row.ownerDisplayName && !isObfuscatedReportToken(row.ownerDisplayName)) return false;
  return (
    isObfuscatedReportToken(row.reportSiteKey) ||
    isObfuscatedReportToken(row.ownerDisplayName)
  );
}

/** Infer tenant report concealment from M365 usage report rows already fetched during scan. */
export function inferReportConcealmentFromUsageReports(samples: {
  mailboxUsage?: Array<{ isObfuscated: boolean }>;
  teamsActivity?: Array<{
    teamId: string;
    reportTeamKey: string;
    displayName: string;
  }>;
  sharePointSites?: Array<{
    reportSiteKey: string;
    siteUrl: string;
    ownerDisplayName: string;
  }>;
}): ReportConcealmentStatus | null {
  const signals: boolean[] = [];

  const mailboxes = samples.mailboxUsage ?? [];
  if (mailboxes.length > 0) {
    signals.push(isReportObfuscated(mailboxes as Parameters<typeof isReportObfuscated>[0]));
  }

  const teams = samples.teamsActivity ?? [];
  if (teams.length > 0) {
    const obfuscated = teams.filter(teamsRowObfuscated).length;
    if (obfuscated === teams.length) signals.push(true);
    else if (obfuscated === 0) signals.push(false);
    else signals.push(true);
  }

  const sites = samples.sharePointSites ?? [];
  if (sites.length > 0) {
    const obfuscated = sites.filter(sharePointRowObfuscated).length;
    if (obfuscated === sites.length) signals.push(true);
    else if (obfuscated === 0) signals.push(false);
    else signals.push(true);
  }

  if (signals.length === 0) return null;

  const concealed =
    signals.some(Boolean) && !signals.every((value) => value === false);

  return statusFromSnapshot(
    { displayConcealedNames: concealed, readable: true },
    "scan",
  );
}

export function reportConcealmentFromCoverageNotes(
  raw: unknown,
): ReportConcealmentStatus {
  const notes = parseCoverageNotes(raw);
  if (notes?.reportDisplayConcealedNames == null) {
    return { state: "unknown", readable: false, source: "none" };
  }
  return statusFromSnapshot(
    {
      displayConcealedNames: notes.reportDisplayConcealedNames,
      readable: true,
    },
    "scan",
  );
}
