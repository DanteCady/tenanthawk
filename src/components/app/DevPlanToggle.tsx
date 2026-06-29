"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FlaskConical, Loader2 } from "lucide-react";
import type { Plan } from "@/lib/entitlements";

const PLAN_CYCLE: Plan[] = ["free", "pro", "msp"];

function nextDevPlan(plan: Plan): Plan {
  const idx = PLAN_CYCLE.indexOf(plan);
  return PLAN_CYCLE[(idx + 1) % PLAN_CYCLE.length];
}

function devPlanLabel(plan: Plan): string {
  if (plan === "msp") return "Enterprise";
  if (plan === "pro") return "Pro";
  return "Free";
}

export function DevPlanToggle({ plan }: { plan: Plan }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const next = nextDevPlan(plan);

  async function toggle() {
    setLoading(true);
    await fetch("/api/dev/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: next }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
        <FlaskConical className="h-3.5 w-3.5" />
        Dev tools — simulate plan without Stripe
      </p>
      <button
        onClick={toggle}
        disabled={loading}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Switch to {devPlanLabel(next)}
      </button>
    </div>
  );
}
