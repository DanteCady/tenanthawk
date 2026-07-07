import type { ScanPrefetch } from "./prefetch";
import { buildTeamsDeepData } from "./checks/teams-deep";
import { fetchOneDriveUsage } from "./checks/sharepoint-deep";

export interface DeepScanPrefetch {
  teams?: Awaited<ReturnType<typeof buildTeamsDeepData>>;
  onedrive?: Awaited<ReturnType<typeof fetchOneDriveUsage>>;
}

export async function buildDeepScanPrefetch(
  token: string,
  prefetch: ScanPrefetch,
): Promise<DeepScanPrefetch> {
  const [teams, onedrive] = await Promise.all([
    buildTeamsDeepData(token, prefetch).catch((err) => {
      console.warn("[scan] teams deep prefetch failed", err);
      return undefined;
    }),
    fetchOneDriveUsage(token).catch((err) => {
      console.warn("[scan] onedrive usage report unavailable", err);
      return undefined;
    }),
  ]);

  return { teams, onedrive };
}
