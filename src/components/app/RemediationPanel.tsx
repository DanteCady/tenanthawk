"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Sparkles, Wrench } from "lucide-react";
import type { RemediationEnriched } from "@/lib/remediation/types";

export function RemediationPanel({
  findingId,
  templateRemediation,
  initialEnriched,
}: {
  findingId: string;
  templateRemediation: string;
  initialEnriched?: RemediationEnriched | null;
}) {
  const [enriched, setEnriched] = useState<RemediationEnriched | null>(
    initialEnriched ?? null,
  );
  const [loading, setLoading] = useState(!initialEnriched);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEnriched) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/findings/${findingId}/remediation`, {
          method: "POST",
        });
        const data = (await res.json()) as {
          enriched?: RemediationEnriched;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Could not generate remediation.");
          setEnriched(null);
          return;
        }
        setEnriched(data.enriched ?? null);
      } catch {
        if (!cancelled) setError("Could not reach the server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [findingId, initialEnriched]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-sm text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        Generating AI-guided fix steps…
      </div>
    );
  }

  if (error || !enriched) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <div>
          {error && <p className="mb-1 text-xs text-amber-700">{error}</p>}
          <p className="text-sm text-slate-800">{templateRemediation}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/40 to-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
        <Sparkles className="h-3.5 w-3.5" />
        AI-guided remediation
      </div>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-800">
        {enriched.steps.map((step) => (
          <li key={step} className="leading-relaxed">
            {step}
          </li>
        ))}
      </ol>
      {enriched.links.length > 0 && (
        <div className="border-t border-blue-100/80 pt-3">
          <p className="text-xs font-medium text-slate-500">Microsoft documentation</p>
          <ul className="mt-2 space-y-1.5">
            {enriched.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-800 hover:underline"
                >
                  {link.title}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
