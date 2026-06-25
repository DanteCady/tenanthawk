"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function UpgradeButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function upgrade() {
    setLoading(true);
    setError("");
    const { error } = await authClient.subscription.upgrade({
      plan: "pro",
      successUrl: `${window.location.origin}/dashboard?upgraded=1`,
      cancelUrl: window.location.href,
    });
    if (error) {
      setError(error.message ?? "Billing isn't configured yet.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={upgrade} disabled={loading} className={className}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Redirecting…
          </span>
        ) : (
          children
        )}
      </button>
      {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
