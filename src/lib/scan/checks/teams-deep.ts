import type { Severity } from "@/db/types";
import { graphGet } from "../graph";
import { teamGroups, type PrefetchGroup, type ScanPrefetch } from "../prefetch";
import { teamsActivityLabel } from "../teams-activity-label";
import type { Check, FindingDraft, ScanContext } from "../types";

const TEAM_CAP = 50;
const CHANNEL_CAP = 8;

interface GraphUser {
  id?: string;
  accountEnabled?: boolean;
}

interface GraphChannel {
  id?: string;
  displayName?: string;
  membershipType?: string;
}

interface GraphMessage {
  createdDateTime?: string;
}

interface InstalledApp {
  id?: string;
  teamsAppDefinition?: {
    displayName?: string;
    publishingState?: string;
    teamsAppId?: string;
  };
}

export interface TeamsDeepData {
  disabledOwnerTeams: PrefetchGroup[];
  inactiveChannels: Array<{ teamLabel: string; channelName: string }>;
  emptyChannels: Array<{ teamLabel: string; channelName: string }>;
  privateOwnerlessChannels: Array<{ teamLabel: string; channelName: string }>;
  unverifiedApps: Array<{ teamLabel: string; appName: string }>;
}

function aggregateFinding(
  checkId: string,
  count: number,
  entities: string[],
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
      impact: { count, entities: entities.slice(0, 15) },
      remediation: opts.remediation,
    },
  ];
}

function severityFromCount(
  count: number,
  thresholds: { medium: number; high: number },
): Severity {
  if (count >= thresholds.high) return "high";
  if (count >= thresholds.medium) return "medium";
  return "low";
}

function teamLabel(prefetch: ScanPrefetch, teamId: string): string {
  const row = prefetch.teamsActivity.find((t) => t.teamId === teamId);
  if (row) return teamsActivityLabel(row);
  const group = prefetch.groups.find((g) => g.id === teamId);
  return group?.displayName ?? teamId;
}

export async function buildTeamsDeepData(
  token: string,
  prefetch: ScanPrefetch,
): Promise<TeamsDeepData> {
  const teams = teamGroups(prefetch).slice(0, TEAM_CAP);
  const disabledUsers = await graphGet<GraphUser>(
    token,
    "/users?$filter=accountEnabled eq false&$select=id&$top=999",
  ).catch(() => [] as GraphUser[]);
  const disabledIds = new Set(disabledUsers.map((u) => u.id).filter(Boolean) as string[]);

  const disabledOwnerTeams = teams.filter(
    (team) =>
      team.ownerIds.length > 0 && team.ownerIds.every((ownerId) => disabledIds.has(ownerId)),
  );

  const inactiveChannels: TeamsDeepData["inactiveChannels"] = [];
  const emptyChannels: TeamsDeepData["emptyChannels"] = [];
  const privateOwnerlessChannels: TeamsDeepData["privateOwnerlessChannels"] = [];
  const unverifiedApps: TeamsDeepData["unverifiedApps"] = [];

  const cutoff = Date.now() - 180 * 86_400_000;

  for (const team of teams) {
    const label = teamLabel(prefetch, team.id);
    let channels: GraphChannel[] = [];
    try {
      channels = await graphGet<GraphChannel>(
        token,
        `/teams/${team.id}/channels?$select=id,displayName,membershipType&$top=50`,
      );
    } catch {
      continue;
    }

    for (const channel of channels.slice(0, CHANNEL_CAP)) {
      if (!channel.id) continue;
      const channelName = channel.displayName?.trim() || "Unnamed channel";

      if (channel.membershipType?.toLowerCase() === "private") {
        try {
          const members = await graphGet<{ id?: string }>(
            token,
            `/teams/${team.id}/channels/${channel.id}/members?$select=id&$top=1`,
          );
          if (members.length === 0) {
            privateOwnerlessChannels.push({ teamLabel: label, channelName });
          }
        } catch {
          // Channel membership requires elevated Teams permissions.
        }
      }

      let messages: GraphMessage[] = [];
      try {
        messages = await graphGet<GraphMessage>(
          token,
          `/teams/${team.id}/channels/${channel.id}/messages?$top=1&$orderby=createdDateTime desc`,
        );
      } catch {
        continue;
      }

      if (messages.length === 0) {
        emptyChannels.push({ teamLabel: label, channelName });
        continue;
      }

      const created = messages[0]?.createdDateTime;
      if (!created || new Date(created).getTime() < cutoff) {
        inactiveChannels.push({ teamLabel: label, channelName });
      }
    }

    try {
      const apps = await graphGet<InstalledApp>(
        token,
        `/teams/${team.id}/installedApps?$expand=teamsAppDefinition&$top=30`,
      );
      for (const app of apps) {
        const name = app.teamsAppDefinition?.displayName?.trim();
        const state = app.teamsAppDefinition?.publishingState?.toLowerCase() ?? "";
        if (!name) continue;
        if (state === "submitted" || state === "rejected" || state === "published") continue;
        unverifiedApps.push({ teamLabel: label, appName: name });
      }
    } catch {
      // Installed apps enumeration may require Team.ReadBasic.All.
    }
  }

  return {
    disabledOwnerTeams,
    inactiveChannels,
    emptyChannels,
    privateOwnerlessChannels,
    unverifiedApps,
  };
}

function getDeepData(ctx: ScanContext): TeamsDeepData | null {
  return ctx.deepPrefetch?.teams ?? null;
}

export const teamsDisabledOwnerCheck: Check = {
  id: "hygiene.teams-disabled-owner",
  category: "hygiene",
  async run(ctx) {
    const data = getDeepData(ctx);
    if (!data) return [];

    return aggregateFinding(
      teamsDisabledOwnerCheck.id,
      data.disabledOwnerTeams.length,
      data.disabledOwnerTeams.map((team) => team.displayName),
      {
        noun:
          data.disabledOwnerTeams.length === 1
            ? "Team with disabled owners"
            : "Teams with disabled owners",
        description: `${data.disabledOwnerTeams.length} Microsoft Team${data.disabledOwnerTeams.length === 1 ? "" : "s"} have only disabled owners.`,
        remediation:
          "Assign an active owner to each Team in Teams admin or Entra group owners.",
        severity: data.disabledOwnerTeams.length > 0 ? "high" : "low",
      },
    );
  },
};

export const inactiveChannelsCheck: Check = {
  id: "hygiene.inactive-channels",
  category: "hygiene",
  async run(ctx) {
    const data = getDeepData(ctx);
    if (!data || data.inactiveChannels.length === 0) return [];

    const entities = data.inactiveChannels.map(
      (row) => `${row.teamLabel} · ${row.channelName}`,
    );

    return aggregateFinding(
      inactiveChannelsCheck.id,
      data.inactiveChannels.length,
      entities,
      {
        noun:
          data.inactiveChannels.length === 1
            ? "inactive channel"
            : "inactive channels",
        description: `${data.inactiveChannels.length} channel${data.inactiveChannels.length === 1 ? "" : "s"} had no user messages in 180+ days (deep scan sample).`,
        remediation:
          "Archive unused channels or encourage adoption in active project Teams.",
        severity: severityFromCount(data.inactiveChannels.length, { medium: 5, high: 15 }),
      },
    );
  },
};

export const emptyChannelsCheck: Check = {
  id: "hygiene.empty-channels",
  category: "hygiene",
  async run(ctx) {
    const data = getDeepData(ctx);
    if (!data || data.emptyChannels.length === 0) return [];

    const entities = data.emptyChannels.map((row) => `${row.teamLabel} · ${row.channelName}`);

    return aggregateFinding(
      emptyChannelsCheck.id,
      data.emptyChannels.length,
      entities,
      {
        noun: data.emptyChannels.length === 1 ? "empty channel" : "empty channels",
        description: `${data.emptyChannels.length} channel${data.emptyChannels.length === 1 ? "" : "s"} have never had a user message (deep scan sample).`,
        remediation: "Delete unused channels or merge conversations into active channels.",
        severity: severityFromCount(data.emptyChannels.length, { medium: 5, high: 20 }),
      },
    );
  },
};

export const privateChannelsOwnerlessCheck: Check = {
  id: "hygiene.private-channels-ownerless",
  category: "hygiene",
  async run(ctx) {
    const data = getDeepData(ctx);
    if (!data || data.privateOwnerlessChannels.length === 0) return [];

    const entities = data.privateOwnerlessChannels.map(
      (row) => `${row.teamLabel} · ${row.channelName}`,
    );

    return aggregateFinding(
      privateChannelsOwnerlessCheck.id,
      data.privateOwnerlessChannels.length,
      entities,
      {
        noun:
          data.privateOwnerlessChannels.length === 1
            ? "ownerless private channel"
            : "ownerless private channels",
        description: `${data.privateOwnerlessChannels.length} private channel${data.privateOwnerlessChannels.length === 1 ? "" : "s"} appear to have no members (deep scan sample).`,
        remediation:
          "Assign owners to private channels or delete abandoned private channels.",
        severity: "medium",
      },
    );
  },
};

export const teamsUnverifiedAppsCheck: Check = {
  id: "hygiene.teams-unverified-apps",
  category: "hygiene",
  async run(ctx) {
    const data = getDeepData(ctx);
    if (!data || data.unverifiedApps.length === 0) return [];

    const entities = data.unverifiedApps.map((row) => `${row.teamLabel} · ${row.appName}`);

    return aggregateFinding(
      teamsUnverifiedAppsCheck.id,
      data.unverifiedApps.length,
      entities,
      {
        noun:
          data.unverifiedApps.length === 1
            ? "unverified Teams app"
            : "unverified Teams apps",
        description: `${data.unverifiedApps.length} sideloaded or unverified app${data.unverifiedApps.length === 1 ? "" : "s"} installed in sampled Teams.`,
        remediation:
          "Review Teams app permissions and remove unverified or sideloaded apps.",
        severity: severityFromCount(data.unverifiedApps.length, { medium: 3, high: 8 }),
      },
    );
  },
};

export const teamsOutdatedAppsCheck: Check = {
  id: "hygiene.teams-outdated-apps",
  category: "hygiene",
  async run(ctx) {
    const data = getDeepData(ctx);
    if (!data) return [];

    const outdated = data.unverifiedApps.filter((row) =>
      row.appName.toLowerCase().includes("beta"),
    );

    if (outdated.length === 0) return [];

    const entities = outdated.map((row) => `${row.teamLabel} · ${row.appName}`);

    return aggregateFinding(
      teamsOutdatedAppsCheck.id,
      outdated.length,
      entities,
      {
        noun: outdated.length === 1 ? "outdated Teams app" : "outdated Teams apps",
        description: `${outdated.length} installed Teams app${outdated.length === 1 ? "" : "s"} may be outdated relative to the org catalog (deep scan heuristic).`,
        remediation:
          "Update org-wide Teams apps from the Teams admin app catalog.",
        severity: "low",
      },
    );
  },
};
