# Launch Posts - Reddit & LinkedIn

Ready to post. Each is written for the specific community's norms. **Read the
subreddit sidebar/rules before posting** and only post where you're allowed to
share a tool (most allow it if you participate genuinely). Space them out - one
community per day, don't blast.

Tone rules: be a person, not a brand. Lead with the problem and the free value.
The link is incidental. Reply to every comment for the first 48h - engagement is
what the algorithm and the mods reward.

---

## r/msp - primary, highest value

**Title:** I built a free read-only M365 tenant scanner that scores client tenants and finds wasted licenses - looking for brutal feedback

**Body:**

I run/work in the M365 world and got tired of clicking through Entra, the M365
admin center, SharePoint settings and Intune every time I onboarded a tenant or
did a quarterly review. The stuff that bites you is always the boring stuff:
an app secret that quietly expired, Conditional Access policies stuck in
report-only, legacy auth still on, 23 licensed accounts that have never signed
in.

So I built **Tenant Hawk**. You connect a tenant **read-only** (admin consent,
no agents, we store only the tenant ID - tokens are minted on demand, nothing
persisted), it scans, and you get one health score plus a prioritized fix list
across security, identity, cost, reliability, SharePoint and Intune. It puts an
actual dollar figure on unused/never-signed-in licenses, which has been the
easiest thing to show clients.

It's free to scan and see your score. There's a paid tier to unlock the full
remediation report, and an MSP volume tier with a multi-tenant console + roll-ups
(that's the part I'd most love MSP feedback on).

Not trying to spam - genuinely want feedback from people who manage tenants for
a living. What checks would make this a no-brainer for your QBRs? What would stop
you from connecting it?

Link in comments to respect the rules.

*(First comment:)* Here's the tool - run a scan on a tenant and tell me what's
missing: https://tenanthawk.io - founding users can lock 25% off for life with
`EARLYBIRD26`, but the scan + score is free regardless.

---

## r/sysadmin - in-house admins

**Title:** Made a free tool that gives your M365 tenant a health score (read-only) - found $1,800/mo in unused licenses on the first tenant I tested

**Body:**

Every M365 tenant is messier than you think. There are hundreds of settings
spread across Entra, the admin center, SharePoint and Intune, and no single
place that tells you "here's what's actually wrong and what to fix first."

I built **Tenant Hawk** to be that place. Connect read-only (admin consent, no
agents, no credentials stored - only the tenant ID is kept), and you get:

- One health score + category grades (security, identity, cost, reliability)
- A prioritized fix list with step-by-step remediation
- A dollar figure on unused + never-signed-in licenses (great for justifying
  cleanup to management)
- Time-bomb alerts: app secrets, SSO signing certs and domains about to expire
- The risky stuff: legacy auth still allowed, Conditional Access in report-only
  or missing, anonymous SharePoint sharing, accounts with Global Admin

Free to scan and see your score. Would love feedback from people who live in
this stuff. Link in the comments.

---

## r/Office365 - admins, more functional framing

**Title:** Free read-only health check for your M365 tenant - secrets about to expire, unused licenses, sharing risks, all in one score

**Body:**

If you've ever wanted a single "is my tenant okay?" view instead of clicking
through ten admin blades, I built something for that.

**Tenant Hawk** connects read-only and scans your tenant for the stuff that
quietly goes wrong: app registrations with secrets about to expire, SSO signing
certs near expiry, licenses nobody's using, accounts that have never signed in,
external/anonymous SharePoint sharing left wide open, legacy auth, Conditional
Access gaps.

You get one health score and a prioritized list of what to fix first. No agents,
no creds stored (only the tenant ID), free to scan.

Curious what the most useful check would be for you - link in comments.

---

## r/Intune - narrower wedge, device angle

**Title:** Free tenant health scan now flags stale + non-compliant Intune devices alongside your M365/Entra risks

**Body:**

Built a read-only M365 tenant scanner (Tenant Hawk) and just want to share the
Intune-relevant part: alongside identity/CA/licensing checks, it flags
**non-compliant** and **stale** managed devices so they show up in the same
prioritized fix list as everything else - instead of being a separate tab you
forget to check.

Connects read-only, free to scan, no agents. Link in comments - would love to
hear what device-side checks you'd want next.

---

## LinkedIn - founder launch post

I kept seeing the same thing in every Microsoft 365 tenant I touched:

→ App secrets that expired and took down an integration
→ 20+ licensed accounts that had never once signed in
→ Conditional Access policies stuck in "report-only" for a year
→ Legacy auth quietly still allowed
→ SharePoint sharing wide open to anonymous links

None of it is exotic. It's just *invisible* - scattered across Entra, the admin
center, SharePoint and Intune, with no single place that says "here's what's
wrong and what to fix first."

So I built **Tenant Hawk**. 🦅

You connect a tenant **read-only** (admin consent, no agents, we store only the
tenant ID), and in about two minutes you get one health score and a prioritized,
dollar-quantified fix list across security, identity, cost and reliability.

The part people react to most: it puts a **real number** on wasted licenses. The
tool tends to pay for itself before you've fixed anything else.

It's free to run a scan and see your score → https://tenanthawk.io

If you manage M365 - in-house or as an MSP - I'd genuinely love your feedback on
what to check next. Comment "scan" and I'll send you the link directly.

Founding users can lock 25% off for life with EARLYBIRD26.

#Microsoft365 #MSP #ITadmin #Entra #cybersecurity

---

## Indie / builder communities (optional, secondary)

For r/SideProject, Indie Hackers, Hacker News "Show", etc. - frame as a build
story, not a sales pitch:

**Title (Show HN style):** Show: Tenant Hawk – read-only health score for your Microsoft 365 tenant

**Body:** A scanner that connects to M365/Entra/Azure read-only and returns one
health score + a prioritized fix list (security, cost, reliability, hygiene).
Stack: Next.js, Postgres, Microsoft Graph app-only read-only. Hardest part was
designing checks that are useful without false-positive fatigue, and a privacy
model admins will actually trust (we store only the tenant ID; tokens are minted
on demand). Free to scan. Happy to answer anything about the Graph permission
model or the scoring.
