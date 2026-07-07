import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Building2,
  CalendarClock,
  FileOutput,
  LineChart,
  Shield,
  ShieldAlert,
  Sparkles,
  Wallet,
  Wand2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JournalSection } from "@/components/JournalSection";
import { Reveal } from "@/components/Reveal";
import { FeatureCta } from "@/components/features/shared";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Features — everything Tenant Hawk does for your M365 tenant",
  description:
    "Config change journal, free expiry monitoring, license waste recovery, security assessment, and an MSP portfolio console - every Tenant Hawk feature, one read-only scan.",
  path: "/features",
});

const featurePages = [
  {
    href: "/features/expiry-monitoring",
    icon: CalendarClock,
    title: "Expiry monitoring",
    tag: "Free",
    tagClass: "bg-blue-100 text-blue-700",
    chip: "bg-blue-50 text-blue-600",
    body: "App secrets, SSO certificates, and domains - warned before they expire, not after sign-ins break. Free on one tenant, forever.",
  },
  {
    href: "/features/license-waste",
    icon: Wallet,
    title: "License waste recovery",
    tag: "Pro",
    tagClass: "bg-green-100 text-green-700",
    chip: "bg-green-50 text-green-600",
    body: "Disabled users holding E5s, oversized SKUs, overlapping plans - your reclaimable spend, ranked in dollars against your contracted rates.",
  },
  {
    href: "/features/coverage",
    icon: Sparkles,
    title: "Scan coverage map",
    tag: "All plans",
    tagClass: "bg-purple-100 text-purple-700",
    chip: "bg-purple-50 text-purple-600",
    body: "Every automated check across Identity, Teams, SharePoint, Exchange, Devices, Apps, and Copilot — plus what's explicitly out of scope.",
  },
  {
    href: "/features/security-assessment",
    icon: ShieldAlert,
    title: "Security assessment",
    tag: "Free + Pro",
    tagClass: "bg-red-100 text-red-700",
    chip: "bg-red-50 text-red-600",
    body: "MFA gaps, Conditional Access drift, legacy auth, over-privileged apps - graded and prioritized in minutes, mapped to CIS/NIST.",
  },
  {
    href: "/msp",
    icon: Building2,
    title: "MSP portfolio console",
    tag: "Enterprise",
    tagClass: "bg-slate-200 text-slate-700",
    chip: "bg-slate-100 text-slate-600",
    body: "Every client tenant in one roll-up: needs-attention queue, per-client QBR scorecards, branded subdomain with SSO. Flat rate.",
  },
];

const tableStakes = [
  {
    icon: LineChart,
    title: "Health score & trends",
    body: "One A–F score across security, cost, reliability, and hygiene - tracked over time.",
  },
  {
    icon: BellRing,
    title: "Drift & instant alerts",
    body: "Email, Slack, Teams, or Discord when new high findings appear or scores move.",
  },
  {
    icon: Shield,
    title: "CIS / NIST mapping",
    body: "Every finding mapped to CIS Controls and NIST SP 800-53 for audit conversations.",
  },
  {
    icon: FileOutput,
    title: "Executive reports & exports",
    body: "Shareable read-only report links, plus CSV, XLSX, and PDF exports.",
  },
  {
    icon: Wand2,
    title: "Guided remediation",
    body: "Fix-it steps with Microsoft doc links and exportable scripts (PS 7, PS 5.1, Azure Runbook).",
  },
  {
    icon: Sparkles,
    title: "Daily scans, read-only",
    body: "App-only Graph consent, no agents, no stored credentials, revocable any time.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="marketing-page min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-white pb-16 pt-28 sm:pt-32">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                Features
              </p>
              <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                One read-only scan. Everything it unlocks.
              </h1>
              <p className="mt-5 text-lg text-slate-600">
                Tenant Hawk connects to your tenant once - read-only, two minutes - and
                turns that access into a health score, a change journal, recovered license
                spend, and reports you can put in front of anyone.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Flagship: the Journal */}
        <JournalSection />

        {/* Deep-dive feature cards */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Go deeper on each one
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {featurePages.map((f, i) => (
                <Reveal key={f.href} delay={(i % 2) * 0.08}>
                  <Link
                    href={f.href}
                    className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.chip}`}
                      >
                        <f.icon className="h-5 w-5" strokeWidth={1.9} />
                      </span>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${f.tagClass}`}
                        >
                          {f.tag}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 flex-1 text-sm text-slate-600">{f.body}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 group-hover:text-blue-800">
                      Learn more
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Table stakes */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                And the parts you&apos;d expect
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tableStakes.map((f, i) => (
                <Reveal key={f.title} delay={(i % 3) * 0.06}>
                  <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <f.icon className="h-5 w-5" strokeWidth={1.9} />
                    </span>
                    <h3 className="mt-4 font-bold text-slate-900">{f.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{f.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <FeatureCta
          title="See it against your own tenant."
          lede="Two minutes of read-only setup gets you a graded scan - and starts your Journal's history from day one."
        />
      </main>
      <Footer />
    </div>
  );
}
