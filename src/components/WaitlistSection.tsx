import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { HawkMark } from "./Logo";

export function WaitlistSection() {
  return (
    <section id="waitlist" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-blue-50 via-yellow-50 to-red-50 px-6 py-14 text-center sm:px-12">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-300/30 via-green-300/30 to-yellow-300/30 blur-3xl" />
            <HawkMark className="mx-auto h-14 w-14" />
            <h2 className="mt-6 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Stop wondering what&apos;s lurking in your tenant.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
              Run your first scan free. See your health score, your biggest
              risks, and your wasted spend in minutes — then decide if you want
              the full fix-it list.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/signup"
                className="group btn-primary px-7 py-3.5"
              >
                Run a free scan
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
              >
                Sign in
              </a>
            </div>
            <p className="mt-5 text-xs text-slate-500">
              Read-only access · no credentials stored · no credit card required
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
