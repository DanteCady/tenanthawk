import { getEnterpriseRootDomain } from "./config";

export type ParsedEnterpriseHost = {
  slug: string | null;
  isEnterpriseSubdomain: boolean;
  hostname: string;
};

export function parseHostname(hostHeader: string | null | undefined): string {
  if (!hostHeader) return "";
  const first = hostHeader.split(",")[0]?.trim() ?? "";
  return first.split(":")[0]?.toLowerCase() ?? "";
}

/** Resolve org slug from Host header (e.g. acme.tenanthawk.io → acme). */
export function parseEnterpriseHost(hostHeader: string | null | undefined): ParsedEnterpriseHost {
  const hostname = parseHostname(hostHeader);
  const root = getEnterpriseRootDomain().toLowerCase();
  const rootHost = root.split(":")[0] ?? root;

  if (!hostname) {
    return { slug: null, isEnterpriseSubdomain: false, hostname: "" };
  }

  if (hostname === rootHost || hostname === `www.${rootHost}`) {
    return { slug: null, isEnterpriseSubdomain: false, hostname };
  }

  const suffix = `.${rootHost}`;
  if (hostname.endsWith(suffix)) {
    const slug = hostname.slice(0, -suffix.length);
    if (slug && !slug.includes(".")) {
      return { slug, isEnterpriseSubdomain: true, hostname };
    }
  }

  return { slug: null, isEnterpriseSubdomain: false, hostname };
}
