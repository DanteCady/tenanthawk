# SEO Guide Briefs — Mapped to Real Findings

You already have 6 guides:
`m365-tenant-health-checklist`, `m365-security-misconfigurations`,
`find-wasted-m365-licenses`, `m365-expiring-secrets-and-domains`,
`m365-tenant-hygiene`, `prepare-for-m365-audit`.

These briefs **fill the gaps** — each targets a high-intent "how do I check/fix
X" query that maps 1:1 onto a check the scanner actually runs. That alignment is
the whole strategy: someone searches the problem → reads the fix → the free scan
finds it for them in one click.

**Format for every guide** (matches your existing `GuideShell` pattern):
- Title = the search query, near-verbatim
- Intro: the problem + why it bites (2–3 short paras)
- "How to check it manually" (steps, screenshots/portal paths) — earns trust
- "What good looks like" (the target state)
- "How to fix it" (steps)
- Soft CTA: "Or let Tenant Hawk find this (and everything like it) in 2 minutes"
  → `GuideCta` to `/signup`
- Internal links to 2–3 related guides + the relevant dashboard category

**Publishing order** = intent × volume. Do the top 4 first.

---

## Tier 1 — highest intent, ship first

### 1. `how-to-find-inactive-conditional-access-policies`
- **Query target:** "conditional access report only mode", "conditional access not working / not enforcing"
- **Maps to check:** *All Conditional Access policies are report-only* / *No CA policies found*
- **Angle:** The silent killer — policies that look like protection but only log.
  How to audit CA policy state, why report-only persists, how to safely flip to On.

### 2. `block-legacy-authentication-microsoft-365`
- **Query target:** "block legacy authentication M365", "disable legacy auth Entra"
- **Maps to check:** *Legacy authentication not blocked / still allowed*
- **Angle:** Why legacy auth undermines MFA, how to find what's still using it
  (sign-in logs), how to block it without breaking mailflow/older clients.

### 3. `audit-global-administrators-microsoft-365`
- **Query target:** "how many global admins should I have", "reduce global admin M365"
- **Maps to check:** *N accounts with Global Administrator*
- **Angle:** Microsoft's <5 recommendation, why over-provisioned GA is the top
  breach blast-radius, how to right-size with PIM / role-based admin.

### 4. `find-never-signed-in-licensed-users-m365`
- **Query target:** "unused M365 licenses report", "find users never signed in"
- **Maps to check:** *N never-signed-in licensed accounts* (cost)
- **Angle:** The fastest money in M365. Reconcile assigned licenses vs sign-in
  activity; the exact dollar math. (Complements `find-wasted-m365-licenses` —
  this is the narrower, higher-intent "never signed in" cut.)

---

## Tier 2 — strong intent

### 5. `check-mfa-coverage-microsoft-365`
- **Query target:** "users without MFA report M365", "MFA registration report Entra"
- **Maps to check:** *N users without MFA*
- **Angle:** Why "we have MFA" ≠ "everyone is enrolled and enforced." Finding the
  gaps, especially break-glass and service accounts done wrong.

### 6. `renew-sso-signing-certificate-before-it-expires`
- **Query target:** "SAML signing certificate expired", "Entra enterprise app cert renewal"
- **Maps to check:** *SSO signing certificate expires in N days*
- **Angle:** The 2am outage. How to find expiry across enterprise apps, how to
  rotate without downtime. (Complements `m365-expiring-secrets-and-domains` with
  the SSO-cert-specific cut.)

### 7. `lock-down-sharepoint-external-sharing`
- **Query target:** "SharePoint anonymous sharing disable", "stop external sharing OneDrive M365"
- **Maps to check:** *External / anonymous / guest SharePoint sharing org-wide*
- **Angle:** Anyone-with-the-link is data exfiltration waiting to happen. How to
  audit org-wide sharing settings and tighten without blocking real collab.

### 8. `clean-up-guest-accounts-microsoft-365`
- **Query target:** "remove inactive guest users Entra", "audit external guests M365"
- **Maps to check:** *N guest accounts / inactive guests*
- **Angle:** Guests from finished projects = standing access risk. How to find
  stale guests by last sign-in and bulk-review them.

---

## Tier 3 — round out coverage

### 9. `find-non-compliant-intune-devices`
- **Maps to check:** *N non-compliant / stale Intune devices*
- **Angle:** Compliance drift, stale enrollments, why they slip past dashboards.

### 10. `plan-for-your-e5-renewal-microsoft-365`
- **Maps to check:** *E5 subscription renewal in N days* (cost/reliability)
- **Angle:** Don't auto-renew blind. How to true-up seats before the renewal date
  and negotiate from actual usage data.

### 11. `microsoft-365-security-checklist-for-msps`
- **MSP-targeted** version of the health checklist — explicitly for people
  managing many tenants. Feeds the MSP funnel. Strong internal-link hub.

---

## Distribution for each guide (don't just publish and pray)

- Link from the relevant in-app dashboard finding ("Learn more" → guide).
- Repurpose each guide into 1 LinkedIn educational post + 1 "finding of the week".
- Answer the matching question on Reddit/Spiceworks with a genuine answer, then
  "I wrote this up in more detail here" (only where allowed).
- Cross-link guides to each other and to `/signup` — build the internal mesh.
