import type { Check, FindingDraft } from "../types";
import { ownerlessGroups } from "../prefetch";
import type { ScanPrefetch } from "../prefetch";

function aggregateOwnerlessFinding(
  checkId: string,
  noun: string,
  items: { displayName: string }[],
  thresholds: { medium: number; high: number },
  remediation: string,
): FindingDraft[] {
  if (items.length === 0) return [];

  const names = items.slice(0, 15).map((g) => g.displayName);
  const severity =
    items.length >= thresholds.high ? "high" : items.length >= thresholds.medium ? "medium" : "low";
  const plural = items.length === 1 ? noun : `${noun}s`;

  return [
    {
      category: "hygiene",
      checkId,
      severity,
      title: `${items.length} ownerless ${plural}`,
      description: `${items.length} ${plural} have no assigned owners. Ownerless groups and Teams are hard to govern and often accumulate stale data.`,
      impact: { count: items.length, entities: names },
      remediation,
    },
  ];
}

function getPrefetch(ctx: { prefetch?: ScanPrefetch }): ScanPrefetch | null {
  return ctx.prefetch ?? null;
}

export const ownerlessGroupsCheck: Check = {
  id: "hygiene.ownerless-groups",
  category: "hygiene",
  async run(ctx) {
    const prefetch = getPrefetch(ctx);
    if (!prefetch) return [];

    const items = ownerlessGroups(prefetch, { teamsOnly: false }).filter(
      (g) => !g.resourceProvisioningOptions.some((o) => o.toLowerCase() === "team"),
    );

    return aggregateOwnerlessFinding(
      ownerlessGroupsCheck.id,
      "group",
      items,
      { medium: 10, high: 25 },
      "Assign at least two owners per group in Entra → Groups, or delete unused groups.",
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

    return aggregateOwnerlessFinding(
      ownerlessTeamsCheck.id,
      "Microsoft Team",
      items,
      { medium: 5, high: 15 },
      "Assign owners in Teams admin or Entra group owners; archive or delete unused Teams.",
    );
  },
};
