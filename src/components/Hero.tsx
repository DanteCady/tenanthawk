"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Lock, ScanLine } from "lucide-react";

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
    <section className="relative overflow-hidden pt-32 pb-8 sm:pt-40 sm:pb-12">
      <div className="theme-aura pointer-events-none absolute inset-0 -z-10" />
      <div className="theme-grid pointer-events-none absolute inset-0 -z-10 h-[960px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
          >
            <ScanLine className="h-3.5 w-3.5 text-blue-500" />
            For M365 admins, IT consultants &amp; MSPs
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            M365 tenant health,{" "}
            <span className="text-gradient">without the detective work</span>
            .
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl"
          >
            Scan your tenant in minutes to uncover security gaps, licensing waste,
            configuration drift, and configuration issues. Get a health score,
            estimated savings, and prioritized fixes, all without making changes
            to your environment.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <a href="/signup" className="group btn-primary px-6 py-3.5">
              Run a free scan
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              See how it works
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500"
          >
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-500" />
              Read-only Graph access · no credentials stored
            </span>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" />
            <a
              href="#security"
              className="transition-colors hover:text-slate-700"
            >
              See how we protect your data
            </a>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" />
            <span>Connect in 2 minutes · no credit card</span>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-12 sm:mt-14 lg:mt-16"
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
