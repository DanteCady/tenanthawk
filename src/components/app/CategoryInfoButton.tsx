"use client";

import { useEffect, useId, useState } from "react";
import { Info, X } from "lucide-react";
import type { Category } from "@/db/types";
import { CATEGORY_META } from "./categories";

export function CategoryInfoButton({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 ${className ?? ""}`}
        aria-label={`What is ${meta.label}?`}
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label="Close dialog"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 pr-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <Icon className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <h2 id={titleId} className="text-lg font-semibold text-slate-900">
                  {meta.label}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {meta.description}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                What we check for
              </p>
              <ul className="mt-2 space-y-1.5">
                {meta.examples.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm text-slate-700 before:mt-2 before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-slate-400 before:content-['']"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-slate-500">
              The letter grade reflects open findings in this category. Fewer and less
              severe issues raise your score.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
