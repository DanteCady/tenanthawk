import Link from "next/link";
import { ArrowRight, Clock, GitCompareArrows, UserRound } from "lucide-react";
import { Reveal } from "./Reveal";
import { JournalShowcase } from "./JournalShowcase";

const points = [
  {
    icon: GitCompareArrows,
    title: "Before / after diffs",
    body: "Not just “something changed” - the exact field, the old value, and the new one.",
  },
  {
    icon: UserRound,
    title: "Who made the change",
    body: "Every entry is attributed from the Entra audit log, so “who touched this policy?” has an answer.",
  },
  {
    icon: Clock,
    title: "History that doesn't expire",
    body: "Entra audit logs age out in 30–90 days. Your Journal keeps the timeline for as long as you're a customer.",
  },
];

export function JournalSection() {
  return (
    <section id="journal" className="scroll-mt-24 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">
              The Journal · Pro
            </p>
            <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Every change in your tenant, recorded.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Someone disabled an MFA policy on Tuesday. Would you know? Tenant Hawk
              journals every Conditional Access, authentication, and Intune policy
              change - who, what, and when - with a diff you can actually read.
            </p>
            <ul className="mt-8 space-y-5">
              {points.map((p) => (
                <li key={p.title} className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <p.icon className="h-4.5 w-4.5" strokeWidth={1.9} />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{p.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/features/journal"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-700 hover:text-purple-800"
            >
              How the Journal works
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <JournalShowcase />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
