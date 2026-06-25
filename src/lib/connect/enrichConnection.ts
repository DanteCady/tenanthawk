import { db } from "@/db";
import { fetchTenantProfile } from "@/lib/scan/graph";

/** Fill display name and domain on a live connection when Graph is configured. */
export async function enrichConnectionProfile(
  connectionId: string,
  tenantId: string,
): Promise<void> {
  const profile = await fetchTenantProfile(tenantId);
  if (!profile) return;

  await db
    .updateTable("connection")
    .set({
      display_name: profile.displayName,
      tenant_domain: profile.defaultDomain,
    })
    .where("id", "=", connectionId)
    .execute();
}
