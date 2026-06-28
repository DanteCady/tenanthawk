import { KeyRound, ShieldAlert, Sparkles, Wallet, type LucideIcon } from "lucide-react";
import type { Category } from "@/db/types";

export const CATEGORY_META: Record<
  Category,
  { label: string; icon: LucideIcon; description: string; examples: string[] }
> = {
  security: {
    label: "Security",
    icon: ShieldAlert,
    description:
      "Identity and access risks in your Microsoft tenant — misconfigurations that could lead to breach or failed audit.",
    examples: [
      "Conditional Access gaps or risky policy exclusions",
      "MFA not enforced or legacy authentication enabled",
      "Too many Global Administrators or standing privileged roles",
      "Over-permissioned or unused app registrations",
    ],
  },
  cost: {
    label: "Cost",
    icon: Wallet,
    description:
      "License waste and recoverable spend — seats you're paying for but not using.",
    examples: [
      "Unused prepaid licenses across SKUs",
      "Licenses assigned to disabled or inactive users",
      "Oversized plans where a lower tier would suffice",
      "Duplicate or overlapping license assignments",
    ],
  },
  reliability: {
    label: "Reliability",
    icon: KeyRound,
    description:
      "Things that expire silently and break integrations, mail flow, or sign-in when ignored.",
    examples: [
      "App registration client secrets or certificates nearing expiry",
      "Expiring custom domains or DNS misconfiguration",
      "Mailboxes approaching storage limits",
      "Service health and integration dependencies",
    ],
  },
  hygiene: {
    label: "Hygiene",
    icon: Sparkles,
    description:
      "Directory clutter and stale configuration that makes the tenant harder to manage as it grows.",
    examples: [
      "Empty or orphaned groups and teams",
      "Inactive enabled user accounts",
      "Unmanaged or duplicate devices",
      "Overly permissive sharing defaults",
    ],
  },
};

export const CATEGORY_ORDER: Category[] = [
  "security",
  "cost",
  "reliability",
  "hygiene",
];

export const CATEGORY_CHIP: Record<Category, { chip: string; icon: string }> = {
  security: { chip: "bg-red-50", icon: "text-red-600" },
  cost: { chip: "bg-green-50", icon: "text-green-600" },
  reliability: { chip: "bg-blue-50", icon: "text-blue-600" },
  hygiene: { chip: "bg-yellow-50", icon: "text-yellow-700" },
};
