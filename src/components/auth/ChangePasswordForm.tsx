"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { authInputClass } from "@/components/auth/auth-styles";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setError("");
    setSuccess(false);
    setLoading(true);

    const { error: changeError } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions,
    });

    setLoading(false);

    if (changeError) {
      setError(changeError.message ?? "Could not update password.");
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="text-sm text-slate-600">
        Update the password you use to sign in with email.{" "}
        <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700">
          Forgot your current password?
        </Link>
      </p>

      <div>
        <label htmlFor="current-password" className="mb-1.5 block text-sm text-slate-600">
          Current password
        </label>
        <input
          id="current-password"
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={authInputClass}
        />
      </div>

      <div>
        <label htmlFor="new-password" className="mb-1.5 block text-sm text-slate-600">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          className={authInputClass}
        />
      </div>

      <div>
        <label htmlFor="confirm-new-password" className="mb-1.5 block text-sm text-slate-600">
          Confirm new password
        </label>
        <input
          id="confirm-new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={authInputClass}
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={revokeOtherSessions}
          onChange={(e) => setRevokeOtherSessions(e.target.checked)}
          className="mt-0.5 rounded border-slate-300"
        />
        Sign out other devices after changing password
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-green-700">Password updated successfully.</p>
      )}

      <button
        type="submit"
        disabled={loading || !currentPassword || newPassword.length < 8}
        className="btn-primary w-full disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Updating…
          </>
        ) : (
          "Change password"
        )}
      </button>
    </form>
  );
}
