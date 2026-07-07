import type { Severity } from "@/db/types";
import { graphGet } from "../graph";
import { fetchGraphReport } from "../graph-reports";
import {
  DEFAULT_COPILOT_SEAT_USD,
  isCopilotSkuPartNumber,
} from "../constants/copilot-skus";
import {
  copilotUsageLabel,
  isCopilotUsageObfuscated,
  parseCopilotUsageRow,
  type CopilotUsageRow,
} from "../copilot-usage";
import { buildCopilotReadinessFindings } from "../copilot-readiness";
import type { Check, FindingDraft, ScanContext } from "../types";
import {
  licensePricingNote,
  sumAssignedLicenseUsd,
} from "@/lib/licenses/sku-pricing";

interface SubscribedSku {
  skuId?: string;
  skuPartNumber?: string;
  capabilityStatus?: string;
  prepaidUnits?: { enabled?: number };
  consumedUnits?: { enabled?: number };
}

interface AssignedLicense {
  skuId: string;
}

interface LicensedUser {
  id?: string;
  displayName?: string;
  userPrincipalName?: string;
  accountEnabled?: boolean;
  assignedLicenses?: AssignedLicense[];
}

interface MfaRegistrationRow {
  userPrincipalName?: string;
  userDisplayName?: string;
  isMfaRegistered?: boolean;
}

function formatUsd(usd: number): string {
  return usd.toLocaleString("en-US");
}

function severityFromCount(
  count: number,
  thresholds: { medium: number; high: number },
): Severity {
  if (count >= thresholds.high) return "high";
  if (count >= thresholds.medium) return "medium";
  return "low";
}

function aggregateFinding(
  checkId: string,
  category: FindingDraft["category"],
  count: number,
  entities: string[],
  opts: {
    noun: string;
    description: string;
    remediation: string;
    severity: Severity;
    usd?: number;
  },
): FindingDraft[] {
  if (count === 0) return [];

  return [
    {
      category,
      checkId,
      severity: opts.severity,
      title: `${count} ${opts.noun}`,
      description: opts.description,
      impact: {
        count,
        entities: entities.slice(0, 15),
        ...(opts.usd ? { usd: opts.usd } : {}),
      },
      remediation: opts.remediation,
    },
  ];
}

async function fetchCopilotSkuIds(token: string): Promise<string[]> {
  const skus = await graphGet<SubscribedSku>(token, "/subscribedSkus");
  return skus
    .filter((sku) => isCopilotSkuPartNumber(sku.skuPartNumber))
    .map((sku) => sku.skuId)
    .filter((id): id is string => Boolean(id));
}

async function fetchCopilotUsage(token: string): Promise<CopilotUsageRow[]> {
  const rows = await fetchGraphReport<Record<string, unknown>>(
    token,
    "/reports/getMicrosoft365CopilotUsageUserDetail(period='D30')",
  );
  return rows
    .map((row) => parseCopilotUsageRow(row))
    .filter((row): row is CopilotUsageRow => row !== null);
}

async function fetchLicensedCopilotUsers(
  token: string,
  copilotSkuIds: string[],
): Promise<LicensedUser[]> {
  if (copilotSkuIds.length === 0) return [];

  const users = await graphGet<LicensedUser>(
    token,
    "/users?$select=id,displayName,userPrincipalName,accountEnabled,assignedLicenses&$top=999",
  );

  const skuSet = new Set(copilotSkuIds);
  return users.filter((user) =>
    user.assignedLicenses?.some((license) => skuSet.has(license.skuId)),
  );
}

function tenantHasCopilotLicenses(skus: SubscribedSku[]): boolean {
  return skus.some(
    (sku) =>
      isCopilotSkuPartNumber(sku.skuPartNumber) &&
      (sku.consumedUnits?.enabled ?? 0) > 0,
  );
}

/** Prepaid Microsoft 365 Copilot seats not assigned to any user. */
export const unusedCopilotLicenses: Check = {
  id: "cost.unused-copilot-licenses",
  category: "cost",
  async run({ token }) {
    const skus = await graphGet<SubscribedSku>(token, "/subscribedSkus");
    const findings: FindingDraft[] = [];

    for (const sku of skus) {
      if (sku.capabilityStatus && sku.capabilityStatus !== "Enabled") continue;

      const code = sku.skuPartNumber ?? "";
      if (!isCopilotSkuPartNumber(code)) continue;

      const enabled = sku.prepaidUnits?.enabled ?? 0;
      const consumed = sku.consumedUnits?.enabled ?? 0;
      const unused = enabled - consumed;
      if (unused < 1) continue;

      const usd = unused * DEFAULT_COPILOT_SEAT_USD;

      findings.push({
        category: "cost",
        checkId: unusedCopilotLicenses.id,
        severity: unused >= 5 ? "high" : unused >= 2 ? "medium" : "low",
        title: `~$${formatUsd(usd)}/mo in unused Copilot seats`,
        description: `${enabled} Microsoft 365 Copilot seats are prepaid but only ${consumed} are assigned — ${unused} appear unused. Copilot is typically ~$${DEFAULT_COPILOT_SEAT_USD}/user/mo.`,
        remediation:
          "Assign Copilot to intended users in M365 Admin → Users, or reduce prepaid Copilot seats in Billing before renewal.",
        entityRef: code,
        impact: { count: unused, usd },
      });
    }

    return findings;
  },
};

export const copilotLicensedInactiveCheck: Check = {
  id: "cost.copilot-licensed-inactive",
  category: "cost",
  async run({ token, licensePricing }) {
    const [skus, usage, licensedUsers] = await Promise.all([
      graphGet<SubscribedSku>(token, "/subscribedSkus"),
      fetchCopilotUsage(token).catch(() => [] as CopilotUsageRow[]),
      fetchCopilotSkuIds(token).then((ids) => fetchLicensedCopilotUsers(token, ids)),
    ]);

    if (!tenantHasCopilotLicenses(skus) || licensedUsers.length === 0) return [];
    if (usage.length > 0 && isCopilotUsageObfuscated(usage)) return [];

    const usageByUpn = new Map(
      usage
        .filter((row) => row.userPrincipalName)
        .map((row) => [row.userPrincipalName.toLowerCase(), row]),
    );

    const inactive = licensedUsers.filter((user) => {
      const upn = user.userPrincipalName?.toLowerCase();
      if (!upn) return true;
      const row = usageByUpn.get(upn);
      return !row || !row.hasAnyActivity;
    });

    const skuById = new Map(
      skus.filter((sku) => sku.skuId).map((sku) => [sku.skuId as string, sku]),
    );
    const copilotSkuSet = new Set(
      skus
        .filter((sku) => isCopilotSkuPartNumber(sku.skuPartNumber) && sku.skuId)
        .map((sku) => sku.skuId as string),
    );

    let totalUsd = 0;
    for (const user of inactive) {
      const copilotLicenses = (user.assignedLicenses ?? []).filter((license) =>
        copilotSkuSet.has(license.skuId),
      );
      const { usd } = sumAssignedLicenseUsd(copilotLicenses, skuById, licensePricing);
      totalUsd += usd;
    }
    if (totalUsd === 0) {
      totalUsd = inactive.length * DEFAULT_COPILOT_SEAT_USD;
    }

    const savingsLine =
      totalUsd > 0
        ? ` Estimated recoverable spend: ~$${formatUsd(totalUsd)}/mo. ${licensePricingNote(licensePricing)}`
        : "";

    return aggregateFinding(
      copilotLicensedInactiveCheck.id,
      "cost",
      inactive.length,
      inactive.map((user) => user.displayName ?? user.userPrincipalName ?? "Unknown user"),
      {
        noun:
          inactive.length === 1
            ? "licensed inactive Copilot user"
            : "licensed inactive Copilot users",
        description: `${inactive.length} Copilot-licensed user${inactive.length === 1 ? "" : "s"} had no Copilot activity in the last 30 days.${savingsLine}`,
        remediation:
          "Reassign unused Copilot licenses or coach inactive users on adoption in M365 Admin → Users.",
        severity:
          inactive.length >= 5 && inactive.length / licensedUsers.length > 0.2
            ? "high"
            : severityFromCount(inactive.length, { medium: 5, high: 15 }),
        usd: totalUsd > 0 ? totalUsd : undefined,
      },
    );
  },
};

export const copilotAssignedDisabledUserCheck: Check = {
  id: "cost.copilot-assigned-disabled-user",
  category: "cost",
  async run({ token }) {
    const copilotSkuIds = await fetchCopilotSkuIds(token);
    const licensedUsers = await fetchLicensedCopilotUsers(token, copilotSkuIds);
    const disabled = licensedUsers.filter((user) => user.accountEnabled === false);

    return aggregateFinding(
      copilotAssignedDisabledUserCheck.id,
      "cost",
      disabled.length,
      disabled.map((user) => user.displayName ?? user.userPrincipalName ?? "Unknown user"),
      {
        noun:
          disabled.length === 1
            ? "disabled account with Copilot license"
            : "disabled accounts with Copilot licenses",
        description: `${disabled.length} disabled account${disabled.length === 1 ? "" : "s"} still hold a Microsoft 365 Copilot license.`,
        remediation:
          "Remove Copilot licenses from disabled accounts in M365 Admin → Users.",
        severity: disabled.length > 0 ? "high" : "low",
        usd: disabled.length * DEFAULT_COPILOT_SEAT_USD,
      },
    );
  },
};

export const copilotLowAdoptionCheck: Check = {
  id: "hygiene.copilot-low-adoption",
  category: "hygiene",
  async run({ token }) {
    const [skus, usage, licensedUsers] = await Promise.all([
      graphGet<SubscribedSku>(token, "/subscribedSkus"),
      fetchCopilotUsage(token).catch(() => [] as CopilotUsageRow[]),
      fetchCopilotSkuIds(token).then((ids) => fetchLicensedCopilotUsers(token, ids)),
    ]);

    if (!tenantHasCopilotLicenses(skus) || licensedUsers.length === 0) return [];
    if (usage.length > 0 && isCopilotUsageObfuscated(usage)) return [];

    const usageByUpn = new Map(
      usage
        .filter((row) => row.userPrincipalName)
        .map((row) => [row.userPrincipalName.toLowerCase(), row]),
    );

    const active = licensedUsers.filter((user) => {
      const upn = user.userPrincipalName?.toLowerCase();
      if (!upn) return false;
      return usageByUpn.get(upn)?.hasAnyActivity ?? false;
    });

    const rate = active.length / licensedUsers.length;
    if (rate >= 0.25) return [];

    const pct = Math.round(rate * 100);

    return [
      {
        category: "hygiene",
        checkId: copilotLowAdoptionCheck.id,
        severity: rate < 0.1 ? "high" : "medium",
        title: `Low Copilot adoption (${pct}% active)`,
        description: `Only ${active.length} of ${licensedUsers.length} Copilot-licensed users (${pct}%) were active in the last 30 days.`,
        impact: {
          count: licensedUsers.length - active.length,
          entities: licensedUsers
            .filter((user) => {
              const upn = user.userPrincipalName?.toLowerCase();
              return !upn || !usageByUpn.get(upn)?.hasAnyActivity;
            })
            .slice(0, 15)
            .map((user) => user.displayName ?? user.userPrincipalName ?? "Unknown user"),
        },
        remediation:
          "Run a Copilot adoption campaign, identify champions, and remove licenses from users who do not need them.",
      },
    ];
  },
};

export const copilotAppSkewCheck: Check = {
  id: "hygiene.copilot-app-skew",
  category: "hygiene",
  async run({ token }) {
    const usage = await fetchCopilotUsage(token).catch(() => [] as CopilotUsageRow[]);
    if (usage.length === 0 || isCopilotUsageObfuscated(usage)) return [];

    const chatOnly = usage.filter(
      (row) => row.hasChatActivity && !row.hasM365AppActivity,
    );
    if (chatOnly.length < 3) return [];

    return aggregateFinding(
      copilotAppSkewCheck.id,
      "hygiene",
      chatOnly.length,
      chatOnly.map(copilotUsageLabel),
      {
        noun:
          chatOnly.length === 1
            ? "Copilot Chat-only user"
            : "Copilot Chat-only users",
        description: `${chatOnly.length} user${chatOnly.length === 1 ? "" : "s"} used Copilot Chat but not Word, Outlook, Teams, or other Microsoft 365 Copilot apps in the last 30 days.`,
        remediation:
          "Coach users on Copilot in Word, Outlook, and Teams to improve rollout ROI.",
        severity: "low",
      },
    );
  },
};

export const copilotLicensedNoMfaCheck: Check = {
  id: "security.copilot-licensed-no-mfa",
  category: "security",
  async run({ token }) {
    const [licensedUsers, mfaRows] = await Promise.all([
      fetchCopilotSkuIds(token).then((ids) => fetchLicensedCopilotUsers(token, ids)),
      graphGet<MfaRegistrationRow>(
        token,
        "/reports/authenticationMethods/userRegistrationDetails",
      ),
    ]);

    if (licensedUsers.length === 0) return [];

    const mfaByUpn = new Map(
      mfaRows
        .filter((row) => row.userPrincipalName)
        .map((row) => [row.userPrincipalName!.toLowerCase(), row.isMfaRegistered === true]),
    );

    const unprotected = licensedUsers.filter((user) => {
      const upn = user.userPrincipalName?.toLowerCase();
      return !upn || !mfaByUpn.get(upn);
    });

    return aggregateFinding(
      copilotLicensedNoMfaCheck.id,
      "security",
      unprotected.length,
      unprotected.map((user) => user.displayName ?? user.userPrincipalName ?? "Unknown user"),
      {
        noun:
          unprotected.length === 1
            ? "Copilot-licensed user without MFA"
            : "Copilot-licensed users without MFA",
        description: `${unprotected.length} Copilot-licensed user${unprotected.length === 1 ? "" : "s"} do not have MFA registered.`,
        remediation:
          "Require MFA for Copilot users via Conditional Access and complete MFA registration.",
        severity: unprotected.length > 0 ? "high" : "low",
      },
    );
  },
};

export const copilotChatOnlyUsageCheck: Check = {
  id: "hygiene.copilot-chat-only-usage",
  category: "hygiene",
  async run({ token }) {
    const usage = await fetchCopilotUsage(token).catch(() => [] as CopilotUsageRow[]);
    if (usage.length === 0 || isCopilotUsageObfuscated(usage)) return [];

    const active = usage.filter((row) => row.hasAnyActivity);
    const chatOnly = active.filter(
      (row) => row.hasChatActivity && !row.hasM365AppActivity,
    );
    if (active.length < 4 || chatOnly.length / active.length <= 0.5) return [];

    const pct = Math.round((chatOnly.length / active.length) * 100);

    return [
      {
        category: "hygiene",
        checkId: copilotChatOnlyUsageCheck.id,
        severity: "low",
        title: `${pct}% of active Copilot users are Chat-only`,
        description: `${chatOnly.length} of ${active.length} active Copilot users (${pct}%) only used Copilot Chat in the last 30 days.`,
        impact: {
          count: chatOnly.length,
          entities: chatOnly.slice(0, 15).map(copilotUsageLabel),
        },
        remediation:
          "Share rollout guides for Copilot in Word, Excel, Outlook, and Teams to broaden adoption beyond chat.",
      },
    ];
  },
};

export const copilotReadinessBlockersCheck: Check = {
  id: "copilot.readiness-blockers",
  category: "hygiene",
  async run(ctx: ScanContext) {
    if (!ctx.priorFindings?.length) return [];
    return buildCopilotReadinessFindings(ctx.priorFindings);
  },
};
