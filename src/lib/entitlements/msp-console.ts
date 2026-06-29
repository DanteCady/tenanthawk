import "server-only";
import { isMsp } from "@/lib/entitlements";
import { getConnections } from "@/lib/queries";

function parseAllowlist(): Set<string> {
  const raw = process.env.MSP_ENTITLEMENT_ALLOWLIST;
  if (!raw?.trim()) return new Set();
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** Manual Enterprise access for design partners (until Stripe org billing). */
export function isEmailMspAllowlisted(email: string): boolean {
  return parseAllowlist().has(email.trim().toLowerCase());
}

export async function hasMspConsoleEntitlement(
  userId: string,
  email: string,
): Promise<boolean> {
  if (await isMsp(userId)) return true;
  return isEmailMspAllowlisted(email);
}

export type MspConsoleAccess = {
  entitled: boolean;
  multiTenant: boolean;
  /** Portfolio chrome: roll-up, clients nav, context bar */
  showConsole: boolean;
  connectionCount: number;
};

export async function getMspConsoleAccess(
  userId: string,
  email: string,
): Promise<MspConsoleAccess> {
  const [entitled, connections] = await Promise.all([
    hasMspConsoleEntitlement(userId, email),
    getConnections(userId),
  ]);
  const connectionCount = connections.length;
  const multiTenant = connectionCount > 1;

  return {
    entitled,
    multiTenant,
    showConsole: entitled && multiTenant,
    connectionCount,
  };
}
