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
  // Reliability
  expiringSecrets,
  intuneStaleSync,
  // Hygiene & workload
  inactiveUsers,
  disabledOutsideGroup,
  emptyGroups,
  intuneNonCompliant,
  sharePointSharing,
];
