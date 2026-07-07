"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FlaskConical, Loader2 } from "lucide-react";
import type { Plan } from "@/lib/entitlements";

const PLANS: { id: Plan; label: string }[] = [
  { id: "free", label: "Free" },
  { id: "pro", label: "Pro" },
  { id: "msp", label: "Enterprise" },
];

export function DevPlanToggle({ plan }: { plan: Plan }) {
  const router = useRouter();
  const [loading, setLoading] = useState<Plan | null>(null);

  async function switchPlan(next: Plan) {
    if (next === plan || loading) return;
    setLoading(next);
    await fetch("/api/dev/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: next }),
    });
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900/40">
      <p className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
        <FlaskConical className="h-3.5 w-3.5" />
        Demo tools — switch subscription tier without Stripe
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {PLANS.map(({ id, label }) => {
          const active = plan === id;
          const busy = loading === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => switchPlan(id)}
              disabled={Boolean(loading)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-60 ${
                active
                  ? "border-blue-400 bg-blue-50 font-medium text-blue-800 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-200"
                  : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500"
              }`}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
