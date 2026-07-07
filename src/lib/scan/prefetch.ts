import { fetchGraphReport } from "./graph-reports";
import { graphGet } from "./graph";
import {
  dedupeSharePointSites,
  formatSharePointSiteGuid,
  isBareSharePointSiteId,
  isNullReportSiteId,
  isObfuscatedReportToken,
  isSharePointWebUrl,
} from "./sharepoint-site-label";
import { dedupeTeamsActivity, parseTeamsActivityRow } from "./teams-activity-label";

export interface PrefetchGroup {
  id: string;
  displayName: string;
  groupTypes: string[];
  resourceProvisioningOptions: string[];
  createdDateTime?: string;
  ownerIds: string[];
  memberCount: number;
}

export interface TeamsActivityRow {
  teamId: string;
  /** Pseudonymous team key when Graph obfuscates the usage report (app-only). */
  reportTeamKey: string;
  displayName: string;
  teamType: string;
  lastActivityDate: string | null;
  activeChannels: number;
  guests: number;
  isDeleted: boolean;
}

export interface SharePointSiteRow {
  siteId: string;
  /** Pseudonymous site key when Graph obfuscates the usage report (app-only). */
  reportSiteKey: string;
  siteUrl: string;
  rootWebTemplate: string;
  displayName?: string;
  ownerDisplayName: string;
  ownerPrincipalName: string;
  lastActivityDate: string | null;
  fileCount: number;
  activeFileCount: number;
  pageViewCount: number;
  storageUsedBytes: number;
  isDeleted: boolean;
  externalSharing: string | null;
}

export interface ScanPrefetch {
  groups: PrefetchGroup[];
  teamsActivity: TeamsActivityRow[];
  sharePointSites: SharePointSiteRow[];
}

interface GraphGroupRow {
  id?: string;
  displayName?: string;
  groupTypes?: string[];
  resourceProvisioningOptions?: string[];
  createdDateTime?: string;
  owners?: Array<{ id?: string }>;
  members?: Array<{ id?: string }>;
  "members@odata.count"?: number;
}

const DAY = 86_400_000;
export const GROUP_GRACE_DAYS = 7;

export function isTeamGroup(g: PrefetchGroup): boolean {
  return g.resourceProvisioningOptions.some((o) => o.toLowerCase() === "team");
}

export function isWithinGracePeriod(createdDateTime: string | undefined, days: number): boolean {
  if (!createdDateTime) return false;
  return Date.now() - new Date(createdDateTime).getTime() < days * DAY;
}

function rowVal(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const direct = row[key];
    if (direct !== undefined && direct !== null && String(direct) !== "") {
      return String(direct);
    }
    const match = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
    if (match && row[match] !== undefined && row[match] !== null) {
      return String(row[match] ?? "");
    }
  }
  return "";
}

function parseCount(value: string): number {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

export function daysSinceActivity(dateStr: string | null): number | null {
  if (!dateStr?.trim()) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / DAY);
}

async function fetchGroups(token: string): Promise<PrefetchGroup[]> {
  // Graph returns 400 if owners and members are expanded in the same request.
  const [withOwners, withMembers] = await Promise.all([
    graphGet<GraphGroupRow>(
      token,
      "/groups?$select=id,displayName,groupTypes,resourceProvisioningOptions,createdDateTime&$expand=owners($select=id)&$top=999",
    ),
    graphGet<GraphGroupRow>(
      token,
      "/groups?$select=id&$expand=members($select=id)&$top=999",
    ).catch((err) => {
      console.warn("[scan] group member count prefetch failed", err);
      return [] as GraphGroupRow[];
    }),
  ]);

  const memberCountById = new Map(
    withMembers
      .filter((g) => g.id)
      .map((g) => [
        g.id as string,
        g["members@odata.count"] ?? g.members?.length ?? 0,
      ]),
  );

  return withOwners
    .filter((g) => g.id)
    .map((g) => ({
      id: g.id as string,
      displayName: g.displayName?.trim() || g.id || "Unnamed group",
      groupTypes: g.groupTypes ?? [],
      resourceProvisioningOptions: g.resourceProvisioningOptions ?? [],
      createdDateTime: g.createdDateTime,
      ownerIds: (g.owners ?? []).map((o) => o.id).filter(Boolean) as string[],
      memberCount: memberCountById.get(g.id as string) ?? 0,
    }));
}

/** Teams usage report (90-day window). Empty array if report unavailable. */
export async function fetchTeamsActivity(token: string): Promise<TeamsActivityRow[]> {
  const rows = await fetchGraphReport<Record<string, unknown>>(
    token,
    "/reports/getTeamsTeamActivityDetail(period='D90')",
  );

  return dedupeTeamsActivity(
    rows
      .map((row) => parseTeamsActivityRow(row))
      .filter((r): r is TeamsActivityRow => r !== null && !r.isDeleted),
  );
}

function parseBool(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === "true" || v === "yes" || v === "1";
}

function parseSharePointSiteRow(row: Record<string, unknown>): SharePointSiteRow | null {
  const siteId = rowVal(row, "Site Id", "siteId");
  const siteUrlRaw = rowVal(row, "Site URL", "siteUrl");
  const ownerDisplay = rowVal(row, "Owner Display Name", "ownerDisplayName");
  const rootWebTemplate = rowVal(row, "Root Web Template", "rootWebTemplate");

  if (!siteId && !siteUrlRaw && !ownerDisplay) return null;

  const siteUrl = isSharePointWebUrl(siteUrlRaw) ? siteUrlRaw : "";
  const obfuscated = isNullReportSiteId(siteId) && !siteUrl;
  const reportSiteKey =
    obfuscated && isObfuscatedReportToken(ownerDisplay)
      ? ownerDisplay
      : isBareSharePointSiteId(siteId)
        ? siteId
        : siteId || ownerDisplay || siteUrlRaw;

  const externalRaw = rowVal(row, "External Sharing", "externalSharing") || null;

  return {
    siteId: siteId || reportSiteKey,
    reportSiteKey,
    siteUrl,
    rootWebTemplate,
    displayName: rowVal(row, "Site Name", "siteName", "displayName") || undefined,
    ownerDisplayName: ownerDisplay,
    ownerPrincipalName: rowVal(row, "Owner Principal Name", "ownerPrincipalName"),
    lastActivityDate: rowVal(row, "Last Activity Date", "lastActivityDate") || null,
    fileCount: parseCount(rowVal(row, "File Count", "fileCount")),
    activeFileCount: parseCount(rowVal(row, "Active File Count", "activeFileCount")),
    pageViewCount: parseCount(rowVal(row, "Page View Count", "pageViewCount")),
    storageUsedBytes: parseCount(rowVal(row, "Storage Used (Byte)", "storageUsedInBytes")),
    isDeleted: parseBool(rowVal(row, "Is Deleted", "isDeleted")),
    externalSharing: externalRaw || null,
  };
}

const GRAPH = "https://graph.microsoft.com/v1.0";
const SITE_URL_RESOLVE_CAP = 40;

/** Resolve webUrl/displayName for report rows that only include a site id. */
async function enrichSharePointSiteRows(
  token: string,
  sites: SharePointSiteRow[],
): Promise<SharePointSiteRow[]> {
  const deduped = dedupeSharePointSites(sites);
  const needsUrl = deduped.filter(
    (s) => !isSharePointWebUrl(s.siteUrl) && !isNullReportSiteId(s.siteId),
  );
  if (needsUrl.length === 0) return deduped;

  const byId = new Map(deduped.map((s) => [s.siteId.trim().toLowerCase(), s]));

  let hostname: string | null = null;
  try {
    const rootRes = await fetch(`${GRAPH}/sites/root?$select=webUrl`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (rootRes.ok) {
      const root = (await rootRes.json()) as { webUrl?: string };
      if (root.webUrl) hostname = new URL(root.webUrl).hostname;
    }
  } catch {
    // /sites/root requires Sites.Read.All on many tenants.
  }

  for (const site of needsUrl.slice(0, SITE_URL_RESOLVE_CAP)) {
    const guid = formatSharePointSiteGuid(site.siteId);
    if (!guid) continue;

    const lookupPaths = [
      `${GRAPH}/sites/${guid}?$select=webUrl,displayName`,
      hostname ? `${GRAPH}/sites/${hostname},${guid},${guid}?$select=webUrl,displayName` : null,
    ].filter(Boolean) as string[];

    for (const path of lookupPaths) {
      try {
        const res = await fetch(path, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) continue;

        const json = (await res.json()) as { webUrl?: string; displayName?: string };
        const key = site.siteId.trim().toLowerCase();
        const existing = byId.get(key);
        if (!existing) break;

        byId.set(key, {
          ...existing,
          siteUrl: json.webUrl ?? existing.siteUrl,
          displayName: json.displayName ?? existing.displayName,
        });
        break;
      } catch {
        // Try next lookup shape.
      }
    }
  }

  return [...byId.values()];
}

/** SharePoint site usage report (30-day window). Empty array if report unavailable. */
export async function fetchSharePointSites(token: string): Promise<SharePointSiteRow[]> {
  const rows = await fetchGraphReport<Record<string, unknown>>(
    token,
    "/reports/getSharePointSiteUsageDetail(period='D30')",
  );

  const parsed = rows
    .map((row) => parseSharePointSiteRow(row))
    .filter((r): r is SharePointSiteRow => r !== null);

  return enrichSharePointSiteRows(token, parsed);
}

/** Fetch shared scan data for collaboration / Teams checks. Never throws — checks degrade when data is missing. */
export async function buildScanPrefetch(token: string): Promise<ScanPrefetch> {
  const [groups, teamsActivity, sharePointSites] = await Promise.all([
    fetchGroups(token).catch((err) => {
      console.warn("[scan] group prefetch failed", err);
      return [] as PrefetchGroup[];
    }),
    fetchTeamsActivity(token).catch((err) => {
      console.warn("[scan] teams activity report unavailable", err);
      return [] as TeamsActivityRow[];
    }),
    fetchSharePointSites(token).catch((err) => {
      console.warn("[scan] sharepoint site report unavailable", err);
      return [] as SharePointSiteRow[];
    }),
  ]);

  return { groups, teamsActivity, sharePointSites };
}

export function ownerlessGroups(
  prefetch: ScanPrefetch,
  opts?: { teamsOnly?: boolean; graceDays?: number },
): PrefetchGroup[] {
  const graceDays = opts?.graceDays ?? GROUP_GRACE_DAYS;
  return prefetch.groups.filter((g) => {
    if (g.ownerIds.length > 0) return false;
    if (isWithinGracePeriod(g.createdDateTime, graceDays)) return false;
    if (opts?.teamsOnly && !isTeamGroup(g)) return false;
    if (opts?.teamsOnly === false && isTeamGroup(g)) return false;
    return true;
  });
}

export function teamGroups(prefetch: ScanPrefetch): PrefetchGroup[] {
  return prefetch.groups.filter(isTeamGroup);
}
