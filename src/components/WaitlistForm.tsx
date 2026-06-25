"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useWaitlist } from "@/store/waitlist";

const segments = [
  "Internal IT team",
  "Managed service provider (MSP)",
  "IT consultant / freelancer",
  "Security / compliance",
  "Other",
];

export function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [segment, setSegment] = useState("");
  const { status, message, position, join } = useWaitlist();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    join(email, segment || undefined);
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-7 text-center"
      >
        <CheckCircle2 className="h-9 w-9 text-green-600" strokeWidth={1.75} />
        <p className="text-lg font-semibold text-slate-900">{message}</p>
        {position && (
          <p className="text-sm text-slate-600">
            You&apos;re{" "}
            <span className="font-semibold text-green-700">#{position}</span> in
            line. We&apos;ll email{" "}
            <span className="font-medium text-slate-900">{email}</span> when your
            tenant&apos;s spot opens.
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          aria-label="Work email address"
          className="w-full flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-hawk-500 focus:ring-2 focus:ring-hawk-500/25"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="group btn-primary w-full sm:w-auto shadow-none hover:shadow-md"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining…
            </>
          ) : (
            <>
              Request early access
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>

      {!compact && (
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          aria-label="What describes you best?"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-600 outline-none transition-colors focus:border-hawk-500 focus:ring-2 focus:ring-hawk-500/25"
        >
          <option value="">What describes you best? (optional)</option>
          {segments.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      <AnimatePresence>
        {status === "error" && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-sm text-red-600"
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      <p className="mt-3 text-xs text-slate-500">
        Read-only access · no credentials stored · we&apos;ll only email you about the beta.
      </p>
    </form>
  );
}
