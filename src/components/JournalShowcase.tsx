import { CirclePlus, PencilLine, ShieldAlert, UserRound } from "lucide-react";

/**
 * Marketing mock of the Journal timeline - dark card mirroring the real
 * dashboard UI. Pure markup, safe for server rendering on light pages.
 */

const rows = [
  {
    icon: PencilLine,
    badge: "Modified",
    badgeClass: "bg-amber-500/15 text-amber-400",
    title: "Require MFA for admins",
    type: "Conditional Access policy",
    actor: "alex.rivera@contoso.com",
    when: "Tue 2:14 PM",
    diff: { path: "state", before: "enabled", after: "disabled" },
    alarm: true,
  },
  {
    icon: PencilLine,
    badge: "Modified",
    badgeClass: "bg-amber-500/15 text-amber-400",
    title: "HQ Office",
    type: "Named location",
    actor: "sam.chen@contoso.com",
    when: "Wed 9:41 AM",
    diff: {
      path: "ipRanges",
      before: '["198.51.100.0/24"]',
      after: '["198.51.100.0/24", "203.0.113.0/24"]',
    },
  },
  {
    icon: CirclePlus,
    badge: "Created",
    badgeClass: "bg-emerald-500/15 text-emerald-400",
    title: "Require MFA for guests",
    type: "Conditional Access policy · report-only",
    actor: "sam.chen@contoso.com",
    when: "Wed 4:03 PM",
  },
  {
    icon: PencilLine,
    badge: "Modified",
    badgeClass: "bg-amber-500/15 text-amber-400",
    title: "Windows baseline compliance",
    type: "Intune compliance policy",
    actor: "priya.patel@contoso.com",
    when: "Thu 11:26 AM",
    diff: { path: "passwordMinimumLength", before: "8", after: "6" },
  },
];

export function JournalShowcase() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-900/40">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
        <p className="text-sm font-semibold text-slate-200">Journal</p>
        <p className="text-xs text-slate-500">contoso.com · this week</p>
      </div>
      <div className="divide-y divide-slate-800/70">
        {rows.map((row) => (
          <div key={`${row.title}-${row.when}`} className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${row.badgeClass}`}
              >
                <row.icon className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="truncate text-sm font-medium text-slate-100">
                    {row.title}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${row.badgeClass}`}
                  >
                    {row.badge}
                  </span>
                  {row.alarm && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                      <ShieldAlert className="h-3 w-3" />
                      High impact
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                  <span>{row.type}</span>
                  <span className="inline-flex items-center gap-1">
                    <UserRound className="h-3 w-3" />
                    {row.actor}
                  </span>
                  <span>{row.when}</span>
                </div>
              </div>
            </div>
            {row.diff && (
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-slate-900 px-3 py-2 font-mono text-[11px]">
                <span className="text-slate-400">{row.diff.path}</span>
                <span className="text-red-400/90 line-through decoration-red-500/50">
                  {row.diff.before}
                </span>
                <span className="text-slate-600">→</span>
                <span className="font-semibold text-emerald-400">{row.diff.after}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
