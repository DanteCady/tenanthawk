import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  GUIDE_CATEGORY_CHIP,
  GUIDE_CATEGORY_LABEL,
  type Guide,
} from "@/lib/guides/content";

export function GuideCard({ guide }: { guide: Guide }) {
  const chip = GUIDE_CATEGORY_CHIP[guide.category];

  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60"
    >
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip.chip} ${chip.text}`}
        >
          {GUIDE_CATEGORY_LABEL[guide.category]}
        </span>
        <span className="text-xs text-slate-400">{guide.readTime}</span>
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-blue-700">
        {guide.title}
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
        {guide.description}
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
        Read guide
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
