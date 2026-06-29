"use client";

import { useState } from "react";
import { Loader2, UserCog } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { buildApexAppUrl } from "@/lib/platform/urls";

type Row = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  plan: string;
  banned: boolean;
};

export function PlatformAdminUsers({ users }: { users: Row[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function impersonate(userId: string) {
    setError(null);
    setLoadingId(userId);
    const result = await authClient.admin.impersonateUser({ userId });
    setLoadingId(null);
    if (result.error) {
      setError(result.error.message ?? "Impersonation failed.");
      return;
    }
    window.location.href = buildApexAppUrl("/dashboard");
  }

  return (
    <section className="surface-card overflow-hidden">
      <div className="border-b border-[var(--th-border)] px-5 py-4">
        <h2 className="text-lg font-semibold text-[var(--th-text)]">Users</h2>
        <p className="mt-0.5 text-sm text-[var(--th-text-muted)]">
          Impersonate opens the customer app as that user (apex URL).
        </p>
      </div>

      {error && (
        <p className="border-b border-[var(--th-border)] bg-red-500/10 px-5 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--th-border)] bg-[var(--th-muted-bg)] text-xs uppercase tracking-wide text-[var(--th-text-faint)]">
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[var(--th-border-subtle)] last:border-0"
              >
                <td className="px-5 py-3">
                  <p className="font-medium text-[var(--th-text)]">{user.name}</p>
                  <p className="text-xs text-[var(--th-text-muted)]">{user.email}</p>
                  {user.banned && (
                    <span className="mt-1 inline-block rounded-full bg-red-500/15 px-2 py-0.5 text-[0.65rem] font-semibold text-red-400">
                      Banned
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 capitalize text-[var(--th-text-muted)]">
                  {user.plan === "msp" ? "enterprise" : user.plan}
                </td>
                <td className="px-5 py-3 text-[var(--th-text-faint)]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => impersonate(user.id)}
                    disabled={loadingId === user.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--th-border)] bg-[var(--th-muted-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--th-text-muted)] transition-colors hover:border-[var(--th-brand-muted-border)] hover:text-[var(--th-brand-text)] disabled:opacity-60"
                  >
                    {loadingId === user.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserCog className="h-3.5 w-3.5" />
                    )}
                    Impersonate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
