const GRAPH = "https://graph.microsoft.com/v1.0";

export function isLiveConfigured(): boolean {
  return Boolean(process.env.MS_CLIENT_ID && process.env.MS_CLIENT_SECRET);
}

/** Acquire an app-only (client-credentials) Graph token for a tenant. */
export async function getAppToken(tenantId: string): Promise<string> {
  const result = await probeAppToken(tenantId);
  if (!result.ok) {
    throw new Error(result.error.errorDescription || result.error.error);
  }
  return result.token;
}

export interface AppTokenError {
  error: string;
  errorDescription: string;
  aadstsCode?: string;
}

export type AppTokenProbeResult =
  | { ok: true; token: string }
  | { ok: false; error: AppTokenError };

function parseAadstsCode(description: string): string | undefined {
  const match = description.match(/AADSTS(\d+)/i);
  return match?.[1];
}

/** Probe whether app-only auth still works for a tenant (does not throw). */
export async function probeAppToken(tenantId: string): Promise<AppTokenProbeResult> {
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return {
      ok: false,
      error: {
        error: "not_configured",
        errorDescription: "Microsoft Graph credentials are not configured.",
      },
    };
  }

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        scope: "https://graph.microsoft.com/.default",
      }),
    },
  );

  const data = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (res.ok && data.access_token) {
    return { ok: true, token: data.access_token };
  }

  const errorDescription = data.error_description ?? `Token request failed (${res.status})`;
  return {
    ok: false,
    error: {
      error: data.error ?? "token_error",
      errorDescription,
      aadstsCode: parseAadstsCode(errorDescription),
    },
  };
}

interface GraphPage<T> {
  value?: T[];
  "@odata.nextLink"?: string;
}

export interface TenantProfile {
  displayName: string;
  defaultDomain: string | null;
}

function pickPrimaryDomain(
  domains: Array<{ name: string; isDefault?: boolean }>,
): string | null {
  if (domains.length === 0) return null;
  const custom = domains.filter((d) => !d.name.endsWith(".onmicrosoft.com"));
  return (
    custom.find((d) => d.isDefault)?.name ??
    domains.find((d) => d.isDefault)?.name ??
    custom[0]?.name ??
    domains[0]?.name ??
    null
  );
}

/** Resolve tenant display name and primary domain after admin consent. */
export async function fetchTenantProfile(
  tenantId: string,
): Promise<TenantProfile | null> {
  try {
    const token = await getAppToken(tenantId);
    const orgs = await graphGet<{
      displayName?: string;
      verifiedDomains?: Array<{ name: string; isDefault?: boolean }>;
    }>(token, "/organization?$select=displayName,verifiedDomains");

    const org = orgs[0];
    if (!org) return null;

    return {
      displayName: org.displayName ?? "Microsoft 365",
      defaultDomain: pickPrimaryDomain(org.verifiedDomains ?? []),
    };
  } catch (err) {
    console.error("[graph] tenant profile fetch failed", err);
    return null;
  }
}

/** GET a Graph collection, following @odata.nextLink paging. */
export async function graphGet<T = unknown>(
  token: string,
  path: string,
): Promise<T[]> {
  let url: string | undefined = path.startsWith("http")
    ? path
    : `${GRAPH}${path}`;
  const out: T[] = [];

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        ConsistencyLevel: "eventual",
      },
    });
    if (!res.ok) throw new Error(`Graph ${res.status} for ${url}`);
    const data = (await res.json()) as GraphPage<T> & T;
    if (Array.isArray(data.value)) {
      out.push(...data.value);
      url = data["@odata.nextLink"];
    } else {
      return [data as unknown as T];
    }
  }
  return out;
}
