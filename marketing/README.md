# Tenant Hawk - Go-To-Market Kit

The hawk-eye view of your Microsoft 365 & Azure tenant. This folder is the
operating system for getting customers. Everything here is ready to use, edit,
and automate (n8n).

---

## 1. The strategy in one paragraph

Tenant Hawk's growth engine is the **free read-only scan that returns a slightly
alarming health score**. "Your tenant is messier than you think" + a shareable
report is a curiosity loop that sells itself. Our job is **distribution, not
invention**. We run two motions in parallel: a **volume top-of-funnel** (free
scan + SEO + community posts) aimed at in-house M365 admins, and a
**revenue motion** (targeted MSP outreach + case studies) aimed at MSPs, who
buy many tenants on the volume tier. Both consume the same content, so we don't
fork our effort.

## 2. Who we sell to (ICP)

| Segment | Why they buy | Where they are | Economics |
|---|---|---|---|
| **MSPs / IT consultants** *(revenue-weighted)* | One console to prove value to clients, find unused licenses to bill back, catch risk before clients do | r/msp, MSPGeek Slack, LinkedIn, MSP newsletters/Discords | Many tenants × volume pricing - the real money. One win = dozens of seats + a case study |
| **In-house M365 admins** | "Where do I even start?" - one score + prioritized fixes; quantified license waste to justify budget | r/sysadmin, r/Office365, r/Intune, r/entra, LinkedIn | $49/mo/tenant. Large population, self-serve |
| **vCISO / IT consultants (solo)** | Fast tenant audit deliverable for clients | LinkedIn, r/msp, r/cybersecurity | Pro or low-volume MSP |

## 3. Messaging pillars (use these everywhere)

1. **"You can't fix what you can't see."** Hundreds of settings across M365,
   Entra, Azure. One score, one prioritized fix list, in 2 minutes.
2. **Money, not just risk.** We put a dollar figure on wasted licenses and
   show E5/renewal exposure. This makes the tool *pay for itself* and gives
   admins budget ammo.
3. **Read-only, no agents, no creds stored.** Removes the #1 objection. We
   store only the tenant ID; tokens are minted on demand.
4. **Time-bombs you forget about.** Expiring app secrets, SSO signing certs,
   domains - the stuff that takes prod down at 2am.
5. **Founding pricing.** `EARLYBIRD26` = 25% off, locked for life. Real
   scarcity, real urgency, ethical.

**Proof points that map to real detections** (never overpromise beyond these):
unused-license $/mo, never-signed-in licensed seats, accounts with Global Admin,
users without MFA, no/report-only Conditional Access, legacy auth allowed,
expiring app secrets & SSO certs, external/anonymous SharePoint sharing,
inactive users, stale guests, non-compliant Intune devices.

## 4. The funnel + the one metric per stage

```
Community/SEO/Outreach  →  Free scan  →  Score + paywalled report  →  Pro / MSP
   (reach)                  (activation)    (value moment)             (revenue)
```

- **Reach:** impressions / clicks to tenanthawk.io
- **Activation:** scans completed (the magic moment is seeing the score)
- **Value:** report shares + upgrade-page views
- **Revenue:** Pro + MSP conversions

> The single highest-leverage number to watch weekly: **scans completed.**
> Everything upstream exists to grow it; everything downstream converts it.

## 5. First 30 days (founder-led, automation-assisted)

**Week 1 - Turn on the engine.**
- Publish the launch posts (`content/launch-posts.md`) - start with r/msp and
  LinkedIn. Space them out; one community per day.
- Stand up the post-scan email sequence in n8n (`lifecycle/post-scan-emails.md`).
- Build the MSP target list (`outreach/msp-outreach-kit.md` → sourcing section).

**Week 2 - Outreach + content cadence.**
- Begin MSP outreach (20–30 personalized touches; quality over volume).
- Ship 2 SEO guides from `seo/guide-briefs.md` (highest-intent first).
- Start the LinkedIn 3x/week cadence (`content/linkedin-series.md`).

**Week 3 - Double down on what moved scans.**
- Review the weekly metric. Whichever channel drove the most scans, do more.
- First MSP demo calls → ask every one for a quote/case study.
- Publish 2 more guides.

**Week 4 - Systematize.**
- Wire the n8n automations end to end (`automation/n8n-playbook.md`).
- Aggregate scan data into a **"State of M365 Hygiene" benchmark stat**
  (e.g. "median tenant wastes $X/mo on unused licenses") - this becomes
  evergreen PR/content fuel and a recurring LinkedIn hook.

## 6. Folder map

| File | What it is |
|---|---|
| `content/launch-posts.md` | Ready-to-post Reddit + LinkedIn launch content, per community |
| `content/linkedin-series.md` | A bank of LinkedIn posts for an ongoing 3x/week cadence |
| `outreach/msp-outreach-kit.md` | ICP, where to source MSPs, cold email + DM sequences, the offer |
| `seo/guide-briefs.md` | New guide briefs mapped 1:1 to real findings, with target keywords |
| `lifecycle/post-scan-emails.md` | Email sequences: free→Pro, MSP, dormant re-engage |
| `automation/n8n-playbook.md` | n8n workflows to run all of the above hands-off |

## 7. Hard rules (don't get banned / don't burn trust)

- **Lead with value, not links.** In communities, the free tool *is* the value;
  the link is incidental. Answer questions, share findings, be a person.
- **Never fake numbers.** Only cite detections the scanner actually produces.
- **Respect each subreddit's self-promo rules** (most allow "I built a free
  tool" if you're a participant, not a drive-by). Read the sidebar first.
- **Read-only / privacy is the lead, every time** - it's what unblocks the click.
