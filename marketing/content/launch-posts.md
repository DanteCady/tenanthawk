# Launch Posts - Reddit & LinkedIn

Ready to post where the rules actually allow it. **Read each subreddit's sidebar
before you touch anything.** Most IT admin subs (r/sysadmin, r/Office365,
r/Intune) treat a standalone "I built X" launch as advertising, same as r/msp.

Tone rules: be a person, not a brand. Lead with the problem and the free value.
No hyphens in Reddit copy (reads as AI). Reply to every comment for 48h where
you do post.

### Where vendor launches are allowed vs not

| Subreddit | Standalone launch? | What to do instead |
|-----------|-------------------|-------------------|
| **r/msp** | No (Rule 3) | Weekly Promo thread comment only |
| **r/sysadmin** | No (Rule 3) | Help in existing threads; link only if asked |
| **r/Office365** | No (community norm) | Same as sysadmin |
| **r/Intune** | No | Same as sysadmin |
| **r/SaaS, r/micro_saas, r/SideProject** | Yes (that's the point) | Founder / build story posts |
| **LinkedIn** | Yes | Founder post (already drafted below) |
| **Hacker News** | Yes (Show HN) | Build story, not sales pitch |

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

## r/micro_saas / r/SaaS - founder launch (standalone OK)

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
