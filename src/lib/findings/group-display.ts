import type { Severity } from "@/db/types";
import type { FindingDTO } from "@/components/app/FindingsTable";

const CREDENTIAL_EXPIRY_CHECKS = new Set([
  "reliability.expiring-secrets",
  "reliability.service-principal-secrets",
]);

export interface FindingDisplayGroup {
  key: string;
  items: FindingDTO[];
  title: string;
  severity: Severity;
  category: FindingDTO["category"];
  checkId: string;
  description: string;
  impact: FindingDTO["impact"];
  remediation: string;
  tracking: FindingDTO["tracking"];
}

function credentialKindFromTitle(title: string): "secret" | "certificate" | "unknown" {
  if (title.toLowerCase().includes("certificate")) return "certificate";
  if (title.toLowerCase().includes("secret")) return "secret";
  return "unknown";
}

function credentialGroupKey(finding: FindingDTO): string | null {
  if (!CREDENTIAL_EXPIRY_CHECKS.has(finding.checkId)) return null;
  const app = finding.entityRef?.trim();
  if (!app) return null;

  const kind = credentialKindFromTitle(finding.title);
  const days = finding.impact?.daysUntil;
  if (days == null) return null;

  if (days <= 0) {
    return `${finding.checkId}|${finding.severity}|${finding.tracking}|${app.toLowerCase()}|expired|${kind}`;
  }
  return `${finding.checkId}|${finding.severity}|${finding.tracking}|${app.toLowerCase()}|expiring|${kind}|${days}`;
}

function pluralizeKind(kind: "secret" | "certificate", count: number): string {
  if (kind === "certificate") return count === 1 ? "certificate" : "certificates";
  return count === 1 ? "secret" : "secrets";
}

function titleForCredentialGroup(items: FindingDTO[]): string {
  const first = items[0];
  const app = first.entityRef ?? "Unknown app";
  const kind = credentialKindFromTitle(first.title);
  const days = first.impact?.daysUntil;
  const count = items.length;
  const kindWord = kind === "unknown" ? "credential" : kind;
  const kindPlural =
    kind === "unknown"
      ? count === 1
        ? "credential"
        : "credentials"
      : pluralizeKind(kind, count);

  if (days != null && days <= 0) {
    if (count === 1) return `Expired ${kindWord} on ${app}`;
    return `${count} expired ${kindPlural} on ${app}`;
  }

  if (days != null) {
    if (count === 1) return `${kindWord} on ${app} expires in ${days}d`;
    return `${count} ${kindPlural} on ${app} expire in ${days}d`;
  }

  return first.title;
}

function mergeImpact(items: FindingDTO[]): FindingDTO["impact"] {
  const entities = items.flatMap((item) => {
    if (item.impact?.entities?.length) return item.impact.entities;
    if (item.entityRef) return [item.title];
    return [];
  });

  const daysUntil = items.reduce<number | undefined>((min, item) => {
    const days = item.impact?.daysUntil;
    if (days == null) return min;
    if (min == null) return days;
    return Math.min(min, days);
  }, undefined);

  const expiresAt = items
    .map((item) => item.impact?.expiresAt)
    .filter((value): value is string => Boolean(value))
    .sort()[0];

  const usd = items.reduce((sum, item) => sum + (item.impact?.usd ?? 0), 0);

  return {
    count: items.length,
    entities: entities.slice(0, 15),
    daysUntil,
    expiresAt,
    ...(usd > 0 ? { usd } : {}),
  };
}

export function groupFindingsForDisplay(findings: FindingDTO[]): FindingDisplayGroup[] {
  const groups = new Map<string, FindingDTO[]>();
  const standalone: FindingDisplayGroup[] = [];

  for (const finding of findings) {
    const key = credentialGroupKey(finding);
    if (!key) {
      standalone.push({
        key: finding.id,
        items: [finding],
        title: finding.title,
        severity: finding.severity,
        category: finding.category,
        checkId: finding.checkId,
        description: finding.description,
        impact: finding.impact,
        remediation: finding.remediation,
        tracking: finding.tracking,
      });
      continue;
    }

    const bucket = groups.get(key) ?? [];
    bucket.push(finding);
    groups.set(key, bucket);
  }

  const grouped = [...groups.entries()].map(([key, items]) => {
    const first = items[0];
    return {
      key,
      items,
      title: titleForCredentialGroup(items),
      severity: first.severity,
      category: first.category,
      checkId: first.checkId,
      description: first.description,
      impact: mergeImpact(items),
      remediation: first.remediation,
      tracking: first.tracking,
    };
  });

  return [...grouped, ...standalone].sort(
    (a, b) =>
      ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]),
  );
}
