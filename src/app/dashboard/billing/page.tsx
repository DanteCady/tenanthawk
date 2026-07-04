import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { getSession } from "@/lib/session";
import { getPlan, isEnterprisePlan, isProPlan, type Plan } from "@/lib/entitlements";
import { getEnterpriseClientLimit } from "@/lib/billing/enterprise-limits";
import { ProUpgradeOptions } from "@/components/app/UpgradeButton";
import { EnterpriseUpgradeOptions } from "@/components/app/EnterpriseUpgradeButton";
import { ManageBillingButton } from "@/components/app/ManageBillingButton";
import { DevPlanToggle } from "@/components/app/DevPlanToggle";
import { PlanBadge } from "@/components/app/PlanBadge";
import {
  ENTERPRISE_PLAN_FEATURES,
  PRO_PLAN_FEATURES,
} from "@/lib/billing/plan-features";
import {
  ENTERPRISE_ANNUAL_USD,
  ENTERPRISE_MONTHLY_USD,
  getEnterpriseClientCap,
  isAnnualBillingConfigured,
  isEnterpriseAnnualBillingConfigured,
  isEnterpriseBillingConfigured,
  isStripeBillingConfigured,
  PRO_ANNUAL_USD,
  PRO_MONTHLY_USD,
} from "@/lib/billing/pricing";
import { formatUsd } from "@/lib/format";
import { PageHeader } from "@/components/app/PageHeader";

function billingSubtitle(plan: Plan) {
  if (isEnterprisePlan(plan)) {
    return "Enterprise Starter — flat monthly platform fee for MSPs and consultants.";
  }
  if (isProPlan(plan)) {
    return "Pro is for internal IT teams — billed per connected tenant.";
  }
  return "Choose Pro for your organization or Enterprise for MSPs and consultants.";
}

function FeatureList({
  features,
  iconClassName,
}: {
  features: readonly string[];
  iconClassName: string;
}) {
  return (
    <ul className="space-y-2">
      {features.map((feature) => (
        <li
          key={feature}
          className="flex items-start gap-2.5 text-sm text-[var(--th-text-muted)]"
        >
          <Check className={`mt-0.5 h-4 w-4 shrink-0 ${iconClassName}`} />
          {feature}
        </li>
      ))}
    </ul>
  );
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { upgrade } = await searchParams;
  const plan = await getPlan(session.user.id);
  const clientLimit = await getEnterpriseClientLimit(session.user.id, session.user.email);
  const clientCap = getEnterpriseClientCap();
  const showEnterprisePitch =
    upgrade === "enterprise" || (isProPlan(plan) && !isEnterprisePlan(plan));
  const proAnnualAvailable = isAnnualBillingConfigured();
  const enterpriseAnnualAvailable = isEnterpriseAnnualBillingConfigured();
  const enterpriseCheckoutAvailable = isEnterpriseBillingConfigured();
  const stripeConfigured = isStripeBillingConfigured();
  const devMode =
    process.env.NODE_ENV !== "production" && !process.env.STRIPE_SECRET_KEY;

  const enterpriseCard = showEnterprisePitch && !isEnterprisePlan(plan) && (
    <div className="surface-card flex h-full flex-col space-y-4 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--th-text)]">Enterprise</h2>
        <span className="badge-enterprise">MSPs &amp; consultants</span>
      </div>
      <p className="text-sm text-[var(--th-text-muted)]">
        Separate plan for MSPs and consultants — not Pro. Up to {clientCap} client tenants,
        portfolio roll-ups, and scorecards.
      </p>
      <FeatureList features={ENTERPRISE_PLAN_FEATURES} iconClassName="text-violet-500" />
      {enterpriseCheckoutAvailable ? (
        <div className="mt-auto pt-2">
          <EnterpriseUpgradeOptions
            annualAvailable={enterpriseAnnualAvailable}
            clientCap={clientCap}
          />
        </div>
      ) : (
        <p className="text-sm text-[var(--th-text-muted)]">
          Set{" "}
          <code className="rounded bg-[var(--th-muted-bg)] px-1">STRIPE_PRICE_ENTERPRISE</code>{" "}
          to enable checkout, or email{" "}
          <a
            href="mailto:support@tenanthawk.io?subject=Enterprise%20console"
            className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
          >
            support@tenanthawk.io
          </a>
          .
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description={billingSubtitle(plan)} />

      {plan === "free" ? (
        <div
          className={`grid gap-6 ${showEnterprisePitch ? "xl:grid-cols-2 xl:items-start" : ""}`}
        >
          <div className="surface-highlight flex h-full flex-col space-y-4 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[var(--th-text)]">Pro</h2>
              <span className="badge-pro">For IT teams</span>
            </div>
            <p className="text-sm text-[var(--th-text-muted)]">
              Full findings, remediation, and daily monitoring for a single organization.
            </p>
            <FeatureList features={PRO_PLAN_FEATURES} iconClassName="text-green-600" />
            <div className="mt-auto space-y-3 pt-2">
              <ProUpgradeOptions annualAvailable={proAnnualAvailable} />
              {!proAnnualAvailable && (
                <p className="text-xs text-[var(--th-text-faint)]">
                  Annual (${formatUsd(PRO_ANNUAL_USD)}/yr) when{" "}
                  <code className="rounded bg-[var(--th-muted-bg)] px-1">
                    STRIPE_PRICE_PRO_ANNUAL
                  </code>{" "}
                  is set.
                </p>
              )}
            </div>
          </div>
          {enterpriseCard}
        </div>
      ) : (
        <div className="surface-card space-y-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--th-text)]">Your plan</h2>
            <PlanBadge plan={plan} />
          </div>

          {isEnterprisePlan(plan) ? (
            <>
              <p className="text-[var(--th-text-muted)]">
                You&apos;re on{" "}
                <span className="font-semibold text-[var(--th-brand-text)]">Enterprise</span> —
                multi-tenant console, portfolio roll-ups, and client scorecards.
              </p>
              <p className="text-sm text-[var(--th-text-muted)]">
                {clientLimit.count} of {clientCap} client tenants connected
                {clientLimit.atCap ? " · at plan limit" : ""}.
              </p>
              <FeatureList
                features={ENTERPRISE_PLAN_FEATURES}
                iconClassName="text-violet-500"
              />
              {stripeConfigured ? (
                <>
                  <p className="text-sm text-[var(--th-text-faint)]">
                    Update payment method, switch billing interval, or cancel in Stripe.
                  </p>
                  <ManageBillingButton />
                </>
              ) : (
                <p className="text-sm text-[var(--th-text-faint)]">
                  Contact support for billing changes in this environment.
                </p>
              )}
              {clientLimit.atCap ? (
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Need more than {clientCap} clients?{" "}
                  <a
                    href="mailto:support@tenanthawk.io?subject=Enterprise%20volume%20pricing"
                    className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
                  >
                    Email support
                  </a>{" "}
                  for volume pricing.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-[var(--th-text-muted)]">
                You&apos;re on{" "}
                <span className="font-semibold text-[var(--th-brand-text)]">Pro</span> — full
                findings, remediation, and daily monitoring.
              </p>
              <p className="text-sm text-[var(--th-text-faint)]">
                Managing client tenants as an MSP? Enterprise is the right plan — see below.
              </p>
              <ManageBillingButton />
            </>
          )}
        </div>
      )}

      {plan === "free" && (
        <p className="text-center text-xs text-[var(--th-text-faint)]">
          Pro: ${PRO_MONTHLY_USD}/mo or ${formatUsd(PRO_ANNUAL_USD)}/yr per tenant · Enterprise
          Starter: ${ENTERPRISE_MONTHLY_USD}/mo or ${formatUsd(ENTERPRISE_ANNUAL_USD)}/yr (
          {clientCap} clients)
        </p>
      )}

      {devMode && <DevPlanToggle plan={plan} />}

      {plan !== "free" && enterpriseCard}
    </div>
  );
}
