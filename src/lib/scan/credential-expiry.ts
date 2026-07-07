import type { Severity } from "@/db/types";
import type { FindingDraft } from "./types";

const DAY = 86_400_000;
const EXPIRY_WINDOW_DAYS = 30;

export type CredentialKind = "secret" | "certificate";

export interface CredentialExpiryItem {
  appName: string;
  kind: CredentialKind;
  daysUntil: number;
  expiresAt: string;
}

interface CredentialExpiryGroup {
  appName: string;
  kind: CredentialKind;
  expired: boolean;
  daysUntil: number;
  items: CredentialExpiryItem[];
}

function severityForGroup(group: CredentialExpiryGroup): Severity {
  if (group.expired) return "high";
  if (group.daysUntil <= 7) return "high";
  if (group.daysUntil <= 30) return "medium";
  return "low";
}

function groupKey(item: CredentialExpiryItem): string {
  if (item.daysUntil < 0) {
    return `expired|${item.kind}|${item.appName.toLowerCase()}`;
  }
  return `expiring|${item.kind}|${item.appName.toLowerCase()}|${item.daysUntil}`;
}

function formatExpiryDetail(item: CredentialExpiryItem): string {
  const label = item.kind === "secret" ? "Secret" : "Certificate";
  if (item.daysUntil < 0) {
    return `${label} · expired ${Math.abs(item.daysUntil)}d ago (${item.expiresAt.slice(0, 10)})`;
  }
  return `${label} · expires ${item.expiresAt.slice(0, 10)} (${item.daysUntil}d)`;
}

function titleForGroup(group: CredentialExpiryGroup): string {
  const kindLabel = group.kind === "secret" ? "secret" : "certificate";
  const kindPlural = group.kind === "secret" ? "secrets" : "certificates";
  const count = group.items.length;
  const app = group.appName;

  if (group.expired) {
    if (count === 1) return `Expired ${kindLabel} on ${app}`;
    return `${count} expired ${kindPlural} on ${app}`;
  }

  if (count === 1) {
    return `${kindLabel} on ${app} expires in ${group.daysUntil}d`;
  }
  return `${count} ${kindPlural} on ${app} expire in ${group.daysUntil}d`;
}

function descriptionForGroup(group: CredentialExpiryGroup): string {
  const kind = group.kind === "secret" ? "secret" : "certificate";
  const count = group.items.length;
  const app = group.appName;

  if (group.expired) {
    return `${count} ${kind}${count === 1 ? "" : "s"} on ${app} expired and may already be breaking sign-in or integrations.`;
  }
  return `${count} ${kind}${count === 1 ? "" : "s"} on ${app} expire in ${group.daysUntil} days. Integrations using them will fail at expiry.`;
}

export function collectCredentialExpiries(
  apps: Array<{
    displayName?: string;
    passwordCredentials?: Array<{ endDateTime?: string }>;
    keyCredentials?: Array<{ endDateTime?: string }>;
  }>,
  now = Date.now(),
): CredentialExpiryItem[] {
  const items: CredentialExpiryItem[] = [];

  for (const app of apps) {
    const appName = app.displayName?.trim() || "Unknown app";
    const creds = [
      ...(app.passwordCredentials ?? []).map((c) => ({ ...c, kind: "secret" as const })),
      ...(app.keyCredentials ?? []).map((c) => ({ ...c, kind: "certificate" as const })),
    ];

    for (const cred of creds) {
      if (!cred.endDateTime) continue;
      const daysUntil = Math.round((new Date(cred.endDateTime).getTime() - now) / DAY);
      if (daysUntil > EXPIRY_WINDOW_DAYS) continue;
      items.push({
        appName,
        kind: cred.kind,
        daysUntil,
        expiresAt: cred.endDateTime,
      });
    }
  }

  return items;
}

export function buildCredentialExpiryFindings(
  items: CredentialExpiryItem[],
  opts: {
    checkId: string;
    remediation: string;
  },
): FindingDraft[] {
  const groups = new Map<string, CredentialExpiryGroup>();

  for (const item of items) {
    const key = groupKey(item);
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, {
        appName: item.appName,
        kind: item.kind,
        expired: item.daysUntil < 0,
        daysUntil: item.daysUntil,
        items: [item],
      });
      continue;
    }
    existing.items.push(item);
    if (item.daysUntil < existing.daysUntil) {
      existing.daysUntil = item.daysUntil;
    }
  }

  return [...groups.values()].map((group) => ({
    category: "reliability" as const,
    checkId: opts.checkId,
    severity: severityForGroup(group),
    title: titleForGroup(group),
    description: descriptionForGroup(group),
    remediation: opts.remediation,
    entityRef: group.appName,
    impact: {
      count: group.items.length,
      daysUntil: group.daysUntil,
      expiresAt: group.items
        .map((item) => item.expiresAt)
        .sort()[0],
      entities: group.items.map(formatExpiryDetail),
    },
  }));
}
