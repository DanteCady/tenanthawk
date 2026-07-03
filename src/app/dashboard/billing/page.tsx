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

function billingSubtitle(plan: Plan) {
  if (isEnterprisePlan(plan)) {
    return "Enterprise Starter - flat monthly platform fee for MSPs and consultants.";
  }
  if (isProPlan(plan)) {
    return "Pro is for internal IT teams - billed per connected tenant.";
  }
  return "Pro is for internal IT teams. MSPs and consultants use Enterprise.";
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Billing</h1>
        <p className="mt-1 text-sm text-slate-600">{billingSubtitle(plan)}</p>
      </div>

      <div className={`p-8 ${plan === "free" ? "surface-highlight" : "surface-card"}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Your plan</h2>
          <PlanBadge plan={plan} />
        </div>

        {isEnterprisePlan(plan) ? (
          <div className="mt-6 space-y-4">
            <p className="text-slate-700">
              You&apos;re on <span className="font-semibold text-violet-700">Enterprise</span> -
              the MSP and consultant plan with multi-tenant console, portfolio roll-ups, and
              client scorecards.
            </p>
            <p className="text-sm text-slate-600">
              {clientLimit.count} of {clientCap} client tenants connected
              {clientLimit.atCap ? " · at plan limit" : ""}.
            </p>
            <ul className="space-y-2">
              {ENTERPRISE_PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                  {feature}
                </li>
              ))}
            </ul>
            {stripeConfigured ? (
              <>
                <p className="text-sm text-slate-500">
                  Update payment method, switch billing interval, or cancel in the Stripe
                  portal.
                </p>
                <ManageBillingButton />
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Contact support for billing changes in this environment.
              </p>
            )}
            {clientLimit.atCap ? (
              <p className="text-sm text-amber-800">
                Need more than {clientCap} clients?{" "}
                <a
                  href="mailto:support@tenanthawk.io?subject=Enterprise%20volume%20pricing"
                  className="font-medium text-violet-700 hover:text-violet-800"
                >
                  Email support
                </a>{" "}
                for volume pricing.
              </p>
            ) : null}
          </div>
        ) : isProPlan(plan) ? (
          <div className="mt-6">
            <p className="text-slate-700">
              You&apos;re on <span className="font-semibold text-blue-700">Pro</span> -
              full findings, remediation, and daily monitoring for your organization.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Managing multiple <strong>client</strong> tenants as an MSP? Pro is not the right
              plan - see Enterprise below.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Switch between monthly and annual, update payment method, or cancel in the portal.
            </p>
            <div className="mt-5">
              <ManageBillingButton />
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <ul className="space-y-3">
              {PRO_PLAN_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  {f}
                </li>
              ))}
            </ul>
            <ProUpgradeOptions annualAvailable={proAnnualAvailable} />
            {!proAnnualAvailable && (
              <p className="text-xs text-slate-500">
                Annual billing (${formatUsd(PRO_ANNUAL_USD)}/yr) appears once{" "}
                <code className="rounded bg-slate-100 px-1">STRIPE_PRICE_PRO_ANNUAL</code>{" "}
                is configured - see SETUP.md.
              </p>
            )}
          </div>
        )}
      </div>

      {plan === "free" && (
        <p className="text-center text-xs text-slate-500">
          Pro: ${PRO_MONTHLY_USD}/mo or ${formatUsd(PRO_ANNUAL_USD)}/yr per tenant · Enterprise
          Starter: ${ENTERPRISE_MONTHLY_USD}/mo or ${formatUsd(ENTERPRISE_ANNUAL_USD)}/yr (
          {clientCap} clients)
        </p>
      )}

      {devMode && <DevPlanToggle plan={plan} />}

      {showEnterprisePitch && !isEnterprisePlan(plan) ? (
        <div className="surface-card space-y-4 p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Enterprise</h2>
            <span className="badge-enterprise">MSPs &amp; consultants</span>
          </div>
          <p className="text-sm text-slate-600">
            Enterprise is a separate plan for MSPs and consultants - not Pro. Includes up to{" "}
            {clientCap} client tenants, portfolio roll-ups, and scorecards.
          </p>
          <ul className="space-y-2">
            {ENTERPRISE_PLAN_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                {feature}
              </li>
            ))}
          </ul>
          {enterpriseCheckoutAvailable ? (
            <EnterpriseUpgradeOptions
              annualAvailable={enterpriseAnnualAvailable}
              clientCap={clientCap}
            />
          ) : (
            <p className="text-sm text-slate-600">
              Set{" "}
              <code className="rounded bg-slate-100 px-1">STRIPE_PRICE_ENTERPRISE</code> to
              enable self-serve checkout, or email{" "}
              <a
                href="mailto:support@tenanthawk.io?subject=Enterprise%20console"
                className="font-medium text-violet-700 hover:text-violet-800"
              >
                support@tenanthawk.io
              </a>{" "}
              for access.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
