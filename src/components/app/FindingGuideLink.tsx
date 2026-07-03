import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getGuideLinkForCheck } from "@/lib/content/check-map";

export function FindingGuideLink({ checkId }: { checkId: string }) {
  const guide = getGuideLinkForCheck(checkId);
  if (!guide) return null;

  return (
    <Link
      href={`/learn/guides/${guide.slug}`}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
    >
      <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
      Learn more: {guide.label}
    </Link>
  );
}
