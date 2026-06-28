"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Unplug } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { toast } from "@/store/toast";

export function DisconnectTenantButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function disconnect() {
    setLoading(true);

    const res = await fetch("/api/connection/disconnect", { method: "POST" });
    if (!res.ok) {
      toast.error("Could not disconnect. Please try again.");
      setLoading(false);
      return;
    }

    setOpen(false);
    toast.success(
      "Tenant disconnected. Scan history was removed from Tenant Hawk. You can connect again anytime.",
    );
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
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

      <ConfirmModal
        open={open}
        title="Disconnect this tenant?"
        description="This removes the connection from Tenant Hawk and deletes all scan history, findings, and remediation status for this tenant. It does not remove the Tenant Hawk app from your Microsoft Entra tenant — you can do that separately in the Azure portal if needed. You can connect again anytime."
        confirmLabel="Disconnect tenant"
        cancelLabel="Keep connected"
        destructive
        loading={loading}
        onConfirm={disconnect}
        onClose={() => !loading && setOpen(false)}
      />
    </>
  );
}
