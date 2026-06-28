import type { Category } from "@/db/types";
import type { RemediationDocLink } from "./types";

/** Verified Microsoft Learn / Entra docs per check (AI may only cite these). */
const CHECK_DOCS: Record<string, RemediationDocLink[]> = {
  "reliability.expiring-secrets": [
    {
      title: "Add credentials to an app registration",
      url: "https://learn.microsoft.com/en-us/entra/identity-platform/howto-add-credentials",
    },
    {
      title: "Manage certificates and secrets in Entra",
      url: "https://learn.microsoft.com/en-us/entra/identity-platform/howto-create-service-principal-portal",
    },
  ],
  "cost.license-expiry": [
    {
      title: "Manage Microsoft 365 subscriptions",
      url: "https://learn.microsoft.com/en-us/microsoft-365/commerce/subscriptions/manage-subscriptions",
    },
    {
      title: "Renew your subscription",
      url: "https://learn.microsoft.com/en-us/microsoft-365/commerce/subscriptions/renew-your-subscription",
    },
  ],
  "cost.unused-licenses": [
    {
      title: "Manage licenses for users",
      url: "https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-licenses-for-users",
    },
    {
      title: "Assign licenses to users",
      url: "https://learn.microsoft.com/en-us/microsoft-365/admin/manage/assign-licenses-to-users",
    },
  ],
  "cost.disabled-user-licenses": [
    {
      title: "Manage licenses for users",
      url: "https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-licenses-for-users",
    },
    {
      title: "Remove licenses from disabled users",
      url: "https://learn.microsoft.com/en-us/microsoft-365/admin/manage/remove-licenses-from-users",
    },
  ],
  "security.mfa-registration": [
    {
      title: "Require MFA for all users",
      url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/howto-conditional-access-policy-all-users-mfa",
    },
    {
      title: "Authentication methods in Entra ID",
      url: "https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-methods",
    },
  ],
  "security.conditional-access": [
    {
      title: "Plan a Conditional Access deployment",
      url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/plan-conditional-access",
    },
    {
      title: "Require MFA for administrators",
      url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/howto-conditional-access-policy-admin-mfa",
    },
    {
      title: "Require MFA for all users",
      url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/howto-conditional-access-policy-all-users-mfa",
    },
  ],
  "security.guest-accounts": [
    {
      title: "Govern access for external users in Entra ID",
      url: "https://learn.microsoft.com/en-us/entra/external-id/external-collaboration-overview",
    },
    {
      title: "Create an access review of guest users",
      url: "https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-create",
    },
  ],
  "security.legacy-auth": [
    {
      title: "Block legacy authentication",
      url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/block-legacy-authentication",
    },
  ],
  "security.admin-roles": [
    {
      title: "Privileged Identity Management for Entra roles",
      url: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure",
    },
    {
      title: "Best practices for Entra roles",
      url: "https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/best-practices",
    },
  ],
  "hygiene.empty-groups": [
    {
      title: "Manage groups in Microsoft Entra ID",
      url: "https://learn.microsoft.com/en-us/entra/identity/fundamentals/groups-create-eligible-delete",
    },
  ],
  "hygiene.inactive-users": [
    {
      title: "Manage stale guest accounts",
      url: "https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-external-users",
    },
    {
      title: "User account management",
      url: "https://learn.microsoft.com/en-us/entra/identity/users/users-restore",
    },
  ],
  "hygiene.disabled-outside-group": [
    {
      title: "Manage groups in Microsoft Entra ID",
      url: "https://learn.microsoft.com/en-us/entra/identity/fundamentals/groups-create-eligible-delete",
    },
  ],
  "hygiene.intune-noncompliant": [
    {
      title: "Device compliance in Intune",
      url: "https://learn.microsoft.com/en-us/mem/intune/protect/device-compliance-get-started",
    },
  ],
  "reliability.intune-stale-sync": [
    {
      title: "Monitor devices in Intune",
      url: "https://learn.microsoft.com/en-us/mem/intune/remote-actions/device-management",
    },
  ],
  "hygiene.sharing": [
    {
      title: "Manage sharing settings for SharePoint",
      url: "https://learn.microsoft.com/en-us/sharepoint/turn-external-sharing-on-or-off",
    },
    {
      title: "Sharing and collaboration in Microsoft 365",
      url: "https://learn.microsoft.com/en-us/sharepoint/share-sharepoint-files-with-people-outside-your-org",
    },
  ],
};

const CATEGORY_FALLBACK: Record<Category, RemediationDocLink[]> = {
  security: [
    {
      title: "Microsoft Entra security documentation",
      url: "https://learn.microsoft.com/en-us/entra/identity/",
    },
  ],
  cost: [
    {
      title: "Microsoft 365 billing and subscriptions",
      url: "https://learn.microsoft.com/en-us/microsoft-365/commerce/",
    },
  ],
  reliability: [
    {
      title: "Microsoft Entra app registrations",
      url: "https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app",
    },
  ],
  hygiene: [
    {
      title: "Microsoft Entra identity fundamentals",
      url: "https://learn.microsoft.com/en-us/entra/identity/fundamentals/",
    },
  ],
};

export function getDocsForCheck(
  checkId: string,
  category: Category,
): RemediationDocLink[] {
  return CHECK_DOCS[checkId] ?? CATEGORY_FALLBACK[category] ?? [];
}
