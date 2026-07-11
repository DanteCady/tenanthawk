import { Reveal } from "./Reveal";

const pains = [
  { n: "01", quote: "I'm pretty sure something's about to expire… I just don't know what." },
  { n: "02", quote: "The offboarding ticket closed three weeks ago. The E5 is still assigned." },
  { n: "03", quote: "Someone changed a Conditional Access policy. Was it safe? No idea." },
  { n: "04", quote: "This tenant's been through three admins. Nobody fully understands it anymore." },
  { n: "05", quote: "An app secret expired on a Saturday and took SSO down with it." },
];

export function ProblemSection() {
  return (
    <section id="why" className="scroll-mt-16 border-t border-mk-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:px-8 sm:py-26 lg:grid-cols-[5fr_6fr] lg:gap-18">
        <Reveal>
          <p className="mk-eyebrow mb-5">Sound familiar?</p>
          <h2 className="mb-5 text-balance text-3xl font-[640] leading-[1.12] tracking-[-0.03em] sm:text-[40px]">
            It&apos;s not that you don&apos;t care. There&apos;s just too much to see.
          </h2>
          <p className="mb-7 text-pretty text-[16.5px] leading-[1.6] text-mk-soft">
            Every Microsoft 365 tenant accumulates years of quiet drift. The problem was
            never effort — it&apos;s visibility. One scan turns vague dread into a checklist
            ranked by risk and dollar impact.
          </p>
          <a
            href="/signup"
            className="border-b-[1.5px] border-mk-amber pb-0.5 text-[15.5px] font-[550] text-mk-ink transition-colors hover:text-[#b36a00]"
          >
            Show me what&apos;s in my tenant →
          </a>
        </Reveal>

        <div className="flex flex-col">
          {pains.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.06}>
              <div className="flex gap-[18px] border-b border-mk-linesoft py-[18px]">
                <span className="pt-[3px] font-mkmono text-xs text-mk-faint">{p.n}</span>
                <span className="text-[16.5px] italic leading-normal text-mk-ink2">
                  &ldquo;{p.quote}&rdquo;
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
