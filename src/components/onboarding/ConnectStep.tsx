"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  PlayCircle,
  ShieldCheck,
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

export function ConnectStep({
  liveConfigured,
  error,
}: {
  liveConfigured: boolean;
  error?: string;
}) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);

  async function runDemo() {
    setScanning(true);
    const started = Date.now();
    const res = await fetch("/api/connect/demo", { method: "POST" });
    const elapsed = Date.now() - started;
    if (elapsed < 1800) await new Promise((r) => setTimeout(r, 1800 - elapsed));
    if (!res.ok) {
      setScanning(false);
      return;
    }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <main className="app-shell relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="light-aura pointer-events-none absolute inset-0 -z-10" />
      <div className="mb-8">
        <Logo tone="light" />
      </div>

      {scanning ? (
        <Scanning />
      ) : (
        <div className="w-full max-w-xl">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Connect your tenant
            </h1>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Grant read-only access and we&apos;ll have your health score in
              about a minute.
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <TriangleAlert className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="mt-8 space-y-4">
            <a
              href={liveConfigured ? "/api/connect/start" : undefined}
              aria-disabled={!liveConfigured}
              className={`group flex items-center gap-4 rounded-2xl border p-5 transition-all ${
                liveConfigured
                  ? "surface-card hover:border-blue-300 hover:shadow-md"
                  : "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
              }`}
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Connect Microsoft 365</p>
                <p className="text-sm text-slate-600">
                  Sign in as a global admin and consent once to read-only access.
                  {!liveConfigured && " (Not configured in this environment yet.)"}
                </p>
              </div>
              {liveConfigured && (
                <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              )}
            </a>

            <button
              onClick={runDemo}
              className="group surface-card flex w-full items-center gap-4 p-5 text-left transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-blue-600">
                <PlayCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Run a demo scan</p>
                <p className="text-sm text-slate-600">
                  Explore the full product with realistic sample findings — no
                  Microsoft sign-in required.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500"
          >
            <Lock className="h-3.5 w-3.5" />
            Read-only, app-only, least-privilege. We never store your credentials.
          </motion.p>
        </div>
      )}
    </main>
  );
}
