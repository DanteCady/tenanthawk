import {
  FOUNDING_PROMO_CODE,
  FOUNDING_PROMO_HEADLINE,
  foundingPromoSummary,
} from "@/lib/billing/founding";

export function FoundingPromoCallout({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3"
          : "rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-yellow-50 px-5 py-4"
      }
    >
      <p className="text-sm font-semibold text-amber-950">{FOUNDING_PROMO_HEADLINE}</p>
      <p className="mt-1 text-sm text-amber-900/90">{foundingPromoSummary()}</p>
      <p className="mt-2 text-sm text-amber-900/80">
        Use code{" "}
        <code className="rounded-md bg-white/80 px-1.5 py-0.5 font-mono text-xs font-semibold text-amber-950 ring-1 ring-amber-200">
          {FOUNDING_PROMO_CODE}
        </code>{" "}
        when you upgrade.
      </p>
    </div>
  );
}
