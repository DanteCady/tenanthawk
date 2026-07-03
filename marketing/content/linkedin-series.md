# LinkedIn Post Bank - Ongoing 3x/week Cadence

A ready bank of posts so you (or n8n) never stare at a blank page. Mix the types:
**educational** (build authority), **proof/number** (build credibility),
**story** (build relatability), **soft-CTA** (convert). Aim ~1 hard CTA per 4–5
posts; the rest earn the right to it.

Posting cadence: Tue/Wed/Thu mornings tend to perform best for B2B IT. Always
reply to comments within the first hour - it's the single biggest reach lever.

Hashtag set (rotate 3–5): #Microsoft365 #MSP #Entra #ITadmin #cybersecurity
#Intune #SharePoint #cloudsecurity #vCISO

---

## EDUCATIONAL

**E1 - The checklist hook**
The fastest M365 tenant health check, in order of "what actually bites you":

1. Are any app secrets / SSO certs expiring in the next 30 days?
2. Is legacy auth still allowed?
3. Are your Conditional Access policies actually enforced - or stuck in report-only?
4. How many accounts hold Global Admin? (If it's more than ~5, look closer.)
5. How many licensed users have literally never signed in?
6. Is SharePoint external/anonymous sharing on org-wide?

You can check all six by hand across four admin portals… or get them as one
score. Either way - go check #1 today. It's the one that pages you at 2am.

---

**E2 - Myth-bust**
"We have MFA, so we're fine."

MFA is necessary, not sufficient. The tenants I see get burned still have:
→ legacy auth protocols allowed (which bypass modern MFA enforcement paths)
→ Conditional Access policies in report-only (logging, not blocking)
→ guest accounts from a project that ended two years ago
→ a Global Admin count nobody has audited

Security posture is the *combination*. One gap undoes the rest.

---

**E3 - The cost angle**
Microsoft will happily sell you E5 licenses. They will not call to tell you that
23 of them have never been signed into.

Unused and never-signed-in licenses are the most overlooked line item in M365.
On most tenants it's four figures a month. The fix is free; the hard part is
just *seeing* it.

When did you last reconcile assigned licenses against actual sign-in activity?

---

## PROOF / NUMBER (the benchmark engine)

> Build these from your real aggregate scan data once you have volume. Until
> then, frame as "on the tenants I've scanned." Never invent figures.

**P1**
Pattern I keep seeing across M365 tenants I scan:

The single biggest source of waste isn't compute or storage. It's **licenses
assigned to people who never sign in.** Median I'm seeing is well into four
figures per month, per tenant.

It's the easiest money you'll ever recover - if you can see it.

---

**P2**
The most common *security* finding, by far: Conditional Access policies sitting
in **report-only**. They feel like protection. They're logging, not enforcing.

If you set one up "to test it" months ago and never flipped it to On - that's
today's five-minute job.

---

## STORY / RELATABLE

**S1**
An expired client secret took down an integration at one of the worst possible
times. Nobody had it on a calendar. Nobody owned it.

That single incident is most of why I built a scanner that watches app secrets,
SSO signing certs and domains for expiry and surfaces them *before* they fire -
not in the post-mortem.

What's the dumbest preventable outage you've lived through?

---

**S2**
"Where do I even start?" is the most honest thing an M365 admin can say.

There are hundreds of settings across Entra, the admin center, SharePoint and
Intune. The problem was never effort - it's that there's no prioritized list.
Risk and reward aren't ranked, so everything feels equally urgent and nothing
gets done.

A score with a sorted fix list isn't fancy. It just answers "start here."

---

## SOFT-CTA

**C1**
I'll do a free read-only health check on your Microsoft 365 tenant.

You get a score + the top things to fix (security, cost, reliability), and a
dollar figure on any wasted licenses. No agents, nothing stored but the tenant
ID, takes about two minutes.

Comment "scan" or DM me and I'll send the link. 🦅

---

**C2 - for consultants & MSPs**
Consultants and MSPs: walk into every client meeting with a one page tenant
health score that went up since last time, and a line item showing the licenses
you helped them stop paying for.

That is the multi tenant console in Tenant Hawk. Read only, volume pricing.
If you manage client M365 tenants, DM me. I will get you set up to scan a few.

---

## RECURRING FORMAT IDEAS (for the cadence, not one-offs)

- **"Finding of the week"** - pick one real check, explain why it matters + the
  fix. 8+ posts from your own check catalog alone.
- **"Tenant myth vs reality"** - recurring myth-bust series.
- **Monthly benchmark drop** - one stat from aggregate scan data ("this month's
  median license waste was $X"). Highly shareable, evergreen.
