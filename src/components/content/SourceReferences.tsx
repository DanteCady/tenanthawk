import type { SourceReference } from "@/lib/content/types";

export function SourceReferences({ sources }: { sources: SourceReference[] }) {
  const validSources = sources.filter((source) => source.title && source.url);
  if (validSources.length === 0) return null;

  return (
    <section className="mt-14 border-t border-mk-line pt-10">
      <h2 className="mk-eyebrow">
        Source references
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-mk-soft">
        Manual steps in this guide are based on current Microsoft Learn documentation.
      </p>
      <ul className="mt-5 space-y-3">
        {validSources.map((source) => (
          <li key={source.url} className="text-sm">
            <a
              href={source.url}
              rel="noreferrer"
              className="font-medium text-mk-amber-deep hover:underline"
            >
              {source.title}
            </a>
            {source.publisher && (
              <span className="ml-2 text-mk-muted">{source.publisher}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
