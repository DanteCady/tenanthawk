"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Unplug } from "lucide-react";

export function DisconnectTenantButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function disconnect() {
    if (
      !window.confirm(
        "Disconnect this tenant? Scan history and findings will be removed. You can connect again anytime.",
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/connection/disconnect", { method: "POST" });
    if (!res.ok) {
      setError("Could not disconnect. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={disconnect}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Unplug className="h-4 w-4" />
        )}
        Disconnect tenant
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
