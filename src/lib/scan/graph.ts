const GRAPH = "https://graph.microsoft.com/v1.0";

export function isLiveConfigured(): boolean {
  return Boolean(process.env.MS_CLIENT_ID && process.env.MS_CLIENT_SECRET);
}

/** Acquire an app-only (client-credentials) Graph token for a tenant. */
export async function getAppToken(tenantId: string): Promise<string> {
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("MS_CLIENT_ID / MS_CLIENT_SECRET not configured");
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

  if (!res.ok) {
    throw new Error(`Token request failed (${res.status})`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

interface GraphPage<T> {
  value?: T[];
  "@odata.nextLink"?: string;
}

export interface TenantProfile {
  displayName: string;
  defaultDomain: string | null;
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

    const defaultDomain =
      org.verifiedDomains?.find((d) => d.isDefault)?.name ??
      org.verifiedDomains?.[0]?.name ??
      null;

    return {
      displayName: org.displayName ?? "Microsoft 365",
      defaultDomain,
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
