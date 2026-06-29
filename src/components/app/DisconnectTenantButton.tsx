"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Unplug } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { toast } from "@/store/toast";

export function DisconnectTenantButton({
  connectionId,
  label,
  compact = false,
}: {
  connectionId: string;
  label: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function disconnect() {
    setLoading(true);

    const res = await fetch("/api/connection/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId }),
    });
    if (!res.ok) {
      toast.error("Could not disconnect. Please try again.");
      setLoading(false);
      return;
    }

    setOpen(false);
    toast.success(`${label} disconnected. Scan history for this client was removed.`);
    router.push("/dashboard/clients");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className={
          compact
            ? "btn-destructive-outline px-2.5 py-1.5 text-xs"
            : "btn-destructive-outline px-3.5 py-2 text-sm"
        }
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Unplug className="h-4 w-4" />
        )}
        Disconnect
      </button>

      <ConfirmModal
        open={open}
        title={`Disconnect ${label}?`}
        description="This removes the connection from Tenant Hawk and deletes all scan history, findings, and remediation status for this client. It does not remove the Tenant Hawk app from their Microsoft Entra tenant. You can connect again anytime."
        confirmLabel="Disconnect client"
        cancelLabel="Keep connected"
        destructive
        loading={loading}
        onConfirm={disconnect}
        onClose={() => !loading && setOpen(false)}
      />
    </>
  );
}
