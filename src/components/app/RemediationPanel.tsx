"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Sparkles, Wrench } from "lucide-react";
import type { RemediationEnriched } from "@/lib/remediation/types";
import { isAiRemediation } from "@/lib/remediation/display";
import { RemediationQuickActions } from "./RemediationQuickActions";
import { RemediationPlanPanel } from "./RemediationPlanPanel";

function TemplateRemediation({ text, error }: { text: string; error?: string | null }) {
  return (
    <div className="remediation-template flex items-start gap-2">
      <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-[var(--th-brand-text)]" />
      <div>
        {error && <p className="mb-1 text-xs text-amber-400">{error}</p>}
        <p className="text-sm text-[var(--th-text)]">{text}</p>
      </div>
    </div>
  );
}

export function RemediationPanel({
  findingId,
  checkId,
  templateRemediation,
  initialEnriched,
  onEnriched,
  isPro = true,
  connectionMode = "live",
}: {
  findingId: string;
  checkId?: string;
  templateRemediation: string;
  initialEnriched?: RemediationEnriched | null;
  onEnriched?: (enriched: RemediationEnriched) => void;
  isPro?: boolean;
  connectionMode?: "live" | "demo";
}) {
  const [mounted, setMounted] = useState(false);
  const [enriched, setEnriched] = useState<RemediationEnriched | null>(
    initialEnriched ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setEnriched(initialEnriched ?? null);
  }, [initialEnriched, findingId]);

  useEffect(() => {
    if (!mounted || initialEnriched) return;

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
        if (data.enriched) {
          setEnriched(data.enriched);
          onEnriched?.(data.enriched);
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once per finding when no cache
  }, [findingId, initialEnriched, mounted]);

  const planSection =
    checkId != null ? (
      <RemediationPlanPanel
        findingId={findingId}
        checkId={checkId}
        isPro={isPro}
        connectionMode={connectionMode}
      />
    ) : null;

  if (!mounted) {
    return (
      <div className="space-y-3">
        {checkId ? <RemediationQuickActions checkId={checkId} /> : null}
        {planSection}
        <TemplateRemediation text={templateRemediation} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {checkId ? <RemediationQuickActions checkId={checkId} /> : null}
        {planSection}
        <div className="remediation-loading">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--th-brand-text)]" />
          Generating AI-guided fix steps…
        </div>
      </div>
    );
  }

  if (error || !enriched) {
    return (
      <div className="space-y-3">
        {checkId ? <RemediationQuickActions checkId={checkId} /> : null}
        {planSection}
        <TemplateRemediation text={templateRemediation} error={error} />
      </div>
    );
  }

  if (!isAiRemediation(enriched.model)) {
    return (
      <div className="space-y-3">
        {checkId ? <RemediationQuickActions checkId={checkId} /> : null}
        {planSection}
        <TemplateRemediation text={enriched.steps[0] ?? templateRemediation} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {checkId ? <RemediationQuickActions checkId={checkId} /> : null}
      {planSection}
      <div className="remediation-ai space-y-3">
      <div className="remediation-ai-label flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5" />
        AI-guided remediation
      </div>
      <ol className="remediation-ai-steps list-decimal space-y-2 pl-5">
        {enriched.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      {enriched.links.length > 0 && (
        <div className="remediation-ai-divider">
          <p className="text-xs font-medium text-[var(--th-text-faint)]">
            Microsoft documentation
          </p>
          <ul className="mt-2 space-y-1.5">
            {enriched.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="remediation-doc-link"
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
    </div>
  );
}
