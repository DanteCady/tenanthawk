import type { Category, Severity } from "@/db/types";

/** Brand palette aligned with PDF report styling. */
export const EXPORT_COLORS = {
  navy: "FF0F172A",
  blue: "FF2563EB",
  hawk: "FFF59E0B",
  slate: "FF475569",
  muted: "FF94A3B8",
  line: "FFE2E8F0",
  panel: "FFF8FAFC",
  white: "FFFFFFFF",
  green: "FF16A34A",
} as const;

export const SEVERITY_FILL: Record<Severity, string> = {
  high: "FFFEE2E2",
  medium: "FFFEF3C7",
  low: "FFF1F5F9",
};

export const SEVERITY_TEXT: Record<Severity, string> = {
  high: "FFB91C1C",
  medium: "FFB45309",
  low: "FF475569",
};

export const GRADE_TEXT: Record<string, string> = {
  A: "FF16A34A",
  B: "FF2563EB",
  C: "FFD97706",
  D: "FFEA580C",
  F: "FFDC2626",
};

export const CATEGORY_SHEET_NAMES: Record<Category, string> = {
  security: "Security",
  cost: "Cost",
  reliability: "Reliability",
  hygiene: "Hygiene",
};
