import type { Plan } from "@/lib/entitlements";

export function PlanBadge({ plan }: { plan: Plan }) {
  if (plan === "msp") {
    return <span className="badge-enterprise">Enterprise</span>;
  }
  if (plan === "pro") {
    return <span className="badge-pro">Pro</span>;
  }
  if (plan === "trial") {
    return <span className="badge-pro">Trial</span>;
  }
  return <span className="badge-free">Free</span>;
}
