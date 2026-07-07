import type { Severity } from "@/db/types";
import { fetchGraphReport } from "../graph-reports";
import { daysSinceActivity } from "../prefetch";
import type { ScanPrefetch, SharePointSiteRow } from "../prefetch";
import { sharePointSiteLabel } from "../sharepoint-site-label";
import type { Check, FindingDraft, ScanContext } from "../types";

const GB = 1024 ** 3;
const ONEDRIVE_STORAGE_WARN = 25 * GB;

export interface OneDriveUsageRow {
  ownerPrincipalName: string;
  displayName: string;
  lastActivityDate: string | null;
  storageUsedBytes: number;
  isDeleted: boolean;
}

function rowVal(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = String(row[key] ?? "").trim();
    if (value) return value;
  }
  return "";
}

function parseOneDriveRow(row: Record<string, unknown>): OneDriveUsageRow | null {
  const upn = rowVal(row, "Owner Principal Name", "ownerPrincipalName");
  const display = rowVal(row, "Owner Display Name", "ownerDisplayName");
  if (!upn && !display) return null;

  const storage = parseInt(rowVal(row, "Storage Used (Byte)", "storageUsedInBytes"), 10);
  const isDeleted = rowVal(row, "Is Deleted", "isDeleted").toLowerCase() === "true";

  return {
    ownerPrincipalName: upn,
    displayName: display || upn,
    lastActivityDate: rowVal(row, "Last Activity Date", "lastActivityDate") || null,
    storageUsedBytes: Number.isFinite(storage) ? storage : 0,
    isDeleted,
  };
}

export async function fetchOneDriveUsage(token: string): Promise<OneDriveUsageRow[]> {
  const rows = await fetchGraphReport<Record<string, unknown>>(
    token,
    "/reports/getOneDriveUsageAccountDetail(period='D30')",
  );
  return rows
    .map((row) => parseOneDriveRow(row))
    .filter((row): row is OneDriveUsageRow => row !== null && !row.isDeleted);
}

function aggregateSiteFinding(
  checkId: string,
  sites: SharePointSiteRow[],
  opts: {
    noun: string;
    description: string;
    remediation: string;
    severity: Severity;
    category?: FindingDraft["category"];
  },
): FindingDraft[] {
  if (sites.length === 0) return [];

  return [
    {
      category: opts.category ?? "hygiene",
      checkId,
      severity: opts.severity,
      title: `${sites.length} ${opts.noun}`,
      description: opts.description,
      impact: { count: sites.length, entities: sites.slice(0, 15).map(sharePointSiteLabel) },
      remediation: opts.remediation,
    },
  ];
}

function getSites(ctx: ScanContext): SharePointSiteRow[] {
  return ctx.prefetch?.sharePointSites.filter((site) => !site.isDeleted) ?? [];
}

export const sharePointUnusedPagesCheck: Check = {
  id: "hygiene.sharepoint-unused-pages",
  category: "hygiene",
  async run(ctx) {
    const sites = getSites(ctx).filter(
      (site) => site.fileCount > 0 && site.pageViewCount === 0,
    );

    return aggregateSiteFinding(sharePointUnusedPagesCheck.id, sites, {
      noun: sites.length === 1 ? "site with unused pages" : "sites with unused pages",
      description: `${sites.length} SharePoint site${sites.length === 1 ? "" : "s"} had files but zero page views in the last 90 days.`,
      remediation:
        "Archive stale site pages or consolidate content into active team sites.",
      severity: sites.length >= 10 ? "medium" : "low",
    });
  },
};

export const sharePointStaleSitePagesCheck: Check = {
  id: "hygiene.sharepoint-stale-site-pages",
  category: "hygiene",
  async run(ctx) {
    const sites = getSites(ctx).filter((site) => {
      const days = daysSinceActivity(site.lastActivityDate);
      return site.fileCount > 0 && days !== null && days >= 365;
    });

    return aggregateSiteFinding(sharePointStaleSitePagesCheck.id, sites, {
      noun: sites.length === 1 ? "site with stale pages" : "sites with stale pages",
      description: `${sites.length} SharePoint site${sites.length === 1 ? "" : "s"} had content but no activity in 365+ days.`,
      remediation:
        "Review stale site content and archive or delete pages that are no longer needed.",
      severity: sites.length >= 10 ? "medium" : "low",
    });
  },
};

export const sharePointAnonymousLinksCheck: Check = {
  id: "hygiene.sharepoint-anonymous-links",
  category: "hygiene",
  async run({ token, prefetch }) {
    void prefetch;
    try {
      const rows = await fetchGraphReport<Record<string, unknown>>(
        token,
        "/reports/getSharePointSiteUsageDetail(period='D30')",
      );
      const sites = rows.filter((row) => {
        const anon = rowVal(row, "Anonymous Link Count", "anonymousLinkCount");
        return parseInt(anon, 10) > 0;
      });
      if (sites.length === 0) return [];

      return [
        {
          category: "hygiene",
          checkId: sharePointAnonymousLinksCheck.id,
          severity: sites.length >= 5 ? "high" : "medium",
          title: `${sites.length} sites with anonymous links`,
          description: `${sites.length} SharePoint site${sites.length === 1 ? "" : "s"} report anonymous sharing links.`,
          impact: { count: sites.length },
          remediation:
            "Remove anonymous links in SharePoint admin or restrict anonymous sharing tenant-wide.",
        },
      ];
    } catch {
      return [];
    }
  },
};

export const oneDriveStaleCheck: Check = {
  id: "hygiene.onedrive-stale",
  category: "hygiene",
  async run(ctx) {
    const rows = ctx.deepPrefetch?.onedrive ?? [];
    const stale = rows.filter((row) => {
      const days = daysSinceActivity(row.lastActivityDate);
      return days === null || days >= 90;
    });
    if (stale.length === 0) return [];

    return [
      {
        category: "hygiene",
        checkId: oneDriveStaleCheck.id,
        severity: stale.length >= 10 ? "medium" : "low",
        title: `${stale.length} stale OneDrive accounts`,
        description: `${stale.length} OneDrive account${stale.length === 1 ? "" : "s"} had no activity in 90+ days.`,
        impact: {
          count: stale.length,
          entities: stale.slice(0, 15).map((row) => row.displayName || row.ownerPrincipalName),
        },
        remediation:
          "Review inactive OneDrive accounts and reclaim storage or offboard users.",
      },
    ];
  },
};

export const oneDriveHighStorageCheck: Check = {
  id: "cost.onedrive-high-storage",
  category: "cost",
  async run(ctx) {
    const rows = ctx.deepPrefetch?.onedrive ?? [];
    const heavy = rows.filter((row) => row.storageUsedBytes >= ONEDRIVE_STORAGE_WARN);
    if (heavy.length === 0) return [];

    return [
      {
        category: "cost",
        checkId: oneDriveHighStorageCheck.id,
        severity: heavy.some((row) => row.storageUsedBytes >= 50 * GB) ? "high" : "medium",
        title: `${heavy.length} high-storage OneDrive accounts`,
        description: `${heavy.length} OneDrive account${heavy.length === 1 ? "" : "s"} exceed 25 GB of storage.`,
        impact: {
          count: heavy.length,
          entities: heavy.slice(0, 15).map((row) => row.displayName || row.ownerPrincipalName),
        },
        remediation:
          "Archive old files, enable retention policies, or right-size licenses for heavy OneDrive users.",
      },
    ];
  },
};

export const staleTeamSitesStorageCheck: Check = {
  id: "cost.stale-team-sites-storage",
  category: "cost",
  async run(ctx) {
    const sites = getSites(ctx).filter((site) => {
      const isTeamSite = site.rootWebTemplate.toLowerCase().includes("group");
      const days = daysSinceActivity(site.lastActivityDate);
      return isTeamSite && site.storageUsedBytes >= 50 * GB && days !== null && days >= 180;
    });

    return aggregateSiteFinding(staleTeamSitesStorageCheck.id, sites, {
      noun:
        sites.length === 1
          ? "high-storage stale team site"
          : "high-storage stale team sites",
      description: `${sites.length} team-connected SharePoint site${sites.length === 1 ? "" : "s"} use 50+ GB and were inactive for 180+ days.`,
      remediation:
        "Archive stale team sites and reclaim SharePoint storage before renewal.",
      severity: sites.length > 0 ? "medium" : "low",
      category: "cost",
    });
  },
};
