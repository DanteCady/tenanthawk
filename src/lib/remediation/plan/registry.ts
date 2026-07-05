import { disabledUserLicensesHandler } from "./handlers/disabled-user-licenses";
import { emptyGroupsHandler } from "./handlers/empty-groups";
import { unusedLicensesHandler } from "./handlers/unused-licenses";
import type { PlanHandler } from "./types";

const HANDLERS: PlanHandler[] = [
  disabledUserLicensesHandler,
  emptyGroupsHandler,
  unusedLicensesHandler,
];

export const PLAN_HANDLERS = new Map<string, PlanHandler>(
  HANDLERS.map((h) => [h.checkId, h]),
);

export const SUPPORTED_PREVIEW_CHECKS = new Set(PLAN_HANDLERS.keys());

export function getPlanHandler(checkId: string): PlanHandler | undefined {
  return PLAN_HANDLERS.get(checkId);
}
