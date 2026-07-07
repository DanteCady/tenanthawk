import "server-only";

const DEFAULT_DEMO_EMAILS = ["demo@tenanthawk.app", "msp@tenanthawk.app"];

function parseDemoPlanSwitchEmails(): Set<string> {
  const emails = new Set(DEFAULT_DEMO_EMAILS.map((e) => e.toLowerCase()));

  for (const raw of [
    process.env.SEED_EMAIL,
    process.env.SEED_MSP_EMAIL,
    process.env.DEMO_PLAN_SWITCH_EMAILS,
  ]) {
    if (!raw?.trim()) continue;
    for (const part of raw.split(",")) {
      const email = part.trim().toLowerCase();
      if (email) emails.add(email);
    }
  }

  return emails;
}

/** Demo / seed accounts that may override subscription tier without Stripe. */
export function canSwitchDemoPlan(email: string): boolean {
  return parseDemoPlanSwitchEmails().has(email.trim().toLowerCase());
}

/** Local dev without Stripe, or an allowlisted demo account (any environment). */
export function canSimulatePlan(email: string): boolean {
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev && !stripeConfigured) return true;
  return canSwitchDemoPlan(email);
}
