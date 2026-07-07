import type { Severity } from "@/db/types";
import { graphGet } from "../graph";
import type { MailboxUsageRow } from "../exchange-mailbox-label";
import {
  isReportObfuscated,
  mailboxUsageLabel,
} from "../exchange-mailbox-label";
import { daysSinceActivity } from "../prefetch";
import type { Check, FindingDraft, ScanContext } from "../types";
import {
  licensePricingNote,
  sumAssignedLicenseUsd,
} from "@/lib/licenses/sku-pricing";

const GB = 1024 ** 3;
const STORAGE_WARN_BYTES = 50 * GB;
const FORWARDING_USER_CAP = 150;

interface SubscribedSku {
  skuId?: string;
  skuPartNumber?: string;
}

interface AssignedLicense {
  skuId: string;
}

interface LicensedUser {
  id?: string;
  displayName?: string;
  userPrincipalName?: string;
  mail?: string;
  assignedLicenses?: AssignedLicense[];
}

interface MailboxSettings {
  forwardingSmtpAddress?: string | null;
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

function activeMailboxes(prefetch?: ScanContext["prefetch"]): MailboxUsageRow[] {
  return prefetch?.mailboxUsage.filter((m) => !m.isDeleted) ?? [];
}

function isExternalAddress(address: string, tenantDomains: Set<string>): boolean {
  const domain = address.split("@")[1]?.toLowerCase();
  if (!domain) return true;
  return !tenantDomains.has(domain);
}

async function fetchTenantDomains(token: string): Promise<Set<string>> {
  const orgs = await graphGet<{
    verifiedDomains?: Array<{ name?: string }>;
  }>(token, "/organization?$select=verifiedDomains");
  const domains = new Set<string>();
  for (const org of orgs) {
    for (const d of org.verifiedDomains ?? []) {
      if (d.name) domains.add(d.name.toLowerCase());
    }
  }
  return domains;
}

async function scanMailboxForwarding(
  token: string,
): Promise<{ external: LicensedUser[]; enabled: LicensedUser[]; denied: boolean }> {
  try {
    const [users, tenantDomains] = await Promise.all([
      graphGet<LicensedUser>(
        token,
        "/users?$filter=accountEnabled eq true&$select=id,displayName,userPrincipalName,mail&$top=999",
      ),
      fetchTenantDomains(token),
    ]);

    const external: LicensedUser[] = [];
    const enabled: LicensedUser[] = [];
    let denied = false;

    for (const user of users.slice(0, FORWARDING_USER_CAP)) {
      if (!user.id) continue;
      try {
        const settings = await graphGet<MailboxSettings>(
          token,
          `/users/${user.id}/mailboxSettings`,
        );
        const forwardTo = settings[0]?.forwardingSmtpAddress?.trim();
        if (!forwardTo) continue;

        enabled.push(user);
        if (isExternalAddress(forwardTo, tenantDomains)) {
          external.push(user);
        }
      } catch (err) {
        const msg = String(err);
        if (msg.includes("403") || msg.includes("Access is denied")) {
          denied = true;
          break;
        }
      }
    }

    return { external, enabled, denied };
  } catch {
    return { external: [], enabled: [], denied: true };
  }
}

function userLabel(user: LicensedUser): string {
  return user.displayName ?? user.userPrincipalName ?? user.mail ?? "Unknown mailbox";
}

export const mailboxForwardingExternalCheck: Check = {
  id: "hygiene.mailbox-forwarding-external",
  category: "hygiene",
  async run({ token }) {
    const { external, denied } = await scanMailboxForwarding(token);
    if (denied || external.length === 0) return [];

    return aggregateFinding(
      mailboxForwardingExternalCheck.id,
      "hygiene",
      external.length,
      external.map(userLabel),
      {
        noun:
          external.length === 1
            ? "mailbox forwarding externally"
            : "mailboxes forwarding externally",
        description: `${external.length} mailbox${external.length === 1 ? "" : "es"} forward email to an external SMTP address.`,
        remediation:
          "Review mailbox forwarding in Microsoft 365 admin or Exchange admin center and remove unauthorized external forwards.",
        severity: severityFromCount(external.length, { medium: 3, high: 8 }),
      },
    );
  },
};

export const mailboxForwardingEnabledCheck: Check = {
  id: "hygiene.mailbox-forwarding-enabled",
  category: "hygiene",
  async run({ token }) {
    const { external, enabled, denied } = await scanMailboxForwarding(token);
    if (denied) return [];

    const internalOnly = enabled.filter(
      (u) => !external.some((e) => e.id === u.id),
    );
    if (internalOnly.length === 0) return [];

    return aggregateFinding(
      mailboxForwardingEnabledCheck.id,
      "hygiene",
      internalOnly.length,
      internalOnly.map(userLabel),
      {
        noun:
          internalOnly.length === 1
            ? "mailbox with forwarding enabled"
            : "mailboxes with forwarding enabled",
        description: `${internalOnly.length} mailbox${internalOnly.length === 1 ? "" : "es"} have SMTP forwarding enabled within the tenant.`,
        remediation:
          "Confirm forwarding is intentional. Disable unused forwarding rules in Exchange admin or user Outlook settings.",
        severity: severityFromCount(internalOnly.length, { medium: 5, high: 15 }),
      },
    );
  },
};

export const inactiveMailboxesCheck: Check = {
  id: "hygiene.inactive-mailboxes",
  category: "hygiene",
  async run(ctx) {
    const mailboxes = activeMailboxes(ctx.prefetch);
    if (mailboxes.length === 0) return [];

    const inactive = mailboxes.filter((m) => {
      const days = daysSinceActivity(m.lastActivityDate);
      return days === null || days >= 90;
    });

    const hasVeryStale = inactive.some((m) => {
      const days = daysSinceActivity(m.lastActivityDate);
      return days === null || days >= 180;
    });

    return aggregateFinding(
      inactiveMailboxesCheck.id,
      "hygiene",
      inactive.length,
      inactive.map(mailboxUsageLabel),
      {
        noun: inactive.length === 1 ? "inactive mailbox" : "inactive mailboxes",
        description: `${inactive.length} mailbox${inactive.length === 1 ? "" : "es"} had no activity in 90+ days${hasVeryStale ? " (some 180+ days)" : ""}.`,
        remediation:
          "Review inactive mailboxes in Exchange admin, convert to shared, or remove licenses from unused accounts.",
        severity: hasVeryStale
          ? "high"
          : severityFromCount(inactive.length, { medium: 10, high: 25 }),
      },
    );
  },
};

export const mailboxHighStorageCheck: Check = {
  id: "hygiene.mailbox-high-storage",
  category: "hygiene",
  async run(ctx) {
    const mailboxes = activeMailboxes(ctx.prefetch);
    if (mailboxes.length === 0) return [];

    const heavy = mailboxes.filter((m) => m.storageUsedBytes >= STORAGE_WARN_BYTES);
    const hasVeryHeavy = heavy.some((m) => m.storageUsedBytes >= 100 * GB);

    return aggregateFinding(
      mailboxHighStorageCheck.id,
      "hygiene",
      heavy.length,
      heavy.map(mailboxUsageLabel),
      {
        noun: heavy.length === 1 ? "high-storage mailbox" : "high-storage mailboxes",
        description: `${heavy.length} mailbox${heavy.length === 1 ? "" : "es"} use more than 50 GB of storage${hasVeryHeavy ? " (some over 100 GB)" : ""}.`,
        remediation:
          "Review large mailboxes in Exchange admin, enable archiving, or apply retention policies.",
        severity: hasVeryHeavy ? "high" : severityFromCount(heavy.length, { medium: 3, high: 8 }),
      },
    );
  },
};

export const inactiveMailboxLicensesCheck: Check = {
  id: "cost.inactive-mailbox-licenses",
  category: "cost",
  async run({ token, licensePricing, prefetch }) {
    const mailboxes = activeMailboxes(prefetch);
    if (mailboxes.length === 0 || isReportObfuscated(mailboxes)) return [];

    const inactiveByUpn = new Map<string, MailboxUsageRow>();
    for (const m of mailboxes) {
      const upn = m.userPrincipalName.toLowerCase();
      if (!upn) continue;
      const days = daysSinceActivity(m.lastActivityDate);
      if (days === null || days >= 90) inactiveByUpn.set(upn, m);
    }
    if (inactiveByUpn.size === 0) return [];

    const [users, skus] = await Promise.all([
      graphGet<LicensedUser>(
        token,
        "/users?$select=displayName,userPrincipalName,assignedLicenses&$top=999",
      ),
      graphGet<SubscribedSku>(token, "/subscribedSkus"),
    ]);

    const skuById = new Map(
      skus.filter((s) => s.skuId).map((s) => [s.skuId as string, s]),
    );

    const matches: LicensedUser[] = [];
    let totalUsd = 0;

    for (const user of users) {
      const upn = user.userPrincipalName?.toLowerCase();
      if (!upn || !inactiveByUpn.has(upn)) continue;
      if ((user.assignedLicenses?.length ?? 0) === 0) continue;
      matches.push(user);
      const { usd } = sumAssignedLicenseUsd(user.assignedLicenses ?? [], skuById, licensePricing);
      totalUsd += usd;
    }

    if (matches.length === 0) return [];

    const savingsLine =
      totalUsd > 0
        ? ` Estimated recoverable spend: ~$${totalUsd.toLocaleString("en-US")}/mo. ${licensePricingNote(licensePricing)}`
        : "";

    return aggregateFinding(
      inactiveMailboxLicensesCheck.id,
      "cost",
      matches.length,
      matches.map(userLabel),
      {
        noun:
          matches.length === 1
            ? "licensed inactive mailbox"
            : "licensed inactive mailboxes",
        description: `${matches.length} licensed mailbox${matches.length === 1 ? "" : "es"} show no activity in 90+ days.${savingsLine}`,
        remediation:
          "Remove or reassign licenses from inactive mailboxes in M365 Admin → Users.",
        severity: severityFromCount(matches.length, { medium: 3, high: 10 }),
        usd: totalUsd > 0 ? totalUsd : undefined,
      },
    );
  },
};
