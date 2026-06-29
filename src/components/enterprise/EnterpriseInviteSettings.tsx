"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25";

export function EnterpriseInviteSettings({
  organizationId,
}: {
  organizationId: string;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSending(true);

    const result = await authClient.organization.inviteMember({
      email: email.trim(),
      role,
      organizationId,
    });

    setSending(false);

    if (result.error) {
      setError(result.error.message ?? "Could not send invitation.");
      return;
    }

    setMessage(`Invitation sent to ${email.trim()}.`);
    setEmail("");
  }

  return (
    <form onSubmit={invite} className="space-y-4">
      <p className="text-sm text-slate-600">
        Invite technicians to your Enterprise workspace. They sign in with SSO on your
        subdomain and inherit access to your client portfolio.
      </p>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tech@yourmsp.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "member" | "admin")}
            className={inputClass}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
      >
        {sending && <Loader2 className="h-4 w-4 animate-spin" />}
        Send invitation
      </button>
    </form>
  );
}
