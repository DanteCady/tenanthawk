"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Reveal } from "./Reveal";
import {
  E5_LICENSE_MONTHLY_USD_LIST,
  ENTERPRISE_ANNUAL_MONTHLY_EQUIV,
  ENTERPRISE_ANNUAL_SAVINGS_PERCENT,
  ENTERPRISE_ANNUAL_SAVINGS_USD,
  ENTERPRISE_ANNUAL_USD,
  ENTERPRISE_CLIENT_CAP_DEFAULT,
  ENTERPRISE_MONTHLY_USD,
  PRO_ANNUAL_MONTHLY_EQUIV,
  PRO_ANNUAL_SAVINGS_PERCENT,
  PRO_ANNUAL_SAVINGS_USD,
  PRO_ANNUAL_USD,
  PRO_MONTHLY_USD,
} from "@/lib/billing/pricing";
import { formatUsd } from "@/lib/format";

type Interval = "monthly" | "annual";

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
    roiLead: "Recover one unused E5 license and Pro has already paid for itself.",
    blurb: "Full visibility for internal IT teams — cost recovery, drift alerts, and executive-ready reports.",
    features: [
      "All four scan categories",
      "Config Journal - every change with who / what / when diffs",
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
    name: "Enterprise",
    roiLead: `One client portfolio often surfaces more reclaimable spend than $${ENTERPRISE_MONTHLY_USD}/mo.`,
    blurb: "Flat-rate MSP platform — roll up savings across every client tenant from one console.",
    features: [
      "Full platform on every client tenant",
      "Up to 10 client tenants (Starter)",
      "Multi-tenant console & roll-ups",
      "Branded subdomain + SSO",
      "Per-client scorecards",
      "Priority support",
    ],
    cta: "Get started",
    highlight: false,
    msp: true,
  },
] as const;

export function Pricing() {
  const [interval, setInterval] = useState<Interval>("monthly");
  const annual = interval === "annual";

  return (
    <section id="pricing" className="scroll-mt-24 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-yellow-600">
            Pricing
          </p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Think ROI, not subscription lines.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Tenant Hawk surfaces reclaimable Microsoft 365 spend on every scan. Most teams
            recover more in unused licenses than the platform costs.
          </p>
        </Reveal>

        <Reveal className="mx-auto mt-10 max-w-3xl">
          <div className="light-surface rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50 to-white px-6 py-6 text-center shadow-sm sm:px-8">
            <p className="text-balance text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
              If Tenant Hawk helps you recover one unused E5 license, it has already started
              paying for itself.
            </p>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              Pro is ${PRO_MONTHLY_USD}/tenant/mo. One E5 license is about $
              {E5_LICENSE_MONTHLY_USD_LIST}/mo at list. Typical scans surface far more than a
              single seat.
            </p>
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-8 max-w-2xl text-center">
          <p className="text-sm text-slate-500">
            Start free on one tenant. Pro is per internal tenant. Enterprise is flat-rate for
            MSPs (up to {ENTERPRISE_CLIENT_CAP_DEFAULT} clients on Starter). Founding customers:{" "}
            <span className="font-mono font-semibold text-amber-700">EARLYBIRD26</span> for 25%
            off Pro (first 20 customers).
          </p>
        </Reveal>

        <Reveal className="mx-auto mt-10 max-w-md">
          <div
            className="flex rounded-xl border border-slate-200 bg-slate-50 p-1"
            role="group"
            aria-label="Billing interval"
          >
            <button
              type="button"
              onClick={() => setInterval("monthly")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                interval === "monthly"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setInterval("annual")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                interval === "annual"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Annual
              <span className="ml-1.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[0.65rem] font-semibold text-green-800">
                Save {PRO_ANNUAL_SAVINGS_PERCENT}%
              </span>
            </button>
          </div>
        </Reveal>

        <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((t, i) => {
            const isPro = t.name === "Pro";
            const isEnterprise = t.name === "Enterprise";
            const price = isPro
              ? annual
                ? `$${formatUsd(PRO_ANNUAL_USD)}`
                : `$${PRO_MONTHLY_USD}`
              : isEnterprise
                ? annual
                  ? `$${formatUsd(ENTERPRISE_ANNUAL_USD)}`
                  : `$${ENTERPRISE_MONTHLY_USD}`
                : "price" in t
                  ? t.price
                  : "";
            const cadence = isPro
              ? annual
                ? "/ tenant / yr"
                : "/tenant / mo"
              : isEnterprise
                ? annual
                  ? `/yr · ${ENTERPRISE_CLIENT_CAP_DEFAULT} clients`
                  : `/mo · ${ENTERPRISE_CLIENT_CAP_DEFAULT} clients`
                : "cadence" in t
                  ? t.cadence
                  : "";
            const annualNote =
              isPro && !annual
                ? `$${formatUsd(PRO_ANNUAL_USD)}/yr (save ${PRO_ANNUAL_SAVINGS_PERCENT}%)`
                : isPro && annual
                  ? `$${PRO_ANNUAL_MONTHLY_EQUIV}/mo equivalent · save $${formatUsd(PRO_ANNUAL_SAVINGS_USD)}/yr`
                  : isEnterprise && !annual
                    ? `$${formatUsd(ENTERPRISE_ANNUAL_USD)}/yr (save ${ENTERPRISE_ANNUAL_SAVINGS_PERCENT}%)`
                    : isEnterprise && annual
                      ? `$${ENTERPRISE_ANNUAL_MONTHLY_EQUIV}/mo equivalent · save $${formatUsd(ENTERPRISE_ANNUAL_SAVINGS_USD)}/yr`
                      : null;

            return (
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
                  {"msp" in t && t.msp && (
                    <span className="mb-4 inline-flex w-fit rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      For MSPs
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-slate-900">{t.name}</h3>
                  {"roiLead" in t && t.roiLead && (
                    <p className="mt-3 text-base font-semibold leading-snug text-amber-900">
                      {t.roiLead}
                    </p>
                  )}
                  <div
                    className={`flex items-baseline gap-1.5 ${
                      "roiLead" in t && t.roiLead ? "mt-3" : "mt-2"
                    }`}
                  >
                    <span
                      className={`font-bold text-slate-900 ${
                        "roiLead" in t && t.roiLead ? "text-2xl" : "text-4xl"
                      }`}
                    >
                      {price}
                    </span>
                    <span className="text-sm text-slate-500">{cadence}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{t.blurb}</p>
                  {annualNote && (
                    <p className="mt-2 text-sm font-medium text-green-700">{annualNote}</p>
                  )}

                  <ul className="mt-6 flex-1 space-y-3">
                    {t.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm text-slate-700"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={"msp" in t && t.msp ? "/signup?type=msp" : "/signup"}
                    className={`mt-7 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                      t.highlight
                        ? "btn-primary w-full shadow-none hover:shadow-md"
                        : "msp" in t && t.msp
                          ? "w-full bg-slate-900 text-white hover:bg-slate-800"
                          : "border border-slate-300 text-slate-900 hover:border-slate-400"
                    }`}
                  >
                    {t.cta}
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
