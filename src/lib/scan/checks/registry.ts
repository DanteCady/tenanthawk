import type { Category } from "@/db/types";

export type ScanSector =
  | "identity"
  | "cost"
  | "teams"
  | "sharepoint"
  | "exchange"
  | "devices"
  | "apps"
  | "copilot";

export type CheckTier = "v1" | "v2" | "informational" | "backlog";
export type ScoreImpact = "full" | "informational" | "none";

export interface CheckDefinition {
  id: string;
  sector: ScanSector;
  tier: CheckTier;
  category: Category;
  module: string;
  permissions: string[];
  scoreImpact: ScoreImpact;
  marketingLabel: string;
  offered: boolean;
  exclusivityGroup?: string;
  graphValidationRef?: string;
}

/** Registry of all scan checks — single source of truth for metadata. */
export const CHECK_DEFINITIONS: CheckDefinition[] = [
  // --- Existing (15) ---
  {
    id: "security.conditional-access",
    sector: "identity",
    tier: "v1",
    category: "security",
    module: "security.ts",
    permissions: ["Policy.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Conditional Access coverage",
    offered: true,
  },
  {
    id: "security.legacy-auth",
    sector: "identity",
    tier: "v1",
    category: "security",
    module: "security.ts",
    permissions: ["Policy.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Legacy authentication",
    offered: true,
  },
  {
    id: "security.mfa-registration",
    sector: "identity",
    tier: "v1",
    category: "security",
    module: "identity.ts",
    permissions: ["Reports.Read.All"],
    scoreImpact: "full",
    marketingLabel: "MFA registration gaps",
    offered: true,
  },
  {
    id: "security.admin-roles",
    sector: "identity",
    tier: "v1",
    category: "security",
    module: "security.ts",
    permissions: ["Directory.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Privileged role assignments",
    offered: true,
  },
  {
    id: "security.guest-accounts",
    sector: "identity",
    tier: "v1",
    category: "security",
    module: "security.ts",
    permissions: ["User.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Guest account sprawl",
    offered: true,
  },
  {
    id: "cost.disabled-user-licenses",
    sector: "cost",
    tier: "v1",
    category: "cost",
    module: "cost.ts",
    permissions: ["User.Read.All", "Organization.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Licenses on disabled accounts",
    offered: true,
  },
  {
    id: "cost.unused-licenses",
    sector: "cost",
    tier: "v1",
    category: "cost",
    module: "cost.ts",
    permissions: ["Organization.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Unused license seats",
    offered: true,
  },
  {
    id: "cost.license-expiry",
    sector: "cost",
    tier: "v1",
    category: "cost",
    module: "cost.ts",
    permissions: ["Organization.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Subscription status warnings",
    offered: true,
  },
  {
    id: "reliability.expiring-secrets",
    sector: "apps",
    tier: "v1",
    category: "reliability",
    module: "reliability.ts",
    permissions: ["Application.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Expiring app secrets and certs",
    offered: true,
  },
  {
    id: "reliability.intune-stale-sync",
    sector: "devices",
    tier: "v1",
    category: "reliability",
    module: "intune.ts",
    permissions: ["DeviceManagementManagedDevices.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Stale Intune device sync",
    offered: true,
  },
  {
    id: "hygiene.inactive-users",
    sector: "identity",
    tier: "v1",
    category: "hygiene",
    module: "identity.ts",
    permissions: ["User.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Inactive user accounts",
    offered: true,
  },
  {
    id: "hygiene.disabled-outside-group",
    sector: "identity",
    tier: "v1",
    category: "hygiene",
    module: "identity.ts",
    permissions: ["Directory.Read.All", "User.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Disabled users outside offboarding groups",
    offered: true,
  },
  {
    id: "hygiene.empty-groups",
    sector: "teams",
    tier: "v1",
    category: "hygiene",
    module: "hygiene.ts",
    permissions: ["Directory.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Empty groups",
    offered: true,
  },
  {
    id: "hygiene.intune-noncompliant",
    sector: "devices",
    tier: "v1",
    category: "hygiene",
    module: "intune.ts",
    permissions: ["DeviceManagementManagedDevices.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Non-compliant Intune devices",
    offered: true,
  },
  {
    id: "hygiene.sharing",
    sector: "sharepoint",
    tier: "v1",
    category: "hygiene",
    module: "sharepoint.ts",
    permissions: ["SharePointTenantSettings.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Org-wide SharePoint sharing policy",
    offered: true,
  },
  {
    id: "hygiene.sharepoint-external-sites",
    sector: "sharepoint",
    tier: "v1",
    category: "hygiene",
    module: "sharepoint.ts",
    permissions: ["Reports.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Sites with external sharing",
    offered: true,
    graphValidationRef: "SP1",
  },
  {
    id: "hygiene.sharepoint-stale-sites",
    sector: "sharepoint",
    tier: "v1",
    category: "hygiene",
    module: "sharepoint.ts",
    permissions: ["Reports.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Stale SharePoint sites",
    offered: true,
    graphValidationRef: "SP1",
  },
  {
    id: "hygiene.sharepoint-high-storage",
    sector: "sharepoint",
    tier: "v1",
    category: "hygiene",
    module: "sharepoint.ts",
    permissions: ["Reports.Read.All"],
    scoreImpact: "full",
    marketingLabel: "High-storage SharePoint sites",
    offered: true,
    graphValidationRef: "SP1",
  },
  {
    id: "hygiene.sharepoint-empty-sites",
    sector: "sharepoint",
    tier: "v1",
    category: "hygiene",
    module: "sharepoint.ts",
    permissions: ["Reports.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Empty SharePoint sites",
    offered: true,
    graphValidationRef: "SP1",
  },
  {
    id: "hygiene.sharepoint-ownerless-sites",
    sector: "sharepoint",
    tier: "v1",
    category: "hygiene",
    module: "sharepoint.ts",
    permissions: ["Reports.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Ownerless SharePoint sites",
    offered: true,
    graphValidationRef: "SP1",
  },
  {
    id: "hygiene.sharepoint-inactive-files",
    sector: "sharepoint",
    tier: "v1",
    category: "hygiene",
    module: "sharepoint.ts",
    permissions: ["Reports.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Sites with inactive files",
    offered: true,
    graphValidationRef: "SP1",
  },
  // --- New (expansion) ---
  {
    id: "hygiene.ownerless-groups",
    sector: "teams",
    tier: "v1",
    category: "hygiene",
    module: "collaboration.ts",
    permissions: ["Directory.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Ownerless groups",
    offered: true,
  },
  {
    id: "hygiene.ownerless-teams",
    sector: "teams",
    tier: "v1",
    category: "hygiene",
    module: "collaboration.ts",
    permissions: ["Directory.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Ownerless Microsoft Teams",
    offered: true,
  },
  {
    id: "hygiene.empty-teams",
    sector: "teams",
    tier: "v1",
    category: "hygiene",
    module: "collaboration.ts",
    permissions: ["Directory.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Empty Microsoft Teams",
    offered: true,
  },
  {
    id: "hygiene.stale-teams",
    sector: "teams",
    tier: "v1",
    category: "hygiene",
    module: "collaboration.ts",
    permissions: ["Reports.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Stale Microsoft Teams",
    offered: true,
    exclusivityGroup: "teams.stale",
    graphValidationRef: "TM1",
  },
  {
    id: "hygiene.teams-no-active-channels",
    sector: "teams",
    tier: "v1",
    category: "hygiene",
    module: "collaboration.ts",
    permissions: ["Reports.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Teams with no active channels",
    offered: true,
    exclusivityGroup: "teams.activity",
    graphValidationRef: "TM1",
  },
  {
    id: "hygiene.teams-guest-heavy",
    sector: "teams",
    tier: "v1",
    category: "hygiene",
    module: "collaboration.ts",
    permissions: ["Reports.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Guest-heavy Teams",
    offered: true,
    graphValidationRef: "TM1",
  },
  {
    id: "hygiene.groups-naming-chaos",
    sector: "teams",
    tier: "informational",
    category: "hygiene",
    module: "collaboration.ts",
    permissions: ["Directory.Read.All"],
    scoreImpact: "informational",
    marketingLabel: "Groups with risky naming patterns",
    offered: true,
  },
  {
    id: "cost.unused-copilot-licenses",
    sector: "copilot",
    tier: "v1",
    category: "cost",
    module: "copilot.ts",
    permissions: ["Organization.Read.All"],
    scoreImpact: "full",
    marketingLabel: "Unused Copilot license seats",
    offered: true,
    graphValidationRef: "CP2",
  },
];

export const CHECK_DEFINITION_BY_ID = new Map(
  CHECK_DEFINITIONS.map((d) => [d.id, d]),
);

export function offeredCheckDefinitions(): CheckDefinition[] {
  return CHECK_DEFINITIONS.filter((d) => d.offered);
}

export function scoredCheckCount(): number {
  return CHECK_DEFINITIONS.filter((d) => d.offered && d.scoreImpact === "full").length;
}

export const SECTOR_LABELS: Record<ScanSector, string> = {
  identity: "Identity",
  cost: "Cost",
  teams: "Teams",
  sharepoint: "SharePoint",
  exchange: "Exchange",
  devices: "Devices",
  apps: "Apps",
  copilot: "Copilot",
};

export function checkSector(checkId: string): ScanSector | undefined {
  return CHECK_DEFINITION_BY_ID.get(checkId)?.sector;
}

export function validateRegisteredCheckIds(registeredIds: string[]): string[] {
  const errors: string[] = [];
  const offered = offeredCheckDefinitions();
  const registered = new Set(registeredIds);

  for (const def of offered) {
    if (!registered.has(def.id)) {
      errors.push(`Missing implementation for offered check: ${def.id}`);
    }
  }

  for (const id of registeredIds) {
    if (!CHECK_DEFINITION_BY_ID.has(id)) {
      errors.push(`Check registered but not in registry: ${id}`);
    }
  }

  return errors;
}
