"use client";

import { Info } from "lucide-react";

export function InlineStatHint({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600"
      title={text}
      aria-label={text}
    >
      <Info className="h-3.5 w-3.5" />
    </button>
  );
}
