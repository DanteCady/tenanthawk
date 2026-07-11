import Link from "next/link";
import { ScanLine } from "lucide-react";

export function ScanCheckCallout({ checkIds }: { checkIds: string[] }) {
  if (checkIds.length === 0) return null;

  return (
    <aside className="rounded-xl border border-mk-line bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-mk-muted">
        <ScanLine className="h-3.5 w-3.5" />
        Tenant Hawk checks
      </div>
      <p className="mt-2 text-sm text-mk-soft">
        A free scan surfaces these automatically across your tenant:
      </p>
      <ul className="mt-3 space-y-1.5 font-mono text-xs text-mk-ink2">
        {checkIds.map((id) => (
          <li key={id} className="rounded bg-mk-panel px-2 py-1">
            {id}
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className="mt-4 inline-flex text-sm font-semibold text-mk-amber-deep hover:underline"
      >
        Run a free scan →
      </Link>
    </aside>
  );
}
