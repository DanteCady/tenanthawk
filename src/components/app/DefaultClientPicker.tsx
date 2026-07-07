"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "@/store/toast";

type ClientOption = {
  id: string;
  label: string;
  mode: "live" | "demo";
};

export function DefaultClientPicker({
  clients,
  defaultConnectionId,
}: {
  clients: ClientOption[];
  defaultConnectionId: string | null;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(defaultConnectionId ?? "");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(defaultConnectionId ?? "");
  }, [defaultConnectionId]);

  async function selectDefault(connectionId: string) {
    if (connectionId === selectedId || loadingId) return;
    setLoadingId(connectionId);
    try {
      const res = await fetch("/api/settings/default-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Could not update default client.");
        return;
      }
      setSelectedId(connectionId);
      toast.success("Default client updated.");
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--th-border)] bg-[var(--th-muted-bg)] p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-[var(--th-text)]">
        <Star className="h-4 w-4 text-[var(--th-brand-text)]" />
        Default client
      </p>
      <p className="mt-1 text-xs text-[var(--th-text-muted)]">
        Opens first when you sign in or start a new browser session. Also switches your
        active client now.
        {!defaultConnectionId ? (
          <span className="mt-1 block">
            No default saved yet — the most recently scanned client opens until you choose
            one.
          </span>
        ) : null}
      </p>
      <div className="mt-3 space-y-2">
        {clients.map((client) => {
          const active = selectedId === client.id;
          const busy = loadingId === client.id;
          return (
            <label
              key={client.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                active
                  ? "border-[var(--th-brand-muted-border)] bg-[var(--th-brand-muted)]"
                  : "border-[var(--th-border)] bg-[var(--th-surface)] hover:border-[var(--th-brand-muted-border)]"
              }`}
            >
              <input
                type="radio"
                name="default-client"
                className="h-4 w-4 accent-[var(--th-brand)]"
                checked={active}
                disabled={Boolean(loadingId)}
                onChange={() => selectDefault(client.id)}
              />
              <span className="min-w-0 flex-1 text-sm font-medium text-[var(--th-text)]">
                {client.label}
              </span>
              <span
                className={
                  client.mode === "live"
                    ? "rounded-full border border-[var(--th-brand-muted-border)] bg-[var(--th-brand-muted)] px-2 py-0.5 text-[0.65rem] font-medium text-[var(--th-brand-text)]"
                    : "badge-free text-[0.65rem]"
                }
              >
                {client.mode === "live" ? "Live" : "Demo"}
              </span>
              {busy ? <Loader2 className="h-4 w-4 animate-spin text-[var(--th-text-faint)]" /> : null}
            </label>
          );
        })}
      </div>
    </div>
  );
}
