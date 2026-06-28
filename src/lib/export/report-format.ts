import type { FindingImpact } from "@/db/types";
import { formatLicenseEntityRef } from "@/lib/licenses/sku-display";

export function formatReportDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function formatFindingImpact(input: {
  impact?: FindingImpact;
  entityRef?: string | null;
}): string {
  const impact = input.impact;
  if (impact?.usd != null) return `$${impact.usd.toLocaleString()}/mo`;
  if (impact?.count != null && impact.count > 1) return `${impact.count} items`;
  if (input.entityRef) return formatLicenseEntityRef(input.entityRef);
  return "—";
}

export function formatExportImpact(f: {
  impactUsd: number | null;
  impactCount?: number | null;
  entityRef: string | null;
}): string {
  if (f.impactUsd != null) return `$${f.impactUsd.toLocaleString()}/mo`;
  if (f.impactCount != null && f.impactCount > 0) {
    return f.impactCount === 1 ? "1 item" : `${f.impactCount} items`;
  }
  if (f.entityRef) return formatLicenseEntityRef(f.entityRef);
  return "—";
}

export function formatAffectedItems(entities?: string[], total?: number | null): string {
  if (!entities?.length) return "";
  const listed = entities.join("; ");
  const count = total ?? entities.length;
  if (count > entities.length) {
    return `${listed} (${count} total)`;
  }
  return listed;
}

export function entityItemsLabel(checkId: string): string {
  if (checkId === "hygiene.empty-groups" || checkId === "hygiene.disabled-outside-group") {
    return "Affected groups";
  }
  if (checkId.startsWith("hygiene.intune") || checkId.startsWith("reliability.intune")) {
    return "Affected devices";
  }
  return "Affected items";
}
