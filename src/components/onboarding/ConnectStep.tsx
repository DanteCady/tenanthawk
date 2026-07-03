"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  LogIn,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { ThemeLogo } from "@/components/theme/ThemeLogo";
import { MicrosoftSetupGuide } from "@/components/onboarding/MicrosoftSetupGuide";

const SCAN_STEPS = [
  "Authorizing read-only access…",
  "Enumerating Entra app registrations…",
  "Checking license assignments…",
  "Reviewing Conditional Access posture…",
  "Scoring tenant health…",
];

const LIVE_STEPS = [
  {
    icon: ShieldCheck,
    title: "Click Connect Microsoft 365",
    body: "We send you to Microsoft’s secure consent screen.",
  },
  {
    icon: LogIn,
    title: "Sign in as a Global Administrator",
    body: "Use your work account - the person who can approve org-wide access.",
  },
  {
    icon: CheckCircle2,
    title: "Accept read-only permissions once",
    body: "Tenant Hawk scans your tenant. We never store passwords or tokens.",
  },
] as const;

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

function LiveConnectSteps() {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        What happens next
      </p>
      <ol className="mt-3 space-y-3">
        {LIVE_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-medium text-slate-900">
                  {i + 1}. {step.title}
                </p>
                <p className="text-xs text-slate-600">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </motion.div>
  );
}

function ConnectOptions({
  liveConfigured,
  onDemo,
  demoLoading,
  connectStartHref = "/api/connect/start",
}: {
  liveConfigured: boolean;
  onDemo: () => void;
  demoLoading: boolean;
  connectStartHref?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-4">
      {liveConfigured && (
        <motion.a
          href={connectStartHref}
          variants={fadeUp}
          className="group relative block transition-all hover:opacity-95"
          whileHover={reduceMotion ? {} : { y: -2 }}
        >
          <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white shadow-sm">
            <Sparkles className="h-3 w-3" />
            Recommended
          </span>
          <div className="surface-highlight flex items-center gap-4 rounded-2xl border border-blue-200 p-5 transition-all group-hover:border-blue-300 group-hover:shadow-md">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">Connect Microsoft 365</p>
              <p className="text-sm text-slate-600">
                Sign in with Microsoft as a Global Administrator and approve
                one-time read-only access. No app install required.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
          </div>
        </motion.a>
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
            Try it now
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
            {liveConfigured
              ? "Preview sample findings first - no Microsoft sign-in required."
              : "Explore the full product with realistic sample findings - no Microsoft sign-in required."}
          </p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
      </motion.button>
    </div>
  );
}

export function ConnectStep({
  liveConfigured,
  showDevSetup,
  error,
  addClientMode = false,
}: {
  liveConfigured: boolean;
  showDevSetup: boolean;
  error?: string;
  addClientMode?: boolean;
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
      if (res.status === 429) {
        setScanning(false);
        const data = (await res.json()) as { error?: string };
        setDemoError(data.error ?? "Too many demo scans. Try again later.");
        return;
      }
      if (!res.ok) {
        setScanning(false);
        setDemoError("Demo scan failed. Check that the server and database are running.");
        return;
      }
      router.push(addClientMode ? "/dashboard/clients" : "/onboarding");
      router.refresh();
    } catch {
      setScanning(false);
      setDemoError("Could not reach the server. Try again in a moment.");
    }
  }

  const bannerError = error ?? demoError;

  return (
    <main className="app-shell relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="theme-aura pointer-events-none absolute inset-0 -z-10" />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <ThemeLogo />
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
              {addClientMode ? "Add a client tenant" : "Connect your tenant"}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              {addClientMode
                ? "Connect another Microsoft 365 tenant to your portfolio. Each client stays scoped separately."
                : liveConfigured
                  ? "Sign in with Microsoft to grant read-only access - your health score in about a minute."
                  : "Try a demo scan now, or connect your real tenant once Microsoft sign-in is enabled."}
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
            <ConnectOptions
              liveConfigured={liveConfigured}
              onDemo={runDemo}
              demoLoading={scanning}
              connectStartHref={
                addClientMode ? "/api/connect/start?return=clients" : "/api/connect/start"
              }
            />
          </div>

          {liveConfigured && <LiveConnectSteps />}

          {showDevSetup && <MicrosoftSetupGuide />}

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
