import { graphGet } from "./graph";

export interface PrefetchGroup {
  id: string;
  displayName: string;
  groupTypes: string[];
  resourceProvisioningOptions: string[];
  createdDateTime?: string;
  ownerIds: string[];
  memberCount: number;
}

export interface ScanPrefetch {
  groups: PrefetchGroup[];
}

interface GraphGroupRow {
  id?: string;
  displayName?: string;
  groupTypes?: string[];
  resourceProvisioningOptions?: string[];
  createdDateTime?: string;
  owners?: Array<{ id?: string }>;
  members?: Array<{ id?: string }>;
  "members@odata.count"?: number;
}

const DAY = 86_400_000;
const GROUP_GRACE_DAYS = 7;

export function isTeamGroup(g: PrefetchGroup): boolean {
  return g.resourceProvisioningOptions.some((o) => o.toLowerCase() === "team");
}

export function isWithinGracePeriod(createdDateTime: string | undefined, days: number): boolean {
  if (!createdDateTime) return false;
  return Date.now() - new Date(createdDateTime).getTime() < days * DAY;
}

/** Fetch groups once per scan for collaboration checks. */
export async function buildScanPrefetch(token: string): Promise<ScanPrefetch> {
  const rows = await graphGet<GraphGroupRow>(
    token,
    "/groups?$select=id,displayName,groupTypes,resourceProvisioningOptions,createdDateTime&$expand=owners($select=id),members($select=id)&$top=999",
  );

  const groups: PrefetchGroup[] = rows
    .filter((g) => g.id)
    .map((g) => ({
      id: g.id as string,
      displayName: g.displayName?.trim() || g.id || "Unnamed group",
      groupTypes: g.groupTypes ?? [],
      resourceProvisioningOptions: g.resourceProvisioningOptions ?? [],
      createdDateTime: g.createdDateTime,
      ownerIds: (g.owners ?? []).map((o) => o.id).filter(Boolean) as string[],
      memberCount: g["members@odata.count"] ?? g.members?.length ?? 0,
    }));

  return { groups };
}

export function ownerlessGroups(
  prefetch: ScanPrefetch,
  opts?: { teamsOnly?: boolean; graceDays?: number },
): PrefetchGroup[] {
  const graceDays = opts?.graceDays ?? GROUP_GRACE_DAYS;
  return prefetch.groups.filter((g) => {
    if (g.ownerIds.length > 0) return false;
    if (isWithinGracePeriod(g.createdDateTime, graceDays)) return false;
    if (opts?.teamsOnly && !isTeamGroup(g)) return false;
    if (opts?.teamsOnly === false && isTeamGroup(g)) return false;
    return true;
  });
}
