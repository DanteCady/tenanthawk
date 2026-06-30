"use client";

import { InlineStatHint } from "./InlineStatHint";
import { scoreMethodologyDetail, scoreMethodologyLine } from "@/lib/scan/catalog";

export function ScoreExplainer({
  className = "",
  variant = "inline",
}: {
  className?: string;
  variant?: "inline" | "block";
}) {
  const line = scoreMethodologyLine();
  const detail = scoreMethodologyDetail();

  if (variant === "block") {
    return (
      <p className={`text-xs leading-relaxed text-slate-500 ${className}`}>
        {line}
        <InlineStatHint text={detail} />
      </p>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs text-slate-500 ${className}`}>
      {line}
      <InlineStatHint text={detail} />
    </span>
  );
}
