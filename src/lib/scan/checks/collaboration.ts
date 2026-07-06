import type { Check, FindingDraft } from "../types";
import type { Severity } from "@/db/types";
import {
  daysSinceActivity,
  GROUP_GRACE_DAYS,
  isWithinGracePeriod,
  ownerlessGroups,
  teamGroups,
} from "../prefetch";
import type { ScanPrefetch, TeamsActivityRow } from "../prefetch";

function aggregateFinding(
  checkId: string,
  count: number,
  names: string[],
  opts: {
    noun: string;
    description: string;
    remediation: string;
    severity: Severity;
  },
): FindingDraft[] {
  if (count === 0) return [];

  return [
    {
      category: "hygiene",
      checkId,
      severity: opts.severity,
      title: `${count} ${opts.noun}`,
      description: opts.description,
      impact: { count, entities: names.slice(0, 15) },
      remediation: opts.remediation,
    },
  ];
}

function getPrefetch(ctx: { prefetch?: ScanPrefetch }): ScanPrefetch | null {
  return ctx.prefetch ?? null;
}

function severityFromCount(
  count: number,
  thresholds: { medium: number; high: number },
): Severity {
  if (count >= thresholds.high) return "high";
  if (count >= thresholds.medium) return "medium";
  return "low";
}

export const ownerlessGroupsCheck: Check = {
  id: "hygiene.ownerless-groups",
  category: "hygiene",
  async run(ctx) {
    const prefetch = getPrefetch(ctx);
    if (!prefetch) return [];

    const items = ownerlessGroups(prefetch, { teamsOnly: false });

    return aggregateFinding(
      ownerlessGroupsCheck.id,
      items.length,
      items.map((g) => g.displayName),
      {
        noun: items.length === 1 ? "ownerless group" : "ownerless groups",
        description: `${items.length} group${items.length === 1 ? "" : "s"} have no assigned owners. Ownerless groups are hard to govern and often accumulate stale data.`,
        remediation:
          "Assign at least two owners per group in Entra → Groups, or delete unused groups.",
        severity: severityFromCount(items.length, { medium: 10, high: 25 }),
      },
    );
  },
};

export const ownerlessTeamsCheck: Check = {
  id: "hygiene.ownerless-teams",
  category: "hygiene",
  async run(ctx) {
    const prefetch = getPrefetch(ctx);
    if (!prefetch) return [];

    const items = ownerlessGroups(prefetch, { teamsOnly: true });

    return aggregateFinding(
      ownerlessTeamsCheck.id,
      items.length,
      items.map((g) => g.displayName),
      {
        noun: items.length === 1 ? "ownerless Microsoft Team" : "ownerless Microsoft Teams",
        description: `${items.length} Microsoft Team${items.length === 1 ? "" : "s"} have no assigned owners. Ownerless Teams are hard to govern and often accumulate stale data.`,
        remediation:
          "Assign owners in Teams admin or Entra group owners; archive or delete unused Teams.",
        severity: severityFromCount(items.length, { medium: 5, high: 15 }),
      },
    );
  },
};

export const emptyTeamsCheck: Check = {
  id: "hygiene.empty-teams",
  category: "hygiene",
  async run(ctx) {
    const prefetch = getPrefetch(ctx);
    if (!prefetch) return [];

    const items = teamGroups(prefetch).filter(
      (g) =>
        g.memberCount === 0 && !isWithinGracePeriod(g.createdDateTime, GROUP_GRACE_DAYS),
    );

    return aggregateFinding(
      emptyTeamsCheck.id,
      items.length,
      items.map((g) => g.displayName),
      {
        noun: items.length === 1 ? "empty Microsoft Team" : "empty Microsoft Teams",
        description: `${items.length} Microsoft Team${items.length === 1 ? "" : "s"} have zero members. Empty Teams clutter the tenant and may indicate abandoned projects.`,
        remediation: "Archive or delete unused Teams in Teams admin, or add members if the Team is still needed.",
        severity: severityFromCount(items.length, { medium: 10, high: 25 }),
      },
    );
  },
};

function staleTeams(rows: TeamsActivityRow[]): TeamsActivityRow[] {
  return rows.filter((row) => {
    const days = daysSinceActivity(row.lastActivityDate);
    return days === null || days >= 90;
  });
}

export const staleTeamsCheck: Check = {
  id: "hygiene.stale-teams",
  category: "hygiene",
  async run(ctx) {
    const prefetch = getPrefetch(ctx);
    if (!prefetch?.teamsActivity.length) return [];

    const items = staleTeams(prefetch.teamsActivity);
    const hasVeryStale = items.some((row) => {
      const days = daysSinceActivity(row.lastActivityDate);
      return days === null || days >= 180;
    });

    const severity: Severity = hasVeryStale
      ? "high"
      : items.length >= 5
        ? "medium"
        : items.length > 0
          ? "low"
          : "low";

    return aggregateFinding(
      staleTeamsCheck.id,
      items.length,
      items.map((r) => r.teamName),
      {
        noun: items.length === 1 ? "stale Microsoft Team" : "stale Microsoft Teams",
        description: `${items.length} Microsoft Team${items.length === 1 ? "" : "s"} had no activity in 90+ days${hasVeryStale ? " (some 180+ days)" : ""}. Stale Teams add noise to search and Copilot grounding.`,
        remediation:
          "Review inactive Teams in Teams admin and archive or delete those no longer needed.",
        severity: items.length === 0 ? "low" : severity,
      },
    );
  },
};

export const teamsNoActiveChannelsCheck: Check = {
  id: "hygiene.teams-no-active-channels",
  category: "hygiene",
  async run(ctx) {
    const prefetch = getPrefetch(ctx);
    if (!prefetch?.teamsActivity.length) return [];

    const items = prefetch.teamsActivity.filter((row) => row.activeChannels === 0);

    return aggregateFinding(
      teamsNoActiveChannelsCheck.id,
      items.length,
      items.map((r) => r.teamName),
      {
        noun:
          items.length === 1
            ? "Team with no active channels"
            : "Teams with no active channels",
        description: `${items.length} Microsoft Team${items.length === 1 ? "" : "s"} report zero active channels in the last 90 days. Channels may be unused or abandoned.`,
        remediation:
          "Review channel usage in Teams admin and remove or archive unused channels.",
        severity: severityFromCount(items.length, { medium: 5, high: 15 }),
      },
    );
  },
};

export const teamsGuestHeavyCheck: Check = {
  id: "hygiene.teams-guest-heavy",
  category: "hygiene",
  async run(ctx) {
    const prefetch = getPrefetch(ctx);
    if (!prefetch?.teamsActivity.length) return [];

    const items = prefetch.teamsActivity.filter((row) => row.guests >= 10);

    return aggregateFinding(
      teamsGuestHeavyCheck.id,
      items.length,
      items.map((r) => r.teamName),
      {
        noun: items.length === 1 ? "guest-heavy Team" : "guest-heavy Teams",
        description: `${items.length} Microsoft Team${items.length === 1 ? "" : "s"} had 10+ guest users active in the last 90 days. Heavy guest presence increases data-exposure risk.`,
        remediation:
          "Review guest access in Teams admin and Entra → External Identities; remove stale guests.",
        severity: severityFromCount(items.length, { medium: 3, high: 8 }),
      },
    );
  },
};

const NAMING_CHAOS_PATTERN =
  /\b(test|temp|tmp|old|archive|deleted|delete|deprecated|sandbox|poc|demo|do not use)\b/i;

export const groupsNamingChaosCheck: Check = {
  id: "hygiene.groups-naming-chaos",
  category: "hygiene",
  async run(ctx) {
    const prefetch = getPrefetch(ctx);
    if (!prefetch) return [];

    const items = prefetch.groups.filter((g) => NAMING_CHAOS_PATTERN.test(g.displayName));
    if (items.length === 0) return [];

    return aggregateFinding(
      groupsNamingChaosCheck.id,
      items.length,
      items.map((g) => g.displayName),
      {
        noun: items.length === 1 ? "group with risky naming" : "groups with risky naming",
        description: `${items.length} group${items.length === 1 ? "" : "s"} use Test/Temp/Old/Archive-style names. This is informational — rename or document groups to improve directory hygiene.`,
        remediation:
          "Rename or delete ambiguous groups in Entra → Groups so admins can trust directory search.",
        severity: "low",
      },
    );
  },
};
