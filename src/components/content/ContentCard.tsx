import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  CONTENT_CATEGORY_CHIP,
  CONTENT_CATEGORY_LABEL,
} from "@/lib/content/categories";
import type { ContentMeta } from "@/lib/content/types";

export function ContentCard({ meta }: { meta: ContentMeta }) {
  const chip = CONTENT_CATEGORY_CHIP[meta.category];

  return (
    <Link
      href={`/learn/guides/${meta.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60"
    >
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip.chip} ${chip.text}`}
        >
          {CONTENT_CATEGORY_LABEL[meta.category]}
        </span>
        <span className="text-xs text-slate-400">{meta.readTime}</span>
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-blue-700">
        {meta.title}
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
        {meta.description}
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
        Read guide
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
