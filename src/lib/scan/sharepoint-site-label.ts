import type { SharePointSiteRow } from "./prefetch";

/** SharePoint site collection IDs in usage reports are 32-char hex (no dashes). */
export function isBareSharePointSiteId(value: string): boolean {
  return /^[0-9a-f]{32}$/i.test(value.trim());
}

/** Graph obfuscates owner/site fields in app-only usage reports as hex tokens. */
export function isObfuscatedReportToken(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (isBareSharePointSiteId(v)) return true;
  return /^[0-9a-f]{24,40}$/i.test(v);
}

export function isSharePointWebUrl(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v.startsWith("http") || v.includes(".sharepoint.com");
}

export function isNullReportSiteId(siteId: string): boolean {
  const hex = siteId.trim().replace(/-/g, "");
  return hex === "" || /^0+$/.test(hex);
}

/** Convert report site id to a GUID for Graph /sites/{id} lookups. */
export function formatSharePointSiteGuid(siteId: string): string | null {
  const hex = siteId.trim().replace(/-/g, "");
  if (!/^[0-9a-f]{32}$/i.test(hex) || /^0+$/.test(hex)) return null;
  const h = hex.toLowerCase();
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const WEB_TEMPLATE_LABELS: Record<string, string> = {
  Group: "Microsoft 365 group site",
  "Team Site": "Team site",
  "Site Page Publishing": "Communication site",
  "Tenant Admin Site": "Tenant admin site",
  "My Site Host": "OneDrive site collection",
  "Basic Search Center": "Search center",
  "Compliance Policy Center": "Compliance center",
};

export function sharePointWebTemplateLabel(template: string | undefined): string {
  const t = template?.trim();
  if (!t) return "SharePoint site";
  return WEB_TEMPLATE_LABELS[t] ?? t;
}

export function abbreviateReportToken(token: string): string {
  const t = token.trim();
  if (t.length <= 12) return t;
  return `${t.slice(0, 8).toUpperCase()}…`;
}

function labelFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const sitesMatch = parsed.pathname.match(/\/(?:sites|teams)\/([^/]+)/i);
    if (sitesMatch?.[1]) {
      return decodeURIComponent(sitesMatch[1].replace(/\+/g, " "));
    }

    const path = parsed.pathname.replace(/\/$/, "");
    if (!path || path === "/") {
      return `${parsed.hostname} root site`;
    }

    const segments = path.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    if (last) return decodeURIComponent(last.replace(/\+/g, " "));
  } catch {
    // fall through
  }
  return null;
}

/** Format a stored entity string for display (handles legacy raw hex rows). */
export function formatSharePointEntityLabel(entity: string): string {
  const value = entity.trim();
  if (!value || value === "/") return "SharePoint site (unknown)";

  if (isSharePointWebUrl(value)) {
    return labelFromUrl(value) ?? value;
  }

  if (isObfuscatedReportToken(value)) {
    return `SharePoint site (${abbreviateReportToken(value)})`;
  }

  return value;
}

/** Human-readable site name for findings. */
export function sharePointSiteLabel(site: SharePointSiteRow): string {
  if (site.siteUrl && isSharePointWebUrl(site.siteUrl)) {
    const fromUrl = labelFromUrl(site.siteUrl);
    if (fromUrl) return fromUrl;
  }

  const key = site.reportSiteKey?.trim() || site.siteId?.trim();
  const template = site.rootWebTemplate?.trim();

  if (key && isObfuscatedReportToken(key)) {
    const kind = sharePointWebTemplateLabel(template);
    return `${kind} (${abbreviateReportToken(key)})`;
  }

  const owner = site.ownerDisplayName?.trim();
  if (owner && !isObfuscatedReportToken(owner)) {
    const cleaned = owner.replace(/\s+owners$/i, "").trim();
    if (cleaned) return cleaned;
  }

  const upn = site.ownerPrincipalName?.trim();
  if (upn && !isObfuscatedReportToken(upn) && upn.includes("@")) {
    const local = upn.split("@")[0]?.replace(/[._-]+/g, " ").trim();
    if (local) return local;
  }

  if (key) return `SharePoint site (${abbreviateReportToken(key)})`;
  return "Unknown SharePoint site";
}

/** One row per logical site in obfuscated reports (key + template). */
export function dedupeSharePointSites(sites: SharePointSiteRow[]): SharePointSiteRow[] {
  const byKey = new Map<string, SharePointSiteRow>();

  for (const site of sites) {
    const dedupeKey = [
      site.reportSiteKey || site.siteId,
      site.rootWebTemplate ?? "",
    ]
      .join("|")
      .toLowerCase();

    const existing = byKey.get(dedupeKey);
    if (!existing) {
      byKey.set(dedupeKey, site);
      continue;
    }

    const existingHasUrl = isSharePointWebUrl(existing.siteUrl);
    const nextHasUrl = isSharePointWebUrl(site.siteUrl);
    if (!existingHasUrl && nextHasUrl) {
      byKey.set(dedupeKey, site);
    }
  }

  return [...byKey.values()];
}
