import Link from "next/link";
import {
  CalendarClock,
  FileClock,
  GitCompareArrows,
  ScanSearch,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JournalShowcase } from "@/components/JournalShowcase";
import { Reveal } from "@/components/Reveal";
import { faqPageSchema } from "@/lib/seo/schemas";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "The Journal — M365 change tracking with who / what / when diffs",
  description:
    "Who changed that Conditional Access policy? Tenant Hawk journals every Conditional Access, authentication, and Intune policy change with before/after diffs and the admin who made it - history that doesn't expire like Entra audit logs.",
  path: "/features/journal",
  keywords: [
    "who changed conditional access policy",
    "conditional access policy change log",
    "audit conditional access policy changes",
    "microsoft 365 change tracking",
    "m365 configuration drift",
    "intune audit logs",
    "entra audit log retention",
    "azure ad audit log retention",
    "export conditional access policies",
    "conditional access policy backup",
    "track changes in microsoft 365",
    "intune policy change history",
  ],
});

const FAQ = [
  {
    q: "How is the Journal different from the Entra audit log?",
    a: "Entra and Purview audit logs expire after 30–90 days on most licenses, live across multiple portals, and show raw JSON payloads without diffs. The Journal is one readable timeline that shows the exact field that changed, its before and after value, and who made the change - and it doesn't age out.",
  },
  {
    q: "What changes does the Journal track?",
    a: "Conditional Access policies, named locations, the authorization policy, the authentication methods policy, Intune compliance policies, and Intune configuration profiles. Coverage expands over time - each scan snapshots the current state and records any delta.",
  },
  {
    q: "How does Tenant Hawk know who made a change?",
    a: "Changes are matched against the Entra directory audit log and attributed to the signed-in admin or application that made them. Attribution requires the optional AuditLog.Read.All read permission; without it, changes are still recorded - just unattributed.",
  },
  {
    q: "Does this require write access to my tenant?",
    a: "No. Tenant Hawk is read-only end to end. The Journal is built from read-only Microsoft Graph snapshots - we never modify your tenant and never store credentials.",
  },
  {
    q: "How quickly do changes show up?",
    a: "The Journal captures on every scan. Pro tenants scan daily, so a change made this morning is journaled - with its diff and actor - by tomorrow at the latest, or immediately when you trigger a rescan.",
  },
  {
    q: "Can I roll back to a previous configuration?",
    a: "The Journal stores the complete before and after state of every object, so you always have the exact prior values to revert to. One-click restore for supported policy types is on the roadmap.",
  },
];

const steps = [
  {
    icon: ScanSearch,
    title: "Baseline on first scan",
    body: "Your tenant's Conditional Access, authentication, and Intune configuration is snapshotted read-only. No agents, no write access.",
  },
  {
    icon: GitCompareArrows,
    title: "Diff on every scan",
    body: "Each daily scan compares current state to the last snapshot. Any created, modified, or deleted policy becomes a journal entry with a field-level diff.",
  },
  {
    icon: UserRound,
    title: "Attributed automatically",
    body: "Entries are matched against the Entra audit log so each change carries the admin (or app) that made it.",
  },
];

const auditLogPains = [
  {
    icon: CalendarClock,
    title: "Audit logs expire",
    body: "30–90 days of retention on most licenses. The change that explains today's incident may already be gone.",
  },
  {
    icon: FileClock,
    title: "No diffs, no story",
    body: "Audit entries tell you a policy was updated - not which field, or what the value was before. You're left reconstructing history from memory.",
  },
  {
    icon: ShieldCheck,
    title: "The Journal keeps both",
    body: "Full before/after state for every change, forever, in one timeline. When sign-ins break on Thursday, you can see what changed on Tuesday.",
  },
];

export default function JournalFeaturePage() {
  return (
    <>
      <JsonLd data={faqPageSchema(FAQ)} />
      <div className="marketing-v2 min-h-screen">
        <Navbar />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-white pb-20 pt-28 sm:pt-32">
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <Reveal>
                  <p className="mk-eyebrow">
                    The Journal
                  </p>
                  <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-mk-ink sm:text-5xl">
                    “Who changed that Conditional Access policy?”
                  </h1>
                  <p className="mt-5 text-lg text-mk-soft">
                    Now there&apos;s an answer. Tenant Hawk journals every config change in
                    your Microsoft 365 tenant - the exact field, the before and after
                    value, and the admin who made it. Like a git history for your tenant.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <a
                      href="/signup"
                      className="mk-btn inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold shadow-none hover:shadow-md"
                    >
                      Start free scan
                    </a>
                    <Link
                      href="/#pricing"
                      className="inline-flex items-center justify-center rounded-xl border border-mk-line2 px-6 py-3 text-sm font-semibold text-mk-ink hover:border-mk-faint"
                    >
                      See pricing
                    </Link>
                  </div>
                  <p className="mt-4 text-xs text-mk-muted">
                    Read-only Graph access · 2-minute setup · Journal included in Pro
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <JournalShowcase />
                </Reveal>
              </div>
            </div>
          </section>

          {/* Why audit logs aren't enough */}
          <section className="bg-mk-panel py-20">
            <div className="mx-auto max-w-6xl px-6">
              <Reveal className="mx-auto max-w-2xl text-center">
                <h2 className="text-balance text-3xl font-bold tracking-tight text-mk-ink sm:text-4xl">
                  The audit log wasn&apos;t built for this
                </h2>
                <p className="mt-4 text-lg text-mk-soft">
                  Microsoft records changes - in raw JSON, across three portals, with
                  retention measured in weeks.
                </p>
              </Reveal>
              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {auditLogPains.map((item, i) => (
                  <Reveal key={item.title} delay={i * 0.08}>
                    <div className="h-full rounded-2xl border border-mk-line bg-white p-6 shadow-sm">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-mk-amber-wash text-mk-amber-deep">
                        <item.icon className="h-5 w-5" strokeWidth={1.9} />
                      </span>
                      <h3 className="mt-4 font-bold text-mk-ink">{item.title}</h3>
                      <p className="mt-2 text-sm text-mk-soft">{item.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="bg-white py-20">
            <div className="mx-auto max-w-6xl px-6">
              <Reveal className="mx-auto max-w-2xl text-center">
                <h2 className="text-balance text-3xl font-bold tracking-tight text-mk-ink sm:text-4xl">
                  How the Journal works
                </h2>
              </Reveal>
              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {steps.map((step, i) => (
                  <Reveal key={step.title} delay={i * 0.08}>
                    <div className="h-full rounded-2xl border border-mk-line bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-mk-amber-wash text-mk-amber-deep">
                          <step.icon className="h-5 w-5" strokeWidth={1.9} />
                        </span>
                        <span className="text-sm font-semibold text-mk-faint">
                          Step {i + 1}
                        </span>
                      </div>
                      <h3 className="mt-4 font-bold text-mk-ink">{step.title}</h3>
                      <p className="mt-2 text-sm text-mk-soft">{step.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal className="mx-auto mt-10 max-w-2xl text-center">
                <p className="text-sm text-mk-muted">
                  Tracks Conditional Access policies, named locations, authorization &
                  authentication methods policies, and Intune compliance & configuration
                  profiles.
                </p>
              </Reveal>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-mk-panel py-20">
            <div className="mx-auto max-w-3xl px-6">
              <Reveal className="text-center">
                <h2 className="text-balance text-3xl font-bold tracking-tight text-mk-ink sm:text-4xl">
                  Journal FAQ
                </h2>
              </Reveal>
              <div className="mt-10 space-y-4">
                {FAQ.map((item, i) => (
                  <Reveal key={item.q} delay={i * 0.05}>
                    <div className="rounded-2xl border border-mk-line bg-white p-6 shadow-sm">
                      <h3 className="font-semibold text-mk-ink">{item.q}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-mk-soft">{item.a}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white py-20">
            <div className="mx-auto max-w-3xl px-6 text-center">
              <Reveal>
                <h2 className="text-balance text-3xl font-bold tracking-tight text-mk-ink sm:text-4xl">
                  Your tenant is changing. Start the record.
                </h2>
                <p className="mt-4 text-lg text-mk-soft">
                  The Journal starts capturing from your very first scan - history you
                  can&apos;t backfill later.
                </p>
                <a
                  href="/signup"
                  className="mk-btn mt-8 inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-semibold shadow-none hover:shadow-md"
                >
                  Start free scan
                </a>
              </Reveal>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
