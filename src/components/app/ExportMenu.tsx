"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, FileText, Loader2 } from "lucide-react";

export function ExportMenu({ isPro }: { isPro: boolean }) {
  const [loading, setLoading] = useState(false);

  async function downloadCsv() {
    setLoading(true);
    try {
      const res = await fetch("/api/export/csv");
      if (!res.ok) return;
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "tenanthawk-report.csv";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={downloadCsv}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export CSV
      </button>
      <Link
        href="/dashboard/report"
        target="_blank"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
      >
        <FileText className="h-4 w-4" />
        Print report
      </Link>
    </div>
  );
}
