import type { Check } from "../types";
import {
  mfaRegistration,
  inactiveUsers,
  disabledOutsideGroup,
} from "./identity";
import { expiringSecrets } from "./reliability";
import {
  servicePrincipalSecretsCheck,
  overPermissionedAppsCheck,
  unusedEnterpriseAppsCheck,
  appWithoutOwnersCheck,
  enterpriseAppNoOwnersCheck,
  appGlobalAdminRoleCheck,
  multiTenantAppsCheck,
} from "./applications";
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
import {
  sharePointSharing,
  sharePointExternalSitesCheck,
  sharePointStaleSitesCheck,
  sharePointHighStorageCheck,
  sharePointEmptySitesCheck,
  sharePointOwnerlessSitesCheck,
  sharePointInactiveFilesCheck,
} from "./sharepoint";
import { ownerlessGroupsCheck, ownerlessTeamsCheck, emptyTeamsCheck, staleTeamsCheck, teamsNoActiveChannelsCheck, teamsGuestHeavyCheck, groupsNamingChaosCheck } from "./collaboration";
import {
  unusedCopilotLicenses,
  copilotLicensedInactiveCheck,
  copilotAssignedDisabledUserCheck,
  copilotLowAdoptionCheck,
  copilotAppSkewCheck,
  copilotLicensedNoMfaCheck,
  copilotChatOnlyUsageCheck,
  copilotReadinessBlockersCheck,
} from "./copilot";
import {
  entraUnmanagedDevicesCheck,
  intuneGhostEnrollmentCheck,
  entraStaleDevicesCheck,
  personalDeviceEnrolledCheck,
} from "./devices";
import {
  mailboxForwardingExternalCheck,
  mailboxForwardingEnabledCheck,
  inactiveMailboxesCheck,
  mailboxHighStorageCheck,
  inactiveMailboxLicensesCheck,
} from "./exchange";
import {
  staleGuestsCheck,
  guestInviteSprawlCheck,
  usersNoManagerCheck,
  privilegedUserNoMfaCheck,
  pimStandingAccessCheck,
} from "./identity-extended";
import {
  inactiveChannelsCheck,
  emptyChannelsCheck,
  privateChannelsOwnerlessCheck,
  teamsDisabledOwnerCheck,
  teamsOutdatedAppsCheck,
  teamsUnverifiedAppsCheck,
} from "./teams-deep";
import {
  sharePointUnusedPagesCheck,
  sharePointStaleSitePagesCheck,
  sharePointAnonymousLinksCheck,
  oneDriveStaleCheck,
  oneDriveHighStorageCheck,
  staleTeamSitesStorageCheck,
} from "./sharepoint-deep";
import {
  sharedMailboxNoDelegateCheck,
  sharedMailboxInactiveCheck,
  mailboxAutoReplyStaleCheck,
  resourceMailboxUnusedCheck,
} from "./exchange-deep";
import { validateRegisteredCheckIds } from "./registry";

export const checks: Check[] = [
  // Security
  conditionalAccess,
  legacyAuthentication,
  mfaRegistration,
  adminRoles,
  guestSprawl,
  staleGuestsCheck,
  guestInviteSprawlCheck,
  privilegedUserNoMfaCheck,
  pimStandingAccessCheck,
  // Cost
  disabledUserLicenses,
  unusedLicenses,
  licenseExpiry,
  unusedCopilotLicenses,
  copilotLicensedInactiveCheck,
  copilotAssignedDisabledUserCheck,
  copilotLowAdoptionCheck,
  copilotAppSkewCheck,
  copilotLicensedNoMfaCheck,
  copilotChatOnlyUsageCheck,
  copilotReadinessBlockersCheck,
  // Reliability
  expiringSecrets,
  servicePrincipalSecretsCheck,
  overPermissionedAppsCheck,
  unusedEnterpriseAppsCheck,
  appWithoutOwnersCheck,
  enterpriseAppNoOwnersCheck,
  appGlobalAdminRoleCheck,
  multiTenantAppsCheck,
  intuneStaleSync,
  // Hygiene & workload
  inactiveUsers,
  usersNoManagerCheck,
  disabledOutsideGroup,
  emptyGroups,
  ownerlessGroupsCheck,
  ownerlessTeamsCheck,
  emptyTeamsCheck,
  staleTeamsCheck,
  teamsNoActiveChannelsCheck,
  teamsGuestHeavyCheck,
  groupsNamingChaosCheck,
  intuneNonCompliant,
  entraUnmanagedDevicesCheck,
  intuneGhostEnrollmentCheck,
  entraStaleDevicesCheck,
  personalDeviceEnrolledCheck,
  mailboxForwardingExternalCheck,
  mailboxForwardingEnabledCheck,
  inactiveMailboxesCheck,
  mailboxHighStorageCheck,
  inactiveMailboxLicensesCheck,
  sharePointSharing,
  sharePointExternalSitesCheck,
  sharePointStaleSitesCheck,
  sharePointHighStorageCheck,
  sharePointEmptySitesCheck,
  sharePointOwnerlessSitesCheck,
  sharePointInactiveFilesCheck,
  sharePointUnusedPagesCheck,
  sharePointStaleSitePagesCheck,
  sharePointAnonymousLinksCheck,
  oneDriveStaleCheck,
  oneDriveHighStorageCheck,
  staleTeamSitesStorageCheck,
  inactiveChannelsCheck,
  emptyChannelsCheck,
  privateChannelsOwnerlessCheck,
  teamsDisabledOwnerCheck,
  teamsOutdatedAppsCheck,
  teamsUnverifiedAppsCheck,
  sharedMailboxNoDelegateCheck,
  sharedMailboxInactiveCheck,
  mailboxAutoReplyStaleCheck,
  resourceMailboxUnusedCheck,
];

const registryErrors = validateRegisteredCheckIds(checks.map((c) => c.id));
if (registryErrors.length > 0 && process.env.NODE_ENV !== "production") {
  console.warn("[scan] check registry validation:", registryErrors.join("; "));
}
