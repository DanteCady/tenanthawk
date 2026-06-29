"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { buildEnterpriseSubdomainUrl } from "@/lib/enterprise/config";
import { validateEnterpriseSlug } from "@/lib/enterprise/slug";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25";

export function EnterpriseWorkspaceSettings({
  organizationId,
  name,
  slug,
}: {
  organizationId: string;
  name: string;
  slug: string;
}) {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState(name);
  const [workspaceSlug, setWorkspaceSlug] = useState(slug);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loginUrl = buildEnterpriseSubdomainUrl(workspaceSlug, "/login");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const validated = validateEnterpriseSlug(workspaceSlug);
    if (!validated.ok) {
      setError(validated.error);
      return;
    }

    if (validated.slug !== slug) {
      const check = await authClient.organization.checkSlug({ slug: validated.slug });
      if (check.error || !check.data?.status) {
        setError("This slug is already taken.");
        return;
      }
    }

    setSaving(true);
    const result = await authClient.organization.update({
      organizationId,
      data: {
        name: workspaceName.trim() || name,
        slug: validated.slug,
      },
    });
    setSaving(false);

    if (result.error) {
      setError(result.error.message ?? "Could not update workspace.");
      return;
    }

    setWorkspaceSlug(validated.slug);
    setMessage("Workspace updated.");
    router.refresh();
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(loginUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Workspace name
        </label>
        <input
          type="text"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Subdomain slug
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={workspaceSlug}
            onChange={(e) => setWorkspaceSlug(e.target.value.toLowerCase())}
            className={inputClass}
          />
          <span className="shrink-0 text-sm text-slate-500">.tenanthawk.io</span>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Branded login URL
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <code className="truncate text-sm text-slate-800">{loginUrl}</code>
          <button
            type="button"
            onClick={copyUrl}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save workspace
      </button>
    </form>
  );
}
