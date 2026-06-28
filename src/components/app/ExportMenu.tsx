"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

type ExportKind = "csv" | "xlsx" | "pdf";

const EXPORT_PATHS: Record<ExportKind, `/api/export/${ExportKind}`> = {
  csv: "/api/export/csv",
  xlsx: "/api/export/xlsx",
  pdf: "/api/export/pdf",
};

const FALLBACK_NAMES: Record<ExportKind, string> = {
  csv: "tenanthawk-summary.csv",
  xlsx: "tenanthawk-report.xlsx",
  pdf: "tenanthawk-report.pdf",
};

export function ExportMenu({ isPro }: { isPro: boolean }) {
  const [loading, setLoading] = useState<ExportKind | null>(null);

  async function download(kind: ExportKind) {
    setLoading(kind);
    try {
      const res = await fetch(EXPORT_PATHS[kind]);
      if (!res.ok) return;
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? FALLBACK_NAMES[kind];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(null);
    }
  }

  if (!isPro) {
    return (
      <Link
        href="/dashboard/billing"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
      >
        <FileText className="h-4 w-4" />
        Export (Pro)
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => download("csv")}
        disabled={loading !== null}
        title="Executive summary CSV"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
      >
        {loading === "csv" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        CSV
      </button>
      <button
        type="button"
        onClick={() => download("xlsx")}
        disabled={loading !== null}
        title="Detailed workbook with category sheets"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
      >
        {loading === "xlsx" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        Excel
      </button>
      <button
        type="button"
        onClick={() => download("pdf")}
        disabled={loading !== null}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
      >
        {loading === "pdf" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        PDF
      </button>
      <Link
        href="/dashboard/report"
        target="_blank"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
      >
        <FileText className="h-4 w-4" />
        Print
      </Link>
    </div>
  );
}
