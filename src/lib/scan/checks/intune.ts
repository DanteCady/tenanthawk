import { graphGet } from "../graph";
import type { Check } from "../types";

const DAY = 86_400_000;
const STALE_SYNC_DAYS = 30;

interface ManagedDevice {
  deviceName?: string;
  complianceState?: string;
  managementAgent?: string;
  lastSyncDateTime?: string;
  operatingSystem?: string;
}

export const intuneNonCompliant: Check = {
  id: "hygiene.intune-noncompliant",
  category: "hygiene",
  async run({ token }) {
    const devices = await graphGet<ManagedDevice>(
      token,
      "/deviceManagement/managedDevices?$select=deviceName,complianceState,operatingSystem,managementAgent,lastSyncDateTime&$top=999",
    );

    if (devices.length === 0) return [];

    const nonCompliant = devices.filter((d) => d.complianceState === "noncompliant");
    if (nonCompliant.length === 0) return [];

    const names = nonCompliant
      .slice(0, 15)
      .map((d) => d.deviceName ?? d.operatingSystem ?? "Unknown device");

    return [
      {
        category: "hygiene",
        checkId: intuneNonCompliant.id,
        severity: nonCompliant.length >= 5 ? "high" : "medium",
        title: `${nonCompliant.length} non-compliant Intune device${nonCompliant.length === 1 ? "" : "s"}`,
        description: `${nonCompliant.length} of ${devices.length} managed devices report a non-compliant state in Intune.`,
        impact: { count: nonCompliant.length, entities: names },
        remediation:
          "Review device compliance policies and remediation actions in Intune > Devices > Monitor > Noncompliant devices.",
      },
    ];
  },
};

export const intuneStaleSync: Check = {
  id: "reliability.intune-stale-sync",
  category: "reliability",
  async run({ token }) {
    const devices = await graphGet<ManagedDevice>(
      token,
      "/deviceManagement/managedDevices?$select=deviceName,lastSyncDateTime,operatingSystem&$top=999",
    );

    if (devices.length === 0) return [];

    const now = Date.now();
    const stale = devices.filter((d) => {
      if (!d.lastSyncDateTime) return true;
      return now - new Date(d.lastSyncDateTime).getTime() >= STALE_SYNC_DAYS * DAY;
    });

    if (stale.length === 0) return [];

    const names = stale.slice(0, 15).map((d) => d.deviceName ?? d.operatingSystem ?? "Unknown");

    return [
      {
        category: "reliability",
        checkId: intuneStaleSync.id,
        severity: stale.length >= 10 ? "medium" : "low",
        title: `${stale.length} Intune device${stale.length === 1 ? "" : "s"} not synced in ${STALE_SYNC_DAYS}+ days`,
        description: `${stale.length} managed devices have not checked in with Intune recently and may be unmanaged or offline.`,
        impact: { count: stale.length, entities: names },
        remediation:
          "Investigate stale devices in Intune > Devices > All devices. Retire lost devices and fix enrollment for active ones.",
      },
    ];
  },
};
