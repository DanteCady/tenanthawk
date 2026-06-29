/** Root domain for Enterprise subdomains (e.g. acme.tenanthawk.io). */
export function getEnterpriseRootDomain(): string {
  return process.env.ENTERPRISE_ROOT_DOMAIN?.trim() || "tenanthawk.io";
}

/** Cookie domain for cross-subdomain sessions (e.g. .tenanthawk.io). Set in production. */
export function getEnterpriseCookieDomain(): string | undefined {
  const raw = process.env.ENTERPRISE_COOKIE_DOMAIN?.trim();
  return raw || undefined;
}

export function getTenantHawkAdminUserIds(): string[] {
  const raw = process.env.TENANT_HAWK_ADMIN_USER_ID?.trim();
  if (!raw) return [];
  return raw.split(",").map((id) => id.trim()).filter(Boolean);
}

const DEFAULT_RESERVED = [
  "www",
  "api",
  "app",
  "admin",
  "platform",
  "portal",
  "console",
  "login",
  "signup",
  "dashboard",
  "mail",
  "smtp",
  "ftp",
  "cdn",
  "static",
  "assets",
  "status",
  "help",
  "support",
  "docs",
  "auth",
  "oauth",
  "account",
  "billing",
  "demo",
  "test",
  "staging",
  "dev",
];

export function getReservedSlugs(): Set<string> {
  const extra = process.env.ENTERPRISE_RESERVED_SLUGS?.trim();
  const fromEnv = extra ? extra.split(",").map((s) => s.trim().toLowerCase()) : [];
  return new Set([...DEFAULT_RESERVED, ...fromEnv]);
}

export function isEnterpriseSsoEnabled(): boolean {
  const raw = process.env.ENTERPRISE_SSO_ENABLED?.trim();
  if (raw === "false" || raw === "0") return false;
  return true;
}

/** DNS TXT prefix for SSO domain ownership (`_tenanthawk-token-{providerId}.domain`). */
export const SSO_DOMAIN_VERIFICATION_TOKEN_PREFIX = "tenanthawk-token";

export function getSsoDomainVerificationOptions() {
  return {
    enabled: true,
    tokenPrefix: SSO_DOMAIN_VERIFICATION_TOKEN_PREFIX,
  } as const;
}

export function buildEnterpriseSubdomainUrl(slug: string, path = "/"): string {
  const root = getEnterpriseRootDomain();
  const isLocal = root.includes("localhost");
  const protocol = isLocal ? "http" : "https";
  const base = `${protocol}://${slug}.${root}`;
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

export function getAuthAllowedHosts(): string[] {
  const root = getEnterpriseRootDomain();
  const hosts = [root, `*.${root}`, "localhost", "*.localhost"];
  if (!root.includes("localhost")) {
    hosts.push("localhost:3000", "*.localhost:3000");
  }
  return hosts;
}
