# Proposal: full-scan trial for every signup

**Status:** draft for review · 2026-07-10
**Origin:** r/micro_saas $500-MRR post (Sleek Analytics) — replacing a free plan
with a no-card trial took trial→paid to ~25%, because "everyone starting a
trial has a real project."

## The problem

The free tier is reliability-only, which means a free signup **never sees the
license-waste dollar figure** — the single number every piece of Tenant Hawk
marketing leads with. The moment that sells Pro is behind the paywall; the
free experience shows expiring secrets and stops. Nobody connects an M365
tenant out of idle curiosity, so every TH signup already "has a real project" —
we're filtering out buyers, not tourists.

## The proposal

Every new signup gets **14 days of full Pro on one tenant, no card**:

- All four scan categories, dollar figures, daily scans, full fix list,
  exports — the complete Pro experience.
- Day 15 without upgrade → account drops to today's free tier (weekly
  reliability-only scan). Not a hard cutoff: they keep the score hook and
  email alerts, and we keep an open upgrade channel. This is softer than
  Sleek's kill-the-free-plan because "free scan" is the promise in all our
  Reddit comments and landing copy — we keep that promise.
- MSP multi-tenant trials stay sales-led (the "free week on the console" offer
  in the outreach kit), unchanged.

## Implementation (recommended path: local trial, no Stripe)

`getPlan()` in `src/lib/entitlements.ts` already returns pro features for
`status === "trialing"` subscriptions, but creating card-less Stripe trials
adds churn noise. Simpler:

1. **Trial window = `user.created_at` + 14 days.** No schema change needed;
   compute in `getPlan()`: if no active subscription and within window, return
   a `trial` plan that passes `hasProFeatures()` but not `isEnterprisePlan()`.
   (Add `"trial"` to the `Plan` union so UI can distinguish it from paid.)
2. **Trial banner** in the dashboard shell: "Full access: N days left" with
   upgrade CTA. Countdown is the main conversion surface.
3. **Copy changes:** pricing Free card becomes "Start — full scan free for
   14 days, then weekly reliability scans, $0 forever." Landing CTAs
   unchanged ("Run a free scan" stays true).
4. **Lifecycle emails via the existing n8n marketing webhook:** day-0 founder
   welcome, day-3 "what did the scan surface?", day-12 trial-ending with the
   tenant's own dollar figure in the subject line.
5. **Measurement:** PostHog funnel (signup → tenant_connected →
   scan_completed → plan_upgraded) is already instrumented. Trial conversion =
   plan_upgraded within 14 days of signup.

## Grandfathering & risks

- **Existing free users:** grant everyone a fresh 14-day window from launch
  day (goodwill + a reactivation email to the list).
- **Abuse (new email per tenant):** ignorable at current scale; revisit if it
  shows up.
- **"$0 forever" already public:** kept intact — the free tier survives, it
  just stops being the *first* experience.

## Success criteria

- Primary: trial→paid ≥ 10% in the first 60 days (Sleek hit 25% at a $9-ish
  price point; $49/tenant justifies a lower bar).
- Guardrail: signup rate doesn't drop (the offer got *better*, so it
  shouldn't).

## Effort

Roughly half a day of code (entitlements + banner + pricing copy) plus the two
n8n email flows.
