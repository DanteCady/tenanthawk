import { graphGet } from "../graph";
import { daysSinceActivity } from "../prefetch";
import type { ScanPrefetch, SharePointSiteRow } from "../prefetch";
import {
  isNullReportSiteId,
  isObfuscatedReportToken,
  isSharePointWebUrl,
  sharePointSiteLabel,
} from "../sharepoint-site-label";
import type { Check, FindingDraft } from "../types";
import type { Severity } from "@/db/types";

interface SharePointSettings {
  sharingCapability?: string;
}

const GB = 1024 ** 3;
const STORAGE_WARN_BYTES = 50 * GB;
const STORAGE_HIGH_BYTES = 100 * GB;

function getActiveSites(prefetch?: ScanPrefetch): SharePointSiteRow[] {
  return prefetch?.sharePointSites.filter((s) => !s.isDeleted) ?? [];
}

function severityFromCount(
  count: number,
  thresholds: { medium: number; high: number },
): Severity {
  if (count >= thresholds.high) return "high";
  if (count >= thresholds.medium) return "medium";
  return "low";
}

function aggregateSiteFinding(
  checkId: string,
  sites: SharePointSiteRow[],
  opts: {
    noun: string;
    description: string;
    remediation: string;
    severity: Severity;
  },
): FindingDraft[] {
  if (sites.length === 0) return [];

  return [
    {
      category: "hygiene",
      checkId,
      severity: opts.severity,
      title: `${sites.length} ${opts.noun}`,
      description: opts.description,
      impact: { count: sites.length, entities: sites.slice(0, 15).map(sharePointSiteLabel) },
      remediation: opts.remediation,
    },
  ];
}

function isExternalSharingEnabled(value: string | null): boolean {
  if (!value?.trim()) return false;
  const v = value.trim().toLowerCase();
  if (v === "false" || v === "disabled" || v === "none" || v === "internal" || v === "no") {
    return false;
  }
  return v === "true" || v.includes("external") || v.includes("guest");
}

/** Flags org-wide SharePoint/OneDrive sharing that is more permissive than org-only. */
export const sharePointSharing: Check = {
  id: "hygiene.sharing",
  category: "hygiene",
  async run({ token }) {
    const settings = await graphGet<SharePointSettings>(
      token,
      "/admin/sharepoint/settings",
    );
    const capability = settings[0]?.sharingCapability;
    if (!capability || capability === "disabled") return [];

    if (capability === "externalUserAndGuestSharing") {
      return [
        {
          category: "hygiene",
          checkId: sharePointSharing.id,
          severity: "high",
          title: "Guest and external SharePoint sharing enabled org-wide",
          description:
            "SharePoint/OneDrive allows guest and external sharing org-wide, increasing data-leak risk.",
          remediation:
            "Set sharing to 'Only people in your organization' or limit guest links in SharePoint admin > Policies > Sharing.",
        },
      ];
    }

    if (capability === "externalUserSharingOnly") {
      return [
        {
          category: "hygiene",
          checkId: sharePointSharing.id,
          severity: "medium",
          title: "External SharePoint sharing enabled org-wide",
          description:
            "SharePoint/OneDrive allows authenticated external sharing org-wide. Confirm this matches your data policy.",
          remediation:
            "Review external sharing scope in SharePoint admin > Policies > Sharing and restrict if not required.",
        },
      ];
    }

    if (capability === "existingExternalUserSharingOnly") {
      return [
        {
          category: "hygiene",
          checkId: sharePointSharing.id,
          severity: "low",
          title: "Existing external SharePoint collaborators can be re-invited org-wide",
          description:
            "SharePoint sharing allows existing external users to access shared content. Review whether tighter controls are needed.",
          remediation:
            "Review SharePoint admin > Policies > Sharing and consider org-only sharing for sensitive data.",
        },
      ];
    }

    return [];
  },
};

export const sharePointExternalSitesCheck: Check = {
  id: "hygiene.sharepoint-external-sites",
  category: "hygiene",
  async run(ctx) {
    const sites = getActiveSites(ctx.prefetch);
    if (sites.length === 0) return [];

    const hasSharingColumn = sites.some((s) => s.externalSharing !== null);
    if (!hasSharingColumn) return [];

    const external = sites.filter((s) => isExternalSharingEnabled(s.externalSharing));

    return aggregateSiteFinding(sharePointExternalSitesCheck.id, external, {
      noun: external.length === 1 ? "site with external sharing" : "sites with external sharing",
      description: `${external.length} SharePoint site${external.length === 1 ? "" : "s"} allow external sharing beyond org-only access.`,
      remediation:
        "Review site sharing settings in SharePoint admin and restrict external access on sensitive sites.",
      severity: severityFromCount(external.length, { medium: 5, high: 15 }),
    });
  },
};

export const sharePointStaleSitesCheck: Check = {
  id: "hygiene.sharepoint-stale-sites",
  category: "hygiene",
  async run(ctx) {
    const sites = getActiveSites(ctx.prefetch);
    if (sites.length === 0) return [];

    const stale = sites.filter((s) => {
      const days = daysSinceActivity(s.lastActivityDate);
      return days === null || days >= 180;
    });

    return aggregateSiteFinding(sharePointStaleSitesCheck.id, stale, {
      noun: stale.length === 1 ? "stale SharePoint site" : "stale SharePoint sites",
      description: `${stale.length} SharePoint site${stale.length === 1 ? "" : "s"} had no activity in 180+ days.`,
      remediation:
        "Archive or delete unused SharePoint sites in SharePoint admin, or confirm owners still need them.",
      severity: severityFromCount(stale.length, { medium: 10, high: 25 }),
    });
  },
};

export const sharePointHighStorageCheck: Check = {
  id: "hygiene.sharepoint-high-storage",
  category: "hygiene",
  async run(ctx) {
    const sites = getActiveSites(ctx.prefetch);
    if (sites.length === 0) return [];

    const heavy = sites.filter((s) => s.storageUsedBytes >= STORAGE_WARN_BYTES);
    const hasVeryHeavy = heavy.some((s) => s.storageUsedBytes >= STORAGE_HIGH_BYTES);

    return aggregateSiteFinding(sharePointHighStorageCheck.id, heavy, {
      noun: heavy.length === 1 ? "high-storage SharePoint site" : "high-storage SharePoint sites",
      description: `${heavy.length} SharePoint site${heavy.length === 1 ? "" : "s"} use more than 50 GB of storage${hasVeryHeavy ? " (some over 100 GB)" : ""}.`,
      remediation:
        "Review large sites in SharePoint admin, archive old content, and apply retention policies.",
      severity: hasVeryHeavy ? "high" : severityFromCount(heavy.length, { medium: 3, high: 8 }),
    });
  },
};

export const sharePointEmptySitesCheck: Check = {
  id: "hygiene.sharepoint-empty-sites",
  category: "hygiene",
  async run(ctx) {
    const sites = getActiveSites(ctx.prefetch);
    if (sites.length === 0) return [];

    const empty = sites.filter((s) => s.fileCount === 0 && s.pageViewCount === 0);

    return aggregateSiteFinding(sharePointEmptySitesCheck.id, empty, {
      noun: empty.length === 1 ? "empty SharePoint site" : "empty SharePoint sites",
      description: `${empty.length} SharePoint site${empty.length === 1 ? "" : "s"} have zero files and zero page views in the last 30 days.`,
      remediation: "Delete or archive unused site collections in SharePoint admin.",
      severity: severityFromCount(empty.length, { medium: 10, high: 25 }),
    });
  },
};

export const sharePointOwnerlessSitesCheck: Check = {
  id: "hygiene.sharepoint-ownerless-sites",
  category: "hygiene",
  async run(ctx) {
    const sites = getActiveSites(ctx.prefetch);
    if (sites.length === 0) return [];

    // App-only usage reports obfuscate owner fields as hex tokens — skip this check.
    const reportIsObfuscated = sites.every(
      (s) =>
        isNullReportSiteId(s.siteId) &&
        !isSharePointWebUrl(s.siteUrl) &&
        isObfuscatedReportToken(s.ownerDisplayName),
    );
    if (reportIsObfuscated) return [];

    const ownerless = sites.filter(
      (s) =>
        !s.ownerDisplayName.trim() &&
        !s.ownerPrincipalName.trim() &&
        !isObfuscatedReportToken(s.ownerDisplayName),
    );

    return aggregateSiteFinding(sharePointOwnerlessSitesCheck.id, ownerless, {
      noun: ownerless.length === 1 ? "ownerless SharePoint site" : "ownerless SharePoint sites",
      description: `${ownerless.length} SharePoint site${ownerless.length === 1 ? "" : "s"} have no owner listed in the usage report.`,
      remediation:
        "Assign site owners in SharePoint admin or via the site's Site permissions panel.",
      severity: severityFromCount(ownerless.length, { medium: 3, high: 10 }),
    });
  },
};

export const sharePointInactiveFilesCheck: Check = {
  id: "hygiene.sharepoint-inactive-files",
  category: "hygiene",
  async run(ctx) {
    const sites = getActiveSites(ctx.prefetch);
    if (sites.length === 0) return [];

    const inactive = sites.filter((s) => s.fileCount > 0 && s.activeFileCount === 0);

    return aggregateSiteFinding(sharePointInactiveFilesCheck.id, inactive, {
      noun:
        inactive.length === 1
          ? "site with inactive files"
          : "sites with inactive files",
      description: `${inactive.length} SharePoint site${inactive.length === 1 ? "" : "s"} contain files but report zero active files in the last 30 days.`,
      remediation:
        "Review stale document libraries and apply retention or archival policies.",
      severity: severityFromCount(inactive.length, { medium: 5, high: 15 }),
    });
  },
};
