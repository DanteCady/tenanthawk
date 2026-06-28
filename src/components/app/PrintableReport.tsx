import { HawkMark } from "@/components/Logo";
import { CategoryIconChip, CategoryLabel } from "@/components/app/CategoryIconChip";
import { CategoryRadarChart } from "@/components/app/CategoryRadarChart";
import { ReportCustomerDetails } from "@/components/app/ReportCustomerDetails";
import { CATEGORY_META, CATEGORY_ORDER } from "@/components/app/categories";
import { SeverityBadge } from "@/components/app/SeverityBadge";
import type { Category, CategoryScores, Severity } from "@/db/types";
import { formatFindingImpact } from "@/lib/export/report-format";
import { formatLicenseEntityRef } from "@/lib/licenses/sku-display";
import type { ReportCustomer } from "@/lib/export/report-customer";
import { REPORT_FOOTER } from "@/lib/brand";
import { grade } from "@/lib/scan/score";
import type { ScanSummary } from "@/lib/summary";

export interface PrintableFinding {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  remediation: string;
  entity_ref: string | null;
  impact: {
    usd?: number;
    count?: number;
    entities?: string[];
  } | null;
}

const GRADE_RING: Record<string, string> = {
  A: "border-green-600",
  B: "border-blue-600",
  C: "border-amber-600",
  D: "border-orange-600",
  F: "border-red-600",
};

const GRADE_TEXT: Record<string, string> = {
  A: "text-green-600",
  B: "text-blue-600",
  C: "text-amber-600",
  D: "text-orange-600",
  F: "text-red-600",
};

function ReportScoreCircle({ score }: { score: number | null }) {
  const letter = score != null ? grade(score) : "—";
  const ring = GRADE_RING[letter] ?? GRADE_RING.F;
  const text = GRADE_TEXT[letter] ?? GRADE_TEXT.F;

  return (
    <div
      className={`flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-full border-2 bg-white ${ring}`}
    >
      <span className="text-2xl font-bold leading-none text-slate-900">
        {score ?? "—"}
      </span>
      <span className={`mt-0.5 text-[10px] font-bold leading-none ${text}`}>
        {letter}
      </span>
    </div>
  );
}

export function PrintableReport({
  customer,
  score,
  summary,
  findings,
}: {
  customer: ReportCustomer;
  score: number | null;
  summary: ScanSummary;
  findings: PrintableFinding[];
}) {
  const statsParts = [
    `${summary.total} open issue${summary.total === 1 ? "" : "s"}`,
    `${summary.high} high severity`,
  ];
  if (summary.usd > 0) {
    statsParts.push(`$${summary.usd.toLocaleString()}/mo recoverable`);
  }

  const categoryScores = Object.fromEntries(
    summary.categories.map((c) => [c.category, c.score]),
  ) as CategoryScores;

  return (
    <article className="light-surface overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
      {/* Branded header — div, not header, so dashboard print CSS does not hide it */}
      <div className="relative bg-slate-900 text-white print:break-inside-avoid">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-600" />
        <div className="flex items-center gap-3 px-6 py-5 sm:px-8">
          <HawkMark className="h-10 w-10 shrink-0" />
          <div>
            <p className="text-xl font-bold leading-tight">
              Tenant <span className="text-amber-400">Hawk</span>
            </p>
            <p className="mt-0.5 text-sm text-slate-300">Tenant Health Report</p>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-6 py-8 sm:px-8 print:space-y-6 print:px-0 print:py-6">
        <ReportCustomerDetails customer={customer} />

        {/* Score summary */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 print:break-inside-avoid">
          <div className="flex gap-5 sm:gap-6">
            <ReportScoreCircle score={score} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Health score
              </p>
              <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
                Overall tenant health
              </p>
              <p className="mt-2 text-sm text-slate-600">{statsParts.join(" · ")}</p>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Scores reflect open findings at scan time. Fewer and less severe issues raise
                your grade.
              </p>
            </div>
          </div>
        </section>

        {/* Category legend */}
        <section className="print:break-inside-avoid">
          <h2 className="text-sm font-bold text-slate-900">What the categories mean</h2>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {CATEGORY_ORDER.map((cat) => (
                <div key={cat} className="flex gap-2.5">
                  <CategoryIconChip category={cat} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900">{CATEGORY_META[cat].label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {CATEGORY_META[cat].description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Category grades + radar */}
        <section className="print:break-inside-avoid">
          <h2 className="text-sm font-bold text-slate-900">Category grades</h2>
          <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              {summary.categories.map((c, index) => (
                <div
                  key={c.category}
                  className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                    index > 0 ? "border-t border-slate-100" : ""
                  }`}
                >
                  <CategoryLabel category={c.category} />
                  <span className={`shrink-0 font-bold ${GRADE_TEXT[c.grade] ?? GRADE_TEXT.F}`}>
                    {c.score} ({c.grade})
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-4">
              <CategoryRadarChart scores={categoryScores} />
            </div>
          </div>
        </section>

        {/* Findings summary table */}
        <section>
          <h2 className="text-sm font-bold text-slate-900">Findings summary</h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-xs font-bold uppercase text-white">
                <tr>
                  <th className="px-3 py-2.5">Severity</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Finding</th>
                  <th className="px-3 py-2.5 text-right">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {findings.map((f, i) => (
                  <tr
                    key={f.id}
                    className={i % 2 === 1 ? "bg-slate-50/80" : "bg-white"}
                  >
                    <td className="px-3 py-2.5 align-top">
                      <SeverityBadge severity={f.severity} />
                    </td>
                    <td className="px-3 py-2.5 align-top text-slate-600">
                      <CategoryLabel category={f.category} />
                    </td>
                    <td className="px-3 py-2.5 align-top font-medium text-slate-900">
                      {f.title}
                    </td>
                    <td className="px-3 py-2.5 align-top text-right text-slate-600">
                      {formatFindingImpact({
                        impact: f.impact,
                        entityRef: f.entity_ref,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Remediation cards */}
        <section>
          <h2 className="text-sm font-bold text-slate-900">Remediation details</h2>
          <div className="mt-3 space-y-3">
            {findings.map((f) => {
              const affected =
                f.impact?.entities && f.impact.entities.length > 0
                  ? f.impact.entities.join(", ")
                  : f.entity_ref
                    ? formatLicenseEntityRef(f.entity_ref)
                    : null;

              return (
                <div
                  key={f.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 print:break-inside-avoid"
                >
                  <SeverityBadge severity={f.severity} />
                  <p className="mt-3 text-sm font-bold text-slate-900">{f.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {f.remediation || f.description}
                  </p>
                  {affected && (
                    <p className="mt-2 text-xs text-slate-500">Affected: {affected}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <footer className="border-t border-slate-200 pt-4 text-xs text-slate-400 print:break-inside-avoid">
          {REPORT_FOOTER}
        </footer>
      </div>
    </article>
  );
}
