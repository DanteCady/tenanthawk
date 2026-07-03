import { isLiveConfigured, probeAppToken, type AppTokenError } from "@/lib/scan/graph";

export type ConnectionHealthStatus =
  | "connected"
  | "demo"
  | "app_removed"
  | "consent_revoked"
  | "error";

export interface ConnectionHealth {
  status: ConnectionHealthStatus;
  label: string;
  detail: string;
  reconnect: boolean;
  checkedAt: string;
}

interface ConnectionLike {
  id: string;
  mode: "live" | "demo";
  tenant_id: string | null;
  tenant_domain?: string | null;
  display_name?: string | null;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { health: ConnectionHealth; expires: number }>();

function classifyTokenError(error: AppTokenError): ConnectionHealthStatus {
  const desc = error.errorDescription.toLowerCase();
  const code = error.aadstsCode;

  if (
    code === "700016" ||
    desc.includes("was not found in the directory") ||
    (desc.includes("application") && desc.includes("not found"))
  ) {
    return "app_removed";
  }

  if (
    code === "65001" ||
    desc.includes("has not consented") ||
    desc.includes("consent")
  ) {
    return "consent_revoked";
  }

  return "error";
}

function healthFromStatus(
  status: ConnectionHealthStatus,
  detail?: string,
): Omit<ConnectionHealth, "checkedAt"> {
  switch (status) {
    case "connected":
      return {
        status,
        label: "Connected",
        detail:
          detail ??
          "Tenant Hawk can authenticate to this tenant. Scans and monitoring should work.",
        reconnect: false,
      };
    case "demo":
      return {
        status,
        label: "Demo",
        detail: "Sample Contoso data - not connected to a live tenant.",
        reconnect: false,
      };
    case "app_removed":
      return {
        status,
        label: "App disconnected",
        detail:
          detail ??
          "The Tenant Hawk enterprise app was removed from this tenant or is no longer recognized. Reconnect to restore scans.",
        reconnect: true,
      };
    case "consent_revoked":
      return {
        status,
        label: "Consent required",
        detail:
          detail ??
          "Admin consent for Tenant Hawk was revoked. A Global Administrator must reconnect the app.",
        reconnect: true,
      };
    default:
      return {
        status: "error",
        label: "Connection issue",
        detail:
          detail ??
          "Tenant Hawk could not authenticate to this tenant. Try reconnecting or contact support.",
        reconnect: true,
      };
  }
}

async function probeConnectionHealth(conn: ConnectionLike): Promise<ConnectionHealth> {
  const checkedAt = new Date().toISOString();

  if (conn.mode === "demo") {
    return { ...healthFromStatus("demo"), checkedAt };
  }

  if (!conn.tenant_id) {
    return {
      ...healthFromStatus(
        "error",
        "No tenant ID on file. Reconnect Microsoft 365 from Settings.",
      ),
      checkedAt,
    };
  }

  if (!isLiveConfigured()) {
    return {
      ...healthFromStatus(
        "error",
        "Live Microsoft connection is not configured on this environment.",
      ),
      checkedAt,
    };
  }

  const probe = await probeAppToken(conn.tenant_id);
  if (probe.ok) {
    return { ...healthFromStatus("connected"), checkedAt };
  }

  const status = classifyTokenError(probe.error);
  return {
    ...healthFromStatus(status, probe.error.errorDescription),
    checkedAt,
  };
}

/** Live-check whether our enterprise app can still authenticate to the tenant. */
export async function getConnectionHealth(
  conn: ConnectionLike,
): Promise<ConnectionHealth> {
  const cached = cache.get(conn.id);
  if (cached && cached.expires > Date.now()) {
    return cached.health;
  }

  const health = await probeConnectionHealth(conn);
  cache.set(conn.id, { health, expires: Date.now() + CACHE_TTL_MS });
  return health;
}

/** Clear cached health after reconnect or manual rescan. */
export function invalidateConnectionHealth(connectionId: string): void {
  cache.delete(connectionId);
}
