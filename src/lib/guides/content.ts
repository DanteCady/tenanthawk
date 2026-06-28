import type { Category } from "@/db/types";

export type GuideSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  category: "overview" | Category;
  relatedSlugs: string[];
  sections: GuideSection[];
};

export const GUIDES: Guide[] = [
  {
    slug: "m365-tenant-health-checklist",
    title: "Microsoft 365 tenant health checklist",
    description:
      "A practical checklist for M365 admins — security, cost, reliability, and hygiene checks you should run regularly.",
    readTime: "8 min read",
    category: "overview",
    relatedSlugs: [
      "m365-security-misconfigurations",
      "find-wasted-m365-licenses",
      "prepare-for-m365-audit",
    ],
    sections: [
      {
        title: "Why run a tenant health check?",
        paragraphs: [
          "Microsoft 365 tenants drift. Admins leave, apps get registered, licenses pile up, and Conditional Access policies accumulate exceptions. Most teams only discover problems during an audit, after a breach, or when an integration silently breaks.",
          "A structured health check gives you a baseline: what is misconfigured, what is wasting money, and what will break next. You do not need to review hundreds of settings manually — focus on the categories that matter most.",
        ],
      },
      {
        title: "Security",
        paragraphs: [
          "Identity is the front door. These checks catch the gaps auditors and attackers look for first.",
        ],
        bullets: [
          "Confirm MFA is enforced for all admins and ideally all users",
          "Review Conditional Access policies for risky exclusions (legacy auth, trusted locations that are too broad)",
          "Count Global Administrators — aim for two to four with break-glass accounts documented",
          "Audit app registrations with high-privilege Graph permissions",
          "Review guest accounts and external sharing defaults",
        ],
      },
      {
        title: "Cost",
        paragraphs: [
          "License waste is invisible until finance asks — or until you reconcile SKUs during renewal.",
        ],
        bullets: [
          "Find licenses assigned to disabled or never-signed-in users",
          "Identify oversized SKUs (E5 where E3 or Business Premium would suffice)",
          "Look for duplicate license assignments on the same user",
          "Quantify monthly reclaimable spend and assign owners to act",
        ],
      },
      {
        title: "Reliability",
        paragraphs: [
          "These items fail quietly until something stops working on a Friday afternoon.",
        ],
        bullets: [
          "Inventory app registration secrets and certificates with expiry dates",
          "Check custom domain and DNS health before renewal windows",
          "Monitor mailboxes approaching storage limits",
          "Note integrations that depend on expiring credentials",
        ],
      },
      {
        title: "Hygiene",
        paragraphs: [
          "Clutter makes every future change harder. Cleaning up early keeps the directory manageable.",
        ],
        bullets: [
          "Remove or archive empty groups and orphaned Teams",
          "Disable or remove long-inactive enabled accounts",
          "Review unmanaged or duplicate Intune-enrolled devices",
          "Tighten SharePoint and OneDrive sharing defaults if they have drifted",
        ],
      },
      {
        title: "How often to run this",
        paragraphs: [
          "Run a full pass quarterly at minimum, or monthly if you are preparing for an audit or managing rapid growth. After major changes — mergers, admin turnover, large app deployments — run an ad-hoc check within a week.",
          "Tenant Hawk automates this checklist read-only across your tenant and rolls results into one health score with prioritized fixes. A free scan takes under five minutes.",
        ],
      },
    ],
  },
  {
    slug: "m365-security-misconfigurations",
    title: "Common Microsoft 365 security misconfigurations",
    description:
      "Conditional Access gaps, MFA holes, over-privileged apps, and guest access issues — what to look for and how to fix them.",
    readTime: "7 min read",
    category: "security",
    relatedSlugs: [
      "m365-tenant-health-checklist",
      "prepare-for-m365-audit",
      "m365-tenant-hygiene",
    ],
    sections: [
      {
        title: "Conditional Access drift",
        paragraphs: [
          "Conditional Access is powerful but easy to undermine. Policies get exceptions for \"just this one vendor\" or \"until the project ends\" — and those exceptions rarely get removed.",
          "Review every policy for users or groups excluded from MFA requirements, locations trusted without justification, and legacy authentication allowances.",
        ],
        bullets: [
          "Policies that exclude entire departments from MFA",
          "Named locations that cover whole countries or public IP ranges",
          "Legacy auth protocols still allowed for any user population",
          "Policies in report-only mode that were never switched to enforce",
        ],
      },
      {
        title: "MFA and legacy authentication",
        paragraphs: [
          "Password-only sign-in remains one of the most common root causes of tenant compromise. Even with Security Defaults or CA policies, gaps appear when legacy protocols bypass modern auth.",
        ],
        bullets: [
          "Users or admins without registered MFA methods",
          "SMTP, IMAP, POP, or other legacy protocols still enabled tenant-wide",
          "Service accounts using password auth instead of certificates",
          "Break-glass accounts without documented, tested access procedures",
        ],
      },
      {
        title: "Privileged roles and admin sprawl",
        paragraphs: [
          "Global Administrator should be rare. Standing privileged access increases blast radius when any one account is phished.",
        ],
        bullets: [
          "More than four to five Global Administrators without a documented reason",
          "Guest users holding any admin role",
          "Permanent Privileged Identity Management assignments instead of time-bound activation",
          "Unused admin accounts that remain enabled after role changes",
        ],
      },
      {
        title: "Over-permissioned applications",
        paragraphs: [
          "Third-party and internal app registrations often request broad Graph permissions at install time and are never reviewed again.",
        ],
        bullets: [
          "Apps with Directory.ReadWrite.All, Mail.ReadWrite, or similar high-impact scopes",
          "Client secrets with no owner or rotation schedule",
          "Unused enterprise applications still granted consent",
          "Multi-tenant apps from vendors no longer under contract",
        ],
      },
      {
        title: "Guest access and external collaboration",
        paragraphs: [
          "B2B collaboration is essential for business but defaults that are too open create data exposure.",
        ],
        bullets: [
          "Guest users inactive for 90+ days still enabled",
          "Anyone links or anonymous sharing enabled where not required",
          "Guests invited to security-sensitive groups or teams",
          "External access settings that differ from your documented policy",
        ],
      },
      {
        title: "Fix priority",
        paragraphs: [
          "Tackle legacy auth and MFA gaps first — they are the highest-risk, fastest-win items. Then reduce Global Admin count and review app permissions. Guest cleanup can run in parallel with hygiene work.",
          "Tenant Hawk flags these issues automatically during a read-only scan and ranks them by severity so you know where to start.",
        ],
      },
    ],
  },
  {
    slug: "find-wasted-m365-licenses",
    title: "How to find wasted Microsoft 365 licenses",
    description:
      "Identify unused seats, oversized SKUs, and duplicate assignments — and estimate how much you can reclaim each month.",
    readTime: "6 min read",
    category: "cost",
    relatedSlugs: [
      "m365-tenant-health-checklist",
      "m365-tenant-hygiene",
      "prepare-for-m365-audit",
    ],
    sections: [
      {
        title: "Where license waste hides",
        paragraphs: [
          "Most organizations over-provision during hiring waves or project kickoffs and under-deprovision when people leave. Microsoft 365 does not automatically reclaim licenses when accounts are disabled — and disabled accounts often keep their SKUs for months.",
          "Waste also comes from SKU mismatch: premium plans assigned to users who only need email and Teams, or duplicate add-ons stacked on the same account.",
        ],
      },
      {
        title: "Disabled and inactive users",
        paragraphs: [
          "Start with accounts that should not consume a paid seat.",
        ],
        bullets: [
          "Disabled users with active license assignments",
          "Enabled users who have never signed in but hold paid SKUs",
          "Accounts inactive 90+ days that still carry E3, E5, or Business Premium",
          "Shared mailboxes incorrectly assigned full user licenses",
        ],
      },
      {
        title: "Oversized and duplicate SKUs",
        paragraphs: [
          "Compare assigned capabilities to actual usage. An E5 license includes advanced security and analytics many roles never touch.",
        ],
        bullets: [
          "E5 assigned to users without Defender, Purview, or Power BI need",
          "Both Business Premium and an standalone Exchange plan on one user",
          "Trial or add-on licenses that auto-converted to paid without review",
          "Departmental bundles where a lower tier would cover daily workflows",
        ],
      },
      {
        title: "Estimating reclaimable spend",
        paragraphs: [
          "For each finding, multiply seats by your contracted per-seat rate. Group by SKU so finance can see monthly and annual impact. Even ten reclaimable E3 seats often covers the cost of tooling that finds them automatically.",
          "Document who approved original assignments before bulk removal — some \"inactive\" accounts are service mailboxes or shared operational identities.",
        ],
      },
      {
        title: "Ongoing cost hygiene",
        paragraphs: [
          "Assign license reviews to offboarding workflows: disable account, remove licenses, then delete after retention. Run a monthly reclaim report and tie it to your procurement calendar so renewals reflect actual need.",
          "Tenant Hawk surfaces unused and misassigned licenses with estimated dollar impact during each scan.",
        ],
      },
    ],
  },
  {
    slug: "m365-expiring-secrets-and-domains",
    title: "M365 expiring secrets, certificates, and domains",
    description:
      "App registration expirations, domain renewals, and mailbox limits — the reliability checks that prevent surprise outages.",
    readTime: "6 min read",
    category: "reliability",
    relatedSlugs: [
      "m365-tenant-health-checklist",
      "m365-security-misconfigurations",
      "prepare-for-m365-audit",
    ],
    sections: [
      {
        title: "Why reliability issues are easy to miss",
        paragraphs: [
          "Security problems make headlines; expiring secrets make Slack channels panic at 4 p.m. on a Friday. App registrations, SAML certificates, and custom domains all have expiry dates that Microsoft does not always surface in one place.",
          "Proactive monitoring beats calendar reminders scattered across teams.",
        ],
      },
      {
        title: "App registration secrets and certificates",
        paragraphs: [
          "Every integration — SSO, automation, line-of-business apps — depends on credentials that expire.",
        ],
        bullets: [
          "Client secrets expiring within 30, 60, and 90 days",
          "Certificate-based auth without a documented rotation owner",
          "Apps with no listed owner in Entra ID",
          "Secrets shared across environments without separate registrations",
        ],
      },
      {
        title: "Domains and DNS",
        paragraphs: [
          "A lapsed custom domain breaks mail flow, sign-in branding, and federated identity.",
        ],
        bullets: [
          "Custom domains approaching registrar renewal",
          "Missing or incorrect DNS records for M365 verification",
          "Federation certificates nearing expiry on hybrid setups",
          "Unused verified domains that should be removed or documented",
        ],
      },
      {
        title: "Mailbox and service limits",
        paragraphs: [
          "Storage and quota issues degrade mail delivery before they trigger obvious alerts.",
        ],
        bullets: [
          "Mailboxes above 90% of quota without archiving policy",
          "Shared mailboxes converted to user mailboxes without license review",
          "Large inactive mailboxes consuming backup and eDiscovery scope",
        ],
      },
      {
        title: "Building an expiry calendar",
        paragraphs: [
          "Export all app registrations with secret expiry dates, assign owners, and set rotation runbooks. Pair domain renewals with your IT asset register. Review quarterly even if nothing is expiring soon — ownership changes get missed.",
          "Tenant Hawk tracks expiring secrets and reliability findings and can alert Pro subscribers when new risks appear.",
        ],
      },
    ],
  },
  {
    slug: "m365-tenant-hygiene",
    title: "Microsoft 365 tenant hygiene best practices",
    description:
      "Clean up orphaned groups, stale accounts, unmanaged devices, and sharing defaults before clutter slows every admin task.",
    readTime: "6 min read",
    category: "hygiene",
    relatedSlugs: [
      "m365-tenant-health-checklist",
      "find-wasted-m365-licenses",
      "m365-security-misconfigurations",
    ],
    sections: [
      {
        title: "Hygiene is compounding debt",
        paragraphs: [
          "Empty groups, stale Teams, and inactive accounts do not usually cause immediate incidents. They inflate search results, confuse access reviews, and make license reclamation harder. The longer you wait, the more political it becomes to remove \"someone might need this.\"",
        ],
      },
      {
        title: "Groups and Teams",
        paragraphs: [
          "Microsoft 365 groups multiply quickly — project teams, distribution lists, Planner boards, and SharePoint sites all leave artifacts.",
        ],
        bullets: [
          "Groups with zero members or only the creator",
          "Teams with no activity in 12+ months still open to all members",
          "Dynamic groups with rules that no longer match intent",
          "Mail-enabled security groups used once for a migration",
        ],
      },
      {
        title: "Stale user accounts",
        paragraphs: [
          "Distinguish hygiene from security: an inactive enabled account is both a license cost and an identity risk.",
        ],
        bullets: [
          "Users enabled but inactive beyond your retention threshold",
          "Accounts without a manager attribute in large departments",
          "Duplicate or test accounts in production directories",
          "Former contractors whose access was partially removed",
        ],
      },
      {
        title: "Devices and endpoints",
        paragraphs: [
          "Intune and Entra device records drift when hardware is retired informally.",
        ],
        bullets: [
          "Duplicate device records for the same physical machine",
          "Unmanaged devices with stale primary user assignments",
          "Devices not checked in for 180+ days still marked compliant",
        ],
      },
      {
        title: "Sharing and defaults",
        paragraphs: [
          "Tenant-level sharing settings set during onboarding often never get revisited as the organization matures.",
        ],
        bullets: [
          "SharePoint default sharing more permissive than policy",
          "Anyone links enabled on sites with sensitive content",
          "Guest access settings inconsistent across teams and sites",
        ],
      },
      {
        title: "A sustainable cleanup cadence",
        paragraphs: [
          "Run hygiene passes in small batches — one department or one group type per sprint. Archive before delete where possible, and publish simple criteria (\"no sign-in 180 days, manager approved\") so removals are predictable.",
          "Tenant Hawk highlights hygiene findings alongside security and cost so cleanup priorities stay visible in one dashboard.",
        ],
      },
    ],
  },
  {
    slug: "prepare-for-m365-audit",
    title: "How to prepare your M365 tenant for an audit",
    description:
      "What auditors ask for, where tenants usually fail, and a pre-audit checklist for security, licensing, and access controls.",
    readTime: "7 min read",
    category: "overview",
    relatedSlugs: [
      "m365-tenant-health-checklist",
      "m365-security-misconfigurations",
      "find-wasted-m365-licenses",
    ],
    sections: [
      {
        title: "What auditors care about in M365",
        paragraphs: [
          "Whether the audit is SOC 2, ISO 27001, cyber insurance, or a customer security questionnaire, reviewers want evidence that you control identity, data access, and change over time. Microsoft 365 is usually in scope because it holds email, files, identity, and admin actions.",
          "They rarely care that you use Microsoft — they care that you know who has access, how it is enforced, and that you can show logs.",
        ],
      },
      {
        title: "Identity and access evidence",
        paragraphs: [
          "Prepare exports and screenshots before the auditor asks.",
        ],
        bullets: [
          "Conditional Access policy list with enforcement status",
          "MFA registration coverage report for all users and admins",
          "Privileged role assignments with PIM activation logs if used",
          "Guest user inventory with sponsor and last sign-in date",
        ],
      },
      {
        title: "Common audit failures",
        paragraphs: [
          "These findings show up repeatedly across tenants of every size.",
        ],
        bullets: [
          "Legacy authentication still enabled",
          "Excessive Global Administrators without MFA",
          "No documented break-glass procedure",
          "Over-permissioned third-party applications",
          "Licenses assigned to terminated employees",
          "Missing or incomplete audit log retention configuration",
        ],
      },
      {
        title: "Documentation to have ready",
        paragraphs: [
          "Policies matter as much as settings. Align your written standards with what is actually configured — auditors notice gaps between policy and practice.",
        ],
        bullets: [
          "Access control and offboarding procedures",
          "Guest and external collaboration policy",
          "Admin account management standard",
          "Incident response contacts and escalation path",
        ],
      },
      {
        title: "Pre-audit timeline",
        paragraphs: [
          "Eight weeks out: run a full tenant health scan and assign owners to critical findings. Four weeks out: close MFA and legacy auth gaps. Two weeks out: reconcile admin roster and guest list. One week out: export evidence pack and verify audit logging retention meets your framework.",
          "Running Tenant Hawk before an audit gives you a prioritized gap list with remediation steps — so you fix the highest-risk items first instead of guessing.",
        ],
      },
    ],
  },
];

export const GUIDE_BY_SLUG: Record<string, Guide> = Object.fromEntries(
  GUIDES.map((g) => [g.slug, g]),
);

export const GUIDE_CATEGORY_LABEL: Record<Guide["category"], string> = {
  overview: "Overview",
  security: "Security",
  cost: "Cost",
  reliability: "Reliability",
  hygiene: "Hygiene",
};

export const GUIDE_CATEGORY_CHIP: Record<
  Guide["category"],
  { chip: string; text: string }
> = {
  overview: { chip: "bg-blue-50", text: "text-blue-700" },
  security: { chip: "bg-red-50", text: "text-red-700" },
  cost: { chip: "bg-green-50", text: "text-green-700" },
  reliability: { chip: "bg-sky-50", text: "text-sky-700" },
  hygiene: { chip: "bg-yellow-50", text: "text-yellow-800" },
};
