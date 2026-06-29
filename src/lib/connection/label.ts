interface ConnectionLike {
  tenant_domain?: string | null;
  display_name?: string | null;
  mode?: string | null;
}

const GENERIC_DISPLAY = "Microsoft 365";

/** Compact label from a tenant domain (e.g. fabrikam.onmicrosoft.com → Fabrikam). */
export function shortTenantDomain(domain: string): string {
  const normalized = domain.trim().toLowerCase();
  const withoutSuffix = normalized.replace(
    /\.(onmicrosoft\.com|microsoftonline\.com)$/i,
    "",
  );
  const slug = (withoutSuffix.split(".")[0] ?? withoutSuffix).trim();
  if (!slug) return domain.trim();
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

/** Human-readable label for a client tenant connection. */
export function connectionLabel(conn: ConnectionLike): string {
  const display = conn.display_name?.trim();
  const domain = conn.tenant_domain?.trim();

  if (display && display !== GENERIC_DISPLAY) return display;
  if (domain) return shortTenantDomain(domain);
  if (display) return display;

  return conn.mode === "demo" ? "Contoso (demo)" : GENERIC_DISPLAY;
}
