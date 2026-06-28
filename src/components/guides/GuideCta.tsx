import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

export function GuideCta() {
  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
        Try it on your tenant
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        Run a free health scan in under 5 minutes
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
        Tenant Hawk connects read-only to Microsoft 365 and Entra, scores your
        tenant across security, cost, reliability, and hygiene, then gives you a
        prioritized fix-it list.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href="/signup"
          className="group btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm"
        >
          Start free scan
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/#how"
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
        >
          See how it works
        </Link>
      </div>
      <p className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
        <Lock className="h-3.5 w-3.5 text-green-600" />
        Read-only access · no credentials stored · no credit card
      </p>
    </div>
  );
}
