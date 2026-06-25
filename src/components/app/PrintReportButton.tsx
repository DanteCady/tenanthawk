"use client";

export function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-primary text-sm shadow-none"
    >
      Print / Save as PDF
    </button>
  );
}
