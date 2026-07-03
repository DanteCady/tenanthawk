import type { ContentCategory } from "./types";

export const CONTENT_CATEGORY_LABEL: Record<ContentCategory, string> = {
  overview: "Overview",
  security: "Security",
  identity: "Identity",
  cost: "Cost",
  reliability: "Reliability",
  governance: "Governance",
  hygiene: "Hygiene",
};

export const CONTENT_CATEGORY_CHIP: Record<
  ContentCategory,
  { chip: string; text: string }
> = {
  overview: { chip: "bg-blue-50", text: "text-blue-700" },
  security: { chip: "bg-red-50", text: "text-red-700" },
  identity: { chip: "bg-violet-50", text: "text-violet-700" },
  cost: { chip: "bg-green-50", text: "text-green-700" },
  reliability: { chip: "bg-sky-50", text: "text-sky-700" },
  governance: { chip: "bg-slate-100", text: "text-slate-700" },
  hygiene: { chip: "bg-yellow-50", text: "text-yellow-800" },
};

export const CONTENT_CATEGORY_DESCRIPTION: Record<ContentCategory, string> = {
  overview:
    "Tenant-wide cleanup, health overviews, and audit prep for Microsoft 365 admins and MSPs.",
  security:
    "Conditional Access, MFA, legacy auth, admin roles, and guest access misconfigurations.",
  identity:
    "Admin roles, MFA coverage, guest access, and sign-in risks across Entra ID.",
  cost:
    "Unused licenses, disabled users with seats, and renewal waste in Microsoft 365.",
  reliability:
    "Expiring app secrets, SSO certificates, domains, and Intune sync drift.",
  governance:
    "Audit prep, cleanup cadence, policy evidence, and tenant operating standards.",
  hygiene:
    "Inactive users, empty groups, SharePoint sharing, and device compliance clutter.",
};

export const CONTENT_CATEGORIES: ContentCategory[] = [
  "overview",
  "security",
  "identity",
  "cost",
  "reliability",
  "governance",
  "hygiene",
];
