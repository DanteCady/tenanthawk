"use client";

import { Lock, Terminal } from "lucide-react";
import {
  getScriptIndicatorKind,
  scriptIndicatorTooltip,
} from "@/lib/remediation/script-availability";
import { Tooltip } from "@/components/ui/Tooltip";

export function FindingScriptIndicator({
  checkId,
  isPro = true,
}: {
  checkId: string;
  isPro?: boolean;
}) {
  const kind = getScriptIndicatorKind(checkId);
  if (!kind) return null;

  const isExport = kind === "export";
  const showLock = isExport && !isPro;

  return (
    <Tooltip
      label={scriptIndicatorTooltip(kind, isPro)}
      placement="bottom"
      wrapClassName="shrink-0"
    >
      <span
        className={`inline-flex h-5 items-center gap-0.5 rounded-md px-1 ${
          isExport
            ? "bg-blue-50 text-blue-600"
            : "bg-slate-100 text-slate-500"
        }`}
        aria-label={scriptIndicatorTooltip(kind, isPro)}
      >
        <Terminal className="h-3 w-3" strokeWidth={2.25} />
        {showLock && <Lock className="h-2.5 w-2.5 opacity-70" aria-hidden />}
      </span>
    </Tooltip>
  );
}
