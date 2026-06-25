"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Logo } from "@/components/Logo";

const SCAN_STEPS = [
  "Authorizing read-only access…",
  "Enumerating Entra app registrations…",
  "Checking license assignments…",
  "Reviewing Conditional Access posture…",
  "Scoring tenant health…",
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

function Scanning() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => Math.min(v + 1, SCAN_STEPS.length - 1)), 700);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="surface-card w-full max-w-md p-8 text-center">
      <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
      <h2 className="mt-5 text-xl font-semibold text-slate-900">Scanning your tenant…</h2>
      <div className="mt-6 space-y-2.5 text-left">
        {SCAN_STEPS.map((s, idx) => (
          <div key={s} className="flex items-center gap-2.5 text-sm">
            {idx < i ? (
              <CheckCircle2 className="h-4 w-4 text-good" />
            ) : idx === i ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <span className="h-4 w-4 rounded-full border border-slate-300" />
            )}
            <span className={idx <= i ? "text-slate-900" : "text-slate-400"}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectCard({
  liveConfigured,
  onDemo,
  demoLoading,
}: {
  liveConfigured: boolean;
  onDemo: () => void;
  demoLoading: boolean;
}) {
  const reduceMotion = useReducedMotion();

  const liveCard = (
    <div
      className={`flex items-center gap-4 rounded-2xl border p-5 ${
        liveConfigured
          ? "surface-card"
          : "border-slate-200 bg-slate-50/80 opacity-75"
      }`}
      aria-disabled={!liveConfigured}
    >
      <div
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          liveConfigured ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
        }`}
      >
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">Connect Microsoft 365</p>
        <p className="text-sm text-slate-600">
          Sign in as a global admin and consent once to read-only access.
        </p>
        {!liveConfigured && (
          <p className="mt-1.5 text-xs text-slate-500">
            Live connect requires Entra app credentials in this environment.
          </p>
        )}
      </div>
      {liveConfigured && (
        <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {liveConfigured ? (
        <motion.a
          href="/api/connect/start"
          variants={fadeUp}
          className="group block transition-all hover:opacity-95"
          whileHover={reduceMotion ? {} : { y: -2 }}
        >
          {liveCard}
        </motion.a>
      ) : (
        <motion.div variants={fadeUp}>{liveCard}</motion.div>
      )}

      <motion.button
        type="button"
        onClick={onDemo}
        disabled={demoLoading}
        variants={fadeUp}
        whileHover={reduceMotion || demoLoading ? {} : { y: -2 }}
        className={`group relative flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all disabled:cursor-wait disabled:opacity-80 ${
          liveConfigured
            ? "surface-card hover:border-blue-300 hover:shadow-md"
            : "surface-highlight border-blue-200 hover:border-blue-300 hover:shadow-md"
        }`}
      >
        {!liveConfigured && (
          <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white shadow-sm">
            <Sparkles className="h-3 w-3" />
            Recommended
          </span>
        )}
        <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {demoLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <PlayCircle className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">Run a demo scan</p>
          <p className="text-sm text-slate-600">
            Explore the full product with realistic sample findings — no Microsoft
            sign-in required.
          </p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
      </motion.button>
    </div>
  );
}

export function ConnectStep({
  liveConfigured,
  error,
}: {
  liveConfigured: boolean;
  error?: string;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [scanning, setScanning] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  async function runDemo() {
    setDemoError(null);
    setScanning(true);
    const started = Date.now();
    try {
      const res = await fetch("/api/connect/demo", { method: "POST" });
      const elapsed = Date.now() - started;
      if (elapsed < 1800) await new Promise((r) => setTimeout(r, 1800 - elapsed));
      if (!res.ok) {
        setScanning(false);
        setDemoError("Demo scan failed. Check that the server and database are running.");
        return;
      }
      router.push("/onboarding");
      router.refresh();
    } catch {
      setScanning(false);
      setDemoError("Could not reach the server. Try again in a moment.");
    }
  }

  const bannerError = error ?? demoError;

  return (
    <main className="app-shell relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="light-aura pointer-events-none absolute inset-0 -z-10" />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Logo tone="light" />
      </motion.div>

      {scanning ? (
        <Scanning />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
          }}
          className="w-full max-w-xl"
        >
          <motion.div variants={fadeUp} className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Connect your tenant
            </h1>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Grant read-only access and we&apos;ll have your health score in
              about a minute.
            </p>
          </motion.div>

          {bannerError && (
            <motion.div
              variants={fadeUp}
              className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {bannerError}
            </motion.div>
          )}

          <div className="mt-8">
            <ConnectCard
              liveConfigured={liveConfigured}
              onDemo={runDemo}
              demoLoading={scanning}
            />
          </div>

          <motion.p
            variants={fadeUp}
            className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500"
          >
            <Lock className="h-3.5 w-3.5" />
            Read-only, app-only, least-privilege. We never store your credentials.
          </motion.p>
        </motion.div>
      )}
    </main>
  );
}
