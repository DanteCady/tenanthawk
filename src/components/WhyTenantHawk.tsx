import Link from "next/link";
import {
  ArrowRight,
  Check,
  Layers,
  Shield,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { CategoryIconChip } from "@/components/app/CategoryIconChip";
import { CATEGORY_META, CATEGORY_ORDER } from "@/components/app/categories";
import { WHY_FAQ } from "@/lib/seo/why-faq";

const MICROSOFT_GAPS = [
  {
    tool: "M365 Admin Center",
    does: "Users, licenses, billing",
    gap: "Shows SKUs and counts, not prioritized waste or recoverable $/mo",
  },
  {
    tool: "Entra Secure Score",
    does: "Identity security recommendations",
    gap: "Security-only. No license waste, expiring secrets, or hygiene in one view",
  },
  {
    tool: "Defender & Purview",
    does: "Deep security and compliance",
    gap: "Enterprise-grade scope and cost. Heavy for a 50-person shop with one IT admin",
  },
  {
    tool: "Service Health",
    does: "Microsoft outages",
    gap: "Reactive. Doesn\u2019t surface your misconfigs or quiet drift",
  },
];

const DIFFERENTIATORS = [
  {
    icon: Layers,
    chip: "bg-blue-50 text-blue-600",
    title: "One score, four pillars",
    body: "Security, cost, reliability, and hygiene in a single scan and dashboard, not four portals and four scores.",
  },
  {
    icon: Sparkles,
    chip: "bg-amber-50 text-amber-600",
    title: "Minutes to value",
    body: "Read-only connect, first scan in under five minutes. No agents, SIEM, or compliance project required.",
  },
  {
    icon: Wallet,
    chip: "bg-green-50 text-green-600",
    title: "Cost you can act on",
    body: "Unused seats, licenses on disabled users, and cryptic SKUs translated to plain English and estimated recoverable spend.",
  },
  {
    icon: Shield,
    chip: "bg-sky-50 text-sky-600",
    title: "Reliability before the outage",
    body: "Expiring app secrets, certificates, and domains, surfaced in one list before integrations break.",
  },
] as const;

const PRO_EXTRAS = [
  "Daily scans and drift alerts when things change",
  "AI-guided remediation with Microsoft doc links",
  "CIS / NIST compliance mapping",
  "Shareable executive report links",
  "PDF, Excel, and CSV exports with trends",
  "Contracted license rates for accurate savings",
];

export function WhyTenantHawk() {
  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="theme-aura pointer-events-none absolute inset-0 -z-10" />
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Why Tenant Hawk
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Microsoft gives you dashboards.{" "}
              <span className="text-rainbow">We give you a checklist.</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Tenant Hawk is the independent health layer for Microsoft 365: one
              read-only scan that turns years of tenant drift into a single score, a
              prioritized fix list, and recoverable spend.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              The problem isn&apos;t missing data
            </h2>
            <p className="mt-3 text-slate-600">
              Microsoft&apos;s tooling is powerful, but fragmented. Every admin knows
              the feeling: something is wrong somewhere, but which portal do you open
              first?
            </p>
          </Reveal>

          <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 font-semibold text-slate-900">
                      Microsoft tool
                    </th>
                    <th className="px-5 py-3 font-semibold text-slate-900">
                      What it does
                    </th>
                    <th className="px-5 py-3 font-semibold text-slate-900">
                      The gap
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MICROSOFT_GAPS.map((row) => (
                    <tr key={row.tool}>
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {row.tool}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{row.does}</td>
                      <td className="px-5 py-4 text-slate-600">{row.gap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              What Tenant Hawk adds
            </h2>
            <p className="mt-3 text-slate-600">
              One read-only connection. One health score. A fix-it list ranked by risk
              and dollar impact.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {DIFFERENTIATORS.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.chip}`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Four categories, one scan
            </h2>
            <p className="mt-3 text-slate-600">
              Every finding is graded and grouped so you know where to start.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_ORDER.map((cat, i) => {
              const meta = CATEGORY_META[cat];
              return (
                <Reveal key={cat} delay={i * 0.05}>
                  <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <CategoryIconChip category={cat} size="md" />
                    <h3 className="mt-3 font-bold text-slate-900">{meta.label}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {meta.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <Reveal>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Pro: watch the tenant, don&apos;t just audit it once
              </h2>
              <p className="mt-3 text-slate-600">
                Free gets you the score and a taste of what&apos;s wrong. Pro is for
                teams that need ongoing visibility: drift alerts, exports, and
                leadership-ready reports.
              </p>
              <ul className="mt-6 space-y-3">
                {PRO_EXTRAS.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-slate-700"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Built for
                </p>
                <ul className="mt-4 space-y-4">
                  <li>
                    <p className="font-semibold text-slate-900">
                      Solo &amp; small IT teams
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      20–500 users who inherited a messy tenant and need a starting
                      point, not another enterprise suite.
                    </p>
                  </li>
                  <li>
                    <p className="font-semibold text-slate-900">MSPs &amp; consultants</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Quick tenant assessment before onboarding. Multi-tenant console
                      coming soon.
                    </p>
                  </li>
                  <li>
                    <p className="font-semibold text-slate-900">Owners &amp; CFOs</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Plain-language answers: are we exposed, and are we wasting money?
                    </p>
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Common questions
            </h2>
          </Reveal>

          <dl className="mt-10 space-y-6">
            {WHY_FAQ.map((item, i) => (
              <Reveal key={item.q} delay={i * 0.05}>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <dt className="font-semibold text-slate-900">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.a}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="surface-highlight px-8 py-10 text-center">
              <div className="mx-auto flex max-w-sm items-center justify-center gap-6 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-green-600" />
                  Read-only
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <X className="h-4 w-4 text-slate-400" />
                  Not a Microsoft replacement
                </span>
              </div>
              <h2 className="mt-6 text-balance text-2xl font-bold text-slate-900 sm:text-3xl">
                See what&apos;s hiding in your tenant
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-slate-600">
                Connect read-only in two minutes. Get one score and a prioritized list
                before lunch.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/signup" className="group btn-primary">
                  Run a free scan
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/#pricing"
                  className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400"
                >
                  View pricing
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
