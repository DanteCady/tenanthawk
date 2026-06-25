"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    await authClient.subscription.cancel({
      returnUrl: `${window.location.origin}/dashboard/billing`,
    });
    setLoading(false);
  }

  return (
    <button
      onClick={openPortal}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      Manage billing
    </button>
  );
}
