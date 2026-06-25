import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import {
  getPrimaryConnection,
  getLatestScan,
  getFindings,
} from "@/lib/queries";
import { summarize } from "@/lib/summary";
import { grade } from "@/lib/scan/score";
import { CATEGORY_META } from "@/components/app/categories";
import { GradeBadge } from "@/components/app/GradeBadge";
import { SeverityBadge } from "@/components/app/SeverityBadge";
import { PrintReportButton } from "@/components/app/PrintReportButton";

export default async function ReportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await isPro(session.user.id))) redirect("/dashboard/billing");

  const conn = await getPrimaryConnection(session.user.id);
  if (!conn) redirect("/onboarding");
  const scan = await getLatestScan(conn.id);
  if (!scan) redirect("/onboarding");

  const findings = await getFindings(scan.id);
  const summary = summarize(findings, scan.category_scores);
  const tenant =
    conn.tenant_domain ??
    conn.display_name ??
    (conn.mode === "demo" ? "Contoso (demo)" : "Microsoft 365");
  const scannedAt = new Date(scan.started_at).toLocaleString();

  return (
    <div className="mx-auto max-w-4xl space-y-8 bg-white px-6 py-8 text-slate-900 print:px-0 print:py-0">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to dashboard
        </Link>
        <PrintReportButton />
      </div>

      <header className="border-b border-slate-200 pb-6">
        <p className="text-sm font-medium text-blue-600">Tenant Hawk</p>
        <h1 className="mt-1 text-2xl font-bold">Tenant health report</h1>
        <p className="mt-2 text-sm text-slate-600">
          {tenant} · Scanned {scannedAt} · {conn.mode === "demo" ? "Demo" : "Live"}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div>
            <p className="text-3xl font-bold">{scan.score ?? "—"}</p>
            <p className="text-xs text-slate-500">Health score</p>
          </div>
          {scan.score != null && <GradeBadge letter={grade(scan.score)} size="lg" />}
          <div className="text-sm text-slate-600">
            <p>{summary.total} open issues</p>
            <p>{summary.high} high severity</p>
            {summary.usd > 0 && <p>${summary.usd.toLocaleString()}/mo recoverable</p>}
          </div>
        </div>
      </header>

      <section>
        <h2 className="text-lg font-semibold">Category grades</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summary.categories.map((c) => {
            const meta = CATEGORY_META[c.category];
            return (
              <div
                key={c.category}
                className="rounded-lg border border-slate-200 p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{meta.label}</span>
                  <GradeBadge letter={c.grade} size="sm" />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {c.count} issues · score {c.score}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Findings</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Finding</th>
                <th className="px-3 py-2">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {findings.map((f) => (
                <tr key={f.id} className="align-top">
                  <td className="px-3 py-2">
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td className="px-3 py-2 capitalize text-slate-600">{f.category}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900">{f.title}</p>
                    <p className="mt-1 text-xs text-slate-600">{f.description}</p>
                    {f.remediation && (
                      <p className="mt-2 text-xs text-slate-700">
                        <span className="font-medium">Fix:</span> {f.remediation}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {f.impact?.usd ? `$${f.impact.usd.toLocaleString()}/mo` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="border-t border-slate-200 pt-4 text-xs text-slate-500">
        Generated by Tenant Hawk · Read-only tenant scan · Not affiliated with Microsoft
      </footer>
    </div>
  );
}
