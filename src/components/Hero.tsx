"use client";

import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Hero({ dashboardPreview }: { dashboardPreview: React.ReactNode }) {
  return (
    <section className="pt-28 sm:pt-36">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <motion.div
          className="max-w-3xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={item}
            className="mk-eyebrow mb-7 inline-flex items-center gap-2 rounded-full border border-mk-amber-line bg-mk-amber-wash px-3 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-mk-amber" />
            For M365 admins, consultants &amp; MSPs
          </motion.div>

          <motion.h1
            variants={item}
            className="mb-6 text-balance text-4xl font-[640] leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-[62px]"
          >
            M365 tenant health, without the detective work.
          </motion.h1>

          <motion.p
            variants={item}
            className="mb-9 max-w-[620px] text-pretty text-lg leading-[1.55] text-mk-soft sm:text-[19px]"
          >
            One read-only scan. One health score. Dollar impact on every finding,
            and a prioritized fix list — without a single change to your
            environment.
          </motion.p>

          <motion.div variants={item} className="mb-5 flex flex-wrap items-center gap-3.5">
            <a href="/signup" className="mk-btn px-6 py-3.5 text-base">
              Run a free scan <span aria-hidden>→</span>
            </a>
            <a href="#how" className="mk-btn-ghost px-6 py-3.5 text-base">
              See how it works
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-2.5 text-[13.5px] text-mk-muted"
          >
            <a href="/security" className="transition-colors hover:text-mk-ink">
              Read-only Graph access
            </a>
            <span className="text-mk-faint">·</span>
            <span>No credentials stored</span>
            <span className="text-mk-faint">·</span>
            <span>No credit card</span>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-14 sm:mt-16"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut", delay: 0.22 }}
        >
          {dashboardPreview}
        </motion.div>
      </div>
    </section>
  );
}
