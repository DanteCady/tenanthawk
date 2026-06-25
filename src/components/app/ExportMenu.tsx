"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, FileText, Loader2 } from "lucide-react";

export function ExportMenu({ isPro }: { isPro: boolean }) {
  const [loading, setLoading] = useState<"csv" | "pdf" | null>(null);

  async function download(path: "/api/export/csv" | "/api/export/pdf", kind: "csv" | "pdf") {
    setLoading(kind);
    try {
      const res = await fetch(path);
      if (!res.ok) return;
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const fallback = kind === "pdf" ? "tenanthawk-report.pdf" : "tenanthawk-report.csv";
      const filename = match?.[1] ?? fallback;
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
        onClick={() => download("/api/export/csv", "csv")}
        disabled={loading !== null}
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
        onClick={() => download("/api/export/pdf", "pdf")}
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
