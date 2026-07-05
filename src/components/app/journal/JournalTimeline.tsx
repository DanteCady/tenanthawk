"use client";

import { useState } from "react";
import {
  ChevronDown,
  CirclePlus,
  PencilLine,
  Trash2,
  UserRound,
} from "lucide-react";
import type { JournalEntryDTO } from "@/lib/journal/queries";
import { timeAgo } from "@/lib/time";

const CHANGE_STYLES: Record<
  JournalEntryDTO["changeType"],
  { label: string; badge: string; icon: typeof PencilLine }
> = {
  created: {
    label: "Created",
    badge: "bg-emerald-50 text-emerald-700",
    icon: CirclePlus,
  },
  modified: {
    label: "Modified",
    badge: "bg-amber-50 text-amber-700",
    icon: PencilLine,
  },
  deleted: {
    label: "Deleted",
    badge: "bg-red-50 text-red-700",
    icon: Trash2,
  },
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function JournalEntry({ entry }: { entry: JournalEntryDTO }) {
  const [open, setOpen] = useState(false);
  const style = CHANGE_STYLES[entry.changeType];
  const Icon = style.icon;
  const expandable = entry.changeType === "modified" && entry.diff.length > 0;

  return (
    <div className="surface-card px-4 py-3">
      <button
        type="button"
        onClick={() => expandable && setOpen((v) => !v)}
        className={`flex w-full items-center gap-3 text-left ${expandable ? "cursor-pointer" : "cursor-default"}`}
        aria-expanded={expandable ? open : undefined}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${style.badge}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate font-medium text-slate-900">
              {entry.displayName ?? entry.objectId}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
              {style.label}
            </span>
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
            <span>{entry.objectTypeLabel}</span>
            {entry.actor && (
              <span className="inline-flex items-center gap-1">
                <UserRound className="h-3 w-3" />
                {entry.actor}
              </span>
            )}
            <span>{timeAgo(entry.detectedAt)}</span>
          </span>
        </span>
        {expandable && (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {expandable && open && (
        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
          {entry.diff.map((d) => (
            <div
              key={d.path}
              className="grid grid-cols-1 gap-1 rounded-lg bg-slate-50 px-3 py-2 text-xs sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-3"
            >
              <code className="truncate font-medium text-slate-700">{d.path}</code>
              <span className="truncate text-red-600 line-through decoration-red-300">
                {formatValue(d.before)}
              </span>
              <span className="truncate font-medium text-emerald-700">
                {formatValue(d.after)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function JournalTimeline({ entries }: { entries: JournalEntryDTO[] }) {
  const groups: Array<{ key: string; label: string; items: JournalEntryDTO[] }> = [];
  for (const entry of entries) {
    const key = dayKey(entry.detectedAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(entry);
    } else {
      groups.push({ key, label: dayLabel(entry.detectedAt), items: [entry] });
    }
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {group.label}
          </h2>
          <div className="space-y-2">
            {group.items.map((entry) => (
              <JournalEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
