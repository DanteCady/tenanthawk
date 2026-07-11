/**
 * Full-access trial: every new account gets TRIAL_DAYS of Pro-level features
 * on their tenant, no card. Afterwards the account falls back to the free
 * plan (weekly reliability-only scans). See marketing/trial-restructure-proposal.md.
 */

export const TRIAL_DAYS = 14;

/**
 * Accounts created before the trial feature shipped are grandfathered with a
 * fresh window starting at launch, so existing free users get the full
 * experience once too.
 */
export const TRIAL_LAUNCH_DATE = new Date("2026-07-11T00:00:00Z");

const DAY_MS = 24 * 60 * 60 * 1000;

export function trialEndsAt(userCreatedAt: Date): Date {
  const start =
    userCreatedAt.getTime() > TRIAL_LAUNCH_DATE.getTime()
      ? userCreatedAt
      : TRIAL_LAUNCH_DATE;
  return new Date(start.getTime() + TRIAL_DAYS * DAY_MS);
}

export function isTrialActive(userCreatedAt: Date, now = new Date()): boolean {
  return now.getTime() < trialEndsAt(userCreatedAt).getTime();
}

/** Whole days remaining, rounded up; 0 when expired. */
export function trialDaysLeft(userCreatedAt: Date, now = new Date()): number {
  const remaining = trialEndsAt(userCreatedAt).getTime() - now.getTime();
  return remaining > 0 ? Math.ceil(remaining / DAY_MS) : 0;
}
