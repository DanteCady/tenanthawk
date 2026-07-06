import { fetchGraphReport } from "./graph-reports";
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

export interface TeamsActivityRow {
  teamId: string;
  teamName: string;
  lastActivityDate: string | null;
  activeChannels: number;
  guests: number;
}

export interface ScanPrefetch {
  groups: PrefetchGroup[];
  teamsActivity: TeamsActivityRow[];
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
export const GROUP_GRACE_DAYS = 7;

export function isTeamGroup(g: PrefetchGroup): boolean {
  return g.resourceProvisioningOptions.some((o) => o.toLowerCase() === "team");
}

export function isWithinGracePeriod(createdDateTime: string | undefined, days: number): boolean {
  if (!createdDateTime) return false;
  return Date.now() - new Date(createdDateTime).getTime() < days * DAY;
}

function rowVal(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== "") return row[key];
    const match = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
    if (match && row[match] !== undefined) return row[match] ?? "";
  }
  return "";
}

function parseCount(value: string): number {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

export function daysSinceActivity(dateStr: string | null): number | null {
  if (!dateStr?.trim()) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / DAY);
}

async function fetchGroups(token: string): Promise<PrefetchGroup[]> {
  // Graph returns 400 if owners and members are expanded in the same request.
  const [withOwners, withMembers] = await Promise.all([
    graphGet<GraphGroupRow>(
      token,
      "/groups?$select=id,displayName,groupTypes,resourceProvisioningOptions,createdDateTime&$expand=owners($select=id)&$top=999",
    ),
    graphGet<GraphGroupRow>(
      token,
      "/groups?$select=id&$expand=members($select=id)&$top=999",
    ).catch((err) => {
      console.warn("[scan] group member count prefetch failed", err);
      return [] as GraphGroupRow[];
    }),
  ]);

  const memberCountById = new Map(
    withMembers
      .filter((g) => g.id)
      .map((g) => [
        g.id as string,
        g["members@odata.count"] ?? g.members?.length ?? 0,
      ]),
  );

  return withOwners
    .filter((g) => g.id)
    .map((g) => ({
      id: g.id as string,
      displayName: g.displayName?.trim() || g.id || "Unnamed group",
      groupTypes: g.groupTypes ?? [],
      resourceProvisioningOptions: g.resourceProvisioningOptions ?? [],
      createdDateTime: g.createdDateTime,
      ownerIds: (g.owners ?? []).map((o) => o.id).filter(Boolean) as string[],
      memberCount: memberCountById.get(g.id as string) ?? 0,
    }));
}

/** Teams usage report (90-day window). Empty array if report unavailable. */
export async function fetchTeamsActivity(token: string): Promise<TeamsActivityRow[]> {
  const rows = await fetchGraphReport<Record<string, string>>(
    token,
    "/reports/getTeamsTeamActivityDetail(period='D90')",
  );

  return rows
    .map((row) => {
      const teamId = rowVal(row, "Team Id", "teamId");
      const teamName = rowVal(row, "Team Name", "teamName");
      if (!teamId && !teamName) return null;

      const lastActivityDate = rowVal(row, "Last Activity Date", "lastActivityDate") || null;

      return {
        teamId: teamId || teamName,
        teamName: teamName || teamId,
        lastActivityDate,
        activeChannels: parseCount(rowVal(row, "Active Channels", "activeChannels")),
        guests: parseCount(rowVal(row, "Guests", "guests")),
      };
    })
    .filter((r): r is TeamsActivityRow => r !== null);
}

/** Fetch shared scan data for collaboration / Teams checks. Never throws — checks degrade when data is missing. */
export async function buildScanPrefetch(token: string): Promise<ScanPrefetch> {
  const [groups, teamsActivity] = await Promise.all([
    fetchGroups(token).catch((err) => {
      console.warn("[scan] group prefetch failed", err);
      return [] as PrefetchGroup[];
    }),
    fetchTeamsActivity(token).catch((err) => {
      console.warn("[scan] teams activity report unavailable", err);
      return [] as TeamsActivityRow[];
    }),
  ]);

  return { groups, teamsActivity };
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

export function teamGroups(prefetch: ScanPrefetch): PrefetchGroup[] {
  return prefetch.groups.filter(isTeamGroup);
}
