"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type EnterpriseLoginFormProps = {
  organizationSlug: string;
  organizationName: string;
};

export function EnterpriseLoginForm({
  organizationSlug,
  organizationName,
}: EnterpriseLoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signInWithSso() {
    setError("");
    setLoading(true);
    const result = await authClient.signIn.sso({
      organizationSlug,
      callbackURL: "/dashboard",
    });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "SSO sign-in failed. Check your IdP configuration.");
      return;
    }
    if (result.data?.url) {
      window.location.href = result.data.url;
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Signing in to <span className="font-semibold">{organizationName}</span>
      </div>

      <button
        type="button"
        onClick={signInWithSso}
        disabled={loading}
        className="group btn-primary w-full shadow-none hover:shadow-md disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Redirecting…
          </>
        ) : (
          <>
            Continue with SSO
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-center text-xs text-slate-500">
        Workspace owners can also use email sign-in on{" "}
        <a href="https://tenanthawk.io/login" className="text-blue-600 hover:underline">
          tenanthawk.io
        </a>
        .
      </p>
    </div>
  );
}
