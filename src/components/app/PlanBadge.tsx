import type { Plan } from "@/lib/entitlements";

export function PlanBadge({ plan }: { plan: Plan }) {
  if (plan === "pro") {
    return (
      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
        Pro
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      Free
    </span>
  );
}
