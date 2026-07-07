import { graphGet } from "../graph";
import type { Check, ScanContext } from "../types";

const DAY = 86_400_000;
const STALE_SYNC_DAYS = 30;

interface ManagedDevice {
  deviceName?: string;
  complianceState?: string;
  managementAgent?: string;
  lastSyncDateTime?: string;
  operatingSystem?: string;
}

async function loadManagedDevices(ctx: ScanContext): Promise<ManagedDevice[]> {
  const fromPrefetch = ctx.prefetch?.intuneDevices;
  if (fromPrefetch && fromPrefetch.length > 0) {
    return fromPrefetch.map((d) => ({
      deviceName: d.deviceName,
      complianceState: d.complianceState,
      lastSyncDateTime: d.lastSyncDateTime ?? undefined,
      operatingSystem: d.operatingSystem,
    }));
  }

  return graphGet<ManagedDevice>(
    ctx.token,
    "/deviceManagement/managedDevices?$select=deviceName,complianceState,operatingSystem,managementAgent,lastSyncDateTime&$top=999",
  );
}

function deviceNames(devices: ManagedDevice[]): string[] {
  return devices
    .slice(0, 15)
    .map((d) => d.deviceName ?? d.operatingSystem ?? "Unknown device");
}

export const intuneNonCompliant: Check = {
  id: "hygiene.intune-noncompliant",
  category: "hygiene",
  async run(ctx) {
    const devices = await loadManagedDevices(ctx);
    if (devices.length === 0) return [];

    const nonCompliant = devices.filter((d) => d.complianceState === "noncompliant");
    if (nonCompliant.length === 0) return [];

    return [
      {
        category: "hygiene",
        checkId: intuneNonCompliant.id,
        severity: nonCompliant.length >= 5 ? "high" : "medium",
        title: `${nonCompliant.length} non-compliant Intune device${nonCompliant.length === 1 ? "" : "s"}`,
        description: `${nonCompliant.length} of ${devices.length} managed devices report a non-compliant state in Intune.`,
        impact: { count: nonCompliant.length, entities: deviceNames(nonCompliant) },
        remediation:
          "Review device compliance policies and remediation actions in Intune > Devices > Monitor > Noncompliant devices.",
      },
    ];
  },
};

export const intuneStaleSync: Check = {
  id: "reliability.intune-stale-sync",
  category: "reliability",
  async run(ctx) {
    const devices = await loadManagedDevices(ctx);
    if (devices.length === 0) return [];

    const now = Date.now();
    const stale = devices.filter((d) => {
      if (!d.lastSyncDateTime) return true;
      return now - new Date(d.lastSyncDateTime).getTime() >= STALE_SYNC_DAYS * DAY;
    });

    if (stale.length === 0) return [];

    return [
      {
        category: "reliability",
        checkId: intuneStaleSync.id,
        severity: stale.length >= 10 ? "medium" : "low",
        title: `${stale.length} Intune device${stale.length === 1 ? "" : "s"} not synced in ${STALE_SYNC_DAYS}+ days`,
        description: `${stale.length} managed devices have not checked in with Intune recently and may be unmanaged or offline.`,
        impact: { count: stale.length, entities: deviceNames(stale) },
        remediation:
          "Investigate stale devices in Intune > Devices > All devices. Retire lost devices and fix enrollment for active ones.",
      },
    ];
  },
};
