import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

const pains = [
  {
    quote: "I'm pretty sure something's about to expire… I just don't know what.",
    color: "border-l-blue-500",
  },
  {
    quote:
      "We're definitely overpaying for licenses, but auditing them by hand is a nightmare.",
    color: "border-l-green-500",
  },
  {
    quote:
      "Someone changed a Conditional Access policy. Was it safe? No idea.",
    color: "border-l-red-500",
  },
  {
    quote:
      "This tenant's been through three admins. Nobody fully understands it anymore.",
    color: "border-l-yellow-500",
  },
  {
    quote: "Security questionnaires terrify me — I can't prove half of this.",
    color: "border-l-blue-500",
  },
  {
    quote: "I know we should clean it up. I just don't know where to start.",
    color: "border-l-green-500",
  },
];

export function ProblemSection() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
            Sound familiar?
          </p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            It&apos;s not that you don&apos;t care. There&apos;s just too much to see.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Every Microsoft 365 tenant accumulates years of quiet drift. The
            problem was never effort — it&apos;s visibility.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pains.map((p, i) => (
            <Reveal key={p.quote} delay={(i % 3) * 0.08}>
              <div
                className={`h-full rounded-2xl border border-slate-200 border-l-4 ${p.color} bg-white p-6 shadow-sm`}
              >
                <p className="text-[1.05rem] leading-relaxed text-slate-700">
                  &ldquo;{p.quote}&rdquo;
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-col items-center gap-4 surface-highlight px-8 py-10 text-center">
            <h3 className="text-balance text-2xl font-bold text-slate-900 sm:text-3xl">
              You don&apos;t need to know where to start.{" "}
              <span className="text-rainbow">Tenant Hawk does.</span>
            </h3>
            <p className="max-w-xl text-slate-600">
              One scan turns that vague dread into a clear, prioritized checklist
              — ranked by risk and dollar impact, with the exact fix for each.
            </p>
            <a
              href="/signup"
              className="group btn-primary mt-2"
            >
              Show me what&apos;s in my tenant
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
