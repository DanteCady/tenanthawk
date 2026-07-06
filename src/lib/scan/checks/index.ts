import type { Check } from "../types";
import {
  mfaRegistration,
  inactiveUsers,
  disabledOutsideGroup,
} from "./identity";
import { expiringSecrets } from "./reliability";
import { intuneNonCompliant, intuneStaleSync } from "./intune";
import {
  unusedLicenses,
  licenseExpiry,
  disabledUserLicenses,
} from "./cost";
import {
  conditionalAccess,
  guestSprawl,
  adminRoles,
  legacyAuthentication,
} from "./security";
import { emptyGroups } from "./hygiene";
import { sharePointSharing } from "./sharepoint";
import { ownerlessGroupsCheck, ownerlessTeamsCheck } from "./collaboration";
import { unusedCopilotLicenses } from "./copilot";
import { validateRegisteredCheckIds } from "./registry";

export const checks: Check[] = [
  // Security
  conditionalAccess,
  legacyAuthentication,
  mfaRegistration,
  adminRoles,
  guestSprawl,
  // Cost
  disabledUserLicenses,
  unusedLicenses,
  licenseExpiry,
  unusedCopilotLicenses,
  // Reliability
  expiringSecrets,
  intuneStaleSync,
  // Hygiene & workload
  inactiveUsers,
  disabledOutsideGroup,
  emptyGroups,
  ownerlessGroupsCheck,
  ownerlessTeamsCheck,
  intuneNonCompliant,
  sharePointSharing,
];

const registryErrors = validateRegisteredCheckIds(checks.map((c) => c.id));
if (registryErrors.length > 0 && process.env.NODE_ENV !== "production") {
  console.warn("[scan] check registry validation:", registryErrors.join("; "));
}
