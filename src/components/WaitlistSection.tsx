import { Reveal } from "./Reveal";

export function WaitlistSection() {
  return (
    <section id="waitlist" className="scroll-mt-16 border-t border-mk-line">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center sm:px-8 sm:py-30">
        <Reveal>
          <h2 className="mb-5 text-balance text-4xl font-[640] leading-[1.1] tracking-[-0.03em] sm:text-[46px]">
            Stop wondering what&apos;s lurking in your tenant.
          </h2>
          <p className="mx-auto mb-9 max-w-[540px] text-pretty text-[17px] leading-[1.6] text-mk-soft">
            Run your first scan free. See your health score, your biggest risks, and your
            wasted spend in minutes.
          </p>
          <div className="mb-[22px] flex flex-wrap justify-center gap-3.5">
            <a href="/signup" className="mk-btn px-7 py-3.5 text-base">
              Run a free scan <span aria-hidden>→</span>
            </a>
            <a href="/login" className="mk-btn-ghost px-7 py-3.5 text-base">
              Sign in
            </a>
          </div>
          <p className="text-[13.5px] text-mk-muted">
            Read-only access · no credentials stored · no credit card required
          </p>
        </Reveal>
      </div>
    </section>
  );
}
