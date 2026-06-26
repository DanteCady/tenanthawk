"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-red-400 focus:ring-2 focus:ring-red-500/20";

export function DeleteAccountButton({ isPro }: { isPro: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    password.length >= 8 && confirmText === "DELETE" && !loading;

  async function deleteAccount() {
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const { error: deleteError } = await authClient.deleteUser({
      password,
      callbackURL: "/",
    });

    if (deleteError) {
      setError(
        deleteError.message ??
          "Could not delete your account. Check your password and try again.",
      );
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-100"
      >
        <Trash2 className="h-4 w-4" />
        Delete account
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
      <p className="text-sm font-medium text-red-900">Delete your account</p>
      <p className="mt-1 text-sm text-red-800/90">
        This permanently removes your account, tenant connections, scan history,
        findings, and alert settings. This cannot be undone.
        {isPro && " Your Pro subscription will be cancelled."}
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="delete-password" className="block text-xs font-medium text-slate-700">
            Confirm with your password
          </label>
          <input
            id="delete-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className={`${inputClass} mt-1.5`}
            placeholder="Your account password"
          />
        </div>

        <div>
          <label htmlFor="delete-confirm" className="block text-xs font-medium text-slate-700">
            Type <span className="font-mono font-semibold">DELETE</span> to confirm
          </label>
          <input
            id="delete-confirm"
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              setError("");
            }}
            className={`${inputClass} mt-1.5`}
            placeholder="DELETE"
            autoComplete="off"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={deleteAccount}
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Permanently delete account
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setPassword("");
            setConfirmText("");
            setError("");
          }}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
