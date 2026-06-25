import { KeyRound, ShieldAlert, Sparkles, Wallet, type LucideIcon } from "lucide-react";
import type { Category } from "@/db/types";

export const CATEGORY_META: Record<Category, { label: string; icon: LucideIcon }> = {
  security: { label: "Security", icon: ShieldAlert },
  cost: { label: "Cost", icon: Wallet },
  reliability: { label: "Reliability", icon: KeyRound },
  hygiene: { label: "Hygiene", icon: Sparkles },
};

export const CATEGORY_ORDER: Category[] = [
  "security",
  "cost",
  "reliability",
  "hygiene",
];
