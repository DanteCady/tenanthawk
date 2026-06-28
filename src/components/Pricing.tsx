import { Check } from "lucide-react";
import { Reveal } from "./Reveal";
import {
  PRO_ANNUAL_SAVINGS_PERCENT,
  PRO_ANNUAL_USD,
  PRO_MONTHLY_USD,
} from "@/lib/billing/pricing";
import { formatUsd } from "@/lib/format";

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "For a single tenant. The perfect way to see your score.",
    features: [
      "1 tenant",
      "Reliability scan (expiring secrets & certs)",
      "Weekly health score",
      "Email alerts",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: `$${PRO_MONTHLY_USD}`,
    cadence: "/tenant / mo",
    annualNote: `$${formatUsd(PRO_ANNUAL_USD)}/yr (save ${PRO_ANNUAL_SAVINGS_PERCENT}%)`,
    blurb: "The full hawk-eye view for internal IT teams.",
    features: [
      "All four scan categories",
      "Daily scans + drift alerts",
      "Cost-savings reporting",
      "Category trends & CIS / NIST mapping",
      "Shareable executive report links",
      "AI fix-it guides & exports",
    ],
    cta: "Start free scan",
    highlight: true,
  },
  {
    name: "MSP",
    price: "Custom",
    cadence: "volume pricing",
    blurb: "Manage every client tenant from one console.",
    features: [
      "Unlimited tenants",
      "Multi-tenant console & roll-ups",
      "White-label reports",
      "Per-client scorecards",
      "Priority support",
    ],
    cta: "Coming soon",
    highlight: false,
    comingSoon: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-yellow-600">
            Pricing
          </p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Start free. Scale per tenant.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Founding customers lock early pricing for life. Plans below are
            indicative for launch.
          </p>
        </Reveal>

        <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08} className="h-full">
              <div
                className={`flex h-full flex-col rounded-3xl border p-7 ${
                  t.highlight
                    ? "surface-highlight ring-1 ring-blue-200/80"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                {t.highlight && (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                {"comingSoon" in t && t.comingSoon && (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Coming soon
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-900">
                  {t.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold text-slate-900">
                    {t.price}
                  </span>
                  <span className="text-slate-500">
                    {t.cadence}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {t.blurb}
                </p>
                {"annualNote" in t && t.annualNote && (
                  <p className="mt-2 text-sm font-medium text-green-700">{t.annualNote}</p>
                )}

                <ul className="mt-6 flex-1 space-y-3">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-slate-700"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-green-600"
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                {"comingSoon" in t && t.comingSoon ? (
                  <span
                    aria-disabled="true"
                    className="mt-7 inline-flex cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-400"
                  >
                    {t.cta}
                  </span>
                ) : (
                  <a
                    href="/signup"
                    className={`mt-7 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                      t.highlight
                        ? "btn-primary w-full shadow-none hover:shadow-md"
                        : "border border-slate-300 text-slate-900 hover:border-slate-400"
                    }`}
                  >
                    {t.cta}
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
