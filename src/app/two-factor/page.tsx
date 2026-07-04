import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { TwoFactorVerifyForm } from "@/components/auth/TwoFactorVerifyForm";

export default function TwoFactorPage() {
  return (
    <AuthShell
      title="Two-factor authentication"
      subtitle="Complete sign-in with your authenticator app."
    >
      <Suspense fallback={null}>
        <TwoFactorVerifyForm />
      </Suspense>
    </AuthShell>
  );
}
