import "server-only";
import { getEnterpriseClientCap } from "@/lib/billing/pricing";
import { hasMspConsoleEntitlement } from "@/lib/entitlements/msp-console";
import { getConnections } from "@/lib/queries";

export type EnterpriseClientLimit = {
  cap: number;
  count: number;
  atCap: boolean;
  canAdd: boolean;
};

export async function getEnterpriseClientLimit(
  userId: string,
  email: string,
): Promise<EnterpriseClientLimit> {
  const [entitled, connections] = await Promise.all([
    hasMspConsoleEntitlement(userId, email),
    getConnections(userId),
  ]);
  const cap = getEnterpriseClientCap();
  const count = connections.length;

  if (!entitled) {
    return { cap, count, atCap: false, canAdd: false };
  }

  return {
    cap,
    count,
    atCap: count >= cap,
    canAdd: count < cap,
  };
}
