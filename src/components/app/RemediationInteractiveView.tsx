"use client";

import { useMemo, useState } from "react";
import { Terminal } from "lucide-react";
import type { RemediationAction, RemediationPlan } from "@/lib/remediation/plan/types";
import {
  buildWhatIfTerminalLines,
  type WhatIfTerminalLine,
} from "@/lib/remediation/plan/whatif-terminal";

function lineClassName(line: WhatIfTerminalLine): string {
  switch (line.kind) {
    case "prompt":
      return "text-emerald-400";
    case "comment":
      return "text-slate-500";
    case "whatif":
      return line.text.startsWith("# [skip]")
        ? "text-slate-600 line-through decoration-slate-600"
        : "text-sky-300";
    case "detail":
      return line.text.startsWith("# [skip]")
        ? "text-slate-600 pl-4 line-through decoration-slate-600"
        : "text-slate-400 pl-4";
    case "summary":
      return "text-amber-300 font-medium";
    default:
      return "";
  }
}

export function RemediationInteractiveView({
  plan,
  actions,
  included,
  onToggleIncluded,
}: {
  plan: RemediationPlan;
  actions: RemediationAction[];
  included: Record<string, boolean>;
  onToggleIncluded: (actionId: string, value: boolean) => void;
}) {
  const [open, setOpen] = useState(true);

  const lines = useMemo(
    () => buildWhatIfTerminalLines(plan, actions, included),
    [plan, actions, included],
  );

  const toggleableIds = useMemo(() => {
    const ids = new Set<string>();
    for (const line of lines) {
      if (line.actionId) ids.add(line.actionId);
    }
    return ids;
  }, [lines]);

  return (
    <div className="remediation-interactive">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="remediation-interactive-toggle"
        aria-expanded={open}
      >
        <Terminal className="h-3.5 w-3.5" />
        Interactive view
        <span className="text-[var(--th-text-faint)]">
          {open ? "Hide" : "Show"} -WhatIf plan
        </span>
      </button>

      {open && (
        <>
          <p className="remediation-interactive-note">
            Simulated -WhatIf output from your preview. Export the script to
            run the real check locally.
          </p>
          <div className="remediation-terminal" role="log" aria-live="polite">
            <div className="remediation-terminal-chrome">
              <span className="remediation-terminal-dot bg-red-500/80" />
              <span className="remediation-terminal-dot bg-amber-400/80" />
              <span className="remediation-terminal-dot bg-emerald-400/80" />
              <span className="remediation-terminal-title">WhatIf plan</span>
            </div>
            <pre className="remediation-terminal-body">
              {lines.map((line, i) => {
                if (line.kind === "blank") {
                  return <span key={`blank-${i}`} className="block h-3" />;
                }

                const canToggle = line.actionId && line.kind === "whatif";
                const actionId = line.actionId;
                const isIncluded =
                  actionId != null ? included[actionId] !== false : true;

                if (canToggle && actionId) {
                  return (
                    <button
                      key={`${actionId}-${i}`}
                      type="button"
                      onClick={() => onToggleIncluded(actionId, !isIncluded)}
                      className={`block w-full text-left font-mono text-xs leading-relaxed ${lineClassName(line)} hover:bg-white/5 rounded px-1 -mx-1`}
                      title={
                        isIncluded
                          ? "Click to exclude from export"
                          : "Click to include in export"
                      }
                    >
                      {line.text}
                    </button>
                  );
                }

                return (
                  <code
                    key={`line-${i}`}
                    className={`block font-mono text-xs leading-relaxed ${lineClassName(line)}`}
                  >
                    {line.text}
                  </code>
                );
              })}
            </pre>
          </div>
          {toggleableIds.size > 0 && (
            <p className="text-xs text-[var(--th-text-faint)]">
              Click a WhatIf line to include or exclude it from export.
            </p>
          )}
        </>
      )}
    </div>
  );
}
