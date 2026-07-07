import type { EntraDeviceRow, IntuneDeviceRow } from "./prefetch";

const DAY = 86_400_000;

export function normalizeDeviceId(id: string): string {
  return id.trim().toLowerCase();
}

export function intuneDeviceIdSet(intune: IntuneDeviceRow[]): Set<string> {
  return new Set(
    intune.map((d) => normalizeDeviceId(d.azureADDeviceId)).filter(Boolean),
  );
}

export function entraDeviceIdSet(entra: EntraDeviceRow[]): Set<string> {
  return new Set(entra.map((d) => normalizeDeviceId(d.deviceId)).filter(Boolean));
}

export function entraDevicesNotInIntune(
  entra: EntraDeviceRow[],
  intune: IntuneDeviceRow[],
): EntraDeviceRow[] {
  const enrolled = intuneDeviceIdSet(intune);
  return entra.filter(
    (d) =>
      d.accountEnabled &&
      d.deviceId &&
      !enrolled.has(normalizeDeviceId(d.deviceId)),
  );
}

export function intuneDevicesNotInEntra(
  entra: EntraDeviceRow[],
  intune: IntuneDeviceRow[],
): IntuneDeviceRow[] {
  const known = entraDeviceIdSet(entra);
  return intune.filter(
    (d) => !d.azureADDeviceId || !known.has(normalizeDeviceId(d.azureADDeviceId)),
  );
}

export function staleEntraDevices(
  entra: EntraDeviceRow[],
  staleDays = 30,
): EntraDeviceRow[] {
  const cutoff = Date.now() - staleDays * DAY;
  return entra.filter((d) => {
    if (!d.accountEnabled) return false;
    if (!d.approximateLastSignInDateTime) return true;
    return new Date(d.approximateLastSignInDateTime).getTime() < cutoff;
  });
}

export function personalIntuneDevices(intune: IntuneDeviceRow[]): IntuneDeviceRow[] {
  return intune.filter(
    (d) => d.managedDeviceOwnerType.toLowerCase() === "personal",
  );
}

export function entraDeviceLabel(device: EntraDeviceRow): string {
  return device.displayName || device.operatingSystem || "Unknown device";
}

export function intuneDeviceLabel(device: IntuneDeviceRow): string {
  const name = device.deviceName || device.operatingSystem || "Unknown device";
  const upn = device.userPrincipalName?.trim();
  return upn ? `${name} (${upn})` : name;
}
