import type { Severity } from "@/db/types";
import { graphGet } from "../graph";
import { daysSinceActivity } from "../prefetch";
import {
  isReportObfuscated,
  mailboxUsageLabel,
  parseMailboxUsageRow,
  type MailboxUsageRow,
} from "../exchange-mailbox-label";
import { fetchGraphReport } from "../graph-reports";
import type { Check, FindingDraft, ScanContext } from "../types";

const AUTO_REPLY_SAMPLE_CAP = 40;

interface MailboxSettings {
  automaticRepliesSetting?: {
    status?: string;
    scheduledStartDateTime?: { dateTime?: string };
    scheduledEndDateTime?: { dateTime?: string };
  };
}

interface GraphUser {
  id?: string;
  userPrincipalName?: string;
  displayName?: string;
  mail?: string;
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
      impact: { count, entities: entities.slice(0, 15) },
      remediation: opts.remediation,
    },
  ];
}

function recipientType(row: Record<string, unknown>): string {
  return String(row["Recipient Type"] ?? row.recipientType ?? "")
    .trim()
    .toLowerCase();
}

async function fetchMailboxRowsWithType(token: string): Promise<
  Array<MailboxUsageRow & { recipientType: string }>
> {
  const rows = await fetchGraphReport<Record<string, unknown>>(
    token,
    "/reports/getMailboxUsageDetail(period='D30')",
  );

  return rows
    .map((row) => {
      const parsed = parseMailboxUsageRow(row);
      if (!parsed || parsed.isDeleted) return null;
      return { ...parsed, recipientType: recipientType(row) };
    })
    .filter((row): row is MailboxUsageRow & { recipientType: string } => row !== null);
}

function isSharedMailbox(type: string): boolean {
  return type.includes("shared");
}

function isResourceMailbox(type: string): boolean {
  return type.includes("room") || type.includes("equipment") || type.includes("resource");
}

export const sharedMailboxInactiveCheck: Check = {
  id: "hygiene.shared-mailbox-inactive",
  category: "hygiene",
  async run({ token, prefetch }) {
    void prefetch;
    const rows = await fetchMailboxRowsWithType(token).catch(() => []);
    if (rows.length === 0 || isReportObfuscated(rows)) return [];

    const inactive = rows.filter((row) => {
      if (!isSharedMailbox(row.recipientType)) return false;
      const days = daysSinceActivity(row.lastActivityDate);
      return days === null || days >= 90;
    });

    return aggregateFinding(
      sharedMailboxInactiveCheck.id,
      "hygiene",
      inactive.length,
      inactive.map((row) => mailboxUsageLabel(row, "inactive")),
      {
        noun:
          inactive.length === 1 ? "inactive shared mailbox" : "inactive shared mailboxes",
        description: `${inactive.length} shared mailbox${inactive.length === 1 ? "" : "es"} had no activity in 90+ days.`,
        remediation:
          "Convert unused shared mailboxes to groups or remove delegate access for abandoned mailboxes.",
        severity: inactive.length > 0 ? "medium" : "low",
      },
    );
  },
};

export const resourceMailboxUnusedCheck: Check = {
  id: "hygiene.resource-mailbox-unused",
  category: "hygiene",
  async run({ token }) {
    const rows = await fetchMailboxRowsWithType(token).catch(() => []);
    if (rows.length === 0 || isReportObfuscated(rows)) return [];

    const unused = rows.filter((row) => {
      if (!isResourceMailbox(row.recipientType)) return false;
      const days = daysSinceActivity(row.lastActivityDate);
      return days === null || days >= 90;
    });

    return aggregateFinding(
      resourceMailboxUnusedCheck.id,
      "hygiene",
      unused.length,
      unused.map((row) => mailboxUsageLabel(row, "inactive")),
      {
        noun:
          unused.length === 1 ? "unused resource mailbox" : "unused resource mailboxes",
        description: `${unused.length} room or equipment mailbox${unused.length === 1 ? "" : "es"} had no activity in 90+ days.`,
        remediation:
          "Delete or disable unused room and equipment mailboxes in Exchange admin.",
        severity: unused.length > 0 ? "low" : "low",
      },
    );
  },
};

export const sharedMailboxNoDelegateCheck: Check = {
  id: "hygiene.shared-mailbox-no-delegate",
  category: "hygiene",
  async run({ token }) {
    const rows = await fetchMailboxRowsWithType(token).catch(() => []);
    if (rows.length === 0 || isReportObfuscated(rows)) return [];

    const withoutDelegate = rows.filter((row) => {
      if (!isSharedMailbox(row.recipientType)) return false;
      const days = daysSinceActivity(row.lastActivityDate);
      return row.itemCount === 0 && (days === null || days >= 90);
    });

    if (withoutDelegate.length < 2) return [];

    return aggregateFinding(
      sharedMailboxNoDelegateCheck.id,
      "hygiene",
      withoutDelegate.length,
      withoutDelegate.map((row) => mailboxUsageLabel(row, "inactive")),
      {
        noun:
          withoutDelegate.length === 1
            ? "shared mailbox without delegates"
            : "shared mailboxes without delegates",
        description: `${withoutDelegate.length} shared mailbox${withoutDelegate.length === 1 ? "" : "es"} appear unused with no delegate activity (deep scan heuristic).`,
        remediation:
          "Assign Full Access delegates to shared mailboxes or convert them to Microsoft 365 Groups.",
        severity: "medium",
      },
    );
  },
};

export const mailboxAutoReplyStaleCheck: Check = {
  id: "hygiene.mailbox-auto-reply-stale",
  category: "hygiene",
  async run({ token, prefetch }) {
    void prefetch;
    const users = await graphGet<GraphUser>(
      token,
      "/users?$select=id,userPrincipalName,displayName,mail&$filter=accountEnabled eq true&$top=999",
    ).catch(() => [] as GraphUser[]);

    const stale: string[] = [];
    const cutoff = Date.now() - 90 * 86_400_000;

    for (const user of users.slice(0, AUTO_REPLY_SAMPLE_CAP)) {
      const upn = user.userPrincipalName ?? user.mail;
      if (!upn) continue;
      try {
        const settings = await graphGet<MailboxSettings>(
          token,
          `/users/${encodeURIComponent(upn)}/mailboxSettings`,
        );
        const auto = settings[0]?.automaticRepliesSetting;
        if (auto?.status !== "alwaysEnabled" && auto?.status !== "scheduled") continue;
        const end = auto.scheduledEndDateTime?.dateTime;
        if (end && new Date(end).getTime() < cutoff) {
          stale.push(user.displayName ?? upn);
        } else if (auto.status === "alwaysEnabled") {
          stale.push(user.displayName ?? upn);
        }
      } catch {
        // Mail.ReadBasic.All required for mailbox settings.
      }
    }

    if (stale.length === 0) return [];

    return aggregateFinding(
      mailboxAutoReplyStaleCheck.id,
      "hygiene",
      stale.length,
      stale,
      {
        noun:
          stale.length === 1 ? "mailbox with stale auto-reply" : "mailboxes with stale auto-reply",
        description: `${stale.length} mailbox${stale.length === 1 ? "" : "es"} still have automatic replies enabled beyond their intended window (deep scan sample).`,
        remediation:
          "Disable outdated automatic replies in Outlook mailbox settings or Exchange admin.",
        severity: "low",
      },
    );
  },
};
