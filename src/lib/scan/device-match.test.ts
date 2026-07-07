import { describe, expect, it } from "vitest";
import {
  entraDevicesNotInIntune,
  intuneDevicesNotInEntra,
  personalIntuneDevices,
  staleEntraDevices,
} from "./device-match";
import type { EntraDeviceRow, IntuneDeviceRow } from "./prefetch";

const entra = (deviceId: string, overrides?: Partial<EntraDeviceRow>): EntraDeviceRow => ({
  id: deviceId,
  deviceId: deviceId.toLowerCase(),
  displayName: `Device-${deviceId.slice(0, 4)}`,
  accountEnabled: true,
  approximateLastSignInDateTime: new Date().toISOString(),
  trustType: "AzureAd",
  operatingSystem: "Windows",
  isManaged: false,
  ...overrides,
});

const intune = (azureADDeviceId: string, overrides?: Partial<IntuneDeviceRow>): IntuneDeviceRow => ({
  id: azureADDeviceId,
  azureADDeviceId: azureADDeviceId.toLowerCase(),
  deviceName: `Intune-${azureADDeviceId.slice(0, 4)}`,
  userPrincipalName: "user@contoso.com",
  managedDeviceOwnerType: "company",
  complianceState: "compliant",
  lastSyncDateTime: new Date().toISOString(),
  operatingSystem: "Windows",
  ...overrides,
});

describe("device-match", () => {
  it("finds Entra devices missing from Intune", () => {
    const items = entraDevicesNotInIntune(
      [entra("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"), entra("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB")],
      [intune("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB")],
    );
    expect(items).toHaveLength(1);
    expect(items[0]?.deviceId).toContain("aaaa");
  });

  it("finds Intune enrollments without Entra records", () => {
    const items = intuneDevicesNotInEntra(
      [entra("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB")],
      [intune("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"), intune("CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC")],
    );
    expect(items).toHaveLength(1);
  });

  it("detects stale Entra devices", () => {
    const old = new Date(Date.now() - 40 * 86_400_000).toISOString();
    const items = staleEntraDevices([
      entra("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", { approximateLastSignInDateTime: old }),
      entra("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"),
    ]);
    expect(items).toHaveLength(1);
  });

  it("counts personal Intune enrollments", () => {
    const items = personalIntuneDevices([
      intune("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", { managedDeviceOwnerType: "personal" }),
      intune("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"),
    ]);
    expect(items).toHaveLength(1);
  });
});
