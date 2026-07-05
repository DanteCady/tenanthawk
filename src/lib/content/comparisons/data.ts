export type ComparisonRow = {
  feature: string;
  tenantHawk: string | boolean;
  competitor: string | boolean;
};

export type ComparisonPage = {
  slug: string;
  title: string;
  metaDescription: string;
  competitorName: string;
  competitorTagline: string;
  intro: string;
  whenCompetitorWins: { title: string; points: string[] };
  tenantHawkWins: { title: string; points: string[] };
  rows: ComparisonRow[];
  honestNote?: string;
};

export const COMPARISON_PAGES: ComparisonPage[] = [
  {
    slug: "microsoft-secure-score",
    title: "Tenant Hawk vs Microsoft Secure Score",
    metaDescription:
      "Compare Tenant Hawk to Microsoft Secure Score. Secure Score covers identity security recommendations; Tenant Hawk adds license waste, expiring secrets, hygiene, and one tenant health score.",
    competitorName: "Microsoft Secure Score",
    competitorTagline: "Identity security recommendations in Entra ID",
    intro:
      "Secure Score is Microsoft's built-in security posture metric. It is valuable for identity hardening, but it was never designed to answer \"where are we wasting money\" or \"what breaks next month.\"",
    whenCompetitorWins: {
      title: "Secure Score is the better fit when…",
      points: [
        "You only need Microsoft's own security improvement actions and you live entirely inside Entra admin center.",
        "You already pay for Defender, Purview, and advanced compliance workloads tied to the Secure Score ecosystem.",
        "Your organization mandates Microsoft-native tooling with no third-party assessors.",
      ],
    },
    tenantHawkWins: {
      title: "Tenant Hawk adds what Secure Score omits",
      points: [
        "License waste ranked by estimated dollars per month, not just security actions.",
        "Expiring app secrets, SSO certificates, and domain renewals in one reliability view.",
        "Hygiene signals: inactive users, empty groups, SharePoint sharing defaults.",
        "One 0–100 tenant health score across security, cost, reliability, and hygiene.",
        "Read-only scan in minutes with a prioritized fix list for lean IT teams and MSPs.",
      ],
    },
    rows: [
      { feature: "Identity security recommendations", tenantHawk: true, competitor: true },
      { feature: "License waste with dollar estimates", tenantHawk: true, competitor: false },
      { feature: "Expiring secrets and certificates", tenantHawk: true, competitor: false },
      { feature: "SharePoint / hygiene checks", tenantHawk: true, competitor: false },
      { feature: "Single cross-pillar health score", tenantHawk: true, competitor: false },
      { feature: "Free scan tier", tenantHawk: true, competitor: true },
      { feature: "Microsoft-native (no third party)", tenantHawk: false, competitor: true },
    ],
    honestNote:
      "Use both if you can: Secure Score for Microsoft's security action queue, Tenant Hawk for the economic and operational gaps Microsoft does not score.",
  },
  {
    slug: "m365-admin-center",
    title: "Tenant Hawk vs M365 Admin Center",
    metaDescription:
      "Compare Tenant Hawk to the Microsoft 365 Admin Center. Admin Center manages users and licenses; Tenant Hawk prioritizes waste, drift, and security gaps with a health score and fix list.",
    competitorName: "Microsoft 365 Admin Center",
    competitorTagline: "User, license, and billing management portal",
    intro:
      "The Admin Center is where every M365 admin lives for day-to-day operations. It tells you what you have. Tenant Hawk tells you what is wrong, what it costs, and what to fix first.",
    whenCompetitorWins: {
      title: "Admin Center is the better fit when…",
      points: [
        "You need to create users, assign licenses, or change billing, Tenant Hawk is read-only by design.",
        "You only want raw counts and SKU lists without prioritization or scoring.",
        "You are performing a single known action, not a tenant-wide health review.",
      ],
    },
    tenantHawkWins: {
      title: "Tenant Hawk adds what Admin Center omits",
      points: [
        "Prioritized findings with severity, not flat lists of users and SKUs.",
        "Never-signed-in and inactive licensed users surfaced for reclamation.",
        "Security drift: legacy auth, Conditional Access gaps, MFA registration holes.",
        "Executive-ready health score and shareable report links (Pro).",
        "MSP multi-tenant rollups on Enterprise for client portfolios.",
      ],
    },
    rows: [
      { feature: "User and license management", tenantHawk: false, competitor: true },
      { feature: "Prioritized tenant health findings", tenantHawk: true, competitor: false },
      { feature: "Estimated recoverable license spend", tenantHawk: true, competitor: false },
      { feature: "Security misconfiguration scan", tenantHawk: true, competitor: "Partial" },
      { feature: "Expiring integration credentials", tenantHawk: true, competitor: false },
      { feature: "Read-only (no accidental changes)", tenantHawk: true, competitor: false },
    ],
  },
  {
    slug: "tenanthawk-saas",
    title: "Tenant Hawk SaaS vs self-hosted templates",
    metaDescription:
      "tenanthawk.io is the managed Tenant Hawk product: read-only M365 scans, health score, and remediation reports. Not the same as open-source or self-hosted code that shares the name.",
    competitorName: "Self-hosted / open-source templates",
    competitorTagline: "DIY deployments using Tenant Hawk branded code",
    intro:
      "Some repositories and templates use the Tenant Hawk name for multi-tenant Microsoft 365 tooling. tenanthawk.io is the managed SaaS: hosted scans, billing, support, and ongoing check updates without running your own infrastructure.",
    whenCompetitorWins: {
      title: "Self-hosted is the better fit when…",
      points: [
        "You require all data and compute on-premises with no SaaS vendor.",
        "You have engineering capacity to maintain forks, Graph API changes, and auth flows.",
        "You are building a custom MSP platform and want source code to modify.",
      ],
    },
    tenantHawkWins: {
      title: "tenanthawk.io SaaS is built for operators who want outcomes",
      points: [
        "Connect with read-only admin consent in minutes, no deploy pipeline.",
        "Health score, dollar-ranked license waste, and drift alerts maintained by us.",
        "Pro and Enterprise tiers with exports, compliance mapping, and MSP console.",
        "Support, uptime, and Graph API updates handled on hosted infrastructure.",
        "Free scan tier to prove value before you pay.",
      ],
    },
    rows: [
      { feature: "Hosted at tenanthawk.io", tenantHawk: true, competitor: false },
      { feature: "Free scan without infrastructure", tenantHawk: true, competitor: false },
      { feature: "Full source code ownership", tenantHawk: false, competitor: true },
      { feature: "MSP multi-tenant console", tenantHawk: true, competitor: "Varies" },
      { feature: "Ongoing scanner updates", tenantHawk: true, competitor: "Your team" },
      { feature: "Stripe billing and Pro tier", tenantHawk: true, competitor: false },
    ],
    honestNote:
      "Looking for the product customers run today? Use https://tenanthawk.io. Building your own platform? Evaluate self-hosted options separately from this SaaS.",
  },
];

export const COMPARISON_BY_SLUG: Record<string, ComparisonPage> = Object.fromEntries(
  COMPARISON_PAGES.map((p) => [p.slug, p]),
);
