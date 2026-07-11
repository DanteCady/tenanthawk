import type { ContentHeading } from "@/lib/content/types";

export function TableOfContents({ headings }: { headings: ContentHeading[] }) {
  if (headings.length < 3) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-xl border border-mk-line bg-mk-panel px-5 py-4"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-mk-muted">
        On this page
      </p>
      <ol className="mt-3 space-y-2 text-sm">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className="text-mk-amber-deep hover:text-mk-amber hover:underline"
            >
              {h.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
