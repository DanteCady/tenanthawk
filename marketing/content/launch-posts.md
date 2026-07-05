# Launch Posts - Reddit & LinkedIn

Ready to post where the rules actually allow it. **Read each subreddit's sidebar
before you touch anything.** Most IT admin subs (r/sysadmin, r/Office365,
r/Intune) treat a standalone "I built X" launch as advertising, same as r/msp.

Tone rules: be a person, not a brand. Lead with the problem and the free value.
No hyphens in Reddit copy (reads as AI). Reply to every comment for 48h where
you do post.

### Reddit target matrix (standalone vs thread only)

**Spacing rule:** Never post the same copy to more than one subreddit in 24 hours.
Wait 2 to 3 days between standalone launches. Reply to every comment for 48h.

#### Green: standalone posts OK (post here first)

| Subreddit | ~Size | Standalone? | Account gate | ICP fit | Priority |
|-----------|-------|-------------|--------------|---------|----------|
| **r/micro_saas** | 50K | Yes, any day | Low | High (B2B SaaS founder story) | **1** |
| **r/SideProject** | 260K | Yes, any day | Low | High (show live product) | **2** |
| **r/AlphaAndBetaUsers** | 25K | Yes, feedback focus | Low | High (M365 admin beta testers) | **3** |
| **r/RoastMyStartup** | 21K | Yes, roast format | Low | Medium (engagement + feedback) | **4** |
| **r/IMadeThis** | 60K | Yes, show and tell | Low | Medium | **5** |
| **r/buildinpublic** | 50K+ | Yes, journey posts | Low | Medium (metrics updates) | **6** |
| **r/indiehackers** | 120K | Yes, use SHOW IH flair | Medium | Medium | **7** |
| **r/EntrepreneurRideAlong** | 300K | Yes, case study format | 30d account | Medium (numbers story) | **8** |

#### Yellow: promo only in designated threads (low ban risk)

| Subreddit | Promo lane | When | Gate | Priority |
|-----------|------------|------|------|----------|
| **r/SaaS** | Share Your SaaS Saturday | Saturdays | Karma in sub; 1 promo / 60 days | **9** |
| **r/Entrepreneur** | Share Your Business | Mondays | 10 comment karma in sub | **10** |
| **r/startups** | Share Your Startup | Monthly sticky | 30 day account | 11 |
| **r/smallbusiness** | Promote Your Business | Wednesdays | 100 karma, 30 days | 12 |
| **r/msp** | Weekly Promo | Check pinned | 50 karma in sub for top level | **13** |
| **r/netsec** | Monthly tool thread | Pinned only | Technical; security angle | 14 |
| **r/webdev** | Showoff Saturday | Saturdays | 100 karma, 30 days | 15 |

#### Red: no launch posts (comment only)

| Subreddit | Why |
|-----------|-----|
| r/sysadmin, r/Office365, r/microsoft365, r/Intune, r/entra, r/azure | Vendor hostile; link only if asked in thread |
| r/cybersecurity, r/AskNetsec | No promo threads; help first |
| r/marketing, r/SEO, r/PPC | Banned outside weekly threads |
| r/devops | Operational answers only |

#### Low quality, low rules (optional)

r/shamelessplug, r/promote, r/newproducts, r/shareyourstartup. Easy to post, thin audience.

### 2 week posting calendar

| Day | Action | Copy section below |
|-----|--------|-------------------|
| ~~Thu~~ **DONE** | r/micro_saas standalone | [Live post](https://www.reddit.com/r/micro_saas/comments/1umiq7t/solo_founder_launch_m365_tenant_health_scanner/) — do not repost |
| **NEXT** | r/SideProject standalone | [Copy](#r-sideproject---standalone-launch) → paste body at https://www.reddit.com/r/SideProject/submit |
| Sat | r/SaaS Share Your SaaS Saturday thread | [r/SaaS thread](#r-saas--share-your-saas-saturday-thread) |
| Sun | Comment on 3 r/msp threads (no links) | [r/msp karma](#r-msp---weekly-promo-thread-rule-3-compliant) |
| Mon | r/Entrepreneur Share Your Business thread | [r/Entrepreneur thread](#r-entrepreneur--share-your-business-monday) |
| **NEXT (ICP)** | r/msp Weekly Promo comment | https://www.reddit.com/r/msp/comments/1uihsl0/weekly_promo_and_webinar_thread/ |
| Fri | r/AlphaAndBetaUsers or r/RoastMyStartup | [Feedback posts](#r-alphaandbetausers--feedback-request) |

### Universal posting rules

- ~10% self promo across your whole Reddit account (1 promo per 9 helpful comments)
- Personal account, disclose in post ("I built this")
- No "DM me" or "comment for link"
- No UTM parameters in links
- No cross posting identical text to 3+ subs in 24h

---

## r/msp - Weekly Promo thread (Rule 3 compliant)

**Do not** use `/r/msp/submit` for a product launch. Standalone "I built X" posts
violate Rule 3 (Vendor Promotions) even with a feedback angle.

### Before you post

1. **Rule 9:** You need **50 comment karma in r/msp** before you can create
   top level posts. Commenting on the Weekly Promo thread may still work as a
   reply; if Reddit blocks you, build karma first (see below).
2. **Find the thread:** Search r/msp for `Weekly Promo` or check pinned posts.
   Mods post a new one regularly (often weekly). Comment on the **current** thread
   only.
3. **Identify as vendor:** Use **Brand affiliate** tag if posting a top level
   thread elsewhere; in the promo thread, open with "Vendor:" or "Disclosure: I
   built this."
4. **Set user flair** in r/msp sidebar if available (MSP, MSP US, etc.).

### Karma building (1 to 2 weeks if needed)

Comment genuinely on threads about M365 reviews, licensing waste, Conditional
Access, onboarding tenants. No links unless someone asks. Examples:

- "We still pull never signed in licensed users into a spreadsheet before every
  client review. Stale guests and report only CA policies are the ones that bite us."
- "Dollar figure on unused licenses is the easiest way to get client buy in for
  cleanup. Security findings alone rarely move budget."

### Comment for the Weekly Promo thread

Paste as a **top level comment** on the current Weekly Promo megathread (link
goes in the comment body; that is expected in promo threads):

---

**Vendor disclosure:** I built this. Happy to answer technical questions.

**Tenant Hawk** (https://tenanthawk.io) is a read only M365 tenant health
scanner. Connect with admin consent, no agents, we store only the tenant ID.

**Free:** Scan and health score across security, identity, cost, reliability,
SharePoint, Intune.

**What it flags:** Expiring app secrets and SSO certs, legacy auth, Conditional
Access gaps and report only policies, unused and never signed in licenses (with
a dollar figure), external SharePoint sharing, stale guests, non compliant Intune
devices.

**Paid:** Full remediation report. MSP volume tier with multi tenant console and
roll ups (would love feedback on this part specifically).

**Pricing:** Scan and score are free. Founding users: `EARLYBIRD26` for 25% off
locked for life.

Genuinely want feedback from consultants and MSPs: what checks would make this
useful in a client health report? What would stop you from connecting a client
tenant read only?

---

### r/msp launch sequence

| Step | Action |
|------|--------|
| 1 | Comment on 5 to 10 r/msp threads (no links) over a few days |
| 2 | Find current Weekly Promo thread |
| 3 | Paste comment above |
| 4 | Reply to every response for 48h |
| 5 | Post to r/SaaS or r/micro_saas (founder launch OK there) |
| 6 | Participate in r/sysadmin / r/Office365 threads (no links unless asked) |

---

## r/sysadmin, r/Office365, r/Intune - participation only (no launch post)

**Do not** submit a standalone "I built Tenant Hawk" post. Rule 3 on r/sysadmin
is explicit:

- Vendors may discuss their product **only in the context of an existing
  discussion**
- Posting your own content (including a tool you built) **is** a product
- **Content creators should refrain from directing this community to their own
  content**

Disclosure + Brand affiliate + link in comments does **not** make a launch post
compliant. Mods remove these routinely.

### What actually works

1. **Comment** on threads where you can add real operator value (unused licenses,
   Conditional Access stuck in report only, legacy auth, expiring app secrets,
   tenant audits, "where do I start" hygiene questions).
2. **No link** in the comment unless someone explicitly asks for a tool or you
   are directly answering "how do you check X?"
3. When you do mention Tenant Hawk: one sentence disclosure, name the trade
   offs, compare honestly to what they'd do manually or with Secure Score.
4. **Moronic Monday / Thickheaded Thursday** are for *their* questions, not your
   promo.
5. Build karma for weeks before any product mention. Aim for 90/10 (help first).

### Example comments (no link)

On a thread about finding unused M365 licenses:

> We export licensed users who never signed in plus stale guests into a sheet
> before each client review. The dollar figure is what gets budget for cleanup.
> Security findings alone rarely move management. Report only CA policies are the
> other one that sits there forever.

On a thread about tenant security baseline:

> Secure Score is a start but it does not catch report only CA, never signed in
> licensed users, or app secrets about to expire in one view. We still walk
> Entra, SharePoint admin, and Intune separately for anything client facing.

### If someone asks "what tool?"

> Disclosure: I built Tenant Hawk for this. Read only Graph scan, free score,
> flags the license waste and CA gaps above. https://tenanthawk.io if you want
> to try it. Happy to compare notes on what it misses vs your process.

---

## r/micro_saas - standalone launch

**Status: POSTED** (2026-07-03). Do not submit again.

**Live URL:** https://www.reddit.com/r/micro_saas/comments/1umiq7t/solo_founder_launch_m365_tenant_health_scanner/

**Author:** u/BugHorror2077 · **Title:** Solo founder launch: M365 tenant health scanner, first test found $1,800/mo in unused licenses

Optional: edit post body to add updated beta stats ($3k/mo, 3 tenants) instead of creating a second post.

**URL (new posts):** https://www.reddit.com/r/micro_saas/submit

**Title:** Solo founder launch: M365 tenant health scanner, beta found ~$3k/mo license waste across 3 tenants

**Body:**

Disclosure: I built this.

I kept hitting the same quiet problems in Microsoft 365 tenants: app secrets about to expire, licensed users who never signed in, Conditional Access stuck in report only, legacy auth still on.

Built **Tenant Hawk** to put it in one prioritized list with a health score. Connects read only via Microsoft Graph (admin consent, no agents, we store only the tenant ID).

**Stack:** Next.js, Postgres, Graph app only permissions.

**Early signal:** 3 beta tenants, about $3k/mo in unused and never signed in licenses flagged before anything else was fixed. 45+ security group cleanups surfaced in one pass.

**Pricing:** Free to scan and see your score. Pro unlocks full remediation report. MSP volume tier for multi tenant rollups (still figuring this part out).

https://tenanthawk.io

Would love feedback from anyone managing M365 tenants or client tenants as a consultant. What check would make this useful in a client update? Will be in comments.

---

## r/SideProject - standalone launch

**URL:** https://www.reddit.com/r/SideProject/submit

**Title:** Built a read only M365 tenant health scanner (free score + dollar impact on license waste)

**Body:**

Disclosure: I built this.

Problem: M365 tenant issues are scattered across Entra, admin center, SharePoint, and Intune. License waste and report only Conditional Access policies hide until something breaks or a client asks.

What I shipped: **Tenant Hawk** connects read only (Graph admin consent, no agents), runs 30+ checks, returns one health score and a prioritized fix list with estimated monthly waste on license findings.

Live at https://tenanthawk.io (free scan, no credit card).

Early beta: ~$3k/mo recoverable license waste across 3 small tenants.

Stack: Next.js, Postgres, Microsoft Graph.

Looking for feedback from admins and MSPs: what would you need to trust a read only scan on a client tenant?

---

## r/AlphaAndBetaUsers - feedback request

**URL:** https://www.reddit.com/r/AlphaAndBetaUsers/submit

**Title:** [Launched] Read only M365 tenant scanner. Need feedback from admins and MSPs

**Body:**

Disclosure: I built Tenant Hawk.

**Stage:** Launched (free tier live, paid tier in beta)

**Product:** Read only Microsoft 365 / Entra / Intune health scan. One score, prioritized findings, dollar impact on license waste.

**What I need feedback on:**
1. Would you connect a client tenant read only? What would stop you?
2. Which checks matter most in a client health report?
3. Is the MSP multi tenant console useful or overkill for solo consultants?

**Try it:** https://tenanthawk.io (free scan)

**Context:** Beta on 3 tenants surfaced ~$3k/mo unused licenses and dozens of hygiene issues admins did not know about.

Happy to answer anything about Graph permissions or the privacy model (we store only tenant ID).

---

## r/RoastMyStartup - feedback request

**URL:** https://www.reddit.com/r/RoastMyStartup/submit

**Title:** Roast my M365 tenant health scanner (read only scan, free tier)

**Body:**

Disclosure: I built this. I can take honest feedback.

**Tenant Hawk** is a read only scanner for Microsoft 365 tenants. Connect via admin consent, get a health score and prioritized findings (license waste with dollar figures, report only CA, legacy auth, expiring secrets, etc.).

https://tenanthawk.io

**Traction so far:** 3 beta tenants, ~$3k/mo in flagged license waste, mostly never signed in users and disabled accounts still licensed.

**Pricing:** Free scan. $49/mo Pro. MSP volume tier TBD.

Roast the positioning, pricing, or the idea of another M365 tool. What would make you actually use this vs a spreadsheet and Secure Score?

---

## r/SaaS - Share Your SaaS Saturday thread

**Do not** standalone post more than once per 60 days. Use the weekly thread.

**Find thread:** Search r/SaaS for `Share Your SaaS Saturday` or check pinned posts.

**Comment:**

Disclosure: I built Tenant Hawk.

Read only M365 tenant health scanner. One Graph connection, one health score, prioritized fix list with dollar impact on license waste.

**Free:** Scan + score. **Pro:** Full remediation report + exports.

Beta: 3 tenants, ~$3k/mo unused licenses found, 45+ group hygiene issues surfaced.

https://tenanthawk.io

Built for M365 admins, consultants, and MSPs. Would love feedback on what checks belong in a client health report.

---

## r/Entrepreneur - Share Your Business Monday

**Find thread:** Search r/Entrepreneur for `Share Your Business` (Monday pinned).

**Gate:** Need ~10 comment karma earned in r/Entrepreneur first.

**Comment:**

Disclosure: I built this.

**Tenant Hawk** (https://tenanthawk.io) scans Microsoft 365 tenants read only and returns one health score plus a prioritized fix list. The hook that lands with clients: real dollar figures on license waste, not just security checkmarks.

**Model:** Free scan, $49/mo Pro, MSP volume pricing in beta.

**Early proof:** 3 beta companies, ~$3k/mo recoverable license waste flagged, 45+ security group cleanups in one pass.

Targeting IT consultants and MSPs who need a fast tenant audit before client conversations. What would you want in a 2 minute client health report?

---

## r/micro_saas / r/SaaS - founder launch (legacy copy)

These subs exist for builders sharing what they shipped. **r/micro_saas** is the
better first post (more launch friendly). **r/SaaS** tightened rules in 2026:
once per 60 days for self promo; weekly feedback thread is safest there.

**Title:** Solo founder launch: M365 tenant health scanner, first test found $1,800/mo in unused licenses

**Body:**

I kept running into the same quiet problems across Microsoft 365 tenants: app
secrets about to expire, licensed users who never signed in, Conditional Access
stuck in report only, legacy auth still on.

Built **Tenant Hawk** to put it in one prioritized list with a health score.
Connects read only via Microsoft Graph (admin consent, no agents, we store only
the tenant ID).

**Stack:** Next.js, Postgres, Graph app only permissions.

**Early signal:** First real tenant flagged about $1,800/mo in unused and never
signed in licenses before I fixed anything else.

**Pricing:** Free to scan. Pro unlocks full remediation report. MSP volume tier
for multi tenant rollups (still figuring this part out).

https://tenanthawk.io

Would love feedback from anyone managing M365 tenants. What check would make
this useful in a client update? Will be in comments.

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

For r/IMadeThis, r/buildinpublic, Indie Hackers, Hacker News "Show", etc. use the
SideProject or micro_saas copy above and adjust the title. Frame as a build story,
not a sales pitch:

**Title (Show HN style):** Show: Tenant Hawk – read-only health score for your Microsoft 365 tenant

**Body:** A scanner that connects to M365/Entra/Azure read-only and returns one
health score + a prioritized fix list (security, cost, reliability, hygiene).
Stack: Next.js, Postgres, Microsoft Graph app-only read-only. Hardest part was
designing checks that are useful without false-positive fatigue, and a privacy
model admins will actually trust (we store only the tenant ID; tokens are minted
on demand). Free to scan. Happy to answer anything about the Graph permission
model or the scoring.
