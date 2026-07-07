import type { Severity } from "@/db/types";
import type { Check, FindingDraft } from "../types";
import type { ScanPrefetch } from "../prefetch";
import {
  entraDeviceLabel,
  entraDevicesNotInIntune,
  intuneDeviceLabel,
  intuneDevicesNotInEntra,
  personalIntuneDevices,
  staleEntraDevices,
} from "../device-match";

function severityFromCount(
  count: number,
  thresholds: { medium: number; high: number },
): Severity {
  if (count >= thresholds.high) return "high";
  if (count >= thresholds.medium) return "medium";
  return "low";
}

function aggregateDeviceFinding(
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

function getDevices(prefetch?: ScanPrefetch) {
  return {
    entra: prefetch?.entraDevices ?? [],
    intune: prefetch?.intuneDevices ?? [],
  };
}

export const entraUnmanagedDevicesCheck: Check = {
  id: "hygiene.entra-unmanaged-devices",
  category: "hygiene",
  async run(ctx) {
    const { entra, intune } = getDevices(ctx.prefetch);
    if (entra.length === 0) return [];

    const items = entraDevicesNotInIntune(entra, intune);

    return aggregateDeviceFinding(
      entraUnmanagedDevicesCheck.id,
      "hygiene",
      items.length,
      items.map(entraDeviceLabel),
      {
        noun: items.length === 1 ? "Entra device not in Intune" : "Entra devices not in Intune",
        description: `${items.length} Entra-registered device${items.length === 1 ? "" : "s"} are not enrolled in Intune and may lack compliance policies.`,
        remediation:
          "Enroll corporate devices in Intune or retire stale Entra device records in Entra → Devices.",
        severity: severityFromCount(items.length, { medium: 5, high: 15 }),
      },
    );
  },
};

export const intuneGhostEnrollmentCheck: Check = {
  id: "hygiene.intune-ghost-enrollment",
  category: "hygiene",
  async run(ctx) {
    const { entra, intune } = getDevices(ctx.prefetch);
    if (intune.length === 0) return [];

    const items = intuneDevicesNotInEntra(entra, intune);

    return aggregateDeviceFinding(
      intuneGhostEnrollmentCheck.id,
      "hygiene",
      items.length,
      items.map(intuneDeviceLabel),
      {
        noun:
          items.length === 1
            ? "Intune enrollment without Entra device"
            : "Intune enrollments without Entra devices",
        description: `${items.length} Intune-managed device${items.length === 1 ? "" : "s"} cannot be matched to an Entra device record.`,
        remediation:
          "Retire orphaned Intune records in Intra → Devices > All devices, or fix Azure AD join/hybrid join on affected endpoints.",
        severity: severityFromCount(items.length, { medium: 3, high: 10 }),
      },
    );
  },
};

export const entraStaleDevicesCheck: Check = {
  id: "reliability.entra-stale-devices",
  category: "reliability",
  async run(ctx) {
    const { entra } = getDevices(ctx.prefetch);
    if (entra.length === 0) return [];

    const items = staleEntraDevices(entra, 30);

    return aggregateDeviceFinding(
      entraStaleDevicesCheck.id,
      "reliability",
      items.length,
      items.map(entraDeviceLabel),
      {
        noun: items.length === 1 ? "stale Entra device" : "stale Entra devices",
        description: `${items.length} Entra device${items.length === 1 ? "" : "s"} had no sign-in activity in 30+ days.`,
        remediation:
          "Review stale devices in Entra → Devices and disable or delete records for lost or decommissioned hardware.",
        severity: severityFromCount(items.length, { medium: 10, high: 25 }),
      },
    );
  },
};

export const personalDeviceEnrolledCheck: Check = {
  id: "hygiene.personal-device-enrolled",
  category: "hygiene",
  async run(ctx) {
    const { intune } = getDevices(ctx.prefetch);
    if (intune.length === 0) return [];

    const items = personalIntuneDevices(intune);

    return aggregateDeviceFinding(
      personalDeviceEnrolledCheck.id,
      "hygiene",
      items.length,
      items.map(intuneDeviceLabel),
      {
        noun: items.length === 1 ? "personally owned enrolled device" : "personally owned enrolled devices",
        description: `${items.length} Intune-enrolled device${items.length === 1 ? "" : "s"} are marked as personally owned (BYOD). Confirm this matches your access policy.`,
        remediation:
          "Review BYOD enrollment in Intune > Devices and tighten app protection or block personal enrollment if not allowed.",
        severity: severityFromCount(items.length, { medium: 10, high: 25 }),
      },
    );
  },
};
