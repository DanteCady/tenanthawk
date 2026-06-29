import {
  getEnterpriseRootDomain,
  getTenantHawkAdminUserIds,
} from "@/lib/enterprise/config";
import { parseEnterpriseHost, parseHostname } from "@/lib/enterprise/host";

export { getTenantHawkAdminUserIds };

/** Reserved subdomain for Tenant Hawk platform operators (not an MSP org). */
export function getPlatformAdminSlug(): string {
  return process.env.PLATFORM_ADMIN_SUBDOMAIN?.trim().toLowerCase() || "admin";
}

export function isPlatformAdminHost(hostHeader: string | null | undefined): boolean {
  const parsed = parseEnterpriseHost(hostHeader);
  return parsed.isEnterpriseSubdomain && parsed.slug === getPlatformAdminSlug();
}

function devPortSuffix(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.BETTER_AUTH_URL?.trim();
  if (!raw) return "";
  try {
    const port = new URL(raw).port;
    return port ? `:${port}` : "";
  } catch {
    return "";
  }
}

export function buildPlatformAdminUrl(path = "/"): string {
  const root = getEnterpriseRootDomain();
  const slug = getPlatformAdminSlug();
  const isLocal = root.includes("localhost");
  const protocol = isLocal ? "http" : "https";
  const rootHost = root.split(":")[0] ?? root;
  const host = isLocal ? `${slug}.${rootHost}${devPortSuffix()}` : `${slug}.${rootHost}`;
  const base = `${protocol}://${host}`;
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

export function isPlatformAdminUser(userId: string): boolean {
  const ids = getTenantHawkAdminUserIds();
  if (ids.length === 0) return false;
  return ids.includes(userId);
}

export type HostContext =
  | { kind: "apex"; hostname: string }
  | { kind: "platform-admin"; hostname: string }
  | { kind: "enterprise"; slug: string; hostname: string };

export function parseHostContext(hostHeader: string | null | undefined): HostContext {
  const hostname = parseHostname(hostHeader);
  const parsed = parseEnterpriseHost(hostHeader);

  if (parsed.isEnterpriseSubdomain && parsed.slug === getPlatformAdminSlug()) {
    return { kind: "platform-admin", hostname };
  }

  if (parsed.isEnterpriseSubdomain && parsed.slug) {
    return { kind: "enterprise", slug: parsed.slug, hostname };
  }

  return { kind: "apex", hostname };
}
