import type { GlossaryCategory, GlossaryTerm } from "./types";

export const GLOSSARY_CATEGORY_LABEL: Record<GlossaryCategory, string> = {
  security: "Security",
  identity: "Identity",
  cost: "Cost",
  reliability: "Reliability",
  governance: "Governance",
  hygiene: "Hygiene",
};

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  "security",
  "identity",
  "cost",
  "reliability",
  "governance",
  "hygiene",
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    slug: "conditional-access",
    term: "Conditional Access",
    category: "security",
    definition:
      "Entra ID policies that grant or block sign-in based on user, device, location, and risk signals. Enforcement mode blocks non-compliant access; report-only mode logs without blocking.",
    body: "Most tenants accumulate report-only policies that never graduate to enforcement. Tenant Hawk flags when Conditional Access exists but nothing is actively enforced, a common gap before audits.",
    relatedGuideSlug: "how-to-find-inactive-conditional-access-policies",
    checkId: "security.conditional-access",
    relatedTermSlugs: ["report-only-mode", "legacy-authentication", "multifactor-authentication"],
  },
  {
    slug: "report-only-mode",
    term: "Report-only mode (Conditional Access)",
    category: "security",
    definition:
      "A Conditional Access policy state that evaluates sign-ins and writes logs without blocking access. Useful for testing, but policies left in report-only indefinitely create a false sense of security.",
    relatedGuideSlug: "how-to-find-inactive-conditional-access-policies",
    checkId: "security.conditional-access",
    relatedTermSlugs: ["conditional-access"],
  },
  {
    slug: "legacy-authentication",
    term: "Legacy authentication",
    category: "security",
    definition:
      "Older Microsoft 365 sign-in protocols (IMAP, POP, SMTP AUTH, basic auth) that bypass modern authentication and MFA. Blocking legacy auth is a baseline control for most tenants.",
    relatedGuideSlug: "block-legacy-authentication-microsoft-365",
    checkId: "security.legacy-auth",
    relatedTermSlugs: ["conditional-access", "multifactor-authentication", "security-defaults"],
  },
  {
    slug: "multifactor-authentication",
    term: "Multifactor authentication (MFA)",
    category: "security",
    definition:
      "A second verification step beyond password at sign-in, typically via authenticator app, SMS, or FIDO key. Entra ID tracks per-user MFA registration; gaps often appear on admin and service accounts.",
    relatedGuideSlug: "m365-security-misconfigurations",
    checkId: "security.mfa-registration",
    relatedTermSlugs: ["conditional-access", "global-administrator", "privileged-identity-management"],
  },
  {
    slug: "microsoft-secure-score",
    term: "Microsoft Secure Score",
    category: "security",
    definition:
      "Microsoft's security posture score in the Entra admin center, based on recommended security actions. It focuses on identity and device security, not license waste, expiring secrets, or tenant hygiene.",
    relatedGuideSlug: "m365-security-misconfigurations",
    relatedTermSlugs: ["tenant-health-score", "conditional-access"],
  },
  {
    slug: "security-defaults",
    term: "Security defaults",
    category: "security",
    definition:
      "Baseline security settings in Entra ID for tenants without Conditional Access licenses. Enables MFA for admins and blocks legacy authentication. Replaced by custom CA policies in mature tenants.",
    relatedTermSlugs: ["conditional-access", "legacy-authentication"],
  },
  {
    slug: "global-administrator",
    term: "Global Administrator",
    category: "identity",
    definition:
      "The highest privileged Entra ID role with full tenant control. Excessive Global Admins without MFA or PIM is a top audit finding. Microsoft recommends fewer than five standing Global Admins.",
    relatedGuideSlug: "m365-security-misconfigurations",
    checkId: "security.admin-roles",
    relatedTermSlugs: ["privileged-identity-management", "multifactor-authentication"],
  },
  {
    slug: "privileged-identity-management",
    term: "Privileged Identity Management (PIM)",
    category: "identity",
    definition:
      "Entra ID feature for just-in-time activation of admin roles with approval, MFA, and time limits. Reduces standing privileged access compared to permanently assigned directory roles.",
    relatedTermSlugs: ["global-administrator", "entra-id"],
  },
  {
    slug: "guest-user",
    term: "Guest user (B2B)",
    category: "identity",
    definition:
      "External identities invited into your Entra ID tenant for collaboration. Stale guests with lingering group memberships and licenses are a common hygiene and licensing problem in Microsoft 365.",
    relatedGuideSlug: "m365-security-misconfigurations",
    checkId: "security.guest-accounts",
    relatedTermSlugs: ["entra-id", "sharepoint-external-sharing"],
  },
  {
    slug: "entra-id",
    term: "Microsoft Entra ID",
    category: "identity",
    definition:
      "Microsoft's cloud identity platform (formerly Azure AD) for users, groups, apps, and Conditional Access in Microsoft 365. Admin consent for third-party apps is granted here.",
    relatedTermSlugs: ["conditional-access", "app-registration", "read-only-admin-consent"],
  },
  {
    slug: "license-waste",
    term: "License waste",
    category: "cost",
    definition:
      "Microsoft 365 seats paid for but unused or misassigned: disabled users still licensed, never-signed-in accounts, duplicate SKUs, or oversized plans. Often the fastest cost recovery lever in a tenant.",
    relatedGuideSlug: "find-wasted-m365-licenses",
    checkId: "cost.unused-licenses",
    relatedTermSlugs: ["unused-m365-license", "never-signed-in-user", "sku-assignment"],
  },
  {
    slug: "unused-m365-license",
    term: "Unused M365 license",
    category: "cost",
    definition:
      "A paid Microsoft 365 seat assigned to a user who has not consumed the service recently or does not need the SKU. Reclaiming unused licenses directly reduces monthly subscription spend.",
    relatedGuideSlug: "find-wasted-m365-licenses",
    checkId: "cost.unused-licenses",
    relatedTermSlugs: ["license-waste", "never-signed-in-user"],
  },
  {
    slug: "never-signed-in-user",
    term: "Never signed in user",
    category: "cost",
    definition:
      "An enabled account with an assigned license but no recorded Entra ID sign-in. Often created during onboarding mistakes or mergers. Among the quickest license waste to reclaim after validation.",
    relatedGuideSlug: "find-never-signed-in-licensed-users-m365",
    checkId: "cost.unused-licenses",
    relatedTermSlugs: ["license-waste", "unused-m365-license"],
  },
  {
    slug: "sku-assignment",
    term: "SKU assignment",
    category: "cost",
    definition:
      "Mapping a Microsoft 365 product SKU (E3, E5, Business Premium, etc.) to a user or group. SKU mismatch, such as E5 for email-only users, is a common source of silent overspend.",
    relatedGuideSlug: "find-wasted-m365-licenses",
    relatedTermSlugs: ["license-waste"],
  },
  {
    slug: "app-registration",
    term: "App registration",
    category: "reliability",
    definition:
      "An Entra ID application object representing a service or integration that authenticates to Microsoft Graph or other APIs. Each registration can have secrets or certificates with expiration dates.",
    relatedGuideSlug: "m365-expiring-secrets-and-domains",
    checkId: "reliability.expiring-secrets",
    relatedTermSlugs: ["client-secret", "service-principal", "certificate-expiration"],
  },
  {
    slug: "client-secret",
    term: "Client secret (app registration)",
    category: "reliability",
    definition:
      "A password-like credential for an app registration, typically valid 6 to 24 months. Expired secrets break integrations silently until the next sync job or user complaint surfaces the outage.",
    relatedGuideSlug: "m365-expiring-secrets-and-domains",
    checkId: "reliability.expiring-secrets",
    relatedTermSlugs: ["app-registration", "certificate-expiration"],
  },
  {
    slug: "certificate-expiration",
    term: "Certificate expiration (SSO)",
    category: "reliability",
    definition:
      "SAML or token-signing certificates for enterprise applications and federated SSO have fixed validity periods. Expired certs cause widespread sign-in failures for the dependent application.",
    relatedGuideSlug: "m365-expiring-secrets-and-domains",
    checkId: "reliability.expiring-secrets",
    relatedTermSlugs: ["client-secret", "app-registration"],
  },
  {
    slug: "service-principal",
    term: "Service principal",
    category: "reliability",
    definition:
      "The runtime identity of an app registration inside a tenant, holding permissions granted via admin consent. Orphaned service principals with broad Graph permissions are a recurring security review item.",
    relatedTermSlugs: ["app-registration", "read-only-admin-consent"],
  },
  {
    slug: "configuration-drift",
    term: "Configuration drift",
    category: "governance",
    definition:
      "Gradual divergence between intended Microsoft 365 security and cost standards and what is actually configured. Drift accumulates through admin turnover, acquisitions, and one-off exceptions.",
    relatedGuideSlug: "m365-tenant-health-checklist",
    relatedTermSlugs: ["tenant-health-score", "cis-benchmark"],
  },
  {
    slug: "tenant-health-score",
    term: "Tenant health score",
    category: "governance",
    definition:
      "A single numeric grade summarizing Microsoft 365 posture across security, cost, reliability, and hygiene. Tenant Hawk computes a 0–100 score from read-only scans with category breakdowns and dollar impact.",
    relatedGuideSlug: "m365-tenant-health-checklist",
    relatedTermSlugs: ["configuration-drift", "microsoft-secure-score"],
  },
  {
    slug: "cis-benchmark",
    term: "CIS Microsoft 365 benchmark",
    category: "governance",
    definition:
      "Center for Internet Security configuration guidance for Microsoft 365 and Entra ID. Many audits map findings to CIS controls. Tenant Hawk Pro maps scan results to CIS and NIST references.",
    relatedGuideSlug: "prepare-for-m365-audit",
    relatedTermSlugs: ["configuration-drift", "tenant-health-score"],
  },
  {
    slug: "read-only-admin-consent",
    term: "Read-only admin consent",
    category: "governance",
    definition:
      "OAuth admin consent granting an application delegated read permissions without write access to the tenant. Tenant Hawk uses read-only Graph scopes so scans cannot modify users, licenses, or policies.",
    relatedTermSlugs: ["entra-id", "app-registration"],
  },
  {
    slug: "sharepoint-external-sharing",
    term: "SharePoint external sharing",
    category: "hygiene",
    definition:
      "Settings that allow guests or anonymous links to access SharePoint and OneDrive content. Overly permissive sharing defaults are a data exposure risk and frequent audit finding.",
    relatedGuideSlug: "m365-tenant-hygiene",
    checkId: "hygiene.sharing",
    relatedTermSlugs: ["guest-user"],
  },
  {
    slug: "intune-compliance",
    term: "Intune device compliance",
    category: "hygiene",
    definition:
      "Microsoft Intune policies that evaluate whether managed devices meet security baselines before accessing corporate resources. Non-compliant devices often indicate stale enrollments or missing patches.",
    relatedGuideSlug: "m365-tenant-hygiene",
    checkId: "hygiene.intune-noncompliant",
    relatedTermSlugs: ["conditional-access"],
  },
];

export const GLOSSARY_BY_SLUG: Record<string, GlossaryTerm> = Object.fromEntries(
  GLOSSARY_TERMS.map((t) => [t.slug, t]),
);
