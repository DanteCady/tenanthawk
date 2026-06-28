"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { SeverityBadge } from "@/components/app/SeverityBadge";
import {
  FRAMEWORK_LABELS,
  type ComplianceFramework,
  type CompliancePostureSummary,
} from "@/lib/compliance/posture";

function FrameworkBadge({ framework }: { framework: ComplianceFramework }) {
  return <span className="framework-badge">{framework === "cis" ? "CIS" : "NIST"}</span>;
}

export function CompliancePosture({
  posture,
  compact = false,
}: {
  posture: CompliancePostureSummary;
  compact?: boolean;
}) {
  const [framework, setFramework] = useState<ComplianceFramework>("cis");

  const allFailing = posture.controls.filter((c) => c.openFindings > 0);
  const failing = compact
    ? allFailing
    : allFailing.filter((c) => c.framework === framework);
  const visible = compact ? failing.slice(0, 5) : failing;
  const hiddenCount = compact ? Math.max(0, failing.length - visible.length) : 0;

  return (
    <div className="surface-card overflow-hidden">
      <div className="border-b border-[var(--th-border-subtle)] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--th-text)]">Compliance posture</h2>
            <p className="mt-0.5 text-xs text-[var(--th-text-faint)]">
              {FRAMEWORK_LABELS.cis} & {FRAMEWORK_LABELS.nist}. Informational, not a
              certification.
            </p>
          </div>
          {!compact && (
            <div className="framework-toggle">
              {(["cis", "nist"] as const).map((fw) => (
                <button
                  key={fw}
                  type="button"
                  onClick={() => setFramework(fw)}
                  className={`framework-toggle-btn ${
                    framework === fw ? "framework-toggle-btn-active" : ""
                  }`}
                >
                  {fw === "cis" ? "CIS" : "NIST"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="px-5 py-6 text-sm text-[var(--th-text-muted)]">
          {compact
            ? "No open findings map to tracked controls."
            : `No open findings map to ${FRAMEWORK_LABELS[framework]} controls. Nice work.`}
        </p>
      ) : (
        <ul className="divide-y divide-[var(--th-border-subtle)]">
          {visible.map((ctrl) => (
            <li key={`${ctrl.framework}-${ctrl.id}`} className="px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <FrameworkBadge framework={ctrl.framework} />
                <span className="text-sm font-medium text-[var(--th-text)]">
                  {ctrl.id}: {ctrl.title}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--th-text-faint)]">
                {ctrl.openFindings} open finding{ctrl.openFindings === 1 ? "" : "s"}
                {ctrl.highFindings > 0 ? ` · ${ctrl.highFindings} high` : ""}
              </p>
              {!compact && (
                <ul className="mt-3 space-y-2">
                  {ctrl.findings.map((f) => (
                    <li key={f.id} className="finding-row">
                      <SeverityBadge severity={f.severity} />
                      <span className="finding-row-title">{f.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {compact && hiddenCount > 0 && (
        <div className="border-t border-[var(--th-border-subtle)] px-5 py-3">
          <Link
            href="/dashboard/compliance"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--th-brand-text-soft)] hover:text-[var(--th-brand-text)]"
          >
            View all {failing.length} controls with findings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
