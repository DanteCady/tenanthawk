# Lifecycle Emails

The conversion happens *after* the free scan, when the user has seen their score
and hit the paywall. These sequences turn that moment into revenue. Built to run
in n8n (see `automation/n8n-playbook.md`).

Personalization tokens available from scan data: `{{Score}}`, `{{TopFinding}}`,
`{{LicenseWasteMonthly}}`, `{{ExpiringSoonCount}}`, `{{SeverityHighCount}}`,
`{{FirstName}}`, `{{TenantName}}`. **Only inject figures the scan produced.**

Founding offer to weave in: `EARLYBIRD26` = 25% off, locked for life.

---

## Sequence A — Free scan → Pro (in-house admin)

Trigger: scan completed, plan = Free. 5 emails over ~14 days. Stop on upgrade.

**A1 — Immediate: your score (sent ~5 min after scan)**
> Subject: Your tenant scored {{Score}}/100 🦅
>
> Hi {{FirstName}},
>
> Your scan is done. Tenant Hawk gave **{{TenantName}}** a health score of
> **{{Score}}/100**, with {{SeverityHighCount}} high-severity issues.
>
> The biggest one right now: **{{TopFinding}}**.
>
> Unlock the full report to see every finding, the severity, the dollar impact,
> and step-by-step remediation for each → [See my full report]({{ReportURL}})
>
> (Founding users lock 25% off for life with code `EARLYBIRD26`.)

**A2 — Day 1: the money angle**
> Subject: You're paying ~${{LicenseWasteMonthly}}/mo for licenses nobody uses
>
> Your scan flagged about **${{LicenseWasteMonthly}}/month** in unused or
> never-signed-in licenses. That's ${{LicenseWasteMonthly}}×12 a year you can
> recover — usually more than the cost of fixing everything else combined.
>
> The full report shows exactly which accounts and how to reclaim them.
> [Unlock it]({{ReportURL}})

**A3 — Day 3: the time-bomb**
> Subject: {{ExpiringSoonCount}} things in your tenant are about to expire
>
> App secrets, SSO signing certs and domains don't fail gracefully — they take
> an integration or sign-in down with no warning. Your scan found
> **{{ExpiringSoonCount}}** expiring soon.
>
> The full report lists each one, the days remaining, and how to rotate it before
> it fires. [See what's expiring]({{ReportURL}})

**A4 — Day 7: social proof / use case**
> Subject: From "where do I start?" to a sorted to-do list
>
> The hardest part of M365 hygiene was never effort — it's that nothing's
> prioritized. Your full report sorts every finding by severity and impact, so
> you fix what matters first and can show your manager exactly what you handled.
> [Open my prioritized fix list]({{ReportURL}})

**A5 — Day 14: founding deadline nudge**
> Subject: Your founding rate (25% off for life)
>
> Quick reminder: founding pricing — **25% off, locked for life** with
> `EARLYBIRD26` — is for early users. Once you've cleaned up your tenant once,
> Tenant Hawk keeps watching it so the score doesn't quietly slide back.
> [Upgrade and lock my rate]({{BillingURL}})

---

## Sequence B — Free scan → MSP (multi-tenant signal)

Trigger: scan completed AND (multiple tenants connected OR email domain looks
like an MSP/IT firm OR self-identified MSP at signup). 3 emails over ~10 days.

**B1 — Day 0**
> Subject: One score across every client tenant
>
> Hi {{FirstName}}, you ran a scan — here's the part built for people who manage
> *many* tenants: the MSP console rolls every client's score into one view, so
> you can open every QBR with a number that's trending up and a license-waste
> line you can bill against. Want me to set you up with the multi-tenant trial?
> [Show me the MSP console]({{MSPURL}})

**B2 — Day 4**
> Subject: The QBR one-pager your clients will actually read
>
> A scored, prioritized, dollar-quantified health page per client — read-only,
> no agents. It turns tenant hygiene into a recurring, visible deliverable (and
> a natural upsell into remediation projects). [See volume pricing]({{MSPURL}})

**B3 — Day 10**
> Subject: Founding MSP rate — 25% off for life
>
> If you roll Tenant Hawk across your book now, `EARLYBIRD26` locks 25% off for
> life. Happy to do a 15-min walkthrough on one of your real client tenants —
> just reply with a time. [Start the MSP trial]({{MSPURL}})

---

## Sequence C — Dormant re-engagement

Trigger: scanned once, no upgrade, no login in 30 days. 1–2 emails.

**C1 — Day 30**
> Subject: Your tenant has drifted since your last scan
>
> Tenants don't stay clean — new licenses get assigned, secrets tick toward
> expiry, policies change. It's been a month since you scanned {{TenantName}}.
> Re-scan free and see what's moved. [Re-run my scan]({{ScanURL}})

**C2 — Day 45 (final)**
> Subject: Want me to keep your score from sliding?
>
> Pro re-scans on a schedule and flags new issues automatically, so you don't
> have to remember. Founding rate (`EARLYBIRD26`, 25% off for life) is still
> open. [Turn on monitoring]({{BillingURL}})

---

## Behavioral one-offs (high converters — wire these too)

- **Viewed billing/upgrade page, didn't buy (24h later):** "Questions about
  Pro? Reply here — happy to help. Your founding rate is still open."
- **Shared a report link** (`/shared/[token]` used): "Glad the report was worth
  sharing 🦅 — want the people you shared it with to run their own free scan?"
  *(turns your share feature into a referral loop).*
- **New high-severity finding on a re-scan (Pro users):** "New high-severity
  issue on {{TenantName}}: {{TopFinding}}." — retention + perceived value.

## Deliverability notes
- Warm the sending domain; authenticate SPF/DKIM/DMARC (you're emailing IT
  admins — they *will* check your headers, and a misconfigured sender is
  embarrassing for a security tool).
- Plain-text-feeling HTML outperforms heavy templates for this audience.
- One clear CTA per email. Always include an unsubscribe.
