"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { validateEnterpriseSlug, slugBaseFromName } from "@/lib/enterprise/slug";
import { clearAccountIntent } from "@/lib/onboarding/account-type";
import { authClient } from "@/lib/auth-client";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25";

export function WorkspaceOnboardingStep({
  defaultName,
  rootDomain,
}: {
  defaultName: string;
  rootDomain: string;
}) {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState(defaultName);
  const [workspaceSlug, setWorkspaceSlug] = useState(() => slugBaseFromName(defaultName));
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onNameChange(name: string) {
    setWorkspaceName(name);
    if (!slugTouched) {
      setWorkspaceSlug(slugBaseFromName(name));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validated = validateEnterpriseSlug(workspaceSlug);
    if (!validated.ok) {
      setError(validated.error);
      return;
    }

    const check = await authClient.organization.checkSlug({ slug: validated.slug });
    if (check.error || !check.data?.status) {
      setError("This slug is already taken.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/onboarding/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: workspaceName.trim() || defaultName,
        slug: validated.slug,
      }),
    });
    setLoading(false);

    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not create workspace.");
      return;
    }

    clearAccountIntent();
    router.push("/onboarding");
    router.refresh();
  }

  const loginPreview = `https://${workspaceSlug || "your-msp"}.${rootDomain}/login`;

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Set up your MSP workspace
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose a branded URL for your team. Client tenants come next.
        </p>
      </div>

      <form onSubmit={onSubmit} className="surface-card space-y-4 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Workspace name
          </label>
          <input
            type="text"
            required
            value={workspaceName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Acme MSP"
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
              required
              value={workspaceSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setWorkspaceSlug(e.target.value.toLowerCase());
              }}
              className={inputClass}
            />
            <span className="shrink-0 text-sm text-slate-500">.{rootDomain}</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Reserved names like admin, support, and portal cannot be used.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Your team will sign in at
          </p>
          <p className="mt-1 truncate font-mono text-sm text-slate-800">{loginPreview}</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="group btn-primary w-full shadow-none hover:shadow-md disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating workspace…
            </>
          ) : (
            <>
              Continue to client setup
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
